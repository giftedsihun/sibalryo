import { SceneStep, resolveText, getScene } from './storyScript'
import { AllPersonalities } from './personalityResolver'
import { generateClaudeDialogue } from './claudeDialogue'
import type { CharacterId, EndingKey } from '../store/gameStore'

type AffectionMap = Partial<Record<CharacterId, number>>
type AddAffectionFn = (char: CharacterId, delta: number) => void

/** Resolve a scene: pick static text by personality, or call Claude if mode='claude'. */
export async function resolveScene(
  id: string,
  personalities: AllPersonalities
): Promise<SceneStep & { resolvedText: string; isLoading: boolean }> {
  const scene = getScene(id)
  if (!scene) throw new Error(`Scene not found: ${id}`)

  // Static path: personality-based dialogue selection
  if (scene.dialogueMode === 'static' || !scene.claudeContext) {
    return { ...scene, resolvedText: resolveText(scene, personalities), isLoading: false }
  }

  // Claude path with static fallback
  try {
    const text = await generateClaudeDialogue(
      scene.speaker as CharacterId,
      personalities[scene.speaker as CharacterId],
      scene.claudeContext
    )
    return { ...scene, resolvedText: text, isLoading: false }
  } catch {
    // Fall back to static personality text
    return { ...scene, resolvedText: resolveText(scene, personalities), isLoading: false }
  }
}

/** Apply affection deltas from scene or choice. */
export function applyAffection(
  scene: SceneStep,
  choiceId: string | null,
  addAffection: AddAffectionFn
) {
  const delta: AffectionMap = choiceId
    ? scene.choices?.find(c => c.id === choiceId)?.affectionDelta ?? {}
    : scene.affectionDelta ?? {}

  for (const [char, val] of Object.entries(delta)) {
    if (val) addAffection(char as CharacterId, val)
  }
}

/** Get next scene ID after advancing or making a choice. */
export function getNextSceneId(
  scene: SceneStep,
  choiceId: string | null,
  _affection: Record<CharacterId, number>,
  _completedRoutes: string[]
): string {
  if (choiceId) {
    return scene.choices?.find(c => c.id === choiceId)?.nextSceneId ?? '__ending__'
  }
  return scene.nextSceneId ?? '__ending__'
}

/** Determine ending key from scene. */
export function resolveEndingKey(
  scene: SceneStep,
  _affection: Record<CharacterId, number>
): EndingKey | null {
  return (scene.endingKey as EndingKey) ?? null
}
