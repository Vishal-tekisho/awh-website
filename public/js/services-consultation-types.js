document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
(function(){
'use strict';
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const root=document.documentElement;
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-todo]');
  if(t){e.preventDefault();toast('Opens master · '+t.dataset.todo.replace(/&amp;/g,'&'));}
});
const toast=t=>{const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2300);};
const esc=s=>(s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ---- compact single-select dropdown (.f.fsel/.fselbtn/.fselpanel/.fselopt) · same component
   as doctors-staff.html/rooms-areas.html/user-onboard.html. This file's pre-existing .fdrop
   (filter bar + Status field) stays as-is; .f.fsel is used for the newly-converted form fields. */
function initFsel(wrapId,btnId,panelId,hiddenId,opts,onPick){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  const setVal=(v,silent)=>{
    hidden.value=v;
    const found=opts.find(o=>o[0]===v);
    btn.textContent = found ? found[1] : opts[0][1];
    [...panel.querySelectorAll('.fselopt')].forEach(x=>x.classList.toggle('on', x.dataset.v===v));
    if(!silent && onPick) onPick(v);
  };
  panel.innerHTML = opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+v+'">'+esc(l)+'</button>').join('');
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
  return { set:v=>setVal(v,true), get:()=>hidden.value, setOptions:(o2)=>{ opts=o2; panel.innerHTML = opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+v+'">'+esc(l)+'</button>').join(''); setVal(opts[0][0], true); } };
}
document.addEventListener('click', ()=>$$('.f.fsel').forEach(x=>x.classList.remove('open')));

/* ---- multi-select checklist with search ("multi-select chips") · same .mchk component as
   doctors-staff.html/rooms-areas.html/user-onboard.html ---- */
function initMchk(rootId, btnId, panelId, chipsId, vocab, placeholder, searchable, onChange){
  const root=$('#'+rootId), btn=$('#'+btnId), panel=$('#'+panelId), chipsEl=$('#'+chipsId);
  let selected = [];
  let extraHTML = '', onRerender = null;
  const searchHTML = searchable ? '<input type="text" class="mchk-search" placeholder="Search…" id="'+panelId+'Search">' : '';
  const renderChips = ()=>{
    /* a vocab entry can be a plain label string or {l, s} (two-line: title + muted subline); chips show the title only */
    chipsEl.innerHTML = selected.map(v=>'<span class="mchip">'+esc((vocab[v]&&vocab[v].l)||vocab[v]||v)+'<button type="button" data-rm="'+esc(v)+'">&times;</button></span>').join('');
    btn.textContent = selected.length ? selected.length+' selected' : placeholder;
  };
  const renderPanel = ()=>{
    panel.innerHTML = searchHTML + Object.entries(vocab).map(([v,l])=>
      '<label class="mchk-opt"><input type="checkbox" value="'+esc(v)+'" '+(selected.includes(v)?'checked':'')+'><span>'+((l&&typeof l==='object') ? '<b>'+esc(l.l)+'</b><small>'+esc(l.s)+'</small>' : esc(l))+'</span></label>').join('') + extraHTML;
    if(searchable){
      const searchInput = $('#'+panelId+'Search');
      searchInput.addEventListener('input', e=>{
        const q = e.target.value.trim().toLowerCase();
        $$('#'+panelId+' .mchk-opt').forEach(el=>{ el.style.display = (!q || el.textContent.toLowerCase().includes(q)) ? '' : 'none'; });
      });
      searchInput.addEventListener('click', e=>e.stopPropagation());
    }
    if(onRerender) onRerender();
  };
  renderPanel(); renderChips();
  btn.addEventListener('click', e=>{
    e.stopPropagation();
    const wasOpen = root.classList.contains('open');
    $$('.mchk').forEach(x=>x.classList.remove('open'));
    $$('.f.fsel').forEach(x=>x.classList.remove('open'));
    if(!wasOpen){
      root.classList.add('open');
      if(searchable){
        const searchInput = $('#'+panelId+'Search');
        searchInput.value = '';
        $$('#'+panelId+' .mchk-opt').forEach(el=>el.style.display='');
        searchInput.focus();
      }
    }
  });
  panel.addEventListener('change', e=>{
    const cb=e.target.closest('input[type=checkbox]'); if(!cb) return;
    if(cb.checked){ if(!selected.includes(cb.value)) selected.push(cb.value); }
    else { selected = selected.filter(v=>v!==cb.value); }
    renderChips();
    if(onChange) onChange();
  });
  chipsEl.addEventListener('click', e=>{
    const b=e.target.closest('[data-rm]'); if(!b) return;
    selected = selected.filter(v=>v!==b.dataset.rm);
    renderChips(); renderPanel();
    if(onChange) onChange();
  });
  return {
    set(arr){ selected = Array.isArray(arr) ? arr.slice() : []; renderPanel(); renderChips(); },
    get(){ return selected.slice(); },
    setVocab(v){ vocab = v; renderPanel(); renderChips(); },
    setExtra(html, rerenderFn){ extraHTML = html; onRerender = rerenderFn; renderPanel(); }
  };
}
document.addEventListener('click', ()=>$$('.mchk').forEach(x=>x.classList.remove('open')));

/* =====================================================================
   CONTENT · this is the REAL client file, re-parsed row for row, not a
   mockup sample: OPD_Service_Item.xlsx (5 columns · Sr No, Service Name,
   Service Group, HSN Code, Doctor Name). All 316 rows are here.
   DEPARTMENTS/BRANCHES/DOCTORS mirror doctors-staff.html; the source file
   never had department/branch/duration columns, so those import blank —
   Edit a service to fill them in as part of the pre-migration cleanup
   BRD flags. GROUPS are the file's own 5 groups (Services 276,
   SriKrishna FootClinic 14, 10 DAYS PAKAGES 10, OPD 10, SEERVICE 6),
   not an invented taxonomy. "flagged" marks the 24 rows that sit inside
   the 11 duplicate/typo clusters BRD calls out (DRESSING vs dressing,
   OZONE THERAPY x3, HBOT x2, TFT x2, AIR WALKER vs AIR-WALKER, etc.).
===================================================================== */
const DEPARTMENTS=['Orthotics & Prosthetics','Consulting','ECG','IPD','FOOTRYX Physiotherapy','Nursing','OPD','Pharmacy','Admission','Laboratory','Administration'];
const BRANCHES=['Main Campus','OPD Annexe','Madhurawada Branch'];
/* SPECIALTIES is Admin-configured, not hard-coded · it has no separate master screen elsewhere
   in the app, so its dropdown lets the Admin add a new option inline (same pattern as
   Sub-specialty on doctors-staff.html). Departments/Branches/Doctors/Room Types/Equipment are
   real master data owned elsewhere and stay fixed lists here. CONSULT_TYPES is a small fixed
   clinical list (Initial / Follow-up) · no "add new" row. The form no longer collects Category
   (replaced by Department below) or Tier as a picked list (Tier is a free-text textarea instead) —
   legacy rows keep whatever cat/tier value they imported with, for history only. The old category
   string still backs the read-only "Needs review" data-quality bucket. Tier has no spec-defined
   value list (not in the BRD at all), so there's no Tier filter in the list bar either · only
   Status filters the list, same as the BRD's own field table for this screen. */
