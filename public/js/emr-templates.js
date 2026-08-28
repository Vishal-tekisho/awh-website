document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

const STATUS = { active:{n:'Active',cls:'on'}, draft:{n:'Draft',cls:''} };

const NOTE_TEMPLATES = [
 {id:'nt-1', section:'Chief Complaint', type:'narrative', required:true, status:'active', updatedOn:'20 July 2026'},
 {id:'nt-2', section:'History of Presenting Illness', type:'narrative', required:true, status:'active', updatedOn:'20 July 2026'},
 {id:'nt-3', section:'Examination Findings', type:'structured', required:true, status:'active', updatedOn:'20 July 2026'},
 {id:'nt-4', section:'Wound Assessment', type:'structured', required:true, status:'active', updatedOn:'01 August 2026'},
 {id:'nt-5', section:'Review of Systems', type:'narrative', required:false, status:'draft', updatedOn:'15 August 2026'}
];

const CAT_LBL = { vital:'Vital', wound:'Wound-Specific', biological:'Biological', other:'Other' };

const METRICS = [
 {id:'mt-1', name:'Blood Pressure', unit:'mmHg', range:'90/60 – 140/90', cat:'vital', required:true, status:'active', updatedOn:'12 June 2024', code:'BP', min:'40/20', max:'260/160', dataType:'composite', precision:0, graphable:true, captureStage:['Triage','Consultation'], requiredFor:['General Consultation Note','Triage Form'], abnormalRule:'highlight'},
 {id:'mt-2', name:'Pulse', unit:'bpm', range:'60 – 100', cat:'vital', required:true, status:'active', updatedOn:'12 June 2024', code:'PULSE', min:'20', max:'220', dataType:'integer', precision:0, graphable:true, captureStage:['Triage','Consultation'], requiredFor:['General Consultation Note','Triage Form'], abnormalRule:'highlight'},
 {id:'mt-3', name:'Temperature', unit:'°F', range:'97 – 99', cat:'vital', required:true, status:'active', updatedOn:'12 June 2024', code:'TEMP', min:'90', max:'110', dataType:'decimal', precision:1, graphable:true, captureStage:['Triage'], requiredFor:['Triage Form'], abnormalRule:'highlight'},
 {id:'mt-4', name:'SpO₂', unit:'%', range:'95 – 100', cat:'vital', required:true, status:'active', updatedOn:'12 June 2024', code:'SPO2', min:'50', max:'100', dataType:'integer', precision:0, graphable:true, captureStage:['Triage'], requiredFor:['Triage Form'], abnormalRule:'highlight_alert'},
 {id:'mt-5', name:'Weight', unit:'kg', range:'—', cat:'vital', required:false, status:'active', updatedOn:'12 June 2024', code:'WT', min:'0', max:'300', dataType:'decimal', precision:1, graphable:true, captureStage:['Consultation'], requiredFor:[], abnormalRule:'none'},
 {id:'mt-6', name:'Wound Length', unit:'cm', range:'—', cat:'wound', required:true, status:'active', updatedOn:'20 July 2026', code:'WND-L', min:'0', max:'50', dataType:'decimal', precision:1, graphable:true, captureStage:['Treatment Session','Follow-up'], requiredFor:['Treatment Session Note'], abnormalRule:'none'},
 {id:'mt-7', name:'Wound Depth', unit:'cm', range:'—', cat:'wound', required:false, status:'draft', updatedOn:'15 August 2026', code:'WND-D', min:'0', max:'20', dataType:'decimal', precision:1, graphable:false, captureStage:['Treatment Session'], requiredFor:[], abnormalRule:'none'},
 {id:'mt-8', name:'Blood Sugar', unit:'mg/dL', range:'70 – 140', cat:'biological', required:false, status:'active', updatedOn:'20 July 2026', code:'RBS', min:'20', max:'600', dataType:'integer', precision:0, graphable:true, captureStage:['Consultation','Treatment Session'], requiredFor:['General Consultation Note'], abnormalRule:'highlight_alert'},
 {id:'mt-9', name:'Wound Width', unit:'cm', range:'—', cat:'wound', required:false, status:'draft', updatedOn:'15 August 2026', code:'WND-W', min:'0', max:'50', dataType:'decimal', precision:1, graphable:true, captureStage:['Treatment Session','Follow-up'], requiredFor:['Treatment Session Note'], abnormalRule:'none'},
 {id:'mt-10', name:'Pain Score', unit:'/10', range:'0 – 3', cat:'other', required:false, status:'active', updatedOn:'20 July 2026', code:'PAIN', min:'0', max:'10', dataType:'scale', precision:0, graphable:true, captureStage:['Consultation','Treatment Session','Follow-up'], requiredFor:[], abnormalRule:'highlight'}
];

