import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BackgroundKey } from '../../engine/storyScript'

// Import generated background images
import bgClassroom from '../../assets/backgrounds/bg_classroom.png'
import bgRooftop from '../../assets/backgrounds/bg_rooftop.png'
import bgLibrary from '../../assets/backgrounds/bg_library.png'
import bgMusicRoom from '../../assets/backgrounds/bg_music_room.png'
import bgPark from '../../assets/backgrounds/bg_park.png'
import bgTitle from '../../assets/backgrounds/bg_title.png'

const BG_MAP: Record<BackgroundKey, string> = {
  classroom: bgClassroom,
  rooftop: bgRooftop,
  library: bgLibrary,
  musicRoom: bgMusicRoom,
  park: bgPark,
  title: bgTitle
}

interface BackgroundProps {
  sceneKey: BackgroundKey
}

export const Background: React.FC<BackgroundProps> = ({ sceneKey }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 z-0"
      >
        <img
          src={BG_MAP[sceneKey]}
          alt={sceneKey}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />
      </motion.div>
    </AnimatePresence>
  )
}