const DOCTORS=[
  {n:'Dr. KVNN Santosh Murthy',role:'Duty Doctor'},
  {n:'Dr. Hrishikesh Korada',role:'Physical Medicine & Rehabilitation'},
  {n:'Dr. Harsh Atul',role:'Doctor · no roster yet'},
  {n:'Dr. Raghavendra',role:'Doctor · no roster yet'},
  {n:'Dr. Sameera',role:'Doctor · no roster yet'}
];
/* BRD 12 (Workspace 10) fields table additions · option lists mirror sibling masters the same
   way DEPARTMENTS/BRANCHES already mirror doctors-staff.html:
   ROOM_TYPES = rooms-areas.js's actual FAMILY_OPTS (there are only 3 real room families · General
   Room / Procedure & Treatment Room / Staying Room, that screen has no separate "room type" master
   spanning all three). EQUIPMENT_TYPES = the exact equipment names from equipment-resources.js's
   EQUIPMENT list, not paraphrased ones. */
const CONSULT_TYPES=['Initial','Follow-up'];
let SPECIALTIES=['Wound Care & Debridement','Physical Medicine & Rehabilitation','General / Duty Medicine','Diabetology','Cardiology','Podiatry (FOOTRYX)'];
const ROOM_TYPES=['General Room','Procedure & Treatment Room','Staying Room'];
const EQUIPMENT_TYPES=['Debridement Kit Set A','Wound VAC Unit','Digital Wound Camera','Autoclave Sterilizer','Patient Wheelchair','Dressing Trolley B'];

