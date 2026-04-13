import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthCtx = createContext({})
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(uid) {
    const { data } = await supabase.from('dt_profiles').select('*').eq('id', uid).maybeSingle()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    }).catch(() => setLoading(false))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      await supabase.from('dt_profiles').upsert({ id: data.user.id, display_name: displayName, onboarding_complete: false })
    }
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
  }

  async function saveProfile(updates) {
    if (!user) return
    // UPDATE direct (la ligne existe toujours grâce au trigger dt_on_auth_user_created)
    const { data, error } = await supabase
      .from('dt_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) {
      console.error('[DayTalk] saveProfile UPDATE error:', error.message, error)
      // Fallback upsert au cas où la ligne n'existerait pas
      const { data: d2, error: e2 } = await supabase
        .from('dt_profiles')
        .upsert({ id: user.id, ...updates }, { onConflict: 'id' })
        .select()
        .single()
      if (e2) console.error('[DayTalk] saveProfile upsert fallback error:', e2.message, e2)
      if (d2) { setProfile(d2); return d2 }
      await loadProfile(user.id)
      return
    }
    // Mise à jour directe du contexte sans re-fetch
    if (data) setProfile(data)
    return data
  }

  return (
    <AuthCtx.Provider value={{ user, profile, loading, signUp, signIn, signOut, saveProfile }}>
      {children}
    </AuthCtx.Provider>
  )
}
