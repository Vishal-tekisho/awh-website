document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

const STATUS = { active:{n:'Active',cls:'on'}, draft:{n:'Draft',cls:''}, inactive:{n:'Inactive',cls:'warn'} };
/* Package Category · BRD §14: Consultation / Treatment / Procedure / Combined (stored on the record's
   existing `type` key; the old invented "Preventive / Health-Check" values are gone). */
const PKG_TYPES = { consultation:'Consultation', treatment:'Treatment', procedure:'Procedure', combined:'Combined' };

/* ============================================================
   Package "Included Service / Treatment / Procedure" catalogue.
   Names/keys here are drawn from · and must be kept in sync with —
   the LIVE master catalogues an Admin configures elsewhere:
     · services-consultation-types.html → SERVICES  (e.g. "OZONE THERAPY",
       "PLATELET RICH PLASMA Procedure", "DRESSING")
     · treatments-procedures.html → TREATMENTS / PROCEDURES (e.g.
       "Negative Pressure Wound Therapy (NPWT) Course", "Sharp Debridement",
       "Compression Therapy Program")
   In the full application this list is populated live from those two
   masters, not re-typed here. `source` on each row records which
   master + category it was pulled from, so an Admin editing a package
   can trace an inclusion back to where it's actually defined.
============================================================ */
/* SERVICE_CATALOG is built further down from the real mirrors (SERVICES_MIRROR + TP_MIRROR) · the
   old hand-typed list ("HBOT", "Subdermal PRP", "Aseptic Dressings"…) did not match a single actual
   record on the Services screen. */

const PACKAGES = [
 {id:'pk-1', code:'PKG-101', name:'Basic Limb Preservation Package', type:'treatment', duration:'3 Weeks Cycle',
  description:'3-week core wound healing course with HBOT and topical ozone therapies.',
  services:[{key:'svc-21',qty:15},{key:'svc-220',qty:15},{key:'svc-20',qty:1},{key:'svc-8',qty:6}],
  validity:'3 weeks from purchase', validityStart:'activation', consumptionRule:'completed-session', exclusions:'', renewal:'Upgradeable to Advanced Regenerative Package', price:35000, status:'active', updatedOn:'16 August 2026'},
 {id:'pk-2', code:'PKG-102', name:'Advanced Regenerative Package', type:'treatment', duration:'6 Weeks Cycle',
  description:'6-week intensive regenerative course including GFC Exosomes, PRP & HBOT.',
  services:[{key:'svc-21',qty:30},{key:'svc-220',qty:30},{key:'svc-20',qty:3},{key:'svc-8',qty:12},{key:'PRC-201',qty:2}],
  validity:'6 weeks from purchase', validityStart:'activation', consumptionRule:'completed-session', exclusions:'', renewal:'Upgradeable to Premium Intensive Bio-Reconstruction Package', price:75000, status:'active', updatedOn:'16 August 2026'},
 {id:'pk-3', code:'PKG-103', name:'Premium Intensive Bio-Reconstruction Package', type:'treatment', duration:'6 Weeks Cycle',
  description:'Complete limb preservation protocol including Micro-Fat Grafting, Exosomes, HBOT & Offloading.',
  services:[{key:'svc-21',qty:36},{key:'svc-220',qty:36},{key:'svc-20',qty:4},{key:'svc-8',qty:18},{key:'svc-17',qty:1},{key:'svc-3',qty:10}],
  validity:'6 weeks from purchase', validityStart:'activation', consumptionRule:'completed-session', exclusions:'', renewal:'', price:135000, status:'active', updatedOn:'16 August 2026'}
];

const MINI_PACKAGES = [
 {id:'mini-1', code:'MPK-201', name:'Quick Dressing Bundle · 3 Sessions', type:'treatment', services:[{key:'svc-8',qty:3}], validity:'2 weeks from purchase', validityStart:'assignment', consumptionRule:'completed-session',
  exclusions:'Excludes debridement', renewal:'', price:1500, status:'active', updatedOn:'16 August 2026'},
 {id:'mini-2', code:'MPK-202', name:'Debridement + Dressing Combo · 5 Sessions', type:'procedure', services:[{key:'PRC-201',qty:1},{key:'svc-8',qty:4}], validity:'3 weeks from purchase', validityStart:'assignment', consumptionRule:'completed-session',
  exclusions:'', renewal:'', price:2500, status:'active', updatedOn:'16 August 2026'},
 {id:'mini-3', code:'MPK-203', name:'Short Wound Care Course · 8 Sessions', type:'treatment', services:[{key:'svc-8',qty:6},{key:'svc-125',qty:2}], validity:'4 weeks from purchase', validityStart:'assignment', consumptionRule:'completed-activity',
  exclusions:'Excludes lab tests', renewal:'Upgradeable to Wound Care Starter Package', price:5000, status:'active', updatedOn:'16 August 2026'}
];

