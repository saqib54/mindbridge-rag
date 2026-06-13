import { Link } from 'react-router-dom'
import { Brain, MessageSquare, Database, Shield, Zap, ArrowRight, Star, BarChart2, Upload } from 'lucide-react'

const features = [
  {
    icon: Database,
    title: 'CSV Knowledge Base',
    desc: 'Upload your own datasets. The system indexes corpus chunks into ChromaDB vector store for semantic retrieval.',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Zap,
    title: 'S1 Basic RAG',
    desc: 'Retrieves top-3 relevant chunks from the knowledge base and generates a concise answer using Gemini.',
    color: 'from-yellow-500/20 to-orange-500/10',
    border: 'border-yellow-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    icon: Shield,
    title: 'S2 Safety-Aware RAG',
    desc: 'Classifies risk level (L0–L5), applies safety protocols, and generates empathetic, appropriate responses.',
    color: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: Star,
    title: 'Human Evaluation',
    desc: 'Score both systems on Relevance, Helpfulness, Faithfulness, Safety, and Clarity. Export as CSV.',
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
]

const riskLevels = [
  { code: 'L0', name: 'Normal', desc: 'General educational questions about procrastination, time management, and study habits', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { code: 'L1', name: 'Mild Stress', desc: 'Student expressing tiredness, distraction, or worry about procrastination', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { code: 'L2', name: 'Distress', desc: 'Stress about unfinished assignments, burnout, academic exhaustion', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { code: 'L3', name: 'High Distress', desc: 'Hopelessness, feeling like a burden, discouragement about studies', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { code: 'L4', name: 'Crisis', desc: 'Feeling unsafe with thoughts, cannot cope, immediate help needed', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { code: 'L5', name: 'Out of Scope', desc: 'Question completely unrelated to student wellbeing or academic life', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen animated-bg stars-bg">
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #d946ef, transparent)' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-primary-300 font-medium">Powered by Gemini AI + ChromaDB</span>
          </div>

          {/* Main Title */}
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl mb-6 leading-tight">
            <span className="text-white">Mind</span>
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Bridge
            </span>
            <span className="text-white text-4xl sm:text-5xl lg:text-6xl">-RAG</span>
          </h1>

          <p className="text-xl sm:text-2xl font-semibold text-primary-300 mb-4">
            Safety-Aware Student Support Assistant
          </p>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            Compare <strong className="text-blue-400">Basic RAG</strong> vs{' '}
            <strong className="text-purple-400">Safety-Aware RAG</strong> responses side by side.
            Demonstrate that safety-aware AI produces safer, more grounded responses for student wellbeing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dataset" id="upload-dataset-btn"
              className="btn-primary text-base px-8 py-4 rounded-2xl group">
              <Upload size={20} />
              Upload Dataset
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/chat" id="open-chat-btn"
              className="btn-secondary text-base px-8 py-4 rounded-2xl group">
              <MessageSquare size={20} />
              Open Chat Comparison
              <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-8 mt-16 flex-wrap">
            {[
              { value: '6', label: 'Risk Levels' },
              { value: '2', label: 'RAG Systems' },
              { value: '5', label: 'Eval Metrics' },
              { value: '∞', label: 'Questions' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display font-black text-4xl"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {value}
                </div>
                <div className="text-slate-500 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gradient-divider mx-auto max-w-5xl" />

      {/* ── Features Section ───────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete pipeline from knowledge base to side-by-side comparison
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color, border, iconColor }, i) => (
              <div key={title}
                className={`glass-card p-6 border ${border} bg-gradient-to-br ${color} transition-all duration-300 hover:-translate-y-1`}
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${iconColor}`}
                  style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <Icon size={22} />
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Risk Levels Section ────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-white mb-3">
              Safety Risk Classification
            </h2>
            <p className="text-slate-400">S2 classifies every question into one of 6 risk levels before responding</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskLevels.map(({ code, name, desc, color }) => (
              <div key={code} className={`glass-card p-4 border ${color.includes('border') ? '' : ''} transition-all duration-200 hover:-translate-y-0.5`}
                style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
                <div className="flex items-start gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${color} shrink-0`}>
                    {code}
                  </span>
                  <div>
                    <div className="font-semibold text-white text-sm mb-1">{name}</div>
                    <div className="text-slate-500 text-xs leading-relaxed">{desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Bottom ────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-10 text-center border border-primary-500/20"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(217,70,239,0.05))' }}>
            <Brain size={48} className="mx-auto mb-6 text-primary-400" />
            <h2 className="font-display font-bold text-3xl text-white mb-4">
              Ready to Compare?
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Upload your dataset and ask a question to instantly see how Safety-Aware RAG outperforms Basic RAG.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/chat" id="start-comparing-btn" className="btn-primary px-8 py-4 rounded-2xl text-base">
                <MessageSquare size={18} />
                Start Comparing Now
              </Link>
              <Link to="/analytics" id="view-analytics-btn" className="btn-secondary px-8 py-4 rounded-2xl text-base">
                <BarChart2 size={18} />
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
