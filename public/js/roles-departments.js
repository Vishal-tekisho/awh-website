document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ini = n => n.replace(/^Dr\.?\s*/,'').split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();

/* Roles & Permissions management moved to Users, Roles & Permissions (user-onboard.html) —
   this screen now only manages Departments. */

/* ================= DEPARTMENTS ================= */
const DEFAULT_RULES = () => ({slot:15, max:30, adv:'15 days'});

/* current-branch context switcher list · shared by the toolbar branch-picker */
const CTX_BRANCHES = ['Main Campus','OPD Annexe','Madhurawada Branch'];

/* branch-level default operating hours · a department's own hours are INHERITED from
   here unless the department explicitly overrides them (see hoursOverride below) */
const BRANCH_HOURS = {
  'Main Campus':        {from:'08:00', to:'20:00'},
  'OPD Annexe':          {from:'09:00', to:'18:00'},
  'Madhurawada Branch':  {from:'09:00', to:'17:00'}
};

/* Unit Type: a top-level category plus a configured subtype list per category */
const UNIT_TYPE_SUBTYPES = {
  'Clinical':       ['OP Unit','Treatment Unit','Procedure Unit','Short Stay','Lab'],
  'Administrative': ['Admin Office','Records & MRD','Front Office'],
  'Support':        ['Reception','Pharmacy','Stores']
};


/* Supported Services · mock active-service catalogue for a wound-care clinic */
const SERVICE_OPTIONS = [
  'Initial Consultation','Follow-up Review','Wound Dressing','Debridement','Compression Therapy',
  'Negative Pressure Wound Therapy (NPWT)','Diabetic Foot Screening','Wound Culture & Swab',
  'Skin Grafting Assessment','Offloading & Orthotic Fitting','Nutrition Counselling','Physiotherapy Session',
  'Hyperbaric Oxygen Therapy (HBOT)','Ozone Therapy','Laser Wound Therapy','Vascular Doppler Study',
  'Ankle-Brachial Index (ABI) Test','Toe-Brachial Index (TBI) Test','Biothesiometry','Sensory Nerve Testing',
  'Gait Analysis','Foot Scan & Pressure Mapping','Pain Management Consultation','Dry Needling',
  'Shockwave Therapy','Ultrasound Therapy','IFT / TENS Therapy','Manual Lymphatic Drainage','Cupping Therapy',
  'Platelet-Rich Plasma (PRP) Injection','Fat Grafting Procedure','Placenta Extract Injection',
  'IV Infusion Therapy','Intramuscular Injection','Foley Catheter Insertion','Suture Removal',
  'Cast Application','Cast Removal','ECG','2D Echo','Blood Sugar Screening','HbA1c Test',
  'Wound Photography Documentation','Diet & Nutrition Plan Review','Pre-Operative Assessment',
  'Post-Operative Review','Minor Procedure / Excision','Vaccination','Health Check-up Package','Tele-consultation'
];

/* Assignable staff · not doctors alone; a department (Reception, Pharmacy, Records & MRD, …) is
   commonly staffed by non-clinical roles too, so each entry carries its role for the picker/pill/head list. */
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
const staffRole = n => (STAFF_OPTIONS.find(s => s.n===n) || {}).role || '';

const hhmm = v => { const [h,m] = v.split(':').map(Number);
  return ((h%12)||12) + ':' + String(m).padStart(2,'0') + ' ' + (h<12?'AM':'PM'); };

/* effective working hours for a department: its own override if set, else the parent branch's hours —
   never silently duplicated into the record when not overridden */
function effectiveHours(d){
  if(d.hoursOverride && d.hFrom && d.hTo) return {from:d.hFrom, to:d.hTo};
  return BRANCH_HOURS[d.parentBranch] || BRANCH_HOURS[CTX_BRANCHES[0]];
}
const formatHours = d => { const h = effectiveHours(d); return hhmm(h.from) + ' – ' + hhmm(h.to); };
const deptMeta = d => esc(d.code) + ' · ' + esc(d.unitCat) + ' · ' + esc(d.unitSub);
const parentDeptName = code => { const p = DEPS.find(x=>x.code===code); return p ? p.n : code; };
const STATUS_CHIP = { Active:'ok', Draft:'warn', Inactive:'mut' };
const statusChip = d => '<span class="chip '+(STATUS_CHIP[d.status]||'mut')+'">'+esc(d.status)+'</span>';

