import { Card, CardHeader, EmptyState } from '../../../components/ui/Card'
import { SkillBar } from '../../../components/ui/SkillBar'
import { GapRow } from '../../../components/ui/GapRow'
import { I } from '../../../components/icons/Icons'

const StatCard = ({ icon, label, main, suffix, sub, trend }) => (
  <Card>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#10b98115', border: '1px solid #10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{icon}</div>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555', fontFamily: 'monospace', margin: '0 0 10px' }}>{label}</p>
    <p style={{ fontSize: 44, fontWeight: 900, color: '#e8e8e8', letterSpacing: '-2.5px', margin: 0, lineHeight: 1 }}>
      {main}
      {suffix && main !== '—' && <span style={{ fontSize: 22, fontWeight: 700, color: '#6b6b6b', letterSpacing: 0, marginLeft: 2 }}>{suffix}</span>}
    </p>
    {trend ? <p style={{ fontSize: 13, fontWeight: 600, color: '#10b981', margin: '10px 0 0' }}>↗ {trend}</p>
           : <p style={{ fontSize: 13, color: '#6b6b6b', margin: '10px 0 0' }}>{sub}</p>}
  </Card>
)

export default function Overview({ score, hireProb, matched, total, gapCount, interp, skillBars, gaps, marking, learnedSet, onMark, onViewAll, onFullList }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <StatCard icon={<I.Check />}  label="Readiness Score"  main={score    != null ? String(score)                : '—'} suffix="%" sub="Run analysis first" trend={score != null ? interp : null} />
        <StatCard icon={<I.Brief />}  label="Hire Probability" main={hireProb != null ? String(Math.round(hireProb)) : '—'} suffix="%" sub="KNN match score" />
        <StatCard icon={<I.Circle />} label="Skills Matched"   main={matched  != null ? String(matched)              : '—'} suffix={total != null ? `/${total}` : null} sub="of required skills" />
        <StatCard icon={<I.Target />} label="Gaps Found"       main={gapCount != null ? String(gapCount)             : '—'} sub="Prioritized by AI" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 14 }}>
        <Card>
          <CardHeader title="Skill Coverage" action={<button onClick={onViewAll} style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'transparent', border: '1px solid #2a2a2a', color: '#a1a1aa', cursor: 'pointer' }}>View all →</button>} />
          {skillBars.length === 0 ? <EmptyState text="Upload resume + run analysis to see skill coverage" /> :
            skillBars.map((s, i) => <SkillBar key={i} s={s} i={i} total={skillBars.length} />)}
        </Card>
        <Card>
          <CardHeader title="Priority Gaps" action={<button onClick={onFullList} style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'transparent', border: '1px solid #2a2a2a', color: '#a1a1aa', cursor: 'pointer' }}>Full list →</button>} />
          {gaps.length === 0 ? <EmptyState text="Run analysis to see your skill gaps" /> :
            gaps.map((g, i) => <GapRow key={i} g={g} i={i} last={i === gaps.length - 1} marking={marking} onMark={onMark} learnedSet={learnedSet} />)}
        </Card>
      </div>
    </>
  )
}
