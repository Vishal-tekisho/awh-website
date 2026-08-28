document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

/* ---------- shared vocab ---------- */
const STATUS = { active:{n:'Active',cls:'on'}, blocked:{n:'Blocked',cls:'warn'}, inactive:{n:'Inactive',cls:''} };
const BRANCHES = ['Main Campus','OPD Annexe','Madhurawada Branch'];
const DEPARTMENTS = ['OPD','Wound Care','Diabetic Foot','Dermatology','General Surgery','Plastic Surgery','ENT','Physiotherapy','Nursing','Short Stay','Administration'];
const ROOM_TYPES = { consultation:'Consultation', office:'Office', waiting:'Waiting', counselling:'Counselling / Review', review:'Review', utility:'Utility', toilet:'Toilet' };
let ROOM_CAPS = { dressing:'Dressing', debridement:'Debridement', bedside:'Bedside Procedure', longduration:'Long-duration Treatment', review:'Review' };
/* Required Staff combines what used to be 3 separate fields (a free-text "Doctor/Staff Capability"
   note, a Doctor-Capability multi-select, and a single Nurse-Capability dropdown) into one picker
   of actual named staff · same combined doctor+staff roster used on the Departments screen. */
const STAFF_OPTIONS = [
  {n:'Dr. Meera Nair',   role:'Doctor'},
  {n:'Dr. Sanjay Gupta', role:'Doctor'},
  {n:'Dr. Arjun Rao',    role:'Doctor'},
  {n:'Dr. Farah Khan',   role:'Doctor'},
  {n:'Dr. Kavitha Iyer', role:'Doctor'},
  {n:'Swati Menon',      role:'Staff Nurse'},
  {n:'Divya Prakash',    role:'Staff Nurse'},
  {n:'Priya Nair',       role:'Receptionist'},
  {n:'Nandini Rao',      role:'Front Desk Executive'},
  {n:'Rohit Shetty',     role:'Pharmacist'},
  {n:'Ayesha Khan',      role:'Records Officer'},
  {n:'Kiran Bose',       role:'Lab Technician'}
];
const STAFF_VOCAB = Object.fromEntries(STAFF_OPTIONS.map(s=>[s.n, s.n+' · '+s.role]));
/* mirrors the real equipment roster from equipment-resources.html (same ids: eq-1..eq-6) · this
   picker must only ever offer equipment that actually exists on that screen, not made-up tags. */
const EQUIP_TAGS = { 'eq-1':'Debridement Kit Set A', 'eq-2':'Wound VAC Unit', 'eq-3':'Digital Wound Camera', 'eq-4':'Autoclave Sterilizer', 'eq-5':'Patient Wheelchair', 'eq-6':'Dressing Trolley B' };
const CONSENT_TAGS = { procedure:'Procedure Consent', photo:'Photography / Documentation Consent', anesthesia:'Sedation / Anaesthesia Consent', general:'General Treatment Consent' };
const STAY_TYPES = { daycare:'Day-care', observation:'Observation', shortstay:'Short Stay' };

/* A. General Rooms · reusable, low-configuration rooms (doc §A) */
const ROOMS = [
 {id:'rm-c1', name:'Consultation Room 1', code:'AWH-MC-CR-01', branch:'Main Campus', department:'OPD', roomType:'consultation', capacity:0, multipurpose:true, schedulable:true, services:'General consultation, follow-up review', status:'active', deps:{doctorSessions:6, futureBookings:42, recurringPrograms:0}, updatedOn:'02 June 2024'},
 {id:'rm-c2', name:'Consultation Room 2', code:'AWH-MC-CR-02', branch:'Main Campus', department:'OPD', roomType:'consultation', capacity:0, multipurpose:true, schedulable:true, services:'General consultation', status:'active', deps:{doctorSessions:4, futureBookings:28, recurringPrograms:0}, updatedOn:'02 June 2024'},
 {id:'rm-rec', name:'Recovery Bay', code:'AWH-MC-RB-01', branch:'Main Campus', department:'General Surgery', roomType:'waiting', capacity:0, multipurpose:true, schedulable:false, services:'Post-procedure recovery', status:'blocked', deps:{doctorSessions:0, futureBookings:0, recurringPrograms:0}, updatedOn:'14 August 2026'},
 {id:'rm-cs', name:'Counselling Room', code:'AWH-MC-CS-01', branch:'Main Campus', department:'Wound Care', roomType:'counselling', capacity:0, multipurpose:false, schedulable:true, services:'Patient/family counselling', status:'active', deps:{doctorSessions:2, futureBookings:9, recurringPrograms:0}, updatedOn:'02 June 2024'},
 {id:'rm-store', name:'Utility & Sterile Store', code:'AWH-MC-UT-01', branch:'Main Campus', department:'Administration', roomType:'utility', capacity:0, multipurpose:false, schedulable:false, services:'—', status:'inactive', deps:{doctorSessions:0, futureBookings:0, recurringPrograms:0}, updatedOn:'01 June 2024'}
];

/* B. Procedure / Treatment Rooms · first-class room records, each standalone (doc §B).
   Consolidated from the previously-fragmented ROOMS (rm-p1/rm-p2/rm-p3/rm-d1/rm-d2) and
   AREAS (ar-1..ar-4) records · see rooms-areas consolidation notes for the merge mapping. */
