document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';
const ME = 'Rajeev Malhotra';

/* ---------- data ---------- */
const BRANCH_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>';
const TYPE = { current:{n:'Current Clinic', cls:'ok'}, future:{n:'Future Branch', cls:'info'} };
const STATUS = { active:{n:'Active',cls:'on'}, draft:{n:'Draft',cls:''}, inactive:{n:'Inactive',cls:'warn'} };
const BRANCH_TYPE = { clinic:'Clinic', daycare:'Day-care / Short-stay capable' };
const STATES = ['Andhra Pradesh','Telangana','Karnataka','Tamil Nadu','Maharashtra','Delhi','Uttar Pradesh','West Bengal','Gujarat','Rajasthan'];

function fullAddress(b){
  return [b.addr1, b.locality, b.city, b.addr2].filter(Boolean).join(', ') || '—';
}

/* branchKey bridges this branch record to the CTX_BRANCHES identity ('Main Campus' / 'OPD Annexe' /
   'Madhurawada Branch') that every working-hours/calendar/roster screen in the app keys off · only a
   currently-operating branch has one; a future/draft branch gets no branchKey until it's activated,
   since it has no real calendar/staff data to link to yet. */
const BRANCHES = [
 {id:'br-bh', name:'AWH · Banjara Hills', code:'BH-01', type:'current', branchType:'clinic',
  addr1:'Road No. 12', addr2:'opposite Care Hospitals', locality:'Banjara Hills', city:'Hyderabad', state:'Telangana', pin:'500034',
  phone:'040-4567 8899', email:'care@kvnnawh.in',
  branchKey:'Main Campus', opDate:'',
  hoursOpen:'09:00', hoursClose:'21:00',
  dayBlocks:[{name:'Mornings',s:'06:00',e:'11:00'},{name:'Afternoons',s:'11:00',e:'16:00'},{name:'Evenings',s:'16:00',e:'21:00'}],
  staffShifts:[{name:'Shift 1',s:'06:00',e:'16:00'},{name:'Shift 2',s:'10:00',e:'20:00'}],
  sundayStart:'09:00', sundayEnd:'13:00',
  skeletonCrew:true, holidays:['Diwali','Independence Day'],
  status:'active', note:'', updatedOn:'01 June 2024', updatedBy:ME,
  history:[
    {date:'01 June 2024', by:ME, action:'Contact phone updated'},
    {date:'22 March 2024', by:'Anita Rao', action:'Staff shifts updated'},
    {date:'14 January 2023', by:ME, action:'Branch calendar linked to Main Campus'},
    {date:'02 August 2021', by:'Anita Rao', action:'Branch created'}
  ],
  deps:{departments:9, rooms:11, staff:52, activeDoctors:14, futureBookings:214}},
 {id:'br-kp', name:'AWH · Kondapur (planned)', code:'KP-02', type:'future', branchType:'clinic',
  addr1:'Survey No. 88', addr2:'', locality:'Kondapur Main Road', city:'Hyderabad', state:'Telangana', pin:'500084',
  phone:'', email:'',
  opDate:'',
  hoursOpen:'', hoursClose:'', dayBlocks:[], staffShifts:[],
  sundayStart:'', sundayEnd:'',
  skeletonCrew:false, holidays:[],
  status:'draft', note:'Future branch draft · activation pending final fit-out.', updatedOn:'10 August 2026', updatedBy:ME,
  history:[
    {date:'10 August 2026', by:ME, action:'Draft created'}
  ],
  deps:{departments:0, rooms:0, staff:0, activeDoctors:0, futureBookings:0}}
];

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
  return { set:v=>setVal(v,true), get:()=>hidden.value, setOptions:(o2)=>{ opts=o2; panel.innerHTML = opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+v+'">'+esc(l)+'</button>').join(''); setVal(opts[0][0], true); } };
}
document.addEventListener('click', ()=>$$('.f.fsel').forEach(x=>x.classList.remove('open')));

const statDD = initFsel('statWrap','statBtn','statPanel','fStat',
  [['','All statuses'],['active','Active'],['draft','Draft'],['inactive','Inactive']], applyFilters);
const dStateDD = initFsel('dStateWrap','dStateBtn','dStatePanel','dState', [['','Select state / UT…'], ...STATES.map(s=>[s,s])]);

