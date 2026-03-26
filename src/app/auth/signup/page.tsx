'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserRole } from '@/types'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('founder')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Update user role
      await supabase
        .from('users')
        .update({ name, role })
        .eq('id', data.user.id)

      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogleSignup = async () => {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    })
    if (authError) setError(authError.message)
  }

  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: 'founder', label: 'Founder', description: 'Submit and manage your startup deal' },
    { value: 'scout', label: 'Scout', description: 'Source and refer startup opportunities' },
  ]

  return (
    <div className="min-h-screen bg-hero-dark flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">
              Hero <span className="text-hero-purple">Deal Vault</span>
            </h1>
          </Link>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        <div className="glass-card p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-3">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    role === r.value
                      ? 'border-hero-purple bg-hero-purple/10 text-white'
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className="font-medium text-sm">{r.label}</div>
                  <div className="text-xs mt-1 opacity-70">{r.description}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 rounded-lg px-4 py-3 font-medium hover:bg-gray-100 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-hero-dark-card text-gray-400">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hero-purple focus:border-transparent"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hero-purple focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-hero-purple focus:border-transparent"
                placeholder="Create a password (min 6 characters)"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-hero-gradient text-white rounded-lg px-4 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-hero-purple hover:text-hero-purple-light">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
