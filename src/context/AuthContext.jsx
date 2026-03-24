import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [oauthLoading, setOAuthLoading] = useState(false)
  const [loadingUserId, setLoadingUserId] = useState(null)  // Track which userId is currently being loaded

  useEffect(() => {
    // Just check if session exists, don't load profile yet
    // The onAuthStateChange listener will handle profile loading
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Profile will be loaded by onAuthStateChange listener
      if (!session) {
        setLoading(false)
      }
    }).catch(err => {
      console.error('🔴 [AuthContext] getSession() error:', err)
      setLoading(false)
    })

    // Listen for login/logout events - THIS is where we load the profile
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Only load profile on INITIAL_SESSION - this is when RLS context is ready
      // Skip SIGNED_IN because it fires too early before session context is initialized
      if (_event === 'INITIAL_SESSION' && session) {
        await loadProfile(session.user.id)
        setOAuthLoading(false)
      }
      else if (_event === 'SIGNED_IN' && session) {
        // SIGNED_IN event - skipping profile load (will come from INITIAL_SESSION)
      }
      else if (!session) { 
        setUser(null)
        setLoading(false)
        setOAuthLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    // Skip if already loading this exact userId to prevent concurrent duplicate requests
    if (loadingUserId === userId) {
      return
    }
    
    setLoadingUserId(userId)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, assigned_hotel_id')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('🔴 [AuthContext] Profile load error:', error.message, error.code)
        setLoading(false)
        setLoadingUserId(null)
        return null
      }
      
      if (data) {
        setUser(data)
      }
      
      setLoading(false)
      setLoadingUserId(null)
      return data
      
    } catch (err) {
      console.error('🔴 [AuthContext] Profile load failed:', err.message)
      setLoading(false)
      setLoadingUserId(null)
      return null
    }
  }

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    const profile = await loadProfile(data.user.id)
    return profile
  }

  const loginWithGoogle = async () => {
    setOAuthLoading(true)
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`
      
      const response = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: redirectUrl,
          skipBrowserRedirect: false
        }
      })
      
      const { error } = response
      
      if (error) {
        console.error('🔴 [AuthContext] OAuth error from Supabase:', error)
        setOAuthLoading(false)
        throw new Error(error.message)
      }
      
      // Don't set oauthLoading to false here - let the redirect and onAuthStateChange handle it
    } catch (err) {
      console.error('🔴 [AuthContext] OAuth exception:', err.message)
      setOAuthLoading(false)
      throw err
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, oauthLoading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}