const SERVICES=[{"n":"Wound Physio","cat":"Physiotherapy & Assessment","dept":"FOOTRYX Physiotherapy","br":"OPD Annexe","dur":30,"hsn":"","docs":["Dr. Hrishikesh Korada"],"status":"active","merged":false,"mergedFrom":null,"sr":3,"srCount":1,"tier":"Advanced","desc":null},{"n":"Foot Scan & Analysis","cat":"Physiotherapy & Assessment","dept":"FOOTRYX Physiotherapy","br":"Main Campus","dur":45,"hsn":"","docs":["Dr. Hrishikesh Korada"],"status":"active","merged":false,"mergedFrom":null,"sr":4,"srCount":1,"tier":"Advanced","desc":"Biothesiometry, Sensory test, Thermal scan, ABI, TBI - Both legs"},{"n":"Gait Analysis","cat":"Physiotherapy & Assessment","dept":"FOOTRYX Physiotherapy","br":"Main Campus","dur":40,"hsn":"","docs":["Dr. Hrishikesh Korada"],"status":"active","merged":false,"mergedFrom":null,"sr":5,"srCount":1,"tier":"Advanced","desc":"Static, Dynamic, Posture, Balance & Stability"},{"n":"PLATELET RICH PLASMA Procedure","cat":"Procedures & Injections","dept":"Consulting","br":"Main Campus","dur":30,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":20,"srCount":1,"tier":null,"desc":null},{"n":"WARM OXYGEN THERAPY","cat":"Advanced Wound Therapies","dept":"Consulting","br":"Main Campus","dur":45,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":21,"srCount":1,"tier":null,"desc":null},{"n":"10 DAYS PACKAGE","cat":"Packages & Bundles","dept":"Consulting","br":"Main Campus","dur":60,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":30,"srCount":1,"tier":null,"desc":"HBOT, MHT, CLEANING AND DRESSING,IV [INTRAVENOUS] Injection Procedure , IV"},{"n":"15 DAYS PACKAGE","cat":"Packages & Bundles","dept":"Consulting","br":"Main Campus","dur":60,"hsn":"15","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":37,"srCount":1,"tier":null,"desc":"HBOT , OZONE,  HYDROGEN MOLICULAR"},{"n":"15-DAYS-PACKAGE","cat":"Packages & Bundles","dept":"Consulting","br":"OPD Annexe","dur":60,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":40,"srCount":1,"tier":null,"desc":"HBOT, MHT, DRESSINGS, PROCEDURE, OZONE THERAPY-10, WOUND-PHYSIO, DIET, PRP-2, FAT GRAFTING-2, COLON THERAPY-2, INFRA SAUNA-2, & ADVANCED LASER THERAPY."},{"n":"21 DAYS","cat":"Packages & Bundles","dept":"Consulting","br":"Main Campus","dur":60,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":47,"srCount":1,"tier":null,"desc":"HBOT,MHT,PCT,OZONE ,C & D"},{"n":"21-Days package :HBOT-21,MHT-21,O3-21,WOUND PHYSIO-21,PRP-2,FAT GRAFTING -2,COLON-1,INFRA -3,C &D-10,DIET CONSULTATION,LAZER ,PROCEDURE","cat":"Packages & Bundles","dept":"Consulting","br":"Main Campus","dur":60,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":true,"mergedFrom":["21-Days package :HBOT-21,MHT-21,O3-21,WOUND PHYSIO-21,PRP-2,FAT GRAFTING -2,COLON-1,INFRA -3,C &D-10,DIET CONSULTATION,LAZER ,PROCEDURE","21-Days package :HBOT-21,MHT-21,O3-21,WOUND PHYSIO-21,PRP-2,FAT GRAFTING -2,COLON-1,INFRA -3,C &D-10,DIET CONSULTATION,LAZER ,PROCEDURE"],"sr":49,"srCount":2,"tier":null,"desc":null},{"n":"PACKAGE","cat":"Packages & Bundles","dept":"Consulting","br":"Main Campus","dur":20,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":69,"srCount":1,"tier":"Advanced","desc":"PRP-1, Fat Grafting-1, Ozone-1, Placenta-1, IV's, IM, Cleaning &Dressing-1, Wound- Basic Physio  & Diet Consultation- 1"},{"n":"LASERS","cat":"Advanced Wound Therapies","dept":"Consulting","br":"Main Campus","dur":30,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":73,"srCount":1,"tier":"Advanced","desc":null},{"n":"PACKAGE","cat":"Packages & Bundles","dept":"Consulting","br":"Main Campus","dur":20,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":83,"srCount":1,"tier":"Basic","desc":"PRP-1, Ozone-1, Placenta-1, IV's, IM, Cleaning & Dressing-1, Wound-UST , & Free- DIET Consultation"},{"n":"Foley Catheter charges","cat":"Procedures & Injections","dept":"Consulting","br":"Main Campus","dur":30,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":142,"srCount":1,"tier":null,"desc":null},{"n":"New Appointment","cat":"Consultations & Appointments","dept":"Consulting","br":"OPD Annexe","dur":20,"hsn":"NEW","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":true,"mergedFrom":["NEW APPOINTMENT","New Appointment","NEW APPOINTMENT..."],"sr":207,"srCount":3,"tier":null,"desc":null},{"n":"OZONE THERAPY","cat":"Advanced Wound Therapies","dept":"Consulting","br":"Main Campus","dur":30,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":true,"mergedFrom":["OZONE  THERAPY","OZONE THERAPY","OZONE THERAPY"],"sr":220,"srCount":3,"tier":null,"desc":null},{"n":"Ozone Therapy","cat":"Advanced Wound Therapies","dept":"Consulting","br":"Main Campus","dur":30,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":229,"srCount":1,"tier":null,"desc":"Dr.KVNN Sir"},{"n":"PACKAGE","cat":"Packages & Bundles","dept":"Consulting","br":"Main Campus","dur":30,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":263,"srCount":1,"tier":"Premium","desc":"Basic procedure -1 ,PRP-1, Fat Grafting-1, Ozone-1, Placenta-1, IV's, IM, C&D -1, Adv wound Physio + Laser ,Diet Consult-1"},{"n":"VIP","cat":"Ward, Room & Admin Charges","dept":"Administration","br":"Main Campus","dur":null,"hsn":"","docs":["Dr. KVNN Santosh Murthy"],"status":"active","merged":false,"mergedFrom":null,"sr":307,"srCount":1,"tier":null,"desc":null},{"n":"PAIN MANAGEMENT","cat":"Advanced Wound Therapies","dept":"Consulting","br":"Main Campus","dur":90,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":6,"srCount":1,"tier":"Advanced","desc":"Manual therapy, Dry needling, Shockwave, Cupping, Ultrasound, IFT/ TENS, Infrared , Strength & Conditioning"},{"n":"PAIN MANAGEMENT","cat":"Advanced Wound Therapies","dept":"Consulting","br":"Main Campus","dur":45,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":10,"srCount":1,"tier":"Basic","desc":"Ultrasound, IFT/TENS, Fascial Release, Strength & Conditioning"},{"n":"Wound Physiotherapy","cat":"Advanced Wound Therapies","dept":"Consulting","br":"OPD Annexe","dur":30,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":11,"srCount":1,"tier":"Basic","desc":"Phonopheresis, Faradic Footbath, Bio-Electric Current, Manual Lymph Drainage, Exercises"},{"n":"2-D-ECHO","cat":"Diagnostics & Lab Tests","dept":"Laboratory","br":"Main Campus","dur":15,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":45,"srCount":1,"tier":null,"desc":null},{"n":"Ana profile","cat":"Diagnostics & Lab Tests","dept":"Laboratory","br":"Main Campus","dur":15,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":78,"srCount":1,"tier":null,"desc":null},{"n":"Ana titer","cat":"Diagnostics & Lab Tests","dept":"Laboratory","br":"Madhurawada Branch","dur":15,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":79,"srCount":1,"tier":null,"desc":null},{"n":"15 DAYS HYDROGEN 8H, OZONE THERAPY, CLEANING & DRESSING","cat":"Packages & Bundles","dept":"Consulting","br":"Main Campus","dur":20,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":2,"srCount":1,"tier":null,"desc":null},{"n":"10 DAYS -HBOT ,MHT,OZONE THERAPY","cat":"Packages & Bundles","dept":"Consulting","br":"Main Campus","dur":60,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":25,"srCount":1,"tier":null,"desc":null},{"n":"10 DAYS -HBOT ,MHT,OZONE THERAPY","cat":"Packages & Bundles","dept":"Consulting","br":"Main Campus","dur":60,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":26,"srCount":1,"tier":null,"desc":"CLEANING AND DRESSING, DR.CONSULATION, PROCEDURE"},{"n":"Skin-Grafting Procedure","cat":"Procedures & Injections","dept":"Consulting","br":"OPD Annexe","dur":60,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":14,"srCount":1,"tier":"Major","desc":null},{"n":"Skin-Grafting Procedure","cat":"Procedures & Injections","dept":"Consulting","br":"Main Campus","dur":60,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":17,"srCount":1,"tier":"Minor","desc":null},{"n":"DEBRIDMENT","cat":"Procedures & Injections","dept":"Consulting","br":"Main Campus","dur":30,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":109,"srCount":1,"tier":null,"desc":null},{"n":"BURNS DRESSING","cat":"Wound Care & Dressing","dept":"Consulting","br":"Main Campus","dur":20,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":7,"srCount":1,"tier":"Basic","desc":null},{"n":"DRESSING","cat":"Wound Care & Dressing","dept":"Consulting","br":"Main Campus","dur":20,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":8,"srCount":1,"tier":"Basic","desc":null},{"n":"DRESSINGS","cat":"Wound Care & Dressing","dept":"Consulting","br":"Main Campus","dur":20,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":72,"srCount":1,"tier":"Advanced","desc":null},{"n":"Gait Analysis","cat":"Physiotherapy & Assessment","dept":"FOOTRYX Physiotherapy","br":"Main Campus","dur":40,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":9,"srCount":1,"tier":"Basic","desc":"Static & Dynamic - Plantar Pressure measurement"},{"n":"WOUND PHYSIO","cat":"Physiotherapy & Assessment","dept":"FOOTRYX Physiotherapy","br":"Main Campus","dur":30,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":19,"srCount":1,"tier":"Basic","desc":null},{"n":"AIR WALKER","cat":"Physiotherapy & Assessment","dept":"FOOTRYX Physiotherapy","br":"OPD Annexe","dur":30,"hsn":"","docs":[],"status":"active","merged":true,"mergedFrom":["AIR WALKER","AIR-WALKER"],"sr":76,"srCount":2,"tier":null,"desc":null},{"n":"CARDIOLOGIST-CONSULTATON","cat":"Consultations & Appointments","dept":"Consulting","br":"Main Campus","dur":20,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":93,"srCount":1,"tier":null,"desc":null},{"n":"Diabetologist consultation","cat":"Consultations & Appointments","dept":"Consulting","br":"Main Campus","dur":20,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":124,"srCount":1,"tier":null,"desc":null},{"n":"DR KVNN CONSULTATION","cat":"Consultations & Appointments","dept":"Consulting","br":"Main Campus","dur":20,"hsn":"","docs":[],"status":"active","merged":false,"mergedFrom":null,"sr":125,"srCount":1,"tier":null,"desc":null}];

/* normalize new BRD-12 fields onto the imported rows · same "import blank, fill in on edit" approach
   this file already uses for dept/branch/duration (see header note above). No existing field touched. */
SERVICES.forEach(s=>{
  if(s.code===undefined) s.code='';
  if(s.consultType===undefined) s.consultType='';
  if(s.specialty===undefined) s.specialty=[];
  if(s.roomTypes===undefined) s.roomTypes=[];
  if(s.equipment===undefined) s.equipment=[];
  if(s.bookable===undefined) s.bookable=true;
  if(s.channelVis===undefined) s.channelVis='visible';
  if(s.sameDay===undefined) s.sameDay=false;
  if(s.refPrice===undefined) s.refPrice=null;
  if(s.included===undefined) s.included=[]; // names of treatments/procedures this service includes
});

/* the imported legacy rows never carried a room-type mapping, so before this every row was
   "Incomplete" · accurate for the ones with 0 doctors mapped, but wrong for these: they already
   have a doctor and active status, they were just missing the one remaining piece. Filling in a
   real room-type mapping (matched to what the service actually is) for these specific already-
   mapped rows lets the Readiness column show its actual "Ready" state too, not only "Incomplete".
   Keyed by sr (unique import serial), not name, since several names repeat across branches. */
const READY_ROOM_MAP={3:['General Room'],4:['General Room'],5:['General Room'],
  20:['Procedure & Treatment Room'],21:['Procedure & Treatment Room'],73:['Procedure & Treatment Room'],
  142:['Procedure & Treatment Room'],207:['General Room'],229:['Procedure & Treatment Room']};
SERVICES.forEach(s=>{ if(READY_ROOM_MAP[s.sr]) s.roomTypes=READY_ROOM_MAP[s.sr]; });

/* TP_ITEMS mirrors the records on treatments-procedures.html (TREATMENTS + PROCEDURES) · real data
   owned by that screen (the doctor adds them there), so this picker is a fixed list with no "add
   new" row. A service is separate from them but may include one or more of them. */
const TP_ITEMS=[
  {n:'Diabetic Foot Ulcer Management Program', kind:'Treatment', code:'TRT-101'},
  {n:'Compression Therapy Program', kind:'Treatment', code:'TRT-102'},
  {n:'Negative Pressure Wound Therapy (NPWT) Course', kind:'Treatment', code:'TRT-103'},
  {n:'Post-Surgical Wound Care Program', kind:'Treatment', code:'TRT-104'},
  {n:'Sharp Debridement', kind:'Procedure', code:'PRC-201'},
  {n:'Wound VAC Application', kind:'Procedure', code:'PRC-202'},
  {n:'Skin Graft Dressing Change', kind:'Procedure', code:'PRC-203'},
  {n:'Suture Removal', kind:'Procedure', code:'PRC-204'}
];
/* the few imported services whose name is literally one of those records get linked; keyed by sr */
const INCLUDED_MAP={14:['Skin Graft Dressing Change'],17:['Skin Graft Dressing Change'],109:['Sharp Debridement'],
  30:['Diabetic Foot Ulcer Management Program'],37:['Diabetic Foot Ulcer Management Program'],11:['Compression Therapy Program']};
SERVICES.forEach(s=>{ if(INCLUDED_MAP[s.sr]) s.included=INCLUDED_MAP[s.sr]; });

let filter='all', query='', editingIndex=-1, activeDrawerIndex=-1, page=1;
/* the list only shows services for whichever branch the header context switcher (ctxBrDD,
   defined outside this IIFE below) is currently on · same branch the "Add service" form
   defaults new records to. Kept in sync via window.__svcSetBranch, called from ctxBrDD's onPick. */
let branchFilter='Main Campus';
const PAGE_SIZE=10;
let formSpecialty=[], formProviders=[], formRoomTypes=[], formEquipment=[], formIncluded=[];

/* readiness · BRD 12 "Show a Readiness indicator" (doc lines 1393-1402) */
function computeReadiness(docs,roomTypes,bookable,status){
  const reasons=[];
  if(!docs||docs.length===0) reasons.push('No eligible provider mapped');
  if(!roomTypes||roomTypes.length===0) reasons.push('No active room mapping');
  if(bookable===false) reasons.push('Not marked Bookable');
  if(status&&status!=='active') reasons.push('Status is '+(status==='draft'?'Draft':'Inactive'));
  return {ready:reasons.length===0, reasons};
}
/* which specific requirement is the FIRST (highest-priority) blocker · same order
   computeReadiness() itself checks in, so this always points at the thing actually blocking it.
   Kept distinct from the TAB it lives on (below) because Provider and Room are two different
   requirements that share one merged tab · this still tells the caller which picker to open. */
function readinessFixReason(reasons){
  if(reasons.some(r=>r.indexOf('provider')>=0)) return 'provider';
  if(reasons.some(r=>r.indexOf('room mapping')>=0)) return 'room';
  if(reasons.some(r=>r.indexOf('Bookable')>=0)) return 'visibility';
  if(reasons.some(r=>r.indexOf('Status')>=0)) return 'basic';
  return null;
}
/* the form has 4 tabs now (Basic / Eligibility & Resources / Booking Visibility / Dependencies) —
   Provider Eligibility and Room & Resource got merged into one "Eligibility & Resources" tab, so
   both those reasons resolve to the same tab id even though they're different requirements. */
const REASON_TAB={provider:'eligibility', room:'eligibility', visibility:'visibility', basic:'basic'};
function readinessFixTab(reasons){
  const reason=readinessFixReason(reasons);
  return reason?REASON_TAB[reason]:'dependencies';
}

/* ---------- filter dropdowns (custom, not native <select> · so they can be styled) ---------- */
function initFilterDrop(dropId,btnId,panelId,options,allLabel,onPick){
  const root=$('#'+dropId), btn=$('#'+btnId), panel=$('#'+panelId);
  const render=()=>{
    panel.innerHTML='<button type="button" class="fdropopt on" data-v="">'+allLabel+'</button>'
      +options.map(o=>'<button type="button" class="fdropopt" data-v="'+o+'">'+o+'</button>').join('');
  };
  render();
  panel.addEventListener('click',e=>{
    const b=e.target.closest('.fdropopt'); if(!b) return;
    $$('#'+panelId+' .fdropopt').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');
    btn.textContent=b.dataset.v||allLabel;
    root.classList.remove('open');
    onPick(b.dataset.v);
  });
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    const wasOpen=root.classList.contains('open');
    $$('.fdrop').forEach(x=>x.classList.remove('open'));
    if(!wasOpen) root.classList.add('open');
  });
  return {
    get:()=>{ const on=panel.querySelector('.fdropopt.on'); return on?on.dataset.v:''; },
    set(v){
      $$('#'+panelId+' .fdropopt').forEach(x=>x.classList.toggle('on',x.dataset.v===(v||'')));
      btn.textContent=v||allLabel;
    },
    setOptions(o2){ options=o2; render(); this.set(''); }
  };
}
document.addEventListener('click',()=>$$('.fdrop').forEach(x=>x.classList.remove('open')));
document.addEventListener('keydown',e=>{if(e.key==='Escape') $$('.fdrop').forEach(x=>x.classList.remove('open'));});
const STATUS_FILTERS=['Active','Draft','Inactive','Bookable','Missing mapping','Needs review'];
const STATUS_FILTER_KEY={Active:'active',Draft:'draft',Inactive:'inactive',Bookable:'bookable','Missing mapping':'missing','Needs review':'review'};
initFilterDrop('statusDrop','statusDropBtn','statusDropPanel',STATUS_FILTERS,'All statuses',v=>{filter=v?STATUS_FILTER_KEY[v]:'all';page=1;renderList();});

