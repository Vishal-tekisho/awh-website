document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

const STATUS = {
  draft:    {n:'Draft', cls:''},
  active:   {n:'Active / Published', cls:'on'},
  future:   {n:'Future Effective', cls:'info'},
  inactive: {n:'Inactive / Superseded', cls:'warn'}
};
const TYPES = { lookup:'Lookup Master', identifier:'Identifier Format' };
const CONTEXTS = ['Organization','Main Campus','OPD Annexe','Madhurawada Branch'];
const INHERIT = { org:'Using Organization Default', inherited:'Inherited from KVNN Organization Default', override:'Branch Override' };
const RESET_RULES = { never:'Never', year:'Calendar year', custom:'Daily (queue tokens and lab accession only)' };
const BRANCH_CODES = { 'Organization':'MAIN', 'Main Campus':'MAIN', 'OPD Annexe':'OPDA', 'Madhurawada Branch':'MDW' };

const REFERENCES = [
 // ---- Reference lookup masters (existing) ----
 {id:'rf-1', name:'Visit Categories', type:'lookup', code:'VIS-CAT', displayOrder:10, context:'Organization', inherit:'org', detail:'New, Follow-up, Emergency, Home Visit', status:'active', updatedOn:'12 June 2024'},
 {id:'rf-2', name:'Document Types', type:'lookup', code:'DOC-TYP', displayOrder:20, context:'Organization', inherit:'org', detail:'Referral Letter, Lab Report, Discharge Summary, Consent Form', status:'active', updatedOn:'12 June 2024'},
 {id:'rf-4', name:'Cancellation Reasons', type:'lookup', code:'CNL-RSN', displayOrder:40, context:'Organization', inherit:'org', detail:'Patient request, Doctor unavailable, Weather, Other', status:'active', updatedOn:'10 August 2026'},

 // ---- Identifier / numbering configuration (existing, backfilled with structured fields) ----
 {id:'rf-5', name:'MRN / UHID Format', type:'identifier', code:'MRN-UHID', displayOrder:200, context:'Organization', inherit:'org',
  prefix:'AWH', includeBranchCode:true, numericLength:4, resetRule:'year', nextSeq:483, effectiveFrom:'01 June 2024',
  detail:'AWH-YYYY-#### · resets yearly, branch-wise sequence', status:'active', updatedOn:'01 June 2024'},
 {id:'rf-6', name:'Token Number Format', type:'identifier', code:'TOKEN-NUM', displayOrder:210, context:'Organization', inherit:'org',
  prefix:'DR', includeBranchCode:false, numericLength:3, resetRule:'custom', nextSeq:47, effectiveFrom:'01 June 2024',
  detail:'DR-### (doctor queue) / RC-### (reception queue) · resets daily', status:'active', updatedOn:'01 June 2024'},
 {id:'rf-7', name:'Lab Accession Number', type:'identifier', code:'LAB-ACC', displayOrder:220, context:'Organization', inherit:'org',
  prefix:'LAB', includeBranchCode:false, numericLength:3, resetRule:'custom', nextSeq:212, effectiveFrom:'15 July 2026',
  detail:'LAB-YYYYMMDD-### · resets daily', status:'active', updatedOn:'15 July 2026'},

 // ---- Identifier / numbering configuration (added) ----
 {id:'rf-8', name:'Visit Number', type:'identifier', code:'VIS-NUM', displayOrder:230, context:'Organization', inherit:'org',
  prefix:'VIS', includeBranchCode:true, numericLength:6, resetRule:'year', nextSeq:1, effectiveFrom:'01 April 2027',
  detail:'Branch-coded, resets yearly with financial year (prepared ahead)', status:'future', updatedOn:'01 August 2026'},
 {id:'rf-9', name:'Encounter Number', type:'identifier', code:'ENC-NUM', displayOrder:240, context:'Organization', inherit:'org',
  prefix:'ENC', includeBranchCode:true, numericLength:6, resetRule:'never', nextSeq:4821, effectiveFrom:'01 April 2026',
  detail:'Continuous sequence per branch, never resets', status:'active', updatedOn:'01 April 2026'},
 {id:'rf-10', name:'Appointment Number', type:'identifier', code:'APT-NUM', displayOrder:250, context:'Organization', inherit:'org',
  prefix:'APT', includeBranchCode:true, numericLength:6, resetRule:'year', nextSeq:123, effectiveFrom:'01 April 2026',
  detail:'Matches org example MAIN-APT-000123 · resets yearly', status:'active', updatedOn:'15 August 2026'},
 {id:'rf-11', name:'Stay / Admission Number', type:'identifier', code:'IPD-NUM', displayOrder:260, context:'Organization', inherit:'org',
  prefix:'IPD', includeBranchCode:true, numericLength:5, resetRule:'year', nextSeq:41, effectiveFrom:'01 October 2026',
  detail:'Prepared ahead of in-patient/day-care go-live', status:'draft', updatedOn:'03 August 2026'},
 {id:'rf-12', name:'Procedure Number', type:'identifier', code:'PRC-NUM', displayOrder:270, context:'Organization', inherit:'org',
  prefix:'PRC', includeBranchCode:false, numericLength:6, resetRule:'never', nextSeq:2317, effectiveFrom:'01 June 2024',
  detail:'Organization-wide continuous sequence, no branch code', status:'active', updatedOn:'01 June 2024'},
 {id:'rf-13', name:'Package Number', type:'identifier', code:'PKG-NUM', displayOrder:280, context:'Organization', inherit:'org',
  prefix:'PKG', includeBranchCode:false, numericLength:5, resetRule:'never', nextSeq:412, effectiveFrom:'01 June 2024',
  detail:'Used only where a treatment package is sold', status:'active', updatedOn:'01 June 2024'},

 // ---- Reference lookup masters (added) ----
 {id:'rf-14', name:'Reschedule Reasons', type:'lookup', code:'RSC-RSN', displayOrder:50, context:'Organization', inherit:'org',
  detail:'Doctor unavailable, Patient request, Equipment unavailable, Room conflict, Weather/Travel', status:'active', updatedOn:'01 August 2026'},
 {id:'rf-15', name:'No-show Reasons', type:'lookup', code:'NSW-RSN', displayOrder:60, context:'OPD Annexe', inherit:'override',
  detail:'No response, Transport issue, Forgot appointment, Medical emergency, Auto-rickshaw unavailable, Other', status:'active', updatedOn:'05 August 2026'},
 {id:'rf-16', name:'Appointment Reasons', type:'lookup', code:'APT-RSN', displayOrder:70, context:'Organization', inherit:'org',
  detail:'New Consultation, Follow-up Review, Dressing Change, Second Opinion, Emergency Visit', status:'active', updatedOn:'01 August 2026'},
 {id:'rf-17', name:'Priority Categories', type:'lookup', code:'PRI-CAT', displayOrder:80, context:'Organization', inherit:'org',
  detail:'Routine, Urgent, Emergency', status:'active', updatedOn:'12 August 2026'},
 {id:'rf-18', name:'Patient Categories', type:'lookup', code:'PAT-CAT', displayOrder:90, context:'Organization', inherit:'org',
  detail:'General, Senior Citizen, Staff Family, Referred Patient', status:'active', updatedOn:'01 August 2026'},
 {id:'rf-19', name:'Department Types', type:'lookup', code:'DEP-TYP', displayOrder:100, context:'Main Campus', inherit:'inherited',
  detail:'Clinical, Diagnostic, Administrative, Support Services', status:'active', updatedOn:'01 August 2026'},
 {id:'rf-20', name:'Resource Types', type:'lookup', code:'RES-TYP', displayOrder:110, context:'Organization', inherit:'org',
  detail:'Room, Equipment, Bed, Counter/Point, Vehicle', status:'active', updatedOn:'01 August 2026'},
 {id:'rf-21', name:'Relationship Types', type:'lookup', code:'REL-TYP', displayOrder:120, context:'Organization', inherit:'org',
  detail:'Self, Spouse, Parent, Child, Sibling, Guardian, Other', status:'active', updatedOn:'01 August 2026'},
 {id:'rf-22', name:'Visit Types', type:'lookup', code:'VIS-TYP', displayOrder:130, context:'Organization', inherit:'org',
  detail:'OPD, IPD/Admission, Day Care, Teleconsultation, Home Visit', status:'active', updatedOn:'01 August 2026'},
 {id:'rf-23', name:'Order Hold/Cancel Reasons', type:'lookup', code:'ORD-HLD', displayOrder:140, context:'Organization', inherit:'org',
  detail:'Pending investigation results, Patient declined, Clinical contraindication, Insurance/authorization pending, Duplicate order', status:'active', updatedOn:'06 August 2026'},
 // ---- Patient Fields, Identity & Consent · every dropdown on that screen reads its options from here ----
 {id:'rf-24', name:'Field Validation Rules', type:'lookup', code:'FLD-VAL', displayOrder:150, context:'Organization', inherit:'org', detail:'No validation, Phone (10-digit IN mobile), Email format, PIN code (6-digit), Aadhaar checksum, PAN format, Date not in future, Custom rule', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-25', name:'Masking Rules', type:'lookup', code:'MSK-RUL', displayOrder:151, context:'Organization', inherit:'org', detail:'No masking, Partial (last 4 visible), Full mask, Full value for restricted role only', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-26', name:'Field Edit Permission Levels', type:'lookup', code:'FLD-EDT', displayOrder:152, context:'Organization', inherit:'org', detail:'Anyone with edit access, Reception and above, Clinic Admin only, Locked after registration', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-27', name:'Consent Capture Stages', type:'lookup', code:'CNS-STG', displayOrder:153, context:'Organization', inherit:'org', detail:'At Registration, Before Consultation, Before Treatment / Procedure, At Discharge, Before Clinical Photography', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-28', name:'Document Metadata Fields', type:'lookup', code:'DOC-MET', displayOrder:154, context:'Organization', inherit:'org', detail:'Document Date, Source / Origin, Uploaded By, Associated Visit, Associated Treatment', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-29', name:'Safe-file Processing States', type:'lookup', code:'DOC-SAF', displayOrder:155, context:'Organization', inherit:'org', detail:'Enforced (scanned before storage), Flag and manual review, Not enforced', status:'active', updatedOn:'28 August 2026'},
 // ---- Lists that other screens read (registered here so nothing stays free-standing) ----
 {id:'rf-30', name:'Doctor Sub-specialties', type:'lookup', code:'DOC-SUB', displayOrder:160, context:'Organization', inherit:'org', detail:'Diabetic Foot Care, Chronic Wound Care, Pressure Ulcers, Post-surgical Wounds, Vascular Ulcers, Reconstructive Surgery', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-31', name:'Room Capability Tags', type:'lookup', code:'ROOM-CAP', displayOrder:161, context:'Organization', inherit:'org', detail:'Dressing, Debridement, Bedside Procedure, Long-duration Treatment, Review', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-32', name:'Equipment Categories', type:'lookup', code:'EQP-CAT', displayOrder:162, context:'Organization', inherit:'org', detail:'Treatment Equipment, Diagnostic Equipment, Procedure Equipment, Mobility Aid, Machine, Portable Device', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-33', name:'Responsible Teams', type:'lookup', code:'EQP-TEAM', displayOrder:163, context:'Organization', inherit:'org', detail:'Biomedical Engineering, Nursing Team, Clinical Support, Housekeeping & Facilities, Vendor / AMC Support', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-34', name:'Resource Groups', type:'lookup', code:'RES-GRP', displayOrder:164, context:'Organization', inherit:'org', detail:'Wound Care Team A, Wound Care Team B, Diabetic Foot Unit, PMR Unit', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-35', name:'Doctor Change Reasons', type:'lookup', code:'DOC-CHG', displayOrder:165, context:'Organization', inherit:'org', detail:'Personal / medical leave, Conference / CME, Administrative block, Approved timing change, Substitution arranged, Other', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-36', name:'Holiday & Exception Reasons', type:'lookup', code:'CAL-RSN', displayOrder:166, context:'Organization', inherit:'org', detail:'Public holiday, Festival, Maintenance / renovation, Staff event / training, Weather / emergency, Extended clinic hours, Other', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-37', name:'Shift Holiday Reasons', type:'lookup', code:'SHF-RSN', displayOrder:167, context:'Organization', inherit:'org', detail:'Festival, Public holiday, Low expected footfall, Maintenance / renovation, Other', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-38', name:'Weekend Options', type:'lookup', code:'CAL-WKD', displayOrder:168, context:'Organization', inherit:'org', detail:'Sunday, Saturday, Saturday and Sunday, No weekly off', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-39', name:'Downtime Reasons', type:'lookup', code:'RES-DWN', displayOrder:169, context:'Organization', inherit:'org', detail:'Maintenance, Servicing / recalibration, Reserved (internal use), Out of service', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-40', name:'Treatment Categories', type:'lookup', code:'TRT-CAT', displayOrder:170, context:'Organization', inherit:'org', detail:'Wound Care, Diabetic Foot Care, Post-Surgical Care, Compression Therapy, Advanced Wound Therapy, Physiotherapy', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-41', name:'Service Categories', type:'lookup', code:'SVC-CAT', displayOrder:171, context:'Organization', inherit:'org', detail:'Consultations & Appointments, Wound Care & Dressing, Procedures & Injections, Advanced Wound Therapies, Physiotherapy & Assessment, Diagnostics & Lab Tests, Packages & Bundles, Ward, Room & Admin Charges', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-42', name:'Unit Subtypes', type:'lookup', code:'DEP-SUB', displayOrder:172, context:'Organization', inherit:'org', detail:'OP Unit, Treatment Unit, Procedure Unit, Short Stay, Lab, Admin Office, Records & MRD, Front Office, Reception, Pharmacy, Stores', status:'active', updatedOn:'28 August 2026'},
 {id:'rf-43', name:'Notification Channels', type:'lookup', code:'NTF-CHN', displayOrder:173, context:'Organization', inherit:'org', detail:'WhatsApp, SMS, Email, Push, IVR / Voice', status:'active', updatedOn:'28 August 2026'},
];

const CHANGE_CHIP = {
  'Created':'info', 'Updated':'mute', 'Status Changed':'warn', 'Validation Conflict':'bad', 'Validation Passed':'ok',
  'Signed':'ok', 'Published':'ok', 'Dependency Check':'mute', 'Saved as Draft':'mute',
  'Branch Override Created':'pur', 'Future Effective Scheduled':'info'
};

/* structured, read-only audit trail · Date/Time, Area, Record, Change Type, Changed By, Branch/Context, Old → New, Reason */
const AUDIT = [
 {date:'17 August 2026', time:'11:40 AM', area:'Patients', record:'Fathima Bhanu (Patient)', changeType:'Created', changedBy:'Priya Nair · Front Desk Lead', branch:'Main Campus', old:'—', new:'Registered · walk-in', reason:'—'},
 {date:'16 August 2026', time:'09:15 AM', area:'Patient Fields', record:'Legacy ID (previous system)', changeType:'Validation Conflict', changedBy:'Rajeev Malhotra · Hospital Administrator', branch:'All Branches', old:'Required = No', new:'Required = Yes, no department enabled', reason:'Flagged by field validation'},
 {date:'15 August 2026', time:'09:15 AM', area:'Identifiers & Numbering', record:'Appointment Number', changeType:'Published', changedBy:'Rajeev Malhotra · Hospital Administrator', branch:'Organization', old:'Draft · MAIN-APT-000001', new:'Active from 01 April 2026 · MAIN-APT-000123', reason:'Validation & dependency check passed'},
 {date:'15 August 2026', time:'09:12 AM', area:'Identifiers & Numbering', record:'Appointment Number', changeType:'Dependency Check', changedBy:'Rajeev Malhotra · Hospital Administrator', branch:'Organization', old:'—', new:'0 conflicts · used by Scheduling, Slots & Queue Rules', reason:'Pre-publish check'},
 {date:'14 August 2026', time:'03:20 PM', area:'Resources & Equipment', record:'Autoclave Sterilizer', changeType:'Status Changed', changedBy:'Rajeev Malhotra · Hospital Administrator', branch:'Main Campus', old:'Active', new:'Maintenance', reason:'Sent for annual calibration'},
 {date:'12 August 2026', time:'08:30 AM', area:'Reference Masters', record:'Priority Categories', changeType:'Validation Passed', changedBy:'Rajeev Malhotra · Hospital Administrator', branch:'Organization', old:'—', new:'3 values validated, 0 blockers', reason:'Pre-publish check'},
 {date:'10 August 2026', time:'11:20 AM', area:'Reference Masters', record:'Cancellation Reasons', changeType:'Updated', changedBy:'Rajeev Malhotra · Hospital Administrator', branch:'Organization', old:'Patient request, Doctor unavailable, Weather', new:'Patient request, Doctor unavailable, Weather, Other', reason:'Added catch-all reason per front-desk feedback'},
 {date:'06 August 2026', time:'02:40 PM', area:'Reference Masters', record:'Order Hold/Cancel Reasons', changeType:'Created', changedBy:'Rajeev Malhotra · Hospital Administrator', branch:'Organization', old:'—', new:'5 reasons published', reason:'New master requested by Lab & Pharmacy team'},
 {date:'05 August 2026', time:'10:05 AM', area:'Reference Masters', record:'No-show Reasons', changeType:'Branch Override Created', changedBy:'Rajeev Malhotra · Hospital Administrator', branch:'OPD Annexe', old:'Organization default (5 reasons)', new:'Branch override · added "Auto-rickshaw unavailable"', reason:'Local transport pattern at OPD Annexe'},
 {date:'03 August 2026', time:'04:50 PM', area:'Identifiers & Numbering', record:'Stay / Admission Number', changeType:'Saved as Draft', changedBy:'Rajeev Malhotra · Hospital Administrator', branch:'Organization', old:'—', new:'Draft · MAIN-IPD-2026-00041', reason:'Prepared ahead of IPD/day-care go-live'},
 {date:'01 August 2026', time:'01:00 PM', area:'Identifiers & Numbering', record:'Visit Number', changeType:'Future Effective Scheduled', changedBy:'Rajeev Malhotra · Hospital Administrator', branch:'Organization', old:'—', new:'Active from 01 April 2027', reason:'Aligned to next financial year sequence'},
 {date:'29 July 2026', time:'06:05 PM', area:'EMR / Clinical Notes', record:'Ramesh Chandra Reddy · Follow-up Wound Review', changeType:'Signed', changedBy:'Dr. KVNN Santosh Murthy', branch:'Main Campus', old:'Draft', new:'Signed & Final', reason:'—'}
];

/* shared single-select dropdown (same as every other screen) */
function initFsel(wrapId,btnId,panelId,hiddenId,opts,onPick){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  const setVal=(v,silent)=>{ hidden.value=v; const f=opts.find(o=>o[0]===v); btn.textContent=f?f[1]:(opts[0]?opts[0][1]:''); $$('#'+panelId+' .fselopt').forEach(x=>x.classList.toggle('on',x.dataset.v===v)); if(!silent&&onPick) onPick(v); };
  const render=()=>{ panel.innerHTML=opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+esc(v)+'">'+esc(l)+'</button>').join(''); };
  render(); setVal(opts[0]?opts[0][0]:'', true);
  panel.addEventListener('click',e=>{ const b=e.target.closest('.fselopt'); if(!b) return; setVal(b.dataset.v); root.classList.remove('open'); });
  btn.addEventListener('click',e=>{ e.stopPropagation(); const was=root.classList.contains('open'); $$('.f.fsel').forEach(x=>x.classList.remove('open')); if(!was) root.classList.add('open'); });
  return { set:v=>setVal(v,true), get:()=>hidden.value, setOptions:(o2,keep)=>{ opts=o2; render(); setVal(keep!==undefined?keep:hidden.value,true); } };
}
document.addEventListener('click', ()=>$$('.f.fsel').forEach(x=>x.classList.remove('open')));

