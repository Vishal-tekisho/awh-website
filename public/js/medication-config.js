document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

const STATUS = { active:{n:'Active',cls:'on'}, inactive:{n:'Inactive',cls:'warn'}, draft:{n:'Draft',cls:''} };

/* Supporting masters (Workspace 17 spec) · single source of truth for the dropdowns/chips below */
const DOSAGE_FORMS = ['Tablet','Capsule','Syrup','Cream','Injection','Ointment','Drops','Topical Solution','Inhaler'];
const ROUTES = ['Oral','Topical','IV','IM','Subcutaneous'];
const FREQUENCIES = ['Once Daily','Twice Daily','Three Times Daily','Custom'];
const TIMINGS = ['Morning','Night','Morning + Night'];
const DURATION_UNITS = ['Days','Weeks','Months'];
const FOOD_RELATIONS = ['Before Food','After Food','With Food','Not Specified'];
const RX_LIFECYCLE = [
  {n:'Draft', cls:'mute'},
  {n:'Issued / Active', cls:'ok'},
  {n:'Completed', cls:'info'},
  {n:'Stopped', cls:'warn'},
  {n:'Cancelled', cls:'bad'},
  {n:'Superseded', cls:'mute'}
];
/* Prescription print/output field toggles */
const PRINT_FIELDS = [
  {k:'clinicHeader', n:'Clinic Header', on:true},
  {k:'patientDetails', n:'Patient Details', on:true},
  {k:'doctorDetails', n:'Doctor Details', on:true},
  {k:'rxDate', n:'Prescription Date', on:true},
  {k:'medItems', n:'Medication Items', on:true},
  {k:'genericBrand', n:'Generic / Brand Display', on:true},
  {k:'dose', n:'Dose', on:true},
  {k:'route', n:'Route', on:true},
  {k:'frequency', n:'Frequency', on:true},
  {k:'duration', n:'Duration', on:true},
  {k:'quantity', n:'Quantity', on:false},
  {k:'instructions', n:'Instructions', on:true},
  {k:'diagnosis', n:'Linked Diagnosis / Reason', on:false},
  {k:'followUp', n:'Follow-up Instructions', on:true}
];

const FORMULARY = [
 {id:'md-1', name:'Amoxicillin-Clavulanate 625mg', generic:'Amoxicillin + Clavulanic Acid', form:'Tablet', strength:'625mg', route:'Oral', status:'active', updatedOn:'12 June 2024'},
 {id:'md-2', name:'Metformin 500mg', generic:'Metformin', form:'Tablet', strength:'500mg', route:'Oral', status:'active', updatedOn:'12 June 2024'},
 {id:'md-3', name:'Paracetamol 500mg', generic:'Paracetamol', form:'Tablet', strength:'500mg', route:'Oral', status:'active', updatedOn:'12 June 2024'},
 {id:'md-4', name:'Povidone-Iodine Solution', generic:'Povidone-Iodine', form:'Topical Solution', strength:'5%', route:'Topical', status:'active', updatedOn:'12 June 2024'},
 {id:'md-5', name:'Silver Sulfadiazine Cream', generic:'Silver Sulfadiazine', form:'Cream', strength:'1%', route:'Topical', status:'active', updatedOn:'12 June 2024'},
 {id:'md-6', name:'Telmisartan 40mg', generic:'Telmisartan', form:'Tablet', strength:'40mg', route:'Oral', status:'active', updatedOn:'03 February 2025'},
 {id:'md-7', name:'Cefixime 200mg', generic:'Cefixime', form:'Tablet', strength:'200mg', route:'Oral', status:'inactive', updatedOn:'10 August 2026'}
];

