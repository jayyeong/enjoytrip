// Short-lived, bounded cache with in-flight request coalescing. Failures are never cached.
export function createRequestCache({ttl=60000,maxEntries=64,now=()=>Date.now()}={}) {
 const entries=new Map(),pending=new Map();
 return async function cached(key,load) {
  const hit=entries.get(key);
  if(hit&&hit.expires>now())return structuredClone(hit.value);
  if(hit)entries.delete(key);
  if(!pending.has(key)){
   const promise=Promise.resolve().then(load).then(value=>{entries.delete(key);entries.set(key,{value:structuredClone(value),expires:now()+ttl});while(entries.size>maxEntries)entries.delete(entries.keys().next().value);return value;}).finally(()=>pending.delete(key));
   pending.set(key,promise);
  }
  return structuredClone(await pending.get(key));
 };
}
