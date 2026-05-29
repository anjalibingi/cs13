import { useState, useCallback, memo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Heart, CheckCircle2, MessageSquare, Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageTransition } from '../components/PageTransition'
import { ListSkeleton, Skeleton } from '../components/Skeleton'
import { useConfetti } from '../components/Confetti'
import { useAuth } from '../context/AuthContext'
import { createAnswer, createDoubt, getDoubt, getDoubts, onMockStoreChange, resolveDoubt, updateAnswerStatus, upvoteAnswer } from '../lib/mockStore'
import type { Doubt, Answer } from '../types'

type AnswerStatus = 'pending' | 'approved' | 'rejected'
type FilterType = 'all' | AnswerStatus

const STATUS_STYLES: Record<AnswerStatus, { label: string; dot: string; badge: string }> = {
  pending:   { label: 'Pending',   dot: 'bg-yellow-400',         badge: 'bg-yellow-400/15 text-yellow-400' },
  approved:  { label: 'Approved',  dot: 'bg-green-400',          badge: 'bg-green-400/15 text-green-400' },
  rejected:  { label: 'Rejected',  dot: 'bg-red-400',            badge: 'bg-red-400/15 text-red-400' },
}

function StatusBadge({ status }: { status: AnswerStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function FilterBar({ filter, onChange }: { filter: FilterType; onChange: (f: FilterType) => void }) {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ]
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-white/30 text-xs font-medium uppercase tracking-widest mr-1">Filter</span>
      {filters.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            filter === f.key
              ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20'
              : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70 bg-white/5'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

function AnswerCard({
  answer,
  isAdmin,
  onApprove,
  onReject,
  onUpvote,
}: {
  answer: Answer
  isAdmin: boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onUpvote: (id: number) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await onApprove(answer.id)
    setLoading(false)
  }
  const handleReject = async () => {
    setLoading(true)
    await onReject(answer.id)
    setLoading(false)
  }

  const isPending = answer.status === 'pending'

  return (
    <div className={`rounded-2xl p-4 transition-all ${isPending ? 'bg-white/[0.04] border border-[#7c3aed]/20' : 'bg-white/[0.02] border border-white/5'}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.2))',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#a78bfa',
          }}>
          {(answer.creator_name || 'U')[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-white/60 text-xs">{answer.creator_name}</span>
            <StatusBadge status={answer.status} />
          </div>

          {/* Body */}
          <p className="text-white/80 text-sm leading-relaxed">{answer.body}</p>

          {/* Footer actions */}
          {isAdmin && isPending && (
            <div className="flex items-center gap-2 mt-3">
              <motion.button
                onClick={handleApprove}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-400/20 disabled:opacity-40"
                whileTap={{ scale: 0.95 }}
              >
                {loading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                Approve
              </motion.button>
              <motion.button
                onClick={handleReject}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-400/20 disabled:opacity-40"
                whileTap={{ scale: 0.95 }}
              >
                {loading ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                Reject
              </motion.button>
            </div>
          )}

          {!isAdmin && (
            <div className="flex items-center gap-3 mt-3 ml-0.5">
              <motion.button
                onClick={() => onUpvote(answer.id)}
                className="flex items-center gap-1.5 text-white/35 hover:text-[#ec4899] text-xs transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <Heart size={13} /> {answer.upvotes}
              </motion.button>
              {answer.is_accepted === 1 && (
                <span className="flex items-center gap-1 text-green-400 text-xs">
                  <CheckCircle2 size={13} /> Accepted
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const DoubtSolverPage = memo(function DoubtSolverPage() {
  const { user } = useAuth()
  const fireConfetti = useConfetti()
  const [doubtCount, setDoubtCount] = useState(0)
  const [doubtList, setDoubtList] = useState<Doubt[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [detail, setDetail] = useState<Doubt | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeAnswer, setActiveAnswer] = useState('')
  const [answerFilter, setAnswerFilter] = useState<FilterType>('all')

  // Load all doubts once on mount
  useEffect(() => {
    setDoubtList(getDoubts())
    setLoading(false)
  }, [])

  // Sync store changes for the currently open doubt detail
  const detailIdRef = useRef<number | null>(null)
  useEffect(() => {
    detailIdRef.current = detailId
  }, [detailId])

  useEffect(() => {
    return onMockStoreChange(() => {
      const nextDoubts = getDoubts()
      setDoubtList(nextDoubts)

      if (detailIdRef.current !== null) {
        const nextDetail = nextDoubts.find(doubt => doubt.id === detailIdRef.current) ?? null
        setDetail(nextDetail)
        setAnswers(nextDetail?.answers ?? [])
      }
    })
  }, [])

  const openDetail = useCallback((id: number) => {
    setDetailId(id)
    setDetailLoading(true)
    setAnswerFilter('all')
    const nextDetail = getDoubt(id)
    setDetail(nextDetail)
    setAnswers(nextDetail?.answers ?? [])
    setDetailLoading(false)
  }, [])

  const handleApprove = useCallback((answerId: number) => {
    const updatedAnswer = updateAnswerStatus(answerId, 'approved')
    if (!updatedAnswer) {
      toast.error('Failed to approve')
      return
    }
    setAnswers(prev => prev.map(a => a.id === answerId ? updatedAnswer : a))
    toast.success('Answer approved')
  }, [])

  const handleReject = useCallback((answerId: number) => {
    const updatedAnswer = updateAnswerStatus(answerId, 'rejected')
    if (!updatedAnswer) {
      toast.error('Failed to reject')
      return
    }
    setAnswers(prev => prev.map(a => a.id === answerId ? updatedAnswer : a))
    toast.success('Answer rejected')
  }, [])

  const submitDoubt = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !body.trim() || !user) return
    setSubmitting(true)
    createDoubt(title, body, user)
    setDoubtList(getDoubts())
    setModalOpen(false); setTitle(''); setBody('')
    toast.success('Doubt raised!')
    setSubmitting(false)
  }, [title, body, user])

  const submitAnswer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeAnswer.trim() || detailId === null || !user) return
    setDetailLoading(true)
    createAnswer(detailId, activeAnswer, user)
    const nextDetail = getDoubt(detailId)
    setDetail(nextDetail)
    setAnswers(nextDetail?.answers ?? [])
    setActiveAnswer('')
    toast.success('Answer submitted for admin review')
    setDetailLoading(false)
  }, [activeAnswer, detailId, user])

  const handleUpvote = useCallback(async (answerId: number) => {
    upvoteAnswer(answerId)
    if (detailId !== null) {
      const nextDetail = getDoubt(detailId)
      setDetail(nextDetail)
      setAnswers(nextDetail?.answers ?? [])
    }
    toast.success('Upvoted')
  }, [detailId])

  const handleResolve = useCallback(async () => {
    if (!detailId) return
    resolveDoubt(detailId)
    setDoubtList(prev => prev.map(d => d.id === detailId ? { ...d, status: 'resolved' } : d))
    if (detail) setDetail({ ...detail, status: 'resolved' })
    fireConfetti()
    toast.success('Marked as resolved')
  }, [detailId, detail, fireConfetti])

  const filteredAnswers = answerFilter === 'all'
    ? answers
    : answers.filter(a => a.status === answerFilter)

  const isAdmin = user?.role === 'admin'

  return (
    <PageTransition>
      <div className="cosmic-bg"><div className="stars" /></div>
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Doubt Solver</h2>
            <p className="text-white/40 text-sm mt-1">{doubtList.length} doubts · Click to view and answer</p>
          </div>
          <motion.button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-[#7c3aed] text-white rounded-full px-5 py-2.5 text-sm font-semibold"
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} /> Raise Doubt
          </motion.button>
        </div>

        {/* Doubt list */}
        {loading ? (
          <ListSkeleton />
        ) : (
          <div className="space-y-3">
            {doubtList.map(doubt => (
              <motion.div
                key={doubt.id}
                className="glass-card rounded-2xl p-5 cursor-pointer"
                onClick={() => openDetail(doubt.id)}
                whileTap={{ scale: 0.995 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[#7c3aed] text-xs font-semibold uppercase tracking-widest">{doubt.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${doubt.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {doubt.status}
                      </span>
                    </div>
                    <h3 className="text-white font-medium text-base leading-snug">{doubt.title}</h3>
                    <p className="text-white/40 text-sm mt-1.5 leading-relaxed">{doubt.body.slice(0, 110)}{doubt.body.length > 110 ? '…' : ''}</p>
                    <p className="text-white/20 text-xs mt-2.5">by {doubt.creator_name} · {new Date(doubt.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-white/60 text-xs">{doubt.answers.length} ans</span>
                      <MessageSquare size={16} className="text-white/25" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail modal */}
        <AnimatePresence>
          {detailId !== null && (
            <motion.div
              className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-2xl rounded-3xl overflow-hidden my-6"
                style={{ background: 'rgba(12,12,22,0.98)', border: '1px solid rgba(124,58,237,0.25)' }}
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
              >
                {/* Modal header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[#7c3aed] text-xs font-semibold uppercase tracking-widest">{detail?.category}</span>
                        <StatusBadge status={detail?.status as AnswerStatus} />
                      </div>
                      <h2 className="text-white font-bold text-xl leading-snug">{detail?.title}</h2>
                      <p className="text-white/40 text-sm mt-2 leading-relaxed">{detail?.body}</p>
                      <p className="text-white/20 text-xs mt-2">Asked by {detail?.creator_name}</p>
                    </div>
                    <button
                      onClick={() => { setDetailId(null); setDetail(null); setAnswers([]) }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 flex-shrink-0 transition-all"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Answer filter (only for admins) */}
                  {isAdmin && <FilterBar filter={answerFilter} onChange={setAnswerFilter} />}

                  {/* Answer input */}
                  {!isAdmin && (
                    <form onSubmit={submitAnswer} className="mt-4 flex items-center gap-2">
                      <input
                        value={activeAnswer}
                        onChange={e => setActiveAnswer(e.target.value)}
                        placeholder="Write an answer..."
                        className="flex-1 bg-white/5 rounded-full px-5 py-2.5 text-white placeholder:text-white/25 text-sm outline-none border border-white/10 focus:border-[#7c3aed]/50"
                      />
                      <motion.button type="submit" disabled={!activeAnswer.trim() || detailLoading} className="bg-[#7c3aed] rounded-full p-2.5 text-white disabled:opacity-40" whileTap={{ scale: 0.9 }}>
                        <MessageSquare size={18} />
                      </motion.button>
                      {isAdmin && (
                        <motion.button type="button" onClick={handleResolve} disabled={detail?.status === 'resolved'} className="bg-green-600 rounded-full p-2.5 text-white disabled:opacity-40" whileTap={{ scale: 0.9 }} title="Mark resolved">
                          <CheckCircle2 size={18} />
                        </motion.button>
                      )}
                    </form>
                  )}
                </div>

                {/* Answers */}
                <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
                  {detailLoading ? (
                    <Skeleton lines={2} />
                  ) : filteredAnswers.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-8">No answers yet. Be the first!</p>
                  ) : (
                    filteredAnswers.map(answer => (
                      <AnswerCard
                        key={answer.id}
                        answer={answer}
                        isAdmin={isAdmin}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onUpvote={handleUpvote}
                      />
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Raise Doubt modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                className="w-full max-w-lg rounded-3xl p-6"
                style={{ background: 'rgba(12,12,22,0.98)', border: '1px solid rgba(124,58,237,0.3)' }}
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-white font-bold text-lg mb-4">Raise a Doubt</h3>
                <form onSubmit={submitDoubt} className="space-y-3">
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Doubt title"
                    className="w-full bg-white/5 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 text-sm outline-none border border-white/10 focus:border-[#7c3aed]/50"
                    required
                  />
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Describe your doubt in detail..."
                    rows={4}
                    className="w-full bg-white/5 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 text-sm outline-none border border-white/10 focus:border-[#7c3aed]/50 resize-none"
                    required
                  />
                  <div className="flex gap-2">
                    <motion.button type="submit" disabled={submitting || !title || !body}
                      className="bg-[#7c3aed] rounded-full px-5 py-2.5 text-white text-sm font-semibold disabled:opacity-40"
                      whileTap={{ scale: 0.97 }}>
                      {submitting ? 'Submitting…' : 'Submit'}
                    </motion.button>
                    <button type="button" onClick={() => setModalOpen(false)} className="glass-card rounded-full px-5 py-2.5 text-white/60 text-sm">Cancel</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  )
})

export default DoubtSolverPage