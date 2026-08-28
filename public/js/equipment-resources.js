document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

const STATUS = { available:{n:'Available',cls:'on'}, maintenance:{n:'Maintenance',cls:'warn'}, blocked:{n:'Blocked',cls:'warn'}, inactive:{n:'Inactive',cls:''} };
const CATS = { treatment:'Treatment Equipment', diagnostic:'Diagnostic Equipment', procedure:'Procedure Equipment', mobility:'Mobility Aid', machine:'Machine', portable:'Portable Device' };
const BRANCHES = ['Main Campus','OPD Annexe','Madhurawada Branch'];
const DEPARTMENTS = ['Administration','OPD','Reception','Billing','Laboratory','Pharmacy','Wound Care','Diabetic Foot','Dermatology','General Surgery','Plastic Surgery','Physiotherapy','Dietetics','ENT'];
/* mirrors the real room roster from rooms-areas.html (all 3 families · General/Procedure/Stay) so
   this picker only ever offers rooms that actually exist on that screen. */
const ROOMS = ['Consultation Room 1','Consultation Room 2','Recovery Bay','Counselling Room','Utility & Sterile Store',
  'Procedure Room 1','Procedure Room 2','Procedure Room 3','Dressing Room 1','Dressing Room 2','Progress Photography Station',
  'Short Stay Room 1','Short Stay Room 2','Day-care Bay 1'];
/* no "Linked to Room Calendar" option · rooms-areas.html has no calendar/hours concept of its own
   (just a Schedulable on/off flag), so that link would go nowhere real. Department Calendar is
   real (Operating Hours, see roles-departments.js), so that one stays. */
const AVAIL_CAL = { 'Therapy Equipment Standard Availability':'Therapy Equipment Standard Availability', 'Procedure Room Standard Availability':'Procedure Room Standard Availability', 'Consulting Room Standard Availability':'Consulting Room Standard Availability', 'linked-dept':'Linked to Department Calendar', independent:'No template (own hours)' };
/* Responsible Team is Admin-configured, not hard-coded · no dedicated "Teams" screen exists in
   this app, so the dropdown itself lets the Admin add a new team inline (same pattern as
   Equipment's Category dropdown) instead of being a fixed, un-editable list. */
let TEAMS = ['Biomedical Engineering','Nursing Team','Clinical Support','Housekeeping & Facilities','Vendor / AMC Support'];
/* vocabulary for the "Map to Service / Treatment / Procedure" action · reuses names already
   seen elsewhere in this app (treatments-procedures.html, services-consultation-types.html) for consistency */
const MAPPABLE = ['Initial Consultation','Follow-up Review','Wound Dressing','Debridement','Compression Therapy',
  'Negative Pressure Wound Therapy (NPWT)','Diabetic Foot Screening','Skin Grafting Assessment','Wound Culture & Swab',
  'Offloading & Orthotic Fitting','Suture Removal','Progress Photography / Documentation','Patient / Family Counselling'];