/* Consultation type is a fixed, small clinical list (Initial / Follow-up only) · no "add new"
   row here. */
const consultTypeDD=initFsel('consultTypeWrap','consultTypeBtn','consultTypePanel','fConsultType', [['','Not applicable'], ...CONSULT_TYPES.map(c=>[c,c])]);

/* Department (Basic tab, required) · real master data owned by Departments & Units, so no "add
   new" row here (same judgment as doctors-staff.html's Department field). */
const deptDD=initFsel('deptWrap','deptBtn','deptPanel','fDept', [['','Select department…'], ...DEPARTMENTS.map(d=>[d,d])]);
/* Branch is read-only in this form (.robranch) · set from whichever branch the page's header
   switcher (ctxBrDD) is currently on when adding, or from the record's own branch when editing.
   Same pattern as doctors-staff.html's Branch field. */
function setFBranch(v){ $('#fBrFixedLabel').textContent=v||'Not set'; $('#fBr').value=v||''; }

const channelVisDD=initFsel('channelVisWrap','channelVisBtn','channelVisPanel','fChannelVis', [['visible','Visible'],['staff','Staff-only']]);

/* Eligible specialty (admin-configurable, no master screen elsewhere) / Eligible providers
   (real Doctors & Staff data, no add-row) / Required room type & equipment (real Rooms & Care
   Areas / Resources & Equipment data, no add-row) · searchable .mchk multi-selects. */