const PROC_ROOMS = [
 {id:'pr-1', name:'Procedure Room 1', altName:'Wound Debridement Bay', code:'AWH-MC-PR-01', branch:'Main Campus', department:'General Surgery', roomCapability:['debridement','bedside'], maxConcurrent:1,
  requiredStaff:['Dr. Farah Khan','Swati Menon'], equipTags:['eq-1','eq-6'],
  prep:10, buffer:15, recoveryBuffer:15, cleaningBuffer:10, consentReq:true, consentTags:['procedure'], schedulable:true, blockFrom:'', blockTo:'', status:'active',
  deps:{doctorSessions:8, futureBookings:21, recurringPrograms:1}, updatedOn:'20 July 2026'},
 {id:'pr-2', name:'Procedure Room 2', altName:'', code:'AWH-MC-PR-02', branch:'Main Campus', department:'General Surgery', roomCapability:['debridement','bedside','longduration'], maxConcurrent:1,
  requiredStaff:['Dr. Farah Khan','Dr. Meera Nair','Swati Menon'], equipTags:['eq-1','eq-6'],
  prep:10, buffer:15, recoveryBuffer:15, cleaningBuffer:10, consentReq:true, consentTags:['procedure'], schedulable:true, blockFrom:'', blockTo:'', status:'active',
  deps:{doctorSessions:8, futureBookings:17, recurringPrograms:1}, updatedOn:'05 June 2024'},
 {id:'pr-3', name:'Procedure Room 3', altName:'', code:'AWH-MC-PR-03', branch:'OPD Annexe', department:'General Surgery', roomCapability:['debridement','bedside'], maxConcurrent:1,
  requiredStaff:['Dr. Farah Khan','Swati Menon'], equipTags:['eq-1','eq-6'],
  prep:10, buffer:15, recoveryBuffer:15, cleaningBuffer:10, consentReq:true, consentTags:['procedure'], schedulable:true, blockFrom:'', blockTo:'', status:'active', deps:{doctorSessions:3, futureBookings:6, recurringPrograms:0}, updatedOn:'05 June 2024'},
 {id:'pr-4', name:'Dressing Room 1', altName:'Dressing Change Station A', code:'AWH-MC-DR-01', branch:'Main Campus', department:'Wound Care', roomCapability:['dressing'], maxConcurrent:1,
  requiredStaff:['Swati Menon'], equipTags:['eq-6'],
  prep:5, buffer:10, recoveryBuffer:5, cleaningBuffer:10, consentReq:false, consentTags:[], schedulable:true, blockFrom:'', blockTo:'', status:'active', deps:{doctorSessions:5, futureBookings:34, recurringPrograms:2}, updatedOn:'20 July 2026'},
 {id:'pr-5', name:'Dressing Room 2', altName:'Dressing Change Station B', code:'AWH-MC-DR-02', branch:'Main Campus', department:'Wound Care', roomCapability:['dressing'], maxConcurrent:1,
  requiredStaff:['Divya Prakash'], equipTags:['eq-6'],
  prep:5, buffer:10, recoveryBuffer:5, cleaningBuffer:10, consentReq:false, consentTags:[], schedulable:true, blockFrom:'', blockTo:'', status:'active', deps:{doctorSessions:5, futureBookings:29, recurringPrograms:2}, updatedOn:'20 July 2026'},
 {id:'pr-6', name:'Progress Photography Station', altName:'', code:'AWH-MC-PH-01', branch:'Main Campus', department:'Wound Care', roomCapability:['review'], maxConcurrent:1,
  requiredStaff:[], equipTags:['eq-3'],
  prep:2, buffer:5, recoveryBuffer:2, cleaningBuffer:5, consentReq:true, consentTags:['photo'], schedulable:true, blockFrom:'', blockTo:'', status:'active', deps:{doctorSessions:1, futureBookings:12, recurringPrograms:0}, updatedOn:'01 August 2026'}
];

const STAY_ROOMS = [
 {id:'sr-1', name:'Short Stay Room 1', code:'AWH-MC-SS-01', branch:'Main Campus', department:'Short Stay', stayTypes:['daycare','observation'], beds:2, bedLabels:['Bed A','Bed B'], status:'active', notes:'Adjoining nurse station, oxygen point available', deps:{doctorSessions:0, futureBookings:3, recurringPrograms:0}, updatedOn:'01 August 2026'},
 {id:'sr-2', name:'Short Stay Room 2', code:'AWH-MC-SS-02', branch:'Main Campus', department:'Short Stay', stayTypes:['shortstay'], beds:1, bedLabels:['Bed A'], status:'active', notes:'Used for extended post-procedure monitoring', deps:{doctorSessions:0, futureBookings:1, recurringPrograms:0}, updatedOn:'01 August 2026'},
 {id:'sr-3', name:'Day-care Bay 1', code:'AWH-OA-SS-01', branch:'OPD Annexe', department:'Short Stay', stayTypes:['daycare'], beds:3, bedLabels:['Bed A','Bed B','Bed C'], status:'blocked', notes:'Under housekeeping · reopening next week', deps:{doctorSessions:0, futureBookings:0, recurringPrograms:0}, updatedOn:'12 August 2026'}
];

let activeTab = 'rooms';
/* the list only shows rooms for whichever branch the header context switcher (ctxBrDD below)
   is currently on · same branch new records default to. */
let branchFilter = 'Main Campus';
let drawerFamily = 'rooms'; // which room family the Add/Edit drawer is currently configured for · independent of activeTab

