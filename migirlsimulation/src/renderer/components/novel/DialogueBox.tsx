import React from 'react'
import { motion } from 'framer-motion'
import { CharacterId } from '../../store/gameStore'
import { useTypewriter } from '../../hooks/useTypewriter'

const CHAR_NAMES: Record<string, string> = { haru: '하루', sejin: '세진', daeun: '다은', narrator: '내레이터', player: '나' }
const CHAR_COLORS: Record<CharacterId | 'narrator' | 'player', string> = {
  haru: '#FF6B9D', sejin: '#4ECDC4', daeun: '#A78BFA', narrator: '#94A3B8', player: '#E2E8F0'
}

interface DialogueBoxProps {
  speaker: CharacterId | 'narrator' | 'player' | undefined
  text: string
  isLoading: boolean
  onAdvance: () => void
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ speaker, text, isLoading, onAdvance }) => {
  const { displayed, done, complete } = useTypewriter(isLoading ? '' : text, 30)
  const color = speaker ? CHAR_COLORS[speaker] ?? '#E2E8F0' : '#E2E8F0'

  const handleClick = () => {
    if (!done) complete()
    else onAdvance()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-0 left-0 right-0 z-30 p-4"
      onClick={handleClick}
    >
      <div className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden"
        style={{ background: 'rgba(10,14,26,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Name badge */}
        {speaker && speaker !== 'narrator' && (
          <div className="absolute -top-4 left-6">
            <div className="px-4 py-1 rounded-t-xl text-sm font-medium font-korean"
              style={{ background: color, color: '#fff', boxShadow: `0 2px 12px ${color}66` }}>
              {CHAR_NAMES[speaker] ?? speaker}
            </div>
          </div>
        )}

        <div className="px-8 py-6 min-h-[100px] flex items-center">
          {isLoading ? (
            <div className="flex gap-2 items-center">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-white/40"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          ) : (
            <p className="font-korean text-white/95 text-lg leading-relaxed">
              {displayed}
              {!done && <span className="animate-pulse">▋</span>}
            </p>
          )}

          {done && !isLoading && (
            <motion.div
              className="absolute bottom-4 right-6 text-white/40 text-sm font-korean"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ▼ 계속
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