const specMchk=initMchk('specMchk','specBtn','specPanel','specChips', Object.fromEntries(SPECIALTIES.map(v=>[v,v])), 'Select eligible specialties…', true, ()=>{formSpecialty=specMchk.get();});
function appendAddSpecRow(){
  const rowHTML='<div class="fseladdrow"><input type="text" placeholder="Add a new specialty…" id="specNewInput">'
    +'<button type="button" id="specAddBtn" title="Add specialty"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div>';
  const bind=()=>{
    const input=$('#specNewInput'), addBtn=$('#specAddBtn');
    if(!input||!addBtn) return;
    const commit=()=>{
      const label=input.value.trim(); if(!label) return;
      if(!SPECIALTIES.some(v=>v.toLowerCase()===label.toLowerCase())) SPECIALTIES.push(label);
      specMchk.setVocab(Object.fromEntries(SPECIALTIES.map(v=>[v,v])));
      toast('"'+label+'" added to specialties');
    };
    addBtn.addEventListener('click',e=>{e.stopPropagation();commit();});
    input.addEventListener('click',e=>e.stopPropagation());
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}});
  };
  specMchk.setExtra(rowHTML,bind);
}
appendAddSpecRow();
const provMchk=initMchk('provMchk','provBtn','provPanel','provChips', Object.fromEntries(DOCTORS.map(d=>[d.n,d.n])), 'Select eligible providers…', true, ()=>{formProviders=provMchk.get();renderReadiness();});
const roomMchk=initMchk('roomMchk','roomBtn','roomPanel','roomChips', Object.fromEntries(ROOM_TYPES.map(v=>[v,v])), 'Select required room types…', true, ()=>{formRoomTypes=roomMchk.get();renderReadiness();});
const equipMchk=initMchk('equipMchk','equipBtn','equipPanel','equipChips', Object.fromEntries(EQUIPMENT_TYPES.map(v=>[v,v])), 'Select required equipment…', true, ()=>{formEquipment=equipMchk.get();renderReadiness();});
const inclMchk=initMchk('inclMchk','inclBtn','inclPanel','inclChips', Object.fromEntries(TP_ITEMS.map(t=>[t.n,{l:t.n, s:t.kind+' · '+t.code}])), 'Select treatments or procedures…', true, ()=>{formIncluded=inclMchk.get();});

/* Status field in the Add/Edit drawer · same .mseg segmented-button component used everywhere
   else in the app (doctors-staff.html, clinic-branch.html, treatments-procedures.html, etc.),
   not the filter-bar's .fdrop. */
function setFStatus(v){
  $('#fStatus').value=v;
  $$('#fStatusSeg button').forEach(x=>x.classList.toggle('on',x.dataset.v===v));
}
/* Deactivating (Status -> Inactive) is guarded by a dependency review when doctors are still
   mapped to this service, same shape as doctors-staff.js's hasStaffDeps/showStaffImpactModal —
   the field's own hint promises "deactivating preserves history", so this makes that a real,
   checked gate instead of just a claim. Reactivating/Draft never needs the guardrail. */
function hasSvcDeps(){ return formProviders.length>0; }
function svcDepRowsHtml(){
  return '<div class="deprow"><span>Eligible providers mapped</span><b'+(formProviders.length===0?' class="zero"':'')+'>'+formProviders.length+'</b></div>'
    +'<div class="deprow"><span>Currently bookable</span><b>'+(formProviders.length>0&&$('#fBookable').checked?'Yes':'No')+'</b></div>';
}
let impactSvcPending=false;
function showSvcImpactModal(){
  impactSvcPending=true;
  $('#iTitle').textContent='Deactivate '+($('#fName').value.trim()||'this service')+'?';
  $('#iBody').innerHTML='<p class="dep-intro">Deactivating this service affects:</p>'+svcDepRowsHtml();
  $('#iFootHint').innerHTML='<b>Past bookings keep their history.</b> Doctors mapped to this service stop taking new bookings for it. Unmap or reassign them first if that is not intended.';
  $('#iScrim').classList.add('show');
}
function closeSvcImpactModal(){ $('#iScrim').classList.remove('show'); impactSvcPending=false; }
$('#iCancel').addEventListener('click',()=>{ if(impactSvcPending) closeSvcImpactModal(); });
$('#iContinue').addEventListener('click',()=>{
  if(!impactSvcPending) return;
  setFStatus('inactive');
  $('#fStatus').dispatchEvent(new Event('change'));
  closeSvcImpactModal();
});
$('#iScrim').addEventListener('click',e=>{ if(e.target.id==='iScrim'&&impactSvcPending) closeSvcImpactModal(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&impactSvcPending) closeSvcImpactModal(); });
$('#fStatusSeg').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  const newStatus=b.dataset.v, prevStatus=$('#fStatus').value;
  if(newStatus==='inactive'&&prevStatus!=='inactive'&&hasSvcDeps()){
    showSvcImpactModal();
    return;
  }
  setFStatus(newStatus);
  $('#fStatus').dispatchEvent(new Event('change'));
});
setFStatus('draft');

/* ---------- stats ---------- */
function svcStats(){
  const inBranch=SERVICES.filter(s=>!s.br||s.br===branchFilter);
  const mapped=inBranch.filter(s=>s.docs.length>0).length;
  const missing=inBranch.length-mapped;
  const inactive=inBranch.filter(s=>s.status==='inactive').length;
  const draft=inBranch.filter(s=>s.status==='draft').length;
  const rows=[
    ['Total (this set)',inBranch.length,'--info-soft','--info'],
    ['Doctor mapped',mapped,'--success-soft','--success'],
    ['Missing mapping',missing,'--danger-soft','--danger'],
    ['Draft',draft,'--warning-soft','--warning'],
    ['Inactive',inactive,'--surface-3','--ink-2']
  ];
  $('#svcStats').innerHTML=rows.map(([label,val,bg,fg])=>
    '<div class="pill" style="--pc:var('+fg+')"><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></i><b>'+val+'</b> '+label+'</div>'
  ).join('');
}