/* ============================================================
   BRD §22 · Workspace 20: Reference Values / Identifier Rules /
   Configuration Lifecycle / Audit History (read-only)
   ============================================================ */
/* Which screens read each master · this is what Dependency Check and Impact Preview report (no invented counts) */
const USED_BY = {
  'Visit Categories':['Patients'], 'Document Types':['Patient Fields, Identity & Consent · Document Upload'],
  'Cancellation Reasons':['Slots, Capacity, Booking & Queue Rules · Cancellation & Reschedule'],
  'Reschedule Reasons':['Slots, Capacity, Booking & Queue Rules · Cancellation & Reschedule'],
  'No-show Reasons':['Slots, Capacity, Booking & Queue Rules · Arrival, Queue & No-show'],
  'Appointment Reasons':['Slots, Capacity, Booking & Queue Rules · Booking Rules (Appointment types)'],
  'Priority Categories':['Slots, Capacity, Booking & Queue Rules · Queue priority categories'],
  'Patient Categories':['Patients'], 'Department Types':['Departments & Units'], 'Resource Types':['Resources & Equipment'],
  'Relationship Types':['Patient Fields, Identity & Consent · Caretaker and Emergency contact'], 'Visit Types':['Patients'],
  'Order Hold/Cancel Reasons':['Clinical Orders & Care Plans'],
  'Field Validation Rules':['Patient Fields, Identity & Consent · Validation'], 'Masking Rules':['Patient Fields, Identity & Consent · Masking rule'],
  'Field Edit Permission Levels':['Patient Fields, Identity & Consent · Edit permission'], 'Consent Capture Stages':['Patient Fields, Identity & Consent · Consent Types'],
  'Document Metadata Fields':['Patient Fields, Identity & Consent · Document Upload'], 'Safe-file Processing States':['Patient Fields, Identity & Consent · Document Upload'],
  'MRN / UHID Format':['Patients · registration'], 'Token Number Format':['Slots, Capacity, Booking & Queue Rules · Queue & token'],
  'Lab Accession Number':['Clinical Support Masters · Laboratory'], 'Visit Number':['Patients · visits'], 'Encounter Number':['EMR Templates & Clinical Metrics'],
  'Appointment Number':['Every booking channel (Website, WhatsApp, Voice, Reception)'], 'Stay / Admission Number':['Clinical Support Masters · Lightweight Stay'],
  'Procedure Number':['Treatments & Procedures'], 'Package Number':['Packages & Reference Pricing'],
  'Doctor Sub-specialties':['Doctors & Staff · Sub-specialty'], 'Room Capability Tags':['Rooms & Care Areas · Procedure & Treatment rooms'], 'Equipment Categories':['Resources & Equipment · Category'],
  'Responsible Teams':['Resources & Equipment · Responsible team'], 'Resource Groups':['Doctor Sessions & Staff Rosters · Resource group'], 'Doctor Change Reasons':['Doctor Sessions & Staff Rosters · Temporary doctor change'],
  'Holiday & Exception Reasons':['Calendars & Availability · Holidays & Exceptions'], 'Shift Holiday Reasons':['Calendars & Availability · Shift holidays'], 'Weekend Options':['Calendars & Availability · Calendars'],
  'Downtime Reasons':['Resource Availability · Downtime'], 'Treatment Categories':['Treatments & Procedures · Category'], 'Service Categories':['Services & Consultation Types · Category'],
  'Unit Subtypes':['Departments & Units · Unit type'], 'Notification Channels':['Notifications & Reminders']
};
/* identifier types the BRD keeps in scope (Invoice, Receipt, Claim, Radiology are excluded) */
const ID_TYPES=['MRN / UHID Format','Visit Number','Encounter Number','Appointment Number','Token Number Format','Stay / Admission Number','Procedure Number','Lab Accession Number','Package Number'];
const valuesOf=e=> e.values || (e.detail||'').split(',').map(s=>s.trim()).filter(s=>s&&s!=='—').map(n=>({n, active:true}));
REFERENCES.forEach(e=>{ if(e.type==='lookup') e.values=valuesOf(e); });
const detailOf=e=> e.type==='lookup' ? e.values.filter(v=>v.active).map(v=>v.n).join(', ') : e.detail;

