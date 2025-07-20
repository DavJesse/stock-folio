
import { NextRequest, NextResponse } from 'next/server';
import { handleSignup } from '@/lib/handlers/signup';
import { validateCsrf } from '@/lib/security/validate-csrf';

/**
 * Handles user signup requests.
 * Responds with a success message and HTTP 201 status.
 * Delegate signup logic to handleSignup.
 */
export async function POST(req: NextRequest) {
  if (!(await validateCsrf(req))) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }

  try {
    const data = await req.json();
    const { status, body } = await handleSignup(data);
    return NextResponse.json(body, { status });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
