'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie';

/**
 * Interface for the expected shape of the login response
 */
interface LoginResponse {
  message: string
  token?: string
}

/**
 * SignInForm is a controlled form component for user login.
 * It validates inputs, communicates with the backend, and provides feedback.
 */
export default function SignInForm() {
  //  Initialize router
  const router = useRouter()

  // Form field states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false)

  // UI feedback states
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/auth/csrf-token');
  }, []);

  // Form validation status
  const formIsValid =
    email &&
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) &&
    password.length >= 6

  // Handles form submission logic
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Basic validation
    if (!email || !password) {
      setError('Both email and password are required.')
      return
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    
    try {
      const csrfToken = Cookies.get('csrfToken');
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
         },
        body: JSON.stringify({ email, password }),
      })

      let data: LoginResponse = { message: '' }

      if (response) {
        try {
          data = await response.json()
        } catch {
          setError('Invalid server response.')
          return;
        }

        if (!response.ok) {
          setError(data.message || 'Something went wrong.')
          return;
        } else {
          setSuccess(true)
          setEmail('')
          setPassword('')
          router.push('/dashboard') // Redirect after login
        }
      } else {
        setError('No response from server.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Failed to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="login-form">
      <div className="flex flex-col gap-3">
        {error && (
          <p role="alert" className="text-[var(--warning-color)]">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-[var(--success-color)]">
            Login successful!
          </p>
        )}

        {/* Email input */}
        <div>
          <label htmlFor="email" className="text-white text-base">
            Email:
          </label>
          <br />
          <input
            id="email"
            type="email"
            className="bg-[var(--primary-background)] text-white py-1 px-2 w-full border-2 border-gray-600/50 rounded transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-400 focus:shadow-xl focus:shadow-blue-400/20 hover:border-gray-500/70"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password input */}
        <div>
          <label htmlFor="password" className="text-white text-base">
            Password:
          </label>
          <br />
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="bg-[var(--primary-background)] text-white py-1 px-2 pr-10 w-full border-2 border-gray-600/50 rounded transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-400 focus:shadow-xl focus:shadow-blue-400/20 hover:border-gray-500/70"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-all duration-300 ease-in-out ${
                showPassword 
                  ? 'text-blue-400 shadow-lg shadow-blue-400/20' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {showPassword ? (
                  // Eye slash icon (hide)
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21m-7.757-7.757L21 21m-7.757-7.757a3 3 0 00-4.243-4.243m4.243 4.243L9.878 9.878" 
                  />
                ) : (
                  // Eye icon (show)
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            aria-label="submit-signin"
            className="bg-[var(--button-primary)] text-white px-5 py-1 rounded w-[50%] disabled:bg-[var(--button-disabled)] disabled:cursor-not-allowed hover:scale-105 hover:pointer transition-colors duration-200"
            disabled={loading || !formIsValid}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </div>
      </div>
    </form>
  )
}
