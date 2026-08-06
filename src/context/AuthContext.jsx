import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import {
  authenticate,
  clearAuthSession,
  readAuthSession,
  registerUser,
  writeAuthSession,
} from '../data/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readAuthSession())
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, tone = 'success') => {
    setToast({ message, tone })
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const login = useCallback(
    (payload) => {
      const session = authenticate(payload)
      if (!session) {
        showToast('بيانات الدخول غير صحيحة', 'error')
        return false
      }
      writeAuthSession(session)
      setUser(session)
      showToast('تم تسجيل الدخول بنجاح', 'success')
      return true
    },
    [showToast],
  )

  const register = useCallback(
    (form) => {
      const result = registerUser(form)
      if (!result.ok) {
        showToast(result.message, 'error')
        return false
      }
      setUser(result.session)
      showToast('تم إنشاء الحساب بنجاح', 'success')
      return true
    },
    [showToast],
  )

  const logout = useCallback(() => {
    clearAuthSession()
    setUser(null)
    showToast('تم تسجيل الخروج', 'success')
  }, [showToast])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      toast,
    }),
    [user, login, register, logout, toast],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
