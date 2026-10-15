/** Java algorithm service integration; only the explicitly loaded search result is processed. */
export function attachAlgorithms({onResults}) {
  const host=document.createElement('section');host.className='algorithm-panel';
  host.setAttribute('aria-label','관광지 정렬 및 검색');
  host.innerHTML=`<h3>불러온 여행지에서 찾기</h3><p>이름·주소를 검색하고 기준 장소와 가까운 순서로 살펴보세요.</p>
  <form id="algorithm-form"><label>이름 또는 주소<input name="keyword" maxlength="500" class="form-control" placeholder="예: 종로"></label>
  <label>거리 기준 장소<select name="origin" class="form-select"><option value="">원래 순서</option></select></label>
  <button class="btn btn-primary">적용</button><button type="button" id="algorithm-reset" class="btn btn-outline-secondary">초기화</button></form>
  <p class="small">현재 불러온 결과에만 적용됩니다. 거리는 좌표 기준 직선거리이며 도로 이동거리·소요시간이 아닙니다.</p>
  <p id="algorithm-status" role="status" aria-live="polite"></p>`;
  document.querySelector('.explore-layout').before(host);
  const form=host.querySelector('form'),status=host.querySelector('#algorithm-status');let source=[],version=0,abort;
  function reset(){version++;abort?.abort();form.reset();status.textContent=`${source.length}개 장소에서 검색할 수 있습니다.`;form.querySelector('button').disabled=false;}
  host.querySelector('#algorithm-reset').onclick=()=>{reset();onResults(source,false);};
  form.onsubmit=async e=>{e.preventDefault();const id=++version;abort?.abort();abort=new AbortController();const selected=form.elements.origin.value;
    const origin=selected===''?null:source[Number(selected)];const data=new URLSearchParams({keyword:form.elements.keyword.value,sort:String(!!origin),originLat:String(origin?.mapy??0),originLon:String(origin?.mapx??0)});
    for(const s of source)for(const [key,value]of Object.entries({id:s.contentid,title:s.title??'',address:s.addr1??'',lat:s.mapy??'',lon:s.mapx??''}))data.append(key,String(value));
    status.textContent='관광지를 검색하고 정렬하고 있습니다…';form.querySelector('button').disabled=true;
    const controller=abort;
    const timeout=setTimeout(()=>controller.abort(),15000);
    try{const res=await fetch('/api/algorithms/query',{method:'POST',body:data,signal:abort.signal});
      if(!res.ok){if(res.status===404||res.status===405)throw Error('이 기능은 Java 서버 실행이 필요합니다. README의 npm run serve:java 실행 방법을 확인하세요.');throw Error('검색 처리에 실패했습니다. 검색어와 기준 장소를 확인하세요.');}
      const result=await res.json();if(id!==version)return;
      onResults(result.rows.map(r=>({...source[r.index],algorithmKm:origin?r.km:undefined})),true);
      status.textContent=`${source.length}개 중 ${result.rows.length}개 · ${origin?'거리순 정렬 · ':''}처리 시간 ${(result.elapsedNs/1e6).toFixed(3)}ms (서버 계산만)`;
    }catch(err){if(id===version)status.textContent=err.name==='AbortError'?'응답 시간이 초과됐습니다. 다시 시도해 주세요.':err.message;}
    finally{clearTimeout(timeout);if(id===version)form.querySelector('button').disabled=false;}
  };
  return {setSource(items){source=[...items];reset();const select=form.elements.origin;select.replaceChildren(new Option('원래 순서',''));
    source.forEach((s,i)=>{if(s.mapx!==''&&s.mapy!==''&&s.mapx!=null&&s.mapy!=null&&Number.isFinite(Number(s.mapx))&&Number.isFinite(Number(s.mapy))&&Math.abs(Number(s.mapx))<=180&&Math.abs(Number(s.mapy))<=90)select.add(new Option(s.title,String(i)));});
  }};
}
