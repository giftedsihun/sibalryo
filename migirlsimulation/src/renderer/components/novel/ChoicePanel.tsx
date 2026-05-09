import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Choice } from '../../engine/storyScript'
import { CharacterId } from '../../store/gameStore'

const CHAR_COLORS: Record<CharacterId, string> = { haru: '#FF6B9D', sejin: '#4ECDC4', daeun: '#A78BFA' }

interface ChoicePanelProps {
  choices: Choice[]
  onChoice: (choiceId: string) => void
}

export const ChoicePanel: React.FC<ChoicePanelProps> = ({ choices, onChoice }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const idx = parseInt(e.key) - 1
      if (idx >= 0 && idx < choices.length) onChoice(choices[idx].id)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [choices, onChoice])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="absolute bottom-0 left-0 right-0 z-40 p-6"
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-3">
        {choices.map((choice, i) => {
          const char = Object.keys(choice.affectionDelta ?? {})[0] as CharacterId | undefined
          const color = char ? CHAR_COLORS[char] : '#ffffff'
          const delta = char ? choice.affectionDelta?.[char] : undefined

          return (
            <motion.button
              key={choice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02, x: 6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChoice(choice.id)}
              id={`choice-${choice.id}`}
              className="w-full text-left px-6 py-4 rounded-xl font-korean text-white/90 text-base"
              style={{
                background: 'rgba(10,14,26,0.85)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${color}44`,
                boxShadow: `0 2px 16px ${color}22`
              }}
            >
              <span className="text-white/40 mr-3 text-sm">{i + 1}</span>
              {choice.text}
              {delta !== undefined && (
                <span className="ml-2 text-xs" style={{ color }}>
                  {delta > 0 ? `+${delta} ♥` : `${delta} ♥`}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