/* Service Pricing · one row per service created on Services & Consultation Types (mirrored here the
   same way DEPARTMENTS/DOCTORS are mirrored elsewhere). Services are added THERE; this tab only sets
   each one's reference price, so there is no "Add" on this tab. */
const SERVICES_MIRROR = [{"sr":3,"n":"Wound Physio","br":"OPD Annexe","status":"active"},{"sr":4,"n":"Foot Scan & Analysis","br":"Main Campus","status":"active"},{"sr":5,"n":"Gait Analysis","br":"Main Campus","status":"active"},{"sr":20,"n":"PLATELET RICH PLASMA Procedure","br":"Main Campus","status":"active"},{"sr":21,"n":"WARM OXYGEN THERAPY","br":"Main Campus","status":"active"},{"sr":30,"n":"10 DAYS PACKAGE","br":"Main Campus","status":"active"},{"sr":37,"n":"15 DAYS PACKAGE","br":"Main Campus","status":"active"},{"sr":40,"n":"15-DAYS-PACKAGE","br":"OPD Annexe","status":"active"},{"sr":47,"n":"21 DAYS","br":"Main Campus","status":"active"},{"sr":49,"n":"21-Days package :HBOT-21,MHT-21,O3-21,WOUND PHYSIO-21,PRP-2,FAT GRAFTING -2,COLON-1,INFRA -3,C &D-10,DIET CONSULTATION,LAZER ,PROCEDURE","br":"Main Campus","status":"active"},{"sr":69,"n":"PACKAGE","br":"Main Campus","status":"active"},{"sr":73,"n":"LASERS","br":"Main Campus","status":"active"},{"sr":83,"n":"PACKAGE","br":"Main Campus","status":"active"},{"sr":142,"n":"Foley Catheter charges","br":"Main Campus","status":"active"},{"sr":207,"n":"New Appointment","br":"OPD Annexe","status":"active"},{"sr":220,"n":"OZONE THERAPY","br":"Main Campus","status":"active"},{"sr":229,"n":"Ozone Therapy","br":"Main Campus","status":"active"},{"sr":263,"n":"PACKAGE","br":"Main Campus","status":"active"},{"sr":307,"n":"VIP","br":"Main Campus","status":"active"},{"sr":6,"n":"PAIN MANAGEMENT","br":"Main Campus","status":"active"},{"sr":10,"n":"PAIN MANAGEMENT","br":"Main Campus","status":"active"},{"sr":11,"n":"Wound Physiotherapy","br":"OPD Annexe","status":"active"},{"sr":45,"n":"2-D-ECHO","br":"Main Campus","status":"active"},{"sr":78,"n":"Ana profile","br":"Main Campus","status":"active"},{"sr":79,"n":"Ana titer","br":"Madhurawada Branch","status":"active"},{"sr":2,"n":"15 DAYS HYDROGEN 8H, OZONE THERAPY, CLEANING & DRESSING","br":"Main Campus","status":"active"},{"sr":25,"n":"10 DAYS -HBOT ,MHT,OZONE THERAPY","br":"Main Campus","status":"active"},{"sr":26,"n":"10 DAYS -HBOT ,MHT,OZONE THERAPY","br":"Main Campus","status":"active"},{"sr":14,"n":"Skin-Grafting Procedure","br":"OPD Annexe","status":"active"},{"sr":17,"n":"Skin-Grafting Procedure","br":"Main Campus","status":"active"},{"sr":109,"n":"DEBRIDMENT","br":"Main Campus","status":"active"},{"sr":7,"n":"BURNS DRESSING","br":"Main Campus","status":"active"},{"sr":8,"n":"DRESSING","br":"Main Campus","status":"active"},{"sr":72,"n":"DRESSINGS","br":"Main Campus","status":"active"},{"sr":9,"n":"Gait Analysis","br":"Main Campus","status":"active"},{"sr":19,"n":"WOUND PHYSIO","br":"Main Campus","status":"active"},{"sr":76,"n":"AIR WALKER","br":"OPD Annexe","status":"active"},{"sr":93,"n":"CARDIOLOGIST-CONSULTATON","br":"Main Campus","status":"active"},{"sr":124,"n":"Diabetologist consultation","br":"Main Campus","status":"active"},{"sr":125,"n":"DR KVNN CONSULTATION","br":"Main Campus","status":"active"}];
const SEED_PRICES = {4:1500, 5:1200, 3:900, 207:500, 20:6000, 109:2500};
/* Treatments & procedures are independently bookable (client-confirmed), so they are priced here
   too · mirrored from treatments-procedures.js the same way SERVICES_MIRROR is. */
