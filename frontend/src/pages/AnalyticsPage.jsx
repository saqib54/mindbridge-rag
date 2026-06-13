import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  RadialLinearScale, PointElement, LineElement, Filler, ArcElement,
} from 'chart.js'
import { Bar, Radar, Doughnut } from 'react-chartjs-2'
import { BarChart2, Download, RefreshCw, MessageSquare, Shield, Clock, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import axios_instance from 'axios'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  RadialLinearScale, PointElement, LineElement, Filler, ArcElement,
)

const RISK_COLORS = {
  L0_NORMAL: '#22c55e',
  L1_STRESS: '#eab308',
  L2_DISTRESS: '#f97316',
  L3_CRISIS: '#ef4444',
  L4_MEDICAL: '#8b5cf6',
  L5_OUT_OF_SCOPE: '#6b7280',
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } },
    tooltip: {
      backgroundColor: '#1a1a2e',
      borderColor: 'rgba(99,102,241,0.3)',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
    },
  },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 5 },
  },
}

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#94a3b8' } },
  },
  scales: {
    r: {
      min: 0, max: 5, ticks: { stepSize: 1, color: '#475569' },
      grid: { color: 'rgba(255,255,255,0.08)' },
      pointLabels: { color: '#94a3b8', font: { size: 11 } },
    },
  },
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/analytics')
      setAnalytics(res.data)
    } catch {
      // Use demo data if backend not available
      setAnalytics(getDemoData())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnalytics() }, [])

  const handleExportResponses = () => {
    window.location.href = '/api/export/responses'
    toast.success('Downloading 6_model_responses.csv...')
  }

  const handleExportResponsesExcel = () => {
    window.location.href = '/api/export/responses/excel'
    toast.success('Downloading 6_model_responses.xlsx...')
  }

  const handleExportEvals = () => {
    window.location.href = '/api/export/evaluations'
    toast.success('Downloading 7_human_evaluation.csv...')
  }

  const handleExportEvalsExcel = () => {
    window.location.href = '/api/export/evaluations/excel'
    toast.success('Downloading 7_human_evaluation.xlsx...')
  }

  // ── Chart Data ─────────────────────────────────────────────────────────
  const metricLabels = ['Relevance', 'Helpfulness', 'Faithfulness', 'Safety', 'Clarity']

  const barData = analytics ? {
    labels: metricLabels,
    datasets: [
      {
        label: 'S1 Basic RAG',
        data: [
          analytics.s1_metrics.avg_relevance,
          analytics.s1_metrics.avg_helpfulness,
          analytics.s1_metrics.avg_faithfulness,
          analytics.s1_metrics.avg_safety,
          analytics.s1_metrics.avg_clarity,
        ],
        backgroundColor: 'rgba(59,130,246,0.6)',
        borderColor: 'rgba(59,130,246,0.9)',
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: 'S2 Safety-Aware RAG',
        data: [
          analytics.s2_metrics.avg_relevance,
          analytics.s2_metrics.avg_helpfulness,
          analytics.s2_metrics.avg_faithfulness,
          analytics.s2_metrics.avg_safety,
          analytics.s2_metrics.avg_clarity,
        ],
        backgroundColor: 'rgba(139,92,246,0.6)',
        borderColor: 'rgba(139,92,246,0.9)',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  } : null

  const radarData = analytics ? {
    labels: metricLabels,
    datasets: [
      {
        label: 'S1 Basic RAG',
        data: [
          analytics.s1_metrics.avg_relevance,
          analytics.s1_metrics.avg_helpfulness,
          analytics.s1_metrics.avg_faithfulness,
          analytics.s1_metrics.avg_safety,
          analytics.s1_metrics.avg_clarity,
        ],
        fill: true,
        backgroundColor: 'rgba(59,130,246,0.15)',
        borderColor: 'rgba(59,130,246,0.7)',
        pointBackgroundColor: 'rgba(59,130,246,0.9)',
      },
      {
        label: 'S2 Safety-Aware RAG',
        data: [
          analytics.s2_metrics.avg_relevance,
          analytics.s2_metrics.avg_helpfulness,
          analytics.s2_metrics.avg_faithfulness,
          analytics.s2_metrics.avg_safety,
          analytics.s2_metrics.avg_clarity,
        ],
        fill: true,
        backgroundColor: 'rgba(139,92,246,0.15)',
        borderColor: 'rgba(139,92,246,0.7)',
        pointBackgroundColor: 'rgba(139,92,246,0.9)',
      },
    ],
  } : null

  const riskDist = analytics?.risk_distribution || {}
  const doughnutData = {
    labels: Object.keys(riskDist),
    datasets: [{
      data: Object.values(riskDist),
      backgroundColor: Object.keys(riskDist).map(k => RISK_COLORS[k] || '#6b7280'),
      borderColor: 'rgba(15,15,26,0.8)',
      borderWidth: 3,
    }],
  }

  const summaryCards = analytics ? [
    {
      label: 'Total Questions', value: analytics.total_questions,
      icon: MessageSquare, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)',
    },
    {
      label: 'Total Evaluations', value: analytics.total_evaluations,
      icon: Star, color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)',
    },
    {
      label: 'Avg Response Time', value: `${analytics.avg_response_time}s`,
      icon: Clock, color: 'text-emerald-400', bg: 'rgba(34,197,94,0.1)',
    },
    {
      label: 'S2 Avg Safety', value: `${analytics.s2_metrics.avg_safety || '—'}/5`,
      icon: Shield, color: 'text-purple-400', bg: 'rgba(139,92,246,0.1)',
    },
  ] : []

  return (
    <div className="min-h-screen animated-bg py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-white mb-2">Analytics Dashboard</h1>
            <p className="text-slate-400">System performance comparison and risk distribution</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <button onClick={fetchAnalytics} disabled={loading} className="btn-secondary px-3.5 py-2.5 rounded-xl text-xs font-semibold">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button id="export-responses-csv-btn" onClick={handleExportResponses} className="btn-secondary px-3.5 py-2.5 rounded-xl text-xs font-semibold">
              <Download size={14} /> Responses CSV
            </button>
            <button id="export-responses-excel-btn" onClick={handleExportResponsesExcel} className="btn-secondary px-3.5 py-2.5 rounded-xl text-xs font-semibold">
              <Download size={14} /> Responses Excel
            </button>
            <button id="export-human-eval-csv-btn" onClick={handleExportEvals} className="btn-primary px-3.5 py-2.5 rounded-xl text-xs font-semibold">
              <Download size={14} /> Evaluations CSV
            </button>
            <button id="export-human-eval-excel-btn" onClick={handleExportEvalsExcel} className="btn-primary px-3.5 py-2.5 rounded-xl text-xs font-semibold">
              <Download size={14} /> Evaluations Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="metric-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon size={18} className={color} />
                  </div>
                </div>
                <div className={`font-display font-black text-3xl ${color} mb-1`}>{value}</div>
                <div className="text-slate-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        )}

        {!analytics && !loading && (
          <div className="glass-card p-12 text-center border border-slate-700/30 mb-8">
            <BarChart2 size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-white font-semibold text-lg mb-2">No Data Yet</h3>
            <p className="text-slate-500 text-sm">Ask questions in the Chat page and evaluate responses to see analytics here.</p>
          </div>
        )}

        {analytics && (
          <>
            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Bar Chart */}
              <div className="glass-card p-6 border border-primary-500/20">
                <h3 className="font-display font-bold text-white mb-5 flex items-center gap-2">
                  <BarChart2 size={18} className="text-primary-400" />
                  Metric Comparison
                </h3>
                <div style={{ height: '280px' }}>
                  {barData && <Bar data={barData} options={{
                    ...chartOptions,
                    scales: {
                      ...chartOptions.scales,
                      y: { ...chartOptions.scales.y, min: 0, max: 5, beginAtZero: true },
                    }
                  }} />}
                </div>
              </div>

              {/* Radar Chart */}
              <div className="glass-card p-6 border border-primary-500/20">
                <h3 className="font-display font-bold text-white mb-5 flex items-center gap-2">
                  <Star size={18} className="text-yellow-400" />
                  Performance Radar
                </h3>
                <div style={{ height: '280px' }}>
                  {radarData && <Radar data={radarData} options={radarOptions} />}
                </div>
              </div>
            </div>

            {/* Risk Distribution + Metric Table */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Doughnut */}
              <div className="glass-card p-6 border border-primary-500/20">
                <h3 className="font-display font-bold text-white mb-5 flex items-center gap-2">
                  <Shield size={18} className="text-primary-400" />
                  Risk Distribution
                </h3>
                {Object.keys(riskDist).length > 0 ? (
                  <div className="flex items-center gap-6">
                    <div style={{ height: '220px', width: '220px' }} className="shrink-0">
                      <Doughnut data={doughnutData} options={{
                        responsive: true, maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: { backgroundColor: '#1a1a2e', borderColor: 'rgba(99,102,241,0.3)', borderWidth: 1, titleColor: '#f1f5f9', bodyColor: '#94a3b8' },
                        },
                        cutout: '60%',
                      }} />
                    </div>
                    <div className="space-y-2 flex-1">
                      {Object.entries(riskDist).map(([level, count]) => (
                        <div key={level} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: RISK_COLORS[level] || '#6b7280' }} />
                            <span className="text-xs text-slate-400">{level.replace('_', ' ')}</span>
                          </div>
                          <span className="text-xs font-bold text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    No risk data yet. Start chatting!
                  </div>
                )}
              </div>

              {/* Metric Table */}
              <div className="glass-card p-6 border border-primary-500/20">
                <h3 className="font-display font-bold text-white mb-5">Detailed Scores</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 border-b border-slate-700/50">
                        <th className="text-left py-2">Metric</th>
                        <th className="text-center py-2 text-blue-400">S1</th>
                        <th className="text-center py-2 text-purple-400">S2</th>
                        <th className="text-center py-2">Winner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricLabels.map((label, i) => {
                        const keys = ['avg_relevance','avg_helpfulness','avg_faithfulness','avg_safety','avg_clarity']
                        const s1v = analytics.s1_metrics[keys[i]] || 0
                        const s2v = analytics.s2_metrics[keys[i]] || 0
                        const winner = s2v > s1v ? 'S2' : s1v > s2v ? 'S1' : '—'
                        return (
                          <tr key={label} className="border-b border-slate-800/50">
                            <td className="py-2.5 text-slate-300 font-medium">{label}</td>
                            <td className="py-2.5 text-center font-bold text-blue-400">{s1v || '—'}</td>
                            <td className="py-2.5 text-center font-bold text-purple-400">{s2v || '—'}</td>
                            <td className="py-2.5 text-center">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                winner === 'S2' ? 'bg-emerald-500/20 text-emerald-400' :
                                winner === 'S1' ? 'bg-blue-500/20 text-blue-400' :
                                'text-slate-600'
                              }`}>
                                {winner}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Progress Bars */}
                <div className="mt-5 space-y-3">
                  <div className="text-xs font-semibold text-slate-400 mb-3">Overall Safety Score</div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-blue-400">S1</span>
                      <span className="text-blue-400 font-bold">{analytics.s1_metrics.avg_safety}/5</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(analytics.s1_metrics.avg_safety / 5) * 100}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-purple-400">S2</span>
                      <span className="text-purple-400 font-bold">{analytics.s2_metrics.avg_safety}/5</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(analytics.s2_metrics.avg_safety / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function getDemoData() {
  return {
    total_questions: 12,
    total_evaluations: 8,
    avg_response_time: 2.4,
    s1_metrics: { avg_relevance: 3.2, avg_helpfulness: 3.0, avg_faithfulness: 3.5, avg_safety: 2.5, avg_clarity: 3.4 },
    s2_metrics: { avg_relevance: 4.1, avg_helpfulness: 4.3, avg_faithfulness: 4.0, avg_safety: 4.8, avg_clarity: 4.2 },
    risk_distribution: { L0_NORMAL: 4, L1_STRESS: 3, L2_DISTRESS: 2, L3_CRISIS: 1, L4_MEDICAL: 1, L5_OUT_OF_SCOPE: 1 },
  }
}
