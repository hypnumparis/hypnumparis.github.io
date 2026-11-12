/* Hypnum · Assistant de devis — calculs partagés.
   HQ.validate(cfg)        → liste de ce qui manque (vide = réglages complets)
   HQ.estimate(cfg, req)   → estimation pour le client
   HQ.suggest(A, M2)       → mode 2 : grille de prix proposée + explications
   HQ.fromHourly(h, ratio) → grille de prix à partir d'un taux horaire */
(function(){
var D = window.HQ_DATA;
function num(x){ return typeof x === 'number' && isFinite(x); }
function pos(x){ return num(x) && x > 0; }
function r10(x){ return Math.round(x / 10) * 10; }
function r5(x){ return Math.round(x / 5) * 5; }
function pair(p){ return p && num(p[0]) && num(p[1]) && p[0] > 0 && p[1] >= p[0]; }

/* ---------- Réglages complets ? ---------- */
function validate(c){
  var m = [];
  if(!c){ return ['没有设置']; }
  var A = c.A || {}, B = c.B || {}, co = A.cost || {};
  if(!A.name) m.push('A · 名字 / 品牌名');
  if(!num(A.years) || A.years < 0) m.push('A · 纹了几年');
  if(!A.work) m.push('A · 工作方式');
  else if(A.work === 'split' && !(num(co.splitPct) && co.splitPct >= 0 && co.splitPct < 100)) m.push('A · 工作室分成比例');
  else if(A.work === 'desk'){
    if(!co.deskUnit || !num(co.deskPrice)) m.push('A · 工位怎么付、每次多少钱');
    if(co.deskUnit === 'day' && !pos(co.deskDays)) m.push('A · 每个月大约租几天');
  }
  else if((A.work === 'own' || A.work === 'home' || A.work === 'guest') && !num(co.monthly)) m.push('A · 每月房租和杂费');
  if(!A.location) m.push('A · 地点');
  if(!pos(A.daysPerMonth)) m.push('A · 每个月能工作几天');
  if(!pos(A.maxSession)) m.push('A · 单次最长几小时');
  if(!A.reply || !pos(A.reply.n) || !A.reply.unit) m.push('A · 回复时间');
  if(!A.styles || !A.styles.length) m.push('A · 擅长的风格');
  if(!A.languages || !A.languages.length) m.push('A · 会说的语言');
  var df = A.designFee;
  if(!df || !num(df.pct) || df.pct < 0) m.push('A · 设计稿加价百分比');
  if(!A.retouch || !num(A.retouch.free) || !num(A.retouch.months)) m.push('A · 补色政策');
  if(!A.payment || !A.payment.length) m.push('A · 支付方式');
  if(c.mode !== 1 && c.mode !== 2) m.push('模式（已有价格 / 帮我定价）');
  if(!pos(B.min)) m.push('B · 最低起价');
  D.SIZES.forEach(function(s){ if(!pair((B.sizes || {})[s.k])) m.push('B · 价格 ' + s.l.zh); });
  if(!pos(B.hourly)) m.push('B · 时薪');
  D.LARGE.forEach(function(s){ if(!pair((B.large || {})[s.k])) m.push('B · 小时数 ' + s.l.zh); });
  if(!num(B.colorPct)) m.push('B · 彩色加价');
  if(!B.tiers || !num(B.tiers.n) || !num(B.tiers.d)) m.push('B · 部位加价');
  if(!B.tech || !num(B.tech.line) || !num(B.tech.shade) || !num(B.tech.fill)) m.push('B · 技法加价');
  if((A.refuse || []).indexOf('coverup') < 0 && !num(B.coverPct)) m.push('B · cover-up 加价');
  var dp = B.deposit || {};
  if(!(dp.type === 'pct' ? pos(dp.pct) && num(dp.min) : dp.type === 'fixed' ? pos(dp.amount) : false) || typeof dp.refundable !== 'boolean') m.push('B · 定金');
  if(!num(B.flashDiscount)) m.push('B · flash 折扣');
  return m;
}

/* ---------- Emplacement : palier ---------- */
function tierOf(c, place){
  var o = (c.B.placeTier || {})[place];
  if(o) return o;
  var p = D.PLACES.filter(function(x){ return x.k === place; })[0];
  return p ? p.t : 'n';
}
function refusedPlaces(c){
  var out = {}, rf = c.A.refuse || [];
  D.REFUSE.forEach(function(r){ if(r.k !== 'first_visible' && rf.indexOf(r.k) > -1 && r.p) r.p.forEach(function(k){ out[k] = r.k; }); });
  return out;
}

/* ---------- Estimation client ---------- */
function estimate(c, q){
  var A = c.A, B = c.B, rf = A.refuse || [];
  if(q.type === 'cover' && rf.indexOf('coverup') > -1) return {refused:'coverup'};
  if(q.place){
    var rp = refusedPlaces(c);
    if(rp[q.place]) return {refused:rp[q.place]};
    var fv = D.REFUSE.filter(function(r){ return r.k === 'first_visible'; })[0];
    if(q.first === 'yes' && rf.indexOf('first_visible') > -1 && fv.p.indexOf(q.place) > -1) return {refused:'first_visible'};
  }
  if(!q.size) return null;
  var tech = q.tech === 'unsure' || !q.tech ? 'shade' : q.tech;
  var coef = 1 + (q.color === 'col' ? B.colorPct : 0) / 100
               + (B.tech[tech] || 0) / 100
               + (q.place ? (B.tiers[tierOf(c, q.place)] || 0) : 0) / 100
               + (q.type === 'cover' ? (B.coverPct || 0) : 0) / 100;
  var flash = q.type === 'flash' ? 1 - (B.flashDiscount || 0) / 100 : 1;
  var lo, hi, out = {coef:coef};
  var lg = B.large[q.size];
  if(lg){
    lo = B.hourly * lg[0] * coef * flash; hi = B.hourly * lg[1] * coef * flash;
    out.hours = [lg[0], lg[1]];
    out.sessions = [Math.ceil(lg[0] / A.maxSession), Math.ceil(lg[1] / A.maxSession)];
  } else {
    var s = B.sizes[q.size]; if(!s) return null;
    lo = s[0] * coef * flash; hi = s[1] * coef * flash;
  }
  out.lo = r10(Math.max(B.min, lo)); out.hi = r10(Math.max(B.min, hi));
  var dp = B.deposit;
  out.dep = dp.type === 'fixed' ? dp.amount : r10(Math.max(dp.min || 0, out.lo * dp.pct / 100));
  out.refundable = dp.refundable;
  var dfe = A.designFee;
  if(dfe && dfe.pct > 0 && q.type !== 'flash') out.fee = {pct:dfe.pct, lo:r10(out.lo * dfe.pct / 100), hi:r10(out.hi * dfe.pct / 100)};
  return out;
}

/* ---------- Grille à partir d'un taux horaire ---------- */
function speedRatio(sp){
  var r = [];
  if(sp && pos(sp.s)) r.push(sp.s / 1.5);
  if(sp && pos(sp.m)) r.push(sp.m / 2.75);
  return r.length ? r.reduce(function(a, b){ return a + b; }, 0) / r.length : 1;
}
function fromHourly(h, sp){
  var k = speedRatio(sp), sizes = {}, large = {};
  D.SIZES.forEach(function(s){
    var mid = sp && s.k === 's' && pos(sp.s) ? sp.s : sp && s.k === 'm' && pos(sp.m) ? sp.m : null;
    sizes[s.k] = mid ? [r10(h * mid * 0.8), r10(h * mid * 1.2)] : [r10(h * s.h[0] * k), r10(h * s.h[1] * k)];
  });
  D.LARGE.forEach(function(s){ large[s.k] = [Math.round(s.h[0] * k), Math.round(s.h[1] * k)]; });
  return {sizes:sizes, large:large, ratio:k};
}
function defaultLarge(sp){ return fromHourly(100, sp).large; }

/* ---------- Mode 2 : proposition ---------- */
function band(years){ for(var i = 0; i < D.MARKET.length; i++) if(years < D.MARKET[i].max) return D.MARKET[i]; return D.MARKET[D.MARKET.length - 1]; }
function suggest(A, M){
  var co = A.cost || {}, rep = {};
  var styles = (A.styles || []).filter(function(k){ return k !== 'other'; });
  var fs = styles.map(function(k){ return D.STYLES.filter(function(s){ return s.k === k; })[0].f; });
  var fBase = fs.length ? Math.min.apply(null, fs) : 1;
  var b = band(A.years || 0);
  var mk = [b.rate[0] * fBase, b.rate[1] * fBase];
  var junior = b.k === '0-1' || b.k === '1-3';
  var rate = r5(junior ? mk[0] + (mk[1] - mk[0]) * 0.25 : (mk[0] + mk[1]) / 2);

  var hours = pos(M.actualHours) ? M.actualHours : 0;
  var perClient = pos(M.speed && M.speed.s) ? M.speed.s : 2;
  var clients = pos(M.actualClients) ? M.actualClients : (hours ? hours / perClient : 0);
  if(!hours && clients) hours = clients * perClient;

  var rent = 0, split = 0;
  if(A.work === 'split') split = (co.splitPct || 0) / 100;
  else if(A.work === 'desk') rent = co.deskUnit === 'month' ? co.deskPrice : co.deskUnit === 'day' ? co.deskPrice * (co.deskDays || A.daysPerMonth || 0) : co.deskPrice * clients;
  else rent = co.monthly || 0;
  var sup = M.supplies && num(M.supplies.amount) ? (M.supplies.per === 'session' ? M.supplies.amount * clients : M.supplies.amount) : 0;
  var other = num(M.otherFixed) ? M.otherFixed : 0;
  var soc = (M.status && num(M.status.pct) ? M.status.pct : 21.5) / 100;
  var fixed = rent + other + sup;
  var div = (1 - soc) * (1 - split);
  var be = fixed / div, target = ((M.targetNet || 0) + fixed) / div;
  var needBE = be / rate, needT = target / rate;
  var verdict = hours >= needT ? 'a' : hours >= needBE ? 'b' : 'c';

  var g = fromHourly(rate, M.speed);
  var min = r10(Math.max(rate, b.min[0]));
  var stylePct = {};
  styles.forEach(function(k, i){ var p = Math.round((fs[i] / fBase - 1) * 100); if(p > 0) stylePct[k] = p; });

  rep = {band:b, fBase:fBase, market:[r5(mk[0]), r5(mk[1])], rate:rate, junior:junior,
    rent:Math.round(rent), split:split, supplies:Math.round(sup), other:other, soc:soc, clients:Math.round(clients), hours:Math.round(hours),
    breakEven:Math.round(be), target:Math.round(target), needBE:Math.ceil(needBE), needT:Math.ceil(needT), verdict:verdict,
    gapBE:Math.max(0, Math.ceil(needBE - hours)), gapT:Math.max(0, Math.ceil(needT - hours)),
    overMax:pos(M.maxHours) && needT > M.maxHours, maxHours:M.maxHours,
    rateTop:r5(mk[1]), needTatTop:Math.ceil(target / mk[1])};
  if(M.status && M.status.k === 'none') rep.rateIfAE = r5(rate / (1 - 0.215));

  return {B:{min:min, sizes:g.sizes, hourly:rate, large:g.large, colorPct:20, tiers:{n:0, d:20}, placeTier:{}, coverPct:30,
    tech:{line:0, shade:15, fill:30}, stylePct:stylePct, deposit:{type:'pct', pct:30, min:30, refundable:false}, flashDiscount:0}, rep:rep};
}

window.HQ = {validate:validate, estimate:estimate, suggest:suggest, fromHourly:fromHourly, defaultLarge:defaultLarge, speedRatio:speedRatio, band:band, tierOf:tierOf, refusedPlaces:refusedPlaces, r10:r10};
})();
