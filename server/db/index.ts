import { H3Event } from 'h3';

export function getDB(event: H3Event) {
  // Nitro stores Cloudflare bindings in context
  const DB = event.context.cloudflare?.env?.DB;
  
  if (!DB) {
    // In local dev, we might use a fallback or Nitro's built-in D1 proxy
    // But for now, we assume it's available in context
    return (globalThis as any).__D1_BETA__ || (globalThis as any).DB;
  }
  
  return DB;
}

export async function query(event: H3Event, text: string, params?: any[]) {
  const db = getDB(event);
  const stmt = db.prepare(text);
  
  if (params) {
    stmt.bind(...params);
  }
  
  const { results } = await stmt.all();
  return results;
}