const DEPS = [
  {n:'Wound Care',      code:'WC-01',  c:'var(--brand)', unitCat:'Clinical', unitSub:'Treatment Unit', parentBranch:'Main Campus', parentDept:'',      status:'Active',   head:'Dr. Meera Nair',   docs:['Dr. Meera Nair','Dr. Arjun Rao','Dr. Farah Khan','Dr. Kavitha Iyer','Dr. Sanjay Gupta'], hoursOverride:true,  hFrom:'09:00', hTo:'19:00', services:['Initial Consultation','Follow-up Review','Wound Dressing','Debridement','Compression Therapy','Negative Pressure Wound Therapy (NPWT)','Wound Culture & Swab'], location:'Ground floor, near Reception',    order:10, bk:38, rules:DEFAULT_RULES()},
  {n:'Diabetic Foot',   code:'DF-02',  c:'var(--ch2)',   unitCat:'Clinical', unitSub:'OP Unit',        parentBranch:'Main Campus', parentDept:'WC-01', status:'Active',   head:'Dr. Arjun Rao',    docs:['Dr. Arjun Rao','Dr. Meera Nair','Dr. Kavitha Iyer'], hoursOverride:true,  hFrom:'09:30', hTo:'18:00', services:['Initial Consultation','Follow-up Review','Diabetic Foot Screening','Wound Dressing','Offloading & Orthotic Fitting'], location:'Ground floor, Wing B',            order:20, bk:24, rules:DEFAULT_RULES()},
  {n:'Dermatology',     code:'DER-03', c:'var(--ch4)',   unitCat:'Clinical', unitSub:'OP Unit',        parentBranch:'Main Campus', parentDept:'',      status:'Active',   head:'Dr. Kavitha Iyer', docs:['Dr. Kavitha Iyer','Dr. Arjun Rao'], hoursOverride:true,  hFrom:'10:00', hTo:'18:30', services:['Initial Consultation','Follow-up Review','Wound Culture & Swab'], location:'1st floor, near Radiology',       order:30, bk:19, rules:DEFAULT_RULES()},
  {n:'General Surgery', code:'GS-04',  c:'var(--ch3)',   unitCat:'Clinical', unitSub:'Procedure Unit', parentBranch:'Main Campus', parentDept:'',      status:'Active',   head:'Dr. Farah Khan',   docs:['Dr. Farah Khan','Dr. Meera Nair','Dr. Arjun Rao','Dr. Sanjay Gupta'], hoursOverride:true,  hFrom:'08:30', hTo:'17:00', services:['Initial Consultation','Debridement','Skin Grafting Assessment'], location:'2nd floor, OT wing',              order:40, bk:16, rules:DEFAULT_RULES()},
  {n:'Plastic Surgery', code:'PS-05',  c:'var(--ch6)',   unitCat:'Clinical', unitSub:'Procedure Unit', parentBranch:'Main Campus', parentDept:'GS-04', status:'Active',   head:'Dr. Meera Nair',   docs:['Dr. Meera Nair','Dr. Farah Khan'], hoursOverride:true,  hFrom:'11:00', hTo:'16:00', services:['Initial Consultation','Skin Grafting Assessment','Follow-up Review'], location:'2nd floor, OT wing',       order:50, bk:7,  rules:DEFAULT_RULES()},
  {n:'ENT',             code:'ENT-06', c:'var(--chx)',   unitCat:'Clinical', unitSub:'OP Unit',        parentBranch:'Main Campus', parentDept:'',      status:'Inactive', head:'Dr. Sanjay Gupta', docs:['Dr. Sanjay Gupta'], hoursOverride:true,  hFrom:'09:00', hTo:'18:00', services:['Initial Consultation','Follow-up Review'], location:'1st floor, Room 12',                 order:60, bk:0,  rules:DEFAULT_RULES()},
  {n:'Physiotherapy',   code:'PHY-07', c:'var(--ch1)',   unitCat:'Clinical', unitSub:'Treatment Unit', parentBranch:'Main Campus', parentDept:'',      status:'Active',   head:'Dr. Sanjay Gupta', docs:['Dr. Sanjay Gupta','Dr. Kavitha Iyer','Dr. Farah Khan'], hoursOverride:false, hFrom:'',      hTo:'',      services:['Initial Consultation','Physiotherapy Session','Follow-up Review'], location:'Ground floor, rear annexe',  order:70, bk:31, rules:DEFAULT_RULES()},
  {n:'Dietetics',       code:'DT-08',  c:'var(--ch5)',   unitCat:'Clinical', unitSub:'OP Unit',        parentBranch:'Main Campus', parentDept:'',      status:'Active',   head:'Dr. Kavitha Iyer', docs:['Dr. Kavitha Iyer'], hoursOverride:true,  hFrom:'10:00', hTo:'15:00', services:['Initial Consultation','Nutrition Counselling','Follow-up Review'], location:'1st floor, near Cafeteria',      order:80, bk:11, rules:DEFAULT_RULES()},
  {n:'Reception',       code:'REC-09', c:'var(--chx)',   unitCat:'Support',        unitSub:'Reception',       parentBranch:'Main Campus', parentDept:'',      status:'Active',   head:'Priya Nair',       docs:['Priya Nair'],     hoursOverride:true,  hFrom:'08:00', hTo:'20:00', services:[], location:'Ground floor, main entrance',       order:90,  bk:0, rules:DEFAULT_RULES()},
  {n:'Pharmacy',        code:'PHM-10', c:'var(--brand)', unitCat:'Support',        unitSub:'Pharmacy',        parentBranch:'Main Campus', parentDept:'',      status:'Active',   head:'Rohit Shetty',     docs:['Rohit Shetty'],   hoursOverride:true,  hFrom:'09:00', hTo:'19:00', services:[], location:'Ground floor, near Reception',      order:100, bk:0, rules:DEFAULT_RULES()},
  {n:'Records & MRD',   code:'MRD-11', c:'var(--ch1)',   unitCat:'Administrative', unitSub:'Records & MRD',   parentBranch:'Main Campus', parentDept:'',      status:'Active',   head:'Ayesha Khan',      docs:['Ayesha Khan'],    hoursOverride:true,  hFrom:'09:00', hTo:'18:00', services:[], location:'1st floor, admin wing',             order:110, bk:0, rules:DEFAULT_RULES()}
];

