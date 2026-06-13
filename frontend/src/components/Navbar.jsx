import { Link, useLocation } from 'react-router-dom'
import { Brain, Database, MessageSquare, BarChart2, Star, Sun, Moon, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Home', icon: Brain },
  { path: '/dataset', label: 'Dataset', icon: Database },
  { path: '/chat', label: 'Chat Compare', icon: MessageSquare },
  { path: '/evaluate', label: 'Evaluate', icon: Star },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
]

export default function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full" style={{
      background: 'rgba(15,15,26,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(99,102,241,0.15)',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #d946ef)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white group-hover:text-primary-300 transition-colors">
                MindBridge
              </span>
              <span className="text-xs text-purple-400 font-medium block -mt-1">RAG</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/10"
              style={{ border: '1px solid rgba(99,102,241,0.2)' }}
              title="Toggle theme"
            >
              {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-slate-400" />}
            </button>

            {/* Status Dot */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">API Ready</span>
            </div>

            {/* Mobile Menu */}
            <button
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary-500/20 text-primary-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