/* ---------- list ---------- */
function svcRows(){
  return SERVICES.map((s,i)=>{
    let ok = !s.br || s.br===branchFilter;
    if(ok&&filter==='active') ok=s.status==='active';
    else if(ok&&filter==='draft') ok=s.status==='draft';
    else if(ok&&filter==='inactive') ok=s.status==='inactive';
    else if(ok&&filter==='bookable') ok=s.docs.length>0&&s.bookable!==false;
    else if(ok&&filter==='missing') ok=s.docs.length===0;
    else if(ok&&filter==='review') ok=s.cat==='Needs review';
    if(ok&&query) ok=(s.n+' '+s.cat+' '+s.dept).toLowerCase().includes(query.toLowerCase());
    return ok?i:-1;
  }).filter(i=>i>=0);
}
function renderList(){
  const allIdxs=svcRows();
  const inBranchTotal=SERVICES.filter(s=>!s.br||s.br===branchFilter).length;
  $('#sSub').textContent=allIdxs.length+' of '+inBranchTotal+' shown';
  const start=(page-1)*PAGE_SIZE;
  const idxs=allIdxs.slice(start,start+PAGE_SIZE);
  renderPager(allIdxs.length);
  $('#sRows').innerHTML=idxs.map(i=>{
    const s=SERVICES[i];
    const zero=s.docs.length===0;
    const stLabel=s.status==='draft'?'Draft':s.status==='inactive'?'Inactive':'Active';
    const stCls=s.status==='draft'?'warn':s.status==='active'?'ok':'neutral';
    /* Readiness · same computeReadiness() used in the profile drawer and the form's Dependencies
       tab (BRD 12 "Show a Readiness indicator"), now surfaced in the list too so Admin can spot
       an unbookable service without opening every row. */
    const rd=computeReadiness(s.docs,s.roomTypes,s.bookable,s.status);
    return '<div class="svrow'+(s.cat==='Needs review'?' flagged':'')+'" data-i="'+i+'">'
      +'<div class="svnm"><b>'+s.n+'</b><span>'+(s.included&&s.included.length?s.included.length+' included · ':'')+(s.tier?s.tier+' · ':'')+(s.merged?'Merged from '+s.srCount+' rows · ':'')+stLabel+'</span></div>'
      +'<div class="dcol"><b>'+(s.dept||'Not set')+'</b><span>'+(s.br||'Not set')+'</span></div>'
      +'<span class="num">'+(s.dur?s.dur+' min':'—')+'</span>'
      +'<div class="svccell'+(zero?' zero':'')+'"><b>'+(zero?'0 doctors':s.docs.length+' doctor'+(s.docs.length>1?'s':''))+'</b><span>'+(zero?'cannot be booked':s.docs.join(', '))+'</span></div>'
      +'<span class="rdcell" title="'+(rd.ready?'Ready for booking':rd.reasons.join('; ')+' · click to fix')+'"><span class="chip '+(rd.ready?'ok':'bad')+'">'+(rd.ready?'Ready':'Incomplete')+'</span></span>'
      +'<span><span class="chip '+stCls+'">'+stLabel+'</span></span>'
      +'<span><button type="button" class="mini" data-edit-row="'+i+'">Edit</button></span>'
      +'</div>';
  }).join('')||'<div style="padding:32px;text-align:center;color:var(--ink-muted);font-size:13px">No services match this filter.</div>';
  svcStats();
}
function renderPager(total){
  const pages=Math.max(1,Math.ceil(total/PAGE_SIZE));
  if(page>pages) page=pages;
  let btns='';
  for(let p=1;p<=pages;p++) btns+='<button class="pgbtn'+(p===page?' on':'')+'" data-p="'+p+'">'+p+'</button>';
  $('#pager').innerHTML = pages<=1 ? '' :
    '<button class="pgbtn nav" data-p="prev"'+(page===1?' disabled':'')+'>‹ Prev</button>'+btns+'<button class="pgbtn nav" data-p="next"'+(page===pages?' disabled':'')+'>Next ›</button>';
  $$('#pager .pgbtn').forEach(b=>b.addEventListener('click',()=>{
    if(b.disabled) return;
    if(b.dataset.p==='prev') page--; else if(b.dataset.p==='next') page++; else page=+b.dataset.p;
    renderList();
  }));
}
$('#q').addEventListener('input',e=>{query=e.target.value;page=1;renderList();});
$('#sRows').addEventListener('click',e=>{
  const row=e.target.closest('.svrow');
  if(!row) return;
  const i=+row.dataset.i;
  /* Edit button · same quick-edit affordance every other table-based list in the app has, jumps
     straight to the edit form (Basic tab) instead of the read-only profile view. */
  if(e.target.closest('[data-edit-row]')){
    e.stopPropagation();
    openForm(i);
    return;
  }
  /* clicking the "Incomplete" readiness chip jumps straight to the tab that actually fixes it
     (Eligibility & Resources / Booking Visibility / Basic · whichever the highest-priority reason
     needs), and for a multi-select field opens its picker panel too so the exact option to map is
     one click away, not another hunt-and-click. A "Ready" chip has nothing to fix, so it falls
     through to the normal row click (profile view). */
  if(e.target.closest('.rdcell .chip.bad')){
    e.stopPropagation(); // otherwise this same click keeps bubbling to document's "close all
    // .mchk panels on any click" listener and shuts the picker we're about to open below
    const s=SERVICES[i];
    const rd=computeReadiness(s.docs,s.roomTypes,s.bookable,s.status);
    const reason=readinessFixReason(rd.reasons);
    openForm(i);
    $('#formTabs .dtab[data-tab="'+(reason?REASON_TAB[reason]:'dependencies')+'"]').click();
    if(reason==='provider') $('#provBtn').click();
    else if(reason==='room') $('#roomBtn').click();
    return;
  }
  openProfile(i);
});

/* ---------- profile drawer (with doctor mapping) ---------- */
const closeDrawer=()=>{$('#drawer').classList.remove('show');$('#scrim2').classList.remove('show');};
$('#scrim2').addEventListener('click',()=>{closeDrawer();closeForm();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();closeForm();}});

function svcIni(n){return n.split('—')[0].trim().split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();}