/* dependency counts for the deactivation Impact/Dependency Review · derived (mock) from the record itself */
function computeImpact(d){
  return {
    rooms:     Math.max(1, Math.round((d.docs.length||1) * 1.4)),
    staff:     (d.docs.length||0) + 2,
    services:  (d.services||[]).length,
    schedules: Math.max(1, Math.ceil((d.bk||0) / 12)),
    appts:     d.bk || 0
  };
}

const stack = docs => '<span class="avstack">'
  + docs.slice(0,4).map(d => '<span class="mini" title="'+esc(d + (staffRole(d) ? ' · '+staffRole(d) : ''))+'">'+esc(ini(d))+'</span>').join('')
  + (docs.length>4 ? '<span class="mini more">+'+(docs.length-4)+'</span>' : '') + '</span>';

const DEPT_STATUS_FILTER = [{v:'',label:'All statuses'},{v:'Active',label:'Active'},{v:'Draft',label:'Draft'},{v:'Inactive',label:'Inactive'}];
const depStatDD = initFormSelect('depStatWrap','depStatBtn','depStatPanel','depStat', DEPT_STATUS_FILTER, renderDeps);
depStatDD.set('');

function renderDeps(){
  $('#depCountTxt').textContent = DEPS.length + (DEPS.length===1 ? ' department' : ' departments');
  const q = $('#depSearch').value.trim().toLowerCase();
  const stat = depStatDD.get();
  const list = DEPS.filter(d =>
    (!q || (d.n+' '+d.code+' '+d.head+' '+d.docs.join(' ')+' '+d.unitSub+' '+(d.location||'')).toLowerCase().includes(q))
    && (!stat || d.status===stat)
  ).sort((a,b) => (a.order||0) - (b.order||0));

  if(!list.length){
    $('#depGrid').innerHTML = '<div class="empty">'
      + '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
      + '<b>No departments match'+(q?' “'+esc(q)+'”':' your filters')+'</b><span>Try a staff name, clear the status filter, or add a new department.</span></div>';
    return;
  }

  $('#depGrid').innerHTML = list.map((d) => {
    const i = DEPS.indexOf(d);
    return '<div class="dcard'+(d.status==='Inactive'?' off':'')+'" style="--dc:'+d.c+'" data-i="'+i+'">'
    + '<div class="dch2"><span class="dic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M10 21v-6h4v6"/></svg></span>'
    + '<span class="dtx"><b>'+esc(d.n)+' <button class="dedit" data-edit="'+i+'" title="Edit department">'
    +   '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button></b>'
    +   '<span>'+deptMeta(d)+'</span>'
    +   '</span>'
    + statusChip(d) + '</div>'
    + '<div class="dbody">'
    +   '<div class="drow2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span class="lb">Head</span><span class="vl">'+esc(d.head.replace('Dr. ','Dr '))+'</span></div>'
    +   '<div class="drow2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg><span class="lb">Staff</span>'+stack(d.docs)+'</div>'
    +   '<div class="drow2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 3 5 3 5 21 9 21"/><polyline points="15 3 19 3 19 21 15 21"/></svg><span class="lb">Parent</span><span class="vl">'+(d.parentDept ? esc(parentDeptName(d.parentDept)) : '<span style="color:var(--ink-muted);font-weight:600">Top-level</span>')+'</span></div>'
    +   '<div class="drow2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span class="lb">Open hours</span><span class="vl">'+esc(formatHours(d))+(d.hoursOverride?' · Custom':' · Inherited')+'</span></div>'
    + '</div>'
    + '</div>';
  }).join('');
}

