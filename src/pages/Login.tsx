import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const DEMO_ACCOUNTS = [
  { label: 'Ward Authority', email: 'ward17@nagarx.demo' },
  { label: 'City Admin', email: 'admin@nagarx.demo' },
  { label: 'Supervisor', email: 'supervisor@nagarx.demo' },
]

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // MOCK MODE: skip backend, just set a fake token and go
    if (USE_MOCK) {
      localStorage.setItem('nagarx_token', 'mock-token-demo')
      navigate('/dashboard')
      return
    }

    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('nagarx_token', data.token)
      navigate('/dashboard')
    } catch (err: unknown) {
      const apiErr = err as { message?: string }
      setError(apiErr?.message || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">NAGAR-X</h1>
          <p className="text-slate-500 text-sm mt-1">Civic Intelligence Platform</p>
          {USE_MOCK && (
            <p className="text-amber-400 text-xs mt-2 bg-amber-950 border border-amber-800 rounded-lg px-3 py-1.5">
              Mock mode — click any account below or just Sign In
            </p>
          )}
        </div>

        <form onSubmit={handleLogin} className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="ward17@nagarx.demo"
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 space-y-2">
          <p className="text-xs text-slate-600 text-center">Demo accounts</p>
          {DEMO_ACCOUNTS.map(a => (
            <button key={a.email}
              onClick={() => { setEmail(a.email); setPassword('demo1234'); if (USE_MOCK) { localStorage.setItem('nagarx_token', 'mock-token-demo'); navigate('/dashboard') } }}
              className="w-full text-left px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
              {a.label} — <span className="font-mono">{a.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
