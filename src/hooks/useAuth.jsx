import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthCtx = createContext({})
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(uid) {
    const { data } = await supabase.from('dt_profiles').select('*').eq('id', uid).single()
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
    // Essai update d'abord, puis insert si la ligne n'existe pas encore
    const { data: updated, error: updateErr } = await supabase
      .from('dt_profiles').update(updates).eq('id', user.id).select().single()
    if (updated) { setProfile(updated); return updated }
    // Pas de ligne existante → insert
    const { data: inserted } = await supabase
      .from('dt_profiles').insert({ id: user.id, ...updates }).select().single()
    if (inserted) setProfile(inserted)
    return inserted
  }

  return (
    <AuthCtx.Provider value={{ user, profile, loading, signUp, signIn, signOut, saveProfile }}>
      {children}
    </AuthCtx.Provider>
  )
}
