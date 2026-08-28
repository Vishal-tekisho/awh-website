document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

/* Order status lifecycle and Plan status lifecycle are deliberately two separate vocabularies —
   an order (Clinical Order → Scheduling Demand → Scheduled Session → Performed Care/Result) is not
   the same kind of record as a care-plan template, so they never share one STATUS object. */
const ORDER_STATUS_ORDER = ['draft','ordered','pending_scheduling','scheduled','in_fulfilment','completed','on_hold','cancelled','not_completed'];
const ORDER_STATUS = {
  draft:{n:'Draft',cls:''},
  ordered:{n:'Ordered',cls:'info'},
  pending_scheduling:{n:'Pending Scheduling',cls:'warn'},
  scheduled:{n:'Scheduled',cls:'pur'},
  in_fulfilment:{n:'In Fulfilment',cls:'on'},
  completed:{n:'Completed',cls:'on'},
  on_hold:{n:'On Hold',cls:'warn'},
  cancelled:{n:'Cancelled',cls:'bad'},
  not_completed:{n:'Not Completed',cls:'bad'}
};
/* Admin-configurable allowed transitions · an order can only advance to one of these next statuses.
   Draft can never reach Completed directly; it has to pass through the chain below. Edited live from
   the "Configure transitions" drawer. */
let ORDER_TRANSITIONS = {
  draft: ['ordered','cancelled'],
  ordered: ['pending_scheduling','on_hold','cancelled'],
  pending_scheduling: ['scheduled','on_hold','cancelled'],
  scheduled: ['in_fulfilment','on_hold','cancelled','not_completed'],
  in_fulfilment: ['completed','on_hold','not_completed'],
  on_hold: ['ordered','pending_scheduling','scheduled','in_fulfilment','cancelled'],
  completed: [],
  cancelled: [],
  not_completed: []
};

const PLAN_STATUS_ORDER = ['draft','active','paused','revised','completed','cancelled'];
const PLAN_STATUS = {
  draft:{n:'Draft',cls:''},
  active:{n:'Active',cls:'on'},
  paused:{n:'Paused',cls:'warn'},
  revised:{n:'Revised',cls:'info'},
  completed:{n:'Completed',cls:'on'},
  cancelled:{n:'Cancelled',cls:'bad'}
};

const CATS = { lab:'Lab', treatment:'Treatment', procedure:'Procedure', service:'Service' };
const PRIO = { routine:'Routine', urgent:'Urgent' };
/* Diagnosis Link / Preferred Performer / Preferred Location / Follow-up / Schedule Generation
   Behaviour option labels live directly on their <select> elements in the drawer markup. */

