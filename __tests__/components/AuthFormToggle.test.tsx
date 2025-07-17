// External dependencies
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock the Next.js App Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Internal component
import AuthFormToggle from '@/components/AuthFormToggle'

// Mock child form components
jest.mock('@/components/SignInForm', () => {
  const SignInFormMock = () => <div data-testid="sign-in-form">Sign In Form</div>
  SignInFormMock.displayName = 'SignInForm'
  return SignInFormMock
})

jest.mock('@/components/SignUpForm', () => {
  const SignUpFormMock = () => <div data-testid="sign-up-form">Sign Up Form</div>
  SignUpFormMock.displayName = 'SignUpForm'
  return SignUpFormMock
})

describe('AuthSwitcher', () => {
  it('renders both Sign In and Sign Up tabs', () => {
    render(<AuthFormToggle />)

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('shows SignInForm by default', () => {
    render(<AuthFormToggle />)

    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
    expect(screen.queryByTestId('sign-up-form')).not.toBeInTheDocument()
  })

  it('shows SignUpForm after clicking Sign Up tab', () => {
    render(<AuthFormToggle />)

    fireEvent.click(screen.getByText('Sign Up'))

    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument()
    expect(screen.queryByTestId('sign-in-form')).not.toBeInTheDocument()
  })

  it('toggles back to SignInForm when clicking Sign In tab', () => {
    render(<AuthFormToggle />)

    // Switch to Sign Up
    fireEvent.click(screen.getByText('Sign Up'))
    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument()

    // Switch back to Sign In
    fireEvent.click(screen.getByText('Sign In'))
    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument()
  })
})