$('#depSearch').addEventListener('input', renderDeps);

$('#depGrid').addEventListener('click', e => {
  const ed = e.target.closest('[data-edit]');
  if(ed){ openEditDrawer(+ed.dataset.edit); return; }
});

renderDeps();

/* ---------------- DEPARTMENT DRAWER (Add / Edit / Booking rules) ---------------- */

/* custom dropdowns for ndHead / ndSlot / ndWin (and the newer department fields) —
   native <select> popups can't be styled. onChange is optional (only used where a live side-effect is needed).
   `options` accepts either an array of strings (value===label, original behaviour, used unchanged by
   Booking rules' ndSlot/ndWin) or an array of {v,label} objects (used by fields whose stored value
   differs from what's shown, e.g. Parent department). setOptions() lets a field's choices be rebuilt
   later (category-dependent Unit subtype, self/descendant-excluding Parent department). */
function initFormSelect(wrapId, btnId, panelId, hiddenId, options, onChange){
  const root = $('#'+wrapId), btn = $('#'+btnId), panel = $('#'+panelId), hidden = $('#'+hiddenId);
  let norm = [];
  const rebuild = opts => {
    norm = opts.map(o => (o && typeof o==='object') ? o : {v:o, label:o});
    // o.depth (tree-select options only, e.g. Parent department) draws a real connector icon +
    // indent instead of a text character glued onto the label · renders reliably in every font,
    // unlike the old "↳" glyph that showed as a broken tofu box.
    panel.innerHTML = norm.map(o => {
      const depth = o.depth||0;
      const connector = depth ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="color:var(--ink-muted);flex:none;margin-right:5px"><path d="M6 3v10a4 4 0 0 0 4 4h8"/></svg>' : '';
      const style = depth ? ' style="display:flex;align-items:center;padding-left:'+(10+depth*16)+'px"' : '';
      return '<button type="button" class="fselopt" data-v="'+esc(o.v)+'"'+style+'>'+connector+esc(o.label)+'</button>';
    }).join('');
  };
  rebuild(options);
  const setVal = v => {
    const m = norm.find(o => o.v===v) || norm[0] || {v:'',label:''};
    hidden.value = m.v; btn.textContent = m.label;
    $$('#'+panelId+' .fselopt').forEach(x => x.classList.toggle('on', x.dataset.v===m.v));
  };
  panel.addEventListener('click', e => {
    const b = e.target.closest('.fselopt'); if(!b) return;
    setVal(b.dataset.v);
    root.classList.remove('open');
    if(onChange) onChange(b.dataset.v);
  });
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const wasOpen = root.classList.contains('open');
    $$('.fsel').forEach(x => x.classList.remove('open'));
    if(!wasOpen) root.classList.add('open');
  });
  return { set:setVal, get:() => hidden.value, setOptions: rebuild };
}
document.addEventListener('click', () => $$('.fsel').forEach(x => x.classList.remove('open')));

// options mirror STAFF_OPTIONS (not doctors only) · a Reception/Pharmacy/Records department's head
// is staff too, and the stored value stays a plain name so existing d.head strings keep working.
const ndHeadSel = initFormSelect('ndHeadWrap','ndHeadBtn','ndHeadPanel','ndHead',
  STAFF_OPTIONS.map(s => ({v:s.n, label:s.n+' · '+s.role})));
/* stored value stays the bare number (rules.slot is numeric everywhere below); only the shown
   label carries the unit, so the field reads "15 min" instead of a bare "15" under a "(min)" label. */
