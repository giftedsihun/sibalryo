import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, VoiceCharId } from '../../store/gameStore'

const PROXY_BASE = 'http://127.0.0.1:8000'
const RECORD_SECONDS = 30
const MIN_DURATION_SEC = 5
const SUPPORTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/x-m4a', 'audio/m4a']

const CHARS: { id: VoiceCharId; label: string; emoji: string; desc: string; color: string }[] = [
  { id: 'player', label: '주인공', emoji: '🎙️', desc: '당신의 목소리 (나레이션·선택지)', color: '#A78BFA' },
  { id: 'haru', label: '하루', emoji: '🌸', desc: '밝고 활발한 반장', color: '#F472B6' },
  { id: 'sejin', label: '세진', emoji: '🎸', desc: '쿨한 밴드부원', color: '#60A5FA' },
  { id: 'daeun', label: '다은', emoji: '📚', desc: '조용하고 감성적인 독서가', color: '#34D399' },
]

async function uploadToProxy(blob: Blob, filename: string): Promise<string> {
  const form = new FormData()
  form.append('audio', blob, filename)
  const res = await fetch(`${PROXY_BASE}/clone`, { method: 'POST', body: form }).catch(e => {
    throw new Error('AI 음성 엔진이 로딩 중입니다. 잠시 후(약 30초~1분) 다시 시도해주세요.')
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error: string }
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
  const data = await res.json() as { voice_id: string }
  return data.voice_id
}

async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(audio.duration) }
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(999) }
  })
}

