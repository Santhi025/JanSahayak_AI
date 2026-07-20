import { NextResponse } from 'next/server';
import { MySchemeService } from '@/backend/services/myscheme/mySchemeService';
import { checkEligibility } from '@/backend/services/myscheme/eligibilityMatcher';

/** 
 * Translates an array of strings to the target language in a single Google Translate batch call.
 * Uses ' ___ ' as a delimiter to pack many strings into one request.
 * Returns a map of original → translated.
 */
async function batchTranslate(texts: string[], lang: string): Promise<Record<string, string>> {
  if (lang === 'en-IN' || texts.length === 0) return {};
  
  const langCode = lang.split('-')[0];
  // Minority langs not well-supported by Google Translate → fall back to Hindi
  const tl = ['brx', 'ks', 'mni', 'sat', 'doi', 'mai', 'kok'].includes(langCode) ? 'hi' : langCode;
  
  // De-duplicate so we don't waste quota on repeated strings
  const unique = [...new Set(texts.filter(t => t && t.trim()))];
  if (unique.length === 0) return {};

  const delimiter = ' ||| ';
  const map: Record<string, string> = {};

  // Google Translate URL has a character limit (~4000 chars per request)
  // Split into chunks to be safe
  const CHUNK_CHARS = 3500;
  let chunk: string[] = [];
  let chunkLen = 0;

  const translateChunk = async (items: string[]) => {
    const joined = items.join(delimiter);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(joined)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Translate HTTP ${res.status}`);
    const data = await res.json();
    const translated: string = data?.[0]?.map((x: any) => x[0]).join('') || '';
    const parts = translated.split(/\s*\|\|\|\s*/);
    items.forEach((orig, i) => {
      map[orig] = parts[i]?.trim() || orig;
    });
  };

  try {
    for (const text of unique) {
      if (chunkLen + text.length > CHUNK_CHARS && chunk.length > 0) {
        await translateChunk(chunk);
        chunk = [];
        chunkLen = 0;
      }
      chunk.push(text);
      chunkLen += text.length + delimiter.length;
    }
    if (chunk.length > 0) await translateChunk(chunk);
  } catch (e) {
    console.warn('[match-schemes] Translation failed, returning English:', e);
  }

  return map;
}

export async function POST(req: Request) {
  let lang = 'en-IN';
  try {
    const body = await req.json();
    lang = body.lang || 'en-IN';
    const profile = body.profile;

    if (!profile) {
      return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
    }

    // Fetch schemes from the MyScheme service (re-routing live or local fallback)
    const schemes = await MySchemeService.getSchemes();
    const matches: any[] = [];

    for (const scheme of schemes) {
      const eligibilityResult = checkEligibility(scheme, profile);
      if (eligibilityResult.isEligible) {
        let finalReason = 'You meet the general eligibility criteria.';
        if (eligibilityResult.reasons.length > 0) {
          finalReason = `You qualify because this scheme ${eligibilityResult.reasons.join(' and ')}.`;
        }

        matches.push({
          ...scheme,
          matchDetails: {
            eligibility: 'Eligible',
            reason: finalReason,
          },
        });
      }
    }

    // ── Translate ALL user-visible text fields if language is not English ──
    if (lang !== 'en-IN' && matches.length > 0) {
      // Collect every unique translatable string from all matched schemes
      const toTranslate: string[] = [];

      for (const m of matches) {
        if (m.description) toTranslate.push(m.description);
        if (m.benefits) toTranslate.push(m.benefits);
        if (m.matchDetails.reason) toTranslate.push(m.matchDetails.reason);
        if (m.offline_process) toTranslate.push(m.offline_process);
        if (m.nearest_office) toTranslate.push(m.nearest_office);
        if (Array.isArray(m.required_documents)) {
          m.required_documents.forEach((d: string) => { if (d) toTranslate.push(d); });
        }
      }

      const tMap = await batchTranslate(toTranslate, lang);

      // Apply translations back to each match
      if (Object.keys(tMap).length > 0) {
        for (const m of matches) {
          if (tMap[m.description]) m.description = tMap[m.description];
          if (tMap[m.benefits]) m.benefits = tMap[m.benefits];
          if (tMap[m.matchDetails.reason]) m.matchDetails.reason = tMap[m.matchDetails.reason];
          if (m.offline_process && tMap[m.offline_process]) m.offline_process = tMap[m.offline_process];
          if (m.nearest_office && tMap[m.nearest_office]) m.nearest_office = tMap[m.nearest_office];
          if (Array.isArray(m.required_documents)) {
            m.required_documents = m.required_documents.map((d: string) => tMap[d] || d);
          }
        }
      }
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Error in match-schemes API:', error);
    return NextResponse.json({ error: 'Failed to process matching engine' }, { status: 500 });
  }
}