const BEHAVIOR = [
 {id:'bh-1', name:'Dose Units', detail:'mg, ml, drops, units, puffs configured', status:'active'},
 {id:'bh-2', name:'Route Masters', detail:'Oral, Topical, IV, IM, Subcutaneous', status:'active', options:ROUTES},
 {id:'bh-3', name:'Frequency Masters', detail:'OD, BD, TDS, QID, PRN, Weekly', status:'active', options:FREQUENCIES},
 {id:'bh-4', name:'PRN / As-Needed Option', detail:'Enabled · max-frequency note required when used', status:'active', prn:true},
 {id:'bh-5', name:'Food Instruction Options', detail:'Before food, After food, With food, Empty stomach', status:'active', options:['Before food','After food','With food','Empty stomach']},
 {id:'bh-6', name:'Stop / Supersede Reasons', detail:'Course completed, Adverse reaction, Ineffective, Patient request', status:'active',
   groups:[
     {label:'Stop reasons', options:['Course completed','Adverse reaction','Ineffective','Patient request']},
     {label:'Cancel reasons', options:['Entered in error','Duplicate order','Patient declined']},
     {label:'Supersede reasons', options:['Dose revised','Regimen changed','Switched to alternate medication']}
   ]},
 {id:'bh-7', name:'Doctor Sign-off Requirement', detail:'Mandatory before a prescription is finalized', status:'active'},
 {id:'bh-8', name:'Print / Share Template', detail:'Clinic letterhead + doctor signature block', status:'active'},
 {id:'bh-9', name:'Reconciliation Actions', detail:'Continue / Modify / Stop / Add New · shown during consultation', status:'active'},

 /* --- added: Workspace 17 supporting masters not previously wired as real dropdown data --- */
 {id:'bh-10', name:'Dosage Form Masters', detail:DOSAGE_FORMS.join(', '), status:'active', options:DOSAGE_FORMS},
 {id:'bh-11', name:'Timing Masters', detail:TIMINGS.join(', '), status:'active', options:TIMINGS},
 {id:'bh-12', name:'Duration Unit Masters', detail:DURATION_UNITS.join(', '), status:'active', options:DURATION_UNITS},
 {id:'bh-13', name:'Food Relation Masters', detail:FOOD_RELATIONS.join(', '), status:'active', options:FOOD_RELATIONS},
 {id:'bh-14', name:'Prescription Lifecycle', detail:"Workflow state of an issued prescription · separate from a formulary medication's own Active/Inactive status.", status:'active', lifecycle:RX_LIFECYCLE}
];

let activeTab = 'formulary';

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

const statDD = initFsel('statWrap','statBtn','statPanel','fStat', [['','All statuses'],['active','Active'],['inactive','Inactive']], applyFilters);

$('#tabSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  activeTab = b.dataset.t;
  $$('#tabSeg button').forEach(x=>x.classList.toggle('on', x===b));
  const isForm = activeTab==='formulary';
  $('#newBtnTxt').textContent = isForm ? 'Add medication' : 'Add behavior rule';
  $('#formularyView').style.display = isForm ? '' : 'none';
  $('#behaviorView').style.display = isForm ? 'none' : '';
  $('#formPills').style.display = isForm ? '' : 'none';
  if(!isForm) renderBehavior();
});

function renderStats(){
  $('#stTotal').textContent = FORMULARY.length;
  $('#stActive').textContent = FORMULARY.filter(e=>e.status==='active').length;
  $('#stInactive').textContent = FORMULARY.filter(e=>e.status==='inactive').length;
}
function renderRow(e){
  const st = STATUS[e.status];
  return `<tr>
    <td><b>${esc(e.name)}</b></td>
    <td><span class="s">${esc(e.generic)}</span></td>
    <td><span class="s">${esc(e.form)}</span></td>
    <td><span class="s">${esc(e.strength)}</span></td>
    <td><span class="s">${esc(e.route)}</span></td>
    <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td>
  </tr>`;
}
function applyFilters(){
  const q = $('#fSearch').value.trim().toLowerCase();
  const stat = statDD.get();
  const list = FORMULARY.filter(e => (!q || e.name.toLowerCase().includes(q) || e.generic.toLowerCase().includes(q)) && (!stat || e.status===stat));
  renderList(list);
}
function renderList(list){
  const body = $('#fBody');
  if(!list.length){
    body.innerHTML=''; $('#fEmpty').style.display='block';
    $('#fFoot').textContent = `Showing 0 of ${FORMULARY.length} medications`;
    return;
  }
  $('#fEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#fFoot').textContent = `Showing ${list.length} of ${FORMULARY.length} medications`;
}
$('#fSearch').addEventListener('input', applyFilters);