const ORDERS = [
 {id:'ot-1', name:'HbA1c &amp; Blood Sugar Panel', code:'LAB-HBA1C-01', cat:'lab', priority:'routine', sched:'Demand-only · patient sent to lab, no capacity block', status:'completed', updatedOn:'20 July 2026',
  clinIndication:true, diagLink:'optional', bodySite:false, laterality:false, reqDate:'window', sessionCount:1, frequency:'One-time', prepInstructions:'Patient to fast 8 hours before sample collection', prefPerformer:'any', prefLocation:'any', followup:'none', doctorSignoff:true,
  schedCreatePending:true, schedRecurringPreview:false, schedManualRequired:false, schedRequireValidation:false},
 {id:'ot-2', name:'Wound Swab Culture', code:'LAB-SWAB-02', cat:'lab', priority:'urgent', sched:'Demand-only · processed same day where possible', status:'in_fulfilment', updatedOn:'22 July 2026',
  clinIndication:true, diagLink:'required', bodySite:true, laterality:true, reqDate:'exact', sessionCount:1, frequency:'One-time', prepInstructions:'Collect swab before dressing change; label site and laterality', prefPerformer:'any', prefLocation:'branch', followup:'auto', doctorSignoff:true,
  schedCreatePending:true, schedRecurringPreview:false, schedManualRequired:false, schedRequireValidation:false},
 {id:'ot-3', name:'Wound Debridement', code:'PROC-DEBRIDE-03', cat:'procedure', priority:'routine', sched:'Reserve/block · holds Procedure Room 1 capacity on approval', status:'scheduled', updatedOn:'20 July 2026',
  clinIndication:true, diagLink:'required', bodySite:true, laterality:true, reqDate:'window', sessionCount:1, frequency:'One-time', prepInstructions:'Procedure Room 1 setup; sterile field, local anaesthesia kit', prefPerformer:'specific', prefLocation:'specific', followup:'prompt', doctorSignoff:true,
  schedCreatePending:true, schedRecurringPreview:false, schedManualRequired:false, schedRequireValidation:true},
 {id:'ot-4', name:'NPWT Course Order', code:'TRT-NPWT-04', cat:'treatment', priority:'routine', sched:'Draft session · generates draft sessions for doctor confirmation', status:'pending_scheduling', updatedOn:'22 July 2026',
  clinIndication:true, diagLink:'required', bodySite:true, laterality:true, reqDate:'window', sessionCount:6, frequency:'Every 3 days', prepInstructions:'NPWT canister and dressing kit sized to wound', prefPerformer:'department', prefLocation:'any', followup:'required', doctorSignoff:true,
  schedCreatePending:true, schedRecurringPreview:true, schedManualRequired:false, schedRequireValidation:true},
 {id:'ot-5', name:'Dressing Change Series', code:'TRT-DRESS-05', cat:'treatment', priority:'routine', sched:'Manual scheduling · Reception confirms each session', status:'ordered', updatedOn:'18 July 2026',
  clinIndication:false, diagLink:'optional', bodySite:true, laterality:false, reqDate:'window', sessionCount:8, frequency:'Twice weekly', prepInstructions:'Standard dressing pack', prefPerformer:'any', prefLocation:'any', followup:'none', doctorSignoff:false,
  schedCreatePending:false, schedRecurringPreview:false, schedManualRequired:true, schedRequireValidation:false},
 {id:'ot-6', name:'Post-Consult Review Order', code:'SVC-REVIEW-06', cat:'service', priority:'routine', sched:'Manual scheduling · Reception books the review slot', status:'draft', updatedOn:'15 August 2026',
  clinIndication:false, diagLink:'hidden', bodySite:false, laterality:false, reqDate:'window', sessionCount:1, frequency:'One-time', prepInstructions:'—', prefPerformer:'ordering', prefLocation:'any', followup:'none', doctorSignoff:false,
  schedCreatePending:false, schedRecurringPreview:false, schedManualRequired:true, schedRequireValidation:false},
 {id:'ot-7', name:'Compression Therapy Fitting', code:'PROC-COMPFIT-07', cat:'procedure', priority:'urgent', sched:'Reserve/block · holds fitting bay capacity on approval', status:'on_hold', updatedOn:'12 August 2026',
  clinIndication:true, diagLink:'required', bodySite:true, laterality:true, reqDate:'exact', sessionCount:1, frequency:'One-time', prepInstructions:'Confirm limb measurements before fitting', prefPerformer:'specific', prefLocation:'specific', followup:'prompt', doctorSignoff:true,
  schedCreatePending:true, schedRecurringPreview:false, schedManualRequired:false, schedRequireValidation:true},
 {id:'ot-8', name:'Supported Home-Care Nursing Visit', code:'SVC-HOMECARE-08', cat:'service', priority:'routine', sched:'Manual scheduling · Care Desk confirms each visit', status:'not_completed', updatedOn:'10 August 2026',
  clinIndication:false, diagLink:'optional', bodySite:false, laterality:false, reqDate:'window', sessionCount:4, frequency:'Weekly', prepInstructions:'—', prefPerformer:'department', prefLocation:'home', followup:'none', doctorSignoff:false,
  schedCreatePending:false, schedRecurringPreview:false, schedManualRequired:true, schedRequireValidation:false},
 {id:'ot-9', name:'Diabetic Foot Screening Panel', code:'LAB-DFSCREEN-09', cat:'lab', priority:'routine', sched:'Demand-only · patient sent to lab, no capacity block', status:'cancelled', updatedOn:'5 August 2026',
  clinIndication:true, diagLink:'optional', bodySite:false, laterality:false, reqDate:'window', sessionCount:1, frequency:'One-time', prepInstructions:'—', prefPerformer:'any', prefLocation:'any', followup:'none', doctorSignoff:false,
  schedCreatePending:false, schedRecurringPreview:false, schedManualRequired:false, schedRequireValidation:false}
];

