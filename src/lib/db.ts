import { createClient, type Client } from '@libsql/client';

let dbInstance: Client | null = null;

function getDb(): Client {
  if (!dbInstance) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables');
    }
    
    dbInstance = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  
  return dbInstance;
}

export const db = {
  execute: async (sql: any) => {
    return await getDb().execute(sql);
  },
};

export async function query<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const result = await getDb().execute({ sql, args });
  return result.rows as T[];
}

export async function execute(sql: string, args: any[] = []) {
  return await getDb().execute({ sql, args });
}