const EQUIPMENT = [
 {id:'eq-1', name:'Debridement Kit Set A', cat:'procedure', code:'EQP-1001', manufacturer:'—', model:'Surgical Instruments Set', serial:'DK-014',
  branch:'Main Campus', dept:'Wound Care', room:'Procedure Room 1',
  schedulable:true, qty:3, availCal:'linked-dept', team:'Nursing Team',
  calibDue:'—', downFrom:'—', downTo:'—', note:'', status:'available', updatedOn:'20 July 2026',
  mappedTo:['Debridement'], usage:{sessions:5, futureBookings:14}},
 {id:'eq-2', name:'Wound VAC Unit', cat:'treatment', code:'EQP-1002', manufacturer:'KCI', model:'ActiV.A.C.', serial:'VAC-2291',
  branch:'Main Campus', dept:'Wound Care', room:'Dressing Room 1',
  schedulable:true, qty:1, availCal:'independent', team:'Biomedical Engineering',
  calibDue:'15 December 2026', downFrom:'—', downTo:'—', note:'', status:'available', updatedOn:'20 July 2026',
  mappedTo:['Negative Pressure Wound Therapy (NPWT)'], usage:{sessions:3, futureBookings:6}},
 {id:'eq-3', name:'Digital Wound Camera', cat:'diagnostic', code:'EQP-1003', manufacturer:'Canon', model:'EOS 250D', serial:'88213',
  branch:'Main Campus', dept:'Wound Care', room:'Procedure Room 1',
  schedulable:true, qty:1, availCal:'linked-dept', team:'Clinical Support',
  calibDue:'10 November 2026', downFrom:'—', downTo:'—', note:'', status:'available', updatedOn:'01 August 2026',
  mappedTo:['Progress Photography / Documentation'], usage:{sessions:2, futureBookings:8}},
 {id:'eq-4', name:'Autoclave Sterilizer', cat:'machine', code:'EQP-1004', manufacturer:'Astell', model:'AMB330', serial:'AS-5512',
  branch:'Main Campus', dept:'Administration', room:'Utility & Sterile Store',
  schedulable:false, qty:1, availCal:'independent', team:'Biomedical Engineering',
  calibDue:'05 September 2026', downFrom:'01 September 2026', downTo:'05 September 2026',
  note:'Sent for annual calibration · back 05 Sep.', status:'maintenance', updatedOn:'14 August 2026',
  mappedTo:['Debridement','Skin Grafting Assessment'], usage:{sessions:0, futureBookings:0}},
 {id:'eq-5', name:'Patient Wheelchair', cat:'mobility', code:'EQP-1005', manufacturer:'—', model:'Standard Folding', serial:'WC-07',
  branch:'Main Campus', dept:'OPD', room:'',
  schedulable:false, qty:4, availCal:'independent', team:'Housekeeping & Facilities',
  calibDue:'—', downFrom:'—', downTo:'—', note:'', status:'available', updatedOn:'02 June 2024',
  mappedTo:[], usage:{sessions:0, futureBookings:0}},
 {id:'eq-6', name:'Dressing Trolley B', cat:'portable', code:'EQP-1006', manufacturer:'—', model:'Stainless Mobile Trolley', serial:'—',
  branch:'Main Campus', dept:'Wound Care', room:'Dressing Room 2',
  schedulable:true, qty:1, availCal:'linked-dept', team:'Housekeeping & Facilities',
  calibDue:'—', downFrom:'16 August 2026', downTo:'23 August 2026', note:'Wheel repair pending', status:'blocked', updatedOn:'16 August 2026',
  mappedTo:['Wound Dressing'], usage:{sessions:0, futureBookings:0}}
];

function initFsel(wrapId,btnId,panelId,hiddenId,opts,onPick,searchable){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  const searchHTML = searchable ? '<input type="text" class="mchk-search" placeholder="Search…" id="'+panelId+'Search">' : '';
  const setVal=(v,silent)=>{
    hidden.value=v;
    const found=opts.find(o=>o[0]===v);
    btn.textContent = found ? found[1] : opts[0][1];
    $$('.fselopt',panel).forEach(x=>x.classList.toggle('on', x.dataset.v===v));
    if(!silent && onPick) onPick(v);
  };
  const renderPanel = ()=>{
    panel.innerHTML = searchHTML + opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+v+'">'+esc(l)+'</button>').join('');
    if(searchable){
      const searchInput = $('#'+panelId+'Search');
      // filters by hiding (not removing) non-matching rows
      searchInput.addEventListener('input', e=>{
        const q = e.target.value.trim().toLowerCase();
        $$('.fselopt',panel).forEach(el=>{ el.style.display = (!q || el.textContent.toLowerCase().includes(q)) ? '' : 'none'; });
      });
      searchInput.addEventListener('click', e=>e.stopPropagation());
    }
  };
  renderPanel();
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
    if(!wasOpen){
      root.classList.add('open');
      if(searchable){
        const searchInput = $('#'+panelId+'Search');
        searchInput.value = '';
        $$('.fselopt',panel).forEach(el=>el.style.display='');
        searchInput.focus();
      }
    }
  });
  return { set:v=>setVal(v,true), get:()=>hidden.value, setOptions:(o2)=>{ opts=o2; renderPanel(); setVal(opts[0][0], true); } };
}
document.addEventListener('click', ()=>$$('.f.fsel').forEach(x=>x.classList.remove('open')));

