'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Invite } from '@/types'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Building2 } from 'lucide-react'

export default function InviteAcceptPage() {
  const { token } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [invite, setInvite] = useState<Invite | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInvite = async () => {
      const { data } = await supabase
        .from('invites')
        .select('*')
        .eq('token', token)
        .single()

      if (data) {
        setInvite(data as Invite)
      } else {
        setError('Invite not found or has expired.')
      }
      setLoading(false)
    }

    if (token) fetchInvite()
  }, [token, supabase])

  const handleAccept = async () => {
    if (!user || !invite) return
    setAccepting(true)

    // Update invite status
    await supabase
      .from('invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invite.id)

    // Link the deal to this founder
    if (invite.deal_id) {
      await supabase
        .from('deals')
        .update({ founder_id: user.id })
        .eq('id', invite.deal_id)
    }

    setAccepting(false)

    if (invite.deal_id) {
      router.push(`/deals/${invite.deal_id}/edit`)
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-hero-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-hero-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-hero-dark flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Invalid Invite</h2>
          <p className="text-gray-400 mb-6">{error || 'This invite link is not valid.'}</p>
          <Link href="/auth/signup">
            <Button>Sign Up Instead</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (invite.status === 'accepted') {
    return (
      <div className="min-h-screen bg-hero-dark flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Already Accepted</h2>
          <p className="text-gray-400 mb-6">This invite has already been accepted.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hero-dark flex items-center justify-center px-4">
      <div className="glass-card p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-hero-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-hero-purple-light" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            You&apos;ve Been Invited
          </h1>
          <p className="text-gray-400">
            A scout has invited you to complete a deal for{' '}
            <span className="text-white font-medium">{invite.startup_name || 'a startup'}</span>
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-400 space-y-2">
            <div className="flex justify-between">
              <span>Startup</span>
              <span className="text-white font-medium">{invite.startup_name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Invited</span>
              <span className="text-white">{new Date(invite.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {user ? (
          <Button className="w-full" onClick={handleAccept} disabled={accepting}>
            {accepting ? 'Accepting...' : 'Accept Invite & Complete Deal'}
          </Button>
        ) : (
          <div className="space-y-3">
            <Link href={`/auth/signup?invite=${token}`}>
              <Button className="w-full">Sign Up to Accept</Button>
            </Link>
            <Link href={`/auth/login?invite=${token}`}>
              <Button variant="outline" className="w-full text-gray-300">
                Already have an account? Sign In
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
