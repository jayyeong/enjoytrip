import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:8001';
const row=(id,title,address,lat,lon)=>({id,title,address,lat,lon});
const rows=[row('a','Seoul Palace','종로구',37.579,126.977),row('b','서울','용산',37.524,126.98),row('c','좌표 없음','종로구','','')];
function body(items,extra={}){let b=new URLSearchParams({keyword:'종로',sort:'true',originLat:'37.579',originLon:'126.977',...extra});for(let r of items)for(let[k,v]of Object.entries(r))b.append(k,v);return b;}
let count=0;
async function post(items,extra,options={}){return fetch(base+'/api/algorithms/query',{method:'POST',body:body(items,extra),...options});}
let response=await post(rows);let result=await response.json();assert.equal(response.status,200);assert.deepEqual(result.rows.map(r=>r.index),[0,2]);assert.equal(result.rows[0].km,0);assert.equal(result.rows[1].km,null);count++;
result=await(await post(rows,{keyword:' SEOUL ',sort:'false'})).json();assert.deepEqual(result.rows.map(r=>r.index),[0]);count++;
result=await(await post(rows,{keyword:'nothing'})).json();assert.deepEqual(result.rows,[]);count++;
assert.equal((await post(rows,{originLat:'100'})).status,400);count++;
assert.equal((await post(rows,{keyword:'x'.repeat(501)})).status,400);count++;
assert.equal((await post(rows,{}, {headers:{Origin:'https://unrelated.invalid'}})).status,403);count++;
assert.equal((await fetch(base+'/api/algorithms/query')).status,405);count++;
assert.equal((await fetch(base+'/backend/src/enjoytrip/Server.java')).status,404);count++;
assert.equal((await fetch(base+'/resources/marker.png')).status,200);count++;
assert.equal((await fetch(base+'/js/algorithm-ui.js')).status,200);count++;
const bad=new URLSearchParams({id:'1'});assert.equal((await fetch(base+'/api/algorithms/query',{method:'POST',body:bad})).status,400);count++;
result=await(await post([],{keyword:'',sort:'false'})).json();assert.deepEqual(result.rows,[]);count++;
console.log(`PASS: ${count} HTTP integration cases`);