const ndSlotSel = initFormSelect('ndSlotWrap','ndSlotBtn','ndSlotPanel','ndSlot', ['10','15','20','30','45'].map(v=>({v, label:v+' min'})));
const ndWinSel  = initFormSelect('ndWinWrap','ndWinBtn','ndWinPanel','ndWin', ['7 days','15 days','30 days','60 days','90 days']);

/* ---- new department fields: Unit type, Parent branch, Parent department, Status ---- */
/* Subtypes are Admin-configured, not hard-coded for good · the dropdown itself lets the Admin add
   a new subtype to a category on the spot, per the "configuration-first, don't hard-code" rule. */
function appendAddSubtypeRow(cat){
  const panel = $('#ndUnitSubPanel');
  const row = document.createElement('div');
  row.className = 'fseladdrow';
  row.innerHTML = '<input type="text" placeholder="Add a new '+esc(cat)+' subtype…" id="ndUnitSubNewInput">'
    + '<button type="button" id="ndUnitSubAddBtn" title="Add subtype"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>';
  panel.appendChild(row);
  const input = $('#ndUnitSubNewInput');
  const commit = () => {
    const val = input.value.trim();
    if(!val) return;
    if(!UNIT_TYPE_SUBTYPES[cat].some(s => s.toLowerCase()===val.toLowerCase())) UNIT_TYPE_SUBTYPES[cat].push(val);
    updateUnitSubOptions(cat);
    ndUnitSubSel.set(val);
    toast('"'+val+'" added to '+cat+' subtypes');
  };
  $('#ndUnitSubAddBtn').addEventListener('click', e => { e.stopPropagation(); commit(); });
  input.addEventListener('click', e => e.stopPropagation());
  input.addEventListener('keydown', e => { if(e.key==='Enter'){ e.preventDefault(); commit(); } });
}
function updateUnitSubOptions(cat){
  const opts = UNIT_TYPE_SUBTYPES[cat] || [];
  ndUnitSubSel.setOptions(opts);
  ndUnitSubSel.set(opts[0] || '');
  appendAddSubtypeRow(cat);
}
const ndUnitCatSel = initFormSelect('ndUnitCatWrap','ndUnitCatBtn','ndUnitCatPanel','ndUnitCat',
  Object.keys(UNIT_TYPE_SUBTYPES), cat => updateUnitSubOptions(cat));
const ndUnitSubSel = initFormSelect('ndUnitSubWrap','ndUnitSubBtn','ndUnitSubPanel','ndUnitSub', UNIT_TYPE_SUBTYPES['Clinical']);
appendAddSubtypeRow('Clinical');

/* Parent branch is read-only in this form · set from whichever branch the page's header switcher
   (ctxBrDD) is currently on when adding, or from the record's own branch when editing. Changing a
   department's branch is not something a form dropdown should silently allow. */
function setNdBranch(v){ $('#ndBranchFixedLabel').textContent = v; $('#ndBranch').value = v; updateHoursInherit(); }

/* Parent department simulates a tree-select: options are rebuilt on every drawer open, excluding the
   record being edited and all of its own descendants (a department can't be parented under itself/its child) */
function getDescendantCodes(code, list){
  const kids = list.filter(d => d.parentDept===code).map(d => d.code);
  return kids.concat(...kids.map(k => getDescendantCodes(k, list)));
}
function rebuildParentDeptOptions(excludeIdx){
  const self = excludeIdx>=0 ? DEPS[excludeIdx] : null;
  const excludeCodes = new Set(self ? [self.code, ...getDescendantCodes(self.code, DEPS)] : []);
  const eligible = DEPS.filter(d => !excludeCodes.has(d.code));
  const eligibleCodes = new Set(eligible.map(d => d.code));
  const byParent = {};
  eligible.forEach(d => {
    const p = eligibleCodes.has(d.parentDept) ? d.parentDept : '';
    (byParent[p] = byParent[p] || []).push(d);
  });
  const opts = [{v:'', label:'None (top-level)'}];
  (function walk(parentCode, depth){
    (byParent[parentCode] || []).forEach(d => {
      opts.push({v:d.code, label:d.code + ' · ' + d.n, depth});
      walk(d.code, depth + 1);
    });
  })('', 0);
  ndParentDeptSel.setOptions(opts);
}
const ndParentDeptSel = initFormSelect('ndParentDeptWrap','ndParentDeptBtn','ndParentDeptPanel','ndParentDept', [{v:'',label:'None (top-level)'}]);

