'use client'

import Link from 'next/link'
import { ArrowRight, Shield, BarChart3, Share2, Users, Zap, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-hero-dark text-white overflow-hidden">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Hero <span className="text-hero-purple">Deal Vault</span>
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-hero-gradient text-white text-sm px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center relative">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-hero-purple/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8">
            <Zap size={14} className="text-hero-purple" />
            Built for African Venture
          </div>

          <h2 className="text-5xl md:text-6xl font-bold leading-tight max-w-3xl mx-auto">
            Turn Startups into{' '}
            <span className="text-transparent bg-clip-text bg-hero-gradient">
              Investor-Ready
            </span>{' '}
            Opportunities
          </h2>

          <p className="text-lg text-gray-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            Hero Deal Vault helps founders and scouts create structured, investor-grade deal cards
            that move through Hero Fund&apos;s screening, preparation, and distribution workflow.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/auth/signup"
              className="bg-hero-gradient text-white px-8 py-3.5 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-base"
            >
              Create Your Deal Card <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/login"
              className="glass-card px-8 py-3.5 rounded-xl font-medium text-gray-300 hover:text-white transition-colors text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold">
            Not Just a Form.{' '}
            <span className="text-hero-purple">A Deal Readiness Engine.</span>
          </h3>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">
            Package your startup properly, track your raise journey, and get distribution-ready.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: 'Structured Deal Cards',
              description:
                'Build comprehensive, investor-grade deal profiles with guided sections covering team, market, traction, and capital.',
            },
            {
              icon: BarChart3,
              title: 'Raise Journey Progress',
              description:
                'Track your deal readiness with real-time completion scoring. Know exactly where you stand and what\'s missing.',
            },
            {
              icon: Share2,
              title: 'Distribution Ready',
              description:
                'Generate PDF deal cards, investor email teasers, WhatsApp intros, and shareable public deal pages.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass-card p-8 hover:border-hero-purple/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-hero-purple/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-hero-purple/20 transition-colors">
                <feature.icon size={24} className="text-hero-purple" />
              </div>
              <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold">How It Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Sign Up', desc: 'Create your account as a Founder or Scout' },
            { step: '02', title: 'Build Your Deal', desc: 'Fill in structured sections at your own pace' },
            { step: '03', title: 'Track Progress', desc: 'See your deal readiness score improve in real-time' },
            { step: '04', title: 'Get Distributed', desc: 'Hero prepares and shares your deal with investors' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="text-4xl font-bold text-hero-purple/30 mb-3">{item.step}</div>
              <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles Section */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <Users size={24} className="text-hero-purple" />
              <h4 className="text-xl font-bold">For Founders</h4>
            </div>
            <ul className="space-y-3">
              {[
                'Package your startup for investor review',
                'Track your raise journey progress',
                'Get transparency on deal status',
                'Download and share deal assets',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                  <CheckCircle size={16} className="text-hero-purple mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <Zap size={24} className="text-hero-purple" />
              <h4 className="text-xl font-bold">For Scouts</h4>
            </div>
            <ul className="space-y-3">
              {[
                'Source and refer startup opportunities',
                'Create deals or invite founders directly',
                'Track founder completion and deal status',
                'Build your sourcing track record',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-300 text-sm">
                  <CheckCircle size={16} className="text-hero-purple mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24 text-center">
        <div className="glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-gradient opacity-5" />
          <div className="relative">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Join Hero Deal Vault and start building your investor-ready deal card today.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-hero-gradient text-white px-8 py-3.5 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Create Your Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Hero <span className="text-hero-purple">Deal Vault</span> by Hero Fund
          </p>
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Hero Fund. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
