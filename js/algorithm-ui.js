import {querySpots} from './browser-algorithms.js';
/** Java locally; equivalent browser algorithms on static production deployments. */
export function attachAlgorithms({onResults}) {
  const host=document.createElement('details');host.className='algorithm-panel';
  host.setAttribute('aria-label','관광지 정렬 및 검색');
  host.innerHTML=`<summary>현재 결과 안에서 검색·정렬</summary><div class="algorithm-content"><h3>표시된 목록 좁히기</h3><p>전체 관광정보를 찾으려면 위 검색창을 사용하세요. 이 도구는 표시된 목록의 이름·주소 필터와 거리 정렬입니다.</p>
  <form id="algorithm-form"><label>이름 또는 주소<input name="keyword" maxlength="500" class="form-control" placeholder="예: 종로"></label>
  <label>거리 기준 장소<select name="origin" class="form-select"><option value="">원래 순서</option></select></label>
  <button class="btn btn-primary">적용</button><button type="button" id="algorithm-reset" class="btn btn-outline-secondary">초기화</button></form>
  <p class="small">현재 불러온 결과에만 적용됩니다. 거리는 좌표 기준 직선거리이며 도로 이동거리·소요시간이 아닙니다.</p>
  <p id="algorithm-status" role="status" aria-live="polite"></p></div>`;
  document.querySelector('#list-heading').before(host);
  const form=host.querySelector('form'),status=host.querySelector('#algorithm-status');let source=[],version=0,abort;
  function reset(){version++;abort?.abort();form.reset();status.textContent=`${source.length}개 장소에서 검색할 수 있습니다.`;form.querySelector('button').disabled=false;}
  host.querySelector('#algorithm-reset').onclick=()=>{reset();onResults(source,false);};
  form.onsubmit=async e=>{e.preventDefault();const id=++version;abort?.abort();abort=new AbortController();const selected=form.elements.origin.value;
    const origin=selected===''?null:source[Number(selected)];const data=new URLSearchParams({keyword:form.elements.keyword.value,sort:String(!!origin),originLat:String(origin?.mapy??0),originLon:String(origin?.mapx??0)});
    for(const s of source)for(const [key,value]of Object.entries({id:s.contentid,title:s.title??'',address:s.addr1??'',lat:s.mapy??'',lon:s.mapx??''}))data.append(key,String(value));
    status.textContent='관광지를 검색하고 정렬하고 있습니다…';form.querySelector('button').disabled=true;
    const controller=abort;
    const timeout=setTimeout(()=>controller.abort(),15000);
    try{let result;
      if(['localhost','127.0.0.1','[::1]'].includes(location.hostname)){
        const res=await fetch('/api/algorithms/query',{method:'POST',body:data,signal:abort.signal});
        if(res.status===404||res.status===405||res.status===501||(res.ok&&!res.headers.get('content-type')?.includes('application/json')))result=querySpots(source,form.elements.keyword.value,origin);
        else{if(!res.ok)throw Error('검색 처리에 실패했습니다. 검색어와 기준 장소를 확인하세요.');result=await res.json();}
      }else result=querySpots(source,form.elements.keyword.value,origin);
      if(id!==version)return;
      onResults(result.rows.map(r=>({...source[r.index],algorithmKm:origin?r.km:undefined})),true);
      status.textContent=`${source.length}개 중 ${result.rows.length}개 · ${origin?'거리순 정렬 · ':''}처리 시간 ${(result.elapsedNs/1e6).toFixed(3)}ms (${result.engine==='browser'?'브라우저':'서버'} 계산만)`;
    }catch(err){if(id===version)status.textContent=err.name==='AbortError'?'응답 시간이 초과됐습니다. 다시 시도해 주세요.':err.message;}
    finally{clearTimeout(timeout);if(id===version)form.querySelector('button').disabled=false;}
  };
  return {setSource(items){source=[...items];reset();const select=form.elements.origin;select.replaceChildren(new Option('원래 순서',''));
    source.forEach((s,i)=>{if(s.mapx!==''&&s.mapy!==''&&s.mapx!=null&&s.mapy!=null&&Number.isFinite(Number(s.mapx))&&Number.isFinite(Number(s.mapy))&&Math.abs(Number(s.mapx))<=180&&Math.abs(Number(s.mapy))<=90)select.add(new Option(s.title,String(i)));});
  }};
}