/* Holiday picker for the Defaults tab's Holidays & Seasonal Planning list · a shared, admin-
   growable list of festival/holiday names (add-new-option row, same pattern as Equipment's
   Category dropdown), not per-branch dates · the full date-based calendar stays in
   availability.html via the Configure links below. */
let HOLIDAYS_LIST = ['Diwali','Holi'];
const dHolDD = initFsel('dHolWrap','dHolBtn','dHolPanel','dHol', HOLIDAYS_LIST.map(h=>[h,h]));
function appendAddHolRow(){
  const panel = $('#dHolPanel');
  const row = document.createElement('div');
  row.className = 'fseladdrow';
  row.innerHTML = '<input type="text" placeholder="Add a new holiday…" id="dHolNewInput">'
    + '<button type="button" id="dHolAddNewBtn" title="Add holiday"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>';
  panel.appendChild(row);
  const input = $('#dHolNewInput');
  const commit = () => {
    const label = input.value.trim();
    if(!label) return;
    if(!HOLIDAYS_LIST.some(h=>h.toLowerCase()===label.toLowerCase())) HOLIDAYS_LIST.push(label);
    dHolDD.setOptions(HOLIDAYS_LIST.map(h=>[h,h]));
    appendAddHolRow();
    dHolDD.set(label);
  };
  $('#dHolAddNewBtn').addEventListener('click', e=>{ e.stopPropagation(); commit(); });
  input.addEventListener('click', e=>e.stopPropagation());
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(); } });
}
appendAddHolRow();
function renderHolidays(item){
  const hols = (item && item.holidays) || [];
  $('#dHolidays').innerHTML = hols.map((h,i)=>
    '<div class="dblkrow" data-i="'+i+'" style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
    + '<span class="chip mute" style="flex:1;justify-content:flex-start;padding:6px 10px">'+esc(h)+'</span>'
    + '<button type="button" class="mini" data-rmhol="'+i+'" title="Remove">✕</button>'
    + '</div>'
  ).join('') || '<p class="hint">No holidays added yet.</p>';
}
$('#dHolAddBtn').addEventListener('click', ()=>{
  const v = dHolDD.get(); if(!v) return;
  (draftItem.holidays=draftItem.holidays||[]);
  if(!draftItem.holidays.includes(v)) draftItem.holidays.push(v);
  else { toast('"'+v+'" is already in the list'); return; }
  renderHolidays(draftItem);
});
$('#dHolidays').addEventListener('click', e=>{
  const b=e.target.closest('[data-rmhol]'); if(!b) return;
  draftItem.holidays.splice(+b.dataset.rmhol,1);
  renderHolidays(draftItem);
});

/* ---------- render ---------- */
function renderStats(){
  $('#stTotal').textContent = BRANCHES.length;
  $('#stActive').textContent = BRANCHES.filter(b=>b.status==='active').length;
  $('#stDraft').textContent = BRANCHES.filter(b=>b.status==='draft').length;
}
function renderRow(b){
  const t = TYPE[b.type], st = STATUS[b.status];
  return `<tr>
    <td><div style="display:flex;align-items:center;gap:9px;min-width:0"><span class="ravatar">${BRANCH_ICON}</span><div style="min-width:0"><b>${esc(b.name)}</b><span class="s">${esc(b.code)}</span>${b.note?`<span class="s bnote">${esc(b.note)}</span>`:''}</div></div></td>
    <td><span class="chip ${t.cls}">${t.n}</span></td>
    <td><span class="s">${esc(fullAddress(b))}</span></td>
    <td><span class="s">${b.phone?esc(b.phone):'—'}${b.email?' · '+esc(b.email):''}</span></td>
    <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td style="text-align:right;white-space:nowrap">
      <button class="mini" data-edit="${b.id}">Edit</button>
      <button class="mini" data-dup="${b.id}">Duplicate</button>
      <button class="mini" data-deps="${b.id}">Dependencies</button>
    </td>
  </tr>`;
}
function applyFilters(){
  const q = $('#bSearch').value.trim().toLowerCase();
  const stat = statDD.get();
  const list = BRANCHES.filter(b =>
    (!q || b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)) &&
    (!stat || b.status===stat)
  );
  renderList(list);
}
function renderList(list){
  const body = $('#bBody');
  if(!list.length){
    body.innerHTML=''; $('#bEmpty').style.display='block';
    $('#bFoot').textContent = `Showing 0 of ${BRANCHES.length} branches`;
    return;
  }
  $('#bEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#bFoot').textContent = `Showing ${list.length} of ${BRANCHES.length} branches`;
}
$('#bSearch').addEventListener('input', applyFilters);

