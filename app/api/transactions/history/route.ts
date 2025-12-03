import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionCookie } from "@/lib/security/get-user-from-session-cookie";
import db from "@/lib/db";

// Structure of a single transaction row returned from the database
type TransactionRow = {
  symbol: string;
  type: "buy" | "sell" | "deposit";
  quantity: number;
  price: number;
  created_at: string;
};

// GET /api/transactions/history
export async function GET(req: NextRequest) {
  // Authenticate user using session cookie
  const user = await getUserFromSessionCookie(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse optional query parameters for pagination
  const { searchParams } = new URL(req.url);
  const parsedLimit = parseInt(searchParams.get("limit") || "", 10);
  const parsedOffset = parseInt(searchParams.get("offset") || "", 10);

  const limit = Number.isNaN(parsedLimit) ? 10 : parsedLimit;
  const offset = Number.isNaN(parsedOffset) ? 0 : parsedOffset;

  try {
    // Query transaction history for the user
    const result = await db.execute({
      sql: `
        SELECT symbol, type, quantity, price, created_at
        FROM transactions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [user.userId, limit, offset],
    });

    // Query total count for pagination
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as total FROM transactions WHERE user_id = ?`,
      args: [user.userId],
    });

    // Map result rows to objects with proper types
    const transactions: TransactionRow[] = result.rows.map((row) => ({
      symbol: (row[0] as string) ?? "",
      type: (row[1] as "buy" | "sell" | "deposit") ?? "buy",
      quantity: (row[2] as number) ?? 0,
      price: (row[3] as number) ?? 0,
      created_at: (row[4] as string) ?? new Date().toISOString(),
    }));

    const total = (countResult.rows[0] as unknown as { total: number }).total;

    return NextResponse.json({ transactions, total });
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
