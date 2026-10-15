# EnjoyTrip Algorithm EP4 — 기획 및 검증 보고서

작성일: 2026-10-15. 기존 `jayyeong/enjoytrip` HTML·JavaScript 프로젝트에 Java 21 알고리즘 서버를 연결했다.

## 요구사항 분석 (F401)

참고: 제공된 「EnjoyTrip Algorithm 4회차 프로젝트 명세서」 F401~F405 및 「16기 자바전공 APS Day29 1015오전 관통」의 EnjoyTrip 알고리즘 적용 예시·정렬 설명. 원본 수업 자료는 저장소에 재배포하지 않는다.

기존에는 공공데이터 API 검색 및 `String.includes` 샘플 검색이 있었고, 조회한 목록의 거리순 정렬은 없었다. 목록 내 이름·주소 재검색에는 **KMP 문자열 탐색**, 기준 장소 거리순 탐색에는 **분할 정복 병합 정렬**을 선정했다. 두 가지 서로 다른 유형이다. 도로 그래프가 없는 최단 경로는 이번 범위에 포함하지 않는다.

## 서비스 1: 이름·주소 검색 (F402)

불러온 관광지의 이름 또는 주소에 검색어가 포함되는지 판단한다. 검색어 앞뒤 공백을 제거하고 Java Locale.ROOT로 소문자화한다. 빈 검색어는 전체를 반환한다. 이름과 주소를 각각 검사해 필드 경계를 가로지르는 잘못된 일치를 방지한다. UTF-16 부분 문자열 의미이며 초성·형태소 검색이나 Unicode 정규화는 제공하지 않는다.

단순 탐색은 반복 접두사 입력에서 같은 문자를 다시 비교한다. KMP는 prefix 배열로 비교할 패턴 위치를 이동하여 최악의 선형 시간을 보장한다. prefix는 요청당 한 번 생성하여 전체 목록에 재사용한다.

```text
pattern = trim(keyword).lowercase(ROOT)
prefix = buildPrefix(pattern)
for each spot:
  if KMP(lowercase(title), pattern, prefix)
     or KMP(lowercase(address), pattern, prefix):
    result.add(spot, originalIndex)
```

자료구조는 Spot 목록과 길이 M의 정수 prefix 배열, 결과 목록이다. 관광지 N개, 모든 이름·주소 길이 합 T, 패턴 길이 M, 일치 수 K라 할 때 시간 O(M+T+N), prefix 공간 O(M), 결과 O(K), 소문자 변환 임시 문자열 O(Lmax)이다. 서비스의 요청 본문·파싱 메모리 O(T+N)는 별도다. 단순 탐색의 최악 시간은 O(T·M+N)이다.

구현: `backend/src/enjoytrip/Algorithms.java`의 prefix, containsKmp, query.

## 서비스 2: 기준 관광지 거리순 탐색 (F403)

좌표가 유효한 기준 관광지를 고르면 Haversine 대권거리를 계산하고 가까운 순서로 정렬한다. 좌표 기준 직선거리이며 도로 이동거리·이동시간·최적 방문 경로가 아니다. 현재 불러온 목록에만 적용한다.

병합 정렬은 최악에도 O(K log K)이고 안정 정렬이므로 같은 거리에서 입력 순서를 유지한다. 비교용 선택 정렬은 O(K²)이다. 추가 배열 O(K)를 사용하는 대신 큰 입력에서도 예측 가능한 시간 성능을 선택했다.

```text
for each matched spot:
  ranked.add(spot, originalIndex, haversine(origin, spot))
mergeSort(ranked):
  split until each part has at most one element
  merge by distance; choose left first on ties
```

Ranked는 관광지·원래 인덱스·거리 값을 가진다. 보조 배열은 한 번 생성해 재귀 호출에서 재사용한다. 누락·잘못된 장소 좌표는 무한대로 처리하여 뒤에 놓고 JSON에서는 null로 반환한다. 기준 좌표는 유한한 위도 ±90, 경도 ±180만 허용한다.