let activeTab='ref';
const PAGE_SIZE=10; const pages={ref:1,id:1,lc:1,audit:1}; const last={ref:[],id:[],lc:[],audit:[]};
function renderPager(key,total){
  const el=$('#'+key+'Pager'); const n=Math.max(1,Math.ceil(total/PAGE_SIZE)); if(pages[key]>n) pages[key]=n;
  if(!total||n<=1){ el.innerHTML=''; return; }
  let b=''; for(let p=1;p<=n;p++) b+='<button class="pgbtn'+(p===pages[key]?' on':'')+'" data-p="'+p+'">'+p+'</button>';
  el.innerHTML='<button class="pgbtn nav" data-p="prev"'+(pages[key]===1?' disabled':'')+'>‹ Prev</button>'+b+'<button class="pgbtn nav" data-p="next"'+(pages[key]===n?' disabled':'')+'>Next ›</button>';
}
$$('.pager').forEach(el=>el.addEventListener('click',e=>{ const b=e.target.closest('.pgbtn'); if(!b||b.disabled) return; const key=el.id.replace('Pager','');
  const n=Math.max(1,Math.ceil(last[key].length/PAGE_SIZE)); pages[key]= b.dataset.p==='prev'?pages[key]-1: b.dataset.p==='next'?pages[key]+1:+b.dataset.p; pages[key]=Math.min(Math.max(1,pages[key]),n); RENDER[key](last[key]); }));
