// External libraries
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
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

    // Mock create object URL
    global.URL.createObjectURL = jest.fn(() => 'mocked-url')
    global.URL.revokeObjectURL = jest.fn()

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
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    await waitFor(() => {
      expect(screen.getByLabelText('First Name:')).toBeInTheDocument()
      expect(screen.getByLabelText('Last Name:')).toBeInTheDocument()
      expect(screen.getByLabelText('Email:')).toBeInTheDocument()
      expect(screen.getByLabelText('Password:')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password:')).toBeInTheDocument()
      expect(screen.getByLabelText('Profile Image (Optional):')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit-signup/i })).toBeInTheDocument()
    })
  })

  it('shows email format error only when email is invalid', async () => {
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } })
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
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } })
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

    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    // Wait for the CSRF token to be set
    await waitFor(() => {
      expect(document.cookie).toMatch(/csrfToken=test-csrf-token/)
    })

    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'fail@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'P@ssword123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'P@ssword123' } })
    fireEvent.click(screen.getByRole('button', { name: /submit-signup/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid server response/i)).toBeInTheDocument()
    })
  })

  it('shows password length error when password is too short', async () => {
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } })
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
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: '' } })
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

    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'secureP@ss123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'secureP@ss123' } })
    fireEvent.click(screen.getByRole('button', { name: /submit-signup/i }))
    await waitFor(() => {
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument()
    })
  })

  it('shows error if any input field is left empty', async () => {
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } })
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
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    await waitFor(() => {
      expect(document.cookie).toMatch(/csrfToken=test-csrf-token/)
    })

    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'reset@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'validP@ss123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'validP@ss123' } })

    // Optionally simulate selecting an image file
    const file = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const fileInput = screen.getByTestId('image-input') as HTMLInputElement
    await waitFor(() => {
      fireEvent.change(fileInput, { target: { files: [file] } })
    })

    fireEvent.click(screen.getByRole('button', { name: /submit-signup/i }))

    await waitFor(() => {
      expect(screen.getByText(/account created successfully/i)).toBeInTheDocument()
      expect(screen.getByLabelText('Email:')).toHaveValue('')
      expect(screen.getByLabelText('Password:')).toHaveValue('')
      expect(screen.getByLabelText('Confirm Password:')).toHaveValue('')
      expect(screen.queryByText(/selected:/i)).not.toBeInTheDocument()
      expect(fileInput.value).toBe('')
    })
  })

  it('toggles password visibility when icon is clicked', async () => {
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    const passwordInput = screen.getByLabelText('Password:')
    const toggleBtn = screen.getByLabelText('Show password')

    expect(passwordInput).toHaveAttribute('type', 'password')
    fireEvent.click(toggleBtn)
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('displays password strength indicator when password is typed', async () => {
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    const passwordInput = screen.getByLabelText('Password:')
    fireEvent.change(passwordInput, { target: { value: '123456' } })

    await waitFor(() => {
      expect(screen.getByText(/strength:/i)).toBeInTheDocument()
    })
  })

  it('shows error for unsupported image format', async () => {
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    const fileInput = screen.getByTestId('image-input')
    const file = new File(['dummy'], 'dummy.txt', { type: 'text/plain' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText(/only jpeg and png images are allowed/i)).toBeInTheDocument()
    })
  })

  it('shows and removes image preview correctly', async () => {
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    const fileInput = screen.getByTestId('image-input')
    const imageFile = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [imageFile] } })

    await waitFor(() => {
      expect(screen.getByAltText('Profile Preview')).toBeInTheDocument()
    })

    const removeButton = screen.getByRole('button', { name: /remove image/i })

    // Ensure React flushes state updates
    await act(async () => {
      fireEvent.click(removeButton)
    })

    await waitFor(() => {
      expect(screen.queryByAltText('Profile Preview')).not.toBeInTheDocument()
    })
  })

  it('stores demoMessage in localStorage if present', async () => {
    const setItemSpy = jest.spyOn(window.localStorage.__proto__, 'setItem')
  
    // Mock render
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/csrf-token') {
        document.cookie = 'csrfToken=test-csrf-token'
        return Promise.resolve({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' }),
        })
      }
      if (url === '/api/auth/signup') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'ok', demoMessage: 'Welcome demo!' }),
        })
      }
      return Promise.resolve({ ok: false })
    })
  
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })
  
    // Wait for the CSRF token to be fetched and set in state
    await waitFor(() => {
      expect(document.cookie).toMatch(/csrfToken=test-csrf-token/)
    })
  
    // Give a small additional wait to ensure the state has been updated
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
    })
  
    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'demo@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'DemoP@ssword1' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'DemoP@ssword1' } })
    
    fireEvent.click(screen.getByRole('button', { name: /submit-signup/i }))
  
    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('demoMessage', 'Welcome demo!')
    })
  
    setItemSpy.mockRestore()
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
    
    await act(async () => {
      render(<SignUpForm />)
      await new Promise(resolve => setTimeout(resolve, 0)) 
    })

    // Wait for the CSRF token to be set
    await waitFor(() => {
      expect(document.cookie).toMatch(/csrfToken=test-csrf-token/)
    })
    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'secureP@ss123' } })
    fireEvent.change(screen.getByLabelText('Confirm Password:'), { target: { value: 'secureP@ss123' } })
    fireEvent.click(screen.getByRole('button', { name: /submit-signup/i }))
    await waitFor(() => {
      expect(screen.getByText(/user already exists/i)).toBeInTheDocument()
    })
  })
})
