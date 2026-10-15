import {performance} from 'node:perf_hooks';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:8001';
let csv='n,existing_local_includes_median_ms,java_kmp_http_median_ms,matches\n';
for(const n of [100,1000,10000]){
 const rows=Array.from({length:n},(_,i)=>({title:`관광지 ${i}`,addr1:i%4===0?'서울 종로구':'부산 해운대구'}));
 const body=new URLSearchParams({keyword:'종로',sort:'false'});
 rows.forEach((s,i)=>{for(const[k,v]of Object.entries({id:String(i),title:s.title,address:s.addr1,lat:'37',lon:'127'}))body.append(k,v);});
 const old=[],http=[];let matches;
 for(let run=-3;run<9;run++){
  let t=performance.now();const result=rows.filter(s=>s.title.includes('종로')||s.addr1.includes('종로'));let dt=performance.now()-t;
  t=performance.now();const response=await fetch(base+'/api/algorithms/query',{method:'POST',body});assert.equal(response.status,200);const data=await response.json();let total=performance.now()-t;
  assert.deepEqual(data.rows.map(r=>r.index),rows.map((s,i)=>s.addr1.includes('종로')?i:-1).filter(i=>i>=0));
  if(run>=0){old.push(dt);http.push(total);}matches=result.length;
 }
 old.sort((a,b)=>a-b);http.sort((a,b)=>a-b);csv+=`${n},${old[4].toFixed(6)},${http[4].toFixed(6)},${matches}\n`;
}
writeFileSync('docs/benchmarks/existing-comparison.csv',csv);console.log(csv);
