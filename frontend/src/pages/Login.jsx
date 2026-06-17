import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../services/authService'

export default function Login() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await authService.login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  const input = { width: '100%', padding: '0 0 12px', fontSize: 15, background: 'transparent', border: 'none', borderBottom: '1.5px solid #2e2e2e', color: '#f0f0f0', outline: 'none', marginBottom: 28, boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: 380 }}>
        <h1 style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-4px', color: '#f0f0f0', margin: '0 0 8px', lineHeight: 1 }}>
          skul<span style={{ color: '#10b981' }}>r</span>
        </h1>
        <p style={{ fontSize: 14, color: '#555', margin: '0 0 48px' }}>Your skill radar</p>

        {error && <p style={{ fontSize: 13, color: '#fca5a5', marginBottom: 20, padding: '10px 14px', background: '#1f0a0a', border: '1px solid #7f1d1d', borderRadius: 8 }}>{error}</p>}

        <form onSubmit={handle}>
          <input style={input} type="email"    placeholder="Email"    value={email}    onChange={e => setEmail(e.target.value)}    required />
          <input style={input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 100, fontSize: 15, fontWeight: 800, background: loading ? '#0d9669' : '#10b981', border: 'none', color: '#000', cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#555', marginTop: 24 }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  )
}
