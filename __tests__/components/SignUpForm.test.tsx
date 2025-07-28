// External libraries
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock useRouter from Next.js App Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  }),
}))

// Component under test
import SignUpForm from '@/components/SignUpForm'

// Helper to clear all cookies after each test
function clearCookies() {
  document.cookie.split(';').forEach(cookie => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
  })
}

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    clearCookies()
    // Robust fetch mock for all tests
    global.fetch = jest.fn((url: string) => {
      if (url === '/api/auth/csrf-token') {
        document.cookie = 'csrfToken=test-csrf-token'
        return Promise.resolve({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' }),
        })
      }
      // Default: valid signup
      if (url === '/api/auth/signup') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: async () => ({ message: 'User created' }),
        })
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({}),
      })
    }) as jest.Mock
  })

  it('renders email and password fields', async () => {
    render(<SignUpForm />)
    await waitFor(() => {
      expect(screen.getByLabelText('Email:')).toBeInTheDocument()
      expect(screen.getByLabelText('Password:')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit-signup/i })).toBeInTheDocument()
    })
  })

  it('shows email format error only when email is invalid', async () => {
    render(<SignUpForm />)
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'invalid-email' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: '123456' } })
    fireEvent.submit(screen.getByRole('form', { name: /signup-form/i }))
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      expect(
        (fetch as jest.Mock).mock.calls.find(([url]) => url === '/api/auth/signup')
      ).toBeUndefined()
    })
  })

  it('shows error if passwords do not match', async () => {
    render(<SignUpForm />)
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'p@ssword123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'wrongp@ss' } })
    fireEvent.submit(screen.getByRole('form', { name: /signup-form/i }))
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('shows fallback error when response is not valid JSON', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/csrf-token') {
        document.cookie = 'csrfToken=test-csrf-token'
        return Promise.resolve({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' }),
        })
      }
      if (url === '/api/auth/signup') {
        return Promise.resolve({
          ok: false,
          json: async () => { throw new Error('Invalid JSON') },
        })
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({}),
      })
    })
    render(<SignUpForm />)
    // Wait for the CSRF token to be set
    await waitFor(() => {
      expect(document.cookie).toMatch(/csrfToken=test-csrf-token/)
    })
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'fail@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'P@ssword123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'P@ssword123' } })
    fireEvent.click(screen.getByRole('button', { name: /submit-signup/i }))
    await waitFor(() => {
      expect(screen.getByText(/Invalid server response/i)).toBeInTheDocument()
    })
  })

  it('shows password length error when password is too short', async () => {
    render(<SignUpForm />)
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'valid@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: '123' } })
    fireEvent.submit(screen.getByRole('form', { name: /signup-form/i }))
    await waitFor(() => {
      expect(screen.getByText(/password must be at least/i)).toBeInTheDocument()
      expect(
        (fetch as jest.Mock).mock.calls.find(([url]) => url === '/api/auth/signup')
      ).toBeUndefined()
    })
  })

  it('disables submit button when inputs are invalid', async () => {
    render(<SignUpForm />)
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: '' } })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit-signup/i })).toBeDisabled()
    })
  })

  it('submits form with valid input and shows success message', async () => {
    render(<SignUpForm />)
    await waitFor(() => {
      expect(document.cookie).toMatch(/csrfToken=test-csrf-token/)
    })
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'secureP@ss123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'secureP@ss123' } })
    fireEvent.click(screen.getByRole('button', { name: /submit-signup/i }))
    await waitFor(() => {
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument()
    })
  })

  it('shows error if any input field is left empty', async () => {
    render(<SignUpForm />)
    // Leave email blank
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'p@ssword123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'p@ssword123' } })
    fireEvent.submit(screen.getByRole('form', { name: /signup-form/i }))
    await waitFor(() => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument()
      expect(
        (fetch as jest.Mock).mock.calls.find(([url]) => url === '/api/auth/signup')
      ).toBeUndefined()
    })
  })

  it('clears form inputs after successful submission', async () => {
    render(<SignUpForm />)
    // Wait for the CSRF token to be set
    await waitFor(() => {
      expect(document.cookie).toMatch(/csrfToken=test-csrf-token/)
    })
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'reset@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'validP@ss123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'validP@ss123' } })
    fireEvent.click(screen.getByRole('button', { name: /submit-signup/i }))
    await waitFor(() => {
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument()
      expect(screen.getByLabelText('Email:')).toHaveValue('')
      expect(screen.getByLabelText('Password:')).toHaveValue('')
      expect(screen.getByLabelText('Confirm Password:')).toHaveValue('')
    })
  })

  it('displays error message on 400 or 409 response', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/csrf-token') {
        document.cookie = 'csrfToken=test-csrf-token'
        return Promise.resolve({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' }),
        })
      }
      if (url === '/api/auth/signup') {
        return Promise.resolve({
          ok: false,
          status: 409,
          json: async () => ({ message: 'User already exists' }),
        })
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({}),
      })
    })
    render(<SignUpForm />)
    // Wait for the CSRF token to be set
    await waitFor(() => {
      expect(document.cookie).toMatch(/csrfToken=test-csrf-token/)
    })
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'secureP@ss123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'secureP@ss123' } })
    fireEvent.click(screen.getByRole('button', { name: /submit-signup/i }))
    await waitFor(() => {
      expect(screen.getByText(/user already exists/i)).toBeInTheDocument()
    })
  })
})
