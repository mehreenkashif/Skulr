import { Card, CardHeader, EmptyState } from '../../../components/ui/Card'
import { GapRow } from '../../../components/ui/GapRow'
import { GAP_STYLE } from '../../../constants/dashboard'

export default function SkillGaps({ allGaps, analysis, marking, learnedSet, onMark }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
      <Card>
        <CardHeader title={`All Skill Gaps ${allGaps.length > 0 ? `(${allGaps.length})` : ''}`} />
        {allGaps.length === 0 ? <EmptyState text="Run analysis to see your skill gaps" /> : (
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {allGaps.map((g, i) => <GapRow key={i} g={g} i={i} last={i === allGaps.length - 1} marking={marking} onMark={onMark} learnedSet={learnedSet} />)}
          </div>
        )}
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card>
          <CardHeader title="Gap Summary" />
          {allGaps.length === 0 ? <EmptyState text="Run analysis first" /> : (
            ['High', 'Medium', 'Low'].map(level => {
              const count = allGaps.filter(g => g.priority === level).length
              const st  = GAP_STYLE[level]
              const pct = Math.round((count / allGaps.length) * 100)
              return (
                <div key={level} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: st.text }}>{level} Priority</span>
                    <span style={{ fontSize: 13, color: '#555' }}>{count} skills</span>
                  </div>
                  <div style={{ background: '#1c1c1c', borderRadius: 100, height: 6 }}>
                    <div style={{ height: 6, borderRadius: 100, width: `${pct}%`, background: st.dot }} />
                  </div>
                </div>
              )
            })
          )}
        </Card>
        <Card>
          <CardHeader title="Readiness Breakdown" />
          {!analysis ? <EmptyState text="Run analysis first" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Readiness Score',  value: `${analysis.readiness.readiness_score}%` },
                { label: 'Skill Match Ratio',value: `${analysis.readiness.skill_match_ratio}%` },
                { label: 'Gap Penalty',      value: `${analysis.readiness.gap_penalty}%` },
                { label: 'Interpretation',   value: analysis.readiness.interpretation },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 13, color: '#666', flexShrink: 0 }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7', textAlign: 'right' }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
