import {categories} from './data.js';
// Query independently from the displayed/map result page. Bound network work per type.
export async function fetchRecommendationCandidates({preferred,route,region='',district='',scope='전국',live=true,samples=[]},api) {
 const types=[...new Set([...preferred,...route.map(s=>String(s.contenttypeid))])].filter(t=>categories.some(c=>String(c[0])===t));
 if(!types.length)return {items:[],scope,total:0};
 if(!live){const items=samples.filter(s=>(!region||s.region===region)&&!district&&types.includes(String(s.contenttypeid)));return {items,scope:'샘플 데이터',total:items.length};}
 const params={numOfRows:100,pageNo:1,arrange:'C',...(region?{lDongRegnCd:region}:{}),...(district?{lDongSignguCd:district}:{})};
 const responses=await Promise.allSettled(types.map(contentTypeId=>api('areaBasedList2',{...params,contentTypeId})));
 const ok=responses.filter(r=>r.status==='fulfilled').map(r=>r.value);
 if(!ok.length)throw Error('추천 후보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
 return {items:[...new Map(ok.flatMap(r=>r.items).map(s=>[String(s.contentid),s])).values()],scope,total:ok.reduce((n,r)=>n+r.total,0),partial:ok.length!==types.length};
}
