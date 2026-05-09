import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from './store/gameStore'
import { TitleScreen } from './components/screens/TitleScreen'
import { PersonalitySetup } from './components/screens/PersonalitySetup'
import { VoiceSetup } from './components/screens/VoiceSetup'
import { EndingScreen } from './components/screens/EndingScreen'
import { GameCanvas } from './components/novel/GameCanvas'

const SCREEN_COMPONENTS = {
  title: TitleScreen,
  personality: PersonalitySetup,
  voice: VoiceSetup,
  novel: GameCanvas,
  ending: EndingScreen
}

export default function App() {
  const { currentScreen } = useGameStore()
  const Screen = SCREEN_COMPONENTS[currentScreen]

  return (
    <div className="w-screen h-screen overflow-hidden bg-navy-900 select-none" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* Custom titlebar drag area */}
      <div className="fixed top-0 left-0 right-0 h-8 z-50" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
        <div className="flex justify-end items-center h-full px-3 gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <button onClick={() => (window as any).electron?.minimize()} className="w-3 h-3 rounded-full bg-yellow-400/60 hover:bg-yellow-400 transition-colors" />
          <button onClick={() => (window as any).electron?.maximize()} className="w-3 h-3 rounded-full bg-green-400/60 hover:bg-green-400 transition-colors" />
          <button onClick={() => (window as any).electron?.close()} className="w-3 h-3 rounded-full bg-red-400/60 hover:bg-red-400 transition-colors" />
        </div>
      </div>

      <div className="w-full h-full pt-8">
        <AnimatePresence mode="wait">
          <motion.div key={currentScreen} className="w-full h-full"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}>
            <Screen />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
