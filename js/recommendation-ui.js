import {categories} from './data.js';
import {recommend} from './recommendation.js';

export function attachRecommendations({getCandidates,getRoute,onDetail,onAdd}) {
  const panel=document.createElement('section');
  panel.className='algorithm-panel';panel.setAttribute('aria-label','취향 맞춤 여행지 추천');
  panel.innerHTML='<h3>취향에 맞는 다음 여행지</h3><p>좋아하는 유형과 현재 여행에 담은 장소를 바탕으로 추천합니다. 현재 불러온 목록에서 이미 담은 장소는 제외합니다.</p><form><fieldset><legend>좋아하는 여행 유형 (복수 선택)</legend><div class="recommend-types"></div></fieldset><label>추천 개수<select name="limit" class="form-select"><option>3</option><option selected>5</option><option>10</option></select></label><button class="btn btn-primary">추천 받기</button></form><p class="small">취향 일치도는 유형 유사도이며 만족 확률이나 평점이 아닙니다. 동점은 불러온 순서로 표시합니다.</p><p role="status" aria-live="polite"></p><div class="recommend-results"></div>';
  document.querySelector('.algorithm-panel').after(panel);
  const form=panel.querySelector('form'), status=panel.querySelector('[role="status"]'), results=panel.querySelector('.recommend-results');
  for(const [id,name] of categories){const label=document.createElement('label'), input=document.createElement('input');input.type='checkbox';input.name='preferred';input.value=String(id);label.append(input,document.createTextNode(name));panel.querySelector('.recommend-types').append(label);}
  function invalidate(){results.replaceChildren();status.textContent='유형을 선택하거나 여행에 장소를 담은 뒤 추천 받기를 눌러 주세요.';}
  form.onchange=invalidate;
  form.onsubmit=e=>{e.preventDefault();const preferred=new FormData(form).getAll('preferred'), route=getRoute();
    const rows=recommend(getCandidates(),{preferred,route,limit:form.elements.limit.value});results.replaceChildren();
    status.textContent=rows.length?`${rows.length}곳을 추천합니다. 현재 여행에 담은 ${route.length}곳을 반영했습니다.`:preferred.length||route.length?'현재 목록에 취향이 맞는 새 장소가 없습니다. 다른 유형을 선택하거나 여행지를 더 불러오세요.':'추천할 취향 정보가 없습니다. 좋아하는 유형을 먼저 선택해 주세요.';
    for(const row of rows){const card=document.createElement('article');card.className='tile';const title=document.createElement('h4'),info=document.createElement('p'),reason=document.createElement('p'),detail=document.createElement('button'),add=document.createElement('button');
      title.textContent=row.spot.title;info.textContent=`취향 일치도 ${(row.score*100).toFixed(1)} · ${row.spot.addr1||'주소 정보 없음'}`;
      const type=categories.find(c=>String(c[0])===String(row.spot.contenttypeid))?.[1]||'여행지';
      reason.textContent=[row.explicit?`선택한 ${type} 유형`:null,row.routeCount?`여행에 담은 ${type} ${row.routeCount}곳과 같은 유형`:null].filter(Boolean).join(' · ');
      detail.type=add.type='button';detail.className='btn btn-outline-secondary';add.className='btn btn-primary';detail.textContent='상세보기';add.textContent='여행에 추가';detail.onclick=()=>onDetail(row.spot);add.onclick=()=>onAdd(row.spot);card.append(title,info,reason,detail,add);results.append(card);
    }
  };
  invalidate();return {invalidate};
}
