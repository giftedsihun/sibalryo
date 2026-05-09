import { CharacterId } from '../store/gameStore'
import {
  AllPersonalities, DialogueVariant, pickDialogue,
  haruWP, haruWM, haruWS, haruMP, haruMM, haruMS, haruCP, haruCM,
  sejinES, sejinEM, sejinER, sejinMS, sejinMM, sejinMR, sejinIS, sejinIM,
  daeunTE, daeunTM, daeunTC, daeunME, daeunMM, daeunMC, daeunQE, daeunQM, daeunQC
} from './personalityResolver'

export type BackgroundKey = 'classroom' | 'rooftop' | 'library' | 'musicRoom' | 'park' | 'title'
export type EmotionKey = 'neutral' | 'happy' | 'sad' | 'surprised' | 'blush'
export type SpritePosition = 'left' | 'center' | 'right'
export type DialogueMode = 'static' | 'claude'

export interface SpriteState { id: CharacterId; position: SpritePosition; emotion: EmotionKey; active: boolean }
export interface Choice { id: string; text: string; nextSceneId: string; affectionDelta?: Partial<Record<CharacterId, number>>; setFlag?: string }
export interface SceneStep {
  id: string; background: BackgroundKey; bgm?: string; sfx?: string
  sprites?: SpriteState[]; speaker?: CharacterId | 'narrator' | 'player'
  dialogueMode: DialogueMode; staticText?: string; claudeContext?: string
  dialogues?: DialogueVariant[]; choices?: Choice[]
  nextSceneId?: string; affectionDelta?: Partial<Record<CharacterId, number>>
  endingKey?: string; requireFlag?: string; setFlag?: string
}

export function resolveText(scene: SceneStep, personalities: AllPersonalities): string {
  if (scene.dialogues && scene.dialogues.length > 0) return pickDialogue(scene.dialogues, personalities)
  return scene.staticText ?? ''
}