const HISTORY = [
 {id:'hs-1', field:'Past Medical History', cat:'history', status:'active', updatedOn:'12 June 2024'},
 {id:'hs-2', field:'Family History', cat:'history', status:'active', updatedOn:'12 June 2024'},
 {id:'hs-3', field:'Social History', cat:'history', status:'active', updatedOn:'12 June 2024'},
 {id:'hs-4', field:'Allergy / Adverse Reaction', cat:'allergy', status:'active', updatedOn:'12 June 2024'},
 {id:'hs-5', field:'Problem Status Values (Active / Resolved / Chronic)', cat:'problem', status:'active', updatedOn:'20 July 2026'},
 {id:'hs-6', field:'Medication History Field', cat:'history', status:'active', updatedOn:'12 June 2024'}
];

const HIST_CATS = { history:'History Section', problem:'Problem Field', allergy:'Allergy Field' };
let activeTab = 'note';
let drawerMode = 'note';

/* ---------- Templates: named grouping layer above the flat tabs above ---------- */
const ROLES_LIST = ['Doctor','Nurse','Physiotherapist','Front Desk','Reception','Pharmacist'];
const SPECIALTIES = ['Wound Care','Diabetic Foot','Dermatology','General Surgery','Plastic Surgery','ENT','Physiotherapy'];
const SERVICES_ENC = ['General Consultation','Follow-up Consultation','Triage','Treatment Session','Minor Procedure','Dressing Change','Review Visit'];
const CAPTURE_STAGES = ['Triage','Consultation','Treatment Session','Procedure','Follow-up'];
const TPL_TYPE_LBL = { consultation:'Consultation Note', triage:'Triage Form', treatment:'Treatment Session Note', procedure:'Procedure Note', followup:'Follow-up / Review Note' };
const AMEND_LBL = { addendum_only:'No edits after sign-off, addendum only', edit_24h:'Allow edit within 24 hours of sign-off', supervisor_amend:'Amendment needs supervisor countersignature' };
const FIELD_TYPE_LBL = { text:'Text', textarea:'Narrative / Long Text', structured:'Structured', number:'Number', date:'Date', select:'Select', multiselect:'Multi-select', toggle:'Toggle', vital:'Vital Reading' };
const COND_OP_LBL = { eq:'equals', neq:'does not equal', filled:'is filled' };

