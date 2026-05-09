import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore, EndingKey } from '../../store/gameStore'
import bgTitle from '../../assets/backgrounds/bg_title.png'

const ENDING_DATA: Record<EndingKey, { title: string; subtitle: string; color: string; emoji: string; text: string }> = {
  haru_a: { title: '벚꽃 아래서', subtitle: '하루 루트 — 행복한 결말', color: '#FF6B9D', emoji: '🌸', text: '서로의 온도를 알게 된 두 사람. 하루의 목소리는 이제 더 이상 차갑지 않았다.' },
  haru_b: { title: '기다리는 계절', subtitle: '하루 루트 — 아쉬운 결말', color: '#FF6B9D99', emoji: '🌧', text: '하루는 여전히 기다린다고 했다. 그 말이 마음 어딘가에 오래 남았다.' },
  sejin_a: { title: '네 앞에서만', subtitle: '세진 루트 — 행복한 결말', color: '#4ECDC4', emoji: '🎸', text: '세진의 음악이 달라졌다. 항상 나를 향해 연주하는 것 같았다.' },
  sejin_b: { title: '여운', subtitle: '세진 루트 — 아쉬운 결말', color: '#4ECDC499', emoji: '🎵', text: '세진은 무대 위에서도 오프 무대에서도 같은 사람이었다. 그게 좋았다.' },
  daeun_a: { title: '우리만의 언어', subtitle: '다은 루트 — 행복한 결말', color: '#A78BFA', emoji: '📖', text: '다은의 책에는 우리 이야기가 한 챕터 더 생겼다.' },
  daeun_b: { title: '여백', subtitle: '다은 루트 — 아쉬운 결말', color: '#A78BFA99', emoji: '🍂', text: '다은은 끝까지 말이 없었지만, 그 눈빛이 모든 걸 대신했다.' },
  secret: { title: '두 개의 목소리', subtitle: '시크릿 엔딩', color: '#FFD700', emoji: '✨', text: '두 번의 이야기를 지나서야 깨달았다. 목소리란 단순한 소리가 아니라, 마음이 남기는 흔적이라는 것을.' }
}

export const EndingScreen: React.FC = () => {
  const { currentEnding, completedRoutes, resetGame, setScreen, setSceneId } = useGameStore()
  const data = currentEnding ? ENDING_DATA[currentEnding] : null
  const canUnlockSecret = completedRoutes.length >= 2

  if (!data) return null

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
      <img src={bgTitle} alt="bg" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-xl px-6 flex flex-col items-center gap-6">

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
          className="text-6xl">{data.emoji}</motion.div>

        <div>
          <p className="font-korean text-white/50 text-sm mb-1">{data.subtitle}</p>
          <h2 className="font-display text-5xl" style={{ color: data.color, textShadow: `0 0 30px ${data.color}88` }}>
            {data.title}
          </h2>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="font-korean text-white/70 text-lg leading-relaxed">
          {data.text}
        </motion.p>

        {canUnlockSecret && currentEnding !== 'secret' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="px-4 py-2 rounded-xl text-xs font-korean text-yellow-300 border border-yellow-300/30 bg-yellow-300/10">
            ✨ 시크릿 엔딩이 해금되었습니다!
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="flex gap-4 flex-wrap justify-center">
          {canUnlockSecret && currentEnding !== 'secret' && (
            <button id="btn-secret" onClick={() => { setSceneId('secret_ending'); setScreen('novel') }}
              className="px-6 py-3 rounded-xl font-korean text-sm text-yellow-300 border border-yellow-300/40 hover:bg-yellow-300/10 transition-colors">
              ✨ 시크릿 엔딩 보기
            </button>
          )}
          <button id="btn-new-route" onClick={() => { setScreen('personality') }}
            className="px-6 py-3 rounded-xl font-korean text-sm text-white/70 border border-white/20 hover:bg-white/10 transition-colors">
            다른 루트 플레이
          </button>
          <button id="btn-title" onClick={() => { resetGame(); setScreen('title') }}
            className="px-6 py-3 rounded-xl font-korean text-sm text-white/40 hover:text-white/70 transition-colors">
            타이틀로
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