거리 계산 O(K), 정렬 O(K log K), 추가 배열 O(K), 재귀 스택 O(log K). 검색과 정렬을 합친 시간은 O(M+T+N+K log K), 알고리즘 추가 공간은 O(M+K+Lmax)이다. 정렬을 요청하지 않으면 거리 계산을 생략하고, 요청하더라도 일치한 장소만 한 번씩 계산한다.

구현: Algorithms.java의 distance, mergeSort, merge, query.

## 화면과 서버 연결

`js/algorithm-ui.js`는 원본 목록을 보관하고 Java 결과의 입력 인덱스로 기존 contentid를 유지한다. 상세보기·여행 담기는 기존 기능을 사용한다. 필터 중에는 더 보기를 숨기고 초기화하면 원본 목록과 더 보기 상태를 복구한다. 신규 검색·초기화 시 요청 취소 및 버전 검사로 오래된 응답을 무시한다. 요청 제한 시간은 15초다.

POST `/api/algorithms/query`: URL 인코딩 폼. 공통 필드 keyword, sort, originLat, originLon과 반복 필드 id, title, address, lat, lon을 받는다. 응답은 rows의 index/km, inputCount, elapsedNs다. elapsedNs는 Java 계산 시간만 포함하며 통신·파싱·렌더링은 제외한다고 화면에 표시한다.

서버는 127.0.0.1에 바인딩하며 dist 내부 정적 파일만 제공한다. 본문 8MiB, 장소 10,000개, 검색어 500자 제한이 있다. 다른 사이트 Origin은 거부한다. 기존 브라우저 회원 저장 방식을 유지하며 서버 인증·공유 DB를 추가하지 않았다.

## 정확성 검증

- `npm test`: **2,064개 검사 통과**. 빈 문자열, 한국어·이모지, 접두사 반복, 영문 검색, 필드 경계, seed 16 무작위 2,000회 contains 대조. 크기 0/1/2/3/10/100/1,000 정렬을 Java 안정 정렬과 대조. 동거리·좌표 누락·거리 대칭성·동일 지점 0km·경도 1도 약 111.195km도 검사한다.
- `npm run test:api`: **12개 HTTP 통합 사례 통과**. 검색·정렬·누락 좌표, 대소문자, 미일치, 잘못된 좌표, 긴 검색어, 외부 Origin, 메서드 제한, 소스 비공개, 정적 자원, 필드 수 불일치, 빈 목록.
- 브라우저: 샘플 14개에서 `종로` + 기준 `경복궁`을 적용해 6개를 거리순으로 표시하는 것을 확인했다. 경복궁 0.00km, 한옥 0.71km, 북촌 0.86km, 인사동 0.90km 순이다. 실키가 없으므로 실시간 관광 API·Kakao 지도 연결은 검증하지 않았다.

## 성능 실험 (F404)

원본: `docs/benchmarks/*.csv`, 환경: environment.txt. Windows 11 amd64, Java 21.0.11, 논리 프로세서 16, heap 256MiB. 크기별 seed 1604+N, 워밍업 5회 후 9회 중앙값. 입력 생성 제외, 정렬 입력 복사 포함. JIT와 환경에 따라 재측정 결과는 달라진다.

### 정렬 기준선 비교

| N | 선택 정렬 ms | 병합 정렬 ms | 향상 | 선택/병합 할당 byte |
|---:|---:|---:|---:|---:|
|100|0.2374|0.0100|23.74배|416 / 832|
|1,000|0.4724|0.1114|4.24배|4,016 / 8,032|
|10,000|36.6064|1.0053|36.41배|40,016 / 80,032|

미리 계산한 거리 배열로 정렬 자체를 비교한다. 선택 정렬은 교육용 기준선이며 기존 앱 구현이 아니다. 메모리는 ThreadMXBean 현재 스레드 allocated bytes로, 최대 heap이나 전체 서비스 사용량이 아니다. 병합 정렬은 보조 배열만큼 공간을 더 사용한다.

