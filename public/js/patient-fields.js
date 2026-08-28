document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

/* ---------- shared vocab ---------- */
const STATUS = { active:{n:'Active',cls:'on'}, draft:{n:'Draft',cls:''}, conflict:{n:'Validation conflict',cls:'warn'} };
const LOCK_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lockic"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

/* ---------- Patient Fields data ---------- */
/* BRD §17 patient field groups */
const FIELD_CATS = {
  identity:'Personal Information', address:'Address', contact:'Contact Information',
  caretaker:'Caretaker / Approved Contact', emergency:'Emergency Contact', restricted:'Identifiers'
};
const FIELD_TYPES = { text:'Text', textarea:'Textarea', number:'Number', date:'Date', phone:'Phone', email:'Email', select:'Dropdown', multiselect:'Multi-select', yesno:'Yes / No', auto:'System-generated' };

/* ---------- option lists · mirrors of Reference Masters (rf-24…rf-29) and Users, Roles & Permissions; nothing here is a free-standing list ---------- */
const ROLES = { reception:'Reception / Care Desk', nurse:'Nurse / Clinical Staff', doctor:'Doctor', manager:'Clinic Manager / Head Nurse', lab:'Lab Staff', pharmacy:'Pharmacy Staff', stores:'Stores / Inventory Staff', admin:'Clinic Admin' };
const ALL_ROLES = Object.keys(ROLES);
const VALIDATION_RULES = { none:'No validation', phone:'Phone (10-digit IN mobile)', email:'Email format', pin:'PIN code (6-digit)', aadhaar:'Aadhaar checksum', pan:'PAN format (AAAAA9999A)', dob:'Date not in future', custom:'Custom rule' };
const MASK_RULES = { none:'No masking', partial:'Partial (last 4 visible)', full:'Full mask', restricted:'Full value, restricted role only' };
const EDIT_PERMISSIONS = { anyone:'Anyone with edit access', frontdesk:'Reception and above', admin:'Clinic Admin only', locked:'Locked after registration' };

/* ---------- consent-configuration control vocab (Workspace 15 §"Consent fields") ---------- */
const CONSENT_TYPES = { treatment:'Treatment Consent', procedure:'Procedure Consent', photography:'Clinical Photography / Media', communication:'Communication Consent', datasharing:'Data / Document Sharing Consent' };
const SVC_VOCAB = Object.fromEntries(['New Appointment','Wound Physio','Foot Scan & Analysis','Gait Analysis','PAIN MANAGEMENT','OZONE THERAPY','WARM OXYGEN THERAPY','LASERS','PLATELET RICH PLASMA Procedure',
  'Diabetic Foot Ulcer Management Program','Compression Therapy Program','Negative Pressure Wound Therapy (NPWT) Course','Post-Surgical Wound Care Program','Sharp Debridement','Wound VAC Application','Skin Graft Dressing Change','Suture Removal'].map(n=>[n,n]));
const SERVICE_TAGS = { allservices:'All Services', wounddebridement:'Wound Debridement', npwt:'NPWT / Negative Pressure Therapy', dressing:'Dressing & Wound Care', skingraft:'Skin Grafting', hbot:'Hyperbaric Oxygen Therapy', teleconsult:'Teleconsultation', photography:'Clinical Photography' };
const CAPTURE_STAGES = { registration:'At Registration', preconsult:'Before Consultation', pretreatment:'Before Treatment / Procedure', discharge:'At Discharge', prephoto:'Before Clinical Photography' };
const SIGNATORIES = { patient:'Patient', guardian:'Guardian / Caretaker', approved:'Approved Contact' };

/* ---------- document-upload control vocab (Workspace 15 §"Document / upload configuration") ---------- */
const DOC_METADATA = { docdate:'Document Date', source:'Source / Origin', uploadedby:'Uploaded By', visit:'Associated Visit', treatment:'Associated Treatment' };
const SAFE_STATES = { enforced:{n:'Enforced (scanned before storage)', cls:'ok'}, flag:{n:'Flag & manual review', cls:'warn'}, off:{n:'Not enforced', cls:'mute'} };
const SAFE_STATE_OPTS = Object.entries(SAFE_STATES).map(([k,v])=>[k,v.n]);

