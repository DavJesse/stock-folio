
import { NextRequest, NextResponse } from 'next/server';
import { handleSignup } from '@/lib/handlers/signup';

/**
 * Handles user signup requests.
 * Responds with a success message and HTTP 201 status.
 * Delegate signup logic to handleSignup.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { status, body } = await handleSignup(data);
    return NextResponse.json(body, { status });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