const TEMPLATES = [
 {id:'tpl-1', name:'General Consultation Note', type:'consultation', specialty:['Wound Care','Diabetic Foot','General Surgery'], service:['General Consultation','Follow-up Consultation'], effectiveFrom:'2026-01-01', signoff:true, amendment:'addendum_only', status:'active', updatedOn:'20 July 2026', sections:[
   {id:'s1',name:'Chief Complaint',fields:[{id:'f1',label:'Chief Complaint',type:'textarea',required:true,authoringRole:['Doctor'],readonlyRoles:['Front Desk'],cond:{field:'',op:'eq',val:''},help:"Primary reason for visit, in the patient's own words."}]},
   {id:'s2',name:'Symptoms',fields:[{id:'f2',label:'Associated Symptoms',type:'multiselect',required:false,authoringRole:['Doctor','Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Select all symptoms reported by the patient.'}]},
   {id:'s3',name:'HPI',fields:[{id:'f3',label:'History of Presenting Illness',type:'textarea',required:true,authoringRole:['Doctor'],readonlyRoles:['Front Desk','Reception'],cond:{field:'',op:'eq',val:''},help:'Onset, duration, progression, aggravating/relieving factors.'}]},
   {id:'s4',name:'Medical History',fields:[{id:'f4',label:'Past Medical History',type:'textarea',required:false,authoringRole:['Doctor','Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Known chronic conditions: diabetes, hypertension, etc.'}]},
   {id:'s5',name:'Surgical History',fields:[{id:'f5',label:'Past Surgical History',type:'textarea',required:false,authoringRole:['Doctor'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Prior surgeries with approximate dates.'}]},
   {id:'s6',name:'Family History',fields:[{id:'f6',label:'Family History',type:'textarea',required:false,authoringRole:['Doctor','Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Relevant hereditary conditions.'}]},
   {id:'s7',name:'Social History',fields:[{id:'f7',label:'Social History',type:'textarea',required:false,authoringRole:['Doctor','Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Smoking, alcohol, occupation, lifestyle factors.'}]},
   {id:'s8',name:'Allergies',fields:[{id:'f8',label:'Known Allergies / Adverse Reactions',type:'structured',required:true,authoringRole:['Doctor','Nurse'],readonlyRoles:['Front Desk'],cond:{field:'',op:'eq',val:''},help:'Drug, food and contact allergies with reaction severity.'}]},
   {id:'s9',name:'Current Medications',fields:[{id:'f9',label:'Current Medications',type:'structured',required:true,authoringRole:['Doctor','Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Reconciled against pharmacy dispense record.'}]},
   {id:'s10',name:'Examination',fields:[{id:'f10',label:'Examination Findings',type:'structured',required:true,authoringRole:['Doctor'],readonlyRoles:['Nurse','Front Desk'],cond:{field:'',op:'eq',val:''},help:'System-wise examination findings.'}]},
   {id:'s11',name:'Biological Metrics',fields:[{id:'f11',label:'Vitals & Biological Metrics',type:'vital',required:true,authoringRole:['Nurse','Doctor'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Pulled from configured Clinical Metrics. See Triage & Vitals tab.'}]},
   {id:'s12',name:'Assessment',fields:[{id:'f12',label:'Clinical Assessment',type:'textarea',required:true,authoringRole:['Doctor'],readonlyRoles:['Nurse','Front Desk'],cond:{field:'',op:'eq',val:''},help:"Doctor's clinical impression."}]},
   {id:'s13',name:'Diagnosis',fields:[{id:'f13',label:'Diagnosis / Problem',type:'structured',required:true,authoringRole:['Doctor'],readonlyRoles:['Nurse','Front Desk','Reception'],cond:{field:'',op:'eq',val:''},help:'Adds to the patient problem list.'}]},
   {id:'s14',name:'Treatment Recommended',fields:[{id:'f14',label:'Treatment Recommended',type:'textarea',required:true,authoringRole:['Doctor'],readonlyRoles:['Nurse'],cond:{field:'',op:'eq',val:''},help:'Recommended treatment/procedure, linked to Treatments catalogue.'}]},
   {id:'s15',name:'Plan',fields:[{id:'f15',label:'Management Plan',type:'textarea',required:true,authoringRole:['Doctor'],readonlyRoles:['Nurse','Front Desk'],cond:{field:'',op:'eq',val:''},help:'Care plan, orders and next steps.'}]},
   {id:'s16',name:'Follow-up',fields:[{id:'f16',label:'Follow-up Instructions',type:'textarea',required:false,authoringRole:['Doctor'],readonlyRoles:[],cond:{field:'Diagnosis / Problem',op:'filled',val:''},help:'Shown only once a diagnosis is recorded.'}]}
 ]},
 {id:'tpl-2', name:'Triage Form', type:'triage', specialty:SPECIALTIES.slice(), service:['Triage'], effectiveFrom:'2026-01-01', signoff:false, amendment:'edit_24h', status:'active', updatedOn:'12 June 2024', sections:[
   {id:'s17',name:'Presenting Complaint',fields:[{id:'f17',label:'Presenting Complaint',type:'text',required:true,authoringRole:['Nurse','Front Desk'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'One-line reason for the visit.'}]},
   {id:'s18',name:'Triage Priority',fields:[{id:'f18',label:'Triage Priority',type:'select',required:true,authoringRole:['Nurse'],readonlyRoles:['Front Desk'],cond:{field:'',op:'eq',val:''},help:'Emergency / Urgent / Routine.'}]},
   {id:'s19',name:'Vitals',fields:[{id:'f19',label:'Vitals Capture',type:'vital',required:true,authoringRole:['Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Pulled from configured Clinical Metrics.'}]},
   {id:'s20',name:'Allergy Check',fields:[{id:'f20',label:'Known Allergy Flag',type:'toggle',required:true,authoringRole:['Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Quick check before doctor consult.'}]}
 ]},
 {id:'tpl-3', name:'Treatment Session Note', type:'treatment', specialty:['Wound Care','Diabetic Foot','Physiotherapy'], service:['Treatment Session','Dressing Change'], effectiveFrom:'2026-01-15', signoff:true, amendment:'addendum_only', status:'active', updatedOn:'01 August 2026', sections:[
   {id:'s21',name:'Session Details',fields:[{id:'f21',label:'Session Details',type:'structured',required:true,authoringRole:['Nurse','Doctor'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Session number, duration, staff present.'}]},
   {id:'s22',name:'Procedure Performed',fields:[{id:'f22',label:'Procedure / Treatment Performed',type:'textarea',required:true,authoringRole:['Doctor','Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Linked to Treatments & Procedures catalogue.'}]},
   {id:'s23',name:'Materials Used',fields:[{id:'f23',label:'Dressings / Materials Used',type:'structured',required:false,authoringRole:['Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'For inventory reconciliation.'}]},
   {id:'s24',name:'Patient Response',fields:[{id:'f24',label:'Patient Response / Tolerance',type:'textarea',required:false,authoringRole:['Nurse','Doctor'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:''}]},
   {id:'s25',name:'Next Session Plan',fields:[{id:'f25',label:'Next Session Plan',type:'textarea',required:false,authoringRole:['Doctor'],readonlyRoles:['Nurse'],cond:{field:'',op:'eq',val:''},help:''}]}
 ]},
 {id:'tpl-4', name:'Procedure Note', type:'procedure', specialty:['General Surgery','Plastic Surgery','ENT'], service:['Minor Procedure'], effectiveFrom:'2026-02-01', signoff:true, amendment:'supervisor_amend', status:'active', updatedOn:'01 August 2026', sections:[
   {id:'s26',name:'Procedure Details',fields:[{id:'f26',label:'Procedure Details',type:'structured',required:true,authoringRole:['Doctor'],readonlyRoles:['Nurse'],cond:{field:'',op:'eq',val:''},help:''}]},
   {id:'s27',name:'Consent Confirmation',fields:[{id:'f27',label:'Consent Confirmed',type:'toggle',required:true,authoringRole:['Doctor','Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Must be checked before the procedure section unlocks.'}]},
   {id:'s28',name:'Findings',fields:[{id:'f28',label:'Findings',type:'textarea',required:true,authoringRole:['Doctor'],readonlyRoles:['Nurse','Front Desk'],cond:{field:'',op:'eq',val:''},help:''}]},
   {id:'s29',name:'Complications',fields:[{id:'f29',label:'Complications',type:'textarea',required:false,authoringRole:['Doctor'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Leave blank if none.'}]},
   {id:'s30',name:'Post-procedure Instructions',fields:[{id:'f30',label:'Post-procedure Instructions',type:'textarea',required:true,authoringRole:['Doctor'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:''}]}
 ]},
 {id:'tpl-5', name:'Follow-up / Review Note', type:'followup', specialty:SPECIALTIES.slice(), service:['Follow-up Consultation','Review Visit'], effectiveFrom:'2026-01-01', signoff:true, amendment:'edit_24h', status:'draft', updatedOn:'15 August 2026', sections:[
   {id:'s31',name:'Interval History',fields:[{id:'f31',label:'Interval History',type:'textarea',required:true,authoringRole:['Doctor'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'What changed since the last visit.'}]},
   {id:'s32',name:'Response to Treatment',fields:[{id:'f32',label:'Response to Treatment',type:'textarea',required:true,authoringRole:['Doctor'],readonlyRoles:['Nurse'],cond:{field:'',op:'eq',val:''},help:''}]},
   {id:'s33',name:'Wound Progress',fields:[{id:'f33',label:'Wound Progress',type:'vital',required:false,authoringRole:['Doctor','Nurse'],readonlyRoles:[],cond:{field:'',op:'eq',val:''},help:'Pulled from configured wound metrics.'}]},
   {id:'s34',name:'Plan Update',fields:[{id:'f34',label:'Plan Update',type:'textarea',required:true,authoringRole:['Doctor'],readonlyRoles:['Nurse','Front Desk'],cond:{field:'',op:'eq',val:''},help:''}]}
 ]}
];

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

const statDD = initFsel('statWrap','statBtn','statPanel','fStat', [['','All statuses'],['active','Active'],['draft','Draft']], applyFilters);

$('#tabSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  activeTab = b.dataset.t;
  $$('#tabSeg button').forEach(x=>x.classList.toggle('on', x===b));
  $('#newBtnTxt').textContent = activeTab==='note' ? 'Add section' : activeTab==='metric' ? 'Add metric' : activeTab==='history' ? 'Add field' : 'Add template';
  $('#mSearch').value=''; statDD.set('');
  closeTemplateEditor();
  renderHead();
  applyFilters();
});

function renderHead(){
  $('#tblHead').innerHTML = activeTab==='note'
    ? '<tr><th>Section</th><th>Field Type</th><th>Required</th><th>Status</th><th style="text-align:right">Actions</th></tr>'
    : activeTab==='metric'
    ? '<tr><th>Metric</th><th>Code</th><th>Unit</th><th>Reference Range</th><th>Category</th><th>Required</th><th>Status</th><th style="text-align:right">Actions</th></tr>'
    : activeTab==='history'
    ? '<tr><th>Field</th><th>Category</th><th>Status</th><th style="text-align:right">Actions</th></tr>'
    : '<tr><th>Template</th><th>Type</th><th>Specialty</th><th>Effective From</th><th>Sections</th><th>Sign-off</th><th>Status</th><th style="text-align:right">Actions</th></tr>';
}
function dataset(){ return activeTab==='note' ? NOTE_TEMPLATES : activeTab==='metric' ? METRICS : activeTab==='history' ? HISTORY : TEMPLATES; }
function nameOf(e){ return activeTab==='note' ? e.section : activeTab==='metric' ? e.name : activeTab==='history' ? e.field : e.name; }

function renderRow(e){
  const st = STATUS[e.status];
  const req = e.required ? '<span class="dot-y">✓</span>' : '<span class="dot-n">—</span>';
  if(activeTab==='note'){
    return `<tr><td><b>${esc(e.section)}</b></td><td><span class="s">${e.type==='narrative'?'Narrative':'Structured'}</span></td><td>${req}</td>
      <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td><td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  if(activeTab==='metric'){
    return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.code||'—')}</span></td><td><span class="s">${esc(e.unit)}</span></td><td><span class="s">${esc(e.range)}</span></td>
      <td><span class="s">${CAT_LBL[e.cat]||e.cat}</span></td><td>${req}</td>
      <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td><td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  if(activeTab==='history'){
    return `<tr><td><b>${esc(e.field)}</b></td><td><span class="s">${HIST_CATS[e.cat]}</span></td>
      <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td><td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  const sections = e.sections || [];
  return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${TPL_TYPE_LBL[e.type]||e.type}</span></td>
    <td><span class="s">${e.specialty.slice(0,2).map(esc).join(', ')}${e.specialty.length>2?' +'+(e.specialty.length-2):''}</span></td>
    <td><span class="s">${esc(e.effectiveFrom)}</span></td>
    <td><span class="s">${sections.length}</span></td>
    <td>${e.signoff?'<span class="dot-y">✓</span>':'<span class="dot-n">—</span>'}</td>
    <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button> <button class="mini" data-open-editor="${e.id}">Open Editor</button></td></tr>`;
}
function renderStats(){
  const list = dataset();
  $('#stTotalLbl').textContent = activeTab==='note' ? 'Total sections' : activeTab==='metric' ? 'Total metrics' : activeTab==='history' ? 'Total fields' : 'Total templates';
  $('#stTotal').textContent = list.length;
  $('#stActive').textContent = list.filter(e=>e.status==='active').length;
  $('#stDraft').textContent = list.filter(e=>e.status==='draft').length;
}
function applyFilters(){
  const q = $('#mSearch').value.trim().toLowerCase();
  const stat = statDD.get();
  const list = dataset().filter(e => (!q || nameOf(e).toLowerCase().includes(q)) && (!stat || e.status===stat));
  renderList(list);
}
function renderList(list){
  const full = dataset();
  const body = $('#mBody');
  $('#mEmptyTxt').textContent = 'No entries match these filters';
  if(!list.length){
    body.innerHTML=''; $('#mEmpty').style.display='block';
    $('#mFoot').textContent = `Showing 0 of ${full.length} entries`;
    return;
  }
  $('#mEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#mFoot').textContent = `Showing ${list.length} of ${full.length} entries`;
}
$('#mSearch').addEventListener('input', applyFilters);

let editingId = null;
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId, v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b ? b.dataset.v : null; }
$$('#dNoteTypeSeg,#dCatSeg,#dHistCatSeg,#dStatusSeg').forEach(seg=>{
  seg.addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet(seg.id, b.dataset.v); });
});

function showGroupsFor(mode){
  $('#noteOnlyGroup').style.display = mode==='note' ? '' : 'none';
  $('#metricOnlyGroup').style.display = mode==='metric' ? '' : 'none';
  $('#historyOnlyGroup').style.display = mode==='history' ? '' : 'none';
  $('#templateMetaGroup').style.display = mode==='templateMeta' ? '' : 'none';
  $('#templateFieldGroup').style.display = mode==='templateField' ? '' : 'none';
  $('#reqWrap').style.display = mode==='templateMeta' ? 'none' : 'flex';
  $('#dStatusWrap').style.display = mode==='templateField' ? 'none' : '';
}

$('#newBtn').addEventListener('click', ()=>{
  editingId = null;
  if(activeTab==='template'){
    drawerMode = 'templateMeta';
    $('#dNameLbl').textContent = 'Template name';
    $('#dTitle').textContent = 'Add template';
    $('#dSub').textContent = 'New EMR template';
    showGroupsFor('templateMeta');
    $('#dName').value='';
    $('#dTplType').value='consultation';
    specialtyMchk.set([]); serviceMchk.set([]);
    $('#dEffFrom').value=''; $('#dAmendRule').value='addendum_only'; $('#dSignoff').checked=true;
    segSet('dStatusSeg','draft');
    $('#dMetaWrap').style.display='none';
    openDrawer();
    return;
  }
  drawerMode = activeTab;
  $('#dNameLbl').textContent = activeTab==='note' ? 'Section name' : activeTab==='metric' ? 'Metric name' : 'Field name';
  $('#dTitle').textContent = activeTab==='note' ? 'Add section' : activeTab==='metric' ? 'Add metric' : 'Add field';
  $('#dSub').textContent = 'New ' + (activeTab==='note'?'consultation note section':activeTab==='metric'?'triage/vital metric':'history/diagnosis field');
  showGroupsFor(activeTab);
  $('#dName').value=''; $('#dUnit').value=''; $('#dRange').value='';
  $('#dCode').value=''; $('#dMin').value=''; $('#dMax').value=''; $('#dPrecision').value='';
  $('#dDataType').value='integer'; $('#dAbnormalRule').value='none'; $('#dGraphable').checked = true;
  captureStageMchk.set([]); requiredForMchk.set([]);
  segSet('dNoteTypeSeg','narrative'); segSet('dCatSeg','vital'); segSet('dHistCatSeg','history'); segSet('dStatusSeg','draft');
  $('#dRequired').checked = true;
  $('#dMetaWrap').style.display='none';
  openDrawer();
});
$('#mBody').addEventListener('click', e=>{
  const openBtn = e.target.closest('[data-open-editor]');
  if(openBtn){ openTemplateEditor(openBtn.dataset.openEditor); return; }
  const b=e.target.closest('[data-edit]'); if(!b) return;
  const item = dataset().find(x=>x.id===b.dataset.edit); if(!item) return;
  editingId = item.id;
  if(activeTab==='template'){
    drawerMode = 'templateMeta';
    $('#dNameLbl').textContent = 'Template name';
    $('#dTitle').textContent = 'Edit template';
    $('#dSub').textContent = item.name;
    showGroupsFor('templateMeta');
    $('#dName').value = item.name;
    $('#dTplType').value = item.type;
    specialtyMchk.set(item.specialty); serviceMchk.set(item.service);
    $('#dEffFrom').value = item.effectiveFrom; $('#dAmendRule').value = item.amendment; $('#dSignoff').checked = item.signoff;
    segSet('dStatusSeg', item.status);
    $('#dMeta').textContent = 'Last updated ' + item.updatedOn;
    $('#dMetaWrap').style.display='block';
    openDrawer();
    return;
  }
  drawerMode = activeTab;
  $('#dNameLbl').textContent = activeTab==='note' ? 'Section name' : activeTab==='metric' ? 'Metric name' : 'Field name';
  $('#dTitle').textContent = 'Edit ' + (activeTab==='note'?'section':activeTab==='metric'?'metric':'field');
  $('#dSub').textContent = nameOf(item);
  showGroupsFor(activeTab);
  $('#dName').value = nameOf(item);
  if(activeTab==='note'){ segSet('dNoteTypeSeg', item.type); $('#dRequired').checked = item.required; }
  else if(activeTab==='metric'){
    $('#dCode').value=item.code||''; $('#dUnit').value=item.unit; $('#dRange').value=item.range;
    $('#dMin').value=item.min||''; $('#dMax').value=item.max||'';
    segSet('dCatSeg', item.cat); $('#dDataType').value=item.dataType||'integer'; $('#dPrecision').value=item.precision||0;
    captureStageMchk.set(item.captureStage||[]); requiredForMchk.set(item.requiredFor||[]);
    $('#dAbnormalRule').value = item.abnormalRule||'none'; $('#dGraphable').checked = item.graphable!==false;
    $('#dRequired').checked = item.required;
  }
  else { segSet('dHistCatSeg', item.cat); $('#dRequired').checked = true; }
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
  let payload;
  if(drawerMode==='note') payload = { section:name, type:segGet('dNoteTypeSeg'), required:$('#dRequired').checked, status:segGet('dStatusSeg'), updatedOn:TODAY };
  else if(drawerMode==='metric') payload = { name, code:$('#dCode').value.trim()||'—', unit:$('#dUnit').value.trim()||'—', range:$('#dRange').value.trim()||'—',
      min:$('#dMin').value.trim(), max:$('#dMax').value.trim(), cat:segGet('dCatSeg'), dataType:$('#dDataType').value, precision:+$('#dPrecision').value||0,
      graphable:$('#dGraphable').checked, captureStage:captureStageMchk.get(), requiredFor:requiredForMchk.get(), abnormalRule:$('#dAbnormalRule').value,
      required:$('#dRequired').checked, status:segGet('dStatusSeg'), updatedOn:TODAY };
  else if(drawerMode==='history') payload = { field:name, cat:segGet('dHistCatSeg'), status:segGet('dStatusSeg'), updatedOn:TODAY };
  else if(drawerMode==='templateMeta') payload = { name, type:$('#dTplType').value, specialty:specialtyMchk.get(), service:serviceMchk.get(),
      effectiveFrom:$('#dEffFrom').value||'—', amendment:$('#dAmendRule').value, signoff:$('#dSignoff').checked, status:segGet('dStatusSeg'), updatedOn:TODAY };
  else if(drawerMode==='templateField') payload = { label:name, type:$('#dFieldType').value, required:$('#dRequired').checked, authoringRole:authorRoleMchk.get(),
      readonlyRoles:readonlyRoleMchk.get(), cond:{field:$('#dCondField').value,op:$('#dCondOp').value,val:$('#dCondVal').value.trim()}, help:$('#dHelpText').value.trim() };

  if(drawerMode==='templateField'){
    const tpl = TEMPLATES.find(t=>t.id===editorTemplateId);
    const sec = tpl && tpl.sections.find(s=>s.id===editorSectionId);
    if(sec){
      if(editingId){ Object.assign(sec.fields.find(f=>f.id===editingId), payload); toast('Field updated'); }
      else { sec.fields.push(Object.assign({id:'fld-'+Date.now()}, payload)); toast('Field added'); }
      renderSections(); renderFieldsList(); renderPreview();
    }
    closeDrawer();
    return;
  }

  if(editingId){
    Object.assign(dataset().find(x=>x.id===editingId), payload);
    toast('Updated');
  } else {
    const prefix = drawerMode==='note' ? 'nt-' : drawerMode==='metric' ? 'mt-' : drawerMode==='history' ? 'hs-' : 'tpl-';
    const rec = Object.assign({id:prefix+Date.now()}, payload);
    if(prefix==='tpl-') rec.sections = [];
    dataset().push(rec);
    toast('Added');
  }
  closeDrawer();
  renderStats(); applyFilters();
});

/* ---------- Template editor: Left = Sections · Centre = Fields · Right = Live clinician preview ---------- */
let editorTemplateId = null;
let editorSectionId = null;

function currentTemplate(){ return TEMPLATES.find(t=>t.id===editorTemplateId); }
function currentSection(){ const tpl=currentTemplate(); return tpl && tpl.sections.find(s=>s.id===editorSectionId); }

function openTemplateEditor(id){
  const tpl = TEMPLATES.find(t=>t.id===id); if(!tpl) return;
  tpl.sections = tpl.sections || [];
  editorTemplateId = id;
  editorSectionId = tpl.sections[0] ? tpl.sections[0].id : null;
  $('#listView').style.display='none';
  $('#tplEditorWrap').style.display='block';
  $('#tplEdName').textContent = tpl.name;
  $('#tplEdSub').textContent = TPL_TYPE_LBL[tpl.type] + ' · ' + tpl.specialty.join(', ');
  $('#tplEdSignoff').style.display = tpl.signoff ? 'inline-flex' : 'none';
  $('#tplEdAmend').textContent = AMEND_LBL[tpl.amendment] || tpl.amendment;
  renderSections(); renderFieldsList(); renderPreview();
}
function closeTemplateEditor(){
  editorTemplateId = null; editorSectionId = null;
  $('#tplEditorWrap').style.display='none';
  $('#listView').style.display='';
}
$('#tplBackBtn').addEventListener('click', closeTemplateEditor);

function renderSections(){
  const tpl = currentTemplate(); if(!tpl) return;
  $('#secList').innerHTML = tpl.sections.map(s=>
    `<div class="secrow ${s.id===editorSectionId?'on':''}" data-sec="${s.id}"><span class="sn">${esc(s.name)}</span><span class="sc">${s.fields.length}</span><button type="button" class="rm" data-rmsec="${s.id}" title="Remove section"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>`
  ).join('');
}
$('#secList').addEventListener('click', e=>{
  const tpl = currentTemplate(); if(!tpl) return;
  const rm = e.target.closest('[data-rmsec]');
  if(rm){
    if(tpl.sections.length<=1){ toast('A template needs at least one section'); return; }
    tpl.sections = tpl.sections.filter(s=>s.id!==rm.dataset.rmsec);
    if(editorSectionId===rm.dataset.rmsec) editorSectionId = tpl.sections[0].id;
    renderSections(); renderFieldsList(); renderPreview();
    toast('Section removed');
    return;
  }
  const row = e.target.closest('[data-sec]'); if(!row) return;
  editorSectionId = row.dataset.sec;
  renderSections(); renderFieldsList(); renderPreview();
});
$('#secAddBtn').addEventListener('click', ()=>{
  const tpl = currentTemplate(); if(!tpl) return;
  const nm = $('#secNewName').value.trim();
  if(!nm){ toast('Enter a section name'); return; }
  const sec = {id:'sec-'+Date.now(), name:nm, fields:[]};
  tpl.sections.push(sec);
  editorSectionId = sec.id;
  $('#secNewName').value='';
  renderSections(); renderFieldsList(); renderPreview();
  toast('Section added');
});

function renderFieldsList(){
  const sec = currentSection();
  $('#fieldsTitle').textContent = sec ? ('Fields in ' + sec.name) : 'Fields';
  if(!sec){ $('#fieldList').innerHTML = '<div class="empty"><b>No section selected</b><span>Add a section on the left to begin.</span></div>'; return; }
  if(!sec.fields.length){
    $('#fieldList').innerHTML = '<div class="empty"><b>No fields yet</b><span>Add the first field for this section.</span></div>';
    return;
  }
  $('#fieldList').innerHTML = sec.fields.map(f=>
    `<div class="fieldrow"><div class="fi"><b>${esc(f.label)}${f.required?' <span style="color:var(--danger)">*</span>':''}</b>
      <span>${FIELD_TYPE_LBL[f.type]||f.type} · Authoring: ${f.authoringRole.join(', ')||'—'}${f.readonlyRoles.length?' · Read-only: '+f.readonlyRoles.join(', '):''}</span></div>
      <button class="mini" data-editfield="${f.id}">Edit</button>
      <button class="mini" data-rmfield="${f.id}">Remove</button></div>`
  ).join('');
}
$('#fieldList').addEventListener('click', e=>{
  const sec = currentSection(); if(!sec) return;
  const rm = e.target.closest('[data-rmfield]');
  if(rm){ sec.fields = sec.fields.filter(f=>f.id!==rm.dataset.rmfield); renderSections(); renderFieldsList(); renderPreview(); toast('Field removed'); return; }
  const ed = e.target.closest('[data-editfield]');
  if(ed){ openFieldDrawer(sec.fields.find(f=>f.id===ed.dataset.editfield)); }
});
$('#fieldAddBtn').addEventListener('click', ()=> openFieldDrawer(null));

function refreshCondFieldOptions(){
  const tpl = currentTemplate();
  const opts = ['<option value="">Always visible</option>'];
  if(tpl){ tpl.sections.forEach(s=> s.fields.forEach(f=> opts.push('<option value="'+esc(f.label)+'">'+esc(f.label)+'</option>'))); }
  $('#dCondField').innerHTML = opts.join('');
}
function openFieldDrawer(field){
  const sec = currentSection();
  if(!sec){ toast('Add a section first'); return; }
  editingId = field ? field.id : null;
  drawerMode = 'templateField';
  $('#dNameLbl').textContent = 'Field label';
  $('#dTitle').textContent = field ? 'Edit field' : 'Add field';
  $('#dSub').textContent = sec.name;
  showGroupsFor('templateField');
  refreshCondFieldOptions();
  $('#dName').value = field ? field.label : '';
  $('#dFieldType').value = field ? field.type : 'text';
  authorRoleMchk.set(field ? field.authoringRole : []);
  readonlyRoleMchk.set(field ? field.readonlyRoles : []);
  $('#dCondField').value = field ? (field.cond.field||'') : '';
  $('#dCondOp').value = field ? (field.cond.op||'eq') : 'eq';
  $('#dCondVal').value = field ? (field.cond.val||'') : '';
  $('#dHelpText').value = field ? (field.help||'') : '';
  $('#dRequired').checked = field ? field.required : false;
  $('#dMetaWrap').style.display='none';
  openDrawer();
}

function previewPlaceholder(type){
  return { text:'Single-line text input', textarea:'Multi-line narrative text area', structured:'Structured entry (multiple sub-fields)', number:'Numeric input', date:'Date picker', select:'Dropdown selection', multiselect:'Multi-select chips', toggle:'Yes / No toggle', vital:'Reads from configured Clinical Metrics' }[type] || 'Input';
}
function renderPreview(){
  const sec = currentSection();
  if(!sec){ $('#prevShell').innerHTML = '<div class="empty"><b>No section selected</b></div>'; return; }
  if(!sec.fields.length){ $('#prevShell').innerHTML = '<div class="empty"><b>Nothing to preview yet</b><span>Add a field to see how it appears to the clinician.</span></div>'; return; }
  $('#prevShell').innerHTML = `<h4 style="font-size:13px;font-weight:800;margin-bottom:12px">${esc(sec.name)}</h4>` + sec.fields.map(f=>
    `<div class="prevfield"><div class="prevlabel">${esc(f.label)}${f.required?' <span class="req">*</span>':''}${f.readonlyRoles.length?'<span class="prevro">Read-only: '+f.readonlyRoles.join(', ')+'</span>':''}</div>
      <div class="prevbox">${previewPlaceholder(f.type)}</div>
      ${f.help?'<div class="prevhelp">'+esc(f.help)+'</div>':''}
      ${f.cond.field?'<div class="prevhelp">Shown only when "'+esc(f.cond.field)+'" '+(COND_OP_LBL[f.cond.op]||f.cond.op)+(f.cond.val?' "'+esc(f.cond.val)+'"':'')+'.</div>':''}
    </div>`
  ).join('');
}

/* ---- multi-select checklist with search ("multi-select chips") · same .mchk component as
   doctors-staff.html/rooms-areas.html/user-onboard.html. Replaces the old flat .pick chip rows
   for Specialty/Service/Role/Capture Stage/Required For · all real, potentially-growing lists
   that benefit from search, not fixed 2-3 option enums. ---- */
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
    setVocab(v){ vocab = v; renderPanel(); renderChips(); }
  };
}
document.addEventListener('click', ()=>$$('.mchk').forEach(x=>x.classList.remove('open')));

const specialtyMchk = initMchk('specialtyMchk','specialtyBtn','specialtyPanel','specialtyChips', Object.fromEntries(SPECIALTIES.map(v=>[v,v])), 'Select specialties…', true);
const serviceMchk = initMchk('serviceMchk','serviceBtn','servicePanel','serviceChips', Object.fromEntries(SERVICES_ENC.map(v=>[v,v])), 'Select services…', true);
const authorRoleMchk = initMchk('authorRoleMchk','authorRoleBtn','authorRolePanel','authorRoleChips', Object.fromEntries(ROLES_LIST.map(v=>[v,v])), 'Select roles…', true);
const readonlyRoleMchk = initMchk('readonlyRoleMchk','readonlyRoleBtn','readonlyRolePanel','readonlyRoleChips', Object.fromEntries(ROLES_LIST.map(v=>[v,v])), 'Select roles…', true);
const captureStageMchk = initMchk('captureStageMchk','captureStageBtn','captureStagePanel','captureStageChips', Object.fromEntries(CAPTURE_STAGES.map(v=>[v,v])), 'Select capture stages…', true);
const requiredForMchk = initMchk('requiredForMchk','requiredForBtn','requiredForPanel','requiredForChips', Object.fromEntries(TEMPLATES.map(t=>[t.name,t.name])), 'Select templates…', true);

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