const statDD = initFsel('statWrap','statBtn','statPanel','fStat',
  [['','All statuses'],['available','Available'],['maintenance','Maintenance'],['blocked','Blocked'],['inactive','Inactive']], applyFilters);
const catDD = initFsel('catWrap','catBtn','catPanel','fCat', [['','All categories'], ...Object.entries(CATS)], applyFilters);
const dCatDD = initFsel('dCatWrap','dCatBtn','dCatPanel','dCat', Object.entries(CATS));

/* Category is Admin-configured, not hard-coded · the dropdown itself lets the Admin add a new
   category on the spot, same "configuration-first, don't hard-code" pattern used for Counter
   Type on counters-points.html. A new category also becomes selectable in the page-level
   Category filter above, so equipment saved with it can still be found. */
function appendAddCatRow(){
  const panel = $('#dCatPanel');
  const row = document.createElement('div');
  row.className = 'fseladdrow';
  row.innerHTML = '<input type="text" placeholder="Add a new category…" id="dCatNewInput">'
    + '<button type="button" id="dCatAddBtn" title="Add category"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>';
  panel.appendChild(row);
  const input = $('#dCatNewInput');
  const commit = () => {
    const label = input.value.trim();
    if(!label) return;
    const existing = Object.entries(CATS).find(([,l])=>l.toLowerCase()===label.toLowerCase());
    let key = existing ? existing[0] : label.toLowerCase().replace(/[^a-z0-9]+/g,'') || 'cat';
    if(!existing){
      while(CATS[key]) key += 'x';
      CATS[key] = label;
    }
    dCatDD.setOptions(Object.entries(CATS));
    appendAddCatRow();
    dCatDD.set(key);
    const curFilter = catDD.get();
    catDD.setOptions([['','All categories'], ...Object.entries(CATS)]);
    catDD.set(curFilter);
    toast('"'+label+'" added to equipment categories');
  };
  $('#dCatAddBtn').addEventListener('click', e=>{ e.stopPropagation(); commit(); });
  input.addEventListener('click', e=>e.stopPropagation());
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(); } });
}
appendAddCatRow();
/* Branch is read-only in this form · set from whichever branch the page's header switcher
   (ctxBrDD) is currently on when adding, or from the record's own branch when editing. */
function setDBranch(v){ $('#dBranchFixedLabel').textContent = v; $('#dBranch').value = v; }
const dDeptDD = initFsel('dDeptWrap','dDeptBtn','dDeptPanel','dDept', DEPARTMENTS.map(d=>[d,d]));
const dRoomDD = initFsel('dRoomWrap','dRoomBtn','dRoomPanel','dRoom', [['','No fixed location'], ...ROOMS.map(r=>[r,r])], null, true);
/* Availability Calendar only matters for a resource that can actually be booked · hide it once
   Schedulable is switched off, same as any other toggle-driven dependent field in this app. */
function toggleAvailCal(){ $('#dAvailCalFgrp').style.display = $('#dSchedulable').checked ? '' : 'none'; }
$('#dSchedulable').addEventListener('change', toggleAvailCal);
const dAvailCalDD = initFsel('dAvailCalWrap','dAvailCalBtn','dAvailCalPanel','dAvailCal', Object.entries(AVAIL_CAL));
const dTeamDD = initFsel('dTeamWrap','dTeamBtn','dTeamPanel','dTeam', TEAMS.map(t=>[t,t]));
function appendAddTeamRow(){
  const panel = $('#dTeamPanel');
  const row = document.createElement('div');
  row.className = 'fseladdrow';
  row.innerHTML = '<input type="text" placeholder="Add a new team…" id="dTeamNewInput">'
    + '<button type="button" id="dTeamAddBtn" title="Add team"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>';
  panel.appendChild(row);
  const input = $('#dTeamNewInput');
  const commit = () => {
    const label = input.value.trim();
    if(!label) return;
    if(!TEAMS.some(t=>t.toLowerCase()===label.toLowerCase())) TEAMS.push(label);
    dTeamDD.setOptions(TEAMS.map(t=>[t,t]));
    appendAddTeamRow();
    dTeamDD.set(label);
    toast('"'+label+'" added to responsible teams');
  };
  $('#dTeamAddBtn').addEventListener('click', e=>{ e.stopPropagation(); commit(); });
  input.addEventListener('click', e=>e.stopPropagation());
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(); } });
}
appendAddTeamRow();

