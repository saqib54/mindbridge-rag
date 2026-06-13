import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Upload, FileText, Database, CheckCircle2, AlertCircle, RefreshCw, Layers, BookOpen, Tag, FileQuestion } from 'lucide-react'

const CSV_FILES = [
  { name: '1_sources.csv', desc: 'Knowledge sources & URLs', icon: BookOpen, color: 'text-blue-400' },
  { name: '2_corpus_chunks.csv', desc: 'Main knowledge base (indexed to ChromaDB)', icon: Database, color: 'text-purple-400', required: true },
  { name: '3_benchmark_questions.csv', desc: 'Test questions with expected risk levels', icon: FileQuestion, color: 'text-yellow-400' },
  { name: '4_ideal_answers.csv', desc: 'Gold standard answers for evaluation', icon: FileText, color: 'text-emerald-400' },
  { name: '5_risk_labels.csv', desc: 'Risk label definitions and triggers', icon: Tag, color: 'text-orange-400' },
]

export default function DatasetPage() {
  const [stats, setStats] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingDefaults, setLoadingDefaults] = useState(false)

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dataset/stats')
      setStats(res.data)
      setUploadedFiles(res.data.uploaded_files || [])
    } catch {
      // Backend may not be running yet
    }
  }

  useEffect(() => { fetchStats() }, [])

  // ── File Drop ────────────────────────────────────────────
  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      if (!file.name.endsWith('.csv')) {
        toast.error(`${file.name} is not a CSV file`)
        continue
      }
      const formData = new FormData()
      formData.append('file', file)
      setLoading(true)
      try {
        const res = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success(`✓ ${file.name} uploaded! ${res.data.chunks_indexed ? `(${res.data.chunks_indexed} chunks indexed)` : ''}`)
        fetchStats()
      } catch (err) {
        toast.error(`Failed to upload ${file.name}: ${err.response?.data?.detail || err.message}`)
      } finally {
        setLoading(false)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: true,
  })

  // ── Load Defaults ────────────────────────────────────────
  const handleLoadDefaults = async () => {
    setLoadingDefaults(true)
    try {
      const res = await axios.post('/api/dataset/load-defaults')
      toast.success(`✓ ${res.data.message}`)
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load defaults')
    } finally {
      setLoadingDefaults(false)
    }
  }

  const statCards = [
    { label: 'Total Sources', value: stats?.total_sources ?? '—', icon: BookOpen, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Total Chunks', value: stats?.total_chunks ?? '—', icon: Layers, color: 'text-purple-400', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Chunks Indexed', value: stats?.chunks_in_vector_db ?? '—', icon: Database, color: 'text-indigo-400', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Total Questions', value: stats?.total_questions ?? '—', icon: FileQuestion, color: 'text-yellow-400', bg: 'rgba(234,179,8,0.1)' },
    { label: 'Ideal Answers', value: stats?.total_ideal_answers ?? '—', icon: FileText, color: 'text-emerald-400', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Risk Labels', value: stats?.total_risk_labels ?? '—', icon: Tag, color: 'text-orange-400', bg: 'rgba(249,115,22,0.1)' },
  ]

  return (
    <div className="min-h-screen animated-bg px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)' }}>
              <Database size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl text-white">Dataset Manager</h1>
              <p className="text-slate-400 text-sm">Upload CSV files to populate the knowledge base</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card p-4 text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: bg }}>
                <Icon size={18} className={color} />
              </div>
              <div className={`font-display font-bold text-2xl ${color} mb-1`}>{value}</div>
              <div className="text-slate-500 text-xs leading-tight">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Drop Zone */}
          <div>
            <h2 className="font-display font-semibold text-xl text-white mb-4">Upload CSV Files</h2>
            <div
              {...getRootProps()}
              id="csv-dropzone"
              className={`glass-card p-10 text-center cursor-pointer transition-all duration-300 border-2 ${
                isDragActive
                  ? 'border-primary-500/60 bg-primary-500/10'
                  : 'border-dashed border-primary-500/20 hover:border-primary-500/40 hover:bg-primary-500/5'
              }`}
            >
              <input {...getInputProps()} id="csv-file-input" />
              <div className={`transition-all duration-300 ${isDragActive ? 'scale-110' : ''}`}>
                <Upload size={48} className={`mx-auto mb-4 ${isDragActive ? 'text-primary-400' : 'text-slate-500'}`} />
                <p className="text-white font-semibold text-lg mb-2">
                  {isDragActive ? 'Drop CSV files here!' : 'Drag & Drop CSV Files'}
                </p>
                <p className="text-slate-500 text-sm mb-4">or click to browse</p>
                <span className="text-xs text-primary-400 border border-primary-500/30 px-3 py-1 rounded-full">
                  Accepts .csv files
                </span>
              </div>
            </div>

            {/* Load Defaults Button */}
            <button
              id="load-defaults-btn"
              onClick={handleLoadDefaults}
              disabled={loadingDefaults}
              className="mt-4 w-full btn-secondary py-3 rounded-xl disabled:opacity-50"
            >
              {loadingDefaults ? (
                <><RefreshCw size={16} className="animate-spin" /> Loading defaults...</>
              ) : (
                <><Database size={16} /> Load Default CSV Data</>
              )}
            </button>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Loads all 5 CSV files from the backend data/ directory
            </p>
          </div>

          {/* File Status */}
          <div>
            <h2 className="font-display font-semibold text-xl text-white mb-4">Dataset Files</h2>
            <div className="space-y-3">
              {CSV_FILES.map(({ name, desc, icon: Icon, color, required }) => {
                const isUploaded = uploadedFiles.includes(name)
                return (
                  <div key={name}
                    className={`glass-card p-4 flex items-center gap-4 border transition-all duration-200 ${
                      isUploaded ? 'border-emerald-500/20' : 'border-slate-700/30'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                      style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-semibold text-white truncate">{name}</span>
                        {required && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                            required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <div className="shrink-0">
                      {isUploaded ? (
                        <CheckCircle2 size={20} className="text-emerald-400" />
                      ) : (
                        <AlertCircle size={20} className="text-slate-600" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Refresh Button */}
            <button
              id="refresh-stats-btn"
              onClick={fetchStats}
              className="mt-4 btn-secondary w-full py-2.5 rounded-xl text-sm"
            >
              <RefreshCw size={14} /> Refresh Stats
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 glass-card p-5 border border-primary-500/20">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Database size={16} className="text-primary-400" />
            Indexing Pipeline
          </h3>
          <div className="grid sm:grid-cols-4 gap-3 text-xs text-slate-400">
            {[
              { step: '1', text: 'Upload 2_corpus_chunks.csv' },
              { step: '2', text: 'Gemini generates embeddings' },
              { step: '3', text: 'Stored in ChromaDB' },
              { step: '4', text: 'Ready for RAG retrieval' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {step}
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
