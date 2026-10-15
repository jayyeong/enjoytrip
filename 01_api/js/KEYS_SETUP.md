# API 키 설정

`keys.js`에서 다음 두 변수에 본인의 키를 지정하세요. 마지막 export는 유지합니다.

```js
const DATA_GO_KR_API_KEY = "공공데이터포털 서비스 키";
const KAKAO_MAP_KEY = "카카오 JavaScript 키";
export { DATA_GO_KR_API_KEY, KAKAO_MAP_KEY };
```

실행 주소 `http://localhost:8001`을 카카오 개발자 콘솔의 허용 도메인에 등록하세요. 서비스 키 파일은 `.gitignore`에 포함했습니다. 다른 환경으로 복사할 때 별도로 설정해야 합니다.