const FIELDS = [
 {id:'full-name', name:'Full Name', cat:'identity', type:'text', required:true, masked:false, status:'active', note:'', locked:false, updatedOn:'12 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'As per government ID where available.', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'dob', name:'Date of Birth / Age', cat:'identity', type:'date', required:true, masked:false, status:'active', note:'', locked:false, updatedOn:'12 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'dob', helpText:'App calculates age automatically from this date.', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'gender', name:'Gender', cat:'identity', type:'select', required:true, masked:false, status:'active', note:'', locked:false, updatedOn:'12 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'mobile', name:'Mobile Number', cat:'contact', type:'phone', required:true, masked:false, status:'active', note:'', locked:false, updatedOn:'12 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'phone', helpText:'10-digit Indian mobile number.', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'email', name:'Email Address', cat:'contact', type:'email', required:false, masked:false, status:'active', note:'', locked:false, updatedOn:'10 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'email', helpText:'', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'alt-contact', name:'Alternate Contact Number', cat:'contact', type:'phone', required:false, masked:false, status:'active', note:'', locked:false, updatedOn:'10 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'phone', helpText:'', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'curr-addr', name:'Current Address', cat:'address', type:'text', required:false, masked:false, status:'active', note:'', locked:false, updatedOn:'08 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'Superseded by the structured Current Address sub-fields below · kept for legacy free-text records.', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'perm-addr', name:'Permanent Address', cat:'address', type:'text', required:false, masked:false, status:'active', note:'', locked:false, updatedOn:'08 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'Superseded by the structured Permanent Address sub-fields below · kept for legacy free-text records.', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'curr-addr-l1', name:'Address Line 1 (Current)', cat:'address', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Current Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'House / flat, street.', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'curr-addr-l2', name:'Address Line 2 (Current)', cat:'address', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Current Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'Landmark, area (optional).', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'curr-locality', name:'Locality (Current)', cat:'address', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Current Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'curr-city', name:'City (Current)', cat:'address', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Current Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'curr-state', name:'State (Current)', cat:'address', type:'select', required:false, masked:false, status:'active', note:'Structured sub-field of Current Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'curr-pin', name:'PIN Code (Current)', cat:'address', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Current Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'pin', helpText:'6-digit postal code.', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'perm-addr-l1', name:'Address Line 1 (Permanent)', cat:'address', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Permanent Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'House / flat, street.', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'perm-addr-l2', name:'Address Line 2 (Permanent)', cat:'address', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Permanent Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'Landmark, area (optional).', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'perm-locality', name:'Locality (Permanent)', cat:'address', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Permanent Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'perm-city', name:'City (Permanent)', cat:'address', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Permanent Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'perm-state', name:'State (Permanent)', cat:'address', type:'select', required:false, masked:false, status:'active', note:'Structured sub-field of Permanent Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'perm-pin', name:'PIN Code (Permanent)', cat:'address', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Permanent Address.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'pin', helpText:'6-digit postal code.', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'caretaker', name:'Caretaker / Guardian Details', cat:'caretaker', type:'text', required:false, masked:false, status:'active', note:'', locked:false, updatedOn:'08 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'Superseded by the structured Caretaker sub-fields below · kept for legacy free-text records.', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'caretaker-name', name:'Caretaker Name', cat:'caretaker', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Caretaker / Guardian Details.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'caretaker-relationship', name:'Caretaker Relationship', cat:'caretaker', type:'select', required:false, masked:false, status:'active', note:'Structured sub-field of Caretaker / Guardian Details.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'e.g. Spouse, Parent, Child, Sibling, Other.', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'caretaker-mobile', name:'Caretaker Mobile', cat:'caretaker', type:'phone', required:false, masked:false, status:'active', note:'Structured sub-field of Caretaker / Guardian Details.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'phone', helpText:'', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'caretaker-comm-authority', name:'Caretaker Communication Authority', cat:'caretaker', type:'yesno', required:false, masked:false, status:'active', note:'Structured sub-field of Caretaker / Guardian Details.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'Whether this caretaker is authorised to receive clinical updates and communications.', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'emergency', name:'Emergency Contact', cat:'emergency', type:'text', required:false, masked:false, status:'active', note:'', locked:false, updatedOn:'08 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'Superseded by the structured Emergency Contact sub-fields below · kept for legacy free-text records.', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'emergency-name', name:'Emergency Contact Name', cat:'emergency', type:'text', required:false, masked:false, status:'active', note:'Structured sub-field of Emergency Contact.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'emergency-relationship', name:'Emergency Contact Relationship', cat:'emergency', type:'select', required:false, masked:false, status:'active', note:'Structured sub-field of Emergency Contact.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'emergency-mobile', name:'Emergency Contact Mobile', cat:'emergency', type:'phone', required:false, masked:false, status:'active', note:'Structured sub-field of Emergency Contact.', locked:false, updatedOn:TODAY, visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'phone', helpText:'', branchScope:'inherit', searchable:false, sensitive:false, maskRule:'none'},
 {id:'mrn', name:'MRN / UHID', cat:'restricted', type:'auto', required:true, masked:false, status:'active', note:'System-generated at registration.', locked:true, updatedOn:'—', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:false, editPerm:'locked', validation:'none', helpText:'Generated automatically at registration; not editable.', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'abha', name:'ABHA Number', cat:'restricted', type:'text', required:false, masked:false, status:'active', note:'', locked:false, updatedOn:'05 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'reception', validation:'none', helpText:'National Health ID · optional.', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'legacy-id', name:'Legacy ID (previous system)', cat:'restricted', type:'text', required:true, masked:false, status:'conflict', note:'Marked Required but no department has legacy-ID capture enabled yet · resolve before publishing.', locked:false, updatedOn:'16 August 2026', visible:true, visibleRoles:ALL_ROLES, editableAfterReg:true, editPerm:'admin', validation:'none', helpText:'', branchScope:'inherit', searchable:true, sensitive:false, maskRule:'none'},
 {id:'aadhaar', name:'Aadhaar Number', cat:'restricted', type:'text', required:false, masked:true, status:'active', note:'Optional & masked by default · full value needs approved purpose + restricted role.', locked:false, updatedOn:'12 August 2026', visible:true, visibleRoles:['admin'], editableAfterReg:true, editPerm:'admin', validation:'aadhaar', helpText:'Optional. Full value visible only to restricted-access roles.', branchScope:'inherit', searchable:false, sensitive:true, maskRule:'restricted'},
 {id:'pan', name:'PAN Number', cat:'restricted', type:'text', required:false, masked:true, status:'active', note:'Optional & masked by default · full value needs approved purpose + restricted role.', locked:false, updatedOn:'12 August 2026', visible:true, visibleRoles:['admin'], editableAfterReg:true, editPerm:'admin', validation:'pan', helpText:'Optional. Full value visible only to restricted-access roles.', branchScope:'inherit', searchable:false, sensitive:true, maskRule:'restricted'}
];

/* ---------- Consent Types data ---------- */
const CONSENT_VALIDITY = { perEncounter:'Per encounter', duration:'For a set duration', untilWithdrawn:'Until revoked' };

const CONSENTS = [
 {id:'treatment', name:'Treatment & Procedure Consent', applies:'All patients, before the first treatment session', validity:'duration', validityDays:90, required:true, status:'active', note:'', locked:false, updatedOn:'12 August 2026', type:'treatment', serviceTags:['allservices'], captureStage:'pretreatment', signatories:['patient','guardian','approved'], signatureRequired:true, witnessRequired:true, supportingDocument:false, withdrawalEnabled:true, withdrawalCount:0},
 {id:'photo-consent', name:'Clinical Photography / Progress Media Consent', applies:'Any session capturing wound photos or progress media', validity:'untilWithdrawn', required:true, status:'active', note:'Required before clinical photography.', locked:false, updatedOn:'12 August 2026', type:'photography', serviceTags:['photography','wounddebridement','dressing'], captureStage:'prephoto', signatories:['patient','guardian','approved'], signatureRequired:true, witnessRequired:false, supportingDocument:false, withdrawalEnabled:true, withdrawalCount:2},
 {id:'wa-sms', name:'WhatsApp / SMS Communication Consent', applies:'All patients providing a mobile number', validity:'untilWithdrawn', required:true, status:'active', note:'', locked:false, updatedOn:'10 August 2026', type:'communication', serviceTags:['allservices'], captureStage:'registration', signatories:['patient','guardian'], signatureRequired:false, witnessRequired:false, supportingDocument:false, withdrawalEnabled:true, withdrawalCount:5},
 {id:'referral-share', name:'Data Sharing with Referring Doctor / Facility', applies:'Patients with an external referral on file', validity:'duration', validityDays:365, required:false, status:'active', note:'', locked:false, updatedOn:'08 August 2026', type:'datasharing', serviceTags:['allservices'], captureStage:'registration', signatories:['patient','guardian','approved'], signatureRequired:true, witnessRequired:false, supportingDocument:false, withdrawalEnabled:true, withdrawalCount:0},
 {id:'marketing', name:'Marketing Communication Consent', applies:'Opt-in only', validity:'untilWithdrawn', required:false, status:'active', note:'', locked:false, updatedOn:'05 August 2026', type:'communication', serviceTags:['allservices'], captureStage:'registration', signatories:['patient','guardian'], signatureRequired:false, witnessRequired:false, supportingDocument:false, withdrawalEnabled:true, withdrawalCount:8},
];

/* ---------- Document Upload data (Workspace 15 §"Document / upload configuration") ---------- */
const DOCUMENTS = [
 {id:'wound-photo', name:'Wound / Clinical Photograph', requiredMetadata:['docdate','visit','treatment'], origDateReq:true, sourceReq:false, maxSizeMB:15, allowedRoles:['doctor','nurse','admin'], safeState:'enforced', required:true, status:'active', note:'', locked:false, updatedOn:TODAY},
 {id:'consent-scan', name:'Signed Consent Form Scan', requiredMetadata:['docdate','uploadedby'], origDateReq:true, sourceReq:false, maxSizeMB:10, allowedRoles:['reception','admin'], safeState:'enforced', required:true, status:'active', note:'', locked:false, updatedOn:TODAY},
 {id:'lab-report', name:'Lab / Diagnostic Report', requiredMetadata:['docdate','source','visit'], origDateReq:true, sourceReq:true, maxSizeMB:20, allowedRoles:['doctor','nurse','admin'], safeState:'enforced', required:false, status:'active', note:'', locked:false, updatedOn:TODAY},
 {id:'referral-letter', name:'Referral Letter', requiredMetadata:['docdate','source'], origDateReq:true, sourceReq:true, maxSizeMB:10, allowedRoles:['reception','doctor','admin'], safeState:'enforced', required:false, status:'active', note:'', locked:false, updatedOn:TODAY},
 {id:'id-proof', name:'Government ID Proof', requiredMetadata:['uploadedby'], origDateReq:false, sourceReq:false, maxSizeMB:5, allowedRoles:['reception','admin'], safeState:'enforced', required:true, status:'active', note:'', locked:false, updatedOn:TODAY},
 {id:'prior-record', name:'Prior Prescription / Discharge Summary', requiredMetadata:['docdate','source'], origDateReq:true, sourceReq:true, maxSizeMB:20, allowedRoles:['doctor','nurse','admin'], safeState:'flag', required:false, status:'conflict', note:'Max file size flagged by IT as too high for mobile uploads · review before publishing.', locked:false, updatedOn:TODAY}
];

let activeTab = 'fields';

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
  return { set:v=>setVal(v,true), get:()=>hidden.value, setOptions:(opts2)=>{ opts=opts2; panel.innerHTML = opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+v+'">'+esc(l)+'</button>').join(''); setVal(opts[0][0], true); } };
}
document.addEventListener('click', ()=>$$('.f.fsel,.mchk').forEach(x=>x.classList.remove('open')));
function initMchk(rootId,btnId,panelId,chipsId,vocab,placeholder,searchable,onChange){
  const root=$('#'+rootId), btn=$('#'+btnId), panel=$('#'+panelId), chipsEl=$('#'+chipsId); let selected=[];
  const searchHTML=searchable?'<input type="text" class="mchk-search" placeholder="Search…" id="'+panelId+'Search">':'';
  const renderChips=()=>{ chipsEl.innerHTML=selected.map(v=>'<span class="mchip">'+esc(vocab[v]||v)+'<button type="button" data-rm="'+esc(v)+'">&times;</button></span>').join(''); btn.textContent=selected.length?selected.length+' selected':placeholder; };
  const renderPanel=()=>{ panel.innerHTML=searchHTML+Object.entries(vocab).map(([v,l])=>'<label class="mchk-opt"><input type="checkbox" value="'+esc(v)+'" '+(selected.includes(v)?'checked':'')+'><span>'+esc(l)+'</span></label>').join('');
    if(searchable){ const si=$('#'+panelId+'Search'); si.addEventListener('input',e=>{ const q=e.target.value.trim().toLowerCase(); $$('#'+panelId+' .mchk-opt').forEach(el=>{ el.style.display=(!q||el.textContent.toLowerCase().includes(q))?'':'none'; }); }); si.addEventListener('click',e=>e.stopPropagation()); } };
  renderPanel(); renderChips();
  btn.addEventListener('click',e=>{ e.stopPropagation(); const was=root.classList.contains('open'); $$('.f.fsel,.mchk').forEach(x=>x.classList.remove('open')); if(!was){ root.classList.add('open'); if(searchable){ const si=$('#'+panelId+'Search'); si.value=''; $$('#'+panelId+' .mchk-opt').forEach(el=>el.style.display=''); si.focus(); } } });
  panel.addEventListener('change',e=>{ const cb=e.target.closest('input[type=checkbox]'); if(!cb) return; if(cb.checked){ if(!selected.includes(cb.value)) selected.push(cb.value); } else selected=selected.filter(v=>v!==cb.value); renderChips(); if(onChange) onChange(); });
  chipsEl.addEventListener('click',e=>{ const b=e.target.closest('[data-rm]'); if(!b) return; selected=selected.filter(v=>v!==b.dataset.rm); renderChips(); renderPanel(); if(onChange) onChange(); });
  return { set(arr){ selected=Array.isArray(arr)?arr.slice():[]; renderPanel(); renderChips(); }, get(){ return selected.slice(); } };
}