// ── Per-character voice panel ─────────────────────────────────────────────────
const CharVoicePanel: React.FC<{
  charId: VoiceCharId
  color: string
}> = ({ charId, color }) => {
  const { voiceModels, setVoiceModel } = useGameStore()
  const voiceId = voiceModels[charId]

  const [tab, setTab] = useState<'record' | 'upload'>('record')
  const [recording, setRecording] = useState(false)
  const [countdown, setCountdown] = useState(RECORD_SECONDS)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileDuration, setFileDuration] = useState<number>(0)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (blob: Blob, filename: string) => {
    setStatus('uploading')
    setErrorMsg('')
    try {
      const dur = await getAudioDuration(blob)
      if (dur < MIN_DURATION_SEC) {
        setStatus('error'); setErrorMsg('더 긴 음성 파일을 사용해주세요 (5초 이상)'); return
      }
      const id = await uploadToProxy(blob, filename)
      setVoiceModel(charId, id)
      setStatus('done')
    } catch (e: any) {
      setStatus('error'); setErrorMsg(e.message ?? '업로드 실패')
    }
  }, [charId, setVoiceModel])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        upload(blob, `${charId}_voice.webm`)
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
      setCountdown(RECORD_SECONDS)
      let c = RECORD_SECONDS
      timerRef.current = setInterval(() => {
        c--; setCountdown(c)
        if (c <= 0) stopRecording()
      }, 1000)
    } catch { setStatus('error'); setErrorMsg('마이크 접근 불가') }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRef.current?.stop()
    setRecording(false)
  }

  const handleFile = async (file: File) => {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setStatus('error'); setErrorMsg('MP3, WAV, M4A, OGG 파일만 지원합니다'); return
    }
    const dur = await getAudioDuration(file)
    setSelectedFile(file); setFileDuration(dur)
    setStatus('idle'); setErrorMsg('')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const progress = ((RECORD_SECONDS - countdown) / RECORD_SECONDS) * 100

  return (
    <div className="space-y-4">
      {/* Done badge */}
      {voiceId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: `${color}22`, border: `1px solid ${color}66`, color }}>
          ✅ 목소리 학습 완료! &nbsp;<span className="opacity-60 text-xs">{voiceId.slice(0, 8)}...</span>
          <button onClick={() => { setVoiceModel(charId, null); setStatus('idle') }}
            className="ml-auto opacity-50 hover:opacity-100 text-xs">다시 설정</button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(['record', 'upload'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'text-white' : 'bg-white/5 text-white/40 hover:text-white/70'
              }`}
            style={tab === t ? { background: color, opacity: 0.9 } : {}}>
            {t === 'record' ? '🎤 직접 녹음' : '📁 파일 업로드'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'record' ? (
          <motion.div key="record" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            {/* Circular timer */}
            <div className="flex justify-center">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{recording ? countdown : RECORD_SECONDS}</span>
                  <span className="text-xs text-white/40">초</span>
                </div>
              </div>
            </div>
            <button onClick={recording ? stopRecording : startRecording}
              className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{ background: recording ? '#ef4444' : color }}>
              {recording ? '⏹ 녹음 중지' : '🎤 녹음 시작'}
            </button>
          </motion.div>
        ) : (
          <motion.div key="upload" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-opacity-100 bg-white/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
              style={dragOver ? { borderColor: color } : {}}>
              {selectedFile ? (
                <div className="space-y-1">
                  <div className="text-2xl">🎵</div>
                  <div className="text-white text-sm font-medium truncate">{selectedFile.name}</div>
                  <div className="text-white/40 text-xs">{fileDuration.toFixed(1)}초 · {(selectedFile.size / 1024).toFixed(0)}KB</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl">📂</div>
                  <div className="text-white/60 text-sm">드래그하거나 클릭해서 파일 선택</div>
                  <div className="text-white/30 text-xs">MP3 · WAV · M4A · OGG</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" className="hidden"
              accept=".mp3,.wav,.m4a,.ogg,audio/*"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            {selectedFile && (
              <button onClick={() => upload(selectedFile, selectedFile.name)}
                disabled={status === 'uploading'}
                className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                style={{ background: color }}>
                {status === 'uploading' ? '⏳ 학습 중...' : '✨ 이 목소리 사용하기'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status messages */}
      <AnimatePresence>
        {status === 'uploading' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center text-sm text-white/60 animate-pulse">⏳ OmniVoice 학습 중...</motion.div>
        )}
        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center text-sm text-red-400">⚠️ {errorMsg}</motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main VoiceSetup screen ────────────────────────────────────────────────────
export const VoiceSetup: React.FC = () => {
  const { voiceModels, setVoiceSetupSkipped, setScreen } = useGameStore()
  const [activeChar, setActiveChar] = useState<VoiceCharId>('player')

  const configuredCount = Object.values(voiceModels).filter(Boolean).length
  const activeInfo = CHARS.find(c => c.id === activeChar)!

  const handleStart = () => {
    setVoiceSetupSkipped(configuredCount === 0)
    setScreen('novel')
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎭 목소리 설정</h1>
          <p className="text-white/50 text-sm">각 캐릭터에 목소리를 등록해주세요</p>
          <div className="mt-3 flex justify-center gap-1">
            {CHARS.map(c => (
              <div key={c.id} className="w-2 h-2 rounded-full transition-all"
                style={{ background: voiceModels[c.id] ? c.color : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
          <p className="text-white/30 text-xs mt-1">{configuredCount}/4 설정 완료</p>
        </div>

        {/* Character selector */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {CHARS.map(c => (
            <button key={c.id} onClick={() => setActiveChar(c.id)}
              className={`relative py-3 px-2 rounded-xl text-center transition-all ${activeChar === c.id ? 'text-white' : 'bg-white/5 text-white/50 hover:text-white/80'
                }`}
              style={activeChar === c.id ? { background: `${c.color}33`, border: `1px solid ${c.color}88` } : { border: '1px solid transparent' }}>
              <div className="text-xl mb-1">{c.emoji}</div>
              <div className="text-xs font-medium">{c.label}</div>
              {voiceModels[c.id] && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Active character panel */}
        <AnimatePresence mode="wait">
          <motion.div key={activeChar}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl p-5 mb-6"
            style={{ background: `${activeInfo.color}11`, border: `1px solid ${activeInfo.color}33` }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{activeInfo.emoji}</span>
              <div>
                <div className="text-white font-bold">{activeInfo.label}</div>
                <div className="text-white/40 text-xs">{activeInfo.desc}</div>
              </div>
            </div>
            <CharVoicePanel charId={activeChar} color={activeInfo.color} />
          </motion.div>
        </AnimatePresence>

        {/* Bottom actions */}
        <div className="space-y-3">
          <button onClick={handleStart}
            className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-95"
            style={{
              background: configuredCount > 0
                ? 'linear-gradient(135deg, #A78BFA, #60A5FA)'
                : 'rgba(255,255,255,0.08)'
            }}>
            {configuredCount > 0 ? `🎮 게임 시작 (${configuredCount}개 목소리 설정됨)` : '➡️ 건너뛰고 시작'}
          </button>
          {configuredCount === 0 && (
            <p className="text-center text-white/30 text-xs">
              목소리 없이도 플레이 가능합니다 (시스템 음성 사용)
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
