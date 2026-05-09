import { CharacterId, PersonalityValues } from '../store/gameStore'

const CHAR_NAMES: Record<CharacterId, string> = { haru: '하루', sejin: '세진', daeun: '다은' }

const SLIDER_LABELS: Record<CharacterId, [string, string, string][]> = {
  haru: [['차가움', '따뜻함'], ['엄격함', '장난기'], ['내성적', '외향적']],
  sejin: [['반항적', '순종적'], ['거침', '부드러움'], ['자신감', '수줍음']],
  daeun: [['조용함', '수다스러움'], ['현실적', '몽상적'], ['냉정함', '감성적']]
}

function describe(val: number, low: string, high: string): string {
  if (val <= 20) return `매우 ${low}`
  if (val <= 40) return `다소 ${low}`
  if (val <= 60) return `중립적`
  if (val <= 80) return `다소 ${high}`
  return `매우 ${high}`
}

export async function generateClaudeDialogue(
  char: CharacterId,
  _personality: PersonalityValues,
  _context: string
): Promise<string> {
  // 실제 API를 호출하는 대신 지연 시간을 주어 생각하는 효과 연출
  await new Promise(resolve => setTimeout(resolve, 1000))

  const dialogs: Record<CharacterId, string[]> = {
    haru: [
      "그, 그게... 딱히 널 위해서 준비한 건 아니야!",
      "오늘따라 왜 이렇게 쳐다봐? 집중 안 되잖아.",
      "숙제는 다 했어? 내가 확인해줄까?",
      "정말... 너란 애는 구제불능이네. 그래도 싫진 않아."
    ],
    sejin: [
      "야, 거기! 오늘 방과 후에 밴드부 연습실로 와.",
      "음악 들어볼래? 내가 요즘 꽂힌 곡인데.",
      "뭐야, 그런 표정 짓지 마. 사람 헷갈리게.",
      "내 기타 소리 어때? 널 생각하면서 쳤어."
    ],
    daeun: [
      "...이 책, 네가 좋아할 것 같아서 빌려왔어.",
      "도서관은 조용해서 좋아... 너랑 단둘이 있을 수 있으니까.",
      "내 마음을 읽을 수 있다면... 어떻게 할래?",
      "가끔은 현실보다 책 속 세상이 덜 무섭게 느껴져."
    ]
  }

  const list = dialogs[char] || ["무슨 말을 해야 할지 모르겠어."]
  const randomIndex = Math.floor(Math.random() * list.length)
  return list[randomIndex]
}
