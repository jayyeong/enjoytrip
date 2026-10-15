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