### 검색 기준선 비교

| 데이터 | N | 단순 탐색 ms | KMP ms | JDK contains ms |
|---|---:|---:|---:|---:|
|일반 한국어|100|0.0291|0.0665|0.0228|
|일반 한국어|1,000|0.1021|0.0214|0.0417|
|일반 한국어|10,000|0.5018|0.2277|0.0587|
|반복 접두사|100|1.2718|0.1485|0.8340|
|반복 접두사|1,000|12.5613|1.3325|2.9498|
|반복 접두사|10,000|127.3563|16.8037|31.3202|

일반 검색어는 종로. 반복 입력은 a 512개 수준의 본문과 a 63개+b 패턴이며 25%가 일치한다. prefix 할당량은 일반 24byte, 반복 272byte로 N에 무관했다. 다른 두 탐색의 측정 구간 추가 할당은 0byte였다. 입력 문자열·결과 저장을 포함한 전체 메모리가 아니다.

KMP는 반복 입력 10,000개에서 단순 탐색보다 약 7.58배 빠르다. 일반 짧은 문자열에서는 최적화된 JDK contains보다 느릴 수 있다. 최악 시간 보장과 실제 성능을 구분한다.

### 실제 기존 JavaScript 비교

`npm run benchmark:existing`은 기존 JS의 `rows.filter(title.includes || addr1.includes)`와 Java HTTP 요청부터 응답 JSON 파싱까지를 동일 입력으로 비교한다. 워밍업 3회, 본 측정 9회 중앙값이며 렌더링은 제외한다.

| N | 기존 JS includes ms | Java HTTP ms | 일치 수 |
|---:|---:|---:|---:|
|100|0.0085|14.9969|25|
|1,000|0.0458|15.1989|250|
|10,000|0.4442|37.1449|2,500|

일반 검색에서는 기존 JS가 더 빠르다. Java HTTP는 직렬화·통신·파싱 비용이 추가된다. 따라서 개선 주장을 선택 정렬 대비 거리 정렬과 반복 입력에서 KMP로 한정한다. 작은 목록의 전체 응답 속도 향상을 주장하지 않는다. Java 과제 구현과 최악 시간 보장에 맞춰 서버 연동을 유지했다. 향후 제품화에서는 작은 목록 로컬 검색과 서버 검색을 구분할 수 있다.

개선 사항: prefix 요청당 1회 생성, 검색 탈락 장소의 정렬·거리 계산 생략, 정렬 미요청 시 거리 계산 생략, 거리 캐시 및 보조 배열 재사용, 오래된 응답 취소.

## 재현 및 제출 (F405)

Node.js 22+, JDK 21+에서 의존성 설치 없이 실행한다.

```sh
npm run build
npm test
npm run benchmark
npm run serve:java
```

http://127.0.0.1:8001 접속. 다른 터미널에서 `npm run test:api`, `npm run benchmark:existing` 실행. 포트 변경은 `npm run serve:java -- 8002`, 통합 검증은 TEST_URL 환경 변수에 같은 주소를 설정한다. 성능 재측정 시 CSV와 문서 표를 함께 갱신한다.

| 요구사항 | 산출물 |
|---|---|
|F401 분석·선정|본 문서의 분석 및 서비스별 기획|
|F402 첫 알고리즘|Algorithms.java KMP, AlgorithmsTest.java|
|F403 다른 유형 알고리즘|Algorithms.java mergeSort, AlgorithmsTest.java|
|F404 복잡도·실측·개선|본 문서, Benchmark.java, compare-existing.mjs, CSV|
|F405 기획서|본 문서, README, submission.md|

반·팀명·제출 GitLab·마감은 수업 안내에 맞게 최종 확인한다. 학교 제출과 운영 배포는 수행하지 않았다.
