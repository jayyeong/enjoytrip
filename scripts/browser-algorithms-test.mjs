import assert from 'node:assert/strict';
import {containsKmp,querySpots,mergeSort,distance} from '../js/browser-algorithms.js';
let seed=16;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
for(let i=0;i<2000;i++){const text=Array.from({length:Math.floor(random()*80)},()=> 'ab가나'[Math.floor(random()*4)]).join('');const pattern=Array.from({length:Math.floor(random()*12)},()=> 'ab가나'[Math.floor(random()*4)]).join('');assert.equal(containsKmp(text,pattern),text.includes(pattern));}
for(const n of [0,1,2,3,100,1000,10000]){const rows=Array.from({length:n},(_,index)=>({index,km:Math.floor(random()*10)}));assert.deepEqual(mergeSort([...rows]),[...rows].sort((a,b)=>a.km-b.km));}
const rows=[{title:'Palace',addr1:'종로',mapx:127,mapy:37},{title:'near',addr1:'종로',mapx:127,mapy:38},{title:'unknown',addr1:'종로',mapx:'',mapy:''}];
assert.deepEqual(querySpots(rows,' 종로 ',rows[0]).rows.map(r=>r.index),[0,1,2]);
assert.equal(querySpots(rows,'PALACE').rows.length,1);
assert.equal(querySpots(rows,'palace종로').rows.length,0);
assert.equal(querySpots(rows,'',rows[0]).rows[2].km,null);
assert.ok(Math.abs(distance(rows[0],rows[1])-111.195)<.001);
assert.throws(()=>querySpots(rows,'',{mapx:200,mapy:0}));
assert.deepEqual(querySpots([]).rows,[]);
console.log('PASS: 2014 browser algorithm assertions');