/* ---------- custom multi-select chip group (Visible-to-roles, Applicable service, Allowed signatory, Required metadata, Allowed roles) ---------- */
function initChipGroup(containerId, opts){
  const el = $('#'+containerId);
  el.innerHTML = opts.map(([v,l])=>`<button type="button" class="chipopt" data-v="${v}">${esc(l)}</button>`).join('');
  let selected = new Set();
  const sync = () => $$('.chipopt', el).forEach(b=>b.classList.toggle('on', selected.has(b.dataset.v)));
  el.addEventListener('click', e=>{
    const b=e.target.closest('.chipopt'); if(!b) return;
    const v=b.dataset.v;
    if(selected.has(v)) selected.delete(v); else selected.add(v);
    sync();
  });
  return { get:()=>[...selected], set:(vals)=>{ selected=new Set(vals||[]); sync(); } };
}

const statOpts = [['','All statuses'],['active','Active'],['draft','Draft'],['conflict','Validation conflict']];
const statDD = initFsel('statWrap','statBtn','statPanel','fStat', statOpts, applyFilters);
const catDD = initFsel('catWrap','catBtn','catPanel','fCat',
  [['','All categories'], ...Object.entries(FIELD_CATS)], applyFilters);

/* ---------- tab switching ---------- */
$('#tabSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  activeTab = b.dataset.t;
  $$('#tabSeg button').forEach(x=>x.classList.toggle('on', x===b));
  $('#newBtnTxt').textContent = activeTab==='fields' ? 'Add field' : activeTab==='consent' ? 'Add consent type' : 'Add document category';
  $('#pfSearch').placeholder = activeTab==='fields' ? 'Field name…' : activeTab==='consent' ? 'Consent name…' : 'Document category…';
  $('#catWrap').style.display = activeTab==='documents' ? 'none' : '';
  $('#catLbl').textContent = activeTab==='fields' ? 'Category' : 'Consent type';
  if(activeTab==='fields') catDD.setOptions([['','All categories'], ...Object.entries(FIELD_CATS)]);
  else if(activeTab==='consent') catDD.setOptions([['','All consent types'], ...Object.entries(CONSENT_TYPES)]);
  $('#pfSearch').value=''; statDD.set('');
  $$('.note[data-tab]').forEach(n => n.style.display = n.dataset.tab===activeTab ? '' : 'none');
  renderHead();
  renderStats();
  applyFilters();
});

