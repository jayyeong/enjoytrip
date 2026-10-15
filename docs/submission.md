# EP4 제출 안내

수정한 EnjoyTrip 소스와 `docs/algorithm-plan.md`, `docs/benchmarks`를 함께 제출한다.

1. Node.js 22+, JDK 21+에서 `npm run build`, `npm test` 실행.
2. `npm run serve:java` 후 http://127.0.0.1:8001 접속.
3. 샘플 14개에서 이름 또는 주소 `종로`, 거리 기준 장소 `경복궁` 선택 후 적용.
4. 거리순 6개 결과 확인 후 초기화로 14개 복구.
5. 다른 터미널에서 `npm run test:api` 실행.
6. 기획서와 실험 CSV를 확인하고 수업 지정 GitLab에 제출.

학번·반·팀원 정보는 임의로 작성하지 않았다. 별도 제출 표지가 필요하면 추가한다. API 키 없이 샘플로 시연할 수 있다. 실시간 관광 API·지도는 유효한 개인 키 설정이 필요하다.

Python·Live Server·Cloudflare 정적 배포에서는 Java API가 동작하지 않는다. EP4는 위 Java 실행 명령을 사용한다. 로컬 과제용이며 운영 인증·공유 DB 서버는 포함하지 않는다.