const slice=(key,list)=>{ last[key]=list; const n=Math.max(1,Math.ceil(list.length/PAGE_SIZE)); if(pages[key]>n) pages[key]=n; return list.slice((pages[key]-1)*PAGE_SIZE, pages[key]*PAGE_SIZE); };
const foot=(key,list,rows,what)=> list.length ? `Showing ${(pages[key]-1)*PAGE_SIZE+1}–${(pages[key]-1)*PAGE_SIZE+rows.length} of ${list.length} ${what}` : `Showing 0 ${what}`;
const stchip=s=>{ const st=STATUS[s]; return `<span class="stchip ${st.cls}"><i></i>${st.n}</span>`; };

/* ---------- Reference Values ---------- */
function renderStats(){
  const L = activeTab==='id' ? REFERENCES.filter(e=>e.type==='identifier') : activeTab==='ref' ? REFERENCES.filter(e=>e.type==='lookup') : REFERENCES;
  $('#stTotalLbl').textContent = activeTab==='id' ? 'Identifier rules' : activeTab==='ref' ? 'Reference masters' : 'Configuration records';
  $('#stTotal').textContent=L.length; $('#stActive').textContent=L.filter(e=>e.status==='active').length;
  $('#stDraft').textContent=L.filter(e=>e.status==='draft').length; $('#stFuture').textContent=L.filter(e=>e.status==='future').length;
}
function refRow(e){
  const vals=e.values; const preview=vals.slice(0,4).map(v=>esc(v.n)).join(', ')+(vals.length>4?' +'+(vals.length-4):'');
  return `<tr><td><b>${esc(e.name)}</b>${USED_BY[e.name]?'<span class="s">Used by '+esc(USED_BY[e.name].join('; '))+'</span>':''}</td><td><span class="s">${esc(e.code)}</span></td>
    <td><b>${vals.length}</b><span class="s">${preview}</span></td><td class="num">${e.displayOrder||'—'}</td>
    <td><b>${esc(e.context)}</b><span class="s">${esc(INHERIT[e.inherit]||'')}</span></td><td>${stchip(e.status)}</td>
    <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
}
function applyFilters(reset){ if(reset!==false) pages.ref=1;
  const q=$('#rSearch').value.trim().toLowerCase(), status=rStatusDD.get(), ctx=rCtxDD.get();
  const list=REFERENCES.filter(e=>e.type==='lookup' && (!q||e.name.toLowerCase().includes(q)||e.values.some(v=>v.n.toLowerCase().includes(q))) && (!status||e.status===status) && (!ctx||e.context===ctx)).sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0));
  renderList(list);
}
function renderList(list){ const rows=slice('ref',list); $('#rEmpty').style.display=list.length?'none':'block'; $('#rBody').innerHTML=rows.map(refRow).join(''); $('#rFoot').textContent=foot('ref',list,rows,'reference masters'); renderPager('ref',list.length); }
$('#rSearch').addEventListener('input',()=>applyFilters());
const rStatusDD=initFsel('rStatusWrap','rStatusBtn','rStatusPanel','rStatus',[['','All statuses'],...Object.entries(STATUS).map(([k,v])=>[k,v.n])],()=>applyFilters());
const rCtxDD=initFsel('rCtxWrap','rCtxBtn','rCtxPanel','rCtxF',[['','All contexts'],...CONTEXTS.map(c=>[c,c])],()=>applyFilters());

/* ---------- Identifier Rules ---------- */
const fmtOf=(e,branch)=>{ const parts=[]; if(e.includeBranchCode) parts.push(BRANCH_CODES[branch||ctxBrDD.value]||'MAIN'); parts.push(e.prefix); parts.push(String(e.nextSeq||1).padStart(e.numericLength||4,'0')); return parts.join('-'); };
function idRow(e){
  return `<tr><td><b>${esc(e.name)}</b>${USED_BY[e.name]?'<span class="s">Used by '+esc(USED_BY[e.name].join('; '))+'</span>':''}</td>
    <td><span class="tokenprev">${esc(fmtOf(e))}</span></td><td class="num">${String(e.nextSeq||1).padStart(e.numericLength||4,'0')}</td>
    <td><span class="s">${esc(RESET_RULES[e.resetRule]||'Never')}</span>${e.includeBranchCode?'<span class="s">Branch-coded</span>':''}</td>
    <td class="num">${esc(e.effectiveFrom||'—')}</td><td>${stchip(e.status)}</td>
    <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
}
function applyIdFilters(reset){ if(reset!==false) pages.id=1;
  const q=$('#iSearch').value.trim().toLowerCase(), status=iStatusDD.get();
  const list=REFERENCES.filter(e=>e.type==='identifier' && (!q||e.name.toLowerCase().includes(q)||(e.prefix||'').toLowerCase().includes(q)) && (!status||e.status===status)).sort((a,b)=>(a.displayOrder||0)-(b.displayOrder||0));
  renderIdList(list);
}
function renderIdList(list){ const rows=slice('id',list); $('#iEmpty').style.display=list.length?'none':'block'; $('#iBody').innerHTML=rows.map(idRow).join(''); $('#iFoot').textContent=foot('id',list,rows,'identifier rules'); renderPager('id',list.length); }
$('#iSearch').addEventListener('input',()=>applyIdFilters());
const iStatusDD=initFsel('iStatusWrap','iStatusBtn','iStatusPanel','iStatus',[['','All statuses'],...Object.entries(STATUS).map(([k,v])=>[k,v.n])],()=>applyIdFilters());

