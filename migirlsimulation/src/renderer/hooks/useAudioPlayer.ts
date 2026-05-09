import { useRef, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'

export function useAudioPlayer() {
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const { bgmVolume, sfxVolume, isMuted } = useGameStore()

  const playBGM = useCallback((src: string) => {
    if (bgmRef.current) {
      if (bgmRef.current.src.endsWith(src)) return
      bgmRef.current.pause()
    }
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = isMuted ? 0 : bgmVolume
    audio.play().catch(() => {})
    bgmRef.current = audio
  }, [bgmVolume, isMuted])

  const stopBGM = useCallback(() => {
    bgmRef.current?.pause()
    bgmRef.current = null
  }, [])

  const playSFX = useCallback((src: string) => {
    if (isMuted) return
    const audio = new Audio(src)
    audio.volume = sfxVolume
    audio.play().catch(() => {})
  }, [sfxVolume, isMuted])

  return { playBGM, stopBGM, playSFX }
}
