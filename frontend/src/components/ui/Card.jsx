// Reusable card wrapper used across all dashboard sections
export const Card = ({ children, style = {} }) => (
  <div style={{ background: '#141414', border: '1px solid #242424', borderRadius: 16, padding: '22px 26px', ...style }}>
    {children}
  </div>
)

// Card title row with optional action button on the right
export const CardHeader = ({ title, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
    <p style={{ fontSize: 17, fontWeight: 700, color: '#f0f0f0', margin: 0 }}>{title}</p>
    {action}
  </div>
)

// Shown when a section has no data yet
export const EmptyState = ({ text }) => (
  <div style={{ textAlign: 'center', padding: '32px 0' }}>
    <p style={{ fontSize: 14, color: '#444', margin: 0 }}>{text}</p>
  </div>
)