/* ---------- Configuration Lifecycle ---------- */
const CHECKS={}; // id → {validation:'ok'|'fail', dependency:n, impact:true}
function runValidation(e){ const problems=[];
  if(!e.name) problems.push('Name is missing');
  if(e.type==='lookup'){ if(!e.values.some(v=>v.active)) problems.push('No active value'); if(!e.code||e.code==='—') problems.push('Code is missing'); if(REFERENCES.some(x=>x.id!==e.id&&x.type==='lookup'&&x.code===e.code)) problems.push('Code '+e.code+' is already used'); }
  else { if(!e.prefix) problems.push('Prefix is missing'); if(REFERENCES.some(x=>x.id!==e.id&&x.type==='identifier'&&x.prefix===e.prefix&&x.includeBranchCode===e.includeBranchCode)) problems.push('Prefix '+e.prefix+' is already used'); if(!e.effectiveFrom||e.effectiveFrom==='—') problems.push('Effective from is missing'); }
  return problems;
}
function lcRow(e){
  const c=CHECKS[e.id]||{}; const used=USED_BY[e.name]||[];
  const checks=[c.validation?'<span class="chip '+(c.validation==='ok'?'ok':'bad')+'">Validation '+(c.validation==='ok'?'passed':'failed')+'</span>':'', c.dependency!==undefined?'<span class="chip info">'+c.dependency+' dependent screen'+(c.dependency===1?'':'s')+'</span>':'', c.impact?'<span class="chip mute">Impact previewed</span>':''].filter(Boolean).join(' ')||'<span class="s">Not checked yet</span>';
  const canPublish=(e.status==='draft'||e.status==='future') && c.validation==='ok';
  return `<tr><td><b>${esc(e.name)}</b><span class="s">${esc(TYPES[e.type])} · ${esc(e.context)}</span></td><td>${stchip(e.status)}</td>
    <td class="num">${esc(e.effectiveFrom||'—')}</td><td>${checks}</td>
    <td style="text-align:right;white-space:nowrap"><button class="mini" data-lc="val" data-id="${e.id}">Run validation</button> <button class="mini" data-lc="dep" data-id="${e.id}">Dependency check</button> <button class="mini" data-lc="imp" data-id="${e.id}">Preview impact</button> ${e.status==='draft'||e.status==='future'?'<button class="mini pub" data-lc="pub" data-id="'+e.id+'"'+(canPublish?'':' disabled title="Run validation first"')+'>Publish</button>':''}</td></tr>`;
}
let lcState='';
function applyLcFilters(reset){ if(reset!==false) pages.lc=1;
  const order={draft:0,future:1,active:2,inactive:3};
  const list=REFERENCES.filter(e=>!lcState||e.status===lcState).sort((a,b)=>order[a.status]-order[b.status]||a.name.localeCompare(b.name));
  renderLcList(list);
}
function renderLcList(list){ const rows=slice('lc',list); $('#lBody').innerHTML=rows.map(lcRow).join('')||'<tr><td colspan="5" style="text-align:center;color:var(--ink-muted);padding:22px">No records in this state.</td></tr>'; $('#lFoot').textContent=foot('lc',list,rows,'records'); renderPager('lc',list.length);
  $('#lcCounts').innerHTML=Object.entries(STATUS).map(([k,v])=>'<span class="chip '+(v.cls||'mute')+'">'+v.n+' · '+REFERENCES.filter(e=>e.status===k).length+'</span>').join(' '); }
$('#lcSeg').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; $$('#lcSeg button').forEach(x=>x.classList.toggle('on',x===b)); lcState=b.dataset.v; applyLcFilters(); });
$('#lBody').addEventListener('click',e=>{ const b=e.target.closest('[data-lc]'); if(!b||b.disabled) return; const rec=REFERENCES.find(x=>x.id===b.dataset.id); const c=CHECKS[rec.id]=CHECKS[rec.id]||{};
  if(b.dataset.lc==='val'){ const p=runValidation(rec); c.validation=p.length?'fail':'ok'; toast(p.length?rec.name+': '+p.join('; '):rec.name+' · validation passed'); }
  if(b.dataset.lc==='dep'){ const u=USED_BY[rec.name]||[]; c.dependency=u.length; toast(u.length?rec.name+' is read by: '+u.join('; '):rec.name+' is not used by any screen yet'); }
  if(b.dataset.lc==='imp'){ c.impact=true; showImpact(rec, null, (rec.status==='draft'||rec.status==='future') && c.validation==='ok'); }
  if(b.dataset.lc==='pub'){ const fut=rec.effectiveFrom && new Date(rec.effectiveFrom)>new Date(TODAY); rec.status=fut?'future':'active'; rec.updatedOn=TODAY;
    AUDIT.unshift({date:TODAY,time:'Now',area:rec.type==='lookup'?'Reference Masters':'Identifiers & Numbering',record:rec.name,changeType:fut?'Future Effective Scheduled':'Published',changedBy:'Rajeev Malhotra · Hospital Administrator',branch:rec.context,old:'Draft',new:fut?'Active from '+rec.effectiveFrom:'Active / Published',reason:'Pre-publish checks passed'});
    toast(rec.name+(fut?' scheduled for '+rec.effectiveFrom:' published')); renderStats(); applyFilters(false); applyIdFilters(false); applyAuditFilters(false); }
  applyLcFilters(false);
});