/* ---------- drawer ---------- */
let editingId = null;
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId, v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b ? b.dataset.v : null; }
$('#dBranchTypeSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dBranchTypeSeg', b.dataset.v); });
$('#dTypeSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dTypeSeg', b.dataset.v); });
$('#dStatusSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dStatusSeg', b.dataset.v); });

/* ---------- drawer tabs ---------- */
function switchDTab(t){
  $$('#dTabs button').forEach(b=>b.classList.toggle('on', b.dataset.dt===t));
  $$('.dpanel').forEach(p=>p.classList.remove('on'));
  $('#dp'+t[0].toUpperCase()+t.slice(1)).classList.add('on');
}
$('#dTabs').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) switchDTab(b.dataset.dt); });

function renderDeps(item){
  if(!item || !item.deps){ $('#dDepsList').innerHTML=''; $('#dDepsEmpty').style.display='block'; return; }
  $('#dDepsEmpty').style.display='none';
  const rows = [['Departments',item.deps.departments],['Rooms',item.deps.rooms],['Staff',item.deps.staff],['Active doctors',item.deps.activeDoctors],['Future bookings',item.deps.futureBookings]];
  $('#dDepsList').innerHTML = rows.map(([l,v])=>`<div class="deprow"><span>${l}</span><b>${v}</b></div>`).join('');
}

/* ---- Day Blocks / Staff Shifts · small editable lists that live directly on the branch
   record, same "type name + start + end, add/remove" pattern used for the fuller versions of
   these on availability.html / roster-sessions.html, just scoped to this one branch inline.
   draftItem holds whichever record the drawer is currently working against · the real BRANCHES
   record when editing, or a fresh scratch object for a brand-new branch so everything (including
   these lists) can be filled in before the first Save, not gated behind saving once first.
   A new branch starts with the standard Morning/Afternoon/Evening blocks and a Shift 1/Shift 2
   pair already in place · admin only adjusts times instead of typing names from scratch. */
const DEFAULT_DAY_BLOCKS = () => [{name:'Mornings',s:'06:00',e:'11:00'},{name:'Afternoons',s:'11:00',e:'16:00'},{name:'Evenings',s:'16:00',e:'21:00'}];
const DEFAULT_STAFF_SHIFTS = () => [{name:'Shift 1',s:'06:00',e:'16:00'},{name:'Shift 2',s:'10:00',e:'20:00'}];
let draftItem = null;
function renderDayBlocks(item){
  const blocks = (item && item.dayBlocks) || [];
  $('#dDayBlocks').innerHTML = blocks.map((b,i)=>
    '<div class="dblkrow" data-i="'+i+'" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
    + '<input class="fld dblkname" type="text" value="'+esc(b.name)+'" placeholder="Block name" style="max-width:130px">'
    + '<input class="fld dblks" type="time" value="'+b.s+'">'
    + '<span class="dash">–</span>'
    + '<input class="fld dblke" type="time" value="'+b.e+'">'
    + '<button type="button" class="mini" data-rmblk="'+i+'" title="Remove">✕</button>'
    + '</div>'
  ).join('') || '<p class="hint">No day blocks yet. Add one above.</p>';
}
$('#dDayBlockAdd').addEventListener('click', ()=>{
  (draftItem.dayBlocks=draftItem.dayBlocks||[]).push({name:'New block', s:'09:00', e:'13:00'});
  renderDayBlocks(draftItem);
});
$('#dDayBlocks').addEventListener('click', e=>{
  const b=e.target.closest('[data-rmblk]'); if(!b) return;
  draftItem.dayBlocks.splice(+b.dataset.rmblk,1);
  renderDayBlocks(draftItem);
});
$('#dDayBlocks').addEventListener('change', e=>{
  const row=e.target.closest('.dblkrow'); if(!row) return;
  const i=+row.dataset.i, blk=draftItem.dayBlocks[i];
  blk.name=row.querySelector('.dblkname').value.trim()||'Block'; blk.s=row.querySelector('.dblks').value; blk.e=row.querySelector('.dblke').value;
});

