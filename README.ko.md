<p align="center">
  <img src="./media/logo.png" alt="Usage Insights logo" width="120" />
</p>

<h1 align="center">usage-insights</h1>

<p align="center">
  로컬 AI 사용 기록을 분석해서 리포트와 선택형 Remotion 영상까지 만드는 Codex 스킬입니다.
</p>

<p align="center">
  <a href="./README.md"><strong>English</strong></a>
  ·
  <a href="./README.ko.md"><strong>한국어</strong></a>
</p>

## 개요

`usage-insights`는 로컬 AI 도구 사용 기록을 다음 형태로 정리하기 위한 저장소입니다.

- 사용 리포트
- 재사용 가능한 타입 데이터 파일
- 선택형 포스터 및 MP4

이 저장소는 Codex, Claude, Gemini, Antigravity 사용 흐름을 프로젝트와 기간 단위로 다시 읽고 싶은 경우를 위한 재사용 템플릿입니다.

## 설치

설치 경로:

`aldegad/usage-insights/usage-insights`

설치 후 예시 프롬프트:

- `Use $usage-insights to analyze my local AI usage and write a report.`
- `Use $usage-insights to make a shareable AI usage profile and render a video.`

## 빠른 시작

```bash
python3 usage-insights/scripts/create_project.py --dest ~/usage-insights-project --install
cd ~/usage-insights-project
npm run analyze
npm run dev
npm run render:poster
npm run render:video
```

## 예시 출력

![Usage Insights example output](./media/example-output.gif)

## 생성 결과

생성된 워크스페이스에서는 보통 다음 파일이 만들어집니다.

- `INSIGHTS.md`
- `src/data/usage-insights.generated.ts`
- `out/` 아래의 포스터와 MP4

## 데이터 커버리지

- `Codex`: 토큰 합계, 세션 수, 프로젝트 묶음
- `Claude`: raw 로그가 있으면 토큰 합계 집계 가능, 없으면 활동 메타 중심
- `Gemini`: 활동 흔적과 프로젝트 라벨 중심
- `Antigravity`: 앱 로그 기반 활동 흔적 중심

Gemini와 Antigravity는 신뢰할 수 있는 토큰 원장이 없으면 토큰 차트에 억지로 합산하지 않습니다.

## 저장소 구성

- [`usage-insights`](./usage-insights): 설치 가능한 Codex 스킬
- [`usage-insights/scripts/create_project.py`](./usage-insights/scripts/create_project.py): 워크스페이스 생성 스크립트
- [`usage-insights/assets/remotion-template`](./usage-insights/assets/remotion-template): 분석기와 영상 템플릿
- [`usage-insights/references`](./usage-insights/references): 데이터 소스 및 보안 참고 문서
- [`scripts/generate_example_gif.py`](./scripts/generate_example_gif.py): MP4에서 예시 GIF를 다시 만드는 스크립트

## 공개 시 주의점

이 저장소 자체는 일반화된 코드와 문서만 담고 있어서 공개해도 괜찮습니다.

하지만 실제 생성물은 검토가 필요합니다. 예를 들면:

- 프로젝트 이름
- 작업 기간
- 사용량 패턴
- 습관과 성향에 대한 해석 문장

포트폴리오나 공개 문서로 쓸 때는 민감한 프로젝트명과 날짜를 먼저 가리는 편이 안전합니다.

## 라이선스

MIT
