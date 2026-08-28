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
const ini=n=>n.replace('Dr. ','').replace('Re. ','').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
const esc=s=>(s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ---- compact single-select dropdown (.f.fsel/.fselbtn/.fselpanel/.fselopt) · same component
   as doctors-staff.html/rooms-areas.html/equipment-resources.html ---- */
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
   doctors-staff.html/rooms-areas.html/counters-points.html ---- */
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

/* =====================================================================
   CONTENT · sourced from the BRD (epic 02.4 personas/role-boundaries)
   and KVNN_UI_Delivery_Plan4.xlsx row 9 (real staff names, departments,
   branches). No Billing/Marketing roles · out of BRD scope.
   DESIGN · structure/classes ported from ../admin-users.html.
===================================================================== */
/* Exactly the 9 KVNN personas from the BRD's "Core Personas & Responsibility Boundaries"
   table · no 10th "Service Account" role invented; channel/bot automation is Tekisho-managed
   and outside the normal KVNN frontend per BRD, so it is never given a persona role below. */
const ROLES=['Clinic Admin','Doctor / Clinic Owner','Reception / Care Desk','Clinic Manager / Head Nurse','Nurse / Clinical Staff','Lab Staff','Pharmacy Staff','Stores / Inventory Staff','Transportation Coordinator'];
/* Branch Access / Department Access option lists · kept local to this IIFE (not the CTX_BRANCHES
   const declared at file end for the header branch-switcher) so pick-lists never depend on
   script-load order. Same 3 real KVNN branches; departments match this screen's own USERS/
   STAFF_DIRECTORY data (no foreign department names invented). */
const BRANCH_OPTIONS=['Main Campus','OPD Annexe','Madhurawada Branch'];
/* Full real department list · same 11 departments as doctors-staff.js's DEPARTMENTS/
   roles-departments.html, not a narrower ad-hoc subset, so every real department is
   actually pickable for Department Access. */
const DEPT_OPTIONS=['Orthotics & Prosthetics','Consulting','ECG','IPD','FOOTRYX Physiotherapy','Nursing','OPD','Pharmacy','Admission','Laboratory','Administration'];
/* Temporary Delegation · authority types an admin can hand over; mirrors the two toggle-style
   authorities on the User form plus two broader operational handover types. */
const AUTHORITY_TYPES=['Clinical Sign-off Authority','Operational Override Authority','Approvals & Overrides','Full Role Coverage'];
const RCLR={
  'Clinic Admin':['--danger-soft','--danger'],
  'Doctor / Clinic Owner':['--success-soft','--success'],
  'Reception / Care Desk':['--info-soft','--info'],
  'Clinic Manager / Head Nurse':['--warning-soft','--warning'],
  'Nurse / Clinical Staff':['--st-inconsult-bg','--st-inconsult'],
  'Lab Staff':['--surface-3','--ink-2'],
  'Pharmacy Staff':['--surface-3','--ink-2'],
  'Stores / Inventory Staff':['--brand-soft','--brand-2'],
  'Transportation Coordinator':['--info-soft','--info']
};
const RDESC={
  'Clinic Admin':'Configures clinic structure, people, services, schedules and access. No clinical authoring simply by being Admin.',
  'Doctor / Clinic Owner':'Consultation, diagnosis, medication reconciliation, prescriptions, clinical orders, care plans and owner analytics.',
  'Reception / Care Desk':'Patient search/registration, appointments, arrivals and queue. No diagnosis or prescription.',
  'Clinic Manager / Head Nurse':'Unified day schedule, programs, resources, delays/exceptions and follow-ups.',
  'Nurse / Clinical Staff':'Triage/vitals, assigned treatment execution, progress measurements. Cannot edit doctor diagnosis/prescription.',
  'Lab Staff':'Lab worklist, structured result entry and verification/release. No unrelated EMR access.',
  'Pharmacy Staff':'Lightweight prescription fulfilment/issue recording. Doctor prescription stays read-only.',
  'Stores / Inventory Staff':'Basic stock visibility and receive/issue/return/transfer history.',
  'Transportation Coordinator':'Transport request acknowledgement and status. Minimum-necessary patient info only.'
};
/* per-role, per-module access level: 0 none · 1 view · 2 edit · 3 full · BRD epic 02.4 boundaries */
const MODULES=[
  ['Dashboard','clinic overview & KPIs'],
  ['Appointments & Queue','booking, check-in, walk-in, no-show'],
  ['Patients & EMR','registration, consultation, records'],
  ['Clinical Orders & Rx','prescriptions, lab & procedure orders'],
  ['Scheduling & Resources','treatment/procedure capacity'],
  ['Configuration','masters, rules & role setup'],
  ['Reports & Analytics','operational dashboards & trends']
];
const ACTIONS=['View','Create','Edit','Delete','Cancel','Approve','Export','Print','Configure'];
const LEVELS={
  'Clinic Admin':                          {'Dashboard':3,'Appointments & Queue':2,'Patients & EMR':1,'Clinical Orders & Rx':0,'Scheduling & Resources':3,'Configuration':3,'Reports & Analytics':2},
  'Doctor / Clinic Owner':                 {'Dashboard':2,'Appointments & Queue':2,'Patients & EMR':3,'Clinical Orders & Rx':3,'Scheduling & Resources':1,'Configuration':0,'Reports & Analytics':2},
  'Reception / Care Desk':                 {'Dashboard':1,'Appointments & Queue':3,'Patients & EMR':2,'Clinical Orders & Rx':0,'Scheduling & Resources':1,'Configuration':0,'Reports & Analytics':1},
  'Clinic Manager / Head Nurse':           {'Dashboard':2,'Appointments & Queue':2,'Patients & EMR':1,'Clinical Orders & Rx':0,'Scheduling & Resources':3,'Configuration':1,'Reports & Analytics':2},
  'Nurse / Clinical Staff':                {'Dashboard':1,'Appointments & Queue':1,'Patients & EMR':2,'Clinical Orders & Rx':0,'Scheduling & Resources':1,'Configuration':0,'Reports & Analytics':0},
  'Lab Staff':                             {'Dashboard':1,'Appointments & Queue':0,'Patients & EMR':1,'Clinical Orders & Rx':2,'Scheduling & Resources':0,'Configuration':0,'Reports & Analytics':1},
  'Pharmacy Staff':                        {'Dashboard':0,'Appointments & Queue':0,'Patients & EMR':0,'Clinical Orders & Rx':1,'Scheduling & Resources':0,'Configuration':0,'Reports & Analytics':0},
  'Stores / Inventory Staff':              {'Dashboard':0,'Appointments & Queue':0,'Patients & EMR':0,'Clinical Orders & Rx':0,'Scheduling & Resources':0,'Configuration':0,'Reports & Analytics':1},
  'Transportation Coordinator':            {'Dashboard':0,'Appointments & Queue':1,'Patients & EMR':0,'Clinical Orders & Rx':0,'Scheduling & Resources':0,'Configuration':0,'Reports & Analytics':0}
};
const LSET={0:[],1:[0],2:[0,1,2,4,6],3:[0,1,2,3,4,5,6,7,8]};

/* ---------------------------------------------------------------------------------------------
   Detailed (Module → Screen → Action) permission tree · additive alongside the coarse matrix
   above. Doc spec (Workspace 09) gives three worked examples verbatim; each carries a nominal
   "screen" sub-label to complete the 3-level hierarchy the doc names but only shows 2 levels of
   in its own worked text. Per-role booleans are hand-derived from each role's RDESC/LEVELS
   boundary already defined above, not re-invented. Custom roles (role builder) default to a deep
   copy of their base role, or all-false when built from scratch · see roleSave handler below.
--------------------------------------------------------------------------------------------- */
const DETAIL_PERMS_DEF=[
  {module:'Patients',        screen:'Patient Profile',      actions:['View','Create','Edit Demographics','View Sensitive Identifier']},
  {module:'Appointments',    screen:'Appointment Detail',   actions:['View','Create','Reschedule','Cancel','Override Capacity']},
  {module:'Clinical Record', screen:'Consultation Note',    actions:['View','Create Note','Sign Note','Add Amendment']}
];
function blankDetailLevel(){
  return Object.fromEntries(DETAIL_PERMS_DEF.map(m=>[m.module,Object.fromEntries(m.actions.map(a=>[a,false]))]));
}
const DETAIL_LEVELS={
  'Clinic Admin':{
    Patients:{View:true,Create:false,'Edit Demographics':false,'View Sensitive Identifier':true},
    Appointments:{View:true,Create:true,Reschedule:true,Cancel:true,'Override Capacity':true},
    'Clinical Record':{View:false,'Create Note':false,'Sign Note':false,'Add Amendment':false}
  },
  'Doctor / Clinic Owner':{
    Patients:{View:true,Create:true,'Edit Demographics':true,'View Sensitive Identifier':true},
    Appointments:{View:true,Create:true,Reschedule:true,Cancel:true,'Override Capacity':false},
    'Clinical Record':{View:true,'Create Note':true,'Sign Note':true,'Add Amendment':true}
  },
  'Reception / Care Desk':{
    Patients:{View:true,Create:true,'Edit Demographics':true,'View Sensitive Identifier':false},
    Appointments:{View:true,Create:true,Reschedule:true,Cancel:true,'Override Capacity':false},
    'Clinical Record':{View:false,'Create Note':false,'Sign Note':false,'Add Amendment':false}
  },
  'Clinic Manager / Head Nurse':{
    Patients:{View:true,Create:false,'Edit Demographics':false,'View Sensitive Identifier':false},
    Appointments:{View:true,Create:true,Reschedule:true,Cancel:true,'Override Capacity':true},
    'Clinical Record':{View:false,'Create Note':false,'Sign Note':false,'Add Amendment':false}
  },
  'Nurse / Clinical Staff':{
    Patients:{View:true,Create:false,'Edit Demographics':false,'View Sensitive Identifier':false},
    Appointments:{View:true,Create:false,Reschedule:false,Cancel:false,'Override Capacity':false},
    'Clinical Record':{View:true,'Create Note':true,'Sign Note':false,'Add Amendment':false}
  },
  'Lab Staff':{
    Patients:{View:true,Create:false,'Edit Demographics':false,'View Sensitive Identifier':false},
    Appointments:{View:false,Create:false,Reschedule:false,Cancel:false,'Override Capacity':false},
    'Clinical Record':{View:true,'Create Note':false,'Sign Note':false,'Add Amendment':false}
  },
  'Pharmacy Staff':{
    Patients:{View:false,Create:false,'Edit Demographics':false,'View Sensitive Identifier':false},
    Appointments:{View:false,Create:false,Reschedule:false,Cancel:false,'Override Capacity':false},
    'Clinical Record':{View:true,'Create Note':false,'Sign Note':false,'Add Amendment':false}
  },
  'Stores / Inventory Staff':{
    Patients:{View:false,Create:false,'Edit Demographics':false,'View Sensitive Identifier':false},
    Appointments:{View:false,Create:false,Reschedule:false,Cancel:false,'Override Capacity':false},
    'Clinical Record':{View:false,'Create Note':false,'Sign Note':false,'Add Amendment':false}
  },
  'Transportation Coordinator':{
    Patients:{View:false,Create:false,'Edit Demographics':false,'View Sensitive Identifier':false},
    Appointments:{View:true,Create:false,Reschedule:false,Cancel:false,'Override Capacity':false},
    'Clinical Record':{View:false,'Create Note':false,'Sign Note':false,'Add Amendment':false}
  }
};

/* Every row below is a real account name found in the source docs (KVNN_UI_Delivery_Plan4.xlsx
   row 9 "Reference - Existing App" note: Activity Log lists Dr. KVNN, Dr. HRISHIKESH,
   Re. SOHELA FARHEEN, Re. Nida Firdous, Re. AI Bot, Re. Hanshith Reddy). "Rajeev Malhotra" is
   the project's established logged-in Clinic Admin persona (same identity shown in every other
   screen's sidebar), not an xlsx name · kept because the screen needs a "you" row.
   No fictional names, no fabricated Inactive/Conflict example: this data currently has none of
   either, matching the docs. Toggle a status switch or multi-assign roles via "+ Add user" to
   see those states occur live instead. Employee IDs, phone numbers and emails are not given in
   any source doc · placeholders only, pending real numbering/contact configuration.
   role is an ARRAY · [] = no role assigned, length>1 = permission conflict (union of roles). */
/* branchAccess/deptAccess/sensitiveAccess/clinicalSignoff/operationalOverride · added per BRD
   Workspace 09 fields. branchAccess/deptAccess are the user's independently-editable SYSTEM
   access grants (doc lines 1240-1241); they default from dept/br (the linked staff record's org
   placement, still the single source of truth for org placement) but can diverge from it · e.g.
   Rajeev Malhotra's org placement is Administration/Main Campus, but as Clinic Admin his access
   spans all 3 branches. */
const USERS=[
  {n:'Rajeev Malhotra',id:'EMP-0001',role:['Clinic Admin'],dept:'Administration',br:'Main Campus',ph:'98450 00121',em:'rajeev.malhotra@awhclinics.in',last:'Online now',on:true,branchAccess:['Main Campus','OPD Annexe','Madhurawada Branch'],deptAccess:['Administration'],sensitiveAccess:'Full',clinicalSignoff:false,operationalOverride:true},
  {n:'Dr. KVNN Santosh Murthy',id:'EMP-0102',role:['Doctor / Clinic Owner'],dept:'Consulting',br:'Main Campus',ph:'98421 55670',em:'kvnn.santosh@awhclinics.in',last:'12 min ago',on:true,branchAccess:['Main Campus'],deptAccess:['Consulting'],sensitiveAccess:'Full',clinicalSignoff:true,operationalOverride:true},
  {n:'Dr. Hrishikesh Korada',id:'EMP-0115',role:['Doctor / Clinic Owner'],dept:'Consulting',br:'Main Campus',ph:'99089 34521',em:'hrishikesh.korada@awhclinics.in',last:'40 min ago',on:true,branchAccess:['Main Campus'],deptAccess:['Consulting'],sensitiveAccess:'Full',clinicalSignoff:true,operationalOverride:false},
  {n:'Sohela Farheen',id:'EMP-0412',role:['Reception / Care Desk'],dept:'OPD',br:'Main Campus',ph:'90000 12233',em:'sohela.farheen@awhclinics.in',last:'Online now',on:true,branchAccess:['Main Campus'],deptAccess:['OPD'],sensitiveAccess:'Masked',clinicalSignoff:false,operationalOverride:false},
  {n:'Nida Firdous',id:'EMP-0521',role:[],dept:'Admission',br:'OPD Annexe',ph:'91000 55210',em:'nida.firdous@awhclinics.in',last:'Never signed in',on:true,branchAccess:['OPD Annexe'],deptAccess:['Admission'],sensitiveAccess:'Masked',clinicalSignoff:false,operationalOverride:false},
  {n:'Hanshith Reddy',id:'EMP-0702',role:[],dept:'Laboratory',br:'Main Campus',ph:'90140 66312',em:'hanshith.reddy@awhclinics.in',last:'Never signed in',on:true,branchAccess:['Main Campus'],deptAccess:['Laboratory'],sensitiveAccess:'Masked',clinicalSignoff:false,operationalOverride:false}
  /* Re. AI Bot · real legacy channel-automation account, documented in the same xlsx row —
     intentionally left out for now: Phase 2 item per your call. */
];
let query='',curRole='Reception / Care Desk';

/* ---------- stat band ---------- */
function uStats(){
  const T=[
    ['Total users',USERS.length,'--brand-soft','--brand-2'],
    ['Active',USERS.filter(u=>u.on).length,'--success-soft','--success'],
    ['Inactive',USERS.filter(u=>!u.on).length,'--danger-soft','--danger'],
    ['Online now',USERS.filter(u=>u.last==='Online now').length,'--info-soft','--info'],
    ['Roles defined',ROLES.length,'--st-inconsult-bg','--st-inconsult']
  ];
  $('#uStats').innerHTML=T.map(t=>'<div class="pill" style="--pc:var('+t[3]+')"><i><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></i><b>'+t[1]+'</b> '+t[0]+'</div>').join('');
}

/* ---------- users table ---------- */
function roleBadges(u){
  if(!u.role.length){
    if(u.bot) return '<span class="rolebadge na legacy"><i></i>Legacy · no KVNN role</span>';
    return '<span class="rolebadge na"><i></i>No role assigned</span>';
  }
  let html=u.role.map(r=>{const rc=RCLR[r];return '<span class="rolebadge" style="--rb:var('+rc[0]+');--rc:var('+rc[1]+')"><i></i>'+r+'</span>';}).join('');
  if(u.role.length>1) html+='<span class="conflictdot" title="Permission conflict: union of roles grants more than either role alone">!</span>';
  return html;
}
function renderUsers(){
  const q=query.toLowerCase();
  const list=USERS.filter(u=>!q||(u.n+' '+u.id+' '+u.role.join(' ')+' '+u.dept).toLowerCase().includes(q));
  const noRole=list.filter(u=>!u.role.length).length, conflict=list.filter(u=>u.role.length>1).length;
  let sub=list.length+' of '+USERS.length+' users';
  if(noRole) sub+=' · '+noRole+' no role';
  if(conflict) sub+=' · '+conflict+' conflict';
  $('#uSub').textContent=sub;
  $('#uRows').innerHTML=list.map(u=>{
    const i=USERS.indexOf(u);
    return '<div class="urow2" data-i="'+i+'">'
    +'<div class="pcell"><span class="pav'+(u.bot?' bot':'')+'">'+(u.bot?'AI':ini(u.n))+'</span><div><b>'+u.n+'</b><span>'+u.id+'</span></div></div>'
    +'<div class="rolecell">'+roleBadges(u)+'</div>'
    +'<div class="dcol"><b>'+u.dept+'</b><span>'+u.br+'</span></div>'
    +'<div class="contact">'+(u.ph?'+91 '+u.ph:'—')+'<span>'+u.em+'</span></div>'
    +'<span class="lastact'+(u.last==='Online now'?' now':'')+'">'+u.last+'</span>'
    +'<label class="sw" title="'+(u.on?'Active (click to deactivate)':'Inactive (click to activate)')+'"><input type="checkbox" '+(u.on?'checked':'')+' data-u="'+i+'"><i></i></label>'
    +'</div>';
  }).join('')||'<div style="padding:30px;text-align:center;font-size:12.5px;color:var(--ink-muted)">No users match.</div>';
}
/* Deactivating a user is guarded by a dependency review, same shape as doctors-staff.js's
   hasStaffDeps/showStaffImpactModal · the real, locally-tracked dependency here is Temporary
   Delegation: a user who is still party to an active/upcoming delegation shouldn't be silently
   deactivated without a chance to reassign it first. Reactivating never needs the guardrail. */
function hasUserDeps(u){
  return DELEGATIONS.some(d=>(d.from===u.n||d.to===u.n)&&delegStatus(d)!=='expired');
}
function userDepRowsHtml(u){
  const active=DELEGATIONS.filter(d=>(d.from===u.n||d.to===u.n)&&delegStatus(d)==='active').length;
  const upcoming=DELEGATIONS.filter(d=>(d.from===u.n||d.to===u.n)&&delegStatus(d)==='upcoming').length;
  return '<div class="deprow"><span>Active delegations involved in</span><b'+(active===0?' class="zero"':'')+'>'+active+'</b></div>'
    +'<div class="deprow"><span>Upcoming delegations involved in</span><b'+(upcoming===0?' class="zero"':'')+'>'+upcoming+'</b></div>';
}
let impactUserCtx=null;
function showUserImpactModal(u){
  impactUserCtx=u;
  $('#iTitle').textContent='Deactivate '+u.n+'?';
  $('#iBody').innerHTML='<p class="dep-intro">Deactivating this user affects:</p>'+userDepRowsHtml(u);
  $('#iFootHint').innerHTML='<b>Past activity keeps its history.</b> They are still party to an active or upcoming delegation. Revoke or reassign it first if that is not intended.';
  $('#iScrim').classList.add('show');
}
function closeUserImpactModal(){ $('#iScrim').classList.remove('show'); impactUserCtx=null; }
$('#iCancel').addEventListener('click',closeUserImpactModal);
$('#iContinue').addEventListener('click',()=>{
  const u=impactUserCtx; if(!u){closeUserImpactModal();return;}
  u.on=false;uStats();renderUsers();
  closeUserImpactModal();
  toast(u.n+' · deactivated');
});
$('#iScrim').addEventListener('click',e=>{if(e.target.id==='iScrim')closeUserImpactModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#iScrim').classList.contains('show'))closeUserImpactModal();});

document.addEventListener('change',e=>{
  const c=e.target.closest('input[data-u]');if(!c)return;
  const u=USERS[+c.dataset.u];
  if(!c.checked&&hasUserDeps(u)){
    c.checked=true; // hold the switch on until the impact review is resolved
    showUserImpactModal(u);
    return;
  }
  u.on=c.checked;uStats();renderUsers();
  toast(u.n+' · '+(c.checked?'activated':'deactivated'));
});
document.addEventListener('click',e=>{
  if(e.target.closest('.sw'))return;
  const r=e.target.closest('.urow2');if(r)openUser(+r.dataset.i);
});

/* ---------- effective access panel (doc: "more useful than only permission checkboxes") ---------- */
function effectiveAccessHTML(u){
  const branches=(u.branchAccess&&u.branchAccess.length)?u.branchAccess:[u.br];
  const depts=(u.deptAccess&&u.deptAccess.length)?u.deptAccess:[u.dept];
  const tag=v=>'<span class="tagchip">'+v+'</span>';
  const permBadge=on=>'<b style="color:var('+(on?'--success':'--ink-muted')+')">'+(on?'Permitted':'Not permitted')+'</b>';
  return '<div class="dsec"><div class="t">Effective Access</div><div class="kv">'
    +'<div class="k wide"><span>Branches</span><div class="taglist" style="margin-top:5px">'+branches.map(tag).join('')+'</div></div>'
    +'<div class="k wide"><span>Departments</span><div class="taglist" style="margin-top:5px">'+depts.map(tag).join('')+'</div></div>'
    +'<div class="k wide"><span>Roles</span><div class="taglist" style="margin-top:5px">'+(u.role.length?u.role.map(tag).join(''):'<span class="tagchip" style="border:1px dashed var(--warning);background:transparent;color:var(--warning)">None</span>')+'</div></div>'
    +'<div class="k"><span>Sensitive Patient Identifiers</span><b>'+(u.sensitiveAccess||'Masked')+'</b></div>'
    +'<div class="k"><span>Clinical Sign-off</span>'+permBadge(!!u.clinicalSignoff)+'</div>'
    +'<div class="k wide"><span>Operational Override</span>'+permBadge(!!u.operationalOverride)+'</div>'
    +'</div></div>';
}
/* ---------- user profile drawer (view/edit) ---------- */
const closeDrawer=()=>{$('#drawer').classList.remove('show');$('#scrim2').classList.remove('show');};
$('#scrim2').addEventListener('click',()=>{closeDrawer();closeAdd();closeRole();closeDeleg();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrawer();closeAdd();closeRole();closeDeleg();}});
function openUser(i){
  const u=USERS[i];
  $('#drawer').innerHTML=
    '<div class="dh"><div><h3>User Profile</h3><p>'+u.id+' · '+u.br+'</p></div>'
    +'<button class="close-btn" data-close><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'
    +'<div class="db">'
    +'<div class="phero"><span class="pav'+(u.bot?' bot':'')+'">'+(u.bot?'AI':ini(u.n))+'</span><div style="min-width:0;flex:1"><b>'+u.n+'</b><span>'+u.dept+' · '+u.br+'</span></div></div>'
    +'<div class="dsec"><div class="t">Role(s)</div><div class="rolecell">'+roleBadges(u)+'</div></div>'
    +effectiveAccessHTML(u)
    +'<div class="dsec"><div class="t">Details</div><div class="kv">'
    +'<div class="k"><span>Employee ID</span><b>'+u.id+'</b></div>'
    +'<div class="k"><span>Department</span><b style="font-size:12px">'+u.dept+'</b></div>'
    +'<div class="k"><span>Mobile</span><b>'+(u.ph?'+91 '+u.ph:'—')+'</b></div>'
    +'<div class="k"><span>Login / email</span><b style="font-size:11.5px">'+u.em+'</b></div>'
    +'<div class="k"><span>Branch</span><b>'+u.br+'</b></div>'
    +'<div class="k"><span>Account</span><b style="color:var('+(u.on?'--success':'--danger')+')">'+(u.on?'Active':'Inactive')+'</b></div></div></div>'
    +(u.role.length>1?('<div class="dsec"><div class="t">Permission conflict</div><div class="kv"><div class="k wide"><span>Union rule</span><b style="font-size:12.5px;font-weight:500;line-height:1.5">'+u.role.join(' + ')+' together grant more than the primary role allows alone. Confirm this is intentional, or split a scoped custom role.</b></div></div></div>'):'')
    +(!u.role.length?('<div class="dsec"><div class="t">Blocked</div><div class="kv"><div class="k wide"><span>No workspace access</span><b style="font-size:12.5px;font-weight:500;line-height:1.5">This account cannot sign in to any workspace until a role is granted.</b></div></div>'
      +'<button class="btn btn-primary" style="margin-top:10px;width:100%;justify-content:center" data-grant><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Grant a role</button></div>'):'')
    +'</div>'
    +'<div class="df"><button class="btn btn-primary" data-ed>Edit user</button><button class="btn btn-ghost" data-rs>Reset password</button></div>';
  $('#drawer').querySelector('[data-close]').addEventListener('click',closeDrawer);
  $('#drawer').querySelector('[data-ed]').addEventListener('click',()=>{closeDrawer();openUserForm(i,'edit');});
  const grantBtn=$('#drawer').querySelector('[data-grant]');
  if(grantBtn) grantBtn.addEventListener('click',()=>{closeDrawer();openUserForm(i,'grant');});
  $('#drawer').querySelector('[data-rs]').addEventListener('click',()=>{toast('Password reset link sent to '+u.em);closeDrawer();});
  $('#drawer').classList.add('show');$('#scrim2').classList.add('show');
}

/* ---------- add/edit/grant-role drawer (one form, three modes) ---------- */
let editingIndex=-1;
/* Mock "Doctors & Staff" master (P01-07) · the ONLY place department/branch are decided.
   Users, Roles & Permissions just links to a record here; it never asks the admin to re-pick org placement. */
const STAFF_DIRECTORY=[
  {label:'Dr. Harsh Atul · Doctor · no roster yet',        dept:'Consulting',  br:'Main Campus', em:'harsh.atul@awhclinics.in', ph:'90142 55671'},
  {label:'Dr. Raghavendra · Doctor · no roster yet',       dept:'Consulting',  br:'Main Campus', em:'raghavendra@awhclinics.in', ph:'90142 55672'},
  {label:'Dr. Sameera · Doctor · no roster yet',           dept:'OPD',         br:'OPD Annexe',  em:'sameera@awhclinics.in',    ph:'90142 55673'},
  {label:'New Front Desk hire · Reception · Main Campus',  dept:'OPD',         br:'Main Campus'},
  {label:'New Lab hire · Laboratory · Main Campus',        dept:'Laboratory',  br:'Main Campus'}
];
/* Primary Role (single-select, required · role[0] in storage) + Additional Roles (multi-select,
   role.slice(1), via the shared .mchk component) · replaces the old flat "Role(s)" multi-pick.
   Additional Roles always excludes whatever is currently Primary, and re-renders (pruning that
   role out of any existing selection) whenever Primary changes, so the same role can never be
   picked as both. No "add new" row here · new roles are created via "+ New custom role" below,
   which already updates ROLES/RCLR/etc.; a second local add-flow would fork that data. */
function fillPrimaryRoleOptions(){
  primaryRoleDD.setOptions(ROLES.map(r=>({value:r,title:r,sub:RDESC[r],av:ini(r)})));
}
function refreshAddRoleVocab(){
  const primary=primaryRoleDD.value;
  addRoleMchk.setVocab(Object.fromEntries(ROLES.filter(r=>r!==primary).map(r=>[r,r])));
  addRoleMchk.set(addRoleMchk.get().filter(r=>r!==primary));
}
let curStaffRec=null;
function showOrg(rec){
  curStaffRec=rec;
  $('#orgDept').textContent=rec&&rec.dept?rec.dept:'—';
  $('#orgBranch').textContent=rec&&rec.br?rec.br:'—';
  $('#orgEmail').textContent=rec&&rec.em&&rec.em!=='—'?rec.em:'—';
  $('#orgMobile').textContent=rec&&rec.ph?'+91 '+rec.ph:'—';
  /* Branch/Department ACCESS default-fills from the staff record only in Add-user mode · once a
     user exists, their access is independently editable and must not be silently reset every
     time this function runs (e.g. staff record refresh), per the "single source of truth for org
     placement, not for system access" model. */
  if(editingIndex<0){
    branchAccessMchk.set(rec&&rec.br?[rec.br]:[]);
    deptAccessMchk.set(rec&&rec.dept?[rec.dept]:[]);
  }
}

/* ---- generic custom-dropdown driver: one function wires any .cdrop instance, with a built-in
   search-to-filter box · same interaction pattern as the branch switcher on admin-dashboard.html ---- */
function makeDropdown(prefix,onPick){
  const root=$('#'+prefix+'Drop'),btn=$('#'+prefix+'Btn'),lbl=$('#'+prefix+'BtnLbl');
  const searchEl=$('#'+prefix+'Search'),emptyEl=$('#'+prefix+'Empty'),listSel='#'+prefix+'List';
  let value='',rows=[];
  const close=()=>{root.classList.remove('open');btn.setAttribute('aria-expanded','false');};
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
  const filter=q=>{
    q=q.trim().toLowerCase();
    draw(!q?rows:rows.filter(r=>(r.title+' '+(r.sub||'')).toLowerCase().includes(q)));
  };
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    if(root.classList.contains('locked'))return;
    const open=root.classList.toggle('open');
    btn.setAttribute('aria-expanded',open);
    if(open){searchEl.value='';filter('');searchEl.focus();}
  });
  searchEl.addEventListener('input',e=>filter(e.target.value));
  searchEl.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',e=>{if(!root.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  const api={
    setOptions(list){ rows=list; filter(searchEl.value); }, // rows: [{value,title,sub,av}]
    select(v,label){
      value=v;
      lbl.textContent=label||v;
      btn.classList.toggle('has-value',!!v);
      $$(listSel+' .cdrow').forEach(r=>r.classList.toggle('on',r.dataset.v===v));
      if(onPick)onPick(v);
    },
    reset(placeholder){ value=''; lbl.textContent=placeholder; btn.classList.remove('has-value'); $$(listSel+' .cdrow').forEach(r=>r.classList.remove('on')); },
    lock(text){ root.classList.add('locked'); value=text; lbl.textContent=text; btn.classList.add('has-value'); },
    unlock(){ root.classList.remove('locked'); },
    get value(){ return value; }
  };
  return api;
}
const staffDD=makeDropdown('staff',v=>{
  const rec=STAFF_DIRECTORY.find(s=>s.label===v);
  showOrg(rec);
  updatePreview();
});
const baseDD=makeDropdown('base');
const primaryRoleDD=makeDropdown('primaryRole',()=>{ refreshAddRoleVocab(); updatePreview(); });
/* Additional Roles / Branch Access / Department Access · real, variable-length master-data
   multi-selects, so they get the searchable .mchk component (not a flat .pick row). Branch
   Access and Department Access are backed by real master lists owned elsewhere (Clinic &
   Branches, Departments & Units) so neither gets an "add new" row. */
