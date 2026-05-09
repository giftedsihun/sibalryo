import { useCallback, useRef } from 'react'
import { useGameStore, VoiceCharId } from '../store/gameStore'

const PROXY_BASE = 'http://127.0.0.1:8000'

// Web Speech API pitch per character (Korean voice fallback)
const SPEAKER_PITCH: Record<string, number> = {
  haru: 1.3,
  sejin: 1.0,
  daeun: 1.15,
  player: 1.1,
  narrator: 0.95
}

function speakWebSpeech(text: string, speaker: string, volume: number) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ko-KR'
  utter.rate = 0.9
  utter.pitch = SPEAKER_PITCH[speaker] ?? 1.0
  utter.volume = volume
  window.speechSynthesis.speak(utter)
}

export function useVoiceTTS() {
  const { voiceModels, voiceVolume, isMuted } = useGameStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const speak = useCallback(async (text: string, speaker?: string) => {
    if (isMuted || !text.trim()) return

    const speakerKey = (speaker as VoiceCharId) ?? 'player'
    const voiceId = voiceModels[speakerKey] ?? null

    if (!voiceId) {
      // Web Speech API fallback — narrator 제외 모든 캐릭터
      speakWebSpeech(text, speakerKey, voiceVolume)
      return
    }

    try {
      audioRef.current?.pause()
      audioRef.current = null

      const res = await fetch(`${PROXY_BASE}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice_id: voiceId, language: 'Korean' })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error?: string }
        console.error(`[TTS] OmniVoice 실패: ${err.error} — Web Speech 폴백`)
        speakWebSpeech(text, speakerKey, voiceVolume)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.volume = voiceVolume
      audio.onended = () => URL.revokeObjectURL(url)
      audio.onerror = (e) => { console.error('[TTS] 재생 오류:', e); URL.revokeObjectURL(url) }
      await audio.play()
      audioRef.current = audio
    } catch (err) {
      console.error('[TTS] OmniVoice 오류 — Web Speech 폴백:', err)
      speakWebSpeech(text, speakerKey, voiceVolume)
    }
  }, [voiceModels, voiceVolume, isMuted])

  const stop = useCallback(() => {
    audioRef.current?.pause()
    audioRef.current = null
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  const hasAnyVoice = Object.values(voiceModels).some(v => v !== null)

  return { speak, stop, hasAnyVoice, voiceModels }
}
