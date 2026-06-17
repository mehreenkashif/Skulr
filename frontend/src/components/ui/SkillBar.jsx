// Single skill bar row — used in Overview and Skill Analysis
export const SkillBar = ({ s, i, total }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: i < total - 1 ? 14 : 0 }}>
    <span style={{ fontSize: 13, color: '#b0b0b0', width: 150, flexShrink: 0 }}>{s.name}</span>
    <div style={{ flex: 1, background: '#1c1c1c', borderRadius: 100, height: 7, overflow: 'hidden' }}>
      <div style={{ height: 7, borderRadius: 100, width: `${s.pct}%`, background: s.matched ? '#10b981' : '#2a2a2a', transition: 'width .6s ease' }} />
    </div>
    <span style={{ fontSize: 12, fontWeight: 600, color: s.matched ? '#10b981' : '#444', width: 40, textAlign: 'right', flexShrink: 0 }}>
      {s.matched ? '✓' : `${s.pct}%`}
    </span>
  </div>
)
