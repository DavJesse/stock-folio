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

// Globally mock the fetch API
global.fetch = jest.fn()

describe('SignUpForm', () => {
  beforeEach(() => {
    // Reset fetch mock between tests
    jest.resetAllMocks()
  })

  it('renders email and password fields', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText('Email:')).toBeInTheDocument()
    expect(screen.getByLabelText('Password:')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows email format error only when email is invalid', async () => {
    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'invalid-email' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: '123456' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: '123456' } })

    fireEvent.submit(screen.getByRole('form', { name: /signup-form/i }))

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled() // Prevents network call on invalid input
  })

  it('shows error if passwords do not match', async () => {
    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'user@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'wrongpass' } })

    fireEvent.submit(screen.getByRole('form', { name: /signup-form/i }))

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('shows fallback error when response is not valid JSON', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON')
      },
    })

    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'fail@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'password123' } })

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/invalid server response/i)).toBeInTheDocument()
  })

  it('shows password length error when password is too short', async () => {
    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'valid@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: '123' } })

    fireEvent.submit(screen.getByRole('form', { name: /signup-form/i }))

    expect(await screen.findByText(/password must be at least/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled() // Validation should block request
  })

  it('disables submit button when inputs are invalid', () => {
    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: '' } })

    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled()
  })

  it('submits form with valid input and shows success message', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ message: 'User created' }),
    })

    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'securePass123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'securePass123' } })

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/account created successfully/i)).toBeInTheDocument()
  })

  it('shows error if any input field is left empty', async () => {
    render(<SignUpForm />)

    // Leave email blank
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'password123' } })

    fireEvent.submit(screen.getByRole('form', { name: /signup-form/i }))

    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('clears form inputs after successful submission', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ message: 'User created' }),
    })

    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'reset@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'validPass123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'validPass123' } })

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/account created successfully/i)).toBeInTheDocument()

    // Inputs should reset to empty
    expect(screen.getByLabelText('Email:')).toHaveValue('')
    expect(screen.getByLabelText('Password:')).toHaveValue('')
    expect(screen.getByLabelText('Confirm Password:')).toHaveValue('')
  })

  it('displays error message on 400 or 409 response', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ message: 'User already exists' }),
    })

    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'securePass123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'securePass123' } })

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/user already exists/i)).toBeInTheDocument()
  })

  it('shows loading state during submission', async () => {
    // Setup promise control for fetch mock
     let resolveFetch: (value?: unknown) => void;
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve
    })
    ;(fetch as jest.Mock).mockReturnValue(fetchPromise)

    render(<SignUpForm />)

    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'loading@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'loading123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'loading123' } })

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
    })

    resolveFetch!() // Finish the fetch
    await waitFor(() => expect(fetch).toHaveBeenCalled())
  })
})
