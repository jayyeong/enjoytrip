# CI/CD 배포 설정

## 흐름

GitHub push / Pull Request → GitHub Actions 문법·파일 참조·빌드 검증.
Cloudflare Pages Git 연결 → 같은 검증과 빌드 실행 → 성공한 정적 사이트 자동 배포.

GitHub Actions와 Pages는 각각 실행합니다. Pages도 `npm run build`에서 검증을 먼저 실행하므로 검증 실패 시 배포되지 않습니다.

## Cloudflare Pages 설정

- 저장소: `jayyeong/enjoytrip`
- Framework preset: None
- Production branch: `design/kuad-reference` (현재 완성한 디자인)
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 프로젝트 루트 (빈 값)
- 환경변수: `NODE_VERSION=22`
- 선택 환경변수: `KAKAO_MAP_KEY`, `DATA_GO_KR_API_KEY`

API 키를 설정하지 않으면 명확히 표시된 샘플 모드로 실행합니다. 키는 빌드 중 `dist/01_api/js/keys.js`에 생성됩니다. 브라우저용 키는 배포 사이트에서 볼 수 있으므로 카카오 JavaScript 키에는 배포 도메인 제한을 설정하세요. 공공데이터 키를 서버에서 비공개로 처리하는 프록시는 이 정적 사이트 범위에 포함하지 않습니다.

배포 후 실제 `https://프로젝트.pages.dev` 주소를 카카오 개발자 콘솔의 JavaScript SDK 도메인에 등록하세요. `main`을 운영 브랜치로 바꾸려면 디자인 브랜치를 main에 병합한 후 Cloudflare의 운영 브랜치 설정을 변경합니다.

## 배포 파일

`node scripts/build.mjs`는 공개 파일 목록만 `dist`에 복사합니다. PDF, README, 로컬 키 파일, 테스트, 화면 캡처, Git 이력은 배포하지 않습니다. 의존성 설치 없이 Node 22 이상으로 빌드합니다.

```powershell
npm run build
```

현재 로컬 개발 실행은 기존 `python run.py` / VS Code Live Server를 계속 사용합니다.

## 검증 범위

CI는 JavaScript 문법, ES 모듈 경로, HTML 에셋 경로, 배포 진입 파일을 확인합니다. 외부 관광 API와 카카오 지도 사용 권한은 CI에서 확인하지 않습니다. 사용자 기능은 `docs/verification.md`에 기록한 브라우저 검증 결과를 참고하세요.

## 운영 상태

Cloudflare Git 연결과 이메일 인증을 완료했고 첫 배포가 성공했습니다.

- 운영 주소: https://enjoytrip.pages.dev
- 운영 브랜치: `design/kuad-reference`
- Node: 22
- 빌드: `npm run build`
- 출력: `dist`
- 현재 API 키 없음: 샘플 모드
- GitHub CI 첫 실행 성공: https://github.com/jayyeong/enjoytrip/actions/runs/36952599113
