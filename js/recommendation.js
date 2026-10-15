/** Content-based recommendation: category vectors and cosine similarity. Pure and deterministic. */
export function recommend(candidates, {preferred = [], route = [], limit = 5} = {}) {
  const types = new Set(['12','32','39','14','15','25','38','28']);
  const selected = new Set(preferred.map(String).filter(t => types.has(t)));
  const uniqueRoute = [...new Map(route.map(s => [String(s.contentid),s])).values()];
  const counts = new Map();
  for (const s of uniqueRoute) {
    const type = String(s.contenttypeid);
    if (types.has(type)) counts.set(type,(counts.get(type)||0)+1);
  }
  const total = [...counts.values()].reduce((a,b)=>a+b,0);
  const profile = new Map([...types].map(t=>[t,(selected.has(t)?3:0)+(total?2*(counts.get(t)||0)/total:0)]));
  const norm = Math.hypot(...profile.values());
  if (!norm) return [];
  const excluded = new Set(uniqueRoute.map(s=>String(s.contentid))), seen = new Set();
  const scored = [];
  for (const [index,spot] of candidates.entries()) {
    const id = String(spot.contentid ?? '');
    if (!id || excluded.has(id) || seen.has(id)) continue;
    seen.add(id);
    const type = String(spot.contenttypeid), weight = profile.get(type)||0;
    if (!weight) continue;
    scored.push({spot,index,score:weight/norm,explicit:selected.has(type),routeCount:counts.get(type)||0});
  }
  // Equal similarity retains the source order; this is not a popularity ranking.
  scored.sort((a,b)=>b.score-a.score||a.index-b.index);
  return scored.slice(0,Math.max(0,Math.min(10,Math.floor(Number(limit)||0))));
}
