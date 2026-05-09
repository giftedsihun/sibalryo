#!/usr/bin/env python3
"""
너의 목소리로 — OmniVoice Game API Server
FastAPI + uvicorn, port 8000

/clone  — 오디오 파일 업로드 → voice_id 반환 (참조 오디오 저장)
/tts    — text + voice_id → WAV 스트리밍
/       — health check
"""

import argparse
import io
import logging
import uuid
from pathlib import Path
import tempfile

import soundfile as sf
import torch
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── 전역 상태 ─────────────────────────────────────────────────────────────────
model = None
sampling_rate: int = 24000

TEMP_DIR = Path(tempfile.gettempdir()) / "omnivoice_game_refs"
TEMP_DIR.mkdir(exist_ok=True)

# voice_id → Path(wav 파일)
VOICE_REFS: dict[str, Path] = {}


def get_device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def load_model(checkpoint: str, device: str):
    global model, sampling_rate
    logger.info(f"모델 로딩: {checkpoint}  device={device}")
    from omnivoice.models.omnivoice import OmniVoice
    model = OmniVoice.from_pretrained(
        checkpoint,
        device_map=device,
        dtype=torch.float16 if device != "cpu" else torch.float32,
    )
    sampling_rate = model.sampling_rate
    logger.info(f"✅ 모델 준비 완료  sampling_rate={sampling_rate}")


# ── FastAPI ────────────────────────────────────────────────────────────────────
app = FastAPI(title="OmniVoice Game API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/clone")
async def clone_voice(audio: UploadFile = File(...)):
    """
    참조 오디오를 저장하고 voice_id를 반환합니다.
    모델을 실행하지 않고 파일만 저장 — TTS 시 참조로 사용.
    """
    if model is None:
        raise HTTPException(503, "모델 로딩 중입니다. 잠시 후 다시 시도하세요.")

    data = await audio.read()
    if len(data) == 0:
        raise HTTPException(400, "빈 파일입니다.")

    suffix = Path(audio.filename or "audio.wav").suffix or ".wav"
    voice_id = str(uuid.uuid4())
    ref_path = TEMP_DIR / f"{voice_id}{suffix}"
    ref_path.write_bytes(data)

    # wav가 아니면 soundfile로 변환해서 저장
    if suffix.lower() != ".wav":
        try:
            wav_path = TEMP_DIR / f"{voice_id}.wav"
            audio_arr, sr = sf.read(str(ref_path))
            sf.write(str(wav_path), audio_arr, sr)
            ref_path.unlink(missing_ok=True)
            ref_path = wav_path
        except Exception as e:
            raise HTTPException(500, f"오디오 변환 실패: {e}")

    VOICE_REFS[voice_id] = ref_path
    dur = sf.info(str(ref_path)).duration
    logger.info(f"Voice registered: {voice_id[:8]}  dur={dur:.1f}s  path={ref_path.name}")
    return {"voice_id": voice_id, "duration": round(dur, 2)}


class TTSRequest(BaseModel):
    text: str
    voice_id: str
    language: str = "Korean"
    num_step: int = 32
    guidance_scale: float = 2.0
    speed: float = 1.0


@app.post("/tts")
async def tts(req: TTSRequest):
    """
    OmniVoice로 voice cloning TTS 수행 → WAV 스트리밍 반환
    """
    if model is None:
        raise HTTPException(503, "모델 로딩 중입니다.")
    if not req.text.strip():
        raise HTTPException(400, "text가 비어있습니다.")
    if req.voice_id not in VOICE_REFS:
        raise HTTPException(404, f"voice_id '{req.voice_id[:8]}' 없음. /clone을 먼저 호출하세요.")

    ref_path = VOICE_REFS[req.voice_id]
    if not ref_path.exists():
        raise HTTPException(404, "참조 오디오 파일이 삭제되었습니다. 다시 /clone을 호출하세요.")

    logger.info(f"TTS: '{req.text[:50]}...'  voice={req.voice_id[:8]}")

    try:
        with torch.no_grad():
            audios = model.generate(
                text=req.text,
                language=req.language,
                ref_audio=str(ref_path),
                ref_text=None,          # 참조 텍스트 없이 zero-shot
                num_step=req.num_step,
                guidance_scale=req.guidance_scale,
                speed=req.speed,
            )

        audio_out = audios[0]           # numpy array
        buf = io.BytesIO()
        sf.write(buf, audio_out, sampling_rate, format="WAV")
        buf.seek(0)

        return StreamingResponse(buf, media_type="audio/wav",
                                 headers={"Content-Disposition": "inline; filename=tts.wav"})
    except Exception as e:
        logger.error(f"TTS error: {e}", exc_info=True)
        raise HTTPException(500, f"TTS 생성 실패: {e}")


# ── 진입점 ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OmniVoice Game API Server")
    parser.add_argument("--model", default="k2-fsa/OmniVoice")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--device", default=None)
    args = parser.parse_args()

    device = args.device or get_device()
    load_model(args.model, device)

    logger.info(f"🎮 서버 시작: http://{args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port, log_level="warning")