function openProfile(i){
  activeDrawerIndex=i;
  const s=SERVICES[i];
  const unmapped=DOCTORS.filter(d=>!s.docs.includes(d.n));
  const stLabel=s.status==='draft'?'Draft':s.status==='inactive'?'Inactive':'Active';
  const stCls=s.status==='draft'?'warn':s.status==='active'?'ok':'neutral';
  const rd=computeReadiness(s.docs,s.roomTypes,s.bookable,s.status);
  $('#drawer').innerHTML=
    '<div class="dh"><div><h3>Service Profile</h3><p>Sr #'+s.sr+'</p></div>'
    +'<button class="close-btn" data-close><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'<div class="db">'
    +'<div class="phero"><span class="pav">'+svcIni(s.n)+'</span><div style="min-width:0;flex:1"><b>'+s.n+'</b><span>'+(s.dur?s.dur+' min · ':'')+(s.br||s.dept||'')+'</span></div>'
    +'<span class="chip '+stCls+'">'+stLabel+'</span></div>'
    +'<div class="dsec"><div class="t">Booking readiness</div>'
    +'<div class="swrap" style="justify-content:flex-start;gap:10px"><span class="chip '+(rd.ready?'ok':'bad')+'">'+(rd.ready?'Ready for Booking':'Incomplete')+'</span></div>'
    +(rd.ready?'':'<div class="hint">'+rd.reasons.map(x=>'• '+x).join('<br>')+'</div>')
    +'</div>'
    +'<div class="dsec"><div class="t">Details</div><div class="kv">'
    +'<div class="k"><span>Department</span><b style="font-size:12px">'+(s.dept||'Not set')+'</b></div>'
    +'<div class="k"><span>Branch</span><b style="font-size:12px">'+(s.br||'Not set')+'</b></div>'
    +'<div class="k"><span>Duration</span><b>'+(s.dur?s.dur+' min':'Not set')+'</b></div>'
    +'<div class="k"><span>Tier</span><b style="font-size:12px">'+(s.tier||'Not set')+'</b></div>'
    +'<div class="k wide"><span>Included treatments &amp; procedures</span><b style="font-size:12px;font-weight:500">'+((s.included&&s.included.length)?s.included.join(', '):'None')+'</b></div>'
    +'<div class="k"><span>Service code</span><b>'+(s.code||'Not set')+'</b></div>'
    +'<div class="k"><span>Consultation type</span><b>'+(s.consultType||'Not applicable')+'</b></div>'
    +(s.refPrice?'<div class="k"><span>Reference price</span><b>₹'+s.refPrice+'</b></div>':'')
    +(s.hsn?'<div class="k wide"><span>HSN code</span><b>'+s.hsn+'</b></div>':'')
    +(s.desc?'<div class="k wide"><span>Description</span><b style="font-size:12px;font-weight:500;line-height:1.5">'+s.desc+'</b></div>':'')
    +'</div></div>'
    +(s.specialty&&s.specialty.length?'<div class="dsec"><div class="t">Eligible specialty</div><div class="kv"><div class="k wide"><span>Specialties this service is eligible for</span><b style="font-size:12px">'+s.specialty.join(', ')+'</b></div></div></div>':'')
    +((s.roomTypes&&s.roomTypes.length)||(s.equipment&&s.equipment.length)?'<div class="dsec"><div class="t">Room &amp; resource requirements</div><div class="kv">'
      +(s.roomTypes&&s.roomTypes.length?'<div class="k wide"><span>Required room type</span><b style="font-size:12px">'+s.roomTypes.join(', ')+'</b></div>':'')
      +(s.equipment&&s.equipment.length?'<div class="k wide"><span>Required equipment</span><b style="font-size:12px">'+s.equipment.join(', ')+'</b></div>':'')
      +'</div></div>':'')
    +'<div class="dsec"><div class="t">Booking visibility</div><div class="kv">'
    +'<div class="k"><span>Bookable</span><b>'+(s.bookable===false?'No':'Yes')+'</b></div>'
    +'<div class="k"><span>Channel visibility</span><b>'+(s.channelVis==='staff'?'Staff-only':'Visible')+'</b></div>'
    +'<div class="k wide"><span>Same-day booking</span><b>'+(s.sameDay?'Allowed':'Not allowed')+'</b></div>'
    +'</div></div>'
    +(s.merged?'<div class="dsec"><div class="t">Cleanup · merged on import</div><div class="kv"><div class="k wide"><span>Replaces '+s.srCount+' near-duplicate rows from the source file</span><b style="font-size:12.5px;font-weight:500;line-height:1.5">'+s.mergedFrom.join(' · ')+'</b></div></div></div>':'')
    +(s.cat==='Needs review'?'<div class="dsec"><div class="t">Data quality</div><div class="kv"><div class="k wide"><span>Name too generic to auto-categorize</span><b style="font-size:12.5px;font-weight:500;line-height:1.5">The source row\'s name ("'+s.n+'") doesn\'t say enough to place it. Pick a category by hand once you know what it actually was.</b></div></div></div>':'')
    +'<div class="dsec"><div class="t">Which doctor can perform this service</div>'
    +'<div class="dchips" id="dchips">'+(s.docs.length?s.docs.map(n=>'<span class="dchip" data-n="'+n+'">'+n+'<button type="button" data-unmap="'+n+'">✕</button></span>').join(''):'<span class="dchip empty">No doctor mapped (cannot be booked on any channel)</span>')+'</div>'
    +(unmapped.length?'<div class="maprow"><select class="inp" id="mapPick">'+unmapped.map(d=>'<option value="'+d.n+'">'+d.n+' · '+d.role+'</option>').join('')+'</select><button class="btn btn-primary btn-sm" id="mapAdd">+ Add doctor</button></div>'
      :'<div class="hint">All doctors in the directory are already mapped to this service.</div>')
    +'</div>'
    +'</div>'
    +'<div class="df"><button class="btn btn-primary" data-ed>Edit service</button></div>';
  $('#drawer').querySelector('[data-close]').addEventListener('click',closeDrawer);
  $('#drawer').querySelector('[data-ed]').addEventListener('click',()=>{closeDrawer();openForm(i);});
  const mapAdd=$('#drawer').querySelector('#mapAdd');
  if(mapAdd) mapAdd.addEventListener('click',()=>{
    const pick=$('#drawer').querySelector('#mapPick').value;
    s.docs.push(pick);
    toast(pick+' mapped to '+s.n+', now bookable');
    renderList();openProfile(i);
  });
  $$('#drawer [data-unmap]').forEach(b=>b.addEventListener('click',()=>{
    const n=b.dataset.unmap;
    s.docs=s.docs.filter(x=>x!==n);
    toast(n+' unmapped from '+s.n);
    renderList();openProfile(i);
  }));
  $('#drawer').classList.add('show');$('#scrim2').classList.add('show');
}

/* ---------- add/edit form drawer ----------
   deptDD/consultTypeDD/channelVisDD (single-select) and specMchk/provMchk/roomMchk/equipMchk
   (multi-select) already bind their own clicks · see their initFsel/initMchk setup above. Tier
   (fTier) is a free-text textarea now, not a dropdown. Branch is read-only · see setFBranch(). */

/* tabs · Basic / Eligibility & Resources / Booking Visibility / Dependencies */
$('#formTabs').addEventListener('click',e=>{
  const b=e.target.closest('.dtab'); if(!b) return;
  $$('#formTabs .dtab').forEach(x=>x.classList.toggle('on',x===b));
  $$('#formDrawer .tabpanel').forEach(p=>p.classList.toggle('on',p.id==='panel-'+b.dataset.tab));
  if(b.dataset.tab==='dependencies') renderReadiness();
});