const PLANS = [
 {id:'cp-1', name:'Diabetic Foot Ulcer Care Plan', applicableDx:'Diabetic Foot Ulcer (Wagner Grade 1-2)', activities:'Debridement, dressing, HbA1c monitoring', goals:'Wound area reduction ≥50% by week 6; HbA1c <7.5%', defFrequency:'Twice weekly', defDuration:'12 weeks', planSessionCount:24, freqDur:'Twice weekly for 12 weeks', review:'Doctor review every 4 sessions', doctorSignoff:true, schedGen:'nextn', capPolicy:'Reserve next 4 sessions on approval', status:'active', updatedOn:'20 July 2026'},
 {id:'cp-2', name:'Post-Surgical Recovery Plan', applicableDx:'Post-operative wound, surgical site', activities:'Dressing series, suture removal', goals:'Full wound closure; suture line healed without infection', defFrequency:'Weekly', defDuration:'6 weeks', planSessionCount:6, freqDur:'Weekly for 6 weeks', review:'Review at session 3', doctorSignoff:true, schedGen:'checkpoint', capPolicy:'Draft sessions generated weekly', status:'completed', updatedOn:'18 July 2026'},
 {id:'cp-3', name:'Pressure Ulcer Management Plan', applicableDx:'Pressure Injury Stage II-III', activities:'Repositioning coordination, dressing', goals:'Prevent progression; granulation tissue coverage ≥80%', defFrequency:'Twice weekly', defDuration:'Ongoing', planSessionCount:0, freqDur:'Twice weekly, ongoing', review:'Biweekly doctor review', doctorSignoff:true, schedGen:'manual', capPolicy:'Manual scheduling only', status:'paused', updatedOn:'22 July 2026'},
 {id:'cp-4', name:'Venous Ulcer Compression Plan', applicableDx:'Venous Leg Ulcer with chronic venous insufficiency', activities:'Compression therapy, weekly review', goals:'Reduce oedema; wound closure by week 12', defFrequency:'Weekly', defDuration:'12 weeks', planSessionCount:12, freqDur:'Weekly for 12 weeks', review:'Doctor review at week 6', doctorSignoff:false, schedGen:'nextn', capPolicy:'Reserve next 4 sessions on approval', status:'draft', updatedOn:'15 August 2026'},
 {id:'cp-5', name:'Diabetic Foot Ulcer Care Plan · Revision 2', applicableDx:'Diabetic Foot Ulcer (Wagner Grade 1-2)', activities:'Dressing, HbA1c monitoring', goals:'Revised after 3 completed sessions · reduce frequency as wound improves', defFrequency:'Weekly (revised down from twice weekly)', defDuration:'8 remaining weeks', planSessionCount:8, freqDur:'Weekly for the remaining 8 weeks', review:'Doctor review every 2 sessions', doctorSignoff:true, schedGen:'checkpoint', capPolicy:'Reserve next 4 sessions on approval', status:'revised', updatedOn:'19 August 2026'},
 {id:'cp-6', name:'Post-Mastectomy Drain Care Plan', applicableDx:'Post-mastectomy surgical drain site', activities:'Drain output check, dressing', goals:'Drain output monitoring until removal criteria met', defFrequency:'Daily', defDuration:'2 weeks', planSessionCount:14, freqDur:'Daily for 2 weeks', review:'Review at day 7', doctorSignoff:false, schedGen:'manual', capPolicy:'Manual scheduling only', status:'cancelled', updatedOn:'8 August 2026'}
];

let activeTab = 'order';

