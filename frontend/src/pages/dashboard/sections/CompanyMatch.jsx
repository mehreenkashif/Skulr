import { useState } from 'react'
import { Card, CardHeader, EmptyState } from '../../../components/ui/Card'
import authService from '../../../services/authService'

const ax = authService.authAxios

export default function CompanyMatch({ targetRole }) {
  const [companies, setCompanies] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const fetchCompanies = async () => {
    setLoading(true); setError('')
    try {
      const r = await ax.post('/gemini/company-match', { target_role: targetRole })
      setCompanies(r.data.companies || [])
    } catch { setError('Failed to load company matches. Run analysis first.') }
    finally { setLoading(false) }
  }

  return (
    <Card>
      <CardHeader
        title="Company Match"
        action={
          <button onClick={fetchCompanies} disabled={loading} style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: loading ? '#0d9669' : '#10b981', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
            🏢 {loading ? 'Finding...' : 'Find Companies'}
          </button>
        }
      />
      {error && <p style={{ fontSize: 13, color: '#fca5a5', margin: '0 0 16px' }}>{error}</p>}
      {companies.length === 0 ? (
        <EmptyState text="Click Find Companies to see where people like you get hired" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {companies.map((c, i) => {
            const mc = c.match >= 85 ? '#10b981' : c.match >= 70 ? '#f59e0b' : '#6b7280'
            return (
              <div key={i} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', margin: '0 0 4px' }}>{c.name}</p>
                    <p style={{ fontSize: 12, color: '#555', margin: 0 }}>📍 {c.location}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <p style={{ fontSize: 22, fontWeight: 900, color: mc, margin: 0, letterSpacing: '-1px' }}>{c.match}%</p>
                    <p style={{ fontSize: 11, color: '#444', margin: 0 }}>match</p>
                  </div>
                </div>
                <div style={{ background: '#141414', borderRadius: 100, height: 5, marginBottom: 12 }}>
                  <div style={{ height: 5, borderRadius: 100, width: `${c.match}%`, background: mc, transition: 'width .6s ease' }} />
                </div>
                <p style={{ fontSize: 12, color: '#6b6b6b', margin: 0 }}>{c.reason}</p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
