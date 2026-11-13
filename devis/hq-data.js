/* Hypnum · Assistant de devis — listes partagées (styles, emplacements, marché parisien).
   Utilisé par la page client (/devis/) et la page de réglages (/devis/reglages.html). */
(function(){
var L = function(fr, en, zh){ return {fr:fr, en:en, zh:zh}; };

/* Styles : la même liste sert au profil du tatoueur et au tableau des prix parisiens.
   f = coefficient de style appliqué au taux horaire du marché (la couleur est comptée à part). */
var STYLES = [
  {k:'fine',    f:1.0,  l:L('Fine line','Fine line','细线')},
  {k:'mini',    f:1.0,  l:L('Minimaliste','Minimalist','极简')},
  {k:'black',   f:1.1,  l:L('Blackwork','Blackwork','黑工')},
  {k:'dot',     f:1.1,  l:L('Dotwork','Dotwork','点刺')},
  {k:'dark',    f:1.1,  l:L('Dark art','Dark art','暗黑')},
  {k:'realbw',  f:1.25, l:L('Réalisme noir et gris','Black and grey realism','写实（黑灰）')},
  {k:'realcol', f:1.25, l:L('Réalisme couleur','Colour realism','写实（彩色）')},
  {k:'old',     f:1.1,  l:L('Old school','Old school','传统美式')},
  {k:'neo',     f:1.2,  l:L('Néo-traditionnel','Neo-traditional','新传统')},
  {k:'jap',     f:1.2,  l:L('Japonais','Japanese','日式')},
  {k:'orn',     f:1.1,  l:L('Ornemental et géométrique','Ornamental and geometric','装饰与几何')},
  {k:'aqua',    f:1.2,  l:L('Aquarelle','Watercolour','水彩')},
  {k:'illu',    f:1.1,  l:L('Illustratif et anime','Illustrative and anime','插画与动漫')},
  {k:'letter',  f:1.0,  l:L('Lettrage','Lettering','字母')},
  {k:'hand',    f:1.0,  l:L('Handpoke','Handpoke','手戳')},
  {k:'other',   f:1.0,  l:L('Autre','Other','其他')}
];

/* Emplacements, groupés par zone. t = palier par défaut (n = normal, d = difficile). */
var ZONES = [
  {k:'arm',   l:L('Bras','Arms','手臂')},
  {k:'torso', l:L('Torse et dos','Torso and back','躯干')},
  {k:'leg',   l:L('Jambes et pieds','Legs and feet','腿和脚')},
  {k:'head',  l:L('Tête et cou','Head and neck','头颈')},
  {k:'other', l:L('Autre','Other','其他')}
];
var PLACES = [
  {k:'upper_out',  z:'arm',   t:'n', l:L('Haut du bras, extérieur','Upper arm, outer','上臂外侧')},
  {k:'upper_in',   z:'arm',   t:'n', l:L('Haut du bras, intérieur','Upper arm, inner','上臂内侧')},
  {k:'shoulder',   z:'arm',   t:'n', l:L('Épaule','Shoulder','肩膀')},
  {k:'fore_out',   z:'arm',   t:'n', l:L('Avant-bras, extérieur','Forearm, outer','小臂外侧')},
  {k:'fore_in',    z:'arm',   t:'n', l:L('Avant-bras, intérieur','Forearm, inner','小臂内侧')},
  {k:'elbow_in',   z:'arm',   t:'n', l:L('Pli du coude','Inner elbow','肘窝')},
  {k:'wrist',      z:'arm',   t:'n', l:L('Poignet','Wrist','手腕')},
  {k:'elbow',      z:'arm',   t:'d', l:L('Coude','Elbow','手肘')},
  {k:'armpit',     z:'arm',   t:'d', l:L('Aisselle','Armpit','腋下')},
  {k:'hand_back',  z:'arm',   t:'d', l:L('Dos de la main','Back of the hand','手背')},
  {k:'finger',     z:'arm',   t:'d', l:L('Doigts','Fingers','手指')},
  {k:'palm',       z:'arm',   t:'d', l:L('Paume','Palm','手掌')},
  {k:'chest',      z:'torso', t:'n', l:L('Poitrine','Chest','胸')},
  {k:'sternum',    z:'torso', t:'n', l:L('Sternum','Sternum','胸骨（胸口中间）')},
  {k:'belly',      z:'torso', t:'n', l:L('Ventre','Stomach','肚子')},
  {k:'ribs',       z:'torso', t:'n', l:L('Côtes, flanc','Ribs, side','肋骨 / 侧腰')},
  {k:'upper_back', z:'torso', t:'n', l:L('Haut du dos','Upper back','上背')},
  {k:'lower_back', z:'torso', t:'n', l:L('Bas du dos','Lower back','下背 / 后腰')},
  {k:'spine',      z:'torso', t:'n', l:L('Colonne','Spine','脊椎')},
  {k:'butt',       z:'torso', t:'n', l:L('Fesse','Buttock','臀部')},
  {k:'thigh',      z:'leg',   t:'n', l:L('Cuisse, devant ou côté','Thigh, front or side','大腿前侧 / 外侧')},
  {k:'thigh_in',   z:'leg',   t:'n', l:L('Cuisse, intérieur','Inner thigh','大腿内侧')},
  {k:'calf',       z:'leg',   t:'n', l:L('Mollet','Calf','小腿肚')},
  {k:'shin',       z:'leg',   t:'n', l:L('Tibia','Shin','小腿前侧（胫骨）')},
  {k:'ankle',      z:'leg',   t:'n', l:L('Cheville','Ankle','脚踝')},
  {k:'knee',       z:'leg',   t:'d', l:L('Genou, creux du genou','Knee, back of the knee','膝盖 / 膝窝')},
  {k:'foot_top',   z:'leg',   t:'d', l:L('Dessus du pied','Top of the foot','脚背')},
  {k:'toes',       z:'leg',   t:'d', l:L('Orteils, plante du pied','Toes, sole','脚趾 / 脚底')},
  {k:'nape',       z:'head',  t:'n', l:L('Nuque','Back of the neck','后颈')},
  {k:'neck',       z:'head',  t:'d', l:L('Cou, devant ou côté','Neck, front or side','脖子（前面和侧面）')},
  {k:'ear',        z:'head',  t:'d', l:L('Oreille','Ear','耳朵')},
  {k:'behind_ear', z:'head',  t:'d', l:L('Derrière l\'oreille','Behind the ear','耳后')},
  {k:'face',       z:'head',  t:'d', l:L('Visage','Face','脸')},
  {k:'scalp',      z:'head',  t:'d', l:L('Crâne','Scalp','头皮')},
  {k:'lip',        z:'head',  t:'d', l:L('Intérieur de la lèvre','Inner lip','嘴唇内侧')},
  {k:'intimate',   z:'other', t:'d', l:L('Zone intime','Intimate area','私密部位')}
];

/* Ce que le tatoueur peut refuser. p = emplacements concernés. */
var REFUSE = [
  {k:'face',     p:['face','lip'], l:L('Visage','Face','脸')},
  {k:'neck',     p:['neck','nape'], l:L('Cou','Neck','脖子')},
  {k:'hands',    p:['hand_back','finger','palm'], l:L('Mains et doigts','Hands and fingers','手和手指')},
  {k:'scalp',    p:['scalp'], l:L('Crâne','Scalp','头皮')},
  {k:'intimate', p:['intimate'], l:L('Zones intimes','Intimate areas','私密部位')},
  {k:'first_visible', p:['face','lip','neck','hand_back','finger','palm'], l:L('Premier tatouage sur le visage, le cou ou les mains','A first tattoo on the face, neck or hands','客人的第一个纹身就纹在脸、脖子、手上')},
  {k:'coverup',  l:L('Cover-up ou retouche du travail d\'un autre tatoueur','Cover-ups or reworking another artist\'s tattoo','cover-up（盖旧图）/ 修改别人纹的图')},
  {k:'copy',     l:L('Copie du travail d\'un autre tatoueur','Copying another artist\'s work','照抄其他纹身师的作品')},
  {k:'hate',     l:L('Motifs haineux ou discriminatoires','Hateful or discriminatory designs','仇恨、歧视类图案')},
  {k:'minors',   l:L('Mineurs','Minors','未成年人')}
];

var SIZES = [
  {k:'xs', l:L('Moins de 5 cm','Under 5 cm','小于 5 cm'), h:[0.5, 1]},
  {k:'s',  l:L('5 à 10 cm','5 to 10 cm','5–10 cm'), h:[1, 2]},
  {k:'m',  l:L('10 à 15 cm','10 to 15 cm','10–15 cm'), h:[2, 3.5]},
  {k:'l',  l:L('15 à 25 cm','15 to 25 cm','15–25 cm'), h:[3.5, 6]}
];
var LARGE = [
  {k:'half', l:L('Demi-manche','Half sleeve','半臂'), h:[10, 15]},
  {k:'full', l:L('Manche complète','Full sleeve','满臂'), h:[20, 30]},
  {k:'back', l:L('Dos complet','Full back','整背'), h:[25, 40]}
];
var TECH = [
  {k:'line',  d:0,  l:L('Trait seul','Lines only','纯线条')},
  {k:'shade', d:15, l:L('Trait avec remplissage ou ombrage','Lines with fill or shading','线条 + 填色或阴影')},
  {k:'fill',  d:30, l:L('Remplissage seul (ombré, réaliste)','Fill only (shading, realism)','纯填色（打雾、写实）')},
  {k:'unsure',l:L('Je ne sais pas','Not sure','我不确定')}
];
var LANGS = [{k:'fr',l:'Français'},{k:'en',l:'English'},{k:'zh',l:'中文'},{k:'es',l:'Español'},{k:'it',l:'Italiano'},{k:'de',l:'Deutsch'},{k:'pt',l:'Português'}];
var PAY = [
  {k:'cash', l:L('Espèces','Cash','现金')},
  {k:'card', l:L('Carte bancaire','Card','刷卡')},
  {k:'transfer', l:L('Virement','Bank transfer','转账')},
  {k:'online', l:L('Paiement en ligne','Online payment','网上支付')}
];

/* Marché parisien, première version (enquête 2026-11). Sources publiques, à recaler avec des données réelles.
   Taux de base (noir et gris, fine line) en €/heure ; min = prix minimum courant. */
var MARKET = [
  {k:'0-1', max:1,  rate:[80,100],  min:[60,80],   l:'0–1 an'},
  {k:'1-3', max:3,  rate:[100,120], min:[80,100],  l:'1–3 ans'},
  {k:'3-5', max:5,  rate:[120,160], min:[100,120], l:'3–5 ans'},
  {k:'5+',  max:99, rate:[160,250], min:[120,150], l:'5 ans et plus'}
];
var DAY_RATE = [600, 1200];

/* Statut fiscal : taux de cotisations par défaut (modifiable). base = sur le chiffre d'affaires ou sur le bénéfice. */
var STATUS = [
  {k:'ae',    pct:21.5, l:L('Auto-entrepreneur (sur le chiffre d\'affaires, environ 21,5 %, à vérifier sur urssaf.fr)','Auto-entrepreneur (on turnover, about 21.5%, check on urssaf.fr)','auto-entrepreneur（按营业额，约 21.5%，请在 urssaf.fr 核对）')},
  {k:'other', pct:40,   l:L('Autre (entreprise individuelle au réel ou société, environ 40 % du bénéfice)','Other (sole trader on actual profit or a company, about 40% of profit)','其他（个人企业按利润交或开了公司，约按利润 40%）')},
  {k:'none',  pct:0,    l:L('Pas encore déclarée (compté à 0 %)','Not registered yet (counted as 0%)','目前没有申报（按 0% 算）')},
  {k:'unknown', pct:21.5, l:L('Je ne sais pas (compté comme auto-entrepreneur)','Not sure (counted as auto-entrepreneur)','不知道（按 auto-entrepreneur 算）')}
];

window.HQ_DATA = {STYLES:STYLES, ZONES:ZONES, PLACES:PLACES, REFUSE:REFUSE, SIZES:SIZES, LARGE:LARGE, TECH:TECH, LANGS:LANGS, PAY:PAY, MARKET:MARKET, DAY_RATE:DAY_RATE, STATUS:STATUS};
})();
