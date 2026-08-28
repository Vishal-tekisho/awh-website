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
const ini=n=>n.replace('Dr. ','').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
const esc=s=>(s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
/* splits a stored full name like "Dr. Ayesha Rao" back into first/middle/last for editing */
function splitName(full){
  let n=(full||'').trim().replace(/^Dr\.\s*/i,'');
  const parts=n.split(' ').filter(Boolean);
  const first=parts.shift()||'';
  const last=parts.length?parts.pop():'';
  return {first, middle:parts.join(' '), last};
}
/* rebuilds the full name from first/middle/last, adding the Dr. prefix for doctors */
function composedName(){
  const cat=$('#catPick button.on').dataset.c;
  const full=[$('#fFirst').value.trim(),$('#fMiddle').value.trim(),$('#fLast').value.trim()].filter(Boolean).join(' ');
  return cat==='doctor' && full ? 'Dr. '+full : full;
}

/* =====================================================================
   CONTENT · KVNN_UI_Delivery_Plan4.xlsx row 7 + BRD epic 02.3.
   Real people match exactly what's already linked/unlinked on the
   Users, Roles & Permissions screen, so both screens stay consistent:
     • Dr. KVNN Santosh Murthy · Duty Doctor · 16 services mapped (xlsx)
     • Dr. Hrishikesh Korada · Physical Medicine & Rehabilitation · 3 services mapped (xlsx)
     • Dr. Harsh Atul / Dr. Raghavendra / Dr. Sameera · "doctors without a roster,
       cannot be booked" per the Config & Readiness dashboard · shown here as
       Missing mapping (0 services), matching that exact count of 3.
     • Sohela Farheen, Nida Firdous, Hanshith Reddy · real non-doctor accounts
       from the xlsx Activity Log reference, already linked to logins.
   Registration numbers / phone / email are placeholders · no source doc gives
   real values; format itself is Admin-configurable per BRD's Reference &
   Identifiers area.
===================================================================== */
const DEPARTMENTS=['Orthotics & Prosthetics','Consulting','ECG','IPD','FOOTRYX Physiotherapy','Nursing','OPD','Pharmacy','Admission','Laboratory','Administration'];
const BRANCHES=['Main Campus','OPD Annexe','Madhurawada Branch'];

/* Added below (additive): jobTitle, cat (Employee Type · doubles as the
   role-category filter value), empMode (Employment Type), addDept
   (Additional Departments · Branch is fixed to the header context, not multi-picked), acct (Application User status),
   subSpec + procedures (doctor-only · sub-specialty & procedure capabilities). */
const STAFF=[
  {n:'Rajeev Malhotra',id:'EMP-0001',kind:'staff',role:'Hospital Administrator',qual:'',reg:'',type:'',dept:'Administration',br:'Main Campus',ph:'98450 00121',em:'rajeev.malhotra@awhclinics.in',services:null,status:'active',jobTitle:'Hospital Administrator',cat:'admin',empMode:'Full-time',addDept:[],joinDate:'2018-04-02',acct:'active'},
  {n:'Dr. KVNN Santosh Murthy',id:'EMP-0102',kind:'doctor',role:'Duty Doctor',qual:'MBBS, MD',reg:'TSMC/10234/2011',type:'Regular',dept:'Consulting',br:'Main Campus',ph:'98421 55670',em:'kvnn.santosh@awhclinics.in',services:16,status:'active',jobTitle:'Duty Doctor',cat:'doctor',empMode:'Full-time',addDept:['OPD'],joinDate:'2016-07-15',acct:'active',subSpec:['Chronic Wound Care','Diabetic Foot Care'],procedures:5},
  {n:'Dr. Hrishikesh Korada',id:'EMP-0115',kind:'doctor',role:'Physical Medicine & Rehabilitation',qual:'MBBS, MD (PMR)',reg:'TSMC/11876/2014',type:'Regular',dept:'Consulting',br:'Main Campus',ph:'99089 34521',em:'hrishikesh.korada@awhclinics.in',services:3,status:'active',jobTitle:'Consultant',cat:'doctor',empMode:'Full-time',addDept:[],joinDate:'2018-11-05',acct:'active',subSpec:['Post-surgical Wounds'],procedures:2},
  {n:'Dr. Harsh Atul',id:'EMP-0210',kind:'doctor',role:'Doctor',qual:'MBBS',reg:'TSMC/13021/2017',type:'Regular',dept:'Consulting',br:'Main Campus',ph:'90142 55671',em:'harsh.atul@awhclinics.in',services:0,status:'missing',jobTitle:'Duty Doctor',cat:'doctor',empMode:'Full-time',addDept:[],joinDate:'2021-06-01',acct:'not_created',subSpec:[],procedures:0},
  {n:'Dr. Raghavendra',id:'EMP-0211',kind:'doctor',role:'Doctor',qual:'MBBS',reg:'TSMC/13022/2017',type:'Regular',dept:'Consulting',br:'Main Campus',ph:'90142 55672',em:'raghavendra@awhclinics.in',services:0,status:'missing',jobTitle:'Duty Doctor',cat:'doctor',empMode:'Full-time',addDept:[],joinDate:'2021-06-01',acct:'not_created',subSpec:[],procedures:0},
  {n:'Dr. Sameera',id:'EMP-0212',kind:'doctor',role:'Doctor',qual:'MBBS',reg:'TSMC/13023/2017',type:'Regular',dept:'OPD',br:'OPD Annexe',ph:'90142 55673',em:'sameera@awhclinics.in',services:0,status:'missing',jobTitle:'Duty Doctor',cat:'doctor',empMode:'Full-time',addDept:[],joinDate:'2022-02-14',acct:'not_created',subSpec:[],procedures:0},
  {n:'Sohela Farheen',id:'EMP-0412',kind:'staff',role:'Receptionist',qual:'',reg:'',type:'',dept:'OPD',br:'Main Campus',ph:'90000 12233',em:'sohela.farheen@awhclinics.in',services:null,status:'active',jobTitle:'Receptionist',cat:'reception',empMode:'Full-time',addDept:[],joinDate:'2019-09-10',acct:'active'},
  {n:'Nida Firdous',id:'EMP-0521',kind:'staff',role:'Front Desk Executive',qual:'',reg:'',type:'',dept:'Admission',br:'OPD Annexe',ph:'91000 55210',em:'nida.firdous@awhclinics.in',services:null,status:'active',jobTitle:'Front Desk Executive',cat:'reception',empMode:'Full-time',addDept:[],joinDate:'2022-03-21',acct:'active'},
  {n:'Hanshith Reddy',id:'EMP-0702',kind:'staff',role:'Lab Technician',qual:'',reg:'',type:'',dept:'Laboratory',br:'Main Campus',ph:'90140 66312',em:'hanshith.reddy@awhclinics.in',services:null,status:'active',jobTitle:'Lab Technician',cat:'lab',empMode:'Full-time',addDept:[],joinDate:'2020-01-20',acct:'active'},
  {n:'Swathi Reddy',id:'EMP-0803',kind:'staff',role:'Staff Nurse',qual:'GNM',reg:'',type:'',dept:'Nursing',br:'Main Campus',ph:'90630 44118',em:'swathi.reddy@awhclinics.in',services:null,status:'active',jobTitle:'Staff Nurse',cat:'nurse',empMode:'Full-time',addDept:[],joinDate:'2017-08-01',acct:'not_created'},
  {n:'Manasa Chowdary',id:'EMP-0804',kind:'staff',role:'Staff Nurse',qual:'B.Sc Nursing',reg:'',type:'',dept:'Nursing',br:'OPD Annexe',ph:'90630 44229',em:'manasa.chowdary@awhclinics.in',services:null,status:'active',jobTitle:'Staff Nurse',cat:'nurse',empMode:'Part-time',addDept:[],joinDate:'2023-05-11',acct:'not_created'},
  {n:'Keerthi Naidu',id:'EMP-0905',kind:'staff',role:'Pharmacist',qual:'B.Pharm',reg:'',type:'',dept:'Pharmacy',br:'Main Campus',ph:'90630 77812',em:'keerthi.naidu@awhclinics.in',services:null,status:'onleave',jobTitle:'Pharmacist',cat:'pharmacy',empMode:'Full-time',addDept:[],joinDate:'2024-01-08',acct:'inactive'},
  {n:'Devendra Rao',id:'EMP-0906',kind:'staff',role:'Stores In-charge',qual:'',reg:'',type:'',dept:'Administration',br:'Madhurawada Branch',ph:'90630 77930',em:'devendra.rao@awhclinics.in',services:null,status:'active',jobTitle:'Stores In-charge',cat:'stores',empMode:'Full-time',addDept:[],joinDate:'2019-12-02',acct:'not_created'},
  {n:'Ravi Teja',id:'EMP-0907',kind:'staff',role:'Transportation Coordinator',qual:'',reg:'',type:'',dept:'Administration',br:'OPD Annexe',ph:'90630 78041',em:'ravi.teja@awhclinics.in',services:null,status:'active',jobTitle:'Transportation Coordinator',cat:'transport',empMode:'Contract',addDept:[],joinDate:'2023-10-16',acct:'not_created'},
  {n:'Naveen Kumar',id:'EMP-0908',kind:'staff',role:'Clinic Manager',qual:'',reg:'',type:'',dept:'Administration',br:'Main Campus',ph:'90630 78152',em:'naveen.kumar@awhclinics.in',services:null,status:'active',jobTitle:'Clinic Manager',cat:'manager',empMode:'Full-time',addDept:['OPD'],joinDate:'2020-06-29',acct:'active'}
];

/* Upcoming appointments per person (what Set On Leave / Deactivate would disrupt) and each record's
   edit history. Seed data keyed by employee id; shown in the impact review and View History popups. */
const APPTS = {
  'EMP-0102': [ {d:'29 Aug 2026', t:'10:00 AM', p:'Ramesh Kumar', s:'Sharp Debridement'}, {d:'29 Aug 2026', t:'11:30 AM', p:'Sunita Devi', s:'Wound VAC Application'}, {d:'01 Sep 2026', t:'09:30 AM', p:'Mohd. Irfan', s:'Foot Scan & Analysis'} ],
  'EMP-0115': [ {d:'30 Aug 2026', t:'04:00 PM', p:'Lakshmi Bai', s:'Gait Analysis'}, {d:'02 Sep 2026', t:'10:30 AM', p:'Arun Prasad', s:'Wound Physio'} ],
  'EMP-0803': [ {d:'29 Aug 2026', t:'09:00 AM', p:'Ramesh Kumar', s:'Dressing session'} ]
};
const apptsOf = s => APPTS[s.id] || [];
const fmtISO = iso => { const d=new Date(iso); return isNaN(d) ? (iso||'—') : d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); };
function historyOf(s){
  if(s.history) return s.history;
  const st = s.status==='onleave' ? 'On Leave' : s.status==='inactive' ? 'Inactive' : 'Active';
  return [
    {when:'26 Aug 2026', who:'Rajeev Malhotra', what:'Status set to ' + st},
    {when:'12 Aug 2026', who:'Rajeev Malhotra', what:'Department set to ' + (s.dept||'—') + (s.br ? ' · ' + s.br : '')},
    {when:fmtISO(s.joinDate), who:'Rajeev Malhotra', what:'Record created' + (s.jobTitle ? ' as ' + s.jobTitle : '')}
  ];
}

