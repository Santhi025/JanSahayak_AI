import { prisma } from '@/lib/prisma';
import { CacheManager } from './cacheManager';
import { NormalizedScheme, parseMySchemeData } from './schemeParser';

export class MySchemeService {
  private static apiUrl = process.env.MYSCHEME_API_URL || '';
  private static apiKey = process.env.MYSCHEME_API_KEY || '';

  /**
   * Fetches all raw schemes from either the live MyScheme endpoint (if configured)
   * or the local database fallback. Implements robust caching.
   */
  static async getSchemes(): Promise<NormalizedScheme[]> {
    const cacheKey = 'all_normalized_schemes';
    const cached = CacheManager.get<NormalizedScheme[]>(cacheKey);
    if (cached) {
      return cached;
    }

    let schemes: NormalizedScheme[] = [];

    // Attempt live fetch if MyScheme API details are configured in .env
    if (this.apiUrl && this.apiKey) {
      try {
        console.log('[MySchemeService] Attempting to fetch live schemes from MyScheme API...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const res = await fetch(`${this.apiUrl}/schemes`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.schemes)) {
            schemes = data.schemes.map(parseMySchemeData);
            console.log(`[MySchemeService] Successfully fetched ${schemes.length} live schemes.`);
            CacheManager.set(cacheKey, schemes, 30 * 60 * 1000); // Cache for 30 minutes
            return schemes;
          }
        } else {
          console.warn(`[MySchemeService] Live API returned status ${res.status}. Falling back to local data.`);
        }
      } catch (err) {
        console.error('[MySchemeService] Failed to connect to MyScheme API. Falling back to local data.', err);
      }
    }

    // Fallback: Fetch from the local PostgreSQL / Prisma database
    try {
      console.log('[MySchemeService] Loading schemes from local Prisma database fallback...');
      const dbSchemes = await prisma.scheme.findMany();
      schemes = dbSchemes.map((s: any) => parseMySchemeData({
        ...s,
        applicable_states: s.applicable_states,
        required_documents: s.required_documents,
        tags: s.tags,
        target_occupations: s.target_occupations,
      }));
      console.log(`[MySchemeService] Loaded ${schemes.length} schemes from local database fallback.`);
      CacheManager.set(cacheKey, schemes, 60 * 60 * 1000); // Cache database results for 1 hour
    } catch (dbErr) {
      console.error('[MySchemeService] Database fallback query failed!', dbErr);
    }

    return schemes;
  }
}
