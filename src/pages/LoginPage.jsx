import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/shared/Toast'
import { Ruler, Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react'

export default function LoginPage() {
  const { login, loginWithGoogle, oauthLoading } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('admin')

  const QUICK = {
    admin: { email: 'admin@fashionfabric.in', password: 'admin123' },
    staff: { email: 'staff@fashionfabric.in', password: 'staff123' },
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const session = await login(form.email, form.password)
      toast('Welcome back, ' + session.name + '!', 'success')
      navigate(session.role === 'admin' ? '/admin' : '/staff')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    console.log('🔵 [LoginPage] Google button clicked')
    console.log('🔵 [LoginPage] Calling loginWithGoogle()')
    await loginWithGoogle()
    console.log('🔵 [LoginPage] loginWithGoogle() returned, expecting redirect to Google')
    // OAuth will redirect, so don't need to do anything else
    toast('Redirecting to Google...', 'info')
  }

  const applyQuick = (r) => {
    setRole(r)
    setForm(QUICK[r])
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-surface-100 overflow-hidden fade-in">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700" />

          <div className="px-8 pt-8 pb-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center">
                <Ruler size={20} className="text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-surface-900 leading-tight">UMMS</p>
                <p className="text-xs text-surface-400">Uniform Measurement Management System</p>
              </div>
            </div>

            <h1 className="font-display font-bold text-2xl text-surface-900 mb-1">Sign in</h1>
            <p className="text-sm text-surface-500 mb-7">Internal platform for Fashion Fabric staff only.</p>

            {/* Quick role switcher (demo only) */}
            <div className="mb-6 p-3 rounded-xl bg-surface-50 border border-surface-200">
              <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Demo Quick Login</p>
              <div className="flex gap-2">
                {['admin', 'staff'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => applyQuick(r)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      role === r
                        ? r === 'admin' ? 'bg-brand-700 text-white' : 'bg-blue-600 text-white'
                        : 'bg-white border border-surface-200 text-surface-600 hover:border-surface-300'
                    }`}
                  >
                    {r === 'admin' ? '🔑 Admin' : '👤 Staff'}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="input pl-10"
                    placeholder="you@fashionfabric.in"
                    disabled={oauthLoading}
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                    disabled={oauthLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                    disabled={oauthLoading}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || oauthLoading}
                className="btn-primary w-full justify-center py-3 text-base mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-surface-200" />
              <span className="text-xs text-surface-400 font-medium">or</span>
              <div className="flex-1 h-px bg-surface-200" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading || oauthLoading}
              className="btn-secondary w-full justify-center py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Redirecting…
                </span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                  <span className="ml-1 text-xs text-surface-400 font-normal">(Phase 2)</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-surface-500 mt-5">
          Internal use only · Fashion Fabric · © 2026
        </p>
      </div>
    </div>
  )
}