const STATUS_META={
  active:  {chip:'ok',label:'Active'},
  onleave: {chip:'warn',label:'On Leave'},
  visiting:{chip:'neutral',label:'Visiting'},
  inactive:{chip:'neutral',label:'Inactive'},
  missing: {chip:'bad',label:'Missing mapping'}
};
/* Application User relationship (profile view · spec §9 "User-account relationship") */
const ACCT_META={active:{chip:'ok',label:'Active'},not_created:{chip:'neutral',label:'Not Created'},inactive:{chip:'bad',label:'Inactive'}};
/* Sub-specialty is Admin-configured, not hard-coded · the picker's own panel lets the Admin add a
   new sub-specialty inline (same "add new option" pattern as Equipment's Category dropdown). */
let SUBSPECS=['Diabetic Foot Care','Chronic Wound Care','Pressure Ulcers','Post-surgical Wounds','Vascular Ulcers','Reconstructive Surgery'];

/* Employee Type is Admin-configured, not hard-coded · same "add new option" pattern as
   Sub-specialty / Room Type. Stored on the record's existing `cat` field (which already
   doubles as "doctor" for doctors vs. the specific staff type for everyone else). */
let EMP_TYPES={nurse:'Nurse',reception:'Reception',lab:'Lab',pharmacy:'Pharmacy',stores:'Stores',admin:'Admin',manager:'Manager',transport:'Transportation'};

