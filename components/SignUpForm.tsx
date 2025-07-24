'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Interface for the expected shape of the signup response
 */
interface SignUpResponse {
  message: string
  demoMessage?: string
}

/**
 * SignUpForm is a controlled form component that handles user registration.
 * It validates inputs, communicates with the backend, and provides user feedback.
 */
export default function SignUpForm() {
  //  Initialize router
  const router = useRouter()

  // Form field states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI feedback states
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const res = await fetch('/api/auth/csrf-token')
        const { csrfToken } = await res.json()
        setCsrfToken(csrfToken)
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err)
      }
    }

    fetchCsrf()
  }, [])

  // Form validation status — true only if all criteria are met
  const formIsValid =
    email &&
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) &&
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    password === confirmPassword

  // Handles form submission logic
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Basic client-side validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required.')
      return
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    // CSRF token check (keep separate!)
    if (!csrfToken) {
      setError('CSRF token missing. Please refresh and try again.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ email, password }),
      })

      let data: SignUpResponse = { message: '' }

      if (response) {
        try {
          data = await response.json()
        } catch {
          // Server responded but body could not be parsed
          data.message = 'Invalid server response.'
        }

        if (!response.ok) {
          setError(data.message || 'Something went wrong.')
        } else {
          // Signup successful
          setSuccess(true)
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          
          // Save demo message in local storage for retrieval in DemoPopup
        if (data.demoMessage) {
          localStorage.setItem('demoMessage', data.demoMessage)
        }
        
        router.push('/dashboard') // Redirect to dashboard

        }
      } else {
        // Network or unexpected issue
        setError('No response from server.')
      }
    } catch (err) {
      // Network failure or fetch-related issue
      console.error('Signup error:', err)
      setError('Failed to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="signup-form">
      <div className="flex flex-col gap-3 p-6">
        {error && (
          <p role="alert" className="text-[var(--warning-color)]">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-[var(--success-color)]">
            Account created successfully!
          </p>
        )}

        {/* Email input field */}
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

        {/* Password input field */}
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

        {/* Confirm password field */}
        <div>
          <label htmlFor="confirmPassword" className="text-white text-base">
            Confirm Password:
          </label>
          <br />
          <input
            id="confirmPassword"
            type="password"
            className="bg-[var(--primary-background)] text-white py-1 px-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            aria-label="submit-signup"
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
            disabled={loading || !formIsValid} // Disable if loading or invalid input
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>
      </div>
    </form>
  )
}
