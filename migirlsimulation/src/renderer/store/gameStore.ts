import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CharacterId = 'haru' | 'sejin' | 'daeun'
export type VoiceCharId = CharacterId | 'player'
export type Screen = 'title' | 'personality' | 'voice' | 'novel' | 'ending'
export type EndingKey = 'haru_a' | 'haru_b' | 'sejin_a' | 'sejin_b' | 'daeun_a' | 'daeun_b' | 'secret'

export interface PersonalityValues {
  slider1: number
  slider2: number
  slider3: number
}

export interface GameState {
  personalities: Record<CharacterId, PersonalityValues>
  voiceModels: Record<VoiceCharId, string | null>  // per-character voice clone IDs
  voiceSetupSkipped: boolean
  currentScreen: Screen
  currentSceneId: string
  affection: Record<CharacterId, number>
  storyFlags: Record<string, boolean>
  completedRoutes: CharacterId[]
  currentEnding: EndingKey | null
  activeRoute: CharacterId | null
  bgmVolume: number
  voiceVolume: number
  sfxVolume: number
  isMuted: boolean
  setPersonality: (char: CharacterId, values: Partial<PersonalityValues>) => void
  setVoiceModel: (char: VoiceCharId, id: string | null) => void
  setVoiceSetupSkipped: (val: boolean) => void
  setScreen: (screen: Screen) => void
  setSceneId: (id: string) => void
  addAffection: (char: CharacterId, delta: number) => void
  setFlag: (flag: string, value?: boolean) => void
  hasFlag: (flag: string) => boolean
  completeRoute: (char: CharacterId) => void
  setActiveRoute: (char: CharacterId | null) => void
  setEnding: (ending: EndingKey) => void
  setVolume: (type: 'bgm' | 'voice' | 'sfx', val: number) => void
  toggleMute: () => void
  resetGame: () => void
}

const initialState = {
  personalities: {
    haru: { slider1: 50, slider2: 30, slider3: 35 },
    sejin: { slider1: 70, slider2: 65, slider3: 60 },
    daeun: { slider1: 20, slider2: 40, slider3: 25 }
  },
  voiceModels: { player: null, haru: null, sejin: null, daeun: null } as Record<VoiceCharId, string | null>,
  voiceSetupSkipped: false,
  currentScreen: 'title' as Screen,
  currentSceneId: 'prologue_001',
  affection: { haru: 30, sejin: 30, daeun: 30 },
  storyFlags: {} as Record<string, boolean>,
  completedRoutes: [] as CharacterId[],
  currentEnding: null,
  activeRoute: null,
  bgmVolume: 0.6,
  voiceVolume: 0.8,
  sfxVolume: 0.5,
  isMuted: false
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setPersonality: (char, values) =>
        set((s) => ({ personalities: { ...s.personalities, [char]: { ...s.personalities[char], ...values } } })),
      setVoiceModel: (char, id) =>
        set((s) => ({ voiceModels: { ...s.voiceModels, [char]: id } })),
      setVoiceSetupSkipped: (val) => set({ voiceSetupSkipped: val }),
      setScreen: (screen) => set({ currentScreen: screen }),
      setSceneId: (id) => set({ currentSceneId: id }),
      addAffection: (char, delta) =>
        set((s) => ({ affection: { ...s.affection, [char]: Math.min(100, Math.max(0, s.affection[char] + delta)) } })),
      setFlag: (flag, value = true) =>
        set((s) => ({ storyFlags: { ...s.storyFlags, [flag]: value } })),
      hasFlag: (flag) => get().storyFlags[flag] === true,
      completeRoute: (char) =>
        set((s) => ({ completedRoutes: s.completedRoutes.includes(char) ? s.completedRoutes : [...s.completedRoutes, char] })),
      setActiveRoute: (char) => set({ activeRoute: char }),
      setEnding: (ending) => set({ currentEnding: ending }),
      setVolume: (type, val) => set({ [`${type}Volume`]: val } as Partial<GameState>),
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      resetGame: () => set({ ...initialState, currentScreen: 'title' })
    }),
    {
      name: 'your-voice-save',
      partialize: (s) => ({
        personalities: s.personalities,
        voiceModels: s.voiceModels,
        voiceSetupSkipped: s.voiceSetupSkipped,
        currentSceneId: s.currentSceneId,
        affection: s.affection,
        storyFlags: s.storyFlags,
        completedRoutes: s.completedRoutes,
        activeRoute: s.activeRoute,
        bgmVolume: s.bgmVolume,
        voiceVolume: s.voiceVolume,
        sfxVolume: s.sfxVolume
      })
    }
  )
)
