'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import zxcvbn from 'zxcvbn'

interface SignUpResponse {
  message: string
  demoMessage?: string
}

export default function SignUpForm() {
  // Initialize router
  const router = useRouter()

  // Form field states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageName, setImageName] = useState('')
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [passwordScore, setPasswordScore] = useState(0)
  const passwordIsStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)

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

  const formIsValid =
    email &&
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email) &&
    password.length >= 6 &&
    confirmPassword.length >= 6 &&
    password === confirmPassword &&
    passwordIsStrong &&
    firstName.trim() &&
    lastName.trim()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!email || !password || !confirmPassword || !firstName || !lastName) {
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

    if (!csrfToken) {
      setError('CSRF token missing. Please refresh and try again.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)
      formData.append('first_name', firstName)
      formData.append('last_name', lastName)

      if (imageFile) {
        formData.append('image', imageFile)
      }
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'x-csrf-token': csrfToken,
        },
        body: formData,
      })

      let data: SignUpResponse = { message: '' }

      if (response) {
        try {
          data = await response.json()
        } catch {
          data.message = 'Invalid server response.'
        }

        if (!response.ok) {
          setError(data.message || 'Something went wrong.')
          return
        } else {
          setSuccess(true)
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          setFirstName('')
          setLastName('')
          setImageName('')
          setImagePreviewUrl(null)
          setImageFile(null)

          if (data.demoMessage) {
            localStorage.setItem('demoMessage', data.demoMessage)
          }

          router.push('/dashboard')
        }
      } else {
        setError('No response from server.')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('Failed to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="signup-form">
      <div className="flex flex-col gap-3">
        {error && <p role="alert" className="text-[var(--warning-color)]">{error}</p>}
        {success && <output className="text-[var(--success-color)]">Account created successfully!</output>}

        {/* First name and Last name - side by side on larger screens, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="text-white text-base">First Name:</label>
            <br />
            <input
              id="firstName"
              className="bg-[var(--primary-background)] text-white py-1 px-2 w-full border-2 border-gray-600/50 rounded transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-400 focus:shadow-xl focus:shadow-blue-400/20 hover:border-gray-500/70"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="text-white text-base">Last Name:</label>
            <br />
            <input
              id="lastName"
              className="bg-[var(--primary-background)] text-white py-1 px-2 w-full border-2 border-gray-600/50 rounded transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-400 focus:shadow-xl focus:shadow-blue-400/20 hover:border-gray-500/70"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email - full width */}
        <div>
          <label htmlFor="email" className="text-white text-base">Email:</label>
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

        {/* Password - full width on mobile */}
        <div>
          <label htmlFor="password" className="text-white text-base">Password:</label>
          <br />
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="bg-[var(--primary-background)] text-white py-1 px-2 pr-10 w-full border-2 border-gray-600/50 rounded transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-400 focus:shadow-xl focus:shadow-blue-400/20 hover:border-gray-500/70"
              value={password}
              onChange={(e) => {
                const pwd = e.target.value
                setPassword(pwd)
                setPasswordScore(zxcvbn(pwd).score)
              }}
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

        {/* Confirm Password - full width on mobile */}
        <div>
          <label htmlFor="confirmPassword" className="text-white text-base">Confirm Password:</label>
          <br />
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="bg-[var(--primary-background)] text-white py-1 px-2 pr-10 w-full border-2 border-gray-600/50 rounded transition-all duration-300 ease-in-out focus:outline-none focus:border-blue-400 focus:shadow-xl focus:shadow-blue-400/20 hover:border-gray-500/70"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-all duration-300 ease-in-out ${
                showConfirmPassword 
                  ? 'text-blue-400 shadow-lg shadow-blue-400/20' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {showConfirmPassword ? (
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

        {/* Password strength indicator - full width below password fields */}
        {password && (
          <div className="-mt-1">
            <div className="w-full h-2 bg-gray-300 rounded">
              <div
                className="h-full rounded transition-all duration-300"
                style={{
                  width: `${(passwordScore + 1) * 20}%`,
                  backgroundColor: ['red', 'orange', 'yellow', 'lightgreen', 'green'][passwordScore] || 'gray',
                }}
              ></div>
            </div>
            <p className="text-sm text-white mt-1">
              Strength: {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordScore]}
            </p>
          </div>
        )}

        {/* Image upload */}
        <div>
          <label htmlFor="image" className="text-white text-base block mb-2">
            Profile Image (Optional):
          </label>
          
          <div className="flex flex-col items-center gap-3">
            {/* Custom file upload button */}
            <label
              htmlFor="image"
              className="bg-[var(--primary-background)] hover:bg-[var(--button-primary)] text-white px-4 py-2 rounded border-2 border-gray-600 hover:border-[var(--button-primary)] cursor-pointer transition-all duration-200 hover:scale-105 flex items-center gap-2 text-sm"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                />
              </svg>
              {imageName ? 'Change Image' : 'Choose Image'}
            </label>
            
            {/* Hidden file input */}
            <input
              id="image"
              type="file"
              accept=".jpeg,.jpg,.png"
              className="hidden"
              data-testid="image-input"
              onChange={(e) => {
                const file = e.target.files?.[0]

                // Clear previous error
                setError(null)

                if (!file) {
                  setImagePreviewUrl(null)
                  setImageName('')
                  setImageFile(null)
                  return
                }
              
                const allowedTypes = ['image/jpeg', 'image/png']
                const maxSize = 20 * 1024 * 1024 // 20MB
              
                if (!allowedTypes.includes(file.type)) {
                  setError('Only JPEG and PNG images are allowed.')
                  setImagePreviewUrl(null)
                  return
                }
              
                if (file.size > maxSize) {
                  setError('Image must be smaller than 20MB.')
                  setImagePreviewUrl(null)
                  return
                }
              
                // Remove file extension from name
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
                setImageName(nameWithoutExt)
                setImageFile(file) 
              
                // Revoke previous object URL to avoid memory leaks
                if (imagePreviewUrl) {
                  URL.revokeObjectURL(imagePreviewUrl)
                }
              
                const previewUrl = URL.createObjectURL(file)
                setImagePreviewUrl(previewUrl)
              }}
            />
            
            {/* File info */}
            {imageName && (
              <p className="text-sm text-gray-300 text-center max-w-full truncate">
                Selected: {imageName.length > 20 ? `${imageName.substring(0, 20)}...` : imageName}
              </p>
            )}
            
            <p className="text-xs text-gray-400 text-center">
              JPEG or PNG, max 20MB
            </p>
          </div>
        </div>

        {imagePreviewUrl && (
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={imagePreviewUrl}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border border-white"
              />
              <button
                type="button"
                onClick={() => {
                  // Revoke the object URL to prevent memory leaks
                  if (imagePreviewUrl) {
                    URL.revokeObjectURL(imagePreviewUrl)
                  }
                  // Clear the image states
                  setImagePreviewUrl(null)
                  setImageName('')
                  // Clear the file input
                  const fileInput = document.getElementById('image') as HTMLInputElement
                  if (fileInput) {
                    fileInput.value = ''
                  }
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            aria-label="submit-signup"
            className="bg-[var(--button-primary)] text-white px-5 py-1 rounded w-full sm:w-[50%] disabled:bg-[var(--button-disabled)] disabled:cursor-not-allowed hover:scale-105 hover:pointer transition-colors duration-200"
            disabled={loading || !formIsValid}
          >
            {loading ? 'Logging...' : 'Sign Up'}
          </button>
        </div>
      </div>
    </form>
  )
}
