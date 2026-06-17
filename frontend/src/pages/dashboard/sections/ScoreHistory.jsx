import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, EmptyState } from '../../../components/ui/Card'

export default function ScoreHistory({ chartData }) {
  return (
    <Card>
      <CardHeader title="Score History" />
      {chartData.length === 0 ? <EmptyState text="Run analysis a few times to see your progress" /> : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" stroke="#333" tick={{ fill: '#555', fontSize: 12 }} />
            <YAxis domain={[0, 100]} stroke="#333" tick={{ fill: '#555', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10, color: '#f0f0f0' }}
              formatter={(v, _, p) => [`${v}%`, p.payload.role]}
            />
            <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