const TP_MIRROR = [
  {n:'Diabetic Foot Ulcer Management Program', code:'TRT-101', kind:'Treatment'},
  {n:'Compression Therapy Program', code:'TRT-102', kind:'Treatment'},
  {n:'Negative Pressure Wound Therapy (NPWT) Course', code:'TRT-103', kind:'Treatment'},
  {n:'Post-Surgical Wound Care Program', code:'TRT-104', kind:'Treatment'},
  {n:'Sharp Debridement', code:'PRC-201', kind:'Procedure'},
  {n:'Wound VAC Application', code:'PRC-202', kind:'Procedure'},
  {n:'Skin Graft Dressing Change', code:'PRC-203', kind:'Procedure'},
  {n:'Suture Removal', code:'PRC-204', kind:'Procedure'}
];
const SEED_PRICES_TP = {'TRT-103':3000, 'PRC-201':2500, 'PRC-204':600};
const PRICING = SERVICES_MIRROR.map(s => ({ id:'pc-'+s.sr, sr:s.sr, name:s.n, branch:s.br, appliesTo:'Service', override:'—',
  effective: SEED_PRICES[s.sr] ? '01 January 2026' : '—', prevPrice:'—', price: SEED_PRICES[s.sr]||0,
  status: s.status==='inactive' ? 'inactive' : 'active', updatedOn: SEED_PRICES[s.sr] ? '01 January 2026' : '—' }))
  .concat(TP_MIRROR.map(t => ({ id:'pc-'+t.code, code:t.code, name:t.n, branch:'', appliesTo:t.kind, override:'—',
    effective: SEED_PRICES_TP[t.code] ? '01 January 2026' : '—', prevPrice:'—', price: SEED_PRICES_TP[t.code]||0,
    status:'active', updatedOn: SEED_PRICES_TP[t.code] ? '01 January 2026' : '—' })));
/* treatments and procedures first, then services · so all three kinds are visible on the first
   screen without scrolling past 40 services (stable sort keeps each group's own order) */
PRICING.sort((a,b) => (a.appliesTo==='Service') - (b.appliesTo==='Service'));
/* any seed row still carrying a pre-BRD category value folds into Combined */
PACKAGES.concat(MINI_PACKAGES).forEach(p => { if(!PKG_TYPES[p.type]) p.type = 'combined'; });
/* Package inclusions pick from the live catalogue: every Service (by sr) + every Treatment/Procedure
   (by code). A package's `services` is [{key, qty}]. */
const SERVICE_CATALOG = SERVICES_MIRROR.map(s => ({ key:'svc-'+s.sr, name:s.n, source:'Service · '+(s.br||'All branches') }))
  .concat(TP_MIRROR.map(t => ({ key:t.code, name:t.n, source:t.kind+' · '+t.code })));
const catalogItem = key => SERVICE_CATALOG.find(x => x.key===key);
const inclSummary = e => (e.services||[]).map(it => { const s = catalogItem(it.key); return s ? it.qty+'× '+esc(s.name) : ''; }).filter(Boolean).join(', ') || '—';

let activeTab = 'pkg';
/* Pricing tab is paginated (48+ rows): 10 per page. Packages / mini packages stay single-page. */
let pricePage = 1; const PAGE_SIZE = 10;
function filtersChanged(){ pricePage = 1; applyFilters(); }

