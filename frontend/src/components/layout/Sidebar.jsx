import { I } from '../icons/Icons'
import { NAV } from '../../constants/dashboard'

// Map iconKey strings to actual icon components
const ICON_MAP = {
  Grid: <I.Grid />, Activity: <I.Activity />, Alert: <I.Alert />,
  Map: <I.Map />, Building: <I.Building />, Book: <I.Book />, Bar: <I.Bar />,
}

const NavItem = ({ item, idx, active, setActive }) => {
  const on = active === idx
  return (
    <button onClick={() => setActive(idx)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: on ? 600 : 400, textAlign: 'left', marginBottom: 2, transition: 'all .15s', color: on ? '#fff' : '#6b6b6b', background: on ? '#10b98120' : 'transparent' }}>
      <span style={{ color: on ? '#10b981' : '#3f3f46', flexShrink: 0, display: 'flex' }}>{ICON_MAP[item.iconKey]}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />}
    </button>
  )
}

export default function Sidebar({ active, setActive, user, targetRole, initials, onLogout }) {
  return (
    <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#0f0f0f', borderRight: '1px solid #1e1e1e' }}>
      <div style={{ padding: '26px 22px 20px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-2px', color: '#f0f0f0', margin: 0, lineHeight: 1 }}>
          skul<span style={{ color: '#10b981' }}>r</span>
        </h1>
        <p style={{ fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#3a3a3a', fontWeight: 700, margin: '6px 0 0' }}>Skill Radar</p>
      </div>
      <nav style={{ flex: 1, padding: '0 10px', overflowY: 'auto' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#333', padding: '10px 14px 8px' }}>Main</p>
        {NAV.filter(n => n.section === 'main').map((item, i) => <NavItem key={i} item={item} idx={i} active={active} setActive={setActive} />)}
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#333', padding: '16px 14px 8px' }}>Track</p>
        {NAV.filter(n => n.section === 'track').map((item, i) => <NavItem key={i + 5} item={item} idx={i + 5} active={active} setActive={setActive} />)}
      </nav>
      <div style={{ padding: '14px 14px 18px', borderTop: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#10b98122', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{initials}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || '...'}</p>
            <p style={{ fontSize: 11, color: '#555', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{targetRole || 'No role set'}</p>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
            <I.Settings />
          </button>
        </div>
      </div>
    </div>
  )
}