/* ---- generic custom-dropdown driver (same as user-onboard.html) ---- */
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
/* Branch is read-only in this form · set from whichever branch the page's header switcher
   (ctxBrDD) is currently on when adding, or from the record's own branch when editing. */
function setDBranch(v){ $('#dBranchFixedLabel').textContent = v; $('#dBranch').value = v; }

/* ---- multi-select checklist with search ("multi-select chips") · Sub-specialty ---- */
function initMchk(rootId, btnId, panelId, chipsId, vocab, placeholder, searchable, onChange){
  const root=$('#'+rootId), btn=$('#'+btnId), panel=$('#'+panelId), chipsEl=$('#'+chipsId);
  let selected = [];
  let extraHTML = '', onRerender = null;
  const searchHTML = searchable ? '<input type="text" class="mchk-search" placeholder="Search…" id="'+panelId+'Search">' : '';
  const renderChips = ()=>{
    chipsEl.innerHTML = selected.map(v=>'<span class="mchip">'+esc(vocab[v]||v)+'<button type="button" data-rm="'+esc(v)+'">&times;</button></span>').join('');
    btn.textContent = selected.length ? selected.length+' selected' : placeholder;
  };
  const renderPanel = ()=>{
    panel.innerHTML = searchHTML + Object.entries(vocab).map(([v,l])=>
      '<label class="mchk-opt"><input type="checkbox" value="'+esc(v)+'" '+(selected.includes(v)?'checked':'')+'><span>'+esc(l)+'</span></label>').join('') + extraHTML;
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
const subSpecMchk = initMchk('subSpecMchk','subSpecBtn','subSpecPanel','subSpecChips', Object.fromEntries(SUBSPECS.map(s=>[s,s])), 'Select sub-specialties…', true);
/* Department is a real, admin-managed list (Departments & Units screen) · no "add new" row here;
   adding one would silently create a department that doesn't actually exist anywhere else. */
const deptMchk = initMchk('deptMchk','deptBtn','deptPanel','deptChips', Object.fromEntries(DEPARTMENTS.map(d=>[d,d])), 'Select departments…', true, validateForm);
(function setupSubSpecAddRow(){
  const rowHTML = '<div class="fseladdrow"><input type="text" placeholder="Add a new sub-specialty…" id="subSpecNewInput">'
    + '<button type="button" id="subSpecAddBtn" title="Add sub-specialty"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div>';
  const bind = () => {
    const input = $('#subSpecNewInput'), addBtn = $('#subSpecAddBtn');
    if(!input || !addBtn) return;
    const commit = () => {
      const label = input.value.trim();
      if(!label) return;
      if(!SUBSPECS.some(s=>s.toLowerCase()===label.toLowerCase())) SUBSPECS.push(label);
      subSpecMchk.setVocab(Object.fromEntries(SUBSPECS.map(s=>[s,s])));
      toast('"'+label+'" added to sub-specialties');
    };
    addBtn.addEventListener('click', e=>{ e.stopPropagation(); commit(); });
    input.addEventListener('click', e=>e.stopPropagation());
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(); } });
  };
  subSpecMchk.setExtra(rowHTML, bind);
})();