function renderBehavior(){
  $('#behaviorList').innerHTML = '<div class="rlist">' + BEHAVIOR.map(r => {
    const hasExtra = !!(r.options || r.groups || r.lifecycle);
    return `<div class="ritem${hasExtra?' stack':''}">
      <div class="ri-top">
        <div class="ri-main"><b>${esc(r.name)}</b><span class="s">${esc(r.detail)}</span></div>
        ${r.prn ? `<label class="sw" title="PRN option availability"><input type="checkbox" checked data-prn-toggle="${r.id}"><i></i></label>` : ''}
        <span class="stchip ${r.status==='active'?'on':''}"><i></i>${r.status==='active'?'Active':'Draft'}</span>
        <button class="mini" data-edit-beh="${r.id}" style="margin-left:8px">Edit</button>
      </div>
      ${r.options ? `<div class="mvals">${r.options.map(o=>`<span class="chip mute">${esc(o)}</span>`).join('')}</div>` : ''}
      ${r.groups ? r.groups.map(g=>`<div class="mgrp"><span class="lbl">${esc(g.label)}</span><div class="mvals">${g.options.map(o=>`<span class="chip mute">${esc(o)}</span>`).join('')}</div></div>`).join('') : ''}
      ${r.lifecycle ? `<div class="mvals">${r.lifecycle.map(s=>`<span class="chip ${esc(s.cls)}">${esc(s.n)}</span>`).join('')}</div><span class="lifenote">Distinct from a medication's own Active / Inactive formulary status (see Formulary tab).</span>` : ''}
    </div>`;
  }).join('') + '</div>';
}

function renderPrintFields(){
  $('#printFieldsList').innerHTML = PRINT_FIELDS.map(f => `
    <div class="pf-row">
      <b>${esc(f.n)}</b>
      <label class="sw"><input type="checkbox" ${f.on?'checked':''} data-print-field="${f.k}"><i></i></label>
    </div>`).join('');
}
document.addEventListener('click', e=>{
  const b = e.target.closest('[data-edit-beh]'); if(!b) return;
  const item = BEHAVIOR.find(x=>x.id===b.dataset.editBeh); if(!item) return;
  editingId = item.id;
  $('#dTitle').textContent = 'Edit behavior rule'; $('#dSub').textContent = item.name;
  $('#medOnlyGroup').style.display='none'; $('#behOnlyGroup').style.display='';
  $('#dNameLbl').textContent = 'Rule name';
  $('#dName').value = item.name; $('#dDetail').value = item.detail;
  segSet('dStatusSeg2', item.status);
  $('#dMetaWrap').style.display='none';
  openDrawer();
});

let editingId = null;
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId, v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b ? b.dataset.v : null; }
$('#dStatusSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dStatusSeg', b.dataset.v); });
$('#dStatusSeg2').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dStatusSeg2', b.dataset.v); });

$('#newBtn').addEventListener('click', ()=>{
  editingId = null;
  const isForm = activeTab==='formulary';
  $('#dNameLbl').textContent = isForm ? 'Medication name' : 'Rule name';
  $('#dTitle').textContent = isForm ? 'Add medication' : 'Add behavior rule';
  $('#dSub').textContent = isForm ? 'New formulary entry' : 'New prescription behavior rule';
  $('#medOnlyGroup').style.display = isForm ? '' : 'none';
  $('#behOnlyGroup').style.display = isForm ? 'none' : '';
  $('#dName').value=''; $('#dGeneric').value=''; $('#dForm').value=''; $('#dStrength').value=''; $('#dRoute').value=''; $('#dDetail').value='';
  segSet('dStatusSeg','active'); segSet('dStatusSeg2','active');
  $('#dMetaWrap').style.display='none';
  openDrawer();
});
$('#fBody').addEventListener('click', e=>{
  const b=e.target.closest('[data-edit]'); if(!b) return;
  const item = FORMULARY.find(x=>x.id===b.dataset.edit); if(!item) return;
  editingId = item.id;
  $('#dNameLbl').textContent = 'Medication name';
  $('#dTitle').textContent = 'Edit medication'; $('#dSub').textContent = item.name;
  $('#medOnlyGroup').style.display=''; $('#behOnlyGroup').style.display='none';
  $('#dName').value = item.name; $('#dGeneric').value = item.generic; $('#dForm').value = item.form; $('#dStrength').value = item.strength; $('#dRoute').value = item.route;
  segSet('dStatusSeg', item.status);
  $('#dMeta').textContent = 'Last updated ' + item.updatedOn;
  $('#dMetaWrap').style.display='block';
  openDrawer();
});
$('#dClose').addEventListener('click', closeDrawer);
$('#dCancel').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#drawer').classList.contains('show')) closeDrawer(); });

$('#dSave').addEventListener('click', ()=>{
  const name = $('#dName').value.trim();
  if(!name){ toast('Please fill the name'); return; }
  const isForm = $('#medOnlyGroup').style.display !== 'none';
  if(isForm){
    const newStatus = segGet('dStatusSeg');
    const existing = editingId ? FORMULARY.find(x=>x.id===editingId) : null;
    if(existing && existing.status==='active' && newStatus!=='active'){
      const deps = getMedDependencies(existing);
      if(deps.total>0){ openDependencyReview(existing, deps); return; }
    }
    saveMedication(name, newStatus);
  } else {
    const payload = { name, detail: $('#dDetail').value.trim()||'—', status: segGet('dStatusSeg2') };
    if(editingId){ Object.assign(BEHAVIOR.find(x=>x.id===editingId), payload); toast('Rule updated'); }
    else { BEHAVIOR.push(Object.assign({id:'bh-'+Date.now()}, payload)); toast('Rule added'); }
    closeDrawer(); renderBehavior();
  }
});
function saveMedication(name, status){
  const payload = { name, generic: $('#dGeneric').value.trim()||'—', form: $('#dForm').value.trim()||'—',
    strength: $('#dStrength').value.trim()||'—', route: $('#dRoute').value.trim()||'—', status, updatedOn: TODAY };
  if(editingId){ Object.assign(FORMULARY.find(x=>x.id===editingId), payload); toast('Medication updated'); }
  else { FORMULARY.push(Object.assign({id:'md-'+Date.now()}, payload)); toast('Medication added'); }
  closeDrawer(); renderStats(); applyFilters();
}

/* ---------- Dependency Review before deactivation ---------- */
const MED_DEPENDENCY_MOCK = {
  'md-1':{prescriptions:8,carePlans:2}, 'md-2':{prescriptions:14,carePlans:5}, 'md-3':{prescriptions:22,carePlans:0},
  'md-4':{prescriptions:3,carePlans:1}, 'md-5':{prescriptions:6,carePlans:3}, 'md-6':{prescriptions:9,carePlans:1}
};
function getMedDependencies(item){
  const d = MED_DEPENDENCY_MOCK[item.id] || {prescriptions:0, carePlans:0};
  return { prescriptions:d.prescriptions, carePlans:d.carePlans, total:d.prescriptions+d.carePlans };
}
let pendingDeactivation = null;
function openDependencyReview(item, deps){
  pendingDeactivation = { item, deps };
  $('#depSub').textContent = item.name;
  $('#depBody').innerHTML = `<p>This medication is currently used by:</p>
    <ul>
      ${deps.prescriptions>0?`<li><b>${deps.prescriptions}</b> future / active prescription${deps.prescriptions>1?'s':''}</li>`:''}
      ${deps.carePlans>0?`<li><b>${deps.carePlans}</b> active care plan${deps.carePlans>1?'s':''}</li>`:''}
    </ul>
    <p>Deactivating will hide it from new prescriptions, but existing records will keep referencing it.</p>`;
  $('#depScrim').classList.add('show');
  $('#depReviewBox').classList.add('show');
}
function closeDependencyReview(){
  pendingDeactivation = null;
  $('#depScrim').classList.remove('show');
  $('#depReviewBox').classList.remove('show');
}
$('#depClose').addEventListener('click', closeDependencyReview);
$('#depCancel').addEventListener('click', closeDependencyReview);
$('#depScrim').addEventListener('click', closeDependencyReview);
$('#depConfirm').addEventListener('click', ()=>{
  if(!pendingDeactivation) return;
  const name = $('#dName').value.trim();
  closeDependencyReview();
  saveMedication(name, segGet('dStatusSeg'));
});

/* populate the new Dosage Form / Route dropdowns from the supporting masters above */
$('#dForm').innerHTML = '<option value="">Select dosage form…</option>' + DOSAGE_FORMS.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join('');
$('#dRoute').innerHTML = '<option value="">Select route…</option>' + ROUTES.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join('');

document.addEventListener('change', e=>{
  const p = e.target.closest('[data-prn-toggle]');
  if(p){ const row = BEHAVIOR.find(x=>x.id===p.dataset.prnToggle); toast((p.checked?'PRN option enabled':'PRN option disabled') + (row?': '+row.name:'')); return; }
  const f = e.target.closest('[data-print-field]');
  if(f){ const field = PRINT_FIELDS.find(x=>x.k===f.dataset.printField); if(field){ field.on = f.checked; toast((field.on?'Showing "':'Hiding "')+field.n+'" on the printed prescription'); } }
});
$('#btnPreviewPrint').addEventListener('click', ()=> toast('Opening print preview…'));
$('#btnPreviewPdf').addEventListener('click', ()=> toast('Generating PDF preview…'));
$('#btnPublishPrintCfg').addEventListener('click', ()=> toast('Print/output configuration published'));

renderStats();
applyFilters();
renderBehavior();
renderPrintFields();

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

