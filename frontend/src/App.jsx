import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import DatasetPage from './pages/DatasetPage'
import ChatPage from './pages/ChatPage'
import EvaluationPage from './pages/EvaluationPage'
import AnalyticsPage from './pages/AnalyticsPage'

export default function App() {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${darkMode ? 'bg-[#0f0f1a] text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dataset" element={<DatasetPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/evaluate" element={<EvaluationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0f0f1a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0f0f1a' } },
          }}
        />
      </div>
    </BrowserRouter>
  )
}
