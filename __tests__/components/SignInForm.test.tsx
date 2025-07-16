// External dependencies
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Internal component under test
import SignInForm from '@/components/SignInForm'

// Mock global fetch so it can be controlled in each test case
global.fetch = jest.fn()

describe('LoginForm', () => {
  beforeEach(() => {
    // Reset all mock state before each test
    jest.resetAllMocks()
  })

  it('renders the login form fields and button', () => {
    render(<SignInForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('disables submit button when form is invalid', () => {
    render(<SignInForm />)

    // Submit empty form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '' } })

    // Expect button to be disabled due to form validation
    expect(screen.getByRole('button', { name: /log in/i })).toBeDisabled()
  })

  it('shows email format error if email is invalid', async () => {
    render(<SignInForm />)

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bademail' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })

    // Submit form with invalid email
    fireEvent.submit(screen.getByRole('form', { name: /login-form/i }))

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
  })

  it('shows error if only email is provided', async () => {
    render(<SignInForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: '' },
    })

    // Submit with missing password
    fireEvent.submit(screen.getByRole('form', { name: /login-form/i }))

    expect(await screen.findByText(/required/i)).toBeInTheDocument()
  })

  it('shows error if only password is provided', async () => {
    render(<SignInForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: '' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    // Submit with missing email
    fireEvent.submit(screen.getByRole('form', { name: /login-form/i }))

    expect(await screen.findByText(/required/i)).toBeInTheDocument()
  })

  it('shows error on failed login (401)', async () => {
    // Simulate backend returning unauthorized response
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' }),
    })

    render(<SignInForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument()
  })

  it('shows success message on successful login', async () => {
    // Simulate successful login response from backend
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        token: 'fake-token',
        message: 'Login successful',
      }),
    })

    render(<SignInForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'correctpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/login successful/i)).toBeInTheDocument()
  })

  it('shows fallback error if JSON parsing fails', async () => {
    // Simulate invalid JSON response body from server
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error('Parse error')
      },
    })

    render(<SignInForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'correctpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/invalid server response/i)).toBeInTheDocument()
  })

  it('shows fallback message on fetch failure', async () => {
    // Suppress console.error for clean test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // Simulate network failure
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<SignInForm />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'correctpass' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText(/failed to connect/i)).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
