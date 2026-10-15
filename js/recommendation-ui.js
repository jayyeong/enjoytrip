import {categories} from './data.js';
import {recommend} from './recommendation.js';

export function attachRecommendations({getCandidates,getRoute,onDetail,onAdd}) {
  const panel=document.createElement('details');
  panel.className='algorithm-panel recommendation-panel';panel.setAttribute('aria-label','취향 맞춤 여행지 추천');
  panel.innerHTML='<summary>취향 맞춤 추천</summary><div class="algorithm-content"><h3>취향에 맞는 다음 여행지</h3><p>선택 지역에서 새 후보를 찾습니다. 지도 목록·장소 이름 검색과 별도로 추천합니다.</p><form><fieldset><legend>좋아하는 여행 유형 (복수 선택)</legend><div class="recommend-types"></div></fieldset><label>추천 개수<select name="limit" class="form-select"><option>3</option><option selected>5</option><option>10</option></select></label><button class="btn btn-primary">추천 받기</button></form><p class="small">유형별 최신 수정 100곳까지 비교 · 일치도는 평점이 아닙니다.</p><p role="status" aria-live="polite"></p><div class="recommend-results"></div></div>';
  document.querySelector('.algorithm-panel').after(panel);
  const form=panel.querySelector('form'), status=panel.querySelector('[role="status"]'), results=panel.querySelector('.recommend-results');
  for(const [id,name] of categories){const label=document.createElement('label'), input=document.createElement('input');input.type='checkbox';input.name='preferred';input.value=String(id);label.append(input,document.createTextNode(name));panel.querySelector('.recommend-types').append(label);}
  let version=0;function invalidate(){version++;form.querySelector('button').disabled=false;results.replaceChildren();status.textContent='유형을 선택하거나 여행에 장소를 담은 뒤 추천 받기를 눌러 주세요.';}
  form.onchange=invalidate;
  form.onsubmit=async e=>{e.preventDefault();const preferred=new FormData(form).getAll('preferred'), route=[...getRoute()],id=++version;const limit=form.elements.limit.value;results.replaceChildren();status.textContent='선택 지역에서 추천 후보를 새로 찾고 있습니다…';form.querySelector('button').disabled=true;try{const pool=await getCandidates(preferred,route);if(id!==version)return;const rows=recommend(pool.items,{preferred,route,limit});
    status.textContent=rows.length?`${pool.scope} · 후보 ${pool.items.length}곳 / 조회 대상 ${pool.total.toLocaleString()}곳 중 ${rows.length}곳 추천${pool.partial?' · 일부 유형 조회 실패':''}`:preferred.length||route.length?'선택 지역에 취향이 맞는 새 장소가 없습니다. 지역 또는 유형을 바꿔 보세요.':'추천할 취향 정보가 없습니다. 좋아하는 유형을 먼저 선택해 주세요.';
    for(const [rank,row] of rows.entries()){const card=document.createElement('article');card.className='tile';const title=document.createElement('h4'),info=document.createElement('p'),reason=document.createElement('p'),detail=document.createElement('button'),add=document.createElement('button');
      title.textContent=`추천 ${rank+1} · ${row.spot.title}`;info.textContent=`취향 일치도 ${(row.score*100).toFixed(1)} · ${row.spot.addr1||'주소 정보 없음'}`;
      const type=categories.find(c=>String(c[0])===String(row.spot.contenttypeid))?.[1]||'여행지';
      reason.textContent=[row.explicit?`선택한 ${type} 유형`:null,row.routeCount?`여행에 담은 ${type} ${row.routeCount}곳과 같은 유형`:null].filter(Boolean).join(' · ');
      detail.type=add.type='button';detail.className='btn btn-outline-secondary';add.className='btn btn-primary';detail.textContent='상세보기';add.textContent='여행에 추가';detail.onclick=()=>onDetail(row.spot);add.onclick=()=>onAdd(row.spot);card.append(title,info,reason,detail,add);results.append(card);
    }
    }catch(error){if(id===version)status.textContent=error.message;}finally{if(id===version)form.querySelector('button').disabled=false;}
  };
  invalidate();return {invalidate};
}