const empTypeDD = initFsel('empTypeWrap','empTypeBtn','empTypePanel','empType', Object.entries(EMP_TYPES));
function appendAddEmpTypeRow(){
  const panel = $('#empTypePanel');
  const row = document.createElement('div');
  row.className = 'fseladdrow';
  row.innerHTML = '<input type="text" placeholder="Add a new employee type…" id="empTypeNewInput">'
    + '<button type="button" id="empTypeAddBtn" title="Add employee type"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>';
  panel.appendChild(row);
  const input = $('#empTypeNewInput');
  const commit = () => {
    const label = input.value.trim();
    if(!label) return;
    const existing = Object.entries(EMP_TYPES).find(([,l])=>l.toLowerCase()===label.toLowerCase());
    let key = existing ? existing[0] : label.toLowerCase().replace(/[^a-z0-9]+/g,'') || 'type';
    if(!existing){
      while(EMP_TYPES[key]) key += 'x';
      EMP_TYPES[key] = label;
    }
    empTypeDD.setOptions(Object.entries(EMP_TYPES));
    appendAddEmpTypeRow();
    empTypeDD.set(key);
    const curFilter = catDD.get();
    catDD.setOptions([['all','All roles'],['doctor','Doctors'], ...Object.entries(EMP_TYPES)]);
    catDD.set(curFilter);
    toast('"'+label+'" added to employee types');
  };
  $('#empTypeAddBtn').addEventListener('click', e=>{ e.stopPropagation(); commit(); });
  input.addEventListener('click', e=>e.stopPropagation());
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(); } });
}
appendAddEmpTypeRow();

/* ---------- stat band ---------- */
function sStats(){
  const inBranch=STAFF.filter(s=>!s.br||s.br===branchFilter);
  const T=[
    ['Total staff',inBranch.length,'--brand-soft','--brand-2'],
    ['Active',inBranch.filter(s=>s.status==='active').length,'--success-soft','--success'],
    ['On Leave',inBranch.filter(s=>s.status==='onleave').length,'--warning-soft','--warning'],
    ['Visiting',inBranch.filter(s=>s.type==='Visiting').length,'--st-inconsult-bg','--st-inconsult'],
    ['Inactive',inBranch.filter(s=>s.status==='inactive').length,'--danger-soft','--danger'],
    ['Missing mapping',inBranch.filter(s=>s.status==='missing').length,'--warning-soft','--warning']
  ];
  $('#sStats').innerHTML=T.map((t,i)=>'<div class="pill" data-f="'+['all','active','onleave','visiting','inactive','missing'][i]+'" style="--pc:var('+t[3]+')"><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></i><b>'+t[1]+'</b> '+t[0]+'</div>').join('');
  $$('#sStats .pill').forEach(el=>el.addEventListener('click',()=>{
    activeFilter=el.dataset.f;
    statDD.set(activeFilter);
    renderStaff();
  }));
}

/* ---------- staff table ---------- */
let query='',activeFilter='all',categoryFilter='all',editingIndex=-1;
/* the directory only shows staff for whichever branch the header context switcher (ctxBrDD
   below) is currently on · same branch new records default to. */
let branchFilter='Main Campus';
function renderStaff(){
  const q=query.toLowerCase();
  let list=STAFF.filter(s=>!s.br||s.br===branchFilter);
  list=list.filter(s=>!q||(s.n+' '+s.id+' '+s.role+' '+s.reg+' '+s.dept).toLowerCase().includes(q));
  if(activeFilter!=='all'){
    if(activeFilter==='visiting') list=list.filter(s=>s.type==='Visiting');
    else list=list.filter(s=>s.status===activeFilter);
  }
  if(categoryFilter!=='all') list=list.filter(s=>s.cat===categoryFilter);
  const inBranchTotal=STAFF.filter(s=>!s.br||s.br===branchFilter).length;
  $('#sSub').textContent=list.length+' of '+inBranchTotal+' records';
  $('#sRows').innerHTML=list.map(s=>{
    const i=STAFF.indexOf(s);
    const roleBadge='<span class="rolebadge'+(s.kind==='doctor'?' doc':'')+'" title="'+s.role+'">'+s.role+'</span>'+(s.type==='Visiting'?' <span class="rolebadge visit">Visiting</span>':'');
    const svc=s.kind==='doctor'?('<span class="'+(s.services?'':'zero')+'">'+(s.services!=null?s.services+' services':'0 services')+'</span><span>of catalogue mapped</span>'):'<span style="color:var(--ink-muted)">—</span>';
    return '<div class="urow2" data-i="'+i+'">'
    +'<div class="pcell"><span class="pav">'+ini(s.n)+'</span><div><b>'+s.n+'</b><span>'+s.id+(s.reg?' · '+s.reg:'')+'</span></div></div>'
    +'<div class="rolecol">'+roleBadge+'</div>'
    +'<div class="dcol"><b title="'+s.dept+'">'+s.dept+'</b><span title="'+s.br+'"><i>Branch</i> '+s.br+'</span></div>'
    +'<div class="contact">'+(s.ph?'+91 '+s.ph:'—')+'<span>'+s.em+'</span></div>'
    +'<div class="svccell">'+svc+'</div>'
    +'<span><span class="chip '+STATUS_META[s.status].chip+'">'+STATUS_META[s.status].label+'</span></span>'
    +'<span><button type="button" class="kebab-btn" data-kebab="'+i+'" title="More actions" aria-label="More actions">&#8942;</button></span>'
    +'</div>';
  }).join('')||'<div style="padding:30px;text-align:center;font-size:12.5px;color:var(--ink-muted)">No records match.</div>';
}
/* ---- compact dropdown filter control · same pattern as equipment-resources.html/
   rooms-areas.html: a .fselbtn opens a .fselpanel of .fselopt buttons, backed by a
   hidden input holding the current value. Replaces the old .fchip/.catchip rows. */
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

/* status filter dropdown · replaces the old #fchips .fchip row */
const statDD = initFsel('statWrap','statBtn','statPanel','fStat',
  [['all','All statuses'],['active','Active'],['onleave','On Leave'],['visiting','Visiting'],['inactive','Inactive'],['missing','Missing mapping']],
  v=>{activeFilter=v;renderStaff();});