/* Status: segmented toggle, same pattern used everywhere else in the app */
function segSet(segId, v){ $$('#'+segId+' button').forEach(b => b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b = $('#'+segId+' button.on'); return b ? b.dataset.v : null; }
const ndStatusSel = {
  set: v => segSet('ndStatusSeg', v),
  get: () => segGet('ndStatusSeg')
};
$('#ndStatusSeg').addEventListener('click', e => { const b = e.target.closest('button'); if(b) segSet('ndStatusSeg', b.dataset.v); });

/* Operating hours inheritance display + override toggle */
function updateHoursInherit(){
  const branch = $('#ndBranch').value || CTX_BRANCHES[0];
  const bh = BRANCH_HOURS[branch] || BRANCH_HOURS[CTX_BRANCHES[0]];
  $('#ndHoursInheritVal').textContent = hhmm(bh.from) + '–' + hhmm(bh.to);
  $('#ndHoursInheritBranch').textContent = branch;
}
function syncHoursUI(){
  const on = $('#ndHoursOverride').checked;
  $('#ndHoursInherit').style.display = on ? 'none' : 'block';
  $('#ndHoursCustom').style.display = on ? 'grid' : 'none';
}
$('#ndHoursOverride').addEventListener('change', syncHoursUI);

/* Shared closed-dropdown multi-select: button + floating checklist panel with its own search box,
   selected ones shown as removable chips under the button. Used for any option set too long to leave
   permanently expanded (Supported Services, Assigned staff, …) · options can be plain strings, or
   {v,label,sub} objects when each option needs a secondary line (e.g. a person's role under their name).
   Reuses the .fsel open/close wiring initFormSelect() already sets up. */
function initMultiSelect(wrapId, btnId, panelId, listId, searchId, emptyId, chipsId, options, noun){
  const root = $('#'+wrapId), btn = $('#'+btnId), panel = $('#'+panelId),
        list = $('#'+listId), search = $('#'+searchId), empty = $('#'+emptyId), chips = $('#'+chipsId);
  const norm = options.map(o => (o && typeof o==='object') ? o : {v:o, label:o});
  let selected = [];
  list.innerHTML = norm.map(o => '<button type="button" class="mopt" data-v="'+esc(o.v)+'" data-q="'+esc((o.label+' '+(o.sub||'')).toLowerCase())+'">'
    + '<span class="mck"></span><span class="mlabel">'+esc(o.label)+(o.sub?'<i>'+esc(o.sub)+'</i>':'')+'</span></button>').join('');
  const refresh = () => {
    $$('#'+listId+' .mopt').forEach(b => b.classList.toggle('on', selected.includes(b.dataset.v)));
    chips.innerHTML = selected.map(v => '<span class="mchip">'+esc((norm.find(o=>o.v===v)||{label:v}).label)+'<button type="button" data-v="'+esc(v)+'" title="Remove">&times;</button></span>').join('');
    btn.textContent = selected.length ? selected.length+' '+noun+' selected' : 'Select '+noun;
  };
  refresh();
  list.addEventListener('click', e => {
    const b = e.target.closest('.mopt'); if(!b) return;
    const i = selected.indexOf(b.dataset.v);
    if(i===-1) selected.push(b.dataset.v); else selected.splice(i,1);
    refresh();
  });
  chips.addEventListener('click', e => {
    const b = e.target.closest('button[data-v]'); if(!b) return;
    e.stopPropagation();
    selected = selected.filter(v => v!==b.dataset.v);
    refresh();
  });
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    $$('#'+listId+' .mopt').forEach(b => {
      const match = !q || b.dataset.q.includes(q);
      b.style.display = match ? '' : 'none';
      if(match) shown++;
    });
    empty.style.display = shown ? 'none' : 'block';
  });
  panel.addEventListener('click', e => e.stopPropagation());
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const wasOpen = root.classList.contains('open');
    $$('.fsel').forEach(x => x.classList.remove('open'));
    if(!wasOpen){
      root.classList.add('open');
      search.value = '';
      $$('#'+listId+' .mopt').forEach(b => b.style.display = '');
      empty.style.display = 'none';
      search.focus();
    }
  });
  return { get: () => selected.slice(), set: arr => { selected = (arr||[]).filter(v => norm.some(o=>o.v===v)); refresh(); } };
}
const ndServicesDD = initMultiSelect('ndServicesWrap','ndServicesBtn','ndServicesPanel','ndServicesList','ndServicesSearch','ndServicesEmpty','ndServicesChips', SERVICE_OPTIONS, 'supported services');
const ndDocsDD = initMultiSelect('ndDocsWrap','ndDocsBtn','ndDocsPanel','ndDocsList','ndDocsSearch','ndDocsEmpty','ndDocsChips',
  STAFF_OPTIONS.map(s => ({v:s.n, label:s.n, sub:s.role})), 'staff');

