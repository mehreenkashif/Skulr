import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/authService'

const ax = authService.authAxios

// Converts analysis response into skill bar data
export const buildAllSkillBars = (analysis) => {
  if (!analysis) return []
  const matched = new Set(analysis.knn.matched_skills.map(s => s.toLowerCase()))
  return analysis.job_skills.map((skill, i) => {
    const isMatched = matched.has(skill.toLowerCase())
    const f = 1 - (i / analysis.job_skills.length) * 0.25
    return { name: skill, pct: isMatched ? Math.round(88 * f + 8) : Math.round(12 * f), matched: isMatched }
  })
}

// All dashboard state and API logic lives here
// Dashboard.jsx stays clean — just renders UI
export function useDashboard() {
  const navigate = useNavigate()

  const [user,           setUser]           = useState(null)
  const [targetRole,     setTargetRole]     = useState('')
  const [analysis,       setAnalysis]       = useState(null)
  const [gapsData,       setGapsData]       = useState(null)
  const [roadmap,        setRoadmap]        = useState(null)
  const [history,        setHistory]        = useState([])
  const [logs,           setLogs]           = useState([])
  const [clusters,       setClusters]       = useState([])
  const [logEntry,       setLogEntry]       = useState('')
  const [learnedSet,     setLearnedSet]     = useState(new Set())
  const [active,         setActive]         = useState(0)
  const [loading,        setLoading]        = useState(false)
  const [uploading,      setUploading]      = useState(false)
  const [logSaving,      setLogSaving]      = useState(false)
  const [marking,        setMarking]        = useState(null)
  const [roadmapLoading, setRoadmapLoading] = useState(false)
  const [error,          setError]          = useState('')

  // Load user, score history and logs on mount
  useEffect(() => {
    ax.get('/auth/me')
      .then(r => { setUser(r.data.user); if (r.data.user.target_role) setTargetRole(r.data.user.target_role) })
      .catch(() => navigate('/login'))
    ax.get('/ml/score-history').then(r => setHistory(r.data.history || [])).catch(() => {})
    ax.get('/ml/learning/logs').then(r => setLogs(r.data.logs || [])).catch(() => {})
  }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true); setError('')
    try {
      const form = new FormData(); form.append('resume', file)
      await ax.post('/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      if (targetRole) await runAnalysis()
    } catch { setError('Resume upload failed. Make sure it is a PDF.') }
    finally { setUploading(false); e.target.value = '' }
  }

  const runAnalysis = async () => {
    if (!targetRole.trim()) { setError('Enter a target role before analyzing.'); return }
    setLoading(true); setError('')
    try {
      // Seed job skills cache first — /ml/analyze returns 400 without this
      await ax.post('/gemini/job-skills', { role: targetRole })

      const [a, g] = await Promise.all([
        ax.post('/ml/analyze',        { target_role: targetRole }),
        ax.post('/ml/skill-priority', { target_role: targetRole }),
      ])
      setAnalysis(a.data); setGapsData(g.data)
      const h = await ax.get('/ml/score-history')
      setHistory(h.data.history || [])
    } catch (err) {
      const msg = err?.response?.data?.error || ''
      setError(msg || 'Analysis failed. Upload a resume first, then try again.')
    }
    finally { setLoading(false) }
  }

  const markLearned = async (skill) => {
    setMarking(skill)
    try {
      await ax.post('/resume/add-skill', { skill })
      setLearnedSet(prev => new Set([...prev, skill.toLowerCase()]))
      await runAnalysis()
    } catch { setError(`Failed to mark ${skill} as learned.`) }
    finally { setMarking(null) }
  }

  const generateRoadmap = async () => {
    setRoadmapLoading(true); setError('')
    try {
      const r = await ax.post('/gemini/roadmap', { target_role: targetRole })
      setRoadmap(r.data)
    } catch { setError('Failed to generate roadmap. Run analysis first.') }
    finally { setRoadmapLoading(false) }
  }

  const submitLog = async () => {
    if (!logEntry.trim()) return
    setLogSaving(true)
    try {
      await ax.post('/ml/learning/log', { entry: logEntry })
      setLogEntry('')
      const [l, c] = await Promise.all([ax.get('/ml/learning/logs'), ax.post('/ml/cluster-logs')])
      setLogs(l.data.logs || [])
      setClusters(c.data.clusters || [])
    } catch { setError('Failed to save log entry.') }
    finally { setLogSaving(false) }
  }

  const logout = () => { authService.logout(); navigate('/login') }

  return {
    // State
    user, targetRole, setTargetRole, analysis, gapsData, roadmap,
    history, logs, clusters, logEntry, setLogEntry, learnedSet,
    active, setActive, loading, uploading, logSaving, marking,
    roadmapLoading, error,
    // Actions
    handleUpload, runAnalysis, markLearned, generateRoadmap, submitLog, logout,
    // Derived
    initials:    user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??',
    allBars:     buildAllSkillBars(analysis),
    skillBars:   buildAllSkillBars(analysis).slice(0, 7),
    allGaps:     gapsData?.ranked_gaps || [],
    gaps:        (gapsData?.ranked_gaps || []).slice(0, 5),
    score:       analysis?.readiness?.readiness_score,
    hireProb:    analysis?.knn?.hire_probability_knn,
    matched:     analysis?.knn?.total_matched,
    total:       analysis?.knn?.total_required,
    gapCount:    analysis?.knn?.total_missing,
    interp:      analysis?.readiness?.interpretation,
    bonusSkills: analysis?.knn?.bonus_skills || [],
    chartData:   (history || []).map((h, i) => ({ name: `#${i + 1}`, score: h.score, role: h.role })),
  }
}