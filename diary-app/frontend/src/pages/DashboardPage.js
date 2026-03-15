import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { getDashboardData, getMoodTrend } from '../utils/mockApi';
import { MOOD_CONFIG, CHART_COLORS, formatShortDate } from '../utils/constants';
import MoodBadge from '../components/MoodBadge';
import { useToast } from '../hooks/useToast';

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e8e6e0',
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6, color: '#1a1916' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
          {MOOD_CONFIG[p.dataKey]?.emoji} {p.dataKey}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [trendDays, setTrendDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [dash, trend] = await Promise.all([
          getDashboardData(),
          getMoodTrend(trendDays),
        ]);
        setData(dash);
        setTrendData(trend);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [trendDays]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-spinner">
          <div className="spinner" /> Loading dashboard...
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { totalEntries, moodDistribution, mostCommonMood, weeklyTrend } = data;
  const moodCfg = mostCommonMood ? MOOD_CONFIG[mostCommonMood] : null;

  // Pie chart data
  const pieData = moodDistribution.map((m) => ({
    name: m.mood,
    value: m.count,
    color: CHART_COLORS[m.mood],
  }));

  // Weekly bar data
  const weeklyBarData = weeklyTrend.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));

  // Trend line data
  const trendLineData = trendData.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
    total: Object.values(d).reduce((s, v) => (typeof v === 'number' ? s + v : s), 0),
  }));

  const MOODS_ORDER = ['Happy', 'Excited', 'Neutral', 'Sad', 'Stressed'];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your mood insights at a glance</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/new')}>
          ✏️ New Entry
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value">{totalEntries}</div>
          <div className="stat-sub">diary notes written</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Most Common Mood</div>
          <div className="stat-value" style={{ fontSize: 32 }}>
            {moodCfg ? moodCfg.emoji : '—'}
          </div>
          <div className="stat-sub">
            {mostCommonMood ? (
              <MoodBadge mood={mostCommonMood} size="sm" />
            ) : 'No data yet'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">This Week</div>
          <div className="stat-value">
            {weeklyTrend.reduce((s, d) =>
              s + Object.entries(d)
                .filter(([k]) => k !== 'date')
                .reduce((a, [, v]) => a + (v || 0), 0), 0)}
          </div>
          <div className="stat-sub">entries in the last 7 days</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Mood Variety</div>
          <div className="stat-value">{moodDistribution.length}</div>
          <div className="stat-sub">different moods recorded</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="chart-grid">
        {/* Pie Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Mood Distribution</span>
          </div>
          <div className="card-body">
            {pieData.length === 0 ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="empty-state-icon">📊</div>
                <p>No mood data yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [`${v} entries`, n]}
                      contentStyle={{ borderRadius: 10, fontSize: 13 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 8 }}>
                  {pieData.map((d) => (
                    <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b6860' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, display: 'inline-block' }} />
                      {MOOD_CONFIG[d.name].emoji} {d.name} ({moodDistribution.find(m => m.mood === d.name)?.percentage ?? 0}%)
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Weekly Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Weekly Mood Trend</span>
            <span style={{ fontSize: 12, color: '#9b9890' }}>Last 7 days</span>
          </div>
          <div className="card-body">
            {weeklyBarData.every((d) =>
              MOODS_ORDER.every((m) => !d[m])
            ) ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="empty-state-icon">📅</div>
                <p>No entries this week</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9b9890' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9b9890' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {MOODS_ORDER.map((mood) => (
                    <Bar key={mood} dataKey={mood} stackId="a" fill={CHART_COLORS[mood]} radius={mood === 'Stressed' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Mood Trend Over Time */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Mood Trend Over Time</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                className={`filter-chip${trendDays === d ? ' active' : ''}`}
                style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={() => setTrendDays(d)}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          {trendLineData.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>
              <div className="empty-state-icon">📈</div>
              <p>No data for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendLineData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9b9890' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9b9890' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                {MOODS_ORDER.map((mood) => (
                  <Line
                    key={mood}
                    type="monotone"
                    dataKey={mood}
                    stroke={CHART_COLORS[mood]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: CHART_COLORS[mood] }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 12 }}>
            {MOODS_ORDER.map((mood) => (
              <span key={mood} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b6860' }}>
                <span style={{ width: 16, height: 3, borderRadius: 2, background: CHART_COLORS[mood], display: 'inline-block' }} />
                {MOOD_CONFIG[mood].emoji} {mood}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Mood Breakdown</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {moodDistribution.length === 0 ? (
            <div className="empty-state" style={{ padding: 32 }}>No entries yet.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8f7f4' }}>
                  <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 500, color: '#6b6860', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mood</th>
                  <th style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 500, color: '#6b6860', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entries</th>
                  <th style={{ padding: '10px 20px', textAlign: 'right', fontWeight: 500, color: '#6b6860', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Share</th>
                  <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 500, color: '#6b6860', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {moodDistribution.map((m, i) => {
                  const cfg = MOOD_CONFIG[m.mood];
                  return (
                    <tr key={m.mood} style={{ borderTop: i > 0 ? '1px solid #f0ede8' : 'none' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <MoodBadge mood={m.mood} size="sm" />
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600 }}>
                        {m.count}
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', color: '#6b6860' }}>
                        {m.percentage}%
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ background: '#f0ede8', borderRadius: 4, height: 6, width: '100%', overflow: 'hidden' }}>
                          <div style={{
                            width: `${m.percentage}%`,
                            height: '100%',
                            background: CHART_COLORS[m.mood],
                            borderRadius: 4,
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