function renderStaffShifts(item){
  const shifts = (item && item.staffShifts) || [];
  $('#dStaffShifts').innerHTML = shifts.map((s,i)=>
    '<div class="dblkrow" data-i="'+i+'" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
    + '<input class="fld sftname" type="text" value="'+esc(s.name)+'" placeholder="Shift name" style="max-width:130px">'
    + '<input class="fld sfts" type="time" value="'+s.s+'">'
    + '<span class="dash">–</span>'
    + '<input class="fld sfte" type="time" value="'+s.e+'">'
    + '<button type="button" class="mini" data-rmsft="'+i+'" title="Remove">✕</button>'
    + '</div>'
  ).join('') || '<p class="hint">No staff shifts yet. Add one above.</p>';
}
$('#dStaffShiftAdd').addEventListener('click', ()=>{
  (draftItem.staffShifts=draftItem.staffShifts||[]).push({name:'New shift', s:'09:00', e:'17:00'});
  renderStaffShifts(draftItem);
});
$('#dStaffShifts').addEventListener('click', e=>{
  const b=e.target.closest('[data-rmsft]'); if(!b) return;
  draftItem.staffShifts.splice(+b.dataset.rmsft,1);
  renderStaffShifts(draftItem);
});
$('#dStaffShifts').addEventListener('change', e=>{
  const row=e.target.closest('.dblkrow'); if(!row) return;
  const i=+row.dataset.i, sft=draftItem.staffShifts[i];
  sft.name=row.querySelector('.sftname').value.trim()||'Shift'; sft.s=row.querySelector('.sfts').value; sft.e=row.querySelector('.sfte').value;
});

/* Branch Calendar / Staff Shifts links are real deep-links into availability.html / roster-sessions.html,
   scoped to this branch's branchKey · not a decorative label picker. Everything else here (hours,
   day blocks, shifts, Sunday policy, skeleton crew) is fillable for a brand-new branch too · no
   "save once first" gate · item is null only for a fresh draft, which still gets a scratch draftItem. */
function renderDefaultsTab(item){
  draftItem = item || {
    hoursOpen:'09:00', hoursClose:'21:00',
    dayBlocks: DEFAULT_DAY_BLOCKS(), staffShifts: DEFAULT_STAFF_SHIFTS(),
    sundayStart:'09:00', sundayEnd:'13:00',
    skeletonCrew: true, holidays: ['Diwali','Independence Day']
  };
  const linked = !!(item && item.branchKey);
  $('#dCalLinked').style.display = linked ? '' : 'none';
  $('#dHoursOpen').value = draftItem.hoursOpen||''; $('#dHoursClose').value = draftItem.hoursClose||'';
  $('#dSundayStart').value = draftItem.sundayStart||'09:00'; $('#dSundayEnd').value = draftItem.sundayEnd||'13:00';
  $('#dSkeletonCrew').checked = !!draftItem.skeletonCrew;
  renderDayBlocks(draftItem);
  renderStaffShifts(draftItem);
  renderHolidays(draftItem);
}

$('#newBtn').addEventListener('click', ()=>{
  editingId = null;
  $('#dTitle').textContent='New branch'; $('#dSub').textContent='Add a future branch draft';
  $('#dQuickActions').style.display='none';
  switchDTab('basic');
  $('#dName').value=''; $('#dCode').value='';
  segSet('dBranchTypeSeg','clinic'); segSet('dTypeSeg','future'); segSet('dStatusSeg','draft');
  $('#dNote').value='';
  $('#dAddr1').value=''; $('#dAddr2').value=''; $('#dLocality').value=''; $('#dCity').value='';
  dStateDD.set(''); $('#dPin').value=''; $('#dPhone').value=''; $('#dEmail').value='';
  $('#dOpDate').value='';
  renderDefaultsTab(null);
  renderDeps(null);
  openDrawer();
});