/* ---------- custom dropdown ---------- */
function initFsel(wrapId,btnId,panelId,hiddenId,opts,onPick){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  const setVal=(v,silent)=>{
    hidden.value=v;
    const found=opts.find(o=>o[0]===v);
    btn.textContent = found ? found[1] : opts[0][1];
    $$('.fselopt',panel).forEach(x=>x.classList.toggle('on', x.dataset.v===v));
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

const statOpts = [['','All statuses'],['active','Active'],['blocked','Blocked'],['inactive','Inactive']];
const statDD = initFsel('statWrap','statBtn','statPanel','fStat', statOpts, applyFilters);
const typeDD = initFsel('typeWrap','typeBtn','typePanel','fType', [['','All types'], ...Object.entries(ROOM_TYPES)], applyFilters);
const capDD = initFsel('capWrap','capBtn','capPanel','fCap', [['','All capabilities'], ...Object.entries(ROOM_CAPS)], applyFilters);
const deptDD = initFsel('deptWrap','deptBtn','deptPanel','fDept', [['','All departments'], ...DEPARTMENTS.map(d=>[d,d])], applyFilters);
const schedDD = initFsel('schedWrap','schedBtn','schedPanel','fSched', [['','All'],['yes','Schedulable'],['no','Not schedulable']], applyFilters);

/* populate selects used in drawer */
const FAMILY_OPTS = [['rooms','General Room'],['procedure','Procedure & Treatment Room'],['stay','Staying Room']];
const dFamilyDD = initFsel('dFamilySelWrap','dFamilyBtn','dFamilyPanel','dFamily', FAMILY_OPTS, fam=>{
  drawerFamily = fam;
  setupDrawerForFamily(fam);
});
const dRoomTypeDD = initFsel('dRoomTypeWrap','dRoomTypeBtn','dRoomTypePanel','dRoomType', Object.entries(ROOM_TYPES));
/* Room Type is Admin-configured, not hard-coded · the dropdown itself lets the Admin add a new
   type inline (same pattern as Equipment's Category dropdown), syncing both this drawer field and
   the page-level filter dropdown so a newly-added type is immediately usable and filterable. */
function appendAddRoomTypeRow(){
  const panel = $('#dRoomTypePanel');
  const row = document.createElement('div');
  row.className = 'fseladdrow';
  row.innerHTML = '<input type="text" placeholder="Add a new room type…" id="dRoomTypeNewInput">'
    + '<button type="button" id="dRoomTypeAddBtn" title="Add room type"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>';
  panel.appendChild(row);
  const input = $('#dRoomTypeNewInput');
  const commit = () => {
    const label = input.value.trim();
    if(!label) return;
    const existing = Object.entries(ROOM_TYPES).find(([,l])=>l.toLowerCase()===label.toLowerCase());
    let key = existing ? existing[0] : label.toLowerCase().replace(/[^a-z0-9]+/g,'') || 'type';
    if(!existing){
      while(ROOM_TYPES[key]) key += 'x';
      ROOM_TYPES[key] = label;
    }
    dRoomTypeDD.setOptions(Object.entries(ROOM_TYPES));
    appendAddRoomTypeRow();
    dRoomTypeDD.set(key);
    const curFilter = typeDD.get();
    typeDD.setOptions([['','All types'], ...Object.entries(ROOM_TYPES)]);
    typeDD.set(curFilter);
    toast('"'+label+'" added to room types');
  };
  $('#dRoomTypeAddBtn').addEventListener('click', e=>{ e.stopPropagation(); commit(); });
  input.addEventListener('click', e=>e.stopPropagation());
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(); } });
}
appendAddRoomTypeRow();
/* Branch is read-only in this form · set from whichever branch the page's header switcher
   (ctxBrDD) is currently on when adding, or from the record's own branch when editing. */
function setDBranch(v){ $('#dBranchFixedLabel').textContent = v; $('#dBranch').value = v; }
const dDeptDD = initFsel('dDeptWrap','dDeptBtn','dDeptPanel','dDept', DEPARTMENTS.map(d=>[d,d]));

/* ---------- multi-select checklist ("multi-select chips") ---------- */
function initMchk(rootId, btnId, panelId, chipsId, vocab, placeholder, searchable){
  const root=$('#'+rootId), btn=$('#'+btnId), panel=$('#'+panelId), chipsEl=$('#'+chipsId);
  let selected = [];
  let extraHTML = '', onRerender = null; // optional "add a new option" row + its listener re-binder,
                                          // re-applied after every panel rebuild (setVocab/set both rebuild)
  const renderChips = ()=>{
    chipsEl.innerHTML = selected.map(v=>'<span class="mchip">'+esc(vocab[v]||v)+'<button type="button" data-rm="'+v+'">&times;</button></span>').join('');
    btn.textContent = selected.length ? selected.length+' selected' : placeholder;
  };
  const searchHTML = searchable ? '<input type="text" class="mchk-search" placeholder="Search…" id="'+panelId+'Search">' : '';
  const renderPanel = ()=>{
    panel.innerHTML = searchHTML + Object.entries(vocab).map(([v,l])=>
      '<label class="mchk-opt"><input type="checkbox" value="'+v+'" '+(selected.includes(v)?'checked':'')+'><span>'+esc(l)+'</span></label>').join('') + extraHTML;
    if(searchable){
      const searchInput = $('#'+panelId+'Search');
      // filters by hiding (not removing) non-matching rows, so already-ticked checkboxes
      // outside the current search text still count when the panel closes / form saves
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
  });
  chipsEl.addEventListener('click', e=>{
    const b=e.target.closest('[data-rm]'); if(!b) return;
    selected = selected.filter(v=>v!==b.dataset.rm);
    renderChips(); renderPanel();
  });
  return {
    set(arr){ selected = Array.isArray(arr) ? arr.slice() : []; renderPanel(); renderChips(); },
    get(){ return selected.slice(); },
    setVocab(v){ vocab = v; renderPanel(); renderChips(); },
    setExtra(html, rerenderFn){ extraHTML = html; onRerender = rerenderFn; renderPanel(); }
  };
}
document.addEventListener('click', ()=>$$('.mchk').forEach(x=>x.classList.remove('open')));

