/**
 * update-scheme-links.ts
 * 
 * Uses Gemini to find official government portal URLs for schemes missing application_link,
 * then updates them in the Supabase database via Prisma.
 * 
 * Processes in batches of 20 to avoid rate limits.
 * Skips schemes that already have links.
 */

import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const BATCH_SIZE = 20;
const DELAY_MS = 2000; // 2s between batches to respect rate limits

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Ask Gemini for official government portal URLs for a batch of scheme names.
 * Returns a map of scheme name -> URL (or null if no official URL exists).
 */
async function getLinksFromGemini(schemes: { id: string; name: string }[]): Promise<Record<string, string | null>> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const schemeList = schemes.map((s, i) => `${i + 1}. ${s.name}`).join('\n');

  const prompt = `You are an expert on Indian government welfare schemes. For each scheme below, provide the OFFICIAL government portal URL where citizens can apply or find more information.

Rules:
- Only provide URLs from official .gov.in, .nic.in, .gov.in, or verified government domains
- If no official URL is known or the scheme only has an offline process, return null for that scheme
- Return ONLY a valid JSON object mapping scheme name to URL string or null
- Do not include any markdown, backticks, or explanation

Schemes:
${schemeList}

Return format example:
{
  "PM Fasal Bima Yojana": "https://pmfby.gov.in/",
  "Some Offline Scheme": null
}`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Strip markdown code blocks if present
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(text);
    return parsed;
  } catch (e) {
    console.error('  [ERROR] Failed to parse Gemini response:', e);
    return {};
  }
}

async function main() {
  console.log('🔍 Fetching schemes without application links...');

  const schemes = await prisma.scheme.findMany({
    where: {
      OR: [
        { application_link: null },
        { application_link: '' }
      ]
    },
    select: { id: true, name: true }
  });

  console.log(`📋 Found ${schemes.length} schemes without links. Processing in batches of ${BATCH_SIZE}...\n`);

  let updated = 0;
  let skipped = 0;
  let totalBatches = Math.ceil(schemes.length / BATCH_SIZE);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const batch = schemes.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);
    console.log(`\n⏳ Batch ${batchIndex + 1}/${totalBatches} (${batch.length} schemes)...`);

    const linkMap = await getLinksFromGemini(batch);

    // Update each scheme in the batch
    for (const scheme of batch) {
      const link = linkMap[scheme.name];

      if (link && typeof link === 'string' && link.startsWith('http')) {
        try {
          await prisma.scheme.update({
            where: { id: scheme.id },
            data: { application_link: link }
          });
          console.log(`  ✅ ${scheme.name}\n     -> ${link}`);
          updated++;
        } catch (e) {
          console.error(`  ❌ Failed to update ${scheme.name}:`, e);
        }
      } else {
        // No official URL — set a meaningful Google search fallback
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(scheme.name + ' official government portal apply online')}`;
        // We don't update the DB for search fallbacks — the frontend handles this
        skipped++;
      }
    }

    // Respect rate limits between batches
    if (batchIndex < totalBatches - 1) {
      console.log(`  ⏱  Waiting ${DELAY_MS}ms before next batch...`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Updated with official links: ${updated}`);
  console.log(`   No official link found (frontend will use Google search): ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