/* ---------- Impact preview · what publishing/changing this record actually touches ---------- */
function impactOf(rec, draft){
  const used=USED_BY[rec.name]||[];
  const rows=[]; let lvl='info';
  if(rec.type==='lookup'){
    const cur=REFERENCES.find(x=>x.id===rec.id); const before=cur?cur.values:[]; const after=(draft&&draft.values)||rec.values||[];
    const added=after.filter(v=>v.active&&!before.some(b=>b.n===v.n)).map(v=>v.n);
    const off=after.filter(v=>!v.active&&before.some(b=>b.n===v.n&&b.active)).map(v=>v.n);
    const removed=before.filter(b=>!after.some(v=>v.n===b.n)).map(v=>v.n);
    if(added.length) rows.push({l:'New values available from now',v:added.join(', ')});
    if(off.length){ rows.push({l:'Values switched off',v:off.join(', ')+' · no longer selectable, still readable on old records'}); lvl='warn'; }
    if(removed.length){ rows.push({l:'Values removed',v:removed.join(', ')+' · old records keep the text'}); lvl='warn'; }
    if(!added.length&&!off.length&&!removed.length) rows.push({l:'Values',v:'No change to the list itself'});
  } else {
    const cur=REFERENCES.find(x=>x.id===rec.id)||{};
    const fmt=e=>[e.includeBranchCode?(BRANCH_CODES[ctxBrDD.value]||'MAIN'):null,e.prefix,String(e.nextSeq||cur.nextSeq||1).padStart(e.numericLength||4,'0')].filter(Boolean).join('-');
    const d=Object.assign({},cur,draft||{});
    if(cur.prefix && (cur.prefix!==d.prefix||cur.numericLength!==d.numericLength||cur.includeBranchCode!==d.includeBranchCode)){ rows.push({l:'Format changes',v:fmt(cur)+' → '+fmt(d)+' · existing numbers are never renumbered'}); lvl='warn'; }
    else rows.push({l:'Format',v:fmt(d)});
    if(cur.resetRule!==d.resetRule && cur.prefix) rows.push({l:'Reset rule changes',v:(RESET_RULES[cur.resetRule]||'Never')+' → '+(RESET_RULES[d.resetRule]||'Never')});
    rows.push({l:'Next number issued',v:String(d.nextSeq||cur.nextSeq||1).padStart(d.numericLength||4,'0')});
  }
  const st=(draft&&draft.status)||rec.status; const curSt=(REFERENCES.find(x=>x.id===rec.id)||{}).status;
  if(curSt&&curSt!==st){ rows.push({l:'State',v:STATUS[curSt].n+' → '+STATUS[st].n+(st==='inactive'?' · no new record can use it; history unchanged':'')}); if(st==='inactive') lvl='warn'; }
  if(st==='future'||(rec.effectiveFrom&&rec.effectiveFrom!=='—'&&new Date(rec.effectiveFrom)>new Date(TODAY))) rows.push({l:'Takes effect',v:rec.effectiveFrom||'on publish'});
  return {used, rows, lvl};
}
function showImpact(rec, draft, allowPublish){
  const im=impactOf(rec,draft); const used=im.used;
  $('#impTitle').textContent=(rec.status==='draft'||(draft&&draft.status==='draft')?'Publish ':'Change ')+(rec.name||'this record')+'?';
  $('#impSub').textContent=TYPES[rec.type]+' · '+(rec.context||'Organization');
  $('#impIco').className='iic '+im.lvl;
  $('#impBody').innerHTML='<p class="dep-intro">'+(used.length?'<b>'+used.length+' screen'+(used.length===1?'':'s')+'</b> read this record. Changes apply to new records only; historical records keep their values.':'No screen reads this record yet, so publishing has no live effect until something uses it.')+'</p>'
    +im.rows.map(r=>'<div class="deprow"><span>'+esc(r.l)+'</span><b style="font-size:12px;text-align:right;max-width:58%">'+esc(r.v)+'</b></div>').join('')
    +(used.length?'<div class="ifoot-hint"><b>Where it is used</b><ul>'+used.map(u=>'<li>'+esc(u)+'</li>').join('')+'</ul></div>':'');
  $('#impPublish').style.display=allowPublish?'':'none'; $('#impPublish').dataset.id=rec.id||'';
  $('#impScrim').classList.add('show');
}
const closeImpact=()=>$('#impScrim').classList.remove('show');
$('#impClose').addEventListener('click',closeImpact); $('#impScrim').addEventListener('click',e=>{ if(e.target.id==='impScrim') closeImpact(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeImpact(); });
$('#impPublish').addEventListener('click',()=>{ const id=$('#impPublish').dataset.id; closeImpact(); const b=$('#lBody [data-lc="pub"][data-id="'+id+'"]'); if(b&&!b.disabled) b.click(); else toast('Run validation first, then publish'); });

/* ---------- Audit History (read-only) ---------- */
function changeChip(t){ return `<span class="chip ${CHANGE_CHIP[t]||'mute'}">${esc(t)}</span>`; }
function renderAuditRow(a){
  return `<tr><td><b>${esc(a.date)}</b><span class="s">${esc(a.time||'—')}</span></td><td>${esc(a.area)}</td><td><b>${esc(a.record)}</b></td><td>${changeChip(a.changeType)}</td>
    <td>${esc(a.changedBy)}</td><td>${esc(a.branch)}</td><td><span class="s">${esc(a.old)}</span></td><td><b>${esc(a.new)}</b></td><td><span class="s">${a.reason&&a.reason!=='—'?esc(a.reason):'—'}</span></td></tr>`;
}
function renderAuditTable(list){ const rows=slice('audit',list); $('#aEmpty').style.display=list.length?'none':'block'; $('#aBody').innerHTML=rows.map(renderAuditRow).join(''); $('#aFoot').textContent=foot('audit',list,rows,'changes'); renderPager('audit',list.length); }
function distinct(arr,key){ return [...new Set(arr.map(a=>a[key]))]; }
let auditDateDD, auditUserDD, auditBranchDD, auditAreaDD, auditTypeDD;
function applyAuditFilters(reset){ if(reset!==false) pages.audit=1;
  const q=$('#aRecord').value.trim().toLowerCase(), dateSel=auditDateDD.get(), user=auditUserDD.get(), branch=auditBranchDD.get(), area=auditAreaDD.get(), type=auditTypeDD.get(); const todayD=new Date(TODAY);
  renderAuditTable(AUDIT.filter(a=>{ if(q&&!a.record.toLowerCase().includes(q)) return false; if(user&&a.changedBy!==user) return false; if(branch&&a.branch!==branch) return false; if(area&&a.area!==area) return false; if(type&&a.changeType!==type) return false;
    if(dateSel){ const days={today:0,d7:7,d30:30}[dateSel]; const diff=Math.floor((todayD-new Date(a.date))/86400000); if(diff<0||diff>days) return false; } return true; }));
}
function initAuditFilters(){
  auditDateDD=initFsel('aDateWrap','aDateBtn','aDatePanel','aDate',[['','All dates'],['today','Today'],['d7','Last 7 days'],['d30','Last 30 days']],()=>applyAuditFilters());
  auditUserDD=initFsel('aUserWrap','aUserBtn','aUserPanel','aUser',[['','All users'],...distinct(AUDIT,'changedBy').map(u=>[u,u])],()=>applyAuditFilters());
  auditBranchDD=initFsel('aBranchWrap','aBranchBtn','aBranchPanel','aBranch',[['','All branches'],...distinct(AUDIT,'branch').map(b=>[b,b])],()=>applyAuditFilters());
  auditAreaDD=initFsel('aAreaWrap','aAreaBtn','aAreaPanel','aArea',[['','All areas'],...distinct(AUDIT,'area').map(a=>[a,a])],()=>applyAuditFilters());
  auditTypeDD=initFsel('aTypeWrap','aTypeBtn','aTypePanel','aType',[['','All change types'],...distinct(AUDIT,'changeType').map(t=>[t,t])],()=>applyAuditFilters());
  $('#aRecord').addEventListener('input',()=>applyAuditFilters());
}
const RENDER={ref:renderList,id:renderIdList,lc:renderLcList,audit:renderAuditTable};

/* ---------- tabs ---------- */
const TAB_SUB={ref:'Shared dropdown values every screen reads: reasons, categories and types',id:'How every in-scope identifier is numbered',lc:'Draft, publish, future-effective and retire configuration with checks first',audit:'Read-only history of every configuration change'};
function showTab(tab){
  activeTab=tab; $$('#tabSeg button').forEach(x=>x.classList.toggle('on',x.dataset.t===tab));
  ['ref','id','lc','audit'].forEach(k=>{ $('#'+k+'View').style.display=k===tab?'':'none'; }); $$('.note[data-tab]').forEach(n=>n.style.display=n.dataset.tab===tab?'':'none');
  $('#refPills').style.display=(tab==='audit')?'none':''; $('#newBtn').style.display=(tab==='ref'||tab==='id')?'':'none'; $('#newBtnTxt').textContent=tab==='id'?'Add identifier rule':'Add reference master';
  $('#hSub').textContent=TAB_SUB[tab]; renderStats();
  const HASH={ref:'#ref',id:'#ids',lc:'#lifecycle',audit:'#audit'}; $$('.nav a[href^="reference-audit.html"]').forEach(x=>x.classList.toggle('on', x.getAttribute('href').endsWith(HASH[tab]))); if(location.hash!==HASH[tab]) history.replaceState(null,'',HASH[tab]);
  if(tab==='lc') applyLcFilters(false);
}
$('#tabSeg').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; showTab(b.dataset.t); });

