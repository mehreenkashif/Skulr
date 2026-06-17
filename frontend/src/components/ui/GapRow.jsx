import { I } from '../icons/Icons'
import { GAP_STYLE } from '../../constants/dashboard'

// Single skill gap row with priority badge and Mark as Learned button
export const GapRow = ({ g, i, last, marking, onMark, learnedSet }) => {
  const st      = GAP_STYLE[g.priority] || GAP_STYLE.Low
  const learned = learnedSet.has(g.skill.toLowerCase())
  const busy    = marking === g.skill

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: !last ? '1px solid #1c1c1c' : 'none', opacity: learned ? 0.5 : 1 }}>
      <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: learned ? '#10b981' : '#e4e4e7', margin: 0, textDecoration: learned ? 'line-through' : 'none' }}>{g.skill}</p>
        <p style={{ fontSize: 11, color: '#555', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.reason}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {!learned && (
          <button onClick={() => onMark(g.skill)} disabled={!!marking} style={{ padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, background: busy ? '#10b98120' : 'transparent', border: '1px solid #10b98140', color: '#10b981', cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {busy ? <I.Done /> : <I.Plus />} {busy ? 'Adding...' : 'Learned'}
          </button>
        )}
        {learned && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>✓ Added</span>}
        <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: st.badge, color: st.text, border: `1px solid ${st.border}`, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} />
          {g.priority.toUpperCase()}
        </span>
      </div>
    </div>
  )
}
