// External dependencies
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import db from '@/lib/db' // Import the SQLite database connection
import bcrypt from 'bcrypt' // Import bcrypt for password hashing

// Internal component under test
import SignInForm from '@/components/SignInForm'
import { insertUser } from '@/db/models/users'

// Helper to clear all cookies after each test
function clearCookies() {
  document.cookie.split(';').forEach(cookie => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
  })
}

// Mock next/navigation to avoid 'invariant expected app router to be mounted' error
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(), // simulate redirection
  }),
}))

describe('LoginForm', () => {
  // Use a unique email for each test run to avoid collisions
  let TEST_EMAIL: string;
  const TEST_PASSWORD = 'testpassword123';
  let TEST_PASSWORD_HASH: string;

  beforeEach(async () => {
    jest.resetAllMocks()
    clearCookies()

    // Generate a unique email for this test run
    TEST_EMAIL = `testuser_${Date.now()}@example.com`;

    // Hash the test password
    TEST_PASSWORD_HASH = await bcrypt.hash(TEST_PASSWORD, 10);

    const user = {
      id: 10,
      email: TEST_EMAIL,
      password_hash: TEST_PASSWORD_HASH,
      first_name: 'John',
      last_name: 'Doe',
      image: '',
      created_at: new Date().toISOString(),
    }

    // Insert the test user into the database
    insertUser(user)

    // Robust fetch mock for all tests
    global.fetch = jest.fn((url: string) => {
      if (url === '/api/auth/csrf-token') {
        document.cookie = 'csrfToken=test-csrf-token'
        return Promise.resolve({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' }),
        })
      }

      if (url === '/api/auth/signin') {
        // Default: valid login
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ token: 'fake-token', message: 'Login successful' }),
        })
      }

      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({}),
      })
      
    }) as jest.Mock
  })

  afterEach(() => {
    // Remove the test user from the database after each test
    db.prepare('DELETE FROM users WHERE email = ?').run(TEST_EMAIL);
  })

  it('renders the login form fields and button', () => {
    render(<SignInForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit-signin/i })).toBeInTheDocument()
  })

  it('disables submit button when form is invalid', () => {
    render(<SignInForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '' } })
    expect(screen.getByRole('button', { name: /submit-signin/i })).toBeDisabled()
  })

  it('shows email format error if email is invalid', async () => {
    render(<SignInForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bademail' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.submit(screen.getByRole('form', { name: /login-form/i }))
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
  })

  it('shows error if only email is provided', async () => {
    render(<SignInForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: TEST_EMAIL },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: '' },
    })
    fireEvent.submit(screen.getByRole('form', { name: /login-form/i }))
    expect(await screen.findByText(/required/i)).toBeInTheDocument()
  })

  it('shows error if only password is provided', async () => {
    render(<SignInForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: TEST_PASSWORD },
    })
    fireEvent.submit(screen.getByRole('form', { name: /login-form/i }))
    expect(await screen.findByText(/required/i)).toBeInTheDocument()
  })

  it('shows error on failed login (401)', async () => {
    // Override fetch for this test to simulate 401
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/csrf-token') {
        document.cookie = 'csrfToken=test-csrf-token'
        return Promise.resolve({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' }),
        })
      }
      if (url === '/api/auth/signin') {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({ message: 'Invalid credentials' }),
        })
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({}),
      })
    });
    render(<SignInForm />)
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: TEST_EMAIL },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /submit-signin/i }))
    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it('shows success message on successful login', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce((url: string) => {
      if (url === '/api/auth/csrf-token') {
        document.cookie = 'csrfToken=test-csrf-token'
        return Promise.resolve({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' }),
        })
      }
      if (url === '/api/auth/signin') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            token: 'fake-token',
            message: 'Login successful',
          }),
        })
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({}),
      })
    })
    render(<SignInForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: TEST_EMAIL } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: TEST_PASSWORD } })
    fireEvent.click(screen.getByRole('button', { name: /submit-signin/i }))
    expect(await screen.findByText(/login successful/i)).toBeInTheDocument()
  })

  it('shows fallback error if JSON parsing fails', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/csrf-token') {
        document.cookie = 'csrfToken=test-csrf-token'
        return Promise.resolve({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' }),
        })
      }
      if (url === '/api/auth/signin') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => { throw new Error('Parse error') },
        })
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({}),
      })
    })
    render(<SignInForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: TEST_EMAIL } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: TEST_PASSWORD } })
    fireEvent.click(screen.getByRole('button', { name: /submit-signin/i }))
    expect(await screen.findByText(/invalid server response/i)).toBeInTheDocument()
  })

  it('shows fallback message on fetch failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/csrf-token') {
        document.cookie = 'csrfToken=test-csrf-token'
        return Promise.resolve({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' }),
        });
      }
      if (url === '/api/auth/signin') {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({}),
      });
    });
    render(<SignInForm />)
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: TEST_EMAIL } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: TEST_PASSWORD } })
    fireEvent.click(screen.getByRole('button', { name: /submit-signin/i }))
    expect(await screen.findByText(/failed to connect/i)).toBeInTheDocument()
    consoleSpy.mockRestore();
  })
})
