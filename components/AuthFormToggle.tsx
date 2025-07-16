import { useState } from 'react'
import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'

/**
 * AuthFormSwitcher toggles between SignIn and SignUp forms.
 * It manages the view state and displays appropriate forms with a toggle button.
 */
export default function AuthSwitcher() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="max-w-sm h-100 mx-auto mt-10 p-6 rounded-lg shadow-lg bg-white/5 backdrop-blur-md border border-white/10 text-white">
      
      {/* Tabs */}
      <div className="flex border-b border-white/20 mb-6">
        <button
          onClick={() => setIsLogin(true)}
          className={`w-1/2 py-2 text-center font-medium ${
            isLogin ? 'border-b-2 border-blue-400 text-white' : 'text-gray-400'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`w-1/2 py-2 text-center font-medium ${
            !isLogin ? 'border-b-2 border-blue-400 text-white' : 'text-gray-400'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Auth Form */}
      {isLogin ? <SignInForm /> : <SignUpForm />}
    </div>
  )
}