/* Serial Number is only mandatory once a second piece of equipment shares the same Model · that's
   the only situation where Model number alone can't tell two items apart. */
function hasOtherSameModel(model, excludeId){
  model = (model||'').trim().toLowerCase();
  if(!model) return false;
  return EQUIPMENT.some(e => e.id!==excludeId && (e.model||'').trim().toLowerCase()===model);
}
function updateSerialRequirement(){
  const required = hasOtherSameModel($('#dModel').value, editingId);
  $('#dSerialOptTag').style.display = required ? 'none' : '';
  $('#dSerialHint').style.display = required ? '' : 'none';
  $('#dSerial').dataset.required = required ? '1' : '';
}
$('#dModel').addEventListener('input', updateSerialRequirement);

/* the list only shows equipment for whichever branch the header context switcher (ctxBrDD
   below) is currently on · same branch new records default to. */
let branchFilter = 'Main Campus';
function inBranch(){ return EQUIPMENT.filter(e=>!e.branch||e.branch===branchFilter); }
function renderStats(){
  const list = inBranch();
  $('#stTotal').textContent = list.length;
  $('#stAvail').textContent = list.filter(e=>e.status==='available').length;
  $('#stMaint').textContent = list.filter(e=>e.status==='maintenance'||e.status==='blocked').length;
}
function renderRow(e){
  const st = STATUS[e.status];
  const idBits = [e.manufacturer, e.model, e.serial].filter(v=>v && v!=='—').join(' · ');
  return `<tr>
    <td><b>${esc(e.name)}</b><span class="s">${idBits||'—'}</span></td>
    <td><span class="s">${CATS[e.cat]}</span></td>
    <td><span class="s">${esc(e.room)||'—'}</span></td>
    <td>${e.schedulable ? '<span class="dot-y">✓</span>' : '<span class="dot-n">—</span>'}</td>
    <td><span class="s">${(e.downFrom&&e.downFrom!=='—') ? esc(e.downFrom)+' – '+esc(e.downTo) : '—'}</span></td>
    <td><span class="s">${e.calibDue}</span></td>
    <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td style="text-align:right"><span style="display:inline-flex;gap:6px;align-items:center"><button class="mini" data-edit="${e.id}">Edit</button><button class="kebab-btn" data-kebab="${e.id}" title="More actions" aria-label="More actions">&#8942;</button></span></td>
  </tr>`;
}
function applyFilters(){
  const q = $('#eSearch').value.trim().toLowerCase();
  const cat = catDD.get(), stat = statDD.get();
  const list = inBranch().filter(e =>
    (!q || e.name.toLowerCase().includes(q) || (e.manufacturer||'').toLowerCase().includes(q) || (e.model||'').toLowerCase().includes(q) || (e.serial||'').toLowerCase().includes(q) || (e.code||'').toLowerCase().includes(q)) &&
    (!cat || e.cat===cat) && (!stat || e.status===stat)
  );
  renderList(list);
}
function renderList(list){
  const body = $('#eBody');
  const total = inBranch().length;
  if(!list.length){
    body.innerHTML=''; $('#eEmpty').style.display='block';
    $('#eFoot').textContent = `Showing 0 of ${total} equipment`;
    return;
  }
  $('#eEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#eFoot').textContent = `Showing ${list.length} of ${total} equipment`;
}
$('#eSearch').addEventListener('input', applyFilters);

let editingId = null;
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId, v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b ? b.dataset.v : null; }
$('#dStatusSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dStatusSeg', b.dataset.v); });

$('#newBtn').addEventListener('click', ()=>{
  editingId = null;
  $('#dTitle').textContent='New equipment'; $('#dSub').textContent='Add a schedulable clinical resource';
  $('#dName').value=''; $('#dCode').value=''; $('#dManufacturer').value=''; $('#dModel').value=''; $('#dSerial').value='';
  dRoomDD.set(''); updateSerialRequirement();
  $('#dSchedulable').checked=true; $('#dQty').value='1'; toggleAvailCal();
  dAvailCalDD.set('independent'); dTeamDD.set(TEAMS[0]);
  $('#dCalibDue').value=''; $('#dDownFrom').value=''; $('#dDownTo').value=''; $('#dNote').value='';
  setDBranch(ctxBrDD.value || BRANCHES[0]); dDeptDD.set(DEPARTMENTS[0]);
  segSet('dStatusSeg','available');
  $('#dMetaWrap').style.display='none';
  openDrawer();
});
/* shared by: the row "Edit" button, and the kebab menu's Assign Room / Schedule Downtime
   (which are just Edit, optionally focused on the relevant field · mirrors rooms-areas.html's
   openEditDrawer(item, focusFieldId) pattern so we don't duplicate the field-population logic) */