function renderHead(){
  const drag = '<th style="width:28px"></th>';
  if(activeTab==='fields'){
    $('#tblHead').innerHTML = `<tr>${drag}<th>Field</th><th>Category</th><th>Type</th><th>Required</th><th>Sensitive</th><th>Status</th><th style="text-align:right">Actions</th></tr>`;
  } else if(activeTab==='consent'){
    $('#tblHead').innerHTML = `<tr>${drag}<th>Consent type</th><th>Type</th><th>Applies to</th><th>Validity</th><th>Required</th><th>Status</th><th style="text-align:right">Actions</th></tr>`;
  } else {
    $('#tblHead').innerHTML = `<tr>${drag}<th>Document category</th><th>Metadata required</th><th>Max size</th><th>Allowed roles</th><th>Safe-file state</th><th>Status</th><th style="text-align:right">Actions</th></tr>`;
  }
}

/* ---------- render ---------- */
function dataset(){ return activeTab==='fields' ? FIELDS : activeTab==='consent' ? CONSENTS : DOCUMENTS; }

function renderRow(e){
  const st = STATUS[e.status];
  const req = e.required ? '<span class="dot-y">✓</span>' : '<span class="dot-n">—</span>';
  const lockTag = e.locked ? LOCK_ICON : '';
  const dragCell = `<td><span class="draghandle" draggable="true" data-drag="${e.id}" title="Drag to reorder (Display Order)"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></span></td>`;
  if(activeTab==='fields'){
    const masked = e.masked ? '<span class="dot-y">✓</span>' : '<span class="dot-n">—</span>';
    return `<tr data-id="${e.id}">
      ${dragCell}
      <td><b>${esc(e.name)}${lockTag}</b>${e.note ? `<span class="s">${esc(e.note)}</span>` : ''}</td>
      <td><span class="s">${esc(FIELD_CATS[e.cat])}</span></td>
      <td><span class="s">${esc(FIELD_TYPES[e.type])}</span></td>
      <td>${req}</td>
      <td>${masked}</td>
      <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}" ${e.locked?'disabled title="System-generated, not editable"':''}>Edit</button></td>
    </tr>`;
  }
  if(activeTab==='consent'){
    return `<tr data-id="${e.id}">
      ${dragCell}
      <td><b>${esc(e.name)}</b>${e.note ? `<span class="s">${esc(e.note)}</span>` : ''}</td>
      <td><span class="chip info">${esc(CONSENT_TYPES[e.type]||'—')}</span></td>
      <td><span class="s">${esc(e.applies)}</span></td>
      <td><span class="s">${esc(CONSENT_VALIDITY[e.validity]||'Per encounter')}${e.validity==='duration'&&e.validityDays?' · '+e.validityDays+' days':''}</span></td>
      <td>${req}</td>
      <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td>
    </tr>`;
  }
  const roles = (e.allowedRoles||[]).map(r=>ROLES[r]).join(', ') || '—';
  const meta = (e.requiredMetadata||[]).map(m=>DOC_METADATA[m]).join(', ') || '—';
  const safe = SAFE_STATES[e.safeState] || SAFE_STATES.off;
  return `<tr data-id="${e.id}">
    ${dragCell}
    <td><b>${esc(e.name)}${lockTag}</b>${e.note ? `<span class="s">${esc(e.note)}</span>` : ''}</td>
    <td><span class="s">${esc(meta)}</span></td>
    <td><span class="s">${e.maxSizeMB} MB</span></td>
    <td><span class="s">${esc(roles)}</span></td>
    <td><span class="chip ${safe.cls}">${esc(safe.n)}</span></td>
    <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td style="text-align:right"><button class="mini" data-edit="${e.id}" ${e.locked?'disabled title="System-generated, not editable"':''}>Edit</button></td>
  </tr>`;
}

