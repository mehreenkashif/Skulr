import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../services/authService'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>

        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '72px', fontWeight: 900, letterSpacing: '-4px', color: '#f0f0f0', lineHeight: 1, margin: 0 }}>
            skul<span style={{ color: '#10b981' }}>r</span>
          </h1>
          <p style={{ marginTop: '10px', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', color: '#6b6b6b', fontWeight: 600 }}>
            Skill Radar · Career Intelligence
          </p>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#6b6b6b', fontWeight: 600, marginBottom: '10px' }}>
            Welcome back
          </p>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-1px', margin: '0 0 10px' }}>
            Sign in to Skulr
          </h2>
          <p style={{ fontSize: '16px', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
            Pick up right where you left off
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: '24px', padding: '14px 16px', borderRadius: '10px', background: '#1f0a0a', border: '1px solid #7f1d1d', color: '#fca5a5', fontSize: '14px', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '12px' }}>
              Email address
            </label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="ali@example.com" required
              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1.5px solid #2e2e2e', color: '#f0f0f0', fontSize: '17px', padding: '0 0 14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#a1a1aa', marginBottom: '12px' }}>
              Password
            </label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="Your password" required
              style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1.5px solid #2e2e2e', color: '#f0f0f0', fontSize: '17px', padding: '0 0 14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="button" onClick={handleSubmit} disabled={loading}
            style={{ background: '#10b981', border: 'none', borderRadius: '100px', padding: '16px 24px', fontSize: '15px', fontWeight: 800, color: '#000', cursor: 'pointer', opacity: loading ? 0.6 : 1, marginTop: '4px', letterSpacing: '0.3px' }}
          >
            {loading ? 'Signing in...' : 'Continue →'}
          </button>
        </div>

        <p style={{ marginTop: '32px', fontSize: '15px', textAlign: 'center', color: '#6b6b6b' }}>
          New here?{' '}
          <Link to="/register" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}