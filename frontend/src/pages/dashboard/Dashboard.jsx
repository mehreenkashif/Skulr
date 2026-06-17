import { useRef } from 'react'
import { useDashboard } from './useDashboard'
import Sidebar from '../../components/layout/Sidebar'
import Topbar  from '../../components/layout/Topbar'
import Overview      from './sections/Overview'
import SkillAnalysis from './sections/SkillAnalysis'
import SkillGaps     from './sections/SkillGaps'
import AIRoadmap     from './sections/AIRoadmap'
import CompanyMatch  from './sections/CompanyMatch'
import LearningLog   from './sections/LearningLog'
import ScoreHistory  from './sections/ScoreHistory'

export default function Dashboard() {
  const fileRef = useRef()
  const d = useDashboard()   // all state + actions from the hook

  // Map active nav index → section component
  const sections = {
    0: <Overview
          score={d.score} hireProb={d.hireProb} matched={d.matched} total={d.total}
          gapCount={d.gapCount} interp={d.interp} skillBars={d.skillBars} gaps={d.gaps}
          marking={d.marking} learnedSet={d.learnedSet} onMark={d.markLearned}
          onViewAll={() => d.setActive(1)} onFullList={() => d.setActive(2)}
        />,
    1: <SkillAnalysis allBars={d.allBars} analysis={d.analysis} bonusSkills={d.bonusSkills} />,
    2: <SkillGaps allGaps={d.allGaps} analysis={d.analysis} marking={d.marking} learnedSet={d.learnedSet} onMark={d.markLearned} />,
    3: <AIRoadmap roadmap={d.roadmap} roadmapLoading={d.roadmapLoading} onGenerate={d.generateRoadmap} />,
    4: <CompanyMatch targetRole={d.targetRole} />,
    5: <LearningLog logs={d.logs} clusters={d.clusters} logEntry={d.logEntry} setLogEntry={d.setLogEntry} logSaving={d.logSaving} onSubmit={d.submitLog} />,
    6: <ScoreHistory chartData={d.chartData} />,
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a0a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <Sidebar
        active={d.active} setActive={d.setActive}
        user={d.user} targetRole={d.targetRole} initials={d.initials}
        onLogout={d.logout}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0d0d0d' }}>
        <Topbar
          active={d.active} user={d.user} analysis={d.analysis}
          targetRole={d.targetRole} setTargetRole={d.setTargetRole}
          fileRef={fileRef} uploading={d.uploading} loading={d.loading}
          onUploadClick={d.handleUpload} onAnalyze={d.runAnalysis}
        />

        {/* Error banner */}
        {d.error && (
          <div style={{ margin: '16px 32px 0', padding: '12px 16px', borderRadius: 10, background: '#1f0a0a', border: '1px solid #7f1d1d', color: '#fca5a5', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
            {d.error}
          </div>
        )}

        {/* Active section */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {sections[d.active]}
        </div>
      </div>
    </div>
  )
}
