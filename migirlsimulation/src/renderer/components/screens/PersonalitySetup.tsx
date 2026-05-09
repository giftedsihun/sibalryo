import React from 'react'
import { motion } from 'framer-motion'
import { useGameStore, CharacterId, PersonalityValues } from '../../store/gameStore'
import { PersonalitySlider } from '../ui/Slider'

interface CharConfig {
  id: CharacterId
  name: string
  role: string
  color: string
  sliders: [string, string][]
}

const CHARS: CharConfig[] = [
  { id: 'haru', name: '하루', role: '반장', color: '#FF6B9D', sliders: [['차가움', '따뜻함'], ['엄격함', '장난기'], ['내성적', '외향적']] },
  { id: 'sejin', name: '세진', role: '밴드부', color: '#4ECDC4', sliders: [['반항적', '순종적'], ['거침', '부드러움'], ['자신감', '수줍음']] },
  { id: 'daeun', name: '다은', role: '독서광', color: '#A78BFA', sliders: [['조용함', '수다스러움'], ['현실적', '몽상적'], ['냉정함', '감성적']] }
]

export const PersonalitySetup: React.FC = () => {
  const { personalities, setPersonality, setScreen } = useGameStore()

  const update = (char: CharacterId, key: keyof PersonalityValues, val: number) =>
    setPersonality(char, { [key]: val })

  return (
    <div className="w-full h-full overflow-y-auto bg-navy-900 flex flex-col items-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h2 className="font-display text-4xl text-white mb-2">캐릭터 성격 설정</h2>
        <p className="font-korean text-white/50 text-sm">슬라이더로 각 캐릭터의 성격을 조정하세요. 설정값이 대화에 반영됩니다.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {CHARS.map((char, ci) => (
          <motion.div key={char.id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.15 }}
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${char.color}33` }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-display"
                style={{ background: `${char.color}22`, border: `2px solid ${char.color}66`, color: char.color }}>
                {char.name[0]}
              </div>
              <div>
                <div className="font-korean text-white font-medium">{char.name}</div>
                <div className="text-xs text-white/40 font-korean">{char.role}</div>
              </div>
            </div>
            {(['slider1', 'slider2', 'slider3'] as (keyof PersonalityValues)[]).map((key, i) => (
              <PersonalitySlider key={key} label={char.sliders[i]}
                value={personalities[char.id][key]}
                onChange={(v) => update(char.id, key, v)}
                color={char.color} />
            ))}
          </motion.div>
        ))}
      </div>

      <motion.button
        id="btn-next-voice"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        onClick={() => setScreen('voice')}
        className="mt-10 px-12 py-4 rounded-2xl font-korean text-white font-medium text-lg"
        style={{ background: 'linear-gradient(135deg, #FF6B9D99,#A78BFA)', boxShadow: '0 4px 24px #FF6B9D33' }}>
        다음 →
      </motion.button>
    </div>
  )
}
