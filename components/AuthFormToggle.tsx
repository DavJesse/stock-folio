'use client'

import { useState } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

/**
 * AuthFormSwitcher toggles between SignIn and SignUp forms.
 * It manages the view state and displays appropriate forms with a toggle button.
 */
export default function AuthFormToggle() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="max-w-md h-100 mx-auto p-4 rounded-lg shadow-lg bg-white/5 backdrop-blur-md border border-white/20">
      {/* Toggle buttons with active status indicator */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setIsLogin(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 text-white ${
            isLogin
              ? 'bg-[var(--button-primary)] text-white shadow-md'
              : 'bg-transparent text-[var(--link-color)] hover:scale-110'
          }`}
        >
          Sign In
        </button>

        <button
          onClick={() => setIsLogin(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            !isLogin
              ? 'bg-[var(--button-primary)] text-white shadow-md'
              : 'bg-transparent text-[var(--link-color)] hover:underline'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Render the selected form */}
      {isLogin ? <SignInForm /> : <SignUpForm />}
    </div>
  )
}
