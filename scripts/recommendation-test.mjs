import assert from 'node:assert/strict';
import {recommend} from '../js/recommendation.js';
const s=(id,type)=>({contentid:id,contenttypeid:type,title:id});
const rows=[s('a','12'),s('b','39'),s('c','12'),s('d','14'),s('e','99')];
assert.deepEqual(recommend(rows),[]);
assert.deepEqual(recommend(rows,{preferred:['12']}).map(r=>r.spot.contentid),['a','c']);
assert.equal(recommend(rows,{preferred:['12']})[0].score,1);
assert.deepEqual(recommend(rows,{route:[rows[0]]}).map(r=>r.spot.contentid),['c']);
assert.equal(recommend(rows,{preferred:['39'],route:[rows[0]]})[0].spot.contentid,'b');
assert.equal(recommend(rows,{preferred:['39'],route:[rows[0]]})[0].explicit,true);
assert.equal(recommend(rows,{route:[rows[0],rows[0]]})[0].routeCount,1);
assert.deepEqual(recommend([...rows,rows[0]],{preferred:['12']}).map(r=>r.spot.contentid),['a','c']);
assert.equal(recommend(rows,{preferred:['12','12'],limit:1}).length,1);
assert.deepEqual(recommend(rows,{preferred:['99']}),[]);
assert.deepEqual(recommend(rows,{preferred:['12'],limit:0}),[]);
assert.deepEqual(recommend(rows,{preferred:['12'],route:[rows[0],rows[2]]}),[]);
for(let n=1;n<=100;n++){
 const input=Array.from({length:n},(_,i)=>s(String(i),['12','39','14'][i%3]));
 const result=recommend(input,{preferred:['12','39'],route:[s('outside','12')],limit:10});
 const expected=input.filter(x=>x.contenttypeid!=='14').sort((a,b)=>Number(b.contenttypeid==='12')-Number(a.contenttypeid==='12')).slice(0,10);
 assert.deepEqual(result.map(r=>r.spot.contentid),expected.map(r=>r.contentid));
 assert.ok(result.every(r=>Number.isFinite(r.score)&&r.score>0&&r.score<=1));
}
console.log('PASS: 212 recommendation assertions (cold start, exclusions, ranking, deduplication, bounds)');