function openEditDrawer(item, focusFieldId){
  editingId = item.id;
  $('#dTitle').textContent='Edit equipment'; $('#dSub').textContent=item.name;
  $('#dName').value=item.name; $('#dCode').value=item.code||''; dCatDD.set(item.cat);
  $('#dManufacturer').value=item.manufacturer||''; $('#dModel').value=item.model||''; $('#dSerial').value=item.serial||'';
  setDBranch(item.branch); dDeptDD.set(item.dept);
  dRoomDD.set(item.room||''); updateSerialRequirement();
  $('#dSchedulable').checked=!!item.schedulable; $('#dQty').value=item.qty; toggleAvailCal();
  dAvailCalDD.set(item.availCal); dTeamDD.set(item.team);
  $('#dCalibDue').value=item.calibDue;
  $('#dDownFrom').value=item.downFrom==='—'?'':item.downFrom; $('#dDownTo').value=item.downTo==='—'?'':item.downTo;
  $('#dNote').value=item.note;
  segSet('dStatusSeg', item.status);
  $('#dMeta').textContent = 'Last updated ' + item.updatedOn;
  $('#dMetaWrap').style.display='block';
  openDrawer();
  if(focusFieldId){
    const f = $('#'+focusFieldId);
    if(f) setTimeout(()=>{ f.scrollIntoView({block:'center', behavior:'smooth'}); f.focus({preventScroll:true}); }, 320); // after the .3s drawer slide-in
  }
}
$('#eBody').addEventListener('click', e=>{
  const b=e.target.closest('[data-edit]'); if(!b) return;
  const item = EQUIPMENT.find(x=>x.id===b.dataset.edit); if(!item) return;
  openEditDrawer(item);
});
$('#dClose').addEventListener('click', closeDrawer);
$('#dCancel').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#drawer').classList.contains('show')) closeDrawer(); });

$('#dSave').addEventListener('click', ()=>{
  const name=$('#dName').value.trim();
  if(!name){ toast('Please fill the equipment name'); return; }
  const modelRaw = $('#dModel').value.trim(), serialRaw = $('#dSerial').value.trim();
  if(hasOtherSameModel(modelRaw, editingId) && !serialRaw){
    toast('Serial Number is required · another equipment already uses this Model');
    $('#dSerial').focus();
    return;
  }
  const payload = { name, code: $('#dCode').value.trim()||'—', cat: $('#dCat').value,
    manufacturer: $('#dManufacturer').value.trim()||'—', model: modelRaw||'—', serial: serialRaw||'—',
    branch: $('#dBranch').value, dept: $('#dDept').value,
    room: $('#dRoom').value,
    schedulable: $('#dSchedulable').checked, qty: Number($('#dQty').value)||1,
    availCal: $('#dAvailCal').value, team: $('#dTeam').value,
    calibDue: $('#dCalibDue').value.trim()||'—',
    downFrom: $('#dDownFrom').value.trim()||'—', downTo: $('#dDownTo').value.trim()||'—',
    note: $('#dNote').value.trim(), status: segGet('dStatusSeg'), updatedOn: TODAY };
  if(editingId){
    Object.assign(EQUIPMENT.find(x=>x.id===editingId), payload);
    toast('Equipment updated');
  } else {
    EQUIPMENT.push(Object.assign({id:'eq-'+Date.now(), mappedTo:[], usage:{sessions:0, futureBookings:0}}, payload));
    toast('Equipment added');
  }
  closeDrawer();
  renderStats(); applyFilters();
});