/* ---------- drawer ---------- */
let editingId=null;
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId,v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on',b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b?b.dataset.v:null; }
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
function formatDateDisplay(iso){ if(!iso) return '—'; const [y,m,d]=iso.split('-'); return String(+d).padStart(2,'0')+' '+MONTHS[+m-1]+' '+y; }
function toISODate(disp){ if(!disp||disp==='—') return ''; const [d,mo,y]=disp.split(' '); const m=MONTHS.indexOf(mo); return m<0?'':y+'-'+String(m+1).padStart(2,'0')+'-'+String(+d).padStart(2,'0'); }
const dCtxDD=initFsel('dCtxWrap','dCtxBtn','dCtxPanel','dCtx',CONTEXTS.map(c=>[c,c]));
const dInhDD=initFsel('dInhWrap','dInhBtn','dInhPanel','dInh',Object.entries(INHERIT));
const dIdTypeDD=initFsel('dIdTypeWrap','dIdTypeBtn','dIdTypePanel','dIdType',ID_TYPES.map(t=>[t,t]));
/* values editor · each value has Name + Status (doc: Name, Code, Status, Display Order per value; code and order come from the row position) */
function renderValues(vals){ $('#dValues').innerHTML=vals.map((v,i)=>'<div class="valrow" data-i="'+i+'"><span class="valno">'+(i+1)+'</span><input class="fld" value="'+esc(v.n)+'" placeholder="Value name"><label class="sw" title="Active"><input type="checkbox" '+(v.active?'checked':'')+'><i></i></label><button type="button" class="iconb del" data-rmval="'+i+'" title="Remove"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>').join('')||'<p class="hint">No values yet. Add the first one below.</p>'; }
function readValues(){ return $$('#dValues .valrow').map(r=>({n:$('input.fld',r).value.trim(), active:$('input[type=checkbox]',r).checked})).filter(v=>v.n); }
$('#dAddValue').addEventListener('click',()=>{ const v=readValues(); v.push({n:'',active:true}); renderValues(v); const last=$$('#dValues .valrow input.fld').pop(); if(last) last.focus(); });
$('#dValues').addEventListener('click',e=>{ const b=e.target.closest('[data-rmval]'); if(!b) return; const v=readValues(); v.splice(+b.dataset.rmval,1); renderValues(v); });
function updateTypeGroups(t){ const isLookup=t==='lookup'; $('#lookupOnlyGroup').style.display=isLookup?'':'none'; $('#identifierOnlyGroup').style.display=isLookup?'none':''; $('#dNameGrp').style.display=isLookup?'':'none'; $('#dTypeTxt').textContent=TYPES[t]; if(!isLookup) recomputeIdPreview(); }
function recomputeIdPreview(){
  const prefix=($('#dPrefix').value.trim()||'XXX').toUpperCase(), branchOn=$('#dInclBranch').checked, numLen=Math.max(1,parseInt($('#dNumLen').value,10)||4), reset=segGet('dResetSeg')||'never';
  const seq=(editingId&&REFERENCES.find(x=>x.id===editingId)?.nextSeq)||1; const parts=[]; if(branchOn) parts.push(BRANCH_CODES[ctxBrDD.value]||'MAIN'); parts.push(prefix); parts.push(String(seq).padStart(numLen,'0'));
  $('#dFormatPreview').value=parts.join('-'); $('#dNextNumPreview').value=String(seq).padStart(numLen,'0');
  $('#dPreviewHint').textContent='Preview uses the branch selected at the top ('+(ctxBrDD.value||'Main Campus')+'). Counter resets: '+(RESET_RULES[reset]||'Never')+'.';
}
['dPrefix','dNumLen'].forEach(id=>$('#'+id).addEventListener('input',recomputeIdPreview)); $('#dInclBranch').addEventListener('change',recomputeIdPreview);
$$('#dStatusSeg,#dResetSeg').forEach(seg=>seg.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; segSet(seg.id,b.dataset.v); if(seg.id==='dResetSeg') recomputeIdPreview(); }));
const ICO_INFO='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
const ICO_WARN='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
function showCheckResult(cls,html){ const el=$('#dCheckResult'); el.className='note '+cls; el.innerHTML=html; el.style.display='flex'; }
function draftRecord(){ const t=activeTab==='id'?'identifier':'lookup'; const name=t==='lookup'?$('#dName').value.trim():dIdTypeDD.get();
  return t==='lookup' ? {id:editingId,type:t,name,code:$('#dCode').value.trim(),values:readValues()} : {id:editingId,type:t,name,prefix:($('#dPrefix').value.trim()||'').toUpperCase(),includeBranchCode:$('#dInclBranch').checked,effectiveFrom:formatDateDisplay($('#dEffFrom').value)}; }
$('#dRunValidation').addEventListener('click',()=>{ const r=draftRecord(); const p=runValidation(r); showCheckResult(p.length?'warn':'info',(p.length?ICO_WARN:ICO_INFO)+'<span><b>'+(p.length?'Validation failed:':'Validation passed:')+'</b> '+(p.length?esc(p.join('; ')):esc(r.name||'This record')+' has a name, a unique code or prefix and at least one active value.')+'</span>'); });
$('#dRunDependency').addEventListener('click',()=>{ const r=draftRecord(); const u=USED_BY[r.name]||[]; showCheckResult(u.length?'warn':'info',(u.length?ICO_WARN:ICO_INFO)+'<span><b>Dependency check:</b> '+(u.length?esc(r.name)+' is read by '+u.length+' screen'+(u.length===1?'':'s')+': '+esc(u.join('; ')):'no screen reads '+esc(r.name||'this record')+' yet.')+'</span>'); });
$('#dRunImpact').addEventListener('click',()=>{ const r=draftRecord(); r.status=segGet('dStatusSeg'); const cur=editingId?REFERENCES.find(x=>x.id===editingId):null; showImpact(Object.assign({},cur||{},r), r, false); });
function renderChangeHistory(name){ const items=AUDIT.filter(a=>a.record===name); const wrap=$('#dHistoryWrap'); if(!items.length){ wrap.style.display='none'; return; } wrap.style.display='block';
  $('#dHistory').innerHTML='<div class="tl">'+items.map(a=>`<div class="tlitem"><div class="tldate">${esc(a.date)}${a.time?' · '+esc(a.time):''} · ${esc(a.changedBy)}</div><div class="tltitle">${esc(a.changeType)} · ${esc(a.area)}</div><div class="tlmeta">${esc(a.old)} → <b>${esc(a.new)}</b>${a.reason&&a.reason!=='—'?' · '+esc(a.reason):''}</div></div>`).join('')+'</div>'; }
