import { Card, CardHeader, EmptyState } from '../../../components/ui/Card'
import { I } from '../../../components/icons/Icons'
import { CLUSTER_COLORS } from '../../../constants/dashboard'

export default function LearningLog({ logs, clusters, logEntry, setLogEntry, logSaving, onSubmit }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Card>
        <CardHeader title="Learning Log" />
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <input
            value={logEntry}
            onChange={e => setLogEntry(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSubmit()}
            placeholder="What did you learn today?"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 13, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0f0f0', outline: 'none' }}
          />
          <button onClick={onSubmit} disabled={logSaving} style={{ padding: '10px 16px', borderRadius: 10, background: '#10b981', border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <I.Send /> {logSaving ? '...' : 'Log'}
          </button>
        </div>
        {logs.length === 0 ? <EmptyState text="No entries yet — log something!" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
            {logs.map((l, i) => (
              <div key={i} style={{ padding: '10px 14px', background: '#1a1a1a', borderRadius: 10, border: '1px solid #242424' }}>
                <p style={{ fontSize: 14, color: '#e4e4e7', margin: '0 0 4px' }}>{l.entry}</p>
                <p style={{ fontSize: 11, color: '#555', margin: 0 }}>{new Date(l.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <CardHeader title="Topic Clusters" />
        {clusters.length === 0 ? <EmptyState text="Add logs to see topic clusters" /> :
          clusters.map((c, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: CLUSTER_COLORS[i % CLUSTER_COLORS.length] }}>{c.label}</span>
                <span style={{ fontSize: 12, color: '#555' }}>{c.entries?.length || 0} entries</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(c.entries || []).slice(0, 3).map((e, j) => (
                  <span key={j} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#a1a1aa' }}>{e.entry}</span>
                ))}
              </div>
            </div>
          ))}
      </Card>
    </div>
  )
}