/* ---------- quick status actions (Set Temporary Block / Unblock) ---------- */
function quickSetEquipStatus(item, newStatus){
  item.status = newStatus; item.updatedOn = TODAY;
  renderStats(); applyFilters();
  toast(item.name + (newStatus==='blocked' ? ' blocked' : ' unblocked'));
}

/* ---------- deactivation impact / usage review guardrail ---------- */
function hasEquipUsage(usage){
  return !!usage && ((usage.sessions||0)>0 || (usage.futureBookings||0)>0);
}
function usageRowsHtml(usage, includeMapped, mappedCount){
  const row = (label, v) => '<div class="deprow"><span>'+label+'</span><b'+(v===0?' class="zero"':'')+'>'+v+'</b></div>';
  let html = row('Doctor / staff sessions', usage.sessions||0) + row('Future bookings / procedures', usage.futureBookings||0);
  if(includeMapped) html += row('Mapped services / treatments', mappedCount||0);
  return html;
}
let impactItem = null;
function showEquipImpactModal(item){
  impactItem = item;
  $('#iTitle').textContent = 'Deactivate ' + item.name + '?';
  $('#iBody').innerHTML = '<p class="dep-intro">Deactivating this equipment affects:</p>' + usageRowsHtml(item.usage||{sessions:0,futureBookings:0}, false);
  $('#iFootHint').innerHTML = '<b>Past sessions keep their history.</b> Upcoming sessions using this equipment will need another resource. Reassign them first if that is not intended.';
  $('#iScrim').classList.add('show');
}
function closeEquipImpactModal(){ $('#iScrim').classList.remove('show'); impactItem=null; }
$('#iCancel').addEventListener('click', closeEquipImpactModal);
$('#iContinue').addEventListener('click', ()=>{
  const item = impactItem; if(!item){ closeEquipImpactModal(); return; }
  item.status = 'inactive'; item.updatedOn = TODAY;
  closeEquipImpactModal();
  renderStats(); applyFilters();
  toast(item.name + ' deactivated');
});
$('#iScrim').addEventListener('click', e=>{ if(e.target.id==='iScrim') closeEquipImpactModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#iScrim').classList.contains('show')) closeEquipImpactModal(); });

function requestDeactivateEquip(item){
  if((item.status||'available') === 'inactive') return;
  if(hasEquipUsage(item.usage)){ showEquipImpactModal(item); return; } // same guardrail as would apply from the drawer's Status control
  item.status = 'inactive'; item.updatedOn = TODAY;
  renderStats(); applyFilters();
  toast(item.name + ' deactivated');
}

/* ---------- view usage (read-only · NOT a deactivation guardrail) ---------- */
function showUsageModal(item){
  $('#usageTitle').textContent = 'Usage · ' + item.name;
  const u = item.usage || {sessions:0, futureBookings:0};
  const mapped = (item.mappedTo || []).length;
  $('#usageBody').innerHTML = ((u.sessions||0)===0 && (u.futureBookings||0)===0 && mapped===0)
    ? 'No current usage.' : usageRowsHtml(u, true, mapped);
  $('#usageScrim').classList.add('show');
}
function closeUsageModal(){ $('#usageScrim').classList.remove('show'); }
$('#usageClose').addEventListener('click', closeUsageModal);
$('#usageScrim').addEventListener('click', e=>{ if(e.target.id==='usageScrim') closeUsageModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#usageScrim').classList.contains('show')) closeUsageModal(); });

/* ---------- Map to Service / Treatment / Procedure modal ---------- */
let mapItem = null;
function renderMapChecklist(selected){
  return MAPPABLE.map(v =>
    '<label class="mchk-opt"><input type="checkbox" value="'+esc(v)+'" '+(selected.includes(v)?'checked':'')+'><span>'+esc(v)+'</span></label>'
  ).join('');
}
function openMapModal(item){
  mapItem = item;
  $('#mapModalSub').textContent = item.name;
  $('#mapModalBody').innerHTML = renderMapChecklist(item.mappedTo || []);
  $('#mapModalSearch').value = '';
  filterMapChecklist('');
  $('#mapScrim').classList.add('show');
}
/* filters the checklist by hiding (not removing) non-matching rows, so already-ticked
   checkboxes outside the current search text still count when Save reads the DOM */
function filterMapChecklist(q){
  q = q.trim().toLowerCase();
  const rows = $$('#mapModalBody .mchk-opt');
  let shown = 0;
  rows.forEach(el=>{
    const match = !q || el.textContent.toLowerCase().includes(q);
    el.style.display = match ? '' : 'none';
    if(match) shown++;
  });
  $('#mapModalEmpty').style.display = shown ? 'none' : 'block';
}
$('#mapModalSearch').addEventListener('input', e=>filterMapChecklist(e.target.value));
function closeMapModal(){ $('#mapScrim').classList.remove('show'); mapItem=null; }
$('#mapModalCancel').addEventListener('click', closeMapModal);
$('#mapScrim').addEventListener('click', e=>{ if(e.target.id==='mapScrim') closeMapModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#mapScrim').classList.contains('show')) closeMapModal(); });
$('#mapModalSave').addEventListener('click', ()=>{
  if(!mapItem) return;
  const checked = $$('#mapModalBody input[type=checkbox]:checked').map(cb=>cb.value);
  mapItem.mappedTo = checked;
  toast(mapItem.name + ' mapping updated');
  closeMapModal();
});

/* ---------- row actions overflow ("kebab") menu ---------- */
let rowMenuCtx = null; // id of the row the open menu belongs to
function closeRowMenu(){ $('#rowMenu').classList.remove('show'); rowMenuCtx = null; }
function buildEquipRowMenu(item){
  const st = item.status || 'available';
  const items = [{action:'assignRoom', label:'Assign Room'}];
  items.push(st!=='blocked' ? {action:'block', label:'Set Temporary Block'} : {action:'unblock', label:'Unblock'});
  items.push({action:'scheduleDowntime', label:'Schedule Downtime'});
  items.push({action:'mapTo', label:'Map to Service / Treatment / Procedure'});
  if(st!=='inactive') items.push({action:'deactivate', label:'Deactivate', danger:true});
  items.push({action:'viewUsage', label:'View Usage'});
  return items;
}
function openRowMenu(btn, id){
  const item = EQUIPMENT.find(x=>x.id===id); if(!item) return;
  rowMenuCtx = id;
  const menu = $('#rowMenu');
  menu.innerHTML = buildEquipRowMenu(item).map(it=>
    '<button type="button" data-action="'+it.action+'"'+(it.danger?' class="danger"':'')+'>'+esc(it.label)+'</button>').join('');
  menu.classList.add('show'); // must show before measuring so offsetWidth/Height aren't 0
  const r = btn.getBoundingClientRect();
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  let left = r.right - mw; if(left < 8) left = 8;
  let top = r.bottom + 6; if(top + mh > window.innerHeight - 8) top = r.top - mh - 6;
  menu.style.left = left + 'px'; menu.style.top = top + 'px';
}
$('#eBody').addEventListener('click', e=>{
  const kb = e.target.closest('[data-kebab]'); if(!kb) return;
  e.stopPropagation();
  const id = kb.dataset.kebab;
  if(rowMenuCtx===id){ closeRowMenu(); return; }
  openRowMenu(kb, id);
});
$('#rowMenu').addEventListener('click', e=>{
  const b = e.target.closest('button[data-action]'); if(!b || !rowMenuCtx) return;
  const id = rowMenuCtx, action = b.dataset.action;
  const item = EQUIPMENT.find(x=>x.id===id);
  closeRowMenu();
  if(!item) return;
  if(action==='assignRoom') openEditDrawer(item, 'dRoomBtn');
  else if(action==='block') quickSetEquipStatus(item, 'blocked');
  else if(action==='unblock') quickSetEquipStatus(item, 'available');
  else if(action==='scheduleDowntime') openEditDrawer(item, 'dDownFrom');
  else if(action==='mapTo') openMapModal(item);
  else if(action==='deactivate') requestDeactivateEquip(item);
  else if(action==='viewUsage') showUsageModal(item);
});
document.addEventListener('click', e=>{
  if(rowMenuCtx && !e.target.closest('#rowMenu') && !e.target.closest('[data-kebab]')) closeRowMenu();
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && rowMenuCtx) closeRowMenu(); });
document.addEventListener('scroll', closeRowMenu, true); // any ancestor scrolling invalidates the fixed-position menu
window.addEventListener('resize', closeRowMenu);

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