const dRoomCapMchk = initMchk('dRoomCapMchk','dRoomCapBtn','dRoomCapPanel','dRoomCapChips', ROOM_CAPS, 'Select capabilities…');
/* Room Capability is Admin-configured, not hard-coded · the panel itself lets the Admin add a new
   capability inline (same pattern as Equipment's Category dropdown). */
(function setupRoomCapAddRow(){
  const rowHTML = '<div class="fseladdrow"><input type="text" placeholder="Add a new capability…" id="dRoomCapNewInput">'
    + '<button type="button" id="dRoomCapAddBtn" title="Add capability"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div>';
  const bind = () => {
    const input = $('#dRoomCapNewInput'), addBtn = $('#dRoomCapAddBtn');
    if(!input || !addBtn) return;
    const commit = () => {
      const label = input.value.trim();
      if(!label) return;
      const existing = Object.entries(ROOM_CAPS).find(([,l])=>l.toLowerCase()===label.toLowerCase());
      let key = existing ? existing[0] : label.toLowerCase().replace(/[^a-z0-9]+/g,'') || 'cap';
      if(!existing){ while(ROOM_CAPS[key]) key += 'x'; ROOM_CAPS[key] = label; }
      dRoomCapMchk.setVocab(ROOM_CAPS);
      toast('"'+label+'" added to room capabilities');
    };
    addBtn.addEventListener('click', e=>{ e.stopPropagation(); commit(); });
    input.addEventListener('click', e=>e.stopPropagation());
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(); } });
  };
  dRoomCapMchk.setExtra(rowHTML, bind);
})();
const dReqStaffMchk = initMchk('dReqStaffMchk','dReqStaffBtn','dReqStaffPanel','dReqStaffChips', STAFF_VOCAB, 'Select required staff…', true);
const dEquipMchk = initMchk('dEquipMchk','dEquipBtn','dEquipPanel','dEquipChips', EQUIP_TAGS, 'Select equipment / resources…', true);
const dConsentMchk = initMchk('dConsentMchk','dConsentBtn','dConsentPanel','dConsentChips', CONSENT_TAGS, 'Select consent requirement…');
/* "Which consent form(s)" only makes sense once "Consent required before use" is on · otherwise it sat there
   permanently visible looking like an unrelated second question, when it's really a detail of the toggle above it */
function syncConsentUI(){
  const on = $('#dConsentReq').checked;
  $('#consentTagsFgrp').style.display = on ? '' : 'none';
  if(!on) dConsentMchk.set([]);
}
$('#dConsentReq').addEventListener('change', syncConsentUI);
const dStayTypesMchk = initMchk('dStayTypesMchk','dStayTypesBtn','dStayTypesPanel','dStayTypesChips', STAY_TYPES, 'Select stay types…');

/* ---------- repeatable field: Bed Labels ---------- */
let bedLabels = [];
function renderBedLabels(){
  $('#dBedLabels').innerHTML = bedLabels.map((v,i)=>
    '<div class="reprow"><input class="fld" data-bed-idx="'+i+'" value="'+esc(v)+'" placeholder="e.g. Bed A"><button type="button" class="repx" data-bed-rm="'+i+'" title="Remove bed label"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
  ).join('');
}
$('#dBedLabels').addEventListener('input', e=>{
  const inp=e.target.closest('[data-bed-idx]'); if(!inp) return;
  bedLabels[+inp.dataset.bedIdx] = inp.value;
});
$('#dBedLabels').addEventListener('click', e=>{
  const b=e.target.closest('[data-bed-rm]'); if(!b) return;
  bedLabels.splice(+b.dataset.bedRm,1);
  renderBedLabels();
});
$('#dAddBedLabel').addEventListener('click', ()=>{
  const nextLetter = String.fromCharCode(65 + bedLabels.length);
  bedLabels.push('Bed ' + nextLetter);
  renderBedLabels();
});

/* ---------- tab switching ---------- */
const TAB_LABEL = { rooms:'room', procedure:'procedure room', stay:'staying room' };
function switchTab(t){
  activeTab = t;
  $$('#tabSeg button').forEach(x=>x.classList.toggle('on', x.dataset.t===t));
  $('#typeWrap').style.display = activeTab==='rooms' ? '' : 'none';
  $('#capWrap').style.display = activeTab==='procedure' ? '' : 'none';
  $('#schedWrap').style.display = activeTab==='stay' ? 'none' : '';
  $('#rSearch').value=''; statDD.set(''); deptDD.set(''); schedDD.set(''); typeDD.set(''); capDD.set('');
  renderHead();
  applyFilters();
  renderStats();
}
$('#tabSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  switchTab(b.dataset.t);
});

