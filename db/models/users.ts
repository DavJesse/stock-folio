import db from '@/lib/db';
import { User } from '@/types/user';

/**
 * Inserts a new user into the database.
 */
export async function insertUser(user: User): Promise<void> {
  await db.execute({
    sql: `
      INSERT INTO users (id, email, password_hash, first_name, last_name, image, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      user.id,
      user.email,
      user.password_hash,
      user.first_name,
      user.last_name,
      user.image ?? null,
      user.created_at.toString(),
    ],
  });
}

/**
 * Gets a user from the database.
 */
export async function getUserById(id: number): Promise<User | undefined> {
  const result = await db.execute({
    sql: `
      SELECT id, email, password_hash, first_name, last_name, image, created_at
      FROM users
      WHERE id = ?
    `,
    args: [id],
  });

  return (result.rows[0] as unknown as User) ?? undefined;
}

/**
 * Gets a safe user (without password data) from the database.
 */
export async function getPasswordlessUserById(
  id: number
): Promise<Omit<User, 'password_hash'> | undefined> {
  const result = await db.execute({
    sql: `
      SELECT id, email, first_name, last_name, image, created_at
      FROM users
      WHERE id = ?
    `,
    args: [id],
  });

  return (result.rows[0] as unknown as Omit<User, 'password_hash'>) ?? undefined;
}

/**
 * Updates a user in the database.
 */
export async function updateUserById(
  userId: number,
  data: Partial<User>
): Promise<boolean> {
  await db.execute({
    sql: `
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?, image = ?
      WHERE id = ?
    `,
    args: [
      data.first_name ?? null,
      data.last_name ?? null,
      data.email ?? null,
      data.image ?? null,
      userId,
    ],
  });

  // Turso/libSQL does not return `changes` by default; assume success if no error
  return true;
}
