import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CharacterId } from '../../store/gameStore'
import { EmotionKey, SpritePosition } from '../../engine/storyScript'

// Sprite imports — one image per character (placeholder)
import spriteHaru from '../../assets/sprites/sprite_haru.png'
import spriteSejin from '../../assets/sprites/sprite_sejin.png'
import spriteDaeun from '../../assets/sprites/sprite_daeun.png'

const SPRITE_MAP: Record<CharacterId, string> = {
  haru: spriteHaru,
  sejin: spriteSejin,
  daeun: spriteDaeun
}

const POSITION_CLASS: Record<SpritePosition, string> = {
  left: 'left-[5%]',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-[5%]'
}

// Emotion tints via CSS filter
const EMOTION_FILTER: Record<EmotionKey, string> = {
  neutral: 'brightness(1)',
  happy: 'brightness(1.05) saturate(1.2)',
  sad: 'brightness(0.85) saturate(0.7)',
  surprised: 'brightness(1.1)',
  blush: 'brightness(1) saturate(1.3) hue-rotate(-5deg)'
}

interface CharacterSpriteProps {
  id: CharacterId
  position: SpritePosition
  emotion: EmotionKey
  active: boolean
  visible: boolean
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  id, position, emotion, active, visible
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`${id}-${position}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: active ? 1 : 0.5, y: 0, filter: active ? EMOTION_FILTER[emotion] : 'brightness(0.6) saturate(0.5)' }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
          className={`absolute bottom-[20%] ${POSITION_CLASS[position]} z-10`}
          style={{ height: '70%' }}
        >
          <img
            src={SPRITE_MAP[id]}
            alt={id}
            className="h-full w-auto object-contain drop-shadow-2xl"
            style={{ filter: EMOTION_FILTER[emotion] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
