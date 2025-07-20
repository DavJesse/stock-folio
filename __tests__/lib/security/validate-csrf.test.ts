import { validateCsrf } from '@/lib/security/validate-csrf';
import { NextRequest } from 'next/server';

//
// ─── MOCK HELPER ────────────────────────────────────────────────────────────────
//

/**
 * Creates a mock NextRequest with optional CSRF token in cookie and header.
 */
function createMockRequest({
  cookieToken,
  headerToken,
}: {
  cookieToken?: string;
  headerToken?: string;
}): NextRequest {
  return {
    cookies: {
      get: (name: string) => {
        if (name === 'csrfToken' && cookieToken !== undefined) {
          return { value: cookieToken };
        }
        return undefined;
      },
    },
    headers: {
      get: (name: string) => {
        if (name.toLowerCase() === 'x-csrf-token') {
          return headerToken || null;
        }
        return null;
      },
    },
  } as unknown as NextRequest;
}

//
// ─── TEST SUITE ────────────────────────────────────────────────────────────────
//

describe('validateCsrf', () => {
  it('returns true when tokens match', async () => {
    const req = createMockRequest({
      cookieToken: 'securetoken123',
      headerToken: 'securetoken123',
    });

    expect(await validateCsrf(req)).toBe(true);
  });

  it('returns false when tokens do not match', async () => {
    const req = createMockRequest({
      cookieToken: 'securetoken123',
      headerToken: 'wrongtoken',
    });

    expect(await validateCsrf(req)).toBe(false);
  });

  it('returns false when header is missing', async () => {
    const req = createMockRequest({
      cookieToken: 'securetoken123',
    });

    expect(await validateCsrf(req)).toBe(false);
  });

  it('returns false when cookie is missing', async () => {
    const req = createMockRequest({
      headerToken: 'securetoken123',
    });

    expect(await validateCsrf(req)).toBe(false);
  });

  it('returns false when both are missing', async () => {
    const req = createMockRequest({});

    expect(await validateCsrf(req)).toBe(false);
  });
});
