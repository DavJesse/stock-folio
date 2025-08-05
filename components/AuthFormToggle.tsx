'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import SignInForm from './SignInForm'
import SignUpForm from './SignUpForm'
import Cookies from 'js-cookie'

/**
 * AuthFormToggle toggles between SignIn and SignUp forms.
 * If a token is found in cookies, user is redirected to the dashboard.
 */
export default function AuthFormToggle() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      router.push('/dashboard') // redirect if already authenticated
    }
  }, [router])

  return (
    <div
      className="mx-auto p-6 rounded-lg shadow-lg bg-white/5 backdrop-blur-md border border-white/10 text-white w-full elegant-scrollbar"
      style={{ 
        maxWidth: '350px', 
        height: '540px',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >

      {/* Logo */}
      <div className="flex justify-center items-center mb-6 mt-2">
        <Image
          src="/logo/auth-logo.png"
          alt="Auth Logo"
          width={120}
          height={96}
          className="object-contain h-auto"
          priority
        />
      </div>
      
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
