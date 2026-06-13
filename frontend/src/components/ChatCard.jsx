import { Clock, FileText, Hash } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function ChatCard({ title, systemType, response, chunkIds, responseTime, contextCount, isLoading, color = 'blue' }) {
  const colorConfig = {
    blue: {
      header: 'from-blue-600/20 to-blue-900/10',
      border: 'border-blue-500/20',
      badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      glow: 'rgba(59,130,246,0.15)',
      dot: 'bg-blue-400',
    },
    purple: {
      header: 'from-purple-600/20 to-indigo-900/10',
      border: 'border-purple-500/20',
      badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      glow: 'rgba(139,92,246,0.15)',
      dot: 'bg-purple-400',
    },
    emerald: {
      header: 'from-emerald-600/20 to-emerald-900/10',
      border: 'border-emerald-500/20',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      glow: 'rgba(16,185,129,0.15)',
      dot: 'bg-emerald-400',
    },
  }
  const c = colorConfig[color] || colorConfig.blue

  return (
    <div className={`glass-card flex flex-col h-full border ${c.border} transition-all duration-300`}
      style={{ boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 30px ${c.glow}` }}>

      {/* Card Header */}
      <div className={`p-4 bg-gradient-to-r ${c.header} border-b ${c.border} rounded-t-2xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${c.dot} animate-pulse`} />
            <h3 className="font-display font-bold text-white text-lg">{title}</h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${c.badge}`}>
            {systemType}
          </span>
        </div>
      </div>

      {/* Response Body */}
      <div className="flex-1 p-5 overflow-y-auto min-h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="typing-dots flex justify-center mb-3">
                <span /><span /><span />
              </div>
              <p className="text-slate-400 text-sm">Generating response...</p>
            </div>
          </div>
        ) : response ? (
          <div className={`chat-bubble chat-bubble-${systemType.toLowerCase()} prose prose-invert prose-sm max-w-none`}>
            <ReactMarkdown
              components={{
                strong: ({ node, ...props }) => <strong className="text-white font-semibold" {...props} />,
                em: ({ node, ...props }) => <em className="text-primary-300" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                li: ({ node, ...props }) => <li className="text-slate-300" {...props} />,
                p: ({ node, ...props }) => <p className="text-slate-200 mb-3 last:mb-0 leading-relaxed" {...props} />,
              }}
            >
              {response}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
            <div className="text-center">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p>Response will appear here</p>
            </div>
          </div>
        )}
      </div>

      {/* Meta Footer */}
      {(response || chunkIds?.length > 0) && !isLoading && (
        <div className={`p-4 border-t ${c.border} space-y-3`}>
          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            {responseTime !== undefined && (
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-400" />
                <span>{responseTime}s</span>
              </div>
            )}
            {contextCount !== undefined && (
              <div className="flex items-center gap-1.5">
                <FileText size={12} className="text-slate-400" />
                <span>{contextCount} chunks</span>
              </div>
            )}
          </div>

          {/* Chunk IDs */}
          {chunkIds && chunkIds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Hash size={11} className="text-slate-500" />
                <span className="text-xs text-slate-500 font-medium">Retrieved Chunks</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chunkIds.map((id) => (
                  <span key={id} className="text-xs px-2 py-0.5 rounded-md font-mono"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
