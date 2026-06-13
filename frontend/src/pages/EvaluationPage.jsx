import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Star, Save, Download, CheckCircle2, AlertOctagon, MessageSquare, FileText } from 'lucide-react'

const METRICS = [
  { key: 'relevance', label: 'Relevance', desc: 'How well the answer addresses the question', icon: '🎯' },
  { key: 'helpfulness', label: 'Helpfulness', desc: 'How useful is the answer for the student', icon: '🤝' },
  { key: 'faithfulness', label: 'Faithfulness', desc: 'How grounded in retrieved context', icon: '📚' },
  { key: 'safety', label: 'Safety', desc: 'How safe and appropriate the response is', icon: '🛡️' },
  { key: 'clarity', label: 'Clarity', desc: 'How clear and easy to understand', icon: '💡' },
]

const defaultScores = { relevance: 0, helpfulness: 0, faithfulness: 0, safety: 0, clarity: 0 }

export default function EvaluationPage() {
  const [evaluations, setEvaluations] = useState([])
  const [benchmarkQuestions, setBenchmarkQuestions] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [customQuestion, setCustomQuestion] = useState('')
  const [activeQId, setActiveQId] = useState('')

  const [s0Scores, setS0Scores] = useState({ ...defaultScores })
  const [s1Scores, setS1Scores] = useState({ ...defaultScores })
  const [s2Scores, setS2Scores] = useState({ ...defaultScores })
  const [s0Unsafe, setS0Unsafe] = useState(false)
  const [s1Unsafe, setS1Unsafe] = useState(false)
  const [s2Unsafe, setS2Unsafe] = useState(false)
  const [s0Comments, setS0Comments] = useState('')
  const [s1Comments, setS1Comments] = useState('')
  const [s2Comments, setS2Comments] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [benchmarkStatus, setBenchmarkStatus] = useState({
    is_running: false,
    current_question: 0,
    total_questions: 80,
    completed: 0,
    errors: 0,
  })

  // Poll benchmark status
  useEffect(() => {
    let interval
    const checkStatus = async () => {
      try {
        const res = await axios.get('/api/benchmark/status')
        setBenchmarkStatus(res.data)
        if (!res.data.is_running) {
          clearInterval(interval)
          // Refresh list once done
          const evalRes = await axios.get('/api/evaluate/results')
          setEvaluations(evalRes.data)
        }
      } catch { }
    }

    if (benchmarkStatus.is_running) {
      interval = setInterval(checkStatus, 2000)
    }
    return () => clearInterval(interval)
  }, [benchmarkStatus.is_running])

  // Initial status check
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        const res = await axios.get('/api/benchmark/status')
        setBenchmarkStatus(res.data)
      } catch { }
    }
    checkInitialStatus()
  }, [])

  const handleStartAutoEval = async () => {
    try {
      const res = await axios.post('/api/benchmark/run-all')
      if (res.data.success) {
        toast.success('Batch auto-evaluation started!')
        setBenchmarkStatus(prev => ({ ...prev, is_running: true }))
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error('Failed to start batch auto-evaluation')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evalRes, qRes] = await Promise.all([
          axios.get('/api/evaluate/results'),
          axios.get('/api/benchmark/questions'),
        ])
        setEvaluations(evalRes.data)
        setBenchmarkQuestions(qRes.data)
      } catch { }
    }
    fetchData()
  }, [])

  const ScoreSelector = ({ scores, setScores, metricKey }) => (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => setScores(prev => ({ ...prev, [metricKey]: n }))}
          className={`score-btn ${scores[metricKey] === n ? 'selected' : ''}`}
          title={`Score: ${n}`}
        >
          {n}
        </button>
      ))}
    </div>
  )

  const handleSubmit = async (systemType, scores, unsafeFlag, comments) => {
    const qId = activeQId || `EVAL-${Date.now()}`
    setSubmitting(true)
    try {
      await axios.post('/api/evaluate', {
        question_id: qId,
        system_type: systemType,
        relevance_score: scores.relevance || 3,
        helpfulness_score: scores.helpfulness || 3,
        faithfulness_score: scores.faithfulness || 3,
        safety_score: scores.safety || 3,
        clarity_score: scores.clarity || 3,
        unsafe_flag: unsafeFlag,
        comments: comments,
      })
      toast.success(`✓ ${systemType} evaluation saved!`)
      const res = await axios.get('/api/evaluate/results')
      setEvaluations(res.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save evaluation')
    } finally {
      setSubmitting(false)
    }
  }

  const handleExport = () => {
    window.location.href = '/api/export/evaluations'
    toast.success('Downloading 7_human_evaluation.csv...')
  }

  const handleExportExcel = () => {
    window.location.href = '/api/export/evaluations/excel'
    toast.success('Downloading 7_human_evaluation.xlsx...')
  }

  const handleExportResponses = () => {
    window.location.href = '/api/export/responses'
    toast.success('Downloading 6_model_responses.csv...')
  }

  const handleExportResponsesExcel = () => {
    window.location.href = '/api/export/responses/excel'
    toast.success('Downloading 6_model_responses.xlsx...')
  }

  const SystemEvalCard = ({ systemType, scores, setScores, unsafeFlag, setUnsafeFlag, comments, setComments, color }) => {
    const borderColor = color === 'blue' ? 'border-blue-500/20' : color === 'purple' ? 'border-purple-500/20' : 'border-emerald-500/20'
    const headerBg = color === 'blue' ? 'from-blue-600/15 to-blue-900/5' : color === 'purple' ? 'from-purple-600/15 to-purple-900/5' : 'from-emerald-600/15 to-emerald-900/5'
    const badgeColor = color === 'blue' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : color === 'purple' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    const dotColor = color === 'blue' ? 'bg-blue-400' : color === 'purple' ? 'bg-purple-400' : 'bg-emerald-400'

    const avgScore = Object.values(scores).filter(v => v > 0)
    const avg = avgScore.length > 0 ? (avgScore.reduce((a, b) => a + b, 0) / avgScore.length).toFixed(1) : '—'

    return (
      <div className={`glass-card border ${borderColor} flex flex-col`}>
        {/* Header */}
        <div className={`p-5 bg-gradient-to-r ${headerBg} border-b ${borderColor} rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${dotColor}`} />
              <h3 className="font-display font-bold text-white text-lg">
                {systemType === 'S1' ? 'S1 · Basic RAG' : systemType === 'S2' ? 'S2 · Safety-Aware RAG' : 'S0 · Direct LLM'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {avg !== '—' && (
                <div className="text-sm font-bold" style={{ color: avg >= 4 ? '#22c55e' : avg >= 3 ? '#eab308' : '#ef4444' }}>
                  Avg: {avg}/5
                </div>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${badgeColor}`}>{systemType}</span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="p-5 flex-1 space-y-5">
          {METRICS.map(({ key, label, desc, icon }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold text-white">
                    {icon} {label}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                {scores[key] > 0 && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} className={i < scores[key] ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'} />
                    ))}
                  </div>
                )}
              </div>
              <ScoreSelector scores={scores} setScores={setScores} metricKey={key} />
            </div>
          ))}

          {/* Unsafe Flag */}
          <div className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: unsafeFlag ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.2)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div>
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertOctagon size={14} className="text-red-400" />
                Mark as Unsafe
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Response is harmful or inappropriate</p>
            </div>
            <button
              onClick={() => setUnsafeFlag(!unsafeFlag)}
              className={`w-10 h-6 rounded-full transition-all duration-200 relative ${unsafeFlag ? 'bg-red-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${unsafeFlag ? 'left-5' : 'left-1'}`} />
            </button>
          </div>

          {/* Comments */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">Comments (optional)</label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Any additional observations..."
              rows={2}
              className="textarea-field text-xs"
              style={{ minHeight: '60px' }}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={() => handleSubmit(systemType, scores, unsafeFlag, comments)}
            disabled={submitting}
            className="w-full btn-primary py-3 rounded-xl disabled:opacity-50"
          >
            <Save size={15} />
            Save {systemType} Evaluation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen animated-bg py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-white mb-2">
              Human Evaluation
            </h1>
            <p className="text-slate-400">Score all systems on 5 metrics (1–5 scale)</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              id="export-responses-csv-btn"
              onClick={handleExportResponses}
              className="btn-secondary px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            >
              <Download size={14} /> Responses (CSV)
            </button>
            <button
              id="export-responses-excel-btn"
              onClick={handleExportResponsesExcel}
              className="btn-secondary px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            >
              <Download size={14} /> Responses (Excel)
            </button>
            <button
              id="export-evaluations-csv-btn"
              onClick={handleExport}
              className="btn-primary px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            >
              <Download size={14} /> Evaluations (CSV)
            </button>
            <button
              id="export-evaluations-excel-btn"
              onClick={handleExportExcel}
              className="btn-primary px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            >
              <Download size={14} /> Evaluations (Excel)
            </button>
          </div>
        </div>

        {/* Question Selector */}
        <div className="glass-card p-5 mb-8 border border-primary-500/20">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <MessageSquare size={15} className="text-primary-400" />
            Select Question to Evaluate
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Benchmark Question</label>
              <select
                id="benchmark-question-select"
                value={selectedQuestion}
                onChange={e => {
                  setSelectedQuestion(e.target.value)
                  const q = benchmarkQuestions.find(bq => bq.question_id === e.target.value)
                  if (q) setActiveQId(q.question_id)
                }}
                className="input-field text-sm"
              >
                <option value="">Select a benchmark question...</option>
                {benchmarkQuestions.map(q => (
                  <option key={q.question_id || q.Question_ID} value={q.question_id || q.Question_ID}>
                    [{q.question_id || q.Question_ID}] [{q.expected_risk_level || q.Expected_Risk_Level}] {(q.question || q.User_Question)?.substring(0, 55)}...
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Or Custom Question ID</label>
              <input
                type="text"
                value={activeQId}
                onChange={e => setActiveQId(e.target.value)}
                placeholder="e.g. Q-ABC123"
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>

        {/* Automated Evaluation Panel */}
        <div className="glass-card p-5 mb-8 border border-purple-500/30 bg-purple-500/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-white flex items-center gap-2">
                <span className="text-xl">🤖</span>
                Automated Evaluation (Chatbot Judge)
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Let the chatbot automatically run and score all 80 benchmark questions through S0, S1, and S2 using the LLM judge.
              </p>
            </div>
            <div>
              {!benchmarkStatus.is_running ? (
                <button
                  id="run-auto-eval-btn"
                  onClick={handleStartAutoEval}
                  className="btn-primary bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 text-sm whitespace-nowrap"
                >
                  Auto-Evaluate All 80 Questions
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-slate-900/50 border border-purple-500/30 px-4 py-2.5 rounded-xl">
                  <div className="spinner w-4 h-4 border-2 border-purple-400 border-t-transparent animate-spin rounded-full" />
                  <span className="text-xs text-purple-300 font-semibold">
                    Evaluating question {benchmarkStatus.current_question}/{benchmarkStatus.total_questions} ({Math.round(benchmarkStatus.completed / 3)} completed, {benchmarkStatus.errors} errors)
                  </span>
                </div>
              )}
            </div>
          </div>

          {benchmarkStatus.is_running && (
            <div className="mt-4">
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(benchmarkStatus.current_question / benchmarkStatus.total_questions) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                <span>Progress: {Math.round((benchmarkStatus.current_question / benchmarkStatus.total_questions) * 100)}%</span>
                <span>System status: Running evaluation judge</span>
              </div>
            </div>
          )}
        </div>

        {/* Evaluation Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <SystemEvalCard
            systemType="S0"
            scores={s0Scores} setScores={setS0Scores}
            unsafeFlag={s0Unsafe} setUnsafeFlag={setS0Unsafe}
            comments={s0Comments} setComments={setS0Comments}
            color="emerald"
          />
          <SystemEvalCard
            systemType="S1"
            scores={s1Scores} setScores={setS1Scores}
            unsafeFlag={s1Unsafe} setUnsafeFlag={setS1Unsafe}
            comments={s1Comments} setComments={setS1Comments}
            color="blue"
          />
          <SystemEvalCard
            systemType="S2"
            scores={s2Scores} setScores={setS2Scores}
            unsafeFlag={s2Unsafe} setUnsafeFlag={setS2Unsafe}
            comments={s2Comments} setComments={setS2Comments}
            color="purple"
          />
        </div>

        {/* Evaluation History */}
        {evaluations.length > 0 && (
          <div className="glass-card p-6 border border-slate-700/30">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              Evaluation Records ({evaluations.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-700/50">
                    <th className="text-left py-2 px-3">Q-ID</th>
                    <th className="text-left py-2 px-3">System</th>
                    <th className="text-center py-2 px-3">Rel.</th>
                    <th className="text-center py-2 px-3">Help.</th>
                    <th className="text-center py-2 px-3">Faith.</th>
                    <th className="text-center py-2 px-3">Safety</th>
                    <th className="text-center py-2 px-3">Clarity</th>
                    <th className="text-center py-2 px-3">Unsafe</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((ev, i) => (
                    <tr key={i} className="border-b border-slate-800/50 hover:bg-white/3 transition-colors">
                      <td className="py-2 px-3 font-mono text-xs text-slate-400">{ev.question_id}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          ev.system_type === 'S1'
                            ? 'bg-blue-500/20 text-blue-400'
                            : ev.system_type === 'S2'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>{ev.system_type}</span>
                      </td>
                      {['relevance_score','helpfulness_score','faithfulness_score','safety_score','clarity_score'].map(k => (
                        <td key={k} className="py-2 px-3 text-center">
                          <span className={`font-semibold ${ev[k] >= 4 ? 'text-emerald-400' : ev[k] >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {ev[k]}
                          </span>
                        </td>
                      ))}
                      <td className="py-2 px-3 text-center">
                        {ev.unsafe_flag
                          ? <AlertOctagon size={14} className="text-red-400 mx-auto" />
                          : <CheckCircle2 size={14} className="text-emerald-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
