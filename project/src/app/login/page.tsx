'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock } from 'lucide-react'
import { login } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()

  // form field state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // error message shown below the form on failed login
  const [error, setError] = useState('')

  // disables the button while the API call is in progress
  const [loading, setLoading] = useState(false)

  // handles form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // calls POST /api/auth/login, saves user to localStorage on success
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#111113] flex items-center justify-center">
      <div className="w-full max-w-[360px] flex flex-col items-center gap-6">

        {/* title */}
        <h1 className="font-barlow text-white text-4xl font-normal tracking-widest uppercase mb-2">
          Welcome Back!
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

          {/* email input */}
          <div className="flex items-center gap-3 bg-[#1c1c1e] border border-white/20 rounded px-4 h-[60px]">
            <User size={18} className="text-white/50 shrink-0" />
            <input
              type="email"
              placeholder="USERNAME"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-transparent flex-1 text-white placeholder:text-white/40 font-montserrat font-light text-sm outline-none tracking-widest"
              required
            />
          </div>

          {/* password input */}
          <div className="flex items-center gap-3 bg-[#1c1c1e] border border-white/20 rounded px-4 h-[60px]">
            <Lock size={18} className="text-white/50 shrink-0" />
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-transparent flex-1 text-white placeholder:text-white/40 font-montserrat font-light text-sm outline-none tracking-widest"
              required
            />
          </div>

          {/* error message */}
          {error && (
            <p className="text-red-400 text-sm font-montserrat text-center">{error}</p>
          )}

          {/* login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[60px] bg-white text-blue-700 font-montserrat font-semibold tracking-widest uppercase text-sm hover:bg-white/90 transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>

          {/* forgot password - static, no functionality needed */}
          <p className="text-white/60 font-montserrat font-medium text-sm text-right cursor-default">
            Forgot password?
          </p>

        </form>
      </div>
    </main>
  )
}