function initFsel(wrapId,btnId,panelId,hiddenId,opts,onPick){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  const setVal=(v,silent)=>{
    hidden.value=v;
    const found=opts.find(o=>o[0]===v);
    btn.textContent = found ? found[1] : opts[0][1];
    $$('.fselopt',panel).forEach(x=>x.classList.toggle('on', x.dataset.v===v));
    if(!silent && onPick) onPick(v);
  };
  panel.innerHTML = opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+v+'">'+l+'</button>').join('');
  setVal(opts[0][0], true);
  panel.addEventListener('click', e=>{
    const b=e.target.closest('.fselopt'); if(!b) return;
    setVal(b.dataset.v);
    root.classList.remove('open');
  });
  btn.addEventListener('click', e=>{
    e.stopPropagation();
    const wasOpen=root.classList.contains('open');
    $$('.f.fsel').forEach(x=>x.classList.remove('open'));
    if(!wasOpen) root.classList.add('open');
  });
  return { set:v=>setVal(v,true), get:()=>hidden.value };
}
document.addEventListener('click', ()=>$$('.f.fsel').forEach(x=>x.classList.remove('open')));

const typeDD = initFsel('typeWrap','typeBtn','typePanel','fType',
  [['','All types'],['Service','Service'],['Treatment','Treatment'],['Procedure','Procedure']], filtersChanged);
const statDD = initFsel('statWrap','statBtn','statPanel','fStat',
  [['','All statuses'],['active','Active'],['draft','Draft'],['inactive','Inactive']], filtersChanged);
const dTypeDD = initFsel('dTypeWrap','dTypeBtn','dTypePanel','dType', Object.entries(PKG_TYPES));

function isPkgShape(){ return activeTab==='pkg' || activeTab==='mini'; }

$('#tabSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  activeTab = b.dataset.t;
  $$('#tabSeg button').forEach(x=>x.classList.toggle('on', x===b));
  $('#newBtnTxt').textContent = 'Add package'; // one button; Standard vs Mini is picked inside the form
  $('#newBtn').style.display = activeTab==='price' ? 'none' : ''; // services are added on Services & Consultation Types
  pricePage = 1; $('#pSearch').value=''; statDD.set(''); typeDD.set('');
  $('#typeWrap').style.display = activeTab==='price' ? '' : 'none'; // Type filter only makes sense on Pricing
  renderHead();
  renderStats(); // pills re-scope to the active tab (count + label)
  applyFilters();
});

function renderHead(){
  $('#tblHead').innerHTML = isPkgShape()
    ? '<tr><th>' + (activeTab==='mini'?'Mini Package':'Package') + '</th><th>Category</th><th>Included</th><th>Validity</th><th>Price</th><th>Status</th><th style="text-align:right">Actions</th></tr>'
    : '<tr><th>Item</th><th>Applies To</th><th>Reference Price</th><th>Branch Override</th><th>Effective Date</th><th>Status</th><th style="text-align:right">Actions</th></tr>';
}
function dataset(){ return activeTab==='pkg' ? PACKAGES : activeTab==='mini' ? MINI_PACKAGES : PRICING; }

