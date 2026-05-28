import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

const NAV_MAIN = [
  { label: 'Overview', icon: '⬡' },
  { label: 'Skill Analysis', icon: '◈' },
  { label: 'Skill Gaps', icon: '◎' },
  { label: 'AI Roadmap', icon: '◐' },
  { label: 'Company Match', icon: '◉' },
]
const NAV_TRACK = [
  { label: 'Learning Log', icon: '◑' },
  { label: 'Score History', icon: '◷' },
]

const STAT_CARDS = [
  { label: 'Readiness Score', value: '—', sub: 'Run analysis first', note: '/100' },
  { label: 'Hire Probability', value: '—', sub: 'KNN match score', note: '%' },
  { label: 'Skills Matched', value: '—', sub: 'of required skills', note: '' },
  { label: 'Gaps Found', value: '—', sub: 'Prioritized by AI', note: '' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    authService.getMe()
      .then(data => setUser(data.user))
      .catch(() => navigate('/login'))
  }, [])

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'

  const NavItem = ({ item, index }) => {
    const isActive = active === index
    return (
      <button onClick={() => setActive(index)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
          padding: '11px 14px', borderRadius: '10px', fontSize: '14px',
          fontWeight: isActive ? 600 : 500, textAlign: 'left', border: 'none',
          cursor: 'pointer', transition: 'all 0.15s', marginBottom: '2px',
          color: isActive ? '#f0f0f0' : '#6b6b6b',
          background: isActive ? '#10b98112' : 'transparent',
          borderLeft: isActive ? '2.5px solid #10b981' : '2.5px solid transparent',
        }}
      >
        <span style={{ fontSize: '17px', color: isActive ? '#10b981' : '#c7c7cf', flexShrink: 0 }}>
          {item.icon}
        </span>
        {item.label}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a0a' }}>

      {/* ── Sidebar ── */}
      <div style={{ width: '224px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#111111', borderRight: '1px solid #1e1e1e' }}>

        {/* Logo */}
        <div style={{ padding: '28px 24px 20px' }}>
          <h1 style={{ fontSize: '50px', fontWeight: 900, letterSpacing: '-2px', color: '#f0f0f0', margin: 0, lineHeight: 1 }}>
            skul<span style={{ color: '#10b981' }}>r</span>
          </h1>
          <p style={{ fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#c7c7cf', fontWeight: 600, marginTop: '6px' }}>
            Skill Radar
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 12px', overflowY: 'auto' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#c7c7cf', padding: '12px 14px 8px' }}>
            Main
          </p>
          {NAV_MAIN.map((item, i) => <NavItem key={i} item={item} index={i} />)}

          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#c7c7cf', padding: '20px 14px 8px' }}>
            Track
          </p>
          {NAV_TRACK.map((item, i) => <NavItem key={i + 5} item={item} index={i + 5} />)}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 16px 20px', borderTop: '1px solid #1e1e1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#10b98122', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#f0f0f0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || '...'}
              </p>
              <p style={{ fontSize: '12px', color: '#6b6b6b', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.target_role || 'No role set'}
              </p>
            </div>
            <button
              onClick={() => { authService.logout(); navigate('/login') }}
              title="Sign out"
              style={{ flexShrink: 0, background: 'none', border: 'none', color: '#c7c7cf', cursor: 'pointer', fontSize: '14px', padding: '4px', borderRadius: '6px' }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0d0d0d' }}>

        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid #1e1e1e', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f0f0f0', margin: 0, letterSpacing: '-0.5px' }}>
              Dashboard Overview
            </h2>
            <p style={{ fontSize: '14px', color: '#6b6b6b', margin: '5px 0 0' }}>
              {user?.name ? `Welcome back, ${user.name}` : 'Loading...'} · Full analysis wired on Day 8
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, background: '#1a1a1a', border: '1px solid #2e2e2e', color: '#a1a1aa', cursor: 'pointer' }}>
              Upload Resume
            </button>
            <button style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 800, background: '#10b981', border: 'none', color: '#000', cursor: 'pointer' }}>
              Re-analyze →
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {STAT_CARDS.map((s, i) => (
              <div key={i} style={{ background: '#141414', border: '1px solid #2e2e2e', borderRadius: '14px', padding: '22px 20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6b6b6b', margin: '0 0 14px' }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '40px', fontWeight: 900, color: '#e8e8e8', letterSpacing: '-2px', margin: 0, lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', margin: '10px 0 0' }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Two column row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '24px' }}>

            {/* Skill coverage placeholder */}
            <div style={{ background: '#141414', border: '1px solid #2e2e2e', borderRadius: '14px', padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f0', margin: 0 }}>Skill Coverage</p>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
              </div>
              {['Python', 'Machine Learning', 'Numpy', 'PyTorch', 'SQL'].map((skill, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', color: '#a1a1aa', width: '120px', flexShrink: 0 }}>{skill}</span>
                  <div style={{ flex: 1, background: '#1e1e1e', borderRadius: '100px', height: '6px' }}>
                    <div style={{ height: '6px', borderRadius: '100px', background: i < 3 ? '#10b981' : '#2e2e2e', width: i === 0 ? '90%' : i === 1 ? '70%' : i === 2 ? '60%' : '15%', opacity: i < 3 ? 0.8 + i * 0.05 : 1 }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#6b6b6b', width: '36px', textAlign: 'right', flexShrink: 0 }}>
                    {i === 0 ? '90%' : i === 1 ? '70%' : i === 2 ? '60%' : i === 3 ? '15%' : '20%'}
                  </span>
                </div>
              ))}
            </div>

            {/* Gap priorities placeholder */}
            <div style={{ background: '#141414', border: '1px solid #2e2e2e', borderRadius: '14px', padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#f0f0f0', margin: 0 }}>Priority Gaps</p>
                <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, cursor: 'pointer' }}>Full list →</span>
              </div>
              {[
                { name: 'PyTorch', level: 'High', color: '#10b981', bg: '#10b98118' },
                { name: 'SQL', level: 'High', color: '#10b981', bg: '#10b98118' },
                { name: 'Docker', level: 'Medium', color: '#f59e0b', bg: '#f59e0b18' },
                { name: 'Spark', level: 'Low', color: '#6b6b6b', bg: '#2a2a2a' },
                { name: 'Airflow', level: 'Low', color: '#6b6b6b', bg: '#2a2a2a' },
              ].map((g, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '1px solid #1e1e1e' : 'none' }}>
                  <span style={{ fontSize: '14px', color: '#d4d4d8', fontWeight: 500 }}>{g.name}</span>
                  <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: g.bg, color: g.color }}>
                    {g.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Placeholder CTA */}
          <div style={{ background: '#141414', border: '1px solid #2e2e2e', borderRadius: '14px', padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#10b98115', border: '1px solid #10b98130', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '26px' }}>
              ⬡
            </div>
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#f0f0f0', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              Backend is live. UI is ready.
            </p>
            <p style={{ fontSize: '15px', color: '#a1a1aa', margin: 0 }}>
              Day 8 — skill bars, gap list, and score chart wired to real data from your Flask API.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}