import { Card, CardHeader, EmptyState } from '../../../components/ui/Card'
import { I } from '../../../components/icons/Icons'
import { PHASE_COLORS } from '../../../constants/dashboard'

export default function AIRoadmap({ roadmap, roadmapLoading, onGenerate }) {
  return (
    <Card>
      <CardHeader title="AI Roadmap" action={
        <button onClick={onGenerate} disabled={roadmapLoading} style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, background: roadmapLoading ? '#0d9669' : '#10b981', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: roadmapLoading ? 0.7 : 1 }}>
          <I.Spark /> {roadmapLoading ? 'Generating...' : 'Generate Roadmap'}
        </button>
      } />

      {!roadmap ? <EmptyState text="Click Generate Roadmap to get a personalized AI learning plan" /> : (
        <>
          {/* Summary bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, background: '#10b98112', border: '1px solid #10b98125' }}>
              <I.Clock /><span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>Total: {roadmap.total_duration}</span>
            </div>
            <div style={{ flex: 1, padding: '8px 16px', borderRadius: 10, background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
              <span style={{ fontSize: 13, color: '#a1a1aa' }}>💡 {roadmap.tip}</span>
            </div>
          </div>

          {/* Phase cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {roadmap.phases.map((phase, i) => {
              const color = PHASE_COLORS[i % PHASE_COLORS.length]
              return (
                <div key={i} style={{ background: '#1a1a1a', border: `1px solid ${color}25`, borderRadius: 14, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: color, color: '#000', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{phase.phase}</span>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', margin: 0 }}>{phase.title}</p>
                      </div>
                      <p style={{ fontSize: 12, color: '#555', margin: 0, paddingLeft: 30 }}>{phase.goal}</p>
                    </div>
                    <span style={{ fontSize: 11, color, fontWeight: 600, background: `${color}15`, border: `1px solid ${color}30`, padding: '3px 10px', borderRadius: 100, flexShrink: 0, marginLeft: 10 }}>{phase.duration}</span>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Skills</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {phase.skills.map((s, j) => <span key={j} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: `${color}15`, border: `1px solid ${color}30`, color, fontWeight: 600 }}>{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Resources</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {phase.resources.map((r, j) => (
                        <span key={j} style={{ fontSize: 12, color: '#6b6b6b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#444', flexShrink: 0 }} />{r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Card>
  )
}