function openEdit(item, tab){
  editingId = item.id;
  $('#dTitle').textContent='Edit branch'; $('#dSub').textContent=item.name;
  $('#dQuickActions').style.display='flex';
  switchDTab(tab || 'basic');
  $('#dName').value=item.name; $('#dCode').value=item.code;
  segSet('dBranchTypeSeg', item.branchType||'clinic'); segSet('dTypeSeg', item.type); segSet('dStatusSeg', item.status);
  $('#dNote').value=item.note||'';
  $('#dAddr1').value=item.addr1||''; $('#dAddr2').value=item.addr2||''; $('#dLocality').value=item.locality||''; $('#dCity').value=item.city||'';
  dStateDD.set(item.state||''); $('#dPin').value=item.pin||''; $('#dPhone').value=item.phone||''; $('#dEmail').value=item.email||'';
  $('#dOpDate').value=item.opDate||'';
  renderDefaultsTab(item);
  renderDeps(item);
  openDrawer();
}
$('#bBody').addEventListener('click', e=>{
  const edit=e.target.closest('[data-edit]');
  const deps=e.target.closest('[data-deps]');
  const dup=e.target.closest('[data-dup]');
  if(edit){ const item=BRANCHES.find(x=>x.id===edit.dataset.edit); if(item) openEdit(item); }
  else if(deps){ const item=BRANCHES.find(x=>x.id===deps.dataset.deps); if(item) openEdit(item,'deps'); }
  else if(dup){ const item=BRANCHES.find(x=>x.id===dup.dataset.dup); if(item) duplicateBranch(item); }
});
$('#dClose').addEventListener('click', closeDrawer);
$('#dCancel').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#drawer').classList.contains('show')) closeDrawer(); });

/* ---------- quick actions: Validate / Duplicate / History ---------- */
function duplicateBranch(item){
  const clone = Object.assign({}, item, {
    id:'br-'+Date.now(), name:item.name.replace(/\s*\(planned\)\s*$/,'')+' · copy', code:'',
    type:'future', status:'draft', deps:{departments:0,rooms:0,staff:0,activeDoctors:0,futureBookings:0},
    branchKey:undefined, // a copy is a fresh, unconfigured draft · it must not inherit the original's live calendar/shift link
    dayBlocks:(item.dayBlocks||[]).map(b=>({...b})), staffShifts:(item.staffShifts||[]).map(s=>({...s})), holidays:(item.holidays||[]).slice(), // deep-copy · editing the clone must not mutate the original
    history:[{date:TODAY, by:ME, action:'Duplicated from "'+item.name+'"'}], // a clone starts its own fresh log, not the original's
    updatedOn: TODAY, updatedBy: ME
  });
  BRANCHES.push(clone);
  renderStats(); applyFilters();
  toast('Duplicated "'+item.name+'" as a new draft template');
}
/* mandatory:true checks are fields the admin fills in this very drawer, so an incomplete one
   genuinely blocks moving the branch to Active (warn + refuse to save, per sir's call · "warn
   and not allow unless the important mandatory fields are filled"). "Branch calendar linked" is
   system-managed (there's no field here to set branchKey by hand), so it stays informational —
   blocking on it would trap every new branch in an impossible-to-satisfy dead end. */