function renderRow(e){
  const st = STATUS[e.status];
  if(isPkgShape()){
    return `<tr>
      <td><b>${esc(e.name)}</b><span class="s">${esc(e.code||'—')}</span></td>
      <td><span class="s">${PKG_TYPES[e.type]}</span></td>
      <td><span class="s">${inclSummary(e)}</span></td>
      <td><span class="s">${esc(e.validity)}</span></td>
      <td><b>₹${e.price.toLocaleString('en-IN')}</b></td>
      <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td>
    </tr>`;
  }
  return `<tr>
    <td><b>${esc(e.name)}</b><span class="s">${esc(e.code||e.branch||'All branches')}${e.prevPrice&&e.prevPrice!=='—' ? ' · Previously '+esc(e.prevPrice) : ''}</span></td>
    <td><span class="s">${esc(e.appliesTo)}</span></td>
    <td>${e.price ? '<b>₹'+e.price.toLocaleString('en-IN')+'</b>' : '<span class="s">Not set</span>'}</td>
    <td><span class="s">${esc(e.override)}</span></td>
    <td><span class="s">${esc(e.effective)}</span></td>
    <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td>
  </tr>`;
}
function renderPkgCard(e){
  const st = STATUS[e.status];
  const svcRows = (e.services||[]).map(it => { const s = catalogItem(it.key); return s ? `<div class="pkgsvc-row"><span>${esc(s.name)}:</span><b>${it.qty} session${it.qty>1?'s':''}</b></div>` : ''; }).join('')
    || '<div class="pkgsvc-row"><span class="notincl">No items added yet</span></div>';
  return `<div class="pkgcard">
    <div class="pkgcard-top">
      <div><b>${esc(e.name)}</b><span class="s">${esc(e.code||'—')} · ${esc(e.duration)}</span></div>
      <span class="pkgprice">₹${e.price.toLocaleString('en-IN')}</span>
    </div>
    <p class="pkgdesc">${esc(e.description)}</p>
    <div class="pkgsvc">
      <div class="pkgsvc-hd">Package Service Inclusions:</div>
      ${svcRows}
    </div>
    <div class="pkgcard-bot">
      <span class="stchip ${st.cls}"><i></i>${e.status==='active'?'Active Package':st.n}</span>
      <button class="mini" data-edit="${e.id}">Edit Config</button>
    </div>
  </div>`;
}
function renderSvcTbl(services){
  services = Array.isArray(services) ? services : [];
  if(!services.length) return '<div class="svcempty">No items added yet. Search above to add services, treatments or procedures.</div>';
  return services.map(it => { const s = catalogItem(it.key); if(!s) return '';
    return `<div class="svcrow" data-key="${esc(s.key)}"><span class="svcname">${esc(s.name)}<br><small style="color:var(--ink-muted);font-weight:500;font-size:9.5px">${esc(s.source)}</small></span><span class="svcctl"><input class="fld svcnum" type="number" min="1" value="${it.qty||1}"><button type="button" class="svcrm" title="Remove">&times;</button></span></div>`;
  }).join('');
}
function readSvcTbl(){
  return $$('#svcTbl .svcrow').map(r => ({ key:r.dataset.key, qty:Math.max(1, Number(r.querySelector('.svcnum').value)||1) }));
}
/* inclusion picker: type to search the catalogue, click to add (already-added items are hidden) */
function renderSvcPick(){
  const q = $('#svcSearch').value.trim().toLowerCase();
  const have = new Set(readSvcTbl().map(x=>x.key));
  const hits = q ? SERVICE_CATALOG.filter(s => !have.has(s.key) && s.name.toLowerCase().includes(q)).slice(0,8) : [];
  $('#svcPick').innerHTML = hits.map(s => `<button type="button" data-key="${esc(s.key)}"><b>${esc(s.name)}</b><small>${esc(s.source)}</small></button>`).join('')
    || (q ? '<div class="svcempty" style="padding:8px 10px">No matches</div>' : '');
  $('#svcPick').classList.toggle('show', !!q);
}
$('#svcSearch').addEventListener('input', renderSvcPick);
$('#svcSearch').addEventListener('click', e => { e.stopPropagation(); renderSvcPick(); });
$('#svcPick').addEventListener('click', e => {
  const b = e.target.closest('button[data-key]'); if(!b) return;
  e.stopPropagation();
  $('#svcTbl').innerHTML = renderSvcTbl(readSvcTbl().concat([{key:b.dataset.key, qty:1}]));
  $('#svcSearch').value = ''; $('#svcPick').classList.remove('show');
});
$('#svcTbl').addEventListener('click', e => {
  const b = e.target.closest('.svcrm'); if(!b) return;
  b.closest('.svcrow').remove();
  if(!$('#svcTbl .svcrow')) $('#svcTbl').innerHTML = renderSvcTbl([]);
});
document.addEventListener('click', () => $('#svcPick').classList.remove('show'));
function renderStats(){
  const list = dataset();
  $('#stTotalLbl').textContent = activeTab==='pkg' ? 'Total packages' : activeTab==='mini' ? 'Total mini packages' : 'Total priced items';
  $('#stTotal').textContent = list.length;
  $('#stActive').textContent = list.filter(e=>e.status==='active').length;
  $('#stDraft').textContent = list.filter(e=>e.status==='draft').length;
}
function applyFilters(){
  const q = $('#pSearch').value.trim().toLowerCase();
  const stat = statDD.get();
  const type = activeTab==='price' ? typeDD.get() : '';
  const list = dataset().filter(e => (!q || e.name.toLowerCase().includes(q)) && (!stat || e.status===stat) && (!type || e.appliesTo===type));
  renderList(list);
}
function renderList(list){
  const full = dataset();
  const isCardView = activeTab==='pkg';
  $('#pEmptyTxt').textContent = activeTab==='pkg' ? 'No packages match these filters' : activeTab==='mini' ? 'No mini packages match these filters' : 'No priced items match these filters';
  if(!list.length){
    $('#pBody').innerHTML=''; $('#pkgGrid').innerHTML=''; $('#pkgGrid').style.display='none'; $('#tblWrap').style.display='';
    $('#pEmpty').style.display='block';
    $('#pFoot').textContent = `Showing 0 of ${full.length} items`;
    $('#pager').innerHTML = '';
    return;
  }
  $('#pEmpty').style.display='none';
  if(isCardView){
    $('#tblWrap').style.display='none';
    $('#pkgGrid').style.display='grid';
    $('#pkgGrid').innerHTML = list.map(renderPkgCard).join('');
  } else {
    $('#pkgGrid').style.display='none';
    $('#tblWrap').style.display='';
    let rows = list;
    if(activeTab==='price'){
      const pages = Math.max(1, Math.ceil(list.length/PAGE_SIZE)); if(pricePage>pages) pricePage = pages;
      rows = list.slice((pricePage-1)*PAGE_SIZE, pricePage*PAGE_SIZE);
    }
    $('#pBody').innerHTML = rows.map(renderRow).join('');
  }
  renderPager(activeTab==='price' ? list.length : 0);
  $('#pFoot').textContent = (activeTab==='price' && list.length > PAGE_SIZE)
    ? 'Showing ' + ((pricePage-1)*PAGE_SIZE+1) + '–' + Math.min(pricePage*PAGE_SIZE, list.length) + ' of ' + list.length + ' items'
    : 'Showing ' + list.length + ' of ' + full.length + ' items';
}
function renderPager(total){
  const pages = Math.max(1, Math.ceil(total/PAGE_SIZE));
  if(!total || pages<=1){ $('#pager').innerHTML = ''; return; }
  let btns = '';
  for(let p=1; p<=pages; p++) btns += '<button class="pgbtn'+(p===pricePage?' on':'')+'" data-p="'+p+'">'+p+'</button>';
  $('#pager').innerHTML = '<button class="pgbtn nav" data-p="prev"'+(pricePage===1?' disabled':'')+'>‹ Prev</button>'+btns+'<button class="pgbtn nav" data-p="next"'+(pricePage===pages?' disabled':'')+'>Next ›</button>';
}
$('#pager').addEventListener('click', e=>{
  const b = e.target.closest('.pgbtn'); if(!b || b.disabled) return;
  if(b.dataset.p==='prev') pricePage--; else if(b.dataset.p==='next') pricePage++; else pricePage = +b.dataset.p;
  applyFilters();
});
$('#pSearch').addEventListener('input', filtersChanged);

