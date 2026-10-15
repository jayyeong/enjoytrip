import assert from 'node:assert/strict';
import {createRequestCache} from '../js/request-cache.js';
let clock=0,calls=0;const cache=createRequestCache({ttl:100,maxEntries:2,now:()=>clock});const load=async()=>({items:[{id:++calls}]});
const [a,b]=await Promise.all([cache('a',load),cache('a',load)]);assert.equal(calls,1);a.items[0].id=99;assert.equal(b.items[0].id,1);assert.equal((await cache('a',load)).items[0].id,1);
clock=101;await cache('a',load);assert.equal(calls,2);await cache('b',load);await cache('c',load);await cache('a',load);assert.equal(calls,5);
let attempts=0;const retry=()=>{attempts++;throw Error('offline');};await assert.rejects(cache('error',retry));await assert.rejects(cache('error',retry));assert.equal(attempts,2);
const ordered=[];await Promise.all([cache('d',async()=>{ordered.push('d');return 4}),cache('e',async()=>{ordered.push('e');return 5})]);assert.deepEqual(ordered,['d','e']);
console.log('Request cache: passed (in-flight sharing, isolated results, expiry, size bound, retry, independent keys).');
