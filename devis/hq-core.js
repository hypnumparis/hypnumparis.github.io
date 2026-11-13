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
function validate(c, lg){
  lg = lg === 'fr' || lg === 'en' ? lg : 'zh';
  var m = [], at = [];
  function V(fr, en, zh, p){ m.push(lg === 'fr' ? fr : lg === 'en' ? en : zh); at.push(p || ''); }
  if(!c){ return [lg === 'fr' ? 'Aucun réglage' : lg === 'en' ? 'No settings' : '没有设置']; }
  var A = c.A || {}, B = c.B || {}, co = A.cost || {};
  if(!A.name) V('A · Nom ou nom d\'artiste', 'A · Name or artist name', 'A · 名字 / 品牌名', 'A.name');
  if(!num(A.years) || A.years < 0) V('A · Années d\'expérience', 'A · Years of experience', 'A · 纹了几年', 'A.years');
  if(!A.work) V('A · Façon de travailler', 'A · How you work', 'A · 工作方式', 'A.work');
  else if(A.work === 'split' && !(num(co.splitPct) && co.splitPct >= 0 && co.splitPct < 100)) V('A · Part du studio', 'A · Studio share', 'A · 工作室分成比例', 'A.cost.splitPct');
  else if(A.work === 'desk'){
    if(!co.deskUnit || !num(co.deskPrice)) V('A · Location du poste : formule et prix', 'A · Desk rental: unit and price', 'A · 工位怎么付、每次多少钱', co.deskUnit ? 'A.cost.deskPrice' : 'A.cost.deskUnit');
    if(co.deskUnit === 'day' && !pos(co.deskDays)) V('A · Jours loués par mois', 'A · Days rented per month', 'A · 每个月大约租几天', 'A.cost.deskDays');
  }
  else if((A.work === 'own' || A.work === 'home') && !num(co.monthly)) V('A · Loyer et charges par mois', 'A · Monthly rent and costs', 'A · 每月房租和杂费', 'A.cost.monthly');
  if(!A.location) V('A · Lieu', 'A · Location', 'A · 地点', 'A.location');
  if(!pos(A.daysPerMonth)) V('A · Jours de travail par mois', 'A · Working days per month', 'A · 每个月能工作几天', 'A.daysPerMonth');
  if(!pos(A.maxSession)) V('A · Durée maximale d\'une séance', 'A · Longest session', 'A · 单次最长几小时', 'A.maxSession');
  if(!A.reply || !pos(A.reply.n) || !A.reply.unit) V('A · Délai de réponse', 'A · Reply time', 'A · 回复时间', 'A.reply.n');
  if(!A.styles || !A.styles.length) V('A · Styles', 'A · Styles', 'A · 擅长的风格', 'A.styles');
  if(!A.languages || !A.languages.length) V('A · Langues parlées', 'A · Languages spoken', 'A · 会说的语言', 'A.languages');
  var df = A.designFee;
  if(!df || !num(df.pct) || df.pct < 0) V('A · Supplément dessin (%)', 'A · Design surcharge (%)', 'A · 设计稿加价百分比', 'A.designFee.pct');
  if(!A.retouch || !num(A.retouch.free) || !num(A.retouch.months)) V('A · Retouches', 'A · Touch-up policy', 'A · 补色政策', 'A.retouch.free');
  if(!A.payment || !A.payment.length) V('A · Moyens de paiement', 'A · Payment methods', 'A · 支付方式', 'A.payment');
  if(c.mode !== 1 && c.mode !== 2) V('Mode (j\'ai mes prix / aidez-moi)', 'Mode (I have prices / help me)', '模式（已有价格 / 帮我定价）', 'mode');
  if(!pos(B.min)) V('B · Prix minimum', 'B · Minimum price', 'B · 最低起价', 'B.min');
  D.SIZES.forEach(function(s){ if(!pair((B.sizes || {})[s.k])) V('B · Prix ' + s.l.fr, 'B · Price ' + s.l.en, 'B · 价格 ' + s.l.zh, 'B.sizes.' + s.k + '.0'); });
  if(!pos(B.hourly)) V('B · Taux horaire', 'B · Hourly rate', 'B · 时薪', 'B.hourly');
  D.LARGE.forEach(function(s){ if(!pair((B.large || {})[s.k])) V('B · Heures ' + s.l.fr, 'B · Hours ' + s.l.en, 'B · 小时数 ' + s.l.zh, 'B.large.' + s.k + '.0'); });
  if(!num(B.colorPct)) V('B · Supplément couleur', 'B · Colour surcharge', 'B · 彩色加价', 'B.colorPct');
  if(!B.tiers || !num(B.tiers.n) || !num(B.tiers.d)) V('B · Supplément emplacement', 'B · Placement surcharge', 'B · 部位加价', 'B.tiers.d');
  if(!B.tech || !num(B.tech.line) || !num(B.tech.shade) || !num(B.tech.fill)) V('B · Supplément technique', 'B · Technique surcharge', 'B · 技法加价', 'B.tech.shade');
  if((A.refuse || []).indexOf('coverup') < 0 && !num(B.coverPct)) V('B · Supplément cover-up', 'B · Cover-up surcharge', 'B · cover-up 加价', 'B.coverPct');
  var dp = B.deposit || {};
  var dpOk = dp.type === 'pct' ? pos(dp.pct) && num(dp.min) : dp.type === 'fixed' ? pos(dp.amount) : false;
  if(!dpOk || typeof dp.refundable !== 'boolean' || typeof dp.deducted !== 'boolean') V('B · Acompte', 'B · Deposit', 'B · 定金', !dpOk ? 'B.deposit.type' : typeof dp.refundable !== 'boolean' ? 'B.deposit.refundable' : 'B.deposit.deducted');
  if(!num(B.flashDiscount)) V('B · Remise flash', 'B · Flash discount', 'B · flash 折扣', 'B.flashDiscount');
  m.at = at;  /* chemin du champ correspondant, pour y aller depuis la page de réglages */
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
  /* prix du tatouage, puis frais de dessin inclus dans le total affiché */
  var tlo = r10(Math.max(B.min, lo)), thi = r10(Math.max(B.min, hi));
  out.tattoo = [tlo, thi]; out.lo = tlo; out.hi = thi;
  var dfe = A.designFee;
  if(dfe && dfe.pct > 0 && q.type !== 'flash' && q.type !== 'own'){
    out.fee = {pct:dfe.pct, lo:r10(tlo * dfe.pct / 100), hi:r10(thi * dfe.pct / 100)};
    out.lo += out.fee.lo; out.hi += out.fee.hi;
  }
  var dp = B.deposit;
  out.dep = dp.type === 'fixed' ? dp.amount : r10(Math.max(dp.min || 0, out.lo * dp.pct / 100));
  out.refundable = dp.refundable;
  out.deducted = dp.deducted !== false;
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

  rep = {band:b, fBase:fBase, market:[r5(mk[0]), r5(mk[1])], rate:rate, junior:junior,
    rent:Math.round(rent), split:split, supplies:Math.round(sup), other:other, soc:soc, clients:Math.round(clients), hours:Math.round(hours),
    breakEven:Math.round(be), target:Math.round(target), needBE:Math.ceil(needBE), needT:Math.ceil(needT), verdict:verdict,
    gapBE:Math.max(0, Math.ceil(needBE - hours)), gapT:Math.max(0, Math.ceil(needT - hours)),
    overMax:pos(M.maxHours) && needT > M.maxHours, maxHours:M.maxHours,
    rateTop:r5(mk[1]), needTatTop:Math.ceil(target / mk[1])};
  if(M.status && M.status.k === 'none') rep.rateIfAE = r5(rate / (1 - 0.215));

  return {B:{min:min, sizes:g.sizes, hourly:rate, large:g.large, colorPct:20, tiers:{n:0, d:20}, placeTier:{}, coverPct:30,
    tech:{line:0, shade:15, fill:30}, stylePct:stylePct, deposit:{type:'pct', pct:30, min:30, refundable:false, deducted:null}, flashDiscount:0}, rep:rep};
}

window.HQ = {validate:validate, estimate:estimate, suggest:suggest, fromHourly:fromHourly, defaultLarge:defaultLarge, speedRatio:speedRatio, band:band, tierOf:tierOf, refusedPlaces:refusedPlaces, r10:r10};
})();