let editingId = null;
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId, v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b ? b.dataset.v : null; }
$('#dStatusSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dStatusSeg', b.dataset.v); });
$('#dValidityStartSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dValidityStartSeg', b.dataset.v); });
$('#dConsumptionSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dConsumptionSeg', b.dataset.v); });

/* The drawer's shape follows drawerKind ('pkg' | 'mini' | 'price'), not the list tab: "Add package"
   opens with a Package type picker (Standard / Mini) at the top; editing fixes the kind (picker hidden). */
let drawerKind = 'pkg';
const dKindDD = initFsel('dKindWrap','dKindBtn','dKindPanel','dKind', [['pkg','Standard package'],['mini','Mini package']], v => { drawerKind = v; applyDrawerKind(); });
function applyDrawerKind(){
  const isPkg = drawerKind!=='price', isMini = drawerKind==='mini';
  $('#dKindFld').style.display = (isPkg && !editingId) ? '' : 'none';
  $('#dNameLbl').textContent = isMini ? 'Mini package name' : isPkg ? 'Package name' : 'Item name';
  $('#dPriceLbl').textContent = isPkg ? 'Price (₹)' : 'Reference Price (₹)';
  $('#pkgOnlyGroup').style.display = isPkg ? '' : 'none';
  $('#priceOnlyGroup').style.display = isPkg ? 'none' : '';
  $('#dCodeFld').style.display = isPkg ? '' : 'none';
  $('#dDurationGroup').style.display = drawerKind==='pkg' ? '' : 'none';
  $('#dDescGroup').style.display = drawerKind==='pkg' ? '' : 'none';
  $('#svcGroup').style.display = isPkg ? '' : 'none';
  if(!editingId){
    $('#dTitle').textContent = isMini ? 'Add mini package' : isPkg ? 'Add package' : 'Add reference price';
    $('#dSub').textContent = isMini ? 'Define a new mini package' : isPkg ? 'Define a new package' : 'Define a new reference price';
  }
}
function syncPkgFieldGroups(){ applyDrawerKind(); }