function initFsel(wrapId,btnId,panelId,hiddenId,initOpts,onPick){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  let opts = initOpts;
  const setVal=(v,silent)=>{
    hidden.value=v;
    const found=opts.find(o=>o[0]===v);
    btn.textContent = found ? found[1] : opts[0][1];
    $$('.fselopt',panel).forEach(x=>x.classList.toggle('on', x.dataset.v===v));
    if(!silent && onPick) onPick(v);
  };
  const buildPanel=()=>{ panel.innerHTML = opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+v+'">'+l+'</button>').join(''); };
  buildPanel();
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
  return { set:v=>setVal(v,true), get:()=>hidden.value, setOptions:newOpts=>{ opts=newOpts; buildPanel(); setVal(opts[0][0], true); } };
}
document.addEventListener('click', ()=>$$('.f.fsel').forEach(x=>x.classList.remove('open')));

/* Status filter options are tab-aware · Order Types filter by the 9-state order lifecycle,
   Care Plan Templates filter by the 6-state plan lifecycle. Never mixed. */
function statusFilterOpts(){
  return activeTab==='order'
    ? [['','All statuses'], ...ORDER_STATUS_ORDER.map(k=>[k,ORDER_STATUS[k].n])]
    : [['','All statuses'], ...PLAN_STATUS_ORDER.map(k=>[k,PLAN_STATUS[k].n])];
}
const statDD = initFsel('statWrap','statBtn','statPanel','fStat', statusFilterOpts(), applyFilters);

$('#tabSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  activeTab = b.dataset.t;
  $$('#tabSeg button').forEach(x=>x.classList.toggle('on', x===b));
  $('#newBtnTxt').textContent = activeTab==='order' ? 'Add order type' : 'Add plan template';
  $('#oSearch').value=''; statDD.setOptions(statusFilterOpts());
  $('#orderNote').style.display = activeTab==='order' ? '' : 'none';
  $('#planNote').style.display = activeTab==='plan' ? '' : 'none';
  $('#orderLifecycleCard').style.display = activeTab==='order' ? '' : 'none';
  $('#planLifecycleCard').style.display = activeTab==='plan' ? '' : 'none';
  renderHead();
  applyFilters();
});

function renderHead(){
  $('#tblHead').innerHTML = activeTab==='order'
    ? '<tr><th>Order Type</th><th>Code</th><th>Category</th><th>Priority</th><th>Scheduling Behavior</th><th>Status</th><th style="text-align:right">Actions</th></tr>'
    : '<tr><th>Plan Template</th><th>Allowed Activities</th><th>Frequency / Duration</th><th>Review</th><th>Status</th><th style="text-align:right">Actions</th></tr>';
}
function dataset(){ return activeTab==='order' ? ORDERS : PLANS; }
function statusMapFor(){ return activeTab==='order' ? ORDER_STATUS : PLAN_STATUS; }

function renderRow(e){
  const st = statusMapFor()[e.status];
  if(activeTab==='order'){
    return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.code)}</span></td><td><span class="s">${CATS[e.cat]}</span></td><td><span class="chip ${e.priority==='urgent'?'bad':'mute'}">${PRIO[e.priority]}</span></td>
      <td><span class="s">${esc(e.sched)}</span></td><td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.activities)}</span></td><td><span class="s">${esc(e.freqDur)}</span></td>
    <td><span class="s">${esc(e.review)}</span></td><td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
}
/* pill #2 means different things per tab · orders have no literal "Active" status, so it counts
   orders actively moving through the pipeline; plans keep their literal Active status */
const PILL_CFG = {
  order: { lbl:'In Progress', test:s=>['ordered','pending_scheduling','scheduled','in_fulfilment'].includes(s) },
  plan: { lbl:'Active', test:s=>s==='active' }
};
function renderStats(){
  const list = dataset();
  $('#stTotalLbl').textContent = activeTab==='order' ? 'Total order types' : 'Total plan templates';
  $('#stTotal').textContent = list.length;
  const cfg = PILL_CFG[activeTab];
  $('#stActiveLbl').textContent = cfg.lbl;
  $('#stActive').textContent = list.filter(e=>cfg.test(e.status)).length;
  $('#stDraft').textContent = list.filter(e=>e.status==='draft').length;
}
function applyFilters(){
  const q = $('#oSearch').value.trim().toLowerCase();
  const stat = statDD.get();
  const list = dataset().filter(e => (!q || e.name.toLowerCase().includes(q)) && (!stat || e.status===stat));
  renderList(list);
}
function renderList(list){
  const full = dataset();
  const body = $('#oBody');
  $('#oEmptyTxt').textContent = 'No entries match these filters';
  if(!list.length){
    body.innerHTML=''; $('#oEmpty').style.display='block';
    $('#oFoot').textContent = `Showing 0 of ${full.length} entries`;
    return;
  }
  $('#oEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#oFoot').textContent = `Showing ${list.length} of ${full.length} entries`;
}
$('#oSearch').addEventListener('input', applyFilters);