export const STORY_SCRIPT: Record<string, SceneStep> = {

  prologue_001: {
    id:'prologue_001', background:'classroom', dialogueMode:'static', speaker:'narrator',
    staticText:'4월의 봄, 벚꽃이 지는 날 나는 새로운 학교에 전학을 왔다. 낯선 교실, 낯선 얼굴들... 이상하게도 목소리가 잘 나오지 않았다.',
    nextSceneId:'prologue_002'
  },

  prologue_002: {
    id:'prologue_002', background:'classroom',
    sprites:[{id:'haru',position:'right',emotion:'neutral',active:true}],
    speaker:'haru', dialogueMode:'static',
    dialogues:[
      {when:p=>haruWP(p), text:'어머, 전학생! 나 하루야~ 반장! 뭐든 모르면 물어봐, 진짜 뭐든ㅋㅋ 잘 지내보자!'},
      {when:p=>haruWM(p), text:'전학 왔구나, 반가워! 나 하루야. 모르는 거 있으면 언제든 말해줘.'},
      {when:p=>haruWS(p), text:'전학 왔구나. 나는 하루, 반장이야. 불편한 거 있으면 말해. 최대한 도와줄게.'},
      {when:p=>haruMP(p), text:'오~ 전학생? 나 하루야ㅋ 여기 사실 좀 심심한데, 내가 있으니까 재밌을 거야.'},
      {when:p=>haruMM(p), text:'안녕, 전학생. 나 하루야. 반에서 모르는 게 있으면 편하게 물어봐.'},
      {when:p=>haruMS(p), text:'전학 왔어? 나 하루야. 자리는 저기고, 규칙은 금방 알게 될 거야.'},
      {when:p=>haruCP(p), text:'오~ 전학생? 여기 생각보다 별로야 솔직히ㅋ 뭐, 그래도 나 있으니까 재밌을 거야.'},
      {when:p=>haruCM(p), text:'전학생이야? 뭐, 잘 왔어. 나는 하루야. 크게 기대는 말고.'},
      {when:_=>true,      text:'...전학생이야? 자리는 저기. 규칙은 칠판에 있어.'}
    ],
    choices:[
      {id:'p2a',text:'반갑습니다',nextSceneId:'prologue_003',affectionDelta:{haru:10}},
      {id:'p2b',text:'잘 부탁드려요',nextSceneId:'prologue_003',affectionDelta:{haru:5}}
    ]
  },

  prologue_003: {
    id:'prologue_003', background:'classroom',
    sprites:[{id:'sejin',position:'left',emotion:'happy',active:true}],
    speaker:'sejin', dialogueMode:'static',
    dialogues:[
      {when:p=>sejinES(p), text:'야 전학생이지? 나 세진이야! 음악 좋아해? 밴드부 같이 하자, 진짜 재밌어!'},
      {when:p=>sejinEM(p), text:'전학생이야? 나 세진. 음악 좋아하면 밴드부 들어와, 환영해.'},
      {when:p=>sejinER(p), text:'전학생이야? 실력 있으면 밴드부 들어와. 없으면 말고.'},
      {when:p=>sejinMS(p), text:'...전학 오셨구나. 저 세진이에요. 음악 좋아하면 얘기해요.'},
      {when:p=>sejinMM(p), text:'...나 세진이야. 음악 좋아해? 밴드부도 있어.'},
      {when:p=>sejinMR(p), text:'나 세진. 음악실은 3층이야. 방해하지 마.'},
      {when:p=>sejinIS(p), text:'...전학 오셨구나. 힘들면 음악 들어봐. 추천해줄 수 있어.'},
      {when:p=>sejinIM(p), text:'...나 세진이야. 음악 좋아해?'},
      {when:_=>true,       text:'...이어폰 꽂혀있으면 말 걸지 마.'}
    ],
    choices:[
      {id:'p3a',text:'관심 있어요',nextSceneId:'prologue_004',affectionDelta:{sejin:12}},
      {id:'p3b',text:'생각해볼게요',nextSceneId:'prologue_004',affectionDelta:{sejin:5}}
    ]
  },

  prologue_004: {
    id:'prologue_004', background:'library',
    sprites:[{id:'daeun',position:'center',emotion:'neutral',active:true}],
    speaker:'daeun', dialogueMode:'static',
    dialogues:[
      {when:p=>daeunTE(p), text:'어머, 전학생이죠? 저 다은이에요! 이 책 읽어봤어요? 진짜 감동적이에요, 주인공이 마지막에...'},
      {when:p=>daeunTM(p), text:'전학생이군요, 다은이에요. 도서관 자주 와요? 책 추천해줄게요.'},
      {when:p=>daeunTC(p), text:'전학생이군요. 도서관 규칙은 저기 붙어있어요. 조용히 해주세요.'},
      {when:p=>daeunME(p), text:'...안녕하세요. 전학 오셨군요. 새로운 시작이네요, 설레지 않아요?'},
      {when:p=>daeunMM(p), text:'...안녕하세요. 다은이에요. 책 좋아하면 같이 읽어요.'},
      {when:p=>daeunMC(p), text:'...안녕하세요. 도서관은 조용히 이용해주세요.'},
      {when:p=>daeunQE(p), text:'...안녕하세요. ...설레는 하루네요, 그쵸?'},
      {when:p=>daeunQM(p), text:'...안녕하세요.'},
      {when:_=>true,       text:'...조용히 해주세요. 책 읽는 중이에요.'}
    ],
    choices:[
      {id:'p4a',text:'재밌겠다',nextSceneId:'prologue_005',affectionDelta:{daeun:12}},
      {id:'p4b',text:'나중에 읽어볼게요',nextSceneId:'prologue_005',affectionDelta:{daeun:6}}
    ]
  },

  prologue_005: {
    id:'prologue_005', background:'classroom', speaker:'narrator', dialogueMode:'static',
    staticText:'첫날이 끝나가고 있었다.',
    nextSceneId:'prologue_006'
  },
  prologue_006: {
    id:'prologue_006', background:'classroom',
    sprites:[{id:'haru',position:'left',emotion:'happy',active:true},{id:'sejin',position:'right',emotion:'neutral',active:false},{id:'daeun',position:'center',emotion:'neutral',active:false}],
    speaker:'haru', dialogueMode:'static', staticText:'오늘 어땠어? 적응 좀 됐어?',
    nextSceneId:'prologue_007'
  },
  prologue_007: {
    id:'prologue_007', background:'classroom',
    sprites:[{id:'haru',position:'left',emotion:'happy',active:false},{id:'sejin',position:'right',emotion:'neutral',active:true},{id:'daeun',position:'center',emotion:'neutral',active:false}],
    speaker:'sejin', dialogueMode:'static', staticText:'뭐, 내일부터가 진짜지.',
    nextSceneId:'prologue_008'
  },
  prologue_008: {
    id:'prologue_008', background:'classroom',
    sprites:[{id:'haru',position:'left',emotion:'happy',active:false},{id:'sejin',position:'right',emotion:'neutral',active:false},{id:'daeun',position:'center',emotion:'neutral',active:true}],
    speaker:'daeun', dialogueMode:'static', staticText:'천천히 적응하면 돼요. 우리가 있잖아요.',
    choices:[
      {id:'ep1',text:'다들 고마워요',nextSceneId:'ch1_001',affectionDelta:{haru:3,sejin:3,daeun:3}},
      {id:'ep2',text:'덕분에 괜찮았어요',nextSceneId:'ch1_001',affectionDelta:{haru:5,sejin:5,daeun:5}},
      {id:'ep3',text:'아직 어색하지만...',nextSceneId:'ch1_001',affectionDelta:{haru:2,sejin:2,daeun:2}}
    ]
  },

  ch1_001: {
    id:'ch1_001', background:'classroom', speaker:'narrator', dialogueMode:'static',
    staticText:'방과 후, 세 사람 모두 손을 내밀어 왔다. 나는 누구에게 먼저 다가갈지 망설였다.',
    choices:[
      {id:'c1',text:'하루에게 반장 일을 도와주겠다고 한다',nextSceneId:'ch1_haru_001',affectionDelta:{haru:12}},
      {id:'c2',text:'세진의 기타 소리를 따라 음악실로 간다',nextSceneId:'ch1_sejin_001',affectionDelta:{sejin:12}},
      {id:'c3',text:'다은 옆에 조용히 앉아 책을 펼친다',nextSceneId:'ch1_daeun_001',affectionDelta:{daeun:12}}
    ]
  },

  ch1_haru_001: {
    id:'ch1_haru_001', background:'classroom',
    sprites:[{id:'haru',position:'right',emotion:'neutral',active:true}],
    speaker:'haru', dialogueMode:'static',
    dialogues:[
      {when:p=>haruWP(p), text:'진짜? 도와줄 거야?! 잘됐다ㅋㅋ 나 사실 하나도 못 해서 죽겠었어. 같이 하면 금방이야!'},
      {when:p=>haruWM(p), text:'도와줄 수 있어? 솔직히 좀 많긴 해. 고마워, 같이 하면 훨씬 나을 것 같아.'},
      {when:p=>haruWS(p), text:'저 있잖아, 반장 일 좀 도와줄 수 있어? 혼자 하기엔 좀 많아서... 싫으면 괜찮아.'},
      {when:p=>haruMP(p), text:'어, 마침 잘 됐다! 반장 일 좀 있는데, 빨리 끝내면 우리 뭔가 하자ㅋㅋ'},
      {when:p=>haruMM(p), text:'반장 일 도움 필요해. 오늘 시간 있어? 그리 오래 안 걸려.'},
      {when:p=>haruMS(p), text:'반장 일 있는데 도움 줄 수 있어? 빨리 끝내면 너도 일찍 갈 수 있어.'},
      {when:p=>haruCP(p), text:'어, 왔어? 마침 일 많아서 죽겠었는데ㅋ 도와줄 수 있어? 나 혼자 다 못 해.'},
      {when:p=>haruCM(p), text:'너 오늘 시간 있어? 반장 일 도움 필요해. 빨리 끝내면 너도 일찍 집에 가.'},
      {when:_=>true,      text:'...일 있어. 도와줄 수 있어?'}
    ],
    choices:[
      {id:'h1a',text:'도와줄게요',nextSceneId:'ch1_haru_002',affectionDelta:{haru:15}},
      {id:'h1b',text:'오늘은 좀 힘들어요',nextSceneId:'ch1_route_check',affectionDelta:{haru:-5}}
    ]
  },
  ch1_haru_002: {
    id:'ch1_haru_002', background:'park',
    sprites:[{id:'haru',position:'center',emotion:'happy',active:true}],
    speaker:'haru', dialogueMode:'static',
    dialogues:[
      {when:p=>haruWP(p), text:'야 우리 같은 방향이잖아! 같이 가자~ 좋아하는 음식 뭐야? 맛집 완전 많이 알거든!'},
      {when:p=>haruWM(p), text:'어, 같은 방향이네. 같이 가도 돼? 오늘 고마웠어.'},
      {when:p=>haruWS(p), text:'혹시 같은 방향이면 같이 가도 돼. ...오늘 정말 도움 많이 됐어.'},
      {when:p=>haruMP(p), text:'같은 방향이야? 같이 가자! 이 길 사실 맛집 있거든ㅋㅋ'},
      {when:p=>haruMM(p), text:'같은 방향이면 같이 가도 돼. ...말 나온 김에.'},
      {when:p=>haruMS(p), text:'...혹시 같은 방향이야? 같이 가도 되면 그러자.'},
      {when:p=>haruCP(p), text:'어, 같은 방향이잖아. 가자ㅋ 어색하게 따로 갈 필요 없잖아.'},
      {when:p=>haruCM(p), text:'같은 방향이면 같이 가. 굳이 따로 갈 이유 없으니까.'},
      {when:_=>true,      text:'...같이 가도 돼. 이상하려나.'}
    ],
    choices:[
      {id:'h2a',text:'같이 가요!',nextSceneId:'ch1_route_check',affectionDelta:{haru:12}},
      {id:'h2b',text:'저 다른 방향이에요',nextSceneId:'ch1_route_check',affectionDelta:{haru:0}}
    ]
  },

  ch1_sejin_001: {
    id:'ch1_sejin_001', background:'musicRoom',
    sprites:[{id:'sejin',position:'left',emotion:'happy',active:true}],
    speaker:'sejin', dialogueMode:'static',
    dialogues:[
      {when:p=>sejinES(p), text:'왔어? 잘됐다, 마침 들어줄 사람 필요했어! 이 곡 들어봐, 솔직히 말해줘.'},
      {when:p=>sejinEM(p), text:'왔어? 어, 이 곡 들어봐. 어때?'},
      {when:p=>sejinER(p), text:'왔어? 잘 됐다, 마침 사람 필요했어. 이 곡 들어봐, 어때?'},
      {when:p=>sejinMS(p), text:'...왔구나. 저기 앉아서 이거 한번 들어봐.'},
      {when:p=>sejinMM(p), text:'...왔어. 저기 앉아. 방해하지 말고 들어봐.'},
      {when:p=>sejinMR(p), text:'...왔어. 저기 앉아. 말 걸지 마.'},
      {when:p=>sejinIS(p), text:'...어, 왔구나. 저기 앉아. ...들어볼래?'},
      {when:p=>sejinIM(p), text:'...어, 왔구나. 저기 앉아. 방해하지 말고 들어봐.'},
      {when:_=>true,       text:'...왔어. 저기 앉아.'}
    ],
    choices:[
      {id:'s1a',text:'진짜 잘 친다',nextSceneId:'ch1_sejin_002',affectionDelta:{sejin:15}},
      {id:'s1b',text:'...좋은데요',nextSceneId:'ch1_sejin_002',affectionDelta:{sejin:8}}
    ]
  },
  ch1_sejin_002: {
    id:'ch1_sejin_002', background:'rooftop',
    sprites:[{id:'sejin',position:'left',emotion:'neutral',active:true}],
    speaker:'sejin', dialogueMode:'static',
    dialogues:[
      {when:p=>sejinES(p), text:'옥상 자주 와? 나 여기 진짜 좋아하거든. 탁 트여서. 너는 어때?'},
      {when:p=>sejinEM(p), text:'여기 자주 와. 조용하거든. 너는 좋아하는 장소 있어?'},
      {when:p=>sejinER(p), text:'여기 자주 와. 조용해서. 뭐, 상관없지?'},
      {when:p=>sejinMS(p), text:'여기 자주 와. 조용하거든. 너는 음악 들을 때 어떤 기분이야?'},
      {when:p=>sejinMM(p), text:'...여기 자주 와. 조용해서.'},
      {when:p=>sejinMR(p), text:'왜 따라왔어. ...뭐, 이왕 온 거 앉아.'},
      {when:p=>sejinIS(p), text:'...여기서 보이는 거 어때? 나는 이게 좋아서 자주 와.'},
      {when:p=>sejinIM(p), text:'왜 따라왔어. ...뭐, 이왕 온 거 앉아.'},
      {when:_=>true,       text:'왜 따라왔어. ...뭐, 이왕 온 거 앉아.'}
    ],
    choices:[
      {id:'s2a',text:'나도 그런 것 같아요',nextSceneId:'ch1_route_check',affectionDelta:{sejin:15}},
      {id:'s2b',text:'좋다',nextSceneId:'ch1_route_check',affectionDelta:{sejin:12}}
    ]
  },

  ch1_daeun_001: {
    id:'ch1_daeun_001', background:'library',
    sprites:[{id:'daeun',position:'center',emotion:'neutral',active:true}],
    speaker:'daeun', dialogueMode:'static',
    dialogues:[
      {when:p=>daeunTE(p), text:'이 책 읽어봤어요? 주인공이 말하는 장면이 진짜 감동적이에요! 빌려드릴게요, 꼭 읽어봐요!'},
      {when:p=>daeunTM(p), text:'이 책 추천이에요. 재미있거든요. 읽어보면 좋을 것 같아요.'},
      {when:p=>daeunTC(p), text:'이 책 추천이에요. 읽으면 도움 될 거예요. 감상 들려주면 나쁘지 않을 것 같아요.'},
      {when:p=>daeunME(p), text:'...이 책 읽어봤어요? 빌려드릴 수 있어요. ...읽어보면 좋겠어요.'},
      {when:p=>daeunMM(p), text:'...이 책 추천이에요. 읽으면 도움 될 거예요.'},
      {when:p=>daeunMC(p), text:'...이 책 읽으면 도움 될 거예요.'},
      {when:p=>daeunQE(p), text:'...이 책 빌려드릴까요? ...좋아하실 것 같아서요.'},
      {when:p=>daeunQM(p), text:'...이 책이에요. 읽으면 도움 될 거예요.'},
      {when:_=>true,       text:'...이 책 추천이에요. 감상 들려주면... 나쁘지 않을 것 같아요.'}
    ],
    choices:[
      {id:'d1a',text:'읽어보고 싶다',nextSceneId:'ch1_daeun_002',affectionDelta:{daeun:15}},
      {id:'d1b',text:'빌려줄 수 있어요?',nextSceneId:'ch1_daeun_002',affectionDelta:{daeun:12}}
    ]
  },
  ch1_daeun_002: {
    id:'ch1_daeun_002', background:'park',
    sprites:[{id:'daeun',position:'center',emotion:'blush',active:true}],
    speaker:'daeun', dialogueMode:'static',
    dialogues:[
      {when:p=>daeunTE(p), text:'아까 그 책 말이에요! 사실 결말이 처음엔 별로였는데, 다시 읽으니까 작가 의도가 보이더라고요!'},
      {when:p=>daeunTM(p), text:'아까 그 책, 사실 두 번 읽었어요. 다시 보니까 다른 게 보이더라고요.'},
      {when:p=>daeunTC(p), text:'아까 그 책 말이에요, 사실 결말이 처음엔 별로였거든요? 근데 다시 읽으니까 작가 의도가 보이더라고요.'},
      {when:p=>daeunME(p), text:'...저 이 길 좋아해요. 낙엽 밟는 소리가 좋거든요. ...같이 걸어도 돼요.'},
      {when:p=>daeunMM(p), text:'...이 길 좋아해요. 조용해서요. ...같이 걸어도 돼요.'},
      {when:p=>daeunMC(p), text:'...이 길 지름길이에요. 같이 가도 돼요.'},
      {when:p=>daeunQE(p), text:'...저 이 길이 좋아요. 아무 말 안 해도 되는 느낌이라서요.'},
      {when:p=>daeunQM(p), text:'...이 길로 가요. 조용해서 좋아요.'},
      {when:_=>true,       text:'...저 사실 이 길 좋아해요. 낙엽 밟는 소리가 좋거든요. ...같이 걸어도 돼요.'}
    ],
    choices:[
      {id:'d2a',text:'어떤 의도였어요?',nextSceneId:'ch1_route_check',affectionDelta:{daeun:15}},
      {id:'d2b',text:'나도 좋아요',nextSceneId:'ch1_route_check',affectionDelta:{daeun:15}}
    ]
  },

  ch1_route_check: {
    id:'ch1_route_check', background:'rooftop', speaker:'narrator', dialogueMode:'static',
    staticText:'시간이 흘러, 세 사람과 조금씩 가까워졌다. 이제 누구의 이야기를 더 들어볼까.',
    choices:[
      {id:'r1',text:'하루와 더 가까워지고 싶다',nextSceneId:'ch2_haru_001',setFlag:'route_haru'},
      {id:'r2',text:'세진의 음악 세계가 궁금하다',nextSceneId:'ch2_sejin_001',setFlag:'route_sejin'},
      {id:'r3',text:'다은의 조용한 세계가 좋다',nextSceneId:'ch2_daeun_001',setFlag:'route_daeun'}
    ]
  },

  ch2_haru_001: {
    id:'ch2_haru_001', background:'rooftop',
    sprites:[{id:'haru',position:'center',emotion:'sad',active:true}],
    speaker:'haru', dialogueMode:'static',
    dialogues:[
      {when:p=>haruWP(p), text:'...야, 봤어? 나 사실 가끔 혼자 여기 와ㅋ 항상 웃는 건 아니거든. 비밀이야.'},
      {when:p=>haruWM(p), text:'...봤구나. 나 사실 가끔 여기 와. 항상 씩씩해야 하는 건 아니잖아.'},
      {when:p=>haruWS(p), text:'...아, 봤어? 나 사실 가끔 혼자 여기 와. 항상 씩씩해야 하는 건 아니잖아.'},
      {when:p=>haruMP(p), text:'...어, 왔어? 뭐야ㅋ 이런 모습 들켰네. 비밀 지켜줄 거지?'},
      {when:p=>haruMM(p), text:'...여기 자주 와. 조용해서. 그냥 가끔 혼자 있고 싶을 때 있잖아.'},
      {when:p=>haruMS(p), text:'...왔어. 뭐야, 여기까지. ...아무한테도 말하지 마.'},
      {when:p=>haruCP(p), text:'...뭐야, 왜 여기 있어. 아무한테도 말하지 마. 그냥 가.'},
      {when:p=>haruCM(p), text:'...왜 여기 있어. ...아무한테도 말하지 마.'},
      {when:_=>true,      text:'...뭐야, 왜 여기 있어. 아무한테도 말하지 마. 그냥 가.'}
    ],
    choices:[
      {id:'h3a',text:'당연하죠',nextSceneId:'ch2_haru_002',affectionDelta:{haru:20}},
      {id:'h3b',text:'걱정돼서요',nextSceneId:'ch2_haru_002',affectionDelta:{haru:20}}
    ]
  },
  ch2_haru_002: {
    id:'ch2_haru_002', background:'classroom',
    sprites:[{id:'haru',position:'right',emotion:'blush',active:true}],
    speaker:'haru', dialogueMode:'static',
    dialogues:[
      {when:p=>haruWP(p), text:'야 자고 있어?ㅋ 나 공부하다가 너 생각났잖아. ...내일 시험 같이 잘 보자.'},
      {when:p=>haruWM(p), text:'자고 있어? 나 공부하다가 너 생각났어. ...내일 시험 잘 보자.'},
      {when:p=>haruWS(p), text:'야 자고 있어? 나 지금 공부하다가 너 생각났는데ㅋㅋ ...내일 시험 잘 보자.'},
      {when:p=>haruMP(p), text:'야! 자고 있어? 시험 공부는 했어? 나 알려줄 수 있는데ㅋ ...잘 자.'},
      {when:p=>haruMM(p), text:'자고 있어? ...내일 시험, 모르는 거 있으면 물어봐. 잘 자.'},
      {when:p=>haruMS(p), text:'내일 시험... 잘 볼 수 있겠어? 모르는 거 있으면 아직 시간 있으니까. ...잘 자.'},
      {when:p=>haruCP(p), text:'야, 시험 준비는 했어? ...뭐, 잘 자.'},
      {when:p=>haruCM(p), text:'내일 시험... 잘 볼 수 있겠어? ...잘 자.'},
      {when:_=>true,      text:'내일 시험... 잘 볼 수 있겠어? 모르는 거 있으면 아직 시간 있으니까. ...잘 자.'}
    ],
    choices:[
      {id:'h4a',text:'나도 생각하고 있었어요',nextSceneId:'ch2_haru_003',affectionDelta:{haru:20}},
      {id:'h4b',text:'고마워요, 하루씨도요',nextSceneId:'ch2_haru_003',affectionDelta:{haru:20}}
    ]
  },
  ch2_haru_003: {
    id:'ch2_haru_003', background:'classroom',
    sprites:[{id:'haru',position:'right',emotion:'surprised',active:true}],
    speaker:'haru', dialogueMode:'static',
    dialogues:[
      {when:p=>haruWP(p), text:'저기! 아까 그거 완전 오해야. 나 그런 말 한 적 없거든? 믿어줄 수 있어?'},
      {when:p=>haruWM(p), text:'저기... 아까 그거, 오해야. 나 사실 그런 말 한 적 없어. 믿어줄 수 있어?'},
      {when:p=>haruWS(p), text:'저기... 아까 그거, 오해야. 나 사실 그런 말 한 적 없어. 믿어줄 수 있어?'},
      {when:p=>haruMP(p), text:'야! 아까 그거 오해야, 진짜로. ...믿어줄 거지?'},
      {when:p=>haruMM(p), text:'...아까 그거, 오해야. 해명하고 싶어서.'},
      {when:p=>haruMS(p), text:'...오해한 거야. 해명하기 싫은데 그냥 넘어가기도 싫어서.'},
      {when:p=>haruCP(p), text:'...오해야. 그냥 넘어갔으면 됐는데 말이 나왔으니까 하는 거야.'},
      {when:p=>haruCM(p), text:'...오해한 거야. 해명하기 싫은데 그냥 넘어가기도 싫어서.'},
      {when:_=>true,      text:'...오해한 거야. 해명하기 싫은데 그냥 넘어가기도 싫어서.'}
    ],
    choices:[
      {id:'h5a',text:'믿어요',nextSceneId:'ch3_haru_start',affectionDelta:{haru:25}},
      {id:'h5b',text:'설명해줘요',nextSceneId:'ch3_haru_start',affectionDelta:{haru:15}}
    ]
  },

  ch2_sejin_001: {
    id:'ch2_sejin_001', background:'musicRoom',
    sprites:[{id:'sejin',position:'center',emotion:'neutral',active:true}],
    speaker:'sejin', dialogueMode:'static',
    dialogues:[
      {when:p=>sejinES(p), text:'내일 공연인데 솔직히 좀 떨려. 이런 말 아무한테나 안 하는데... 너한테는 왠지 괜찮을 것 같아.'},
      {when:p=>sejinEM(p), text:'내일 공연인데 솔직히 좀 떨려. ...이런 말 왜 하는지 모르겠는데.'},
      {when:p=>sejinER(p), text:'내일 공연인데 솔직히 좀 떨려. ...이런 말 너한테는 왠지 말할 수 있을 것 같아서.'},
      {when:p=>sejinMS(p), text:'...내일 공연이야. 솔직히 좀 긴장돼. 처음 말하는 건데.'},
      {when:p=>sejinMM(p), text:'...내일 공연. ...사실 좀 떨려.'},
      {when:p=>sejinMR(p), text:'...내일 공연. ...사실 무서워. 왜 말하는지 모르겠는데.'},
      {when:p=>sejinIS(p), text:'...내일 공연이야. ...긴장돼. 처음 고백하는 건데.'},
      {when:p=>sejinIM(p), text:'...내일 공연. ...사실 무서워. 왜 말하는지 모르겠는데.'},
      {when:_=>true,       text:'...내일 공연. ...사실 무서워. 왜 말하는지 모르겠는데.'}
    ],
    choices:[
      {id:'s3a',text:'저도 갈게요',nextSceneId:'ch2_sejin_002',affectionDelta:{sejin:25}},
      {id:'s3b',text:'잘 할 수 있어요',nextSceneId:'ch2_sejin_002',affectionDelta:{sejin:20}}
    ]
  },
  ch2_sejin_002: {
    id:'ch2_sejin_002', background:'park',
    sprites:[{id:'sejin',position:'center',emotion:'happy',active:true}],
    speaker:'narrator', dialogueMode:'static',
    staticText:'세진이의 기타 소리가 울려 퍼졌다.',
    nextSceneId:'ch2_sejin_003'
  },
  ch2_sejin_003: {
    id:'ch2_sejin_003', background:'park',
    sprites:[{id:'sejin',position:'center',emotion:'happy',active:true}],
    speaker:'sejin', dialogueMode:'static',
    dialogues:[
      {when:p=>sejinES(p), text:'왔구나! 고마워, 진짜로. 네가 있으니까 달랐어. 어떻게 봤어?'},
      {when:p=>sejinEM(p), text:'...왔구나. 고마워. 봐줘서.'},
      {when:p=>sejinER(p), text:'...봤어? 어땠어? 솔직하게 말해.'},
      {when:p=>sejinMS(p), text:'...왔구나. 고마워. 진짜로.'},
      {when:p=>sejinMM(p), text:'...왔어. 뭐, 어땠어?'},
      {when:p=>sejinMR(p), text:'...봤어? 뭐, 나쁘지 않았지?'},
      {when:p=>sejinIS(p), text:'...왔구나. ...고마워.'},
      {when:p=>sejinIM(p), text:'...왔어. ...봤어?'},
      {when:_=>true,       text:'...봤어? 뭐, 나쁘지 않았지?'}
    ],
    choices:[
      {id:'s4a',text:'최고였어요!',nextSceneId:'ch2_sejin_004',affectionDelta:{sejin:20}},
      {id:'s4b',text:'감동받았어요',nextSceneId:'ch2_sejin_004',affectionDelta:{sejin:20}}
    ]
  },
  ch2_sejin_004: {
    id:'ch2_sejin_004', background:'rooftop',
    sprites:[{id:'sejin',position:'left',emotion:'blush',active:true}],
    speaker:'narrator', dialogueMode:'static',
    staticText:'세진이가 조용히 이어폰 한쪽을 건넸다.',
    nextSceneId:'ch2_sejin_005'
  },
  ch2_sejin_005: {
    id:'ch2_sejin_005', background:'rooftop',
    sprites:[{id:'sejin',position:'left',emotion:'blush',active:true}],
    speaker:'sejin', dialogueMode:'static',
    dialogues:[
      {when:p=>sejinES(p), text:'이거 내가 제일 좋아하는 곡이야. 같이 들어볼래? 한쪽씩.'},
      {when:p=>sejinEM(p), text:'이거 내가 제일 좋아하는 곡이야. 같이 들어볼래?'},
      {when:p=>sejinER(p), text:'...이거 좋은 곡이야. 한번 들어봐.'},
      {when:p=>sejinMS(p), text:'이거... 내가 제일 좋아하는 곡이야. 같이 들어볼래?'},
      {when:p=>sejinMM(p), text:'...그냥. 한번 들어봐.'},
      {when:p=>sejinMR(p), text:'...그냥. 한번 들어봐. 싫으면 말고.'},
      {when:p=>sejinIS(p), text:'...이거, 내가 제일 좋아하는 곡이야. ...같이 들어볼래?'},
      {when:p=>sejinIM(p), text:'...그냥. 한번 들어봐.'},
      {when:_=>true,       text:'...그냥. 한번 들어봐. 싫으면 말고.'}
    ],
    choices:[
      {id:'s5a',text:'고마워요',nextSceneId:'ch3_sejin_start',affectionDelta:{sejin:25}},
      {id:'s5b',text:'어떤 곡이에요?',nextSceneId:'ch3_sejin_start',affectionDelta:{sejin:20}}
    ]
  },

  ch2_daeun_001: {
    id:'ch2_daeun_001', background:'library',
    sprites:[{id:'daeun',position:'center',emotion:'blush',active:true}],
    speaker:'daeun', dialogueMode:'static',
    dialogues:[
      {when:p=>daeunTE(p), text:'사실 저 글을 써요! 아무한테도 보여준 적 없는데, 왠지 너한테는 보여주고 싶었어요!'},
      {when:p=>daeunTM(p), text:'사실 저 글을 써요. 아무한테도 말 안 했는데, 왠지 말하고 싶었어요.'},
      {when:p=>daeunTC(p), text:'사실 저 글을 써요. 아무한테도 보여준 적 없는데, 왠지 너한테는 보여주고 싶었어요.'},
      {when:p=>daeunME(p), text:'...사실 글을 써요. ...보여드릴게요. 솔직하게 말해줘요.'},
      {when:p=>daeunMM(p), text:'...이거, 제가 쓴 거예요. ...읽어볼래요?'},
      {when:p=>daeunMC(p), text:'이거... 제가 쓴 거예요. 감상 말해줄 수 있어요? 솔직하게요.'},
      {when:p=>daeunQE(p), text:'...저, 사실 글 써요. ...이거 봐줄 수 있어요?'},
      {when:p=>daeunQM(p), text:'...이거, 제가 쓴 거예요. ...봐줄 수 있어요?'},
      {when:_=>true,       text:'이거... 제가 쓴 거예요. 감상 말해줄 수 있어요? 솔직하게요.'}
    ],
    choices:[
      {id:'d3a',text:'읽어봐도 돼요?',nextSceneId:'ch2_daeun_002',affectionDelta:{daeun:25}},
      {id:'d3b',text:'정말 좋아요',nextSceneId:'ch2_daeun_002',affectionDelta:{daeun:20}}
    ]
  },
  ch2_daeun_002: {
    id:'ch2_daeun_002', background:'library',
    sprites:[{id:'daeun',position:'center',emotion:'happy',active:true}],
    speaker:'daeun', dialogueMode:'static',
    dialogues:[
      {when:p=>daeunTE(p), text:'비 오는 날 도서관이 진짜 최고예요! 빗소리 들리잖아요. 오늘 여기 있어줄 수 있어요?'},
      {when:p=>daeunTM(p), text:'비 오는 날 도서관이 좋아요. 빗소리 들리잖아요. ...같이 있어도 돼요.'},
      {when:p=>daeunTC(p), text:'비 오는 날 도서관이 제일 좋아요. 창문에 빗소리 들리잖아요. ...오늘 여기 있어줄 수 있어요?'},
      {when:p=>daeunME(p), text:'...비 오는 날 도서관이 좋아요. ...같이 있어줄 수 있어요?'},
      {when:p=>daeunMM(p), text:'...비가 오네요. 여기 있어도 돼요. 방해는 하지 말고요.'},
      {when:p=>daeunMC(p), text:'...비가 오네요. 어차피 갈 데 없으면 여기 있어요. 방해는 하지 말고요.'},
      {when:p=>daeunQE(p), text:'...비 오는 날이 좋아요. ...같이 있어줄래요?'},
      {when:p=>daeunQM(p), text:'...비가 오네요. ...여기 있어도 돼요.'},
      {when:_=>true,       text:'...비가 오네요. 어차피 갈 데 없으면 여기 있어요. 방해는 하지 말고요.'}
    ],
    choices:[
      {id:'d4a',text:'같이 있을게요',nextSceneId:'ch2_daeun_003',affectionDelta:{daeun:25}},
      {id:'d4b',text:'그럴게요',nextSceneId:'ch2_daeun_003',affectionDelta:{daeun:20}}
    ]
  },
  ch2_daeun_003: {
    id:'ch2_daeun_003', background:'park',
    sprites:[{id:'daeun',position:'center',emotion:'blush',active:true}],
    speaker:'daeun', dialogueMode:'static',
    dialogues:[
      {when:p=>daeunTE(p), text:'저 사실 작가가 되고 싶어요! 아무한테도 못 했는데 말해버렸네요. 이상하죠?'},
      {when:p=>daeunTM(p), text:'저 사실 작가가 되고 싶어요. 아무한테도 말 못했는데. 웃기죠?'},
      {when:p=>daeunTC(p), text:'저 사실 작가가 되고 싶어요. 근데 아무한테도 말 못했어요. 웃기죠?'},
      {when:p=>daeunME(p), text:'...꿈이 있어요. ...작가가 되고 싶어요. 웃기지 않아요?'},
      {when:p=>daeunMM(p), text:'...꿈이 있어요. 말하기 좀 부끄럽지만. ...작가요.'},
      {when:p=>daeunMC(p), text:'...꿈이 있어요. 말하기 부끄럽지만. ...작가요.'},
      {when:p=>daeunQE(p), text:'...저, 꿈이 있어요. ...작가요. 말하기 좀 무서웠는데.'},
      {when:p=>daeunQM(p), text:'...꿈이 있어요. ...작가요.'},
      {when:_=>true,       text:'...꿈이 있어요. 말하기 부끄럽지만. ...작가요.'}
    ],
    choices:[
      {id:'d5a',text:'잘 어울려요',nextSceneId:'ch3_daeun_start',affectionDelta:{daeun:25}},
      {id:'d5b',text:'응원할게요',nextSceneId:'ch3_daeun_start',affectionDelta:{daeun:22}}
    ]
  },

  ch3_haru_start: {
    id:'ch3_haru_start', background:'rooftop',
    sprites:[{id:'haru',position:'center',emotion:'blush',active:true}],
    speaker:'haru', dialogueMode:'static',
    dialogues:[
      {when:p=>haruWP(p), text:'야, 나 할 말이 있어! 평소엔 이런 말 잘 하는데 지금은 왜 이렇게 심장이 빨리 뛰지ㅋㅋ'},
      {when:p=>haruWM(p), text:'저기, 할 말이 있어. 듣기 전에 마음 단단히 먹어줘.'},
      {when:p=>haruWS(p), text:'저기... 할 말이 있어. 들어줄 수 있어?'},
      {when:p=>haruMP(p), text:'야! 나 할 말 있어. 긴장되는데ㅋ 들어줄 거지?'},
      {when:p=>haruMM(p), text:'...할 말이 있어. 조금만 들어줘.'},
      {when:p=>haruMS(p), text:'...할 말이 있어. 들어줄 수 있어?'},
      {when:p=>haruCP(p), text:'...할 말 있어. 짧게 할게.'},
      {when:p=>haruCM(p), text:'...할 말 있어. 들어줄 수 있어?'},
      {when:_=>true,      text:'저기... 할 말이 있어. 들어줄 수 있어?'}
    ],
    nextSceneId:'ch3_haru_choice'
  },
  ch3_haru_choice: {
    id:'ch3_haru_choice', background:'rooftop', speaker:'narrator', dialogueMode:'static',
    staticText:'하루의 뺨이 분홍빛으로 물들었다. 나는 어떻게 답해야 할까.',
    choices:[
      {id:'hc1',text:'나도 할 말 있어요',nextSceneId:'ch3_haru_confess',affectionDelta:{haru:10}},
      {id:'hc2',text:'무슨 말이에요?',nextSceneId:'ch3_haru_confess'}
    ]
  },
  ch3_haru_confess: {
    id:'ch3_haru_confess', background:'rooftop',
    sprites:[{id:'haru',position:'center',emotion:'blush',active:true}],
    speaker:'haru', dialogueMode:'static',
    staticText:'나... 너 좋아해. 전학 온 첫날부터 계속 신경 쓰였어. 이상하지? 반장이 전학생한테 이러면ㅋㅋ ...근데 진짜야.',
    choices:[
      {id:'ha1',text:'"나도요."',nextSceneId:'ending_haru_a',affectionDelta:{haru:20}},
      {id:'ha2',text:'"고마워요."',nextSceneId:'ending_haru_b',affectionDelta:{haru:-5}}
    ]
  },

  ch3_sejin_start: {
    id:'ch3_sejin_start', background:'park',
    sprites:[{id:'sejin',position:'center',emotion:'neutral',active:true}],
    speaker:'sejin', dialogueMode:'static',
    dialogues:[
      {when:p=>sejinES(p), text:'오늘 공연, 네가 와줘서 완전 달랐어. 진짜야. 고마워.'},
      {when:p=>sejinEM(p), text:'오늘 공연... 네가 와줘서 달랐어. 나한테 음악이 중요한 것처럼, 너도 그렇게 됐어.'},
      {when:p=>sejinER(p), text:'오늘 잘 됐어. 네 덕분인지도 몰라.'},
      {when:p=>sejinMS(p), text:'오늘 공연... 네가 와줘서 달랐어. 나한테 음악이 중요한 것처럼, 너도 그렇게 됐어.'},
      {when:p=>sejinMM(p), text:'...오늘 잘 됐어. 고마워.'},
      {when:p=>sejinMR(p), text:'...고마워. 오늘 잘 됐어. 네 덕분인지도 몰라.'},
      {when:p=>sejinIS(p), text:'...오늘 공연. 네가 와줘서 달랐어. ...고마워.'},
      {when:p=>sejinIM(p), text:'...고마워. 오늘 잘 됐어.'},
      {when:_=>true,       text:'...고마워. 오늘 잘 됐어. 네 덕분인지도 몰라.'}
    ],
    nextSceneId:'ch3_sejin_choice'
  },
  ch3_sejin_choice: {
    id:'ch3_sejin_choice', background:'park', speaker:'narrator', dialogueMode:'static',
    staticText:'세진이가 이어폰을 빼고 처음으로 제대로 눈을 마주쳤다.',
    choices:[
      {id:'sc1',text:'나도 고마워요',nextSceneId:'ch3_sejin_confess',affectionDelta:{sejin:10}},
      {id:'sc2',text:'세진씨 덕분이에요',nextSceneId:'ch3_sejin_confess'}
    ]
  },
  ch3_sejin_confess: {
    id:'ch3_sejin_confess', background:'rooftop',
    sprites:[{id:'sejin',position:'center',emotion:'blush',active:true}],
    speaker:'sejin', dialogueMode:'static',
    staticText:'있잖아. 나 원래 사람들한테 별로 관심 없거든. 근데 너는 달라. ...좋아해.',
    choices:[
      {id:'sa1',text:'"나도요."',nextSceneId:'ending_sejin_a',affectionDelta:{sejin:20}},
      {id:'sa2',text:'"고마워요."',nextSceneId:'ending_sejin_b',affectionDelta:{sejin:-5}}
    ]
  },

  ch3_daeun_start: {
    id:'ch3_daeun_start', background:'library',
    sprites:[{id:'daeun',position:'center',emotion:'blush',active:true}],
    speaker:'daeun', dialogueMode:'static',
    dialogues:[
      {when:p=>daeunTE(p), text:'이 책 마지막 페이지에 제가 글 썼어요! 너한테만 보여주는 거예요. "네가 내 이야기의 첫 독자였으면 해."'},
      {when:p=>daeunTM(p), text:'이 책 마지막 페이지에 제가 글 썼어요. ...너한테만 보여주는 거예요.'},
      {when:p=>daeunTC(p), text:'이 책 마지막 페이지에 제가 글 썼어요. ...너한테만 보여주는 거예요. "네가 내 이야기의 첫 독자였으면 해."'},
      {when:p=>daeunME(p), text:'...이거 받아요. 제가 쓴 첫 번째 글이에요. ...너한테만요.'},
      {when:p=>daeunMM(p), text:'...이거 받아요. 제가 쓴 거예요. ...별로면 솔직히 말해요.'},
      {when:p=>daeunMC(p), text:'이거 받아요. ...제가 쓴 첫 번째 글이에요. 별로면 솔직히 말해요.'},
      {when:p=>daeunQE(p), text:'...이거요. 제가 쓴 거예요. ...너한테만 보여주는 거예요.'},
      {when:p=>daeunQM(p), text:'...이거 받아요. 제가 쓴 거예요.'},
      {when:_=>true,       text:'이거 받아요. ...제가 쓴 첫 번째 글이에요. 별로면 솔직히 말해요.'}
    ],
    nextSceneId:'ch3_daeun_choice'
  },
  ch3_daeun_choice: {
    id:'ch3_daeun_choice', background:'library', speaker:'narrator', dialogueMode:'static',
    staticText:'도서관 창밖으로 벚꽃이 지고 있었다.',
    choices:[
      {id:'dc1',text:'소중히 할게요',nextSceneId:'ch3_daeun_confess',affectionDelta:{daeun:10}},
      {id:'dc2',text:'고마워요',nextSceneId:'ch3_daeun_confess'}
    ]
  },
  ch3_daeun_confess: {
    id:'ch3_daeun_confess', background:'library',
    sprites:[{id:'daeun',position:'center',emotion:'blush',active:true}],
    speaker:'daeun', dialogueMode:'static',
    staticText:'있잖아요. 저 글 쓸 때 항상 독자를 상상하거든요. 근데 요즘은 항상 당신이에요. ...좋아해요.',
    choices:[
      {id:'da1',text:'"나도요."',nextSceneId:'ending_daeun_a',affectionDelta:{daeun:20}},
      {id:'da2',text:'"고마워요."',nextSceneId:'ending_daeun_b',affectionDelta:{daeun:-5}}
    ]
  },

  ending_haru_a: {
    id:'ending_haru_a', background:'rooftop',
    sprites:[{id:'haru',position:'center',emotion:'happy',active:true}],
    speaker:'narrator', dialogueMode:'static',
    staticText:'석양이 지는 옥상에서, 하루가 처음으로 소리 내어 웃었다.',
    nextSceneId:'ending_haru_a2'
  },
  ending_haru_a2: {
    id:'ending_haru_a2', background:'rooftop',
    sprites:[{id:'haru',position:'center',emotion:'happy',active:true}],
    speaker:'haru', dialogueMode:'static',
    staticText:'...그래. 나도. 앞으로도 잘 부탁해, 바보.',
    endingKey:'haru_a', nextSceneId:'__ending__'
  },
  ending_haru_b: {
    id:'ending_haru_b', background:'classroom',
    sprites:[{id:'haru',position:'right',emotion:'sad',active:true}],
    speaker:'haru', dialogueMode:'static',
    staticText:'...그래도 돼. 억지로 하는 건 싫어. 나는 기다릴 수 있어.',
    endingKey:'haru_b', nextSceneId:'__ending__'
  },

  ending_sejin_a: {
    id:'ending_sejin_a', background:'park',
    sprites:[{id:'sejin',position:'center',emotion:'happy',active:true}],
    speaker:'narrator', dialogueMode:'static',
    staticText:'세진이가 다시 기타를 들었다. 이번엔 오직 나만을 위한 곡이었다.',
    nextSceneId:'ending_sejin_a2'
  },
  ending_sejin_a2: {
    id:'ending_sejin_a2', background:'park',
    sprites:[{id:'sejin',position:'center',emotion:'happy',active:true}],
    speaker:'sejin', dialogueMode:'static',
    staticText:'하하. 그럼 이제 내 노래 독점 청중이다, 너는. 도망치지 마.',
    endingKey:'sejin_a', nextSceneId:'__ending__'
  },
  ending_sejin_b: {
    id:'ending_sejin_b', background:'rooftop',
    sprites:[{id:'sejin',position:'left',emotion:'sad',active:true}],
    speaker:'sejin', dialogueMode:'static',
    staticText:'...그래. 솔직하게 말해줘서 고마워. 그래도 내 공연은 계속 와.',
    endingKey:'sejin_b', nextSceneId:'__ending__'
  },

  ending_daeun_a: {
    id:'ending_daeun_a', background:'library',
    sprites:[{id:'daeun',position:'center',emotion:'happy',active:true}],
    speaker:'narrator', dialogueMode:'static',
    staticText:'다은이가 새 노트를 펼쳤다. 첫 페이지 첫 줄, 오늘 날짜를 적었다.',
    nextSceneId:'ending_daeun_a2'
  },
  ending_daeun_a2: {
    id:'ending_daeun_a2', background:'library',
    sprites:[{id:'daeun',position:'center',emotion:'happy',active:true}],
    speaker:'daeun', dialogueMode:'static',
    staticText:'...다행이야. 이 순간을 책에 쓰고 싶어. 우리 이야기를.',
    endingKey:'daeun_a', nextSceneId:'__ending__'
  },
  ending_daeun_b: {
    id:'ending_daeun_b', background:'library',
    sprites:[{id:'daeun',position:'center',emotion:'sad',active:true}],
    speaker:'daeun', dialogueMode:'static',
    staticText:'...알아. 괜찮아. 여기 있을게. 언제든지.',
    endingKey:'daeun_b', nextSceneId:'__ending__'
  },

  secret_ending: {
    id:'secret_ending', background:'rooftop',
    sprites:[
      {id:'haru',position:'left',emotion:'happy',active:true},
      {id:'sejin',position:'center',emotion:'happy',active:true},
      {id:'daeun',position:'right',emotion:'happy',active:true}
    ],
    speaker:'narrator', dialogueMode:'static',
    staticText:'모든 목소리를 들었을 때, 비로소 알게 됐다. 나를 바꾼 건 그들의 목소리였다는 것을. 아니, 어쩌면 내 목소리였는지도.',
    nextSceneId:'secret_ending2'
  },
  secret_ending2: {
    id:'secret_ending2', background:'rooftop',
    sprites:[
      {id:'haru',position:'left',emotion:'happy',active:true},
      {id:'sejin',position:'center',emotion:'happy',active:false},
      {id:'daeun',position:'right',emotion:'happy',active:false}
    ],
    speaker:'haru', dialogueMode:'static', staticText:'고마워.',
    nextSceneId:'secret_ending3'
  },
  secret_ending3: {
    id:'secret_ending3', background:'rooftop',
    sprites:[
      {id:'haru',position:'left',emotion:'happy',active:false},
      {id:'sejin',position:'center',emotion:'happy',active:true},
      {id:'daeun',position:'right',emotion:'happy',active:false}
    ],
    speaker:'sejin', dialogueMode:'static', staticText:'고마워.',
    nextSceneId:'secret_ending4'
  },
  secret_ending4: {
    id:'secret_ending4', background:'rooftop',
    sprites:[
      {id:'haru',position:'left',emotion:'happy',active:false},
      {id:'sejin',position:'center',emotion:'happy',active:false},
      {id:'daeun',position:'right',emotion:'happy',active:true}
    ],
    speaker:'daeun', dialogueMode:'static', staticText:'고마워요.',
    endingKey:'secret', nextSceneId:'__ending__'
  }
}

export const getScene = (id: string): SceneStep | null => STORY_SCRIPT[id] ?? null