function renderStats(){
  const list = dataset();
  $('#stTotalLbl').textContent = activeTab==='fields' ? 'Total fields' : activeTab==='consent' ? 'Total consent types' : 'Document categories';
  $('#stTotal').textContent = list.length;
  $('#stRequired').textContent = list.filter(e=>e.required).length;
  $('#stMaskedLbl').textContent = activeTab==='fields' ? 'Masked / restricted' : activeTab==='consent' ? 'Withdrawable' : 'Safe-file enforced';
  $('#stMasked').textContent = activeTab==='fields'
    ? list.filter(e=>e.masked).length
    : activeTab==='consent'
      ? list.filter(e=>e.validity==='untilWithdrawn').length
      : list.filter(e=>e.safeState==='enforced').length;
  $('#stConflict').textContent = list.filter(e=>e.status==='conflict').length;
}

function applyFilters(resetPage){
  if(resetPage!==false) page = 1;
  const q = $('#pfSearch').value.trim().toLowerCase();
  const cat = catDD.get(), stat = statDD.get();
  const list = dataset().filter(e => {
    if(q && !e.name.toLowerCase().includes(q)) return false;
    if(activeTab==='fields' && cat && e.cat!==cat) return false;
    if(activeTab==='consent' && cat && e.type!==cat) return false;
    if(stat && e.status!==stat) return false;
    return true;
  });
  renderList(list);
}
const PAGE_SIZE = 10; let page = 1;
function renderPager(total){
  const pages = Math.max(1, Math.ceil(total/PAGE_SIZE));
  if(!total || pages<=1){ $('#pager').innerHTML = ''; return; }
  let btns = ''; for(let p=1; p<=pages; p++) btns += '<button class="pgbtn'+(p===page?' on':'')+'" data-p="'+p+'">'+p+'</button>';
  $('#pager').innerHTML = '<button class="pgbtn nav" data-p="prev"'+(page===1?' disabled':'')+'>‹ Prev</button>'+btns+'<button class="pgbtn nav" data-p="next"'+(page===pages?' disabled':'')+'>Next ›</button>';
}
$('#pager').addEventListener('click', e=>{ const b=e.target.closest('.pgbtn'); if(!b||b.disabled) return;
  const pages = Math.max(1, Math.ceil(lastFiltered.length/PAGE_SIZE));
  page = b.dataset.p==='prev' ? page-1 : b.dataset.p==='next' ? page+1 : +b.dataset.p; page=Math.min(Math.max(1,page),pages); renderList(lastFiltered); });
