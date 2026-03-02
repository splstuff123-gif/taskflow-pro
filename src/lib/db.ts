import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function query<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const result = await db.execute({ sql, args });
  return result.rows as T[];
}

export async function execute(sql: string, args: any[] = []) {
  return await db.execute({ sql, args });
}