const addRoleMchk=initMchk('addRoleMchk','addRoleBtn','addRolePanel','addRoleChips', Object.fromEntries(ROLES.map(r=>[r,r])), 'Select additional roles…', true, updatePreview);
const branchAccessMchk=initMchk('branchAccessMchk','branchAccessBtn','branchAccessPanel','branchAccessChips', Object.fromEntries(BRANCH_OPTIONS.map(b=>[b,b])), 'Select branch access…', true, updatePreview);
const deptAccessMchk=initMchk('deptAccessMchk','deptAccessBtn','deptAccessPanel','deptAccessChips', Object.fromEntries(DEPT_OPTIONS.map(d=>[d,d])), 'Select department access…', true, updatePreview);
function fillStaffOptions(){
  staffDD.setOptions(STAFF_DIRECTORY.map(s=>({value:s.label,title:s.label.split('·')[0].trim(),sub:s.dept+' · '+s.br,av:ini(s.label.split('·')[0].trim())})));
}
function updatePreview(){
  const staffOk=staffDD.value!=='', loginOk=!!(curStaffRec&&curStaffRec.em&&curStaffRec.em!=='—');
  const roleOk=!!primaryRoleDD.value;
  $('#addSave').disabled=!(roleOk&&staffOk&&loginOk);
}
/* ---- Sensitive Identifier Access · single-select pick (Masked / Full), same interaction as
   the New-role drawer's badge-colour picker (colorPick) further down this file ---- */