let lastFiltered = [];
function renderList(list){
  lastFiltered = list;
  const full = dataset();
  const body = $('#pfBody');
  $('#pfEmptyTxt').textContent = activeTab==='fields' ? 'No fields match these filters' : activeTab==='consent' ? 'No consent types match these filters' : 'No document categories match these filters';
  if(!list.length){
    body.innerHTML=''; $('#pfEmpty').style.display='block'; $('#pager').innerHTML='';
    $('#pfFoot').textContent = `Showing 0 of ${full.length}`;
    return;
  }
  $('#pfEmpty').style.display='none';
  const pages = Math.max(1, Math.ceil(list.length/PAGE_SIZE)); if(page>pages) page=pages;
  const rows = list.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  body.innerHTML = rows.map(renderRow).join('');
  const what = activeTab==='fields'?'fields':activeTab==='consent'?'consent types':'document categories';
  $('#pfFoot').textContent = `Showing ${(page-1)*PAGE_SIZE+1}–${(page-1)*PAGE_SIZE+rows.length} of ${list.length} ${what}`+(list.length!==full.length?` (${full.length} total)`:'');
  renderPager(list.length);
}

$('#pfSearch').addEventListener('input', applyFilters);
$('#pfBody').addEventListener('click', e=>{
  const b=e.target.closest('[data-edit]'); if(!b || b.disabled) return;
  openDrawer(b.dataset.edit);
});

/* ---------- drawer ---------- */
const dCatDD = initFsel('dCatWrap','dCatBtn','dCatPanel','dCat', Object.entries(FIELD_CATS));
const dTypeDD = initFsel('dTypeWrap','dTypeBtn','dTypePanel','dType', Object.entries(FIELD_TYPES).filter(([k])=>k!=='auto'));
const dValidityDD = initFsel('dValidityWrap','dValidityBtn','dValidityPanel','dValidity', Object.entries(CONSENT_VALIDITY), v=>{ $('#dValidityDurWrap').style.display = v==='duration' ? '' : 'none'; });

/* ---------- field-configuration drawer controls (Visible, Editable After Registration, Validation, Masking Rule…) ---------- */
const dVisibleRolesCG = initMchk('dVisibleRolesWrap','dVisibleRolesBtn','dVisibleRolesPanel','dVisibleRolesChips', ROLES, 'Select roles', false);
const dEditPermDD = initFsel('dEditPermWrap','dEditPermBtn','dEditPermPanel','dEditPerm', Object.entries(EDIT_PERMISSIONS));
const dValidationDD = initFsel('dValidationWrap','dValidationBtn','dValidationPanel','dValidation', Object.entries(VALIDATION_RULES), v=>{ $('#dCustomRuleWrap').style.display = v==='custom' ? '' : 'none'; });
const CR_CHARS = { any:'Any characters', letters:'Letters only', numbers:'Numbers only', alnum:'Letters and numbers' };
const dCrCharsDD = initFsel('dCrCharsWrap','dCrCharsBtn','dCrCharsPanel','dCrChars', Object.entries(CR_CHARS));
const dMaskRuleDD = initFsel('dMaskRuleWrap','dMaskRuleBtn','dMaskRulePanel','dMaskRule', Object.entries(MASK_RULES));
$('#dBranchSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  $$('#dBranchSeg button').forEach(x=>x.classList.toggle('on', x===b));
});

/* ---------- consent-configuration drawer controls (Consent Type, Applicable Service, Capture Stage, Signatory…) ---------- */
const dConsentTypeDD = initFsel('dConsentTypeWrap','dConsentTypeBtn','dConsentTypePanel','dConsentType', Object.entries(CONSENT_TYPES));
const dServiceTagsCG = initMchk('dSvcWrap','dSvcBtn','dSvcPanel','dSvcChips', SVC_VOCAB, 'All services', true);
const dCaptureStageDD = initFsel('dCaptureStageWrap','dCaptureStageBtn','dCaptureStagePanel','dCaptureStage', Object.entries(CAPTURE_STAGES));
const dSignatoriesCG = initChipGroup('dSignatories', Object.entries(SIGNATORIES));

/* ---------- document-upload drawer controls (Required Metadata, Allowed Roles, Safe-file Processing State…) ---------- */
const dDocMetadataCG = initChipGroup('dDocMetadata', Object.entries(DOC_METADATA));
const dDocRolesCG = initMchk('dDocRolesWrap','dDocRolesBtn','dDocRolesPanel','dDocRolesChips', ROLES, 'Select roles', false);
const dSafeStateDD = initFsel('dSafeStateWrap','dSafeStateBtn','dSafeStatePanel','dSafeState', SAFE_STATE_OPTS);

const scrim=$('#scrim'), drawer=$('#drawer');
let editId=null;

