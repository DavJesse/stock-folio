import { POST } from '@/app/api/transactions/buy/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/security/validate-csrf', () => ({
  validateCsrf: jest.fn(),
}));

jest.mock('@/lib/security/verify-token', () => ({
  verifyTokenFromRequest: jest.fn(),
}));

jest.mock('@/lib/transactions/buy', () => ({
  buyStock: jest.fn(),
}));

import { validateCsrf } from '@/lib/security/validate-csrf';
import { verifyTokenFromRequest } from '@/lib/security/verify-token';
import { buyStock } from '@/lib/transactions/buy';

// Override NextResponse.json to behave like a real Response instance
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');

  return {
    ...actual,
    NextResponse: {
      json: <T>(data: T, init?: ResponseInit) =>
        new actual.NextResponse(JSON.stringify(data), {
          ...init,
          headers: { 'Content-Type': 'application/json' },
        }),
    },
  };
});

/**
 * Creates a mocked NextRequest with body and headers.
 */
export function mockRequest<T extends Record<string, unknown>>(
  body: T,
  headers: Record<string, string> = {}
): NextRequest {
  const lowerHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  );

  return {
    json: async () => body,
    headers: {
      get: (key: string) => lowerHeaders[key.toLowerCase()] || null,
    },
    cookies: {
      get: () => ({ value: 'mock-csrf-token' }),
    },
  } as unknown as NextRequest;
}

describe('POST /api/transactions/buy', () => {
  beforeAll(() => {
    // Silence error logs during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 403 if CSRF validation fails', async () => {
    (validateCsrf as jest.Mock).mockResolvedValue(false);
    const req = mockRequest({});
    const res = await POST(req);

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Invalid CSRF token' });
  });

  it('returns 401 if user is not authenticated', async () => {
    (validateCsrf as jest.Mock).mockResolvedValue(true);
    (verifyTokenFromRequest as jest.Mock).mockResolvedValue(null);
    const req = mockRequest({});
    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 if request body is invalid JSON', async () => {
    (validateCsrf as jest.Mock).mockResolvedValue(true);
    (verifyTokenFromRequest as jest.Mock).mockResolvedValue({ sub: 'user-id' });

    // Simulate failure during JSON parsing
    const invalidJsonRequest = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      headers: { get: () => null },
      cookies: { get: () => ({ value: 'mock-csrf-token' }) },
    } as unknown as NextRequest;

    const res = await POST(invalidJsonRequest);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 400 if symbol or quantity is missing', async () => {
    (validateCsrf as jest.Mock).mockResolvedValue(true);
    (verifyTokenFromRequest as jest.Mock).mockResolvedValue({ sub: 'user-id' });

    const req = mockRequest({ symbol: 'AAPL', price: 150 }); // quantity is missing
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Missing or invalid parameters' });
  });

  it('returns 200 on successful purchase', async () => {
    (validateCsrf as jest.Mock).mockResolvedValue(true);
    (verifyTokenFromRequest as jest.Mock).mockResolvedValue({ sub: 'user-id' });
    (buyStock as jest.Mock).mockResolvedValue({ success: true });

    const req = mockRequest({ symbol: 'AAPL', quantity: 10, price: 150 });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it('returns 500 on internal error', async () => {
    (validateCsrf as jest.Mock).mockResolvedValue(true);
    (verifyTokenFromRequest as jest.Mock).mockResolvedValue({ sub: 'user-id' });
    (buyStock as jest.Mock).mockRejectedValue(new Error('Something went wrong'));

    const req = mockRequest({ symbol: 'AAPL', quantity: 10, price: 150 });
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Something went wrong' });
  });
});
