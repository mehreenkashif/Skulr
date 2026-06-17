import { NAV } from '../../constants/dashboard'

// Upload and Re-analyze controls at the top of every page
export default function Topbar({ active, user, analysis, targetRole, setTargetRole, fileRef, uploading, loading, onUploadClick, onAnalyze }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 32px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f0f0f0', margin: 0, letterSpacing: '-1px' }}>{NAV[active].label}</h2>
        <p style={{ fontSize: 14, color: '#666', margin: '6px 0 0' }}>
          Welcome back, {user?.name || '...'} ·{' '}
          <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#555' }}>
            {analysis ? `Targeting: ${analysis.role}` : 'Upload resume + set role to analyze'}
          </span>
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={targetRole}
          onChange={e => setTargetRole(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onAnalyze()}
          placeholder="Target role (e.g. Data Scientist)"
          style={{ padding: '9px 14px', borderRadius: 10, fontSize: 13, background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f0f0f0', outline: 'none', width: 220 }}
        />
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={onUploadClick} />
        <button
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'transparent', border: '1px solid #2a2a2a', color: uploading ? '#555' : '#a1a1aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </button>
        <button
          onClick={onAnalyze}
          disabled={loading}
          style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 800, background: loading ? '#0d9669' : '#10b981', border: 'none', color: '#000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Analyzing...' : 'Re-analyze'}
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
        </button>
      </div>
    </div>
  )
}