function openDrawer(id){
  editId = id;
  const list = dataset();
  const e = id ? list.find(x=>x.id===id) : null;
  const isField = activeTab==='fields', isConsent = activeTab==='consent', isDocument = activeTab==='documents';
  const kind = isField ? 'field' : isConsent ? 'consent type' : 'document category';

  $('#dNameLbl').textContent = isField ? 'Field name' : isConsent ? 'Consent name' : 'Document category';
  $('#dName').placeholder = isField ? 'e.g. Alternate Contact Number' : isConsent ? 'e.g. Insurance Data Sharing Consent' : 'e.g. Referral Letter';
  $('#fieldOnlyGroup').style.display = isField ? 'block' : 'none';
  $('#consentOnlyGroup').style.display = isConsent ? 'block' : 'none';
  $('#documentOnlyGroup').style.display = isDocument ? 'block' : 'none';

  $('#dTitle').textContent = e ? ('Edit ' + kind) : ('Add ' + kind);
  $('#dSub').textContent = e ? 'Update this configuration entry' : `Define a new ${isField ? 'patient field' : kind}`;

  $('#dName').value = e ? e.name : '';
  if(isField){
    dCatDD.set(e ? e.cat : Object.keys(FIELD_CATS)[0]);
    dTypeDD.set(e ? (e.type==='auto'?'text':e.type) : Object.keys(FIELD_TYPES)[0]);
    $('#dMasked').checked = e ? e.masked : false;
    $('#dVisible').checked = e ? (e.visible!==false) : true;
    dVisibleRolesCG.set(e ? (e.visibleRoles||ALL_ROLES) : ALL_ROLES);
    $('#dEditableAfterReg').checked = e ? (e.editableAfterReg!==false) : true;
    dEditPermDD.set(e ? (e.editPerm||'anyone') : 'anyone');
    dValidationDD.set(e ? (e.validation||'none') : 'none');
    { const cr=(e&&e.customRule)||{}; $('#dCustomRuleWrap').style.display = (e&&e.validation==='custom') ? '' : 'none'; $('#dCrMin').value=cr.min||''; $('#dCrMax').value=cr.max||''; dCrCharsDD.set(cr.chars||'any'); $('#dCrMsg').value=cr.msg||''; }
    $('#dHelpText').value = e ? (e.helpText||'') : '';
    $$('#dBranchSeg button').forEach(b=>b.classList.toggle('on', b.dataset.v === (e ? (e.branchScope||'inherit') : 'inherit')));
    $('#dSearchable').checked = e ? (e.searchable!==false) : true;
    $('#dSensitive').checked = e ? !!(e.sensitive||e.masked) : false;
    dMaskRuleDD.set(e ? (e.maskRule||'none') : 'none');
  } else if(isConsent){
    $('#dApplies').value = e ? e.applies : '';
    dValidityDD.set(e ? e.validity : Object.keys(CONSENT_VALIDITY)[0]); $('#dValidityDurWrap').style.display = (e ? e.validity : '')==='duration' ? '' : 'none'; $('#dValidityDur').value = e && e.validityDays ? e.validityDays : 90;
    dConsentTypeDD.set(e ? (e.type||'treatment') : 'treatment');
    dServiceTagsCG.set(e ? (e.serviceTags||[]).filter(t=>SVC_VOCAB[t]) : []);
    dCaptureStageDD.set(e ? (e.captureStage||'registration') : 'registration');
    dSignatoriesCG.set(e ? (e.signatories||['patient']) : ['patient']);
    $('#dSignatureRequired').checked = e ? !!e.signatureRequired : true;
    $('#dWitnessRequired').checked = e ? !!e.witnessRequired : false;
    $('#dSupportingDoc').checked = e ? !!e.supportingDocument : false;
    $('#dWithdrawal').checked = e ? (e.withdrawalEnabled!==false) : true;
    if(e && e.withdrawalEnabled && e.withdrawalCount){ $('#dWithdrawalHistWrap').style.display='block'; $('#dWithdrawalHist').textContent = `${e.withdrawalCount} patient(s) have withdrawn this consent. Full history retained.`; }
    else { $('#dWithdrawalHistWrap').style.display='none'; }
  } else {
    dDocMetadataCG.set(e ? (e.requiredMetadata||[]) : ['docdate']);
    $('#dOrigDateReq').checked = e ? !!e.origDateReq : false;
    $('#dSourceReq').checked = e ? !!e.sourceReq : false;
    $('#dMaxSize').value = e ? e.maxSizeMB : 10;
    dDocRolesCG.set(e ? (e.allowedRoles||['admin']) : ['admin']);
    dSafeStateDD.set(e ? (e.safeState||'enforced') : 'enforced');
  }
  $('#dRequired').checked = e ? e.required : true;
  $$('#dStatusSeg button').forEach(b=>b.classList.toggle('on', b.dataset.v === (e && e.status==='conflict' ? 'active' : (e ? e.status : 'active'))));
  $('#dNote').value = e ? (e.note||'') : '';
  if(e){ $('#dMetaWrap').style.display='block'; $('#dMeta').textContent = e.updatedOn==='—' ? 'System-generated, no edit history' : `Last updated ${e.updatedOn}`; }
  else { $('#dMetaWrap').style.display='none'; }

  scrim.classList.add('show'); drawer.classList.add('show');
}
function closeDrawer(){ scrim.classList.remove('show'); drawer.classList.remove('show'); editId=null; }

$('#newBtn').addEventListener('click', ()=>openDrawer(null));
$('#dClose').addEventListener('click', closeDrawer);
$('#dCancel').addEventListener('click', closeDrawer);
scrim.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ $$('.f.fsel').forEach(x=>x.classList.remove('open')); if(drawer.classList.contains('show')) closeDrawer(); } });

$('#dStatusSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  $$('#dStatusSeg button').forEach(x=>x.classList.toggle('on', x===b));
});

