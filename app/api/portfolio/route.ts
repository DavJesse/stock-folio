import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSessionCookie } from '@/lib/security/get-user-from-session-cookie';
import db from '@/lib/db';

// GET /api/portfolio
export async function GET(req: NextRequest) {
  // Get user from session cookie
  const user = await getUserFromSessionCookie(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Query the portfolio for the authenticated user
    const result = await db.execute({
      sql: `
        SELECT symbol, quantity, average_price AS initialPrice
        FROM portfolio
        WHERE user_id = ?
      `,
      args: [user.userId],
    });

    // Map rows to plain objects
    const portfolio = result.rows.map(row => ({
      symbol: row[0],
      quantity: row[1],
      initialPrice: row[2],
    }));

    return NextResponse.json(portfolio);
  } catch (err) {
    console.error('Failed to fetch portfolio:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
