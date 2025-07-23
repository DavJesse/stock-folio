import type { Database as DBType } from 'better-sqlite3';
import path from 'path';
import { createTestDB } from '@/lib/test-helpers/create-test-db';

// Define the migration paths in the correct order
const migrationPaths = [
  path.join(__dirname, '../../../db/migrations/001_create_users_table.sql'),
  path.join(__dirname, '../../../db/migrations/002_create_accounts_table.sql'),
  path.join(__dirname, '../../../db/migrations/003_create_portfolio_table.sql'),
];

// Type representing table column info from PRAGMA
interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

describe('Database Migrations', () => {
  let db: DBType;

  // Set up in-memory database before tests
  beforeAll(() => {
    db = createTestDB(migrationPaths);
  });

  // Close database after all tests
  afterAll(() => {
    db.close();
  });

  test('accounts table exists with correct schema', () => {
    const columns = db.prepare(`PRAGMA table_info(accounts)`).all() as TableColumn[];
    const columnNames = columns.map((col) => col.name);

    expect(columnNames).toEqual(
      expect.arrayContaining([
        'id',
        'user_id',
        'cash_balance',
        'created_at',
        'updated_at',
      ])
    );
  });

  test('portfolio table exists with correct schema', () => {
    const columns = db.prepare(`PRAGMA table_info(portfolio)`).all() as TableColumn[];
    const columnNames = columns.map((col) => col.name);

    expect(columnNames).toEqual(
      expect.arrayContaining([
        'id',
        'user_id',
        'symbol',
        'quantity',
        'average_price',
        'created_at',
        'updated_at',
      ])
    );
  });

  test('accounts.user_id has valid foreign key constraint', () => {
    const constraints = db.prepare(`PRAGMA foreign_key_list(accounts)`).all();

    expect(constraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'users',
          from: 'user_id',
          to: 'id',
        }),
      ])
    );
  });

  test('portfolio.user_id has valid foreign key constraint', () => {
    const constraints = db.prepare(`PRAGMA foreign_key_list(portfolio)`).all();

    expect(constraints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          table: 'users',
          from: 'user_id',
          to: 'id',
        }),
      ])
    );
  });
});
