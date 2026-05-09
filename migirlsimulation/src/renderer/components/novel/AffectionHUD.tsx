import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, CharacterId } from '../../store/gameStore'

const CHARS: { id: CharacterId; name: string; color: string; emoji: string }[] = [
  { id: 'haru', name: '하루', color: '#FF6B9D', emoji: '🌸' },
  { id: 'sejin', name: '세진', color: '#4ECDC4', emoji: '🎸' },
  { id: 'daeun', name: '다은', color: '#A78BFA', emoji: '📚' }
]

export const AffectionHUD: React.FC = () => {
  const { affection } = useGameStore()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.div
      className="absolute top-4 right-4 z-40"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <button
        onClick={() => setCollapsed(c => !c)}
        className="mb-2 ml-auto flex items-center gap-1 text-white/40 text-xs font-korean hover:text-white/70 transition-colors"
      >
        ♥ 호감도 {collapsed ? '▼' : '▲'}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-2 min-w-[160px] p-3 rounded-2xl"
            style={{ background: 'rgba(10,14,26,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {CHARS.map(({ id, name, color, emoji }) => (
              <div key={id} className="flex items-center gap-2">
                <span className="text-sm w-5">{emoji}</span>
                <span className="text-xs font-korean text-white/70 w-8">{name}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${affection[id]}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }}
                  />
                </div>
                <span className="text-xs text-white/50 w-6 text-right">{affection[id]}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
