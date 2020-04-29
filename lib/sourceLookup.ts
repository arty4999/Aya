import Redis from "ioredis";
import sagiri, { SagiriResult } from "sagiri";

// only output 5 best results.
const client = sagiri(process.env.SAUCENAO_API_KEY, { results: 5 });
const cache = new Redis(process.env.REDIS_URL);

/**
 * Looks up using SauceNAO and saves it in a cache for 56 hours.
 * @param sourceUrl the URL for the image to look up.
 */
export default async function sourceLookup(sourceUrl: string) {
  try {
    // Let's try to see if we already looked it up before...
    return await cache.get(sourceUrl);
  } catch {
    // Looks like we don't know this waifu so let's try to look it up.
    // then store it in the cache for 56 hours to lessen the load.
    const sagiriRes: SagiriResult[] = await client(sourceUrl);
    await cache.set(sourceUrl, sagiriRes, "ex", 1000 * 60 * 60 * 56);

    // return from the cache
    return await cache.get(sourceUrl);
  }
}
