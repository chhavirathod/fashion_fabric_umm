import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/shared/Toast'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const toast = useToast()
  const navigationDone = useRef(false)  // Prevent multiple navigations

  useEffect(() => {
    // Skip if already navigated
    if (navigationDone.current) {
      console.log('🔵 [OAuthCallback] Navigation already done, skipping')
      return
    }

    console.log('🔵 [OAuthCallback] user:', user, 'loading:', loading)
    
    // Only navigate once user is loaded and not loading
    if (!loading && user) {
      navigationDone.current = true
      console.log('🟢 [OAuthCallback] User authenticated! Navigating to', user.role === 'admin' ? '/admin' : '/staff')
      toast(`Welcome, ${user.name}!`, 'success')
      navigate(user.role === 'admin' ? '/admin' : '/staff', { replace: true })
    } else if (!loading && !user) {
      navigationDone.current = true
      console.error('🔴 [OAuthCallback] Authentication failed - no user')
      toast('OAuth authentication failed. Please try again.', 'error')
      navigate('/login', { replace: true })
    } else {
      console.log('🔵 [OAuthCallback] Still loading, user:', user?.email || 'none')
    }
  }, [user, loading, navigate, toast])

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-12 w-12 mx-auto text-brand-600 mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-surface-300">Completing sign in...</p>
      </div>
    </div>
  )
}
