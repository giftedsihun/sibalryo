import React, { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGameStore, CharacterId, EndingKey } from '../../store/gameStore'
import { resolveScene, applyAffection, getNextSceneId, resolveEndingKey } from '../../engine/storyRunner'
import { SceneStep } from '../../engine/storyScript'
import { Background } from './Background'
import { CharacterSprite } from './CharacterSprite'
import { DialogueBox } from './DialogueBox'
import { ChoicePanel } from './ChoicePanel'
import { AffectionHUD } from './AffectionHUD'
import { useVoiceTTS } from '../../hooks/useVoiceTTS'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'

export const GameCanvas: React.FC = () => {
  const {
    currentSceneId, personalities, affection, completedRoutes,
    addAffection, setSceneId, setFlag, setEnding, setScreen, completeRoute, activeRoute
  } = useGameStore()

  const [scene, setScene] = useState<(SceneStep & { resolvedText: string; isLoading: boolean }) | null>(null)
  const [awaitingChoice, setAwaitingChoice] = useState(false)
  const { speak } = useVoiceTTS()
  const { playBGM, stopBGM } = useAudioPlayer()

  // speak을 ref에 저장해서 loadScene의 의존성에서 제거 (볼륨 변경 시 씬 재로드 방지)
  const speakRef = useRef(speak)
  useEffect(() => { speakRef.current = speak }, [speak])

  const loadScene = useCallback(async (id: string) => {
    if (id === '__ending__') return
    const resolved = await resolveScene(id, personalities)
    setScene(resolved)
    setAwaitingChoice(!!(resolved.choices && resolved.choices.length > 0))
    if (resolved.resolvedText) speakRef.current(resolved.resolvedText, resolved.speaker as string | undefined)
    if (resolved.setFlag) setFlag(resolved.setFlag)
    // BGM 전환 (씬에 bgm 필드가 있을 때만)
    if (resolved.bgm) playBGM(resolved.bgm)
  }, [personalities, setFlag, playBGM])

  useEffect(() => { loadScene(currentSceneId) }, [currentSceneId, loadScene])

  const advance = useCallback(() => {
    if (!scene || awaitingChoice) return
    applyAffection(scene, null, addAffection)
    const nextId = getNextSceneId(scene, null, affection, completedRoutes)
    if (nextId === '__ending__' || scene.endingKey) {
      const endingKey = resolveEndingKey(scene, affection)
      if (endingKey) {
        setEnding(endingKey)
        if (activeRoute) completeRoute(activeRoute)
        setScreen('ending')
      }
      return
    }
    setSceneId(nextId)
  }, [scene, awaitingChoice, addAffection, affection, completedRoutes, activeRoute, setEnding, completeRoute, setScreen, setSceneId])

  const handleChoice = useCallback((choiceId: string) => {
    if (!scene?.choices) return
    const choice = scene.choices.find(c => c.id === choiceId)
    if (!choice) return
    applyAffection(scene, choiceId, addAffection)
    if (choice.setFlag) setFlag(choice.setFlag)
    const nextId = getNextSceneId(scene, choiceId, affection, completedRoutes)
    setSceneId(nextId)
  }, [scene, addAffection, affection, completedRoutes, setFlag, setSceneId])

  if (!scene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-navy-900">
        <div className="text-white/40 font-korean animate-pulse">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-navy-900">
      <Background sceneKey={scene.background} />

      {scene.sprites?.map(s => (
        <CharacterSprite key={s.id} id={s.id as CharacterId} position={s.position} emotion={s.emotion} active={s.active} visible />
      ))}

      <AffectionHUD />

      <AnimatePresence mode="wait">
        {awaitingChoice && scene.choices ? (
          <ChoicePanel key="choices" choices={scene.choices} onChoice={handleChoice} />
        ) : (
          <DialogueBox
            key={scene.id}
            speaker={scene.speaker as CharacterId | 'narrator' | 'player' | undefined}
            text={scene.resolvedText}
            isLoading={scene.isLoading}
            onAdvance={advance}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
