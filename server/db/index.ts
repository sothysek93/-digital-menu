import { H3Event } from 'h3';

export function getDB(event: H3Event) {
  // 1. Production/Wrangler Binding
  const DB = event.context.cloudflare?.env?.DB;
  if (DB) return DB;

  // 2. Local Cloud API Bridge (Fallback for Local Dev)
  const config = useRuntimeConfig();
  const token = process.env.CF_API_TOKEN || config.cfApiToken;
  const accountId = process.env.CF_ACCOUNT_ID || config.cfAccountId;
  const databaseId = process.env.CF_D1_DATABASE_ID || config.cfDatabaseId;

  if (token && accountId && databaseId) {
    return {
      prepare: (sql: string) => ({
        bind: (...params: any[]) => ({
          all: async () => {
            const res = await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sql, params })
              }
            );
            const data = await res.json() as any;
            if (!data.success) {
              console.error('❌ D1 Bridge Error:', data.errors?.[0]?.message || data);
              throw new Error(data.errors?.[0]?.message || 'D1 API Error');
            }
            
            // D1 Query API returns an array in 'result' for each query sent
            const queryResult = data.result?.[0] || data.result;
            return { results: queryResult?.results || [] };
          }
        }),
        all: async () => {
          const res = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sql, params: [] })
            }
          );
          const data = await res.json() as any;
          if (!data.success) {
            console.error('❌ D1 Bridge Error:', data.errors?.[0]?.message || data);
            throw new Error(data.errors?.[0]?.message || 'D1 API Error');
          }
          
          const queryResult = data.result?.[0] || data.result;
          return { results: queryResult?.results || [] };
        }
      })
    } as any;
  }

  throw createError({
    statusCode: 503,
    statusMessage: 'DATABASE_BINDING_MISSING: No D1 binding found and no Cloud Bridge credentials provided in .env.'
  });
}

export async function query(event: H3Event, text: string, params?: any[]) {
  const db = getDB(event);
  const stmt = db.prepare(text);
  
  if (params && params.length > 0) {
    const { results } = await stmt.bind(...params).all();
    return results;
  }
  
  const { results } = await stmt.all();
  return results;
}