const VALIDATE_CHECKS = [
  {label:'Address on file', mandatory:true, test:item=>!!item.addr1},
  {label:'Contact phone on file', mandatory:true, test:item=>!!item.phone},
  {label:'Operating hours set', mandatory:true, test:item=>!!item.hoursOpen && !!item.hoursClose},
  {label:'Staff shifts defined', mandatory:true, test:item=>(item.staffShifts||[]).length>0},
  {label:'Branch calendar linked', mandatory:false, test:item=>!!item.branchKey}
];
function renderValidate(item){
  const results = VALIDATE_CHECKS.map(c=>({label:c.label, pass:c.test(item)}));
  const allPass = results.every(r=>r.pass);
  $('#validateSub').textContent = item.name;
  $('#validateTitle').textContent = allPass ? 'Setup validated' : 'Setup incomplete';
  $('#validateIcon').style.background = allPass ? 'var(--success-soft)' : 'var(--danger-soft)';
  $('#validateIcon').style.color = allPass ? 'var(--success)' : 'var(--danger)';
  $('#validateBody').innerHTML = results.map((r,i)=>
    '<div class="chkrow"><span class="chkicon '+(r.pass?'ok':'bad')+'">'+(r.pass?'✓':'✗')+'</span><b>'+esc(r.label)+(VALIDATE_CHECKS[i].mandatory?'':' <span class="hint">(optional)</span>')+'</b></div>'
  ).join('');
}
$('#dValidate').addEventListener('click', ()=>{
  const item = BRANCHES.find(x=>x.id===editingId); if(!item) return;
  renderValidate(item);
  $('#validateScrim').classList.add('show');
});
$('#validateClose').addEventListener('click', ()=>$('#validateScrim').classList.remove('show'));
$('#validateScrim').addEventListener('click', e=>{ if(e.target.id==='validateScrim') $('#validateScrim').classList.remove('show'); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#validateScrim').classList.contains('show')) $('#validateScrim').classList.remove('show'); });
$('#dConfigureCalBtn').addEventListener('click', ()=>{
  const item = BRANCHES.find(x=>x.id===editingId); if(!item || !item.branchKey) return;
  location.href = 'availability.html?tab=clinic&branch=' + encodeURIComponent(item.branchKey);
});
$('#dConfigureShiftsBtn').addEventListener('click', ()=>{
  const item = BRANCHES.find(x=>x.id===editingId); if(!item || !item.branchKey) return;
  location.href = 'roster-sessions.html?branch=' + encodeURIComponent(item.branchKey) + '&role=staff';
});
$('#dDuplicate').addEventListener('click', ()=>{
  const item = BRANCHES.find(x=>x.id===editingId); if(!item) return;
  duplicateBranch(item);
  closeDrawer();
});
function renderHistory(item){
  $('#histSub').textContent = item.name;
  const rows = item.history || [];
  $('#histBody').innerHTML = rows.map(h=>
    '<div class="histrow"><span class="histdot"></span><div><b>'+esc(h.action)+'</b><span>'+esc(h.date)+' · '+esc(h.by)+'</span></div></div>'
  ).join('') || '<p class="hint">No history yet.</p>';
}
$('#dHistory').addEventListener('click', ()=>{
  const item = BRANCHES.find(x=>x.id===editingId); if(!item) return;
  renderHistory(item);
  $('#histScrim').classList.add('show');
});
$('#histClose').addEventListener('click', ()=>$('#histScrim').classList.remove('show'));
$('#histScrim').addEventListener('click', e=>{ if(e.target.id==='histScrim') $('#histScrim').classList.remove('show'); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#histScrim').classList.contains('show')) $('#histScrim').classList.remove('show'); });

function collectPayload(){
  return {
    name: $('#dName').value.trim(), code: $('#dCode').value.trim(),
    branchType: segGet('dBranchTypeSeg'), type: segGet('dTypeSeg'),
    note: $('#dNote').value.trim(),
    addr1: $('#dAddr1').value.trim(), addr2: $('#dAddr2').value.trim(), locality: $('#dLocality').value.trim(),
    city: $('#dCity').value.trim(), state: $('#dState').value, pin: $('#dPin').value.trim(),
    phone: $('#dPhone').value.trim(), email: $('#dEmail').value.trim(),
    opDate: $('#dOpDate').value,
    hoursOpen: $('#dHoursOpen').value, hoursClose: $('#dHoursClose').value,
    sundayStart: $('#dSundayStart').value, sundayEnd: $('#dSundayEnd').value,
    skeletonCrew: $('#dSkeletonCrew').checked,
    updatedOn: TODAY, updatedBy: ME
  };
}
function saveBranch(forceDraft){
  const name=$('#dName').value.trim(), code=$('#dCode').value.trim();
  if(!name || !code){ toast('Please fill Branch Name and Code'); return; }
  const dupCode = BRANCHES.some(x=>x.id!==editingId && x.code.trim().toLowerCase()===code.toLowerCase());
  if(dupCode){ toast(`Branch code "${code}" is already in use`); return; }

  const payload = collectPayload();
  payload.status = forceDraft ? 'draft' : segGet('dStatusSeg');

  /* "Save Draft" is the explicit escape hatch for incomplete work-in-progress · always allowed.
     The main "Save"/"Add branch" action, whatever status is selected, is gated on the mandatory
     Validate Setup checks · warn, show exactly what's missing, and refuse to save until they're
     filled, per sir's call: adding a branch without its required fields shouldn't validate. */
  if(!forceDraft){
    const existing = editingId ? BRANCHES.find(x=>x.id===editingId) : null;
    const checkTarget = Object.assign({}, payload, {
      staffShifts: existing ? (existing.staffShifts||[]) : (draftItem.staffShifts||[]),
      branchKey: existing ? existing.branchKey : draftItem.branchKey
    });
    const failed = VALIDATE_CHECKS.filter(c=>c.mandatory && !c.test(checkTarget));
    if(failed.length){
      toast('Can\'t save, missing: '+failed.map(f=>f.label).join(', '));
      renderValidate(checkTarget);
      $('#validateScrim').classList.add('show');
      return;
    }
  }

  /* Deactivating a branch that still has real departments/rooms/staff/doctors/bookings tied to
     it is guarded by a dependency review, same shape as doctors-staff.js's hasStaffDeps/
     showStaffImpactModal · reusing item.deps, the same numbers the Dependencies tab already
     shows, not invented data. Moving to Draft/Active never needs the guardrail. */
  if(editingId){
    const item = BRANCHES.find(x=>x.id===editingId);
    if(payload.status==='inactive' && item.status!=='inactive' && hasBranchDeps(item)){
      showBranchImpactModal(item, payload, forceDraft);
      return;
    }
  }
  commitBranchSave(payload, forceDraft);
}
function commitBranchSave(payload, forceDraft){
  if(editingId){
    const item = BRANCHES.find(x=>x.id===editingId);
    payload.deps = item.deps;
    Object.assign(item, payload);
    (item.history=item.history||[]).unshift({date:TODAY, by:ME, action: forceDraft ? 'Saved as draft' : 'Details updated'});
    toast(forceDraft ? 'Saved as draft' : 'Branch updated');
  } else {
    const created = Object.assign({id:'br-'+Date.now(), deps:{departments:0,rooms:0,staff:0,activeDoctors:0,futureBookings:0},
      dayBlocks:draftItem.dayBlocks||[], staffShifts:draftItem.staffShifts||[], holidays:draftItem.holidays||[],
      history:[{date:TODAY, by:ME, action:'Branch created'}]}, payload);
    BRANCHES.push(created);
    toast(forceDraft ? 'Saved as draft' : 'Branch added');
  }
  closeDrawer();
  renderStats(); applyFilters();
}
function hasBranchDeps(item){
  return !!item.deps && Object.values(item.deps).some(v=>v>0);
}
function branchDepRowsHtml(item){
  const d = item.deps||{};
  const rows = [['Departments',d.departments],['Rooms',d.rooms],['Staff',d.staff],['Active doctors',d.activeDoctors],['Future bookings',d.futureBookings]];
  return rows.map(([l,v])=>'<div class="deprow"><span>'+l+'</span><b'+(!v?' class="zero"':'')+'>'+(v||0)+'</b></div>').join('');
}
let impactBranchCtx = null;
function showBranchImpactModal(item, payload, forceDraft){
  impactBranchCtx = {payload, forceDraft};
  $('#iTitle').textContent = 'Deactivate ' + item.name + '?';
  $('#iBody').innerHTML = '<p class="dep-intro">Deactivating this branch affects:</p>' + branchDepRowsHtml(item);
  $('#iFootHint').innerHTML = '<b>Past records keep their history.</b> Departments, rooms, staff and bookings tied to this branch stop taking new activity. Reassign or wind them down first if that is not intended.';
  $('#iScrim').classList.add('show');
}
function closeBranchImpactModal(){ $('#iScrim').classList.remove('show'); impactBranchCtx = null; }
$('#iCancel').addEventListener('click', closeBranchImpactModal);
$('#iContinue').addEventListener('click', ()=>{
  const ctx = impactBranchCtx; if(!ctx){ closeBranchImpactModal(); return; }
  closeBranchImpactModal();
  commitBranchSave(ctx.payload, ctx.forceDraft);
});
$('#iScrim').addEventListener('click', e=>{ if(e.target.id==='iScrim') closeBranchImpactModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#iScrim').classList.contains('show')) closeBranchImpactModal(); });
$('#dSave').addEventListener('click', ()=>saveBranch(false));
$('#dSaveDraft').addEventListener('click', ()=>saveBranch(true));

/* ---------- boot ---------- */
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

