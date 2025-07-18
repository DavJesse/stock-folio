'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

  // UI feedback states
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      let data: LoginResponse = { message: '' }

      if (response) {
        try {
          data = await response.json()
        } catch {
          setError('Invalid server response.')
          return
        }

        if (!response.ok) {
          setError(data.message || 'Something went wrong.')
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
      <div className="flex flex-col gap-3 p-6">
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
            className="bg-[var(--primary-background)] text-white py-1 px-2"
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
          <input
            id="password"
            type="password"
            className="bg-[var(--primary-background)] text-white py-1 px-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            aria-label="submit-signin"
            className={`
              bg-[var(--button-primary)]
              text-white
              px-5
              py-1
              rounded
              w-[50%]
              disabled:bg-[var(--button-disabled)]
              disabled:cursor-not-allowed
              hover:scale-105
              hover:pointer
              transition-colors duration-200
            `}
            disabled={loading || !formIsValid}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </div>
      </div>
    </form>
  )
}