function renderReadiness(){
  const r=computeReadiness(formProviders,formRoomTypes,$('#fBookable').checked,$('#fStatus').value);
  $('#depReadyChip').className='chip '+(r.ready?'ok':'bad');
  $('#depReadyChip').textContent=r.ready?'Ready for Booking':'Incomplete';
  /* each reason is its own CTA · clicking it jumps straight to the tab that fixes THAT reason,
     not just the first one, since a service can be missing more than one thing at once. */
  $('#depReadyReasons').innerHTML=r.ready?'':r.reasons.map(x=>
    '<button type="button" class="depfix" data-tab="'+readinessFixTab([x])+'">'+x+'<b>Fix →</b></button>'
  ).join('');
  $('#depProvCount').textContent=formProviders.length;
  $('#depRoomCount').textContent=formRoomTypes.length;
  $('#depEquipCount').textContent=formEquipment.length;
  $('#depBookableTxt').textContent=$('#fBookable').checked?'Yes':'No';
}
/* Dependencies tab CTAs · a reason button or a "Depends on" card both jump to the tab that owns
   the fix (same readinessFixTab mapping the list page's Incomplete chip uses). */
$('#panel-dependencies').addEventListener('click',e=>{
  const fixBtn=e.target.closest('.depfix');
  if(fixBtn){ $('#formTabs .dtab[data-tab="'+fixBtn.dataset.tab+'"]').click(); return; }
  const card=e.target.closest('#depKv .k[data-tab]');
  if(card){ $('#formTabs .dtab[data-tab="'+card.dataset.tab+'"]').click(); }
});

function validateForm(){
  const ok=$('#fName').value.trim().length>2;
  $('#formSave').disabled=!ok;
}
['fName','fDur'].forEach(id=>$('#'+id).addEventListener('input',validateForm));
$('#fBookable').addEventListener('change',e=>{$('#bookableTxt').textContent=e.target.checked?'Bookable':'Not bookable';renderReadiness();});
$('#fSameDay').addEventListener('change',e=>{$('#sameDayTxt').textContent=e.target.checked?'On':'Off';});
$('#fStatus').addEventListener('change',renderReadiness);

function openForm(index){
  editingIndex=typeof index==='number'?index:-1;
  const s=editingIndex>=0?SERVICES[editingIndex]:null;
  $('#fName').value=s?s.n:'';
  $('#fCode').value=s?s.code:'';
  consultTypeDD.set(s&&s.consultType?s.consultType:'');
  $('#fTier').value=s&&s.tier?s.tier:'';
  deptDD.set(s&&s.dept?s.dept:'');
  /* editing keeps the record's own branch as-is (or "Not set" if it has none · some legacy rows
     are intentionally visible under every branch; locking the field must not silently reassign
     one just because it was opened+saved while a different branch happened to be active in the
     header). A brand-new record defaults to whichever branch the header is currently on. */
  setFBranch(s?(s.br||''):(branchFilter||BRANCHES[0]));
  $('#fDur').value=s&&s.dur?s.dur:'';
  $('#fDesc').value=s&&s.desc?s.desc:'';
  $('#fPrice').value=s&&s.refPrice?s.refPrice:'';
  setFStatus(s?s.status:'draft');
  $('#fBookable').checked=s?s.bookable!==false:true;
  $('#bookableTxt').textContent=$('#fBookable').checked?'Bookable':'Not bookable';
  channelVisDD.set(s&&s.channelVis?s.channelVis:'visible');
  $('#fSameDay').checked=s?!!s.sameDay:false;
  $('#sameDayTxt').textContent=$('#fSameDay').checked?'On':'Off';
  formSpecialty=s&&s.specialty?s.specialty.slice():[];
  formProviders=s&&s.docs?s.docs.slice():[];
  formRoomTypes=s&&s.roomTypes?s.roomTypes.slice():[];
  formEquipment=s&&s.equipment?s.equipment.slice():[];
  formIncluded=s&&s.included?s.included.slice():[];
  specMchk.set(formSpecialty);
  provMchk.set(formProviders);
  roomMchk.set(formRoomTypes);
  equipMchk.set(formEquipment);
  inclMchk.set(formIncluded);
  $('#formTabs .dtab[data-tab="basic"]').click();
  renderReadiness();
  $('#formTitle').textContent=s?'Edit service':'Add service';
  $('#formSub').textContent=s?('Update details for '+s.n):'Define the service or consultation type.';
  $('#formSave').textContent=s?'Save changes':'Save';
  validateForm();
  $('#formDrawer').classList.add('show');$('#scrim2').classList.add('show');
}
const closeForm=()=>{$('#formDrawer').classList.remove('show');$('#scrim2').classList.remove('show');};
$('#addBtn').addEventListener('click',()=>openForm());
$('#formClose').addEventListener('click',closeForm);
$('#formCancel').addEventListener('click',closeForm);
$('#formSave').addEventListener('click',()=>{
  const durVal=$('#fDur').value.trim();
  const priceVal=$('#fPrice').value.trim();
  const rec={
    n:$('#fName').value.trim(), code:$('#fCode').value.trim(), consultType:consultTypeDD.get(),
    tier:$('#fTier').value.trim()||null,
    dept:deptDD.get(), br:$('#fBr').value, dur:durVal?+durVal:null, desc:$('#fDesc').value.trim()||null,
    refPrice:priceVal?+priceVal:null,
    specialty:formSpecialty.slice(), docs:formProviders.slice(), roomTypes:formRoomTypes.slice(), equipment:formEquipment.slice(), included:formIncluded.slice(),
    bookable:$('#fBookable').checked, channelVis:channelVisDD.get(), sameDay:$('#fSameDay').checked,
    status:$('#fStatus').value
  };
  if(editingIndex>=0){
    const s=SERVICES[editingIndex];
    Object.assign(s,rec,{flagged:s.flagged,sr:s.sr});
    toast(s.n+' updated');
  }else{
    rec.flagged=false;rec.sr=null;
    SERVICES.push(rec);
    toast(rec.n+' added'+(rec.docs.length?', '+rec.docs.length+' doctor(s) mapped':'; map a doctor next so it can be booked'));
  }
  renderList();
  closeForm();
});

/* ---------- init ---------- */
renderList();
/* called from ctxBrDD's onPick below (outside this IIFE) whenever the header branch context
   changes, so the list only ever shows services for the branch currently in view. */
window.__svcSetBranch=v=>{ branchFilter=v; page=1; renderList(); };
})();

/* context branch-switcher · shared custom dropdown factory (outside the IIFE above, so it needs its own $/$$/toast) */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toast=t=>{const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('show'),2300);};
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
const ctxBrDD = makeDropdown('ctxBr', v => { toast('Switched to ' + v); window.__svcSetBranch(v); });
ctxBrDD.setOptions(CTX_BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.select('Main Campus','Main Campus');

