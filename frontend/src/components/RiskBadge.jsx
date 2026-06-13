const RISK_CONFIG = {
  L0_NORMAL: { label: 'Normal', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', icon: '✓' },
  L1_STRESS: { label: 'Mild Stress', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400', icon: '⚡' },
  L2_DISTRESS: { label: 'Distress', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-400', icon: '⚠' },
  L3_CRISIS: { label: 'CRISIS', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400 animate-pulse', icon: '🆘' },
  L4_MEDICAL: { label: 'Medical', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', dot: 'bg-purple-400', icon: '⚕' },
  L5_OUT_OF_SCOPE: { label: 'Out of Scope', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', dot: 'bg-gray-400', icon: '◯' },
}

export default function RiskBadge({ level, confidence, showConfidence = true, size = 'md' }) {
  const config = RISK_CONFIG[level] || RISK_CONFIG['L0_NORMAL']
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1.5'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${config.color} ${sizeClasses}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span>{config.icon}</span>
        <span>{level || 'L0_NORMAL'}</span>
        <span className="text-xs opacity-70">({config.label})</span>
      </span>
      {showConfidence && confidence !== undefined && (
        <span className="text-xs text-slate-500">
          {Math.round(confidence * 100)}% confidence
        </span>
      )}
    </div>
  )
}
