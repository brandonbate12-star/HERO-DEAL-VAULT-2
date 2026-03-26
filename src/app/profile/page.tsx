'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Save, Check, User } from 'lucide-react'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    linkedin: '',
    organization: '',
    bio: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        linkedin: user.linkedin || '',
        organization: user.organization || '',
        bio: user.bio || '',
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    await supabase
      .from('users')
      .update({
        name: form.name,
        phone: form.phone,
        linkedin: form.linkedin,
        organization: form.organization,
        bio: form.bio,
      })
      .eq('id', user.id)

    await refreshUser()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
      </div>

      {/* Avatar & Role */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-hero-purple/10 rounded-full flex items-center justify-center">
            <span className="text-hero-purple text-2xl font-bold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user.name || 'User'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <Badge variant="purple" className="mt-1 capitalize">{user.role}</Badge>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={18} className="text-hero-purple" />
          Personal Information
        </h3>

        <div className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
          />

          <Input
            label="Email"
            value={user.email}
            disabled
            helperText="Email cannot be changed"
          />

          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+27 XX XXX XXXX"
          />

          <Input
            label="LinkedIn"
            value={form.linkedin}
            onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/your-profile"
          />

          <Input
            label="Organization"
            value={form.organization}
            onChange={(e) => setForm({ ...form, organization: e.target.value })}
            placeholder="Your company or organization"
          />

          <Textarea
            label="Bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="A short bio about yourself"
          />
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          {saved && (
            <span className="text-green-600 text-sm flex items-center gap-1">
              <Check size={14} /> Saved successfully
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
