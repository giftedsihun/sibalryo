import type { CharacterId, PersonalityValues } from '../store/gameStore'

export type AllPersonalities = Record<CharacterId, PersonalityValues>

// Thresholds: high≥70, low<30, else mid
export const hi  = (v: number) => v >= 70
export const lo  = (v: number) => v < 30
export const mid = (v: number) => v >= 30 && v < 70

// ── Haru: slider1=warmth, slider2=playfulness ─────────────────────────────
export const haruWarm    = (p: AllPersonalities) => hi(p.haru.slider1)
export const haruCold    = (p: AllPersonalities) => lo(p.haru.slider1)
export const haruMidWarm = (p: AllPersonalities) => mid(p.haru.slider1)

export const haruPlayful  = (p: AllPersonalities) => hi(p.haru.slider2)
export const haruSerious  = (p: AllPersonalities) => lo(p.haru.slider2)
export const haruMidPlay  = (p: AllPersonalities) => mid(p.haru.slider2)

// Combined 9-way helpers for Haru (warmth × playfulness)
export const haruWP  = (p: AllPersonalities) => haruWarm(p)    && haruPlayful(p)
export const haruWM  = (p: AllPersonalities) => haruWarm(p)    && haruMidPlay(p)
export const haruWS  = (p: AllPersonalities) => haruWarm(p)    && haruSerious(p)
export const haruMP  = (p: AllPersonalities) => haruMidWarm(p) && haruPlayful(p)
export const haruMM  = (p: AllPersonalities) => haruMidWarm(p) && haruMidPlay(p)
export const haruMS  = (p: AllPersonalities) => haruMidWarm(p) && haruSerious(p)
export const haruCP  = (p: AllPersonalities) => haruCold(p)    && haruPlayful(p)
export const haruCM  = (p: AllPersonalities) => haruCold(p)    && haruMidPlay(p)
export const haruCS  = (p: AllPersonalities) => haruCold(p)    && haruSerious(p)

// ── Sejin: slider1=extroversion, slider2=softness ────────────────────────
export const sejinExtravert  = (p: AllPersonalities) => hi(p.sejin.slider1)
export const sejinIntrovert  = (p: AllPersonalities) => lo(p.sejin.slider1)
export const sejinMidVert    = (p: AllPersonalities) => mid(p.sejin.slider1)

export const sejinSoft   = (p: AllPersonalities) => hi(p.sejin.slider2)
export const sejinRough  = (p: AllPersonalities) => lo(p.sejin.slider2)
export const sejinMidSoft= (p: AllPersonalities) => mid(p.sejin.slider2)

// Combined 9-way helpers for Sejin (extroversion × softness)
export const sejinES = (p: AllPersonalities) => sejinExtravert(p) && sejinSoft(p)
export const sejinEM = (p: AllPersonalities) => sejinExtravert(p) && sejinMidSoft(p)
export const sejinER = (p: AllPersonalities) => sejinExtravert(p) && sejinRough(p)
export const sejinMS = (p: AllPersonalities) => sejinMidVert(p)   && sejinSoft(p)
export const sejinMM = (p: AllPersonalities) => sejinMidVert(p)   && sejinMidSoft(p)
export const sejinMR = (p: AllPersonalities) => sejinMidVert(p)   && sejinRough(p)
export const sejinIS = (p: AllPersonalities) => sejinIntrovert(p) && sejinSoft(p)
export const sejinIM = (p: AllPersonalities) => sejinIntrovert(p) && sejinMidSoft(p)
export const sejinIR = (p: AllPersonalities) => sejinIntrovert(p) && sejinRough(p)

// ── Daeun: slider1=talkative, slider2=emotional ──────────────────────────
export const daeunTalky    = (p: AllPersonalities) => hi(p.daeun.slider1)
export const daeunQuiet    = (p: AllPersonalities) => lo(p.daeun.slider1)
export const daeunMidTalk  = (p: AllPersonalities) => mid(p.daeun.slider1)

export const daeunEmotional = (p: AllPersonalities) => hi(p.daeun.slider2)
export const daeunCool      = (p: AllPersonalities) => lo(p.daeun.slider2)
export const daeunMidEmo    = (p: AllPersonalities) => mid(p.daeun.slider2)

// Combined 9-way helpers for Daeun (talkative × emotional)
export const daeunTE = (p: AllPersonalities) => daeunTalky(p)   && daeunEmotional(p)
export const daeunTM = (p: AllPersonalities) => daeunTalky(p)   && daeunMidEmo(p)
export const daeunTC = (p: AllPersonalities) => daeunTalky(p)   && daeunCool(p)
export const daeunME = (p: AllPersonalities) => daeunMidTalk(p) && daeunEmotional(p)
export const daeunMM = (p: AllPersonalities) => daeunMidTalk(p) && daeunMidEmo(p)
export const daeunMC = (p: AllPersonalities) => daeunMidTalk(p) && daeunCool(p)
export const daeunQE = (p: AllPersonalities) => daeunQuiet(p)   && daeunEmotional(p)
export const daeunQM = (p: AllPersonalities) => daeunQuiet(p)   && daeunMidEmo(p)
export const daeunQC = (p: AllPersonalities) => daeunQuiet(p)   && daeunCool(p)

export interface DialogueVariant {
  when: (p: AllPersonalities) => boolean
  text: string
}

/** Pick the first matching variant, or fall back to last entry (default). */
export function pickDialogue(
  variants: DialogueVariant[],
  personalities: AllPersonalities
): string {
  for (const v of variants) {
    if (v.when(personalities)) return v.text
  }
  return variants[variants.length - 1]?.text ?? ''
}
