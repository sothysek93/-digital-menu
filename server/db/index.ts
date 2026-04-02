import { H3Event } from 'h3';

export function getDB(event: H3Event) {
  // 1. Check Nitro Cloudflare Context (Standard for Pages/Workers)
  const DB = event.context.cloudflare?.env?.DB;
  if (DB) return DB;

  // 2. Check Global Context (Standard for older Wrangler or specific D1 emulators)
  const globalDB = (globalThis as any).DB || (globalThis as any).__D1_BETA__;
  if (globalDB) return globalDB;

  // 3. Fail with clear instructions
  throw createError({
    statusCode: 503,
    statusMessage: 'DATABASE_BINDING_MISSING: The D1 database service is not linked. Please check your Cloudflare Dashboard and link a D1 database named "DB".'
  });
}

export async function query(event: H3Event, text: string, params?: any[]) {
  const db = getDB(event);
  let stmt = db.prepare(text);
  
  if (params && params.length > 0) {
    stmt = stmt.bind(...params);
  }
  
  const { results } = await stmt.all();
  return results;
}