function renderHead(){
  $('#tblHead').innerHTML = activeTab==='rooms'
    ? '<tr><th>Room</th><th>Code</th><th>Department</th><th>Type</th><th>Capacity</th><th>Used for / Services</th><th>Status</th><th>Schedulable</th><th style="text-align:right">Actions</th></tr>'
    : activeTab==='procedure'
    ? '<tr><th>Room</th><th>Code</th><th>Department</th><th>Room Capability</th><th>Max Concurrent</th><th>Consent</th><th>Status</th><th>Schedulable</th><th style="text-align:right">Actions</th></tr>'
    : '<tr><th>Room</th><th>Code</th><th>Department</th><th>Beds</th><th>Stay Types</th><th>Status</th><th style="text-align:right">Actions</th></tr>';
}

/* ---------- render ---------- */
function datasetFor(fam){ return fam==='rooms' ? ROOMS : fam==='procedure' ? PROC_ROOMS : STAY_ROOMS; }
function dataset(){ return datasetFor(activeTab).filter(e=>!e.branch||e.branch===branchFilter); }
function schedChip(v){ return v ? '<span class="dot-y">● Yes</span>' : '<span class="dot-n">— No</span>'; }

function renderRow(e){
  if(activeTab==='rooms'){
    const st = STATUS[e.status];
    return `<tr>
      <td><b>${esc(e.name)}</b></td>
      <td><span class="s">${esc(e.code||'—')}</span></td>
      <td><span class="s">${esc(e.department||'—')}</span></td>
      <td><span class="s">${ROOM_TYPES[e.roomType]||'—'}</span></td>
      <td><span class="s">${e.capacity||'—'}</span></td>
      <td><span class="s">${esc(e.services)}</span></td>
      <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
      <td>${schedChip(e.schedulable)}</td>
      <td style="text-align:right"><span style="display:inline-flex;gap:6px;align-items:center"><button class="mini" data-edit="${e.id}">Edit</button><button class="kebab-btn" data-kebab="${e.id}" title="More actions" aria-label="More actions">&#8942;</button></span></td>
    </tr>`;
  }
  if(activeTab==='procedure'){
    const st = STATUS[e.status||'active'];
    const capTags = (e.roomCapability||[]).map(v=>ROOM_CAPS[v]||v).join(', ') || '—';
    return `<tr>
      <td><b>${esc(e.name)}</b>${e.altName ? '<span class="s">'+esc(e.altName)+'</span>' : ''}</td>
      <td><span class="s">${esc(e.code||'—')}</span></td>
      <td><span class="s">${esc(e.department||'—')}</span></td>
      <td><span class="s">${esc(capTags)}</span></td>
      <td><span class="s">${e.maxConcurrent||'—'}</span></td>
      <td>${e.consentReq ? '<span class="chip pur">Required</span>' : '<span class="s">—</span>'}</td>
      <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
      <td>${schedChip(e.schedulable)}</td>
      <td style="text-align:right"><span style="display:inline-flex;gap:6px;align-items:center"><button class="mini" data-edit="${e.id}">Edit</button><button class="kebab-btn" data-kebab="${e.id}" title="More actions" aria-label="More actions">&#8942;</button></span></td>
    </tr>`;
  }
  const st = STATUS[e.status];
  return `<tr>
    <td><b>${esc(e.name)}</b></td>
    <td><span class="s">${esc(e.code||'—')}</span></td>
    <td><span class="s">${esc(e.department||'—')}</span></td>
    <td><span class="s">${e.beds||0} (${(e.bedLabels||[]).map(esc).join(', ')||'—'})</span></td>
    <td><span class="s">${(e.stayTypes||[]).map(v=>STAY_TYPES[v]||v).join(', ')||'—'}</span></td>
    <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td style="text-align:right"><span style="display:inline-flex;gap:6px;align-items:center"><button class="mini" data-edit="${e.id}">Edit</button><button class="kebab-btn" data-kebab="${e.id}" title="More actions" aria-label="More actions">&#8942;</button></span></td>
  </tr>`;
}
function renderStats(){
  const list = dataset();
  $('#stTotalLbl').textContent = 'Total ' + (activeTab==='rooms'?'rooms':activeTab==='procedure'?'procedure/treatment rooms':'staying rooms');
  $('#stTotal').textContent = list.length;
  if(activeTab==='procedure'){
    $('#stActiveLbl').textContent = 'Consent required'; $('#stBlockedLbl').textContent = 'No consent needed';
    $('#stActive').textContent = list.filter(e=>e.consentReq).length;
    $('#stBlocked').textContent = list.filter(e=>!e.consentReq).length;
  } else {
    $('#stActiveLbl').textContent = 'Active'; $('#stBlockedLbl').textContent = 'Blocked';
    $('#stActive').textContent = list.filter(e=>e.status==='active').length;
    $('#stBlocked').textContent = list.filter(e=>e.status==='blocked').length;
  }
}
function applyFilters(){
  const q = $('#rSearch').value.trim().toLowerCase();
  const type = activeTab==='rooms' ? typeDD.get() : '';
  const cap = activeTab==='procedure' ? capDD.get() : '';
  const stat = statDD.get(), dept = deptDD.get(), sched = schedDD.get();
  const list = dataset().filter(e =>
    (!q || e.name.toLowerCase().includes(q)) &&
    (!type || e.roomType===type) &&
    (!cap || (e.roomCapability||[]).includes(cap)) &&
    (!stat || (e.status||'active')===stat) &&
    (!dept || e.department===dept) &&
    (activeTab==='stay' || !sched || (e.schedulable?'yes':'no')===sched)
  );
  renderList(list);
}
function renderList(list){
  closeRowMenu();
  const full = dataset();
  const noun = activeTab==='rooms' ? 'rooms' : activeTab==='procedure' ? 'procedure/treatment rooms' : 'staying rooms';
  const body = $('#rBody');
  $('#rEmptyTxt').textContent = 'No ' + noun + ' match these filters';
  if(!list.length){
    body.innerHTML=''; $('#rEmpty').style.display='block';
    $('#rFoot').textContent = `Showing 0 of ${full.length} ${noun}`;
    return;
  }
  $('#rEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#rFoot').textContent = `Showing ${list.length} of ${full.length} ${noun}`;
}
$('#rSearch').addEventListener('input', applyFilters);

