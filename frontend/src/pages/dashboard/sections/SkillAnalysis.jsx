import { Card, CardHeader, EmptyState } from '../../../components/ui/Card'
import { SkillBar } from '../../../components/ui/SkillBar'

export default function SkillAnalysis({ allBars, analysis, bonusSkills }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Card>
        <CardHeader title="All Job Skills" />
        {allBars.length === 0 ? <EmptyState text="Run analysis to see skill coverage" /> :
          allBars.map((s, i) => <SkillBar key={i} s={s} i={i} total={allBars.length} />)}
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card>
          <CardHeader title="Skills You Have" />
          {!analysis ? <EmptyState text="Run analysis first" /> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {analysis.knn.matched_skills.map((s, i) => (
                <span key={i} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 13, fontWeight: 600, background: '#10b98115', border: '1px solid #10b98130', color: '#10b981' }}>{s}</span>
              ))}
              {analysis.knn.matched_skills.length === 0 && <p style={{ fontSize: 13, color: '#444', margin: 0 }}>No matching skills found</p>}
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="Bonus Skills" />
          {!analysis ? <EmptyState text="Run analysis first" /> : (
            <>
              <p style={{ fontSize: 12, color: '#555', margin: '0 0 14px' }}>Skills you have that aren't required — they can still impress employers.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {bonusSkills.slice(0, 12).map((s, i) => (
                  <span key={i} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 13, fontWeight: 500, background: '#3b82f615', border: '1px solid #3b82f630', color: '#3b82f6' }}>{s}</span>
                ))}
                {bonusSkills.length === 0 && <p style={{ fontSize: 13, color: '#444', margin: 0 }}>No bonus skills</p>}
              </div>
            </>
          )}
        </Card>
        <Card>
          <CardHeader title="KNN Match Stats" />
          {!analysis ? <EmptyState text="Run analysis first" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Cosine Similarity', value: `${analysis.knn.cosine_similarity}%` },
                { label: 'Hire Probability',  value: `${analysis.knn.hire_probability_knn}%` },
                { label: 'Skills Matched',    value: `${analysis.knn.total_matched} / ${analysis.knn.total_required}` },
                { label: 'Skills Missing',    value: String(analysis.knn.total_missing) },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#666' }}>{r.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7' }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