/* role-category filter dropdown · replaces the old #catChips .catchip row.
   Options are derived from EMP_TYPES so a newly Admin-added employee type is
   immediately filterable here too. */
const catDD = initFsel('catWrap','catBtn','catPanel','fCat',
  [['all','All roles'],['doctor','Doctors'], ...Object.entries(EMP_TYPES)],
  v=>{categoryFilter=v;renderStaff();});
$('#q').addEventListener('input',e=>{query=e.target.value;renderStaff();});
document.addEventListener('click',e=>{
  if(e.target.closest('[data-kebab]'))return;
  const r=e.target.closest('.urow2');if(r)openProfile(+r.dataset.i);
});

/* ---------- profile drawer ---------- */
const closeDrawer=()=>{$('#drawer').classList.remove('show');$('#scrim2').classList.remove('show');};
$('#scrim2').addEventListener('click',()=>{closeDrawer();closeForm();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();closeForm();}});
function openProfile(i){
  const s=STAFF[i];
  const svcLine=s.kind==='doctor'?('<div class="k"><span>Services mapped</span><b style="color:var('+(s.services?'--ink':'--danger')+')">'+(s.services!=null?s.services:0)+' of catalogue</b></div>'):'';
  const catLbl=(s.cat==='doctor'?'Doctor':EMP_TYPES[s.cat])||'';
  const extraKv=
     (s.jobTitle?'<div class="k"><span>Job Title</span><b style="font-size:12px">'+s.jobTitle+'</b></div>':'')
    +(catLbl?'<div class="k"><span>Employee Type</span><b style="font-size:12px">'+catLbl+'</b></div>':'')
    +(s.empMode?'<div class="k"><span>Employment Type</span><b style="font-size:12px">'+s.empMode+'</b></div>':'')
    +(s.joinDate?'<div class="k"><span>Joined</span><b style="font-size:12px">'+new Date(s.joinDate+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+'</b></div>':'')
    +((s.addDept&&s.addDept.length)?'<div class="k wide"><span>Additional Departments</span><b style="font-size:12px;font-weight:500">'+s.addDept.join(', ')+'</b></div>':'')
    +((s.kind==='doctor'&&s.subSpec&&s.subSpec.length)?'<div class="k wide"><span>Sub-specialty</span><b style="font-size:12px;font-weight:500">'+s.subSpec.join(', ')+'</b></div>':'')
    +(s.kind==='doctor'?'<div class="k"><span>Procedure Capabilities</span><b style="font-size:12px">'+(s.procedures!=null?s.procedures:0)+' procedures mapped</b></div>':'');
  const acct=ACCT_META[s.acct||'not_created'];
  $('#drawer').innerHTML=
    '<div class="dh"><div><h3>Staff Profile</h3><p>'+s.id+' · '+s.br+'</p></div>'
    +'<button class="close-btn" data-close><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'<div class="db">'
    +'<div class="phero"><span class="pav">'+ini(s.n)+'</span><div style="min-width:0;flex:1"><b>'+s.n+'</b><span>'+s.role+(s.type?' · '+s.type:'')+'</span></div>'
    +'<span class="chip '+STATUS_META[s.status].chip+'">'+STATUS_META[s.status].label+'</span></div>'
    +'<div class="dsec"><div class="t">Details</div><div class="kv">'
    +'<div class="k"><span>Employee ID</span><b>'+s.id+'</b></div>'
    +'<div class="k"><span>Department</span><b style="font-size:12px">'+s.dept+'</b></div>'
    +(s.qual?'<div class="k"><span>Qualification</span><b style="font-size:12px">'+s.qual+'</b></div>':'')
    +(s.reg?'<div class="k"><span>Registration no.</span><b style="font-size:12px">'+s.reg+'</b></div>':'')
    +'<div class="k"><span>Mobile</span><b>'+(s.ph?'+91 '+s.ph:'—')+'</b></div>'
    +'<div class="k"><span>Email</span><b style="font-size:11.5px">'+s.em+'</b></div>'
    +'<div class="k"><span>Branch</span><b>'+s.br+'</b></div>'
    +svcLine
    +extraKv
    +'</div></div>'
    +'<div class="dsec"><div class="t">Account</div><div class="kv">'
    +'<div class="k wide"><span>Application User</span><b style="display:flex;align-items:center;gap:10px;margin-top:3px;font-size:13px"><span class="chip '+acct.chip+'">'+acct.label+'</span><a href="user-onboard.html" style="margin-left:auto;font-size:11px;font-weight:800;color:var(--brand-2);display:inline-flex;align-items:center;gap:4px">Manage User &amp; Access<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a></b></div>'
    +'</div></div>'
    +(s.status==='missing'?'<div class="dsec"><div class="t">Missing mapping</div><div class="kv"><div class="k wide"><span>Cannot be booked</span><b style="display:block;font-size:12.5px;font-weight:500;line-height:1.5;margin-bottom:11px">No services are mapped to this doctor yet, so patients cannot book them on any channel.</b><a class="btn btn-primary" href="services-consultation-types.html" style="font-size:11.5px;padding:8px 13px"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h4m0-11v11m0-11h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9m0-11V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5"/></svg>Map services</a><span style="display:block;margin-top:10px;font-size:11px;color:var(--ink-muted)">Then confirm a roster in <a href="roster-sessions.html">Doctor Sessions &amp; Staff Rosters</a>.</span></div></div></div>':'')
    +'</div>'
    +'<div class="df"><button class="btn btn-primary" data-ed>Edit record</button></div>';
  $('#drawer').querySelector('[data-close]').addEventListener('click',closeDrawer);
  $('#drawer').querySelector('[data-ed]').addEventListener('click',()=>{closeDrawer();openForm(i);});
  $('#drawer').classList.add('show');$('#scrim2').classList.add('show');
}

/* ---------- add/edit form drawer ---------- */
$$('#catPick button').forEach(b=>b.addEventListener('click',()=>{
  $$('#catPick button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  toggleCategory(b.dataset.c);validateForm();
}));
$$('#typePick button').forEach(b=>b.addEventListener('click',()=>{
  $$('#typePick button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
}));
function toggleCategory(cat){
  const isDoc=cat==='doctor';
  $('#docOnlyFields').style.display=isDoc?'block':'none'; $('#subSpecFld').style.display = isDoc?'block':'none';
  $('#roleLblOpt').textContent=isDoc?'':'/ role';
  $('#fRole').placeholder=isDoc?'e.g. Physical Medicine & Rehabilitation':'e.g. Receptionist, Lab Technician';
  $('#drPrefix').style.display=isDoc?'':'none';
  /* Category already answers "is this a doctor?" · Employee Type only needs
     asking for staff, to say which kind of staff (Nurse/Reception/Lab/etc). */
  $('#empTypeFld').style.display=isDoc?'none':'block';
  refreshAvatar();
  refreshDisplayName();
}
function refreshAvatar(){
  const full=composedName();
  $('#uploadAv').textContent=full?ini(full):'--';
}
/* Display Name (derived) · doctors keep the existing "Dr." auto-prefix convention;
   everyone else previews their name as typed. */
function refreshDisplayName(){
  const cat=$('#catPick button.on').dataset.c;
  const full=[$('#fFirst').value.trim(),$('#fMiddle').value.trim(),$('#fLast').value.trim()].filter(Boolean).join(' ');
  if(!full){$('#displayNamePreview').textContent='—';return;}
  $('#displayNamePreview').textContent = cat==='doctor' ? 'Dr. '+full : full;
}
function validateForm(){
  const ok=$('#fFirst').value.trim().length>0 && deptMchk.get().length>0;
  $('#formSave').disabled=!ok;
}
['fFirst','fLast','fRole'].forEach(id=>$('#'+id).addEventListener('input',validateForm));
['fFirst','fMiddle','fLast'].forEach(id=>$('#'+id).addEventListener('input',refreshAvatar));
['fFirst','fMiddle','fLast'].forEach(id=>$('#'+id).addEventListener('input',refreshDisplayName));
$$('#empModePick button').forEach(b=>b.addEventListener('click',()=>{
  $$('#empModePick button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
}));
/* Status · Active / On Leave / Inactive (3 states, so a picker rather than a toggle) */
$$('#statusPick button').forEach(b=>b.addEventListener('click',()=>{
  $$('#statusPick button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
}));

function openForm(index){
  editingIndex=typeof index==='number'?index:-1;
  const s=editingIndex>=0?STAFF[editingIndex]:null;
  const cat=s?s.kind:'doctor';
  $$('#catPick button').forEach(b=>b.classList.toggle('on',b.dataset.c===cat));
  toggleCategory(cat);
  $$('#typePick button').forEach(b=>b.classList.toggle('on',b.dataset.t===(s?s.type:'Regular')));
  const nm=splitName(s?s.n:'');
  $('#fFirst').value=nm.first;
  $('#fMiddle').value=nm.middle;
  $('#fLast').value=nm.last;
  refreshAvatar();
  $('#fRole').value=s?s.role:'';
  $('#fQual').value=s?s.qual:'';
  $('#fReg').value=s?s.reg:'';
  $('#fJobTitle').value=s?(s.jobTitle||''):'';
  $('#fMob').value=s?s.ph:'';
  $('#fEmail').value=s?s.em:'';
  $('#fJoinDate').value=s?(s.joinDate||''):'';
  const dedupe=arr=>arr.filter((v,i)=>v && arr.indexOf(v)===i);
  deptMchk.set(s?dedupe([s.dept,...(s.addDept||[])]):[]);
  setDBranch(s ? s.br : (ctxBrDD.value || BRANCHES[0]));
  empTypeDD.set(s && EMP_TYPES[s.cat] ? s.cat : Object.keys(EMP_TYPES)[0]);
  $$('#empModePick button').forEach(b=>b.classList.toggle('on',b.dataset.m===(s?(s.empMode||'Full-time'):'Full-time')));
  subSpecMchk.set(s?s.subSpec:[]);
  $('#svcCapSummary').textContent=s?((s.services!=null?s.services:0)+' services mapped'):'0 services mapped (configure after saving)';
  $('#procCapSummary').textContent=s?((s.procedures!=null?s.procedures:0)+' procedures mapped'):'0 procedures mapped (configure after saving)';
  refreshDisplayName();
  const initialStatus=s?(s.status==='inactive'?'inactive':s.status==='onleave'?'onleave':'active'):'active';
  $$('#statusPick button').forEach(b=>b.classList.toggle('on',b.dataset.s===initialStatus));
  $('#fInvite').checked=false;
  $('#formTitle').textContent=s?'Edit record':'Onboard doctor / staff';
  $('#formSub').textContent=s?('Update details for '+s.n):'Creates the staff record. Set up login in Users, Roles & Permissions.';
  $('#formSave').textContent=s?'Save changes':'Save';
  validateForm();
  $('#formDrawer').classList.add('show');$('#scrim2').classList.add('show');
}
const closeForm=()=>{$('#formDrawer').classList.remove('show');$('#scrim2').classList.remove('show');};
$('#addBtn').addEventListener('click',()=>openForm());
$('#formClose').addEventListener('click',closeForm);
$('#formCancel').addEventListener('click',closeForm);
$('#formSave').addEventListener('click',()=>{
  const kind=$('#catPick button.on').dataset.c;
  const type=kind==='doctor'?$('#typePick button.on').dataset.t:'';
  const name=composedName();
  const wantsInvite=$('#fInvite').checked;
  const selDept=deptMchk.get();
  const rec={
    n:name, role:$('#fRole').value.trim(), qual:kind==='doctor'?$('#fQual').value.trim():'',
    reg:kind==='doctor'?$('#fReg').value.trim():'', kind, type,
    dept:selDept[0]||'', br:$('#dBranch').value, ph:$('#fMob').value.trim(), em:$('#fEmail').value.trim(),
    joinDate:$('#fJoinDate').value,
    status:$('#statusPick button.on').dataset.s,
    jobTitle:$('#fJobTitle').value.trim(),
    cat:kind==='doctor'?'doctor':(empTypeDD.get()||Object.keys(EMP_TYPES)[0]),
    empMode:$('#empModePick button.on')?.dataset.m||'Full-time',
    addDept:selDept.slice(1),
    subSpec:kind==='doctor'?subSpecMchk.get():[]
  };
  if(editingIndex>=0){
    const s=STAFF[editingIndex];
    Object.assign(s,rec);
    if(s.status==='active' && s.kind==='doctor' && !s.services) s.status='missing';
    toast(s.n+' updated');
  }else{
    rec.id='EMP-NEW-'+(STAFF.length+1);
    rec.services=kind==='doctor'?0:null;
    rec.procedures=kind==='doctor'?0:null;
    rec.acct='not_created'; // freshly onboarded · no login yet unless invited below
    if(rec.status==='active' && kind==='doctor') rec.status='missing'; // no services mapped yet
    STAFF.push(rec);
    toast(name+' added'+(kind==='doctor'?' · map services next so they can be booked':''));
  }
  sStats();renderStaff();
  closeForm();
  // BRD keeps 02.3 (staff master) and 08.3 (login/access) as separate authoritative
  // records · so instead of merging the forms, a checked "also create login access"
  // hands off to Users, Roles & Permissions' own Add User / Send invite flow, staff pre-filled.
  if(wantsInvite) location.href='user-onboard.html?linkStaff='+encodeURIComponent(name);
});

/* ---------- row actions overflow ("kebab") menu ----------
   Same 8-action set called out for Rooms/Areas, mapped onto Doctors & Staff:
   Add Doctor / Staff (= the toolbar "Onboard doctor / staff" button, already above
   the table) · Edit · Activate · Set On Leave · Deactivate · Manage Schedule ·
   Manage Access · View History. */
let rowMenuCtx=null; // index into STAFF that the open menu belongs to
function closeRowMenu(){$('#rowMenu').classList.remove('show');rowMenuCtx=null;}
function buildRowMenu(s){
  const items=[{action:'edit',label:'Edit'}];
  if(s.status!=='active') items.push({action:'activate',label:'Activate'});
  if(s.status!=='onleave') items.push({action:'onleave',label:'Set On Leave'});
  if(s.status!=='inactive') items.push({action:'deactivate',label:'Deactivate',danger:true});
  items.push({action:'schedule',label:'Manage Schedule'});
  items.push({action:'access',label:'Manage Access'});
  items.push({action:'history',label:'View History'});
  return items;
}
function openRowMenu(btn,i){
  const s=STAFF[i]; if(!s)return;
  rowMenuCtx=i;
  const menu=$('#rowMenu');
  menu.innerHTML=buildRowMenu(s).map(it=>
    '<button type="button" data-action="'+it.action+'"'+(it.danger?' class="danger"':'')+'>'+esc(it.label)+'</button>').join('');
  menu.classList.add('show'); // must show before measuring so offsetWidth/Height aren't 0
  const r=btn.getBoundingClientRect();
  const mw=menu.offsetWidth, mh=menu.offsetHeight;
  let left=r.right-mw; if(left<8) left=8;
  let top=r.bottom+6; if(top+mh>window.innerHeight-8) top=r.top-mh-6;
  menu.style.left=left+'px'; menu.style.top=top+'px';
}
/* quick one-click status change · Activate / Set On Leave / Deactivate. Keeps the
   existing "Missing mapping" rule intact: a doctor can't be flipped to Active while
   0 services are mapped, same guardrail formSave already applies. */
function quickSetStatus(s,newStatus){
  s.status=newStatus;
  if(newStatus==='active' && s.kind==='doctor' && !s.services) s.status='missing';
  sStats();renderStaff();
  toast(s.n+' set to '+(STATUS_META[s.status]?STATUS_META[s.status].label:s.status));
}
/* Set On Leave / Deactivate impact review · guards the row-menu's quick status actions
   with a dependency check first (same shape as counters-points.js's hasCounterDeps/
   showCounterImpactModal · never a bare status flip when something real still depends
   on this person). Doctors: services/procedures still mapped to them. Everyone else:
   whether they still have an active application login. Reactivating never needs this. */
function hasStaffDeps(s){
  if(apptsOf(s).length) return true;
  if(s.kind==='doctor') return (s.services||0) > 0 || (s.procedures||0) > 0;
  return s.acct==='active';
}
function apptRowsHtml(s){
  const a = apptsOf(s);
  return '<div class="deprow"><span>Upcoming appointments</span><b' + (a.length ? '' : ' class="zero"') + '>' + a.length + '</b></div>'
    + a.map(x => '<div class="deprow appt"><span>' + esc(x.d) + ' · ' + esc(x.t) + ' · ' + esc(x.p) + '</span><small>' + esc(x.s) + '</small></div>').join('');
}
function depRowsHtml(s){
  if(s.kind==='doctor'){
    return '<div class="deprow"><span>Services mapped</span><b'+((s.services||0)===0?' class="zero"':'')+'>'+(s.services||0)+'</b></div>'
      + '<div class="deprow"><span>Procedure capabilities mapped</span><b'+((s.procedures||0)===0?' class="zero"':'')+'>'+(s.procedures||0)+'</b></div>'
      + apptRowsHtml(s);
  }
  return '<div class="deprow"><span>Application / login access</span><b>'+(s.acct==='active'?'Active':'Not active')+'</b></div>' + apptRowsHtml(s);
}
let impactStaffCtx=null; // {s, newStatus}
function showStaffImpactModal(s,newStatus){
  impactStaffCtx={s,newStatus};
  const leave = newStatus==='onleave';
  $('#iTitle').textContent = (leave ? 'Set ' + s.n + ' on leave?' : 'Deactivate ' + s.n + '?');
  $('#iBody').innerHTML = '<p class="dep-intro">' + (leave ? 'Setting this person on leave' : 'Deactivating this person') + ' affects:</p>' + depRowsHtml(s);
  $('#iFootHint').innerHTML = s.kind==='doctor'
    ? '<b>Past records keep their history.</b> Services and procedures mapped to this doctor stop taking new bookings. Reassign or unmap them first if that is not intended.'
    : '<b>Past records keep their history.</b> Their application login stays active until it is revoked in Users, Roles & Permissions.';
  $('#iContinue').textContent = leave ? 'Set on leave anyway' : 'Deactivate anyway';
  $('#iScrim').classList.add('show');
}
function closeStaffImpactModal(){ $('#iScrim').classList.remove('show'); impactStaffCtx=null; }
$('#iCancel').addEventListener('click', closeStaffImpactModal);
$('#iContinue').addEventListener('click', ()=>{
  const ctx=impactStaffCtx; if(!ctx){ closeStaffImpactModal(); return; }
  closeStaffImpactModal();
  quickSetStatus(ctx.s, ctx.newStatus);
});
$('#iScrim').addEventListener('click', e=>{ if(e.target.id==='iScrim') closeStaffImpactModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#iScrim').classList.contains('show')) closeStaffImpactModal(); });
function guardedSetStatus(s,newStatus){
  if(hasStaffDeps(s)){ showStaffImpactModal(s,newStatus); return; }
  quickSetStatus(s,newStatus);
}
$('#sRows').addEventListener('click', e=>{
  const kb=e.target.closest('[data-kebab]'); if(!kb)return;
  e.stopPropagation();
  const i=+kb.dataset.kebab;
  if(rowMenuCtx===i){closeRowMenu();return;}
  openRowMenu(kb,i);
});
$('#rowMenu').addEventListener('click', e=>{
  const b=e.target.closest('button[data-action]'); if(!b||rowMenuCtx==null)return;
  const i=rowMenuCtx, s=STAFF[i], action=b.dataset.action;
  closeRowMenu();
  if(!s)return;
  if(action==='edit') openForm(i);
  else if(action==='activate') quickSetStatus(s,'active');
  else if(action==='onleave') guardedSetStatus(s,'onleave');
  else if(action==='deactivate') guardedSetStatus(s,'inactive');
  else if(action==='schedule') location.href='roster-sessions.html';
  else if(action==='access') location.href='user-onboard.html?linkStaff='+encodeURIComponent(s.n);
  else if(action==='history') showHistoryModal(s);
});
/* ---------- View History popup: this record's edit history as a small card ---------- */
function showHistoryModal(s){
  $('#histTitle').textContent = s.n + ' · history';
  $('#histBody').innerHTML = historyOf(s).map(h => '<div class="deprow hist"><span><b>' + esc(h.what) + '</b><small>' + esc(h.who) + '</small></span><small>' + esc(h.when) + '</small></div>').join('');
  $('#histScrim').classList.add('show');
}
function closeHistoryModal(){ $('#histScrim').classList.remove('show'); }
$('#histClose').addEventListener('click', closeHistoryModal);
$('#histScrim').addEventListener('click', e=>{ if(e.target.id==='histScrim') closeHistoryModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#histScrim').classList.contains('show')) closeHistoryModal(); });
document.addEventListener('click', e=>{
  if(rowMenuCtx!=null && !e.target.closest('#rowMenu') && !e.target.closest('[data-kebab]')) closeRowMenu();
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && rowMenuCtx!=null) closeRowMenu(); });
document.addEventListener('scroll', closeRowMenu, true); // any ancestor scrolling invalidates the fixed-position menu
window.addEventListener('resize', closeRowMenu);

/* ---------- init ---------- */
sStats();renderStaff();

/* current-branch context switcher (shared across every admin screen) · moved inside this IIFE
   so it can actually reach makeDropdown()/toast(), both of which are scoped to this closure */
const CTX_BRANCHES = ['Main Campus','OPD Annexe','Madhurawada Branch'];
const ctxBrDD = makeDropdown('ctxBr', v => { toast('Switched to ' + v); branchFilter=v; sStats(); renderStaff(); });
ctxBrDD.setOptions(CTX_BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.select('Main Campus','Main Campus');
})();