/* ---------- drawer ---------- */
let editingId = null;
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId, v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b ? b.dataset.v : null; }
$('#dStatusSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dStatusSeg', b.dataset.v); });

function showGroupForFamily(fam){
  $('#roomOnlyGroup').style.display = fam==='rooms' ? '' : 'none';
  $('#procOnlyGroup').style.display = fam==='procedure' ? '' : 'none';
  $('#stayOnlyGroup').style.display = fam==='stay' ? '' : 'none';
  $('#dDeptLbl').textContent = fam==='rooms' ? 'Department / Unit' : 'Department';
}

function resetFamilyFields(fam){
  if(fam==='rooms'){
    $('#dCapacity').value='';
    dRoomTypeDD.set('consultation');
    $('#dRoomSchedulable').checked = true; $('#dMultipurpose').checked = false;
  } else if(fam==='procedure'){
    $('#dAltName').value='';
    dRoomCapMchk.set([]); $('#dMaxConcurrent').value='';
    dReqStaffMchk.set([]);
    dEquipMchk.set([]);
    $('#dPrep').value=''; $('#dBuffer').value=''; $('#dRecoveryBuffer').value=''; $('#dCleaningBuffer').value='';
    $('#dConsentReq').checked = false; dConsentMchk.set([]); syncConsentUI();
    $('#dAreaSchedulable').checked = true; $('#dBlockFrom').value=''; $('#dBlockTo').value='';
  } else {
    dStayTypesMchk.set([]); $('#dBedCount').value='';
    bedLabels = []; renderBedLabels();
    $('#dStayNotes').value='';
  }
}

/* shared by: opening "Add room" fresh, and switching the Room Family dropdown mid-add */
function setupDrawerForFamily(fam){
  $('#dNameLbl').textContent = fam==='stay' ? 'Room Name / Number' : 'Room name';
  $('#dTitle').textContent = 'Add room';
  $('#dSub').textContent = fam==='rooms' ? 'Define a new room' : fam==='procedure' ? 'Define a new procedure/treatment room' : 'Define a new staying room';
  showGroupForFamily(fam);
  dDeptDD.set(fam==='stay' ? 'Short Stay' : DEPARTMENTS[0]);
  resetFamilyFields(fam);
}

$('#newBtn').addEventListener('click', ()=>{
  editingId = null;
  drawerFamily = activeTab; // pre-fill with whichever tab you were looking at · change it anytime via the dropdown
  $('#dFamilyWrap').style.display = '';
  dFamilyDD.set(drawerFamily);
  $('#dName').value=''; $('#dCode').value='';
  setDBranch(ctxBrDD.value || BRANCHES[0]);
  setupDrawerForFamily(drawerFamily);
  segSet('dStatusSeg','active');
  $('#dMetaWrap').style.display='none';
  openDrawer();
});
/* shared by: the row "Edit" button, and the kebab menu's Map Equipment
   (which are just Edit, optionally focused on the relevant field · see doc §Row Actions) */
function openEditDrawer(item, focusFieldId){
  editingId = item.id;
  drawerFamily = activeTab; // editing never changes a room's family, so the picker is hidden below
  $('#dFamilyWrap').style.display = 'none';
  $('#dNameLbl').textContent = activeTab==='stay' ? 'Room Name / Number' : 'Room name';
  $('#dTitle').textContent = 'Edit ' + TAB_LABEL[activeTab];
  $('#dSub').textContent = item.name;
  showGroupForFamily(activeTab);
  $('#dName').value = item.name;
  $('#dCode').value = item.code || '';
  setDBranch(item.branch || BRANCHES[0]);
  dDeptDD.set(item.department || DEPARTMENTS[0]);

  if(activeTab==='rooms'){
    dRoomTypeDD.set(item.roomType || 'consultation');
    $('#dCapacity').value = item.capacity;
    $('#dRoomSchedulable').checked = !!item.schedulable; $('#dMultipurpose').checked = !!item.multipurpose;
  } else if(activeTab==='procedure'){
    $('#dAltName').value = item.altName || '';
    dRoomCapMchk.set(item.roomCapability); $('#dMaxConcurrent').value = item.maxConcurrent || '';
    dReqStaffMchk.set(item.requiredStaff || []);
    dEquipMchk.set(item.equipTags);
    $('#dPrep').value = item.prep; $('#dBuffer').value = item.buffer;
    $('#dRecoveryBuffer').value = item.recoveryBuffer || ''; $('#dCleaningBuffer').value = item.cleaningBuffer || '';
    $('#dConsentReq').checked = item.consentReq; dConsentMchk.set(item.consentTags); syncConsentUI();
    $('#dAreaSchedulable').checked = !!item.schedulable; $('#dBlockFrom').value = item.blockFrom || ''; $('#dBlockTo').value = item.blockTo || '';
  } else {
    dStayTypesMchk.set(item.stayTypes); $('#dBedCount').value = item.beds || '';
    bedLabels = (item.bedLabels || []).slice(); renderBedLabels();
    $('#dStayNotes').value = item.notes || '';
  }
  segSet('dStatusSeg', item.status || 'active');
  $('#dMeta').textContent = 'Last updated ' + item.updatedOn;
  $('#dMetaWrap').style.display='block';
  openDrawer();
  if(focusFieldId){
    const f = $('#'+focusFieldId);
    if(f) setTimeout(()=>{ f.scrollIntoView({block:'center', behavior:'smooth'}); f.focus({preventScroll:true}); }, 320); // after the .3s drawer slide-in
  }
}
$('#rBody').addEventListener('click', e=>{
  const b=e.target.closest('[data-edit]'); if(!b) return;
  const item = dataset().find(x=>x.id===b.dataset.edit); if(!item) return;
  openEditDrawer(item);
});
$('#dClose').addEventListener('click', closeDrawer);
$('#dCancel').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#drawer').classList.contains('show')) closeDrawer(); });