$$('#sensitivePick button').forEach(b=>b.addEventListener('click',()=>{
  $$('#sensitivePick button').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');
}));
function presetSensitivePick(v){
  $$('#sensitivePick button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
}
function getSensitivePick(){
  const on=$('#sensitivePick button.on');
  return on?on.dataset.v:'Masked';
}

/* index omitted → Add-user mode. index given → Edit user / Grant role mode (staff link locked). */
function openUserForm(index,mode){
  editingIndex=(typeof index==='number')?index:-1;
  const u=editingIndex>=0?USERS[editingIndex]:null;
  fillPrimaryRoleOptions();
  if(u){
    fillStaffOptions();
    staffDD.lock(u.n+' (linked staff record)');
    showOrg(u);
    if(u.role&&u.role[0]) primaryRoleDD.select(u.role[0],u.role[0]); else primaryRoleDD.reset('— Select primary role —');
    refreshAddRoleVocab();
    addRoleMchk.set(u.role?u.role.slice(1):[]);
    branchAccessMchk.set(u.branchAccess&&u.branchAccess.length?u.branchAccess:[u.br]);
    deptAccessMchk.set(u.deptAccess&&u.deptAccess.length?u.deptAccess:[u.dept]);
    presetSensitivePick(u.sensitiveAccess||'Masked');
    $('#fClinicalSignoff').checked=!!u.clinicalSignoff;
    $('#fOperationalOverride').checked=!!u.operationalOverride;
    $('#formTitle').textContent=mode==='grant'?'Grant a role':'Edit user';
    $('#formSub').innerHTML=mode==='grant'
      ?'Select at least one role for <b>'+u.n+'</b> so the account can sign in'
      :'Update role for <b>'+u.n+'</b>. Contact details live in Doctors &amp; Staff';
    $('#addSave').innerHTML=mode==='grant'?'✓ Grant &amp; save':'Save changes';
  }else{
    staffDD.unlock();
    fillStaffOptions();
    staffDD.reset('— Select from Doctors & Staff —');
    showOrg(null);
    primaryRoleDD.reset('— Select primary role —');
    refreshAddRoleVocab();
    addRoleMchk.set([]);
    branchAccessMchk.set([]);
    deptAccessMchk.set([]);
    presetSensitivePick('Masked');
    $('#fClinicalSignoff').checked=false;
    $('#fOperationalOverride').checked=false;
    $('#formTitle').textContent='Add user';
    $('#formSub').innerHTML='Link an existing staff record · assign role(s)';
    $('#addSave').innerHTML='＋ Send invite';
  }
  updatePreview();
  $('#addDrawer').classList.add('show');$('#scrim2').classList.add('show');
}
const closeAdd=()=>{$('#addDrawer').classList.remove('show');$('#scrim2').classList.remove('show');};
$('#addBtn').addEventListener('click',()=>openUserForm());
$('#addClose').addEventListener('click',closeAdd);
$('#addCancel').addEventListener('click',closeAdd);
$('#addSave').addEventListener('click',()=>{
  const chosenRoles=[primaryRoleDD.value,...addRoleMchk.get()].filter(Boolean);
  const branchAccess=branchAccessMchk.get();
  const deptAccess=deptAccessMchk.get();
  const sensitiveAccess=getSensitivePick();
  const clinicalSignoff=$('#fClinicalSignoff').checked;
  const operationalOverride=$('#fOperationalOverride').checked;

  if(editingIndex>=0){
    const u=USERS[editingIndex];
    u.role=chosenRoles; /* dept/br/em/ph are not touched here · they belong to the staff record, correct them in Doctors & Staff */
    u.branchAccess=branchAccess.length?branchAccess:[u.br];
    u.deptAccess=deptAccess.length?deptAccess:[u.dept];
    u.sensitiveAccess=sensitiveAccess;
    u.clinicalSignoff=clinicalSignoff;
    u.operationalOverride=operationalOverride;
    uStats();renderUsers();
    toast(u.n+' updated'+(chosenRoles.length?', role granted':''));
  }else{
    const staffLabel=staffDD.value;
    const rec=STAFF_DIRECTORY.find(s=>s.label===staffLabel);
    if(!rec){toast('Pick a staff record first');return;}
    const name=staffLabel.split('·')[0].trim();
    USERS.push({n:name,id:'EMP-NEW-'+(USERS.length+1),role:chosenRoles.slice(),dept:rec.dept,br:rec.br,ph:rec.ph||'',em:rec.em||'—',last:'Just now',on:true,
      branchAccess:branchAccess.length?branchAccess:[rec.br],deptAccess:deptAccess.length?deptAccess:[rec.dept],
      sensitiveAccess:sensitiveAccess,clinicalSignoff:clinicalSignoff,operationalOverride:operationalOverride});
    uStats();renderUsers();
    $('#userTabCount').textContent='('+USERS.length+')';
    toast('Invite sent to '+name+(chosenRoles.length?'':' (no role yet)'));
  }
  closeAdd();
});

/* ---------- roles & permission matrix ---------- */
function renderRoleBar(){
  $('#roleBar').innerHTML=ROLES.map(r=>'<button class="rchip'+(r===curRole?' on':'')+'" data-r="'+r+'">'+r+'</button>').join('');
  $$('.rchip').forEach(c=>c.addEventListener('click',()=>{curRole=c.dataset.r;renderRoleBar();renderMatrix();renderDetailPerms();}));
}
function renderMatrix(){
  const lv=LEVELS[curRole];
  $('#roleTitle').textContent=curRole+' · permissions';
  $('#roleSub').textContent=RDESC[curRole].replace('&amp;','&');
  $('#pmx').innerHTML='<tr><th>Module</th>'+ACTIONS.map(a=>'<th>'+a+'</th>').join('')+'</tr>'
    +MODULES.map(m=>{
      const set=LSET[lv[m[0]]]||[];
      return '<tr><td>'+m[0]+'<span>'+m[1]+'</span></td>'
        +ACTIONS.map((a,ai)=>'<td><input type="checkbox" class="pmc" '+(set.includes(ai)?'checked':'')+' data-m="'+m[0]+'" data-a="'+a+'"></td>').join('')
        +'</tr>';
    }).join('');
  $$('.pmc').forEach(c=>c.addEventListener('change',()=>{
    toast(curRole+' · '+c.dataset.a+' on '+c.dataset.m+' '+(c.checked?'granted':'revoked'));
  }));
}
/* ---------- detailed Module → Screen → Action tree (additive, sits below the coarse matrix) ---------- */
function renderDetailPerms(){
  if(!DETAIL_LEVELS[curRole])DETAIL_LEVELS[curRole]=blankDetailLevel();
  const dl=DETAIL_LEVELS[curRole];
  $('#detailPerms').innerHTML=DETAIL_PERMS_DEF.map(m=>{
    const acts=dl[m.module]||{};
    return '<div class="dpmod"><div class="dpmh">'+m.module+'<span>'+m.screen+'</span></div><div class="dprow">'
      +m.actions.map(a=>'<label class="dpact"><input type="checkbox" class="dpc" '+(acts[a]?'checked':'')+' data-dm="'+m.module+'" data-da="'+a+'"> '+a+'</label>').join('')
      +'</div></div>';
  }).join('');
  $$('.dpc').forEach(c=>c.addEventListener('change',()=>{
    DETAIL_LEVELS[curRole][c.dataset.dm][c.dataset.da]=c.checked;
    toast(curRole+' · '+c.dataset.da+' on '+c.dataset.dm+' '+(c.checked?'granted':'revoked'));
  }));
}
/* ---------- new-role drawer (role builder) ---------- */
const COLORMAP={
  danger:['--danger-soft','--danger'], success:['--success-soft','--success'], info:['--info-soft','--info'],
  warning:['--warning-soft','--warning'], 'st-inconsult':['--st-inconsult-bg','--st-inconsult'],
  brand:['--brand-soft','--brand-2'], 'surface-3':['--surface-3','--ink-2']
};
function fillRoleBase(){
  baseDD.setOptions(ROLES.map(r=>({value:r,title:r,av:ini(r)})));
}
$$('#colorPick button').forEach(b=>b.addEventListener('click',()=>{
  $$('#colorPick button').forEach(x=>x.classList.remove('on'));
  b.classList.add('on');
}));
function validateRoleForm(){
  const name=$('#fRoleName').value.trim();
  const dup=name && ROLES.some(r=>r.toLowerCase()===name.toLowerCase());
  $('#roleNameHint').textContent=dup?'A role with this name already exists. Pick a different name.':'Give every custom role a name distinct from the 9 built-in KVNN roles.';
  $('#roleNameHint').style.color=dup?'var(--danger)':'var(--ink-muted)';
  $('#roleSave').disabled=!name||dup;
}
$('#fRoleName').addEventListener('input',validateRoleForm);
const closeRole=()=>{$('#roleDrawer').classList.remove('show');$('#scrim2').classList.remove('show');};
$('#newRole').addEventListener('click',()=>{
  fillRoleBase();
  $('#fRoleName').value='';baseDD.reset('— Start blank (no access) —');
  $$('#colorPick button').forEach(x=>x.classList.remove('on'));
  $('#colorPick button[data-c="surface-3"]').classList.add('on');
  validateRoleForm();
  $('#roleDrawer').classList.add('show');$('#scrim2').classList.add('show');
});
$('#roleClose').addEventListener('click',closeRole);
$('#roleCancel').addEventListener('click',closeRole);
$('#roleSave').addEventListener('click',()=>{
  const name=$('#fRoleName').value.trim();
  if(!name||ROLES.some(r=>r.toLowerCase()===name.toLowerCase()))return;
  const base=baseDD.value;
  const colorBtn=$('#colorPick button.on');
  const colorKey=colorBtn?colorBtn.dataset.c:'surface-3';
  ROLES.push(name);
  RCLR[name]=COLORMAP[colorKey];
  LEVELS[name]=base?{...LEVELS[base]}:Object.fromEntries(MODULES.map(m=>[m[0],0]));
  RDESC[name]=base?('Custom role, copied from '+base+'. Adjust module access below; every cell stays editable.'):'Custom role. Configure module access below.';
  DETAIL_LEVELS[name]=base&&DETAIL_LEVELS[base]?JSON.parse(JSON.stringify(DETAIL_LEVELS[base])):blankDetailLevel();
  curRole=name;
  uStats();renderRoleBar();renderMatrix();renderDetailPerms();
  document.querySelector('#tabs .tab[data-v="roles"]').click();
  closeRole();
  toast('Role "'+name+'" created. Customize its permissions below');
});

/* ---------------------------------------------------------------------------------------------
   Temporary Delegation (doc: Delegate From / Delegate To / Authority Type / Effective From /
   Effective Until / Reason · "Delegation auto-expires" · "Audit all delegation changes").
   Status (Active/Upcoming/Expired) is computed live from Effective From/Until against today's
   date · no manual "mark expired" action exists, matching "auto-expires" in the doc. Every
   create/revoke is appended to DELEGATION_HISTORY, this screen's audit-trail equivalent (the
   file has no other change-history/audit list to hook into, so a dedicated one is added here).
--------------------------------------------------------------------------------------------- */
let DELEGATIONS=[
  {id:1,from:'Dr. KVNN Santosh Murthy',to:'Dr. Hrishikesh Korada',type:'Clinical Sign-off Authority',eff:'2026-08-20',until:'2026-08-27',reason:'Annual leave · Dr. KVNN travelling, Dr. Hrishikesh covers clinical sign-offs',createdBy:'Rajeev Malhotra',createdOn:'18 Aug 2026, 10:20'},
  {id:2,from:'Rajeev Malhotra',to:'Sohela Farheen',type:'Operational Override Authority',eff:'2026-09-01',until:'2026-09-05',reason:'Madhurawada branch launch week · reception lead covers on-site capacity overrides',createdBy:'Rajeev Malhotra',createdOn:'21 Aug 2026, 16:05'}
];
let delegSeq=DELEGATIONS.length;
let DELEGATION_HISTORY=[
  {ts:'18 Aug 2026, 10:20',who:'Rajeev Malhotra',action:'Created delegation',detail:'Dr. KVNN Santosh Murthy → Dr. Hrishikesh Korada · Clinical Sign-off Authority · 20–27 Aug 2026'},
  {ts:'21 Aug 2026, 16:05',who:'Rajeev Malhotra',action:'Created delegation',detail:'Rajeev Malhotra → Sohela Farheen · Operational Override Authority · 1–5 Sep 2026'}
];
function fmtD(iso){
  const dt=new Date(iso+'T00:00:00');
  return dt.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function nowStr(){
  const d=new Date();
  return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+', '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
}
function delegStatus(d){
  const today=new Date();today.setHours(0,0,0,0);
  const from=new Date(d.eff+'T00:00:00'), until=new Date(d.until+'T00:00:00');
  if(today>until)return 'expired';
  if(today<from)return 'upcoming';
  return 'active';
}
function renderDelegations(){
  const active=DELEGATIONS.filter(d=>delegStatus(d)==='active').length;
  $('#delegTabCount').textContent=active?'('+active+')':'';
  $('#delegSub').textContent=DELEGATIONS.length+' delegation'+(DELEGATIONS.length===1?'':'s')+' · '+active+' active now. Status auto-updates from Effective From/Until';
  const STLBL={active:'Active',upcoming:'Upcoming',expired:'Expired'};
  $('#delegRows').innerHTML='<div class="dglh"><span>Delegate From</span><span>Delegate To</span><span>Authority Type</span><span>Effective period</span><span>Status</span><span></span></div>'
    +(DELEGATIONS.map(d=>{
      const st=delegStatus(d);
      return '<div class="dgrow" data-id="'+d.id+'">'
        +'<b>'+d.from+'</b>'
        +'<b>'+d.to+'</b>'
        +'<span style="font-size:12px">'+d.type+'</span>'
        +'<span style="font-size:11.5px;color:var(--ink-2)">'+fmtD(d.eff)+' – '+fmtD(d.until)+'</span>'
        +'<span class="dgstatus '+st+'">'+STLBL[st]+'</span>'
        +'<button class="iconb" title="'+(st==='expired'?'Already expired':'Revoke delegation')+'" data-revoke="'+d.id+'"'+(st==='expired'?' disabled style="opacity:.35;cursor:not-allowed"':'')+'><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
        +'</div>';
    }).join('')||'<div style="padding:30px;text-align:center;font-size:12.5px;color:var(--ink-muted)">No delegations yet. Use "+ New delegation" to hand over a temporary authority.</div>');
}
function renderDelegationHistory(){
  $('#delegHistory').innerHTML=DELEGATION_HISTORY.slice().reverse().map(h=>
    '<div class="delhist-row"><b>'+h.action+'</b> · '+h.detail+'<span class="meta">'+h.who+' · '+h.ts+'</span></div>'
  ).join('')||'<div style="padding:20px;text-align:center;font-size:12px;color:var(--ink-muted)">No delegation changes recorded yet.</div>';
}
document.addEventListener('click',e=>{
  const rv=e.target.closest('[data-revoke]');
  if(rv&&!rv.disabled){
    const id=+rv.dataset.revoke;
    const d=DELEGATIONS.find(x=>x.id===id);
    if(!d)return;
    DELEGATION_HISTORY.push({ts:nowStr(),who:'Rajeev Malhotra',action:'Revoked delegation',detail:d.from+' → '+d.to+' · '+d.type});
    DELEGATIONS=DELEGATIONS.filter(x=>x.id!==id);
    renderDelegations();renderDelegationHistory();
    toast(d.from+' → '+d.to+' delegation revoked');
  }
});
/* Authority type · single-select .f.fsel dropdown, same component as everywhere else in the app.
   opts[0] is an explicit blank placeholder (not the first real authority type) so this required
   field genuinely starts unset, matching the old button-row's no-button-on-load behavior. */
const delegTypeDD=initFsel('delegTypeWrap','delegTypeBtn','delegTypePanel','delegType',
  [['','— Select authority type —'], ...AUTHORITY_TYPES.map(t=>[t,t])],
  ()=>validateDelegForm());
const delegFromDD=makeDropdown('delegFrom',()=>validateDelegForm());
const delegToDD=makeDropdown('delegTo',()=>validateDelegForm());
function fillDelegUserOptions(){
  const opts=USERS.map(u=>({value:u.n,title:u.n,sub:u.dept+' · '+u.br,av:ini(u.n)}));
  delegFromDD.setOptions(opts);
  delegToDD.setOptions(opts);
}
function validateDelegForm(){
  const from=delegFromDD.value,to=delegToDD.value,type=delegTypeDD.get();
  const eff=$('#delegFrom').value,until=$('#delegUntil').value,reason=$('#delegReason').value.trim();
  let hint='Auto-expires at end of day on this date. No manual action needed.';
  let ok=!!(from&&to&&from!==to&&type&&eff&&until&&reason);
  if(from&&to&&from===to){hint='Delegate From and Delegate To must be different users.';ok=false;}
  else if(eff&&until&&until<eff){hint='Effective Until must be on or after Effective From.';ok=false;}
  $('#delegDateHint').textContent=hint;
  $('#delegDateHint').style.color=ok||!(from&&to&&eff&&until)?'var(--ink-muted)':'var(--danger)';
  $('#delegSave').disabled=!ok;
}
['delegFrom','delegUntil','delegReason'].forEach(id=>$('#'+id).addEventListener('input',validateDelegForm));
const closeDeleg=()=>{$('#delegDrawer').classList.remove('show');$('#scrim2').classList.remove('show');};
$('#newDeleg').addEventListener('click',()=>{
  fillDelegUserOptions();
  delegFromDD.reset('— Select user —');
  delegToDD.reset('— Select user —');
  delegTypeDD.set('');
  $('#delegFrom').value='';$('#delegUntil').value='';$('#delegReason').value='';
  validateDelegForm();
  $('#delegDrawer').classList.add('show');$('#scrim2').classList.add('show');
});
$('#delegClose').addEventListener('click',closeDeleg);
$('#delegCancel').addEventListener('click',closeDeleg);
$('#delegSave').addEventListener('click',()=>{
  const from=delegFromDD.value,to=delegToDD.value,type=delegTypeDD.get();
  const eff=$('#delegFrom').value,until=$('#delegUntil').value,reason=$('#delegReason').value.trim();
  if(!(from&&to&&from!==to&&type&&eff&&until&&reason))return;
  delegSeq+=1;
  DELEGATIONS.push({id:delegSeq,from:from,to:to,type:type,eff:eff,until:until,reason:reason,createdBy:'Rajeev Malhotra',createdOn:nowStr()});
  DELEGATION_HISTORY.push({ts:nowStr(),who:'Rajeev Malhotra',action:'Created delegation',detail:from+' → '+to+' · '+type+' · '+fmtD(eff)+' – '+fmtD(until)});
  renderDelegations();renderDelegationHistory();
  closeDeleg();
  toast(from+' → '+to+' delegation created');
});

/* ---------- tabs + search ---------- */
document.querySelectorAll('#tabs .tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('#tabs .tab').forEach(x=>x.classList.toggle('on',x===t));
  document.getElementById('uStats').style.display = t.dataset.v==='users' ? '' : 'none'; // pills belong to the Users list
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
  document.getElementById('view-'+t.dataset.v).classList.add('on');
}));
$('#q').addEventListener('input',e=>{query=e.target.value;renderUsers();});

