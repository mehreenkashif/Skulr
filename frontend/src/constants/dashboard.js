// Navigation config — icons are added in Sidebar.jsx to avoid JSX in .js files
export const NAV = [
  { label: 'Overview',       iconKey: 'Grid',     section: 'main'  },
  { label: 'Skill Analysis', iconKey: 'Activity', section: 'main'  },
  { label: 'Skill Gaps',     iconKey: 'Alert',    section: 'main'  },
  { label: 'AI Roadmap',     iconKey: 'Map',      section: 'main'  },
  { label: 'Company Match',  iconKey: 'Building', section: 'main', dot: true },
  { label: 'Learning Log',   iconKey: 'Book',     section: 'track' },
  { label: 'Score History',  iconKey: 'Bar',      section: 'track' },
]

export const GAP_STYLE = {
  High:   { dot: '#ef4444', badge: '#1f0a0a', text: '#ef4444', border: '#ef444430' },
  Medium: { dot: '#f59e0b', badge: '#1f1000', text: '#f59e0b', border: '#f59e0b30' },
  Low:    { dot: '#555',    badge: '#1a1a1a', text: '#666',    border: '#33333360' },
}

export const PHASE_COLORS   = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
export const CLUSTER_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']