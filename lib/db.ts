import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.DATABASE_URI!,
  authToken: process.env.DATABASE_API_TOKEN!,
});

export default db;
