import assert from 'node:assert/strict';
import {fetchRecommendationCandidates as fetchPool} from '../js/recommendation-candidates.js';
const calls=[];const api=async(method,params)=>{calls.push({method,params});return {items:[{contentid:'outside-map',contenttypeid:params.contentTypeId}],total:200};};
const pool=await fetchPool({preferred:['12','12'],route:[{contenttypeid:'14'}],region:'11',district:'110',scope:'서울'},api);
assert.equal(calls.length,2);assert.equal(pool.items.length,1);assert.equal(pool.total,400);
for(const {method,params} of calls){assert.equal(method,'areaBasedList2');assert.equal(params.numOfRows,100);assert.equal(params.lDongRegnCd,'11');assert.equal(params.lDongSignguCd,'110');assert.equal(params.keyword,undefined);}
assert.equal(pool.items[0].contentid,'outside-map');
assert.deepEqual((await fetchPool({preferred:[],route:[]},()=>assert.fail('no preferences must not request'))).items,[]);
const partial=await fetchPool({preferred:['12','14'],route:[]},async(_,p)=>{if(p.contentTypeId==='14')throw Error('network');return {items:[{contentid:'ok'}],total:1};});assert.equal(partial.partial,true);assert.equal(partial.items.length,1);
await assert.rejects(fetchPool({preferred:['12'],route:[]},async()=>{throw Error('network');}),/추천 후보/);
const sample=await fetchPool({preferred:['12'],route:[],live:false,samples:[{region:'11',contenttypeid:'12'},{region:'11',contenttypeid:'14'}]},()=>assert.fail('offline'));assert.equal(sample.items.length,1);assert.equal(sample.scope,'샘플 데이터');
console.log('Recommendation candidate integration: passed (scope, independent pool, bounds, deduplication, partial/total failures, offline).');