/* new departments cycle through this palette automatically · colour is no longer admin-picked */
const AUTO_COLOURS = ['var(--brand)','var(--ch1)','var(--ch2)','var(--ch3)','var(--ch4)','var(--ch5)','var(--ch6)','var(--brand-2)','var(--chx)'];

let editIndex = -1;       // -1 = adding a new department, else index into DEPS being edited
let drawerMode = 'add';   // 'add' | 'edit' · booking rules fields live at the end of both forms, no separate mode

const openDrawer = () => { $('#drawer').classList.add('show'); $('#scrim').classList.add('show');
  $('#drawer').setAttribute('aria-hidden','false'); $('#ndName').focus(); };
const closeDrawer = () => { $('#drawer').classList.remove('show'); $('#scrim').classList.remove('show');
  $('#drawer').setAttribute('aria-hidden','true'); editIndex = -1; setDrawerMode('add'); };

function setDrawerMode(mode, deptName){
  drawerMode = mode;
  if(mode==='edit'){
    $('#drawTitle').textContent = 'Edit department';
    $('#drawSub').textContent = 'Update team, hours and booking rules for ' + deptName;
    $('#drawCreate').textContent = 'Save changes';
  } else {
    $('#drawTitle').textContent = 'Add department';
    $('#drawSub').textContent = 'Set up the team, hours and booking rules';
    $('#drawCreate').textContent = 'Create department';
  }
}

function fillDeptForm(d){
  $('#ndName').value = d.n;
  $('#ndCode').value = d.code;
  ndUnitCatSel.set(d.unitCat);
  updateUnitSubOptions(d.unitCat);
  ndUnitSubSel.set(d.unitSub);
  setNdBranch(d.parentBranch);
  rebuildParentDeptOptions(editIndex);
  ndParentDeptSel.set(d.parentDept || '');
  ndStatusSel.set(d.status);
  ndHeadSel.set(d.head);
  ndDocsDD.set(d.docs || []);
  const bh = BRANCH_HOURS[d.parentBranch] || BRANCH_HOURS[CTX_BRANCHES[0]];
  $('#ndHoursOverride').checked = !!d.hoursOverride;
  $('#ndFrom').value = d.hoursOverride ? d.hFrom : bh.from;
  $('#ndTo').value = d.hoursOverride ? d.hTo : bh.to;
  updateHoursInherit();
  syncHoursUI();
  ndServicesDD.set(d.services || []);
  $('#ndLocation').value = d.location || '';
}
function fillRulesForm(d){
  ndSlotSel.set(String(d.rules.slot));
  $('#ndMax').value = d.rules.max;
  ndWinSel.set(d.rules.adv);
}

function openEditDrawer(i){
  editIndex = i;
  fillDeptForm(DEPS[i]);
  fillRulesForm(DEPS[i]);
  setDrawerMode('edit', DEPS[i].n);
  openDrawer();
}

$('#openDep').addEventListener('click', () => {
  editIndex = -1;
  $('#ndName').value = '';
  $('#ndCode').value = '';
  ndUnitCatSel.set('Clinical');
  updateUnitSubOptions('Clinical');
  setNdBranch(ctxBrDD.value || CTX_BRANCHES[0]);
  rebuildParentDeptOptions(-1);
  ndParentDeptSel.set('');
  ndStatusSel.set('Draft');
  ndHeadSel.set('Dr. Meera Nair');
  ndDocsDD.set([STAFF_OPTIONS[0].n]);
  $('#ndHoursOverride').checked = false;
  $('#ndFrom').value = '09:00'; $('#ndTo').value = '18:00';
  updateHoursInherit();
  syncHoursUI();
  ndServicesDD.set([]);
  $('#ndLocation').value = '';
  fillRulesForm({rules:DEFAULT_RULES()});
  setDrawerMode('add');
  openDrawer();
});
$('#drawClose').addEventListener('click', closeDrawer);
$('#drawCancel').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => {
  if(e.key==='Escape') closeDrawer();
});