/* ---------- deactivation impact / dependency review ---------- */
function hasActiveDeps(deps){
  return !!deps && (deps.doctorSessions>0 || deps.futureBookings>0 || deps.recurringPrograms>0);
}
function depsRowsHtml(deps){
  const row = (label, v) => '<div class="deprow"><span>'+label+'</span><b'+(v===0?' class="zero"':'')+'>'+v+'</b></div>';
  return row('Doctor / staff sessions', deps.doctorSessions)
    + row('Future bookings', deps.futureBookings)
    + row('Recurring programs', deps.recurringPrograms);
}
function showImpactModal(item){
  $('#iTitle').textContent = item.name + ' cannot be deactivated yet';
  $('#iBody').innerHTML = '<p class="dep-intro">It is still used by:</p>' + depsRowsHtml(item.deps);
  $('#iFootHint').innerHTML = '<b>Resolve these first.</b> Move or cancel the sessions using this room, then deactivate it.';
  $('#iScrim').classList.add('show');
}
function closeImpactModal(){ $('#iScrim').classList.remove('show'); }
$('#iCancel').addEventListener('click', closeImpactModal);
$('#iViewSessions').addEventListener('click', ()=>{ closeImpactModal(); toast('Opening affected sessions… (preview)'); });
$('#iScrim').addEventListener('click', e=>{ if(e.target.id==='iScrim') closeImpactModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#iScrim').classList.contains('show')) closeImpactModal(); });

/* ---------- view dependencies (read-only · NOT a deactivation guardrail) ---------- */
function showDepsModal(item){
  $('#depsTitle').textContent = 'Dependencies for ' + item.name;
  $('#depsBody').innerHTML = item.deps ? depsRowsHtml(item.deps) : 'No current dependencies.';
  $('#depsScrim').classList.add('show');
}
function closeDepsModal(){ $('#depsScrim').classList.remove('show'); }
$('#depsClose').addEventListener('click', closeDepsModal);
$('#depsScrim').addEventListener('click', e=>{ if(e.target.id==='depsScrim') closeDepsModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#depsScrim').classList.contains('show')) closeDepsModal(); });

/* ---------- row actions overflow ("kebab") menu ---------- */
let rowMenuCtx = null; // {fam, id} of the row the open menu belongs to
function closeRowMenu(){ $('#rowMenu').classList.remove('show'); rowMenuCtx = null; }
function buildRowMenu(fam, item){
  const st = item.status || 'active';
  const items = [{action:'duplicate', label:'Duplicate Room'}];
  items.push(st!=='blocked' ? {action:'block', label:'Block Temporarily'} : {action:'unblock', label:'Unblock'});
  if(fam==='procedure') items.push({action:'mapEquipment', label:'Map Equipment'});
  if(st!=='inactive') items.push({action:'deactivate', label:'Deactivate', danger:true});
  items.push({action:'viewDeps', label:'View Dependencies'});
  return items;
}
function openRowMenu(btn, fam, id){
  const item = datasetFor(fam).find(x=>x.id===id); if(!item) return;
  rowMenuCtx = {fam, id};
  const menu = $('#rowMenu');
  menu.innerHTML = buildRowMenu(fam, item).map(it=>
    '<button type="button" data-action="'+it.action+'"'+(it.danger?' class="danger"':'')+'>'+esc(it.label)+'</button>').join('');
  menu.classList.add('show'); // must show before measuring so offsetWidth/Height aren't 0
  const r = btn.getBoundingClientRect();
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  let left = r.right - mw; if(left < 8) left = 8;
  let top = r.bottom + 6; if(top + mh > window.innerHeight - 8) top = r.top - mh - 6;
  menu.style.left = left + 'px'; menu.style.top = top + 'px';
}
function duplicateRoom(fam, item){
  const clone = JSON.parse(JSON.stringify(item));
  delete clone.deps; // brand-new room · nothing scheduled against it yet
  clone.id = (fam==='rooms'?'rm-':fam==='procedure'?'pr-':'sr-') + Date.now();
  clone.name = item.name + ' · copy';
  clone.code = ''; // distinct/blank code · admin assigns the real one via Edit
  clone.status = 'active'; // safe, non-blocking default
  clone.updatedOn = TODAY;
  datasetFor(fam).push(clone);
  renderStats(); applyFilters();
  toast(clone.name + ' created');
}
function quickSetStatus(item, newStatus){
  item.status = newStatus; item.updatedOn = TODAY;
  renderStats(); applyFilters();
  toast(item.name + (newStatus==='blocked' ? ' blocked' : ' unblocked'));
}
function requestDeactivate(item){
  if((item.status||'active') === 'inactive') return;
  if(hasActiveDeps(item.deps)){ showImpactModal(item); return; } // same guardrail as the drawer's Status control
  item.status = 'inactive'; item.updatedOn = TODAY;
  renderStats(); applyFilters();
  toast(item.name + ' deactivated');
}
$('#rBody').addEventListener('click', e=>{
  const kb = e.target.closest('[data-kebab]'); if(!kb) return;
  e.stopPropagation();
  const id = kb.dataset.kebab;
  if(rowMenuCtx && rowMenuCtx.id===id){ closeRowMenu(); return; }
  openRowMenu(kb, activeTab, id);
});
$('#rowMenu').addEventListener('click', e=>{
  const b = e.target.closest('button[data-action]'); if(!b || !rowMenuCtx) return;
  const { fam, id } = rowMenuCtx, action = b.dataset.action;
  const item = datasetFor(fam).find(x=>x.id===id);
  closeRowMenu();
  if(!item) return;
  if(action==='duplicate') duplicateRoom(fam, item);
  else if(action==='block') quickSetStatus(item, 'blocked');
  else if(action==='unblock') quickSetStatus(item, 'active');
  else if(action==='mapEquipment') openEditDrawer(item, 'dEquipBtn');
  else if(action==='deactivate') requestDeactivate(item);
  else if(action==='viewDeps') showDepsModal(item);
});
document.addEventListener('click', e=>{
  if(rowMenuCtx && !e.target.closest('#rowMenu') && !e.target.closest('[data-kebab]')) closeRowMenu();
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && rowMenuCtx) closeRowMenu(); });
document.addEventListener('scroll', closeRowMenu, true); // any ancestor scrolling invalidates the fixed-position menu
window.addEventListener('resize', closeRowMenu);

$('#dSave').addEventListener('click', ()=>{
  const name = $('#dName').value.trim();
  if(!name){ toast('Please fill the name'); return; }
  const newStatus = segGet('dStatusSeg');
  const existingItem = editingId ? dataset().find(x=>x.id===editingId) : null;
  if(existingItem && hasActiveDeps(existingItem.deps) && newStatus==='inactive' && existingItem.status!=='inactive'){
    showImpactModal(existingItem);
    return;
  }

  const shared = { name, code: $('#dCode').value.trim(), branch: $('#dBranch').value, department: $('#dDept').value, status: newStatus, updatedOn: TODAY };
  let payload, idPrefix;
  if(drawerFamily==='rooms'){
    idPrefix = 'rm-';
    payload = Object.assign({}, shared, {
      roomType: $('#dRoomType').value,
      capacity: Number($('#dCapacity').value)||0,
      schedulable: $('#dRoomSchedulable').checked, multipurpose: $('#dMultipurpose').checked
    });
  } else if(drawerFamily==='procedure'){
    idPrefix = 'pr-';
    payload = Object.assign({}, shared, {
      altName: $('#dAltName').value.trim(), roomCapability: dRoomCapMchk.get(), maxConcurrent: Number($('#dMaxConcurrent').value)||0,
      requiredStaff: dReqStaffMchk.get(),
      equipTags: dEquipMchk.get(),
      prep: Number($('#dPrep').value)||0, buffer: Number($('#dBuffer').value)||0,
      recoveryBuffer: Number($('#dRecoveryBuffer').value)||0, cleaningBuffer: Number($('#dCleaningBuffer').value)||0,
      consentReq: $('#dConsentReq').checked, consentTags: dConsentMchk.get(),
      schedulable: $('#dAreaSchedulable').checked, blockFrom: $('#dBlockFrom').value, blockTo: $('#dBlockTo').value
    });
  } else {
    idPrefix = 'sr-';
    payload = Object.assign({}, shared, {
      stayTypes: dStayTypesMchk.get(), beds: Number($('#dBedCount').value)||0, bedLabels: bedLabels.slice(),
      notes: $('#dStayNotes').value.trim()
    });
  }
  const label = drawerFamily==='rooms' ? 'Room' : drawerFamily==='procedure' ? 'Procedure/treatment room' : 'Staying room';
  if(editingId){
    Object.assign(existingItem, payload);
    toast(label + ' updated');
    closeDrawer();
    renderStats(); applyFilters();
  } else {
    datasetFor(drawerFamily).push(Object.assign({id:idPrefix+Date.now()}, payload));
    toast(label + ' added');
    closeDrawer();
    if(drawerFamily !== activeTab){ switchTab(drawerFamily); } // jump to the tab that now holds the new room
    else { renderStats(); applyFilters(); }
  }
});

/* ---------- boot ---------- */
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
const ctxBrDD = makeDropdown('ctxBr', v => { toast('Switched to ' + v); branchFilter=v; renderStats(); applyFilters(); });
ctxBrDD.setOptions(CTX_BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.select('Main Campus','Main Campus');

