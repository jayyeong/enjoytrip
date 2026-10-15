# EP4 제출·시연 안내

참여자: A12 정제영 · 박재윤. 학번은 별도 기입하지 않았다.

## 제출물

- 수정한 EnjoyTrip 소스 전체
- `docs/EnjoyTrip_알고리즘_적용_기획서.pdf`: 지정 양식 기획서 #1 KMP, #2 병합 정렬, #3 코사인 추천 및 검증 부록
- `docs/algorithm-proposals.md`: 기획서 원문
- `docs/algorithm-plan.md`, `docs/recommendation-plan.md`, `docs/benchmarks`: 상세 분석·실험 근거

## 실행·시연

1. Node.js 22+, JDK 21+에서 `npm run build`, `npm test` 실행.
2. `npm run serve:java` 후 http://127.0.0.1:8001 접속.
3. 왼쪽 **목록 검색·거리 정렬**을 펼쳐 샘플 목록에서 `종로` + 기준 `경복궁` 적용. 거리순 6개 결과 확인 후 초기화.
4. **취향 맞춤 추천**을 펼쳐 문화시설·음식점 선택. 추천 카드와 이유 확인.
5. 다른 터미널에서 `npm run test:api` 실행.
6. PDF의 각 기획서와 실험 근거를 확인한 뒤 수업 지정 GitLab에 제출.

API 키 없이도 샘플로 시연할 수 있다. 실제 관광 API·지도는 환경변수로 키를 설정한다. Python·Live Server·Cloudflare 정적 배포만으로 Java API는 실행되지 않는다. Java 서버는 과제용 로컬 처리 서버이며 운영 인증·공유 DB를 제공하지 않는다. 운영 사이트 배포와 학교 제출은 아직 수행하지 않았다.

## 운영 배포 보완 (2026-10-15)

정적 운영 사이트에서는 js/browser-algorithms.js의 KMP·안정 병합 정렬·Haversine 구현을 사용하여 검색·정렬·추천을 모두 브라우저에서 처리한다. Java 소스와 API는 과제 및 로컬 검증용으로 유지한다. 브라우저 구현 검사 2,014개를 통과했다. 앞선 Java 실험 수치는 브라우저 성능 수치가 아니다. PDF의 Java 실행 흐름은 로컬 과제 실행 기준이며 운영에서는 같은 알고리즘을 브라우저로 실행한다.