$('#dSave').addEventListener('click', ()=>{
  const name = $('#dName').value.trim();
  const isField = activeTab==='fields', isConsent = activeTab==='consent', isDocument = activeTab==='documents';
  if(name.length < 2){ toast(isField ? 'Give this field a name' : isConsent ? 'Give this consent type a name' : 'Give this document category a name'); return; }
  if(activeTab==='fields' && $('#dValidation').value==='custom'){ const mn=Number($('#dCrMin').value)||0, mx=Number($('#dCrMax').value)||0; if(mx && mx<mn){ toast('Max length must be at least the min length'); return; } if(!$('#dCrMsg').value.trim()){ toast('Add the error message staff will see'); return; } }
  const required = $('#dRequired').checked;
  const statusBtn = $('#dStatusSeg button.on');
  const status = statusBtn ? statusBtn.dataset.v : 'active';
  const note = $('#dNote').value.trim();
  const wasEdit = !!editId;
  const list = dataset();

  let payload;
  if(isField){
    const branchBtn = $('#dBranchSeg button.on');
    payload = { name, cat:$('#dCat').value, type:$('#dType').value, required, masked:$('#dSensitive').checked && $('#dMaskRule').value!=='none', status, note, locked:false, updatedOn:TODAY,
      visible:$('#dVisible').checked, visibleRoles:dVisibleRolesCG.get(),
      editableAfterReg:$('#dEditableAfterReg').checked, editPerm:$('#dEditPerm').value,
      validation:$('#dValidation').value, customRule: $('#dValidation').value==='custom' ? {min:Number($('#dCrMin').value)||0, max:Number($('#dCrMax').value)||0, chars:$('#dCrChars').value, msg:$('#dCrMsg').value.trim()} : undefined, helpText:$('#dHelpText').value.trim(),
      branchScope: branchBtn ? branchBtn.dataset.v : 'inherit',
      searchable:$('#dSearchable').checked, sensitive:$('#dSensitive').checked, maskRule:$('#dMaskRule').value };
  } else if(isConsent){
    const applies = $('#dApplies').value.trim();
    if(applies.length < 4){ toast('Describe who this consent applies to'); return; }
    payload = { name, applies, validity:$('#dValidity').value, validityDays: $('#dValidity').value==='duration' ? (Number($('#dValidityDur').value)||90) : undefined, required, status, note, locked:false, updatedOn:TODAY,
      type:$('#dConsentType').value, serviceTags:dServiceTagsCG.get(), captureStage:$('#dCaptureStage').value,
      signatories:dSignatoriesCG.get(), signatureRequired:$('#dSignatureRequired').checked, witnessRequired:$('#dWitnessRequired').checked,
      supportingDocument:$('#dSupportingDoc').checked, withdrawalEnabled:$('#dWithdrawal').checked,
      withdrawalCount: wasEdit ? (list.find(x=>x.id===editId).withdrawalCount||0) : 0 };
  } else {
    payload = { name, requiredMetadata:dDocMetadataCG.get(), origDateReq:$('#dOrigDateReq').checked, sourceReq:$('#dSourceReq').checked,
      maxSizeMB: Number($('#dMaxSize').value)||10, allowedRoles:dDocRolesCG.get(), safeState:$('#dSafeState').value,
      required, status, note, locked:false, updatedOn:TODAY };
  }

  const btn = $('#dSave');
  btn.disabled = true; btn.textContent = 'Saving…';
  setTimeout(()=>{
    if(wasEdit){
      const e = list.find(x=>x.id===editId);
      Object.assign(e, payload);
    } else {
      list.push(Object.assign({id:(isField?'fld-':isConsent?'cst-':'doc-')+Date.now()}, payload));
    }
    btn.disabled=false; btn.textContent='Save';
    closeDrawer();
    renderStats();
    applyFilters();
    toast(wasEdit ? 'Saved' : (isField ? 'Field added' : isConsent ? 'Consent type added' : 'Document category added'));
  }, 500);
});

/* ---------- drag-to-reorder rows · Display Order control ---------- */
let dragSrcId = null;
$('#pfBody').addEventListener('dragstart', e=>{
  const h = e.target.closest('[data-drag]'); if(!h) return;
  dragSrcId = h.dataset.drag;
  if(e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  h.closest('tr').classList.add('dragging');
});
$('#pfBody').addEventListener('dragend', e=>{
  const tr = e.target.closest('tr'); if(tr) tr.classList.remove('dragging');
  $$('#pfBody tr').forEach(r=>r.classList.remove('drag-over'));
  dragSrcId = null;
});
$('#pfBody').addEventListener('dragover', e=>{
  if(!dragSrcId) return;
  e.preventDefault();
  const tr = e.target.closest('tr'); if(!tr) return;
  $$('#pfBody tr').forEach(r=>r.classList.remove('drag-over'));
  if(tr.dataset.id !== dragSrcId) tr.classList.add('drag-over');
});
$('#pfBody').addEventListener('drop', e=>{
  e.preventDefault();
  const tr = e.target.closest('tr'); if(!tr || !dragSrcId) return;
  const targetId = tr.dataset.id;
  if(targetId === dragSrcId) return;
  const list = dataset();
  const fromIdx = list.findIndex(x=>x.id===dragSrcId);
  const toIdx = list.findIndex(x=>x.id===targetId);
  if(fromIdx<0 || toIdx<0) return;
  const [item] = list.splice(fromIdx,1);
  list.splice(toIdx,0,item);
  applyFilters();
  toast('Display order updated');
});

/* ---------- init ---------- */
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