$('#userTabCount').textContent='('+USERS.length+')';
uStats();renderUsers();renderRoleBar();renderMatrix();fillPrimaryRoleOptions();refreshAddRoleVocab();
renderDetailPerms();
renderDelegations();
renderDelegationHistory();

/* deep-link from Doctors & Staff's "Also create login access for them" checkbox */
const linkStaffName=new URLSearchParams(location.search).get('linkStaff');
if(linkStaffName){
  const existingIx=USERS.findIndex(u=>u.n===linkStaffName);
  if(existingIx>-1){
    openUser(existingIx); // already has a login · show their profile instead of creating a duplicate
  }else{
    openUserForm();
    const rec=STAFF_DIRECTORY.find(s=>s.label.indexOf(linkStaffName)===0);
    if(rec) staffDD.select(rec.label,rec.label.split('·')[0].trim());
    else toast('Pick '+linkStaffName+' from the staff list below once they’re in Doctors & Staff.');
  }
}

/* current-branch context switcher (shared across every admin screen) · kept inside this IIFE
   (moved up from after the closing braces) so it can actually reach makeDropdown()/toast() */
const CTX_BRANCHES = ['Main Campus','OPD Annexe','Madhurawada Branch'];
const ctxBrDD = makeDropdown('ctxBr', v => toast('Switched to ' + v));
ctxBrDD.setOptions(CTX_BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.select('Main Campus','Main Campus');
})();

