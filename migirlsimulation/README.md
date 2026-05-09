# 너의 목소리로 (Your Voice)

> AI 목소리 복제 기반 한국어 비주얼 노벨 게임  
> Electron + React + OmniVoice TTS

---

## 스크린샷

게임 내에서 마이크로 목소리를 녹음하면, AI가 해당 목소리로 캐릭터 대사를 읽어줍니다.

---

## 주요 기능

- 🎭 비주얼 노벨 엔진 (Electron + React)
- 🎙️ OmniVoice 제로샷 목소리 복제 TTS
- 🤖 Claude AI 동적 대사 생성
- 💾 게임 세이브/로드
- 🌸 3인 캐릭터 분기 스토리 (하루, 세진, 다은)

---

## 시작하기

### 필수 조건

- [Node.js](https://nodejs.org/) 20 이상
- [Python](https://www.python.org/) 3.10 이상 + CUDA GPU (OmniVoice 사용 시)
- [Anthropic API Key](https://console.anthropic.com/) (Claude 대사 생성용)

### 1. 저장소 클론

```bash
git clone https://github.com/YOUR_USERNAME/migirlsimulation.git
cd migirlsimulation
```

### 2. Node 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example`을 복사해 `.env`로 저장 후 값을 채워주세요:

```bash
copy .env.example .env
```

```env
ANTHROPIC_API_KEY=sk-ant-여기에_키_입력
OMNIVOICE_HOST=http://localhost:8000
OMNIVOICE_START_CMD=   # OmniVoice 설치 경로 (선택사항)
PROXY_PORT=3001
```

### 4. OmniVoice 설치 (선택사항 — 없으면 시스템 TTS 사용)

```bash
git clone https://github.com/k2-fsa/OmniVoice
cd OmniVoice
python -m venv venv
venv\Scripts\activate
pip install -e .
```

서버 실행:
```bash
python game_server.py --model k2-fsa/OmniVoice --port 8000 --device cuda
```

> 최초 실행 시 모델 다운로드에 수 분 소요됩니다.

### 5. 게임 실행

```bash
npm run dev
```

---

## 빌드 (Windows 설치 파일)

```bash
npm run package:win
```

`dist/` 폴더에 `.exe` 설치 파일이 생성됩니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Electron + React 18 + TypeScript |
| 빌드 도구 | electron-vite |
| 상태 관리 | Zustand |
| 애니메이션 | Framer Motion |
| AI TTS | OmniVoice (k2-fsa) |
| AI 대사 | Anthropic Claude Haiku |
| 스타일 | Tailwind CSS |

---

## 라이선스

MIT
