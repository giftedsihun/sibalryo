import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'
import bgTitle from '../../assets/backgrounds/bg_title.png'

const PETAL_COUNT = 12

export const TitleScreen: React.FC = () => {
  const { setScreen, completedRoutes } = useGameStore()
  const hasProgress = completedRoutes.length > 0

  // 꽃잎 위치를 마운트 시 한 번만 계산 (re-render 시 위치 바뀌는 버그 방지)
  const petals = useMemo(() =>
    Array.from({ length: PETAL_COUNT }, (_, i) => ({
      id: i,
      left: `${5 + Math.floor((i * 7.7) % 90)}%`,
      top: `${5 + Math.floor((i * 6.3) % 80)}%`,
      delay: `${(i * 0.3).toFixed(1)}s`,
      duration: `${3 + (i % 3)}s`
    }))
  , [])

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={bgTitle} alt="title" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

      {/* Floating petals (CSS animation) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {petals.map(p => (
          <div key={p.id} className="absolute text-pink-300/40 text-xl animate-float"
            style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.duration }}>
            🌸
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center">
          <h1 className="font-display text-6xl text-white mb-2" style={{ textShadow: '0 0 40px rgba(255,107,157,0.6)' }}>
            너의 목소리로
          </h1>
          <p className="font-korean text-white/60 text-lg tracking-widest">Your Voice</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col gap-4 items-center min-w-[280px]">
          <button id="btn-new-game" onClick={() => setScreen('personality')}
            className="w-full py-4 px-8 rounded-2xl font-korean text-lg text-white font-medium transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #FF6B9D99, #FF6B9D)', boxShadow: '0 4px 24px #FF6B9D44' }}>
            새 게임
          </button>

          {hasProgress && (
            <button id="btn-continue" onClick={() => setScreen('novel')}
              className="w-full py-3 px-8 rounded-2xl font-korean text-base text-white/80 border border-white/20 backdrop-blur-sm hover:bg-white/10 transition-all">
              계속하기
            </button>
          )}

          <button id="btn-settings" onClick={() => setScreen('personality')}
            className="font-korean text-sm text-white/40 hover:text-white/70 transition-colors mt-2">
            성격 설정
          </button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-6 font-korean text-white/20 text-xs">
          © 2026 너의 목소리로
        </motion.p>
      </div>
    </div>
  )
}
