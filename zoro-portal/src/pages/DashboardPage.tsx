import { memo, useEffect, useState } from 'react'
import { HelpCircle, MessageSquare, Sword, ArrowRight, Sparkles, Megaphone, Crown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageTransition } from '../components/PageTransition'
import { useAuth } from '../context/AuthContext'
import { getDoubts, getUsers, onMockStoreChange } from '../lib/mockStore'

const PARTICLES = [
  { left: '15%', dur: '3.2s', delay: '0s' },
  { left: '35%', dur: '4.1s', delay: '0.8s' },
  { left: '55%', dur: '3.6s', delay: '0.3s' },
  { left: '75%', dur: '4.5s', delay: '1.2s' },
  { left: '90%', dur: '3.8s', delay: '0.5s' },
]

export const DashboardPage = memo(function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [faqCount, setFaqCount] = useState(0)
  const [doubtCount, setDoubtCount] = useState(0)
  const [topUsers, setTopUsers] = useState<{ username: string; sp_points: number }[]>([])

  useEffect(() => {
    const loadStats = () => {
      setFaqCount(0)
      setDoubtCount(getDoubts().length)
      setTopUsers(
        getUsers()
          .filter(item => item.role === 'user')
          .sort((a, b) => b.sp_points - a.sp_points)
          .slice(0, 5),
      )
    }

    loadStats()
    return onMockStoreChange(loadStats)
  }, [])

  useEffect(() => {
    document.title = 'Dashboard · Zoro Portal'
  }, [])

  return (
    <PageTransition>
      <div className="cosmic-bg"><div className="stars" /></div>

      {/* Hero particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            top: 0,
            left: p.left,
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: 'rgba(167,139,250,0.6)',
            animation: `float-particle ${p.dur} ${p.delay} infinite ease-in-out`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Hey {user?.username?.split('@')[0] ?? 'there'} 👋
          </h1>
          <p className="text-white/40 text-base mt-1">Welcome back to Zoro Portal.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Doubt Solver */}
          <Link to="/doubts" className="glass-card rounded-2xl p-6 flex flex-col gap-3 group hover:border-[#7c3aed]/40 transition-all">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
              <MessageSquare size={20} className="text-[#a78bfa]" />
            </div>
            <h3 className="text-white font-semibold text-lg">Doubt Solver</h3>
            <p className="text-white/40 text-sm leading-relaxed">Ask doubts, get answers from peers. Moderated for quality.</p>
            <div className="mt-auto flex items-center gap-2 text-[#7c3aed] text-sm font-medium">
              <span>{doubtCount} doubts</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* FAQ */}
          <Link to="/faq" className="glass-card rounded-2xl p-6 flex flex-col gap-3 group hover:border-[#06b6d4]/40 transition-all">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}>
              <HelpCircle size={20} className="text-[#06b6d4]" />
            </div>
            <h3 className="text-white font-semibold text-lg">FAQ</h3>
            <p className="text-white/40 text-sm leading-relaxed">Common questions answered — NOC, courses, deadlines.</p>
            <div className="mt-auto flex items-center gap-2 text-[#06b6d4] text-sm font-medium">
              <span>{faqCount} articles</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Zoro AI */}
          <Link to="/zoro" className="glass-card rounded-2xl p-6 flex flex-col gap-3 group hover:border-[#ec4899]/40 transition-all">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(236,72,153,0.12)', border: '1px solid rgba(236,72,153,0.2)' }}>
              <Sparkles size={20} className="text-[#ec4899]" />
            </div>
            <h3 className="text-white font-semibold text-lg">Zoro AI</h3>
            <p className="text-white/40 text-sm leading-relaxed">Your personal AI assistant for academic help.</p>
            <div className="mt-auto flex items-center gap-2 text-[#ec4899] text-sm font-medium">
              <span>Chat now</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Leaderboard */}
        {topUsers.length > 0 && (
          <div className="mt-8 glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <Crown size={18} className="text-yellow-400" />
              <h3 className="text-white font-semibold text-base">Leaderboard</h3>
            </div>
            <div className="space-y-2.5">
              {topUsers.map((u, i) => (
                <div key={u.username} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-600/20 text-orange-400' : 'bg-white/5 text-white/40'}`}>
                    {i + 1}
                  </span>
                  <span className="text-white/70 text-sm flex-1">{u.username}</span>
                  <span className="text-[#a78bfa] text-sm font-semibold">{u.sp_points} SP</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  )
})

export default DashboardPage