import { DATA_GO_KR_API_KEY } from '../01_api/js/keys.js';
const endpoint='https://apis.data.go.kr/B551011/KorService2/';
export async function tourAPI(method,params={}){
 if(!DATA_GO_KR_API_KEY)throw Error('공공데이터 API 키가 없습니다.');
 let key=DATA_GO_KR_API_KEY;try{key=decodeURIComponent(key)}catch{}
 const query=new URLSearchParams({serviceKey:key,MobileOS:'WEB',MobileApp:'EnjoyTrip',_type:'json',numOfRows:24,pageNo:1,...params});
 const response=await fetch(endpoint+method+'?'+query,{signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('관광정보 서버 응답 오류');
 const json=await response.json();const head=json.response?.header;
 if(head?.resultCode!=='0000')throw Error(head?.resultMsg||'관광정보 응답을 확인할 수 없습니다.');
 const body=json.response.body;const items=body.items?.item||[];
 return {items:Array.isArray(items)?items:[items],total:Number(body.totalCount||0)};
}