let editingId = null;
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId, v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b ? b.dataset.v : null; }
$$('#dCatSeg,#dPrioSeg,#dReqDateSeg').forEach(seg=>{
  seg.addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet(seg.id, b.dataset.v); });
});
/* Status control is a plain <select> (not mseg) because it must hold 9 order states or 6 plan
   states · mseg toggle rows are only meant for a handful of options. */
function populateStatusSelect(map, order, value){
  const sel = $('#dStatusSelect');
  sel.innerHTML = order.map(k=>'<option value="'+k+'">'+map[k].n+'</option>').join('');
  sel.value = value;
}

$('#newBtn').addEventListener('click', ()=>{
  editingId = null;
  const isOrder = activeTab==='order';
  $('#dNameLbl').textContent = isOrder ? 'Order type name' : 'Plan template name';
  $('#dTitle').textContent = isOrder ? 'Add order type' : 'Add plan template';
  $('#dSub').textContent = isOrder ? 'New clinical order type' : 'New care plan template';
  $('#orderOnlyGroup').style.display = isOrder ? '' : 'none';
  $('#planOnlyGroup').style.display = isOrder ? 'none' : '';
  $('#dName').value='';
  if(isOrder){
    $('#dCode').value=''; segSet('dCatSeg','lab'); segSet('dPrioSeg','routine');
    $('#dClinIndication').checked=false; $('#dDiagLink').value='optional';
    $('#dBodySite').checked=false; $('#dLaterality').checked=false;
    segSet('dReqDateSeg','exact'); $('#dSessionCount').value=''; $('#dFrequency').value='';
    $('#dPrepInstructions').value=''; $('#dPrefPerformer').value='any'; $('#dPrefLocation').value='any';
    $('#dFollowup').value='none'; $('#dDoctorSignoff').checked=false;
    $('#dSchedBehavior').value='';
    $('#dSchedCreatePending').checked=false; $('#dSchedRecurringPreview').checked=false;
    $('#dSchedManualRequired').checked=false; $('#dSchedRequireValidation').checked=false;
    populateStatusSelect(ORDER_STATUS, ORDER_STATUS_ORDER, 'draft');
  } else {
    $('#dApplicableDx').value=''; $('#dActivities').value=''; $('#dGoals').value='';
    $('#dDefFrequency').value=''; $('#dDefDuration').value=''; $('#dPlanSessionCount').value='';
    $('#dFreqDur').value=''; $('#dReview').value=''; $('#dPlanDoctorSignoff').checked=false;
    $('#dSchedGenBehavior').value='allsessions'; $('#dCapPolicy').value='';
    populateStatusSelect(PLAN_STATUS, PLAN_STATUS_ORDER, 'draft');
  }
  $('#dMetaWrap').style.display='none';
  openDrawer();
});
$('#oBody').addEventListener('click', e=>{
  const b=e.target.closest('[data-edit]'); if(!b) return;
  const item = dataset().find(x=>x.id===b.dataset.edit); if(!item) return;
  editingId = item.id;
  const isOrder = activeTab==='order';
  $('#dNameLbl').textContent = isOrder ? 'Order type name' : 'Plan template name';
  $('#dTitle').textContent = 'Edit ' + (isOrder?'order type':'plan template');
  $('#dSub').textContent = item.name;
  $('#orderOnlyGroup').style.display = isOrder ? '' : 'none';
  $('#planOnlyGroup').style.display = isOrder ? 'none' : '';
  $('#dName').value = item.name;
  if(isOrder){
    $('#dCode').value = item.code||''; segSet('dCatSeg', item.cat); segSet('dPrioSeg', item.priority);
    $('#dClinIndication').checked = !!item.clinIndication; $('#dDiagLink').value = item.diagLink||'optional';
    $('#dBodySite').checked = !!item.bodySite; $('#dLaterality').checked = !!item.laterality;
    segSet('dReqDateSeg', item.reqDate||'exact'); $('#dSessionCount').value = item.sessionCount||''; $('#dFrequency').value = item.frequency||'';
    $('#dPrepInstructions').value = item.prepInstructions||''; $('#dPrefPerformer').value = item.prefPerformer||'any'; $('#dPrefLocation').value = item.prefLocation||'any';
    $('#dFollowup').value = item.followup||'none'; $('#dDoctorSignoff').checked = !!item.doctorSignoff;
    $('#dSchedBehavior').value = item.sched;
    $('#dSchedCreatePending').checked = !!item.schedCreatePending; $('#dSchedRecurringPreview').checked = !!item.schedRecurringPreview;
    $('#dSchedManualRequired').checked = !!item.schedManualRequired; $('#dSchedRequireValidation').checked = !!item.schedRequireValidation;
    populateStatusSelect(ORDER_STATUS, ORDER_STATUS_ORDER, item.status);
  } else {
    $('#dApplicableDx').value = item.applicableDx||''; $('#dActivities').value = item.activities; $('#dGoals').value = item.goals||'';
    $('#dDefFrequency').value = item.defFrequency||''; $('#dDefDuration').value = item.defDuration||''; $('#dPlanSessionCount').value = item.planSessionCount||'';
    $('#dFreqDur').value = item.freqDur; $('#dReview').value = item.review; $('#dPlanDoctorSignoff').checked = !!item.doctorSignoff;
    $('#dSchedGenBehavior').value = item.schedGen||'allsessions'; $('#dCapPolicy').value = item.capPolicy;
    populateStatusSelect(PLAN_STATUS, PLAN_STATUS_ORDER, item.status);
  }
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
  const isOrder = activeTab==='order';
  let payload;
  if(isOrder) payload = {
    name, code: $('#dCode').value.trim()||'—', cat: segGet('dCatSeg'), priority: segGet('dPrioSeg'),
    clinIndication: $('#dClinIndication').checked, diagLink: $('#dDiagLink').value, bodySite: $('#dBodySite').checked, laterality: $('#dLaterality').checked,
    reqDate: segGet('dReqDateSeg'), sessionCount: Number($('#dSessionCount').value)||0, frequency: $('#dFrequency').value.trim()||'—',
    prepInstructions: $('#dPrepInstructions').value.trim()||'—', prefPerformer: $('#dPrefPerformer').value, prefLocation: $('#dPrefLocation').value,
    followup: $('#dFollowup').value, doctorSignoff: $('#dDoctorSignoff').checked,
    sched: $('#dSchedBehavior').value.trim()||'—',
    schedCreatePending: $('#dSchedCreatePending').checked, schedRecurringPreview: $('#dSchedRecurringPreview').checked,
    schedManualRequired: $('#dSchedManualRequired').checked, schedRequireValidation: $('#dSchedRequireValidation').checked,
    status: $('#dStatusSelect').value, updatedOn: TODAY
  };
  else payload = {
    name, applicableDx: $('#dApplicableDx').value.trim()||'—', activities: $('#dActivities').value.trim()||'—', goals: $('#dGoals').value.trim()||'—',
    defFrequency: $('#dDefFrequency').value.trim()||'—', defDuration: $('#dDefDuration').value.trim()||'—', planSessionCount: Number($('#dPlanSessionCount').value)||0,
    freqDur: $('#dFreqDur').value.trim()||'—', review: $('#dReview').value.trim()||'—', doctorSignoff: $('#dPlanDoctorSignoff').checked,
    schedGen: $('#dSchedGenBehavior').value, capPolicy: $('#dCapPolicy').value.trim()||'—',
    status: $('#dStatusSelect').value, updatedOn: TODAY
  };

  if(editingId){
    Object.assign(dataset().find(x=>x.id===editingId), payload);
    toast('Updated');
  } else {
    dataset().push(Object.assign({id:(isOrder?'ot-':'cp-')+Date.now()}, payload));
    toast('Added');
  }
  closeDrawer();
  renderStats(); applyFilters();
});