function resetDrawer(){ $('#dName').value=''; $('#dIdDetail').value=''; $('#dCode').value=''; $('#dOrder').value=''; $('#dPrefix').value=''; $('#dNumLen').value='4'; $('#dInclBranch').checked=true; $('#dEffFrom').value=''; segSet('dStatusSeg','draft'); segSet('dResetSeg','never'); dCtxDD.set('Organization'); dInhDD.set('org'); renderValues([]); $('#dMetaWrap').style.display='none'; $('#dHistoryWrap').style.display='none'; $('#dCheckResult').style.display='none'; }
$('#newBtn').addEventListener('click',()=>{ editingId=null; const t=activeTab==='id'?'identifier':'lookup'; resetDrawer(); $('#dTitle').textContent=t==='lookup'?'Add reference master':'Add identifier rule'; $('#dSub').textContent=t==='lookup'?'A shared dropdown list other screens read':'Numbering format for one in-scope identifier';
  if(t==='identifier'){ const free=ID_TYPES.filter(n=>!REFERENCES.some(r=>r.name===n)); dIdTypeDD.setOptions((free.length?free:ID_TYPES).map(x=>[x,x])); }
  updateTypeGroups(t); openDrawer(); });
function openEdit(id){ const item=REFERENCES.find(x=>x.id===id); if(!item) return; editingId=item.id; resetDrawer();
  $('#dTitle').textContent=item.type==='lookup'?'Edit reference master':'Edit identifier rule'; $('#dSub').textContent=item.name; segSet('dStatusSeg',item.status);
  if(item.type==='lookup'){ $('#dName').value=item.name; $('#dCode').value=item.code||''; $('#dOrder').value=item.displayOrder||''; renderValues(item.values); dCtxDD.set(item.context); dInhDD.set(item.inherit); }
  else { dIdTypeDD.setOptions(ID_TYPES.map(x=>[x,x]),item.name); $('#dPrefix').value=item.prefix||''; $('#dNumLen').value=item.numericLength||4; $('#dInclBranch').checked=!!item.includeBranchCode; segSet('dResetSeg',item.resetRule||'never'); $('#dEffFrom').value=toISODate(item.effectiveFrom); $('#dIdDetail').value=item.detail||''; }
  updateTypeGroups(item.type); $('#dMeta').textContent='Last updated '+item.updatedOn; $('#dMetaWrap').style.display='block'; renderChangeHistory(item.name); openDrawer(); }
$('#rBody').addEventListener('click',e=>{ const b=e.target.closest('[data-edit]'); if(b) openEdit(b.dataset.edit); });
$('#iBody').addEventListener('click',e=>{ const b=e.target.closest('[data-edit]'); if(b) openEdit(b.dataset.edit); });
$('#dClose').addEventListener('click',closeDrawer); $('#dCancel').addEventListener('click',closeDrawer); $('#scrim').addEventListener('click',closeDrawer);
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&$('#drawer').classList.contains('show')) closeDrawer(); });
$('#dSave').addEventListener('click',()=>{
  const type=activeTab==='id'?'identifier':'lookup'; const status=segGet('dStatusSeg'); let payload;
  if(type==='lookup'){ const name=$('#dName').value.trim(); if(!name){ toast('Give the master a name'); return; } const values=readValues(); if(!values.length){ toast('Add at least one value'); return; }
    payload={name,type,status,code:$('#dCode').value.trim().toUpperCase()||name.split(/\s+/).map(w=>w.slice(0,3).toUpperCase()).join('-'),displayOrder:parseInt($('#dOrder').value,10)||0,values,context:dCtxDD.get()||'Organization',inherit:dInhDD.get()||'org',updatedOn:TODAY}; payload.detail=values.filter(v=>v.active).map(v=>v.n).join(', ');
  } else { const name=dIdTypeDD.get(); const numLen=Math.max(1,parseInt($('#dNumLen').value,10)||4); const prefix=($('#dPrefix').value.trim()||'').toUpperCase(); if(!prefix){ toast('Add a prefix'); return; } const existing=editingId?REFERENCES.find(x=>x.id===editingId):null;
    payload={name,type,status,code:(existing&&existing.code)||(prefix+'-NUM'),prefix,includeBranchCode:$('#dInclBranch').checked,numericLength:numLen,resetRule:segGet('dResetSeg'),effectiveFrom:formatDateDisplay($('#dEffFrom').value),detail:$('#dIdDetail').value.trim()||'—',nextSeq:(existing&&existing.nextSeq)||1,context:(existing&&existing.context)||'Organization',inherit:(existing&&existing.inherit)||'org',displayOrder:(existing&&existing.displayOrder)||300,updatedOn:TODAY}; }
  if(status==='active'){ const p=runValidation(Object.assign({id:editingId},payload)); if(p.length){ toast('Cannot publish: '+p.join('; ')); return; } }
  if(editingId){ const old=REFERENCES.find(x=>x.id===editingId); const changed=old.status!==status; Object.assign(old,payload); AUDIT.unshift({date:TODAY,time:'Now',area:type==='lookup'?'Reference Masters':'Identifiers & Numbering',record:payload.name,changeType:changed?'Status Changed':'Updated',changedBy:'Rajeev Malhotra · Hospital Administrator',branch:payload.context,old:changed?STATUS[old.status===status?old.status:old.status].n:'Previous values',new:changed?STATUS[status].n:payload.detail,reason:'—'}); toast('Saved'); }
  else { REFERENCES.push(Object.assign({id:'rf-'+Date.now()},payload)); AUDIT.unshift({date:TODAY,time:'Now',area:type==='lookup'?'Reference Masters':'Identifiers & Numbering',record:payload.name,changeType:status==='draft'?'Saved as Draft':'Created',changedBy:'Rajeev Malhotra · Hospital Administrator',branch:payload.context,old:'—',new:payload.detail,reason:'—'}); toast(status==='draft'?'Saved as draft':'Added'); }
  closeDrawer(); renderStats(); applyFilters(false); applyIdFilters(false); initAuditOptions(); applyAuditFilters(false);
});
function initAuditOptions(){ auditUserDD.setOptions([['','All users'],...distinct(AUDIT,'changedBy').map(u=>[u,u])]); auditAreaDD.setOptions([['','All areas'],...distinct(AUDIT,'area').map(a=>[a,a])]); auditTypeDD.setOptions([['','All change types'],...distinct(AUDIT,'changeType').map(t=>[t,t])]); }

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
/* boot */
renderStats(); applyFilters(); applyIdFilters(); initAuditFilters(); applyAuditFilters(); applyLcFilters();
showTab(location.hash==='#audit'?'audit':location.hash==='#ids'?'id':location.hash==='#lifecycle'?'lc':'ref');
window.addEventListener('hashchange',()=>{ const m={'#ref':'ref','#ids':'id','#lifecycle':'lc','#audit':'audit'}; if(m[location.hash]) showTab(m[location.hash]); });