$('#newBtn').addEventListener('click', ()=>{
  editingId = null;
  drawerKind = activeTab==='mini' ? 'mini' : 'pkg'; dKindDD.set(drawerKind);
  const isPkg = isPkgShape();
  $('#dNameLbl').textContent = activeTab==='mini' ? 'Mini package name' : isPkg ? 'Package name' : 'Item name';
  $('#dPriceLbl').textContent = isPkg ? 'Price (₹)' : 'Reference Price (₹)';
  $('#dTitle').textContent = activeTab==='mini' ? 'Add mini package' : isPkg ? 'Add package' : 'Add reference price';
  $('#dSub').textContent = activeTab==='mini' ? 'Define a new mini package' : isPkg ? 'Define a new package' : 'Define a new reference price';
  $('#pkgOnlyGroup').style.display = isPkg ? '' : 'none';
  $('#priceOnlyGroup').style.display = isPkg ? 'none' : '';
  syncPkgFieldGroups();
  $('#dName').value=''; $('#dName').readOnly=false; $('#dCode').value=''; $('#dCodeFld').style.display = isPkgShape() ? '' : 'none'; $('#dValidity').value=''; $('#dExclusions').value=''; $('#dRenewal').value=''; $('#dPrice').value='';
  $('#dAppliesTo').value=''; $('#dOverride').value=''; $('#dEffective').value=''; $('#dPrevPrice').value='';
  $('#dDuration').value=''; $('#dDesc').value=''; $('#svcTbl').innerHTML = renderSvcTbl([]); $('#svcSearch').value='';
  segSet('dValidityStartSeg','assignment'); segSet('dConsumptionSeg','completed-session');
  segSet('dStatusSeg','draft');
  $('#dMetaWrap').style.display='none';
  openDrawer();
});
function handleEditClick(e){
  const b=e.target.closest('[data-edit]'); if(!b) return;
  const item = dataset().find(x=>x.id===b.dataset.edit); if(!item) return;
  editingId = item.id;
  drawerKind = activeTab; dKindDD.set(activeTab==='mini' ? 'mini' : 'pkg');
  const isPkg = isPkgShape();
  $('#dNameLbl').textContent = activeTab==='mini' ? 'Mini package name' : isPkg ? 'Package name' : 'Item name';
  $('#dPriceLbl').textContent = isPkg ? 'Price (₹)' : 'Reference Price (₹)';
  $('#dTitle').textContent = 'Edit ' + (activeTab==='mini' ? 'mini package' : isPkg ? 'package' : 'reference price');
  $('#dSub').textContent = item.name;
  $('#pkgOnlyGroup').style.display = isPkg ? '' : 'none';
  $('#priceOnlyGroup').style.display = isPkg ? 'none' : '';
  syncPkgFieldGroups();
  $('#dName').value = item.name; $('#dName').readOnly = !isPkgShape(); $('#dCode').value = item.code||''; $('#dCodeFld').style.display = isPkgShape() ? '' : 'none'; $('#dPrice').value = item.price;
  if(isPkg){
    dTypeDD.set(item.type); $('#dValidity').value = item.validity;
    segSet('dValidityStartSeg', item.validityStart||'assignment'); segSet('dConsumptionSeg', item.consumptionRule||'completed-session');
    $('#dExclusions').value = item.exclusions; $('#dRenewal').value = item.renewal;
    if(activeTab==='pkg'){
      $('#dDuration').value = item.duration; $('#dDesc').value = item.description;
      $('#svcTbl').innerHTML = renderSvcTbl(item.services);
    } else {
      $('#svcTbl').innerHTML = renderSvcTbl(item.services);
    }
  } else {
    $('#dAppliesTo').value = item.appliesTo; $('#dOverride').value = item.override; $('#dEffective').value = item.effective; $('#dPrevPrice').value = item.prevPrice;
  }
  segSet('dStatusSeg', item.status);
  $('#dMeta').textContent = 'Last updated ' + item.updatedOn;
  $('#dMetaWrap').style.display='block';
  openDrawer();
}
$('#pBody').addEventListener('click', handleEditClick);
$('#pkgGrid').addEventListener('click', handleEditClick);
$('#dClose').addEventListener('click', closeDrawer);
$('#dCancel').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#drawer').classList.contains('show')) closeDrawer(); });

