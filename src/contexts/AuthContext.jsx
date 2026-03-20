import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api.js'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me')
      .then(data => setUser(data.data))
      .catch(() => {
        // Auto-login with default user
        api.post('/auth/login', { email: 'user@claude.ai', name: 'User' })
          .then(data => setUser(data.data))
          .catch(() => setUser({ id: 1, name: 'User', email: 'user@claude.ai' }))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