/* ---- Deactivation Impact / Dependency Review · shown instead of a silent status flip
   whenever an edit transitions a department's status into Inactive ---- */
let pendingStatusSave = null;
function openImpact(d, onContinue){
  const im = computeImpact(d);
  $('#impactDeptName').textContent = d.n;
  $('#impactBody').innerHTML = [
    ['Rooms mapped', im.rooms],
    ['Staff mapped', im.staff],
    ['Services mapped', im.services],
    ['Schedules using this unit', im.schedules],
    ['Future appointments / sessions', im.appts]
  ].map(([lb,v]) => '<div class="ibrow">'+esc(lb)+' <b class="num">'+v+'</b></div>').join('');
  pendingStatusSave = onContinue;
  $('#impactScrim').classList.add('show');
  $('#impactBox').classList.add('show');
  $('#impactBox').setAttribute('aria-hidden','false');
}
function closeImpact(){
  $('#impactScrim').classList.remove('show');
  $('#impactBox').classList.remove('show');
  $('#impactBox').setAttribute('aria-hidden','true');
  pendingStatusSave = null;
}
$('#impactCancel').addEventListener('click', closeImpact);
$('#impactScrim').addEventListener('click', closeImpact);
$('#impactView').addEventListener('click', () => toast('Opening affected records…'));
$('#impactContinue').addEventListener('click', () => {
  const run = pendingStatusSave;
  closeImpact();
  if(run) run();
});

$('#drawCreate').addEventListener('click', () => {
  const name = $('#ndName').value.trim();
  if(!name){ $('#ndName').focus(); toast('Department name is required'); return; }
  const code = $('#ndCode').value.trim();
  if(!code){ $('#ndCode').focus(); toast('Code is required'); return; }
  const parentBranch = $('#ndBranch').value;
  if(!parentBranch){ toast('Parent branch is required'); return; }
  const dupIdx = DEPS.findIndex((d,i) => i!==editIndex && d.parentBranch===parentBranch && d.code.toLowerCase()===code.toLowerCase());
  if(dupIdx!==-1){ $('#ndCode').focus(); toast('Code "'+code+'" is already used in '+parentBranch+' by '+DEPS[dupIdx].n); return; }
  const docs = ndDocsDD.get();
  if(!docs.length){ toast('Assign at least one staff member'); return; }

  const unitCat = ndUnitCatSel.get();
  const unitSub = ndUnitSubSel.get();
  const parentDept = ndParentDeptSel.get();
  const status = ndStatusSel.get();
  const head = ndHeadSel.get();
  const hoursOverride = $('#ndHoursOverride').checked;
  const hFrom = hoursOverride ? $('#ndFrom').value : '';
  const hTo = hoursOverride ? $('#ndTo').value : '';
  const services = ndServicesDD.get();
  const location = $('#ndLocation').value.trim();
  // no manual "display order" field · edits keep their existing position, new departments append to the end
  const order = drawerMode==='edit' ? DEPS[editIndex].order : (Math.max(0, ...DEPS.map(d => d.order||0)) + 10);

  const rules = { slot:+$('#ndSlot').value, max:+$('#ndMax').value, adv:$('#ndWin').value };
  const payload = { n:name, code, unitCat, unitSub, parentBranch, parentDept, status, head, docs,
    hoursOverride, hFrom, hTo, services, location, order, rules };

  if(drawerMode==='edit'){
    const prevStatus = DEPS[editIndex].status;
    const applyEdit = () => {
      Object.assign(DEPS[editIndex], payload); // colour and bookings count untouched
      renderDeps();
      closeDrawer();
      toast(name + ' updated');
    };
    if(status==='Inactive' && prevStatus!=='Inactive'){
      openImpact(DEPS[editIndex], applyEdit);
    } else {
      applyEdit();
    }
  } else {
    const c = AUTO_COLOURS[DEPS.length % AUTO_COLOURS.length];
    DEPS.push(Object.assign({ c, bk:0 }, payload));
    $('#depSearch').value = '';
    renderDeps();
    closeDrawer();
    toast(name + ' created · ' + $('#ndSlot').value + ' min slots, max ' + $('#ndMax').value + '/day');
  }
});

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
const ctxBrDD = makeDropdown('ctxBr', v => toast('Switched to ' + v));
ctxBrDD.setOptions(CTX_BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.select('Main Campus','Main Campus');