/* ---------- order status lifecycle: on-page display + admin-configurable transition rules ---------- */
const LIFECYCLE_MAIN = ['draft','ordered','pending_scheduling','scheduled','in_fulfilment','completed'];
const LIFECYCLE_BRANCH = ['on_hold','cancelled','not_completed'];
const flowArrow = '<svg class="arw" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

function renderLifecycle(){
  $('#lifecycleFlow').innerHTML = LIFECYCLE_MAIN.map((k,i)=>
    '<span class="stchip '+ORDER_STATUS[k].cls+'"><i></i>'+ORDER_STATUS[k].n+'</span>' + (i<LIFECYCLE_MAIN.length-1?flowArrow:'')
  ).join('');
  $('#lifecycleBranch').innerHTML = LIFECYCLE_BRANCH.map(k=>
    '<span class="stchip '+ORDER_STATUS[k].cls+'"><i></i>'+ORDER_STATUS[k].n+'</span>'
  ).join(' ');
  $('#lifecycleLegend').innerHTML = ORDER_STATUS_ORDER.map(k=>
    esc(ORDER_STATUS[k].n) + ' → ' + (ORDER_TRANSITIONS[k].length ? ORDER_TRANSITIONS[k].map(t=>ORDER_STATUS[t].n).join(', ') : '(terminal, no further transition)')
  ).join(' &nbsp;·&nbsp; ');
}
function renderPlanFlow(){
  $('#planFlow').innerHTML = PLAN_STATUS_ORDER.map((k,i)=>
    '<span class="stchip '+PLAN_STATUS[k].cls+'"><i></i>'+PLAN_STATUS[k].n+'</span>' + (i<PLAN_STATUS_ORDER.length-1?flowArrow:'')
  ).join('');
}
function renderTransList(){
  $('#transList').innerHTML = ORDER_STATUS_ORDER.map(from=>{
    const chips = ORDER_STATUS_ORDER.filter(to=>to!==from).map(to=>{
      const allowed = ORDER_TRANSITIONS[from].includes(to);
      return '<button type="button" class="chip toggle '+(allowed?'ok':'off mute')+'" data-from="'+from+'" data-to="'+to+'">'+ORDER_STATUS[to].n+'</button>';
    }).join('');
    return '<div class="transrow"><div class="tfrom"><span class="stchip '+ORDER_STATUS[from].cls+'"><i></i>'+ORDER_STATUS[from].n+'</span><span class="hint" style="margin-top:0">can move to →</span></div><div class="transchips">'+chips+'</div></div>';
  }).join('');
}
$('#transList').addEventListener('click', e=>{
  const b=e.target.closest('.chip.toggle'); if(!b) return;
  const from=b.dataset.from, to=b.dataset.to;
  const list = ORDER_TRANSITIONS[from];
  const idx = list.indexOf(to);
  if(idx>-1) list.splice(idx,1); else list.push(to);
  renderTransList();
});
function openTransDrawer(){ renderTransList(); $('#transScrim').classList.add('show'); $('#transDrawer').classList.add('show'); }
function closeTransDrawer(){ $('#transScrim').classList.remove('show'); $('#transDrawer').classList.remove('show'); }
$('#configTransBtn').addEventListener('click', openTransDrawer);
$('#dOpenTransFromDrawer').addEventListener('click', openTransDrawer);
$('#transClose').addEventListener('click', closeTransDrawer);
$('#transCancel').addEventListener('click', closeTransDrawer);
$('#transScrim').addEventListener('click', closeTransDrawer);
$('#transSave').addEventListener('click', ()=>{ closeTransDrawer(); renderLifecycle(); toast('Transition rules saved'); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#transDrawer').classList.contains('show')) closeTransDrawer(); });

renderHead();
renderStats();
applyFilters();
renderLifecycle();
renderPlanFlow();

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

