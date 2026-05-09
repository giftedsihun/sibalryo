## OmniVoice 서버 자동 시작 설정

Electron이 게임 실행 시 OmniVoice Python 서버를 자동으로 시작하려면
`.env` 파일에 아래 설정을 추가하세요:

```
OMNIVOICE_START_CMD=C:\경로\OmniVoice\start_server.bat
```

또는 Python 직접 실행:
```
OMNIVOICE_START_CMD=python C:\경로\OmniVoice\server.py
```

서버가 이미 실행 중이면 자동 시작을 건너뜁니다 (포트 8000 체크).