$('#dSave').addEventListener('click', ()=>{
  const name=$('#dName').value.trim();
  if(!name){ toast('Please fill the name'); return; }
  const isPkg = drawerKind!=='price';
  let payload;
  if(isPkg){
    payload = { name, code: $('#dCode').value.trim()||'—', type: $('#dType').value, validity: $('#dValidity').value.trim()||'—',
      validityStart: segGet('dValidityStartSeg'), consumptionRule: segGet('dConsumptionSeg'),
      exclusions: $('#dExclusions').value.trim(), renewal: $('#dRenewal').value.trim(), price: Number($('#dPrice').value)||0,
      status: segGet('dStatusSeg'), updatedOn: TODAY };
    if(drawerKind==='pkg'){
      payload.duration = $('#dDuration').value.trim()||'—';
      payload.description = $('#dDesc').value.trim();
      payload.services = readSvcTbl();
    } else {
      payload.services = readSvcTbl();
    }
  } else {
    payload = { name, appliesTo: $('#dAppliesTo').value.trim()||'—', override: $('#dOverride').value.trim()||'—',
      effective: ($('#dEffective').value.trim().replace(/^—$/,''))||TODAY, prevPrice: $('#dPrevPrice').value.trim()||'—', price: Number($('#dPrice').value)||0,
      status: segGet('dStatusSeg'), updatedOn: TODAY };
  }
  const label = drawerKind==='mini' ? 'Mini package' : isPkg ? 'Package' : 'Service price';
  const wasNew = !editingId;
  if(editingId){
    Object.assign(dataset().find(x=>x.id===editingId), payload);
    toast(label + ' updated');
  } else {
    const prefix = drawerKind==='pkg' ? 'pk-' : drawerKind==='mini' ? 'mini-' : 'pc-';
    const target = drawerKind==='pkg' ? PACKAGES : drawerKind==='mini' ? MINI_PACKAGES : PRICING;
    target.push(Object.assign({id:prefix+Date.now()}, payload));
    toast(label + ' added');
  }
  closeDrawer();
  if(wasNew && drawerKind!==activeTab){ $('#tabSeg [data-t="'+drawerKind+'"]').click(); } // show the new record on its tab
  else { renderStats(); applyFilters(); }
});

renderHead();
renderStats();
applyFilters();

/* context branch-switcher · shared custom dropdown factory */
function makeDropdown(prefix,onPick){
  const rt=$('#'+prefix+'Drop'),btn=$('#'+prefix+'Btn'),lbl=$('#'+prefix+'BtnLbl');
  const searchEl=$('#'+prefix+'Search'),emptyEl=$('#'+prefix+'Empty'),listSel='#'+prefix+'List';
  let value='',rows=[];
  const close=()=>{rt.classList.remove('open');};
  const draw=list=>{
    $(listSel).innerHTML=list.map(r=>
      '<button type="button" class="cdrow'+(r.value===value?' on':'')+'" data-v="'+r.value+'"><span class="cdav">'+(r.av||'')+'</span>'
      +'<div class="cdtx"><b>'+r.title+'</b>'+(r.sub?'<span>'+r.sub+'</span>':'')+'</div>'
      +'<svg class="chk" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>'
    ).join('');
    $$(listSel+' .cdrow').forEach(row=>row.addEventListener('click',()=>{
      const r=rows.find(x=>x.value===row.dataset.v);
      api.select(row.dataset.v,r?r.title:row.dataset.v);
      close();
    }));
    emptyEl.style.display=list.length?'none':'block';
    $(listSel).style.display=list.length?'block':'none';
  };
  const filter=q=>{q=q.trim().toLowerCase();draw(!q?rows:rows.filter(r=>(r.title+' '+(r.sub||'')).toLowerCase().includes(q)));};
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    const open=rt.classList.toggle('open');
    if(open){searchEl.value='';filter('');searchEl.focus();}
  });
  searchEl.addEventListener('input',e=>filter(e.target.value));
  searchEl.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',e=>{if(!rt.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  const api={
    setOptions(list){rows=list;filter(searchEl.value);},
    select(v,label){
      value=v;lbl.textContent=label||v;btn.classList.toggle('has-value',!!v);
      $$(listSel+' .cdrow').forEach(r=>r.classList.toggle('on',r.dataset.v===v));
      if(onPick)onPick(v);
    },
    reset(placeholder){value='';lbl.textContent=placeholder;btn.classList.remove('has-value');$$(listSel+' .cdrow').forEach(r=>r.classList.remove('on'));},
    get value(){return value;}
  };
  return api;
}

/* current-branch context switcher (shared across every admin screen) */
const CTX_BRANCHES = ['Main Campus','OPD Annexe','Madhurawada Branch'];
const ctxBrDD = makeDropdown('ctxBr', v => toast('Switched to ' + v));
ctxBrDD.setOptions(CTX_BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.select('Main Campus','Main Campus');

