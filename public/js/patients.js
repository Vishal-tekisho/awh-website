document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';
const initials = name => name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();

const LOCK_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lockic"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
const EYE_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';

/* ---------- shared consent catalogue (matches patient-fields.html CONSENTS) ---------- */
const CONSENT_TYPES = [
 {id:'treatment', name:'Treatment &amp; Procedure Consent', validity:'Per treatment plan'},
 {id:'photo-consent', name:'Clinical Photography / Progress Media Consent', validity:'Until withdrawn'},
 {id:'wa-sms', name:'WhatsApp / SMS Communication Consent', validity:'Until withdrawn'},
 {id:'referral-share', name:'Data Sharing with Referring Doctor / Facility', validity:'1 year'},
 {id:'marketing', name:'Marketing &amp; Promotional Communication', validity:'Until withdrawn'},
 {id:'insurance-share', name:'Insurance / Third-Party Claim Data Sharing', validity:'Per claim'}
];

/* ---------- patients data ---------- */
const PATIENTS = [
 {id:'p1', name:'Ramesh Chandra Reddy', mrn:'AWH-2024-0142', dob:'14 Mar 1965', age:61, gender:'Male',
  mobile:'+91 98480 55621', email:'ramesh.reddy65@gmail.com', altContact:'+91 90000 11234 (Son)',
  currAddr:'Flat 302, Sri Sai Residency, Kukatpally, Hyderabad', permAddr:'Same as current address',
  caretaker:'Kiran Reddy (Son) · +91 90000 11234', emergency:'Kiran Reddy · +91 90000 11234',
  abha:'14-1234-5678-9012', legacyId:'', aadhaarFull:'582177883390', panFull:'BXXPR4821F', photoOnFile:true,
  branch:'Banjara Hills', registeredOn:'12 Jun 2024', lastVisit:'12 Aug 2026', nextAppt:'26 Aug 2026 · Dressing change',
  allergies:[{name:'Penicillin', reaction:'Skin rash &amp; swelling', severity:'High', notedOn:'12 Jun 2024'}],
  consents:{ treatment:{status:'granted',on:'12 Jun 2024',by:'Self'}, 'photo-consent':{status:'granted',on:'12 Jun 2024',by:'Self'},
    'wa-sms':{status:'granted',on:'12 Jun 2024',by:'Self'}, 'referral-share':{status:'withdrawn',on:'03 Feb 2025',by:'Self'},
    marketing:{status:'granted',on:'12 Jun 2024',by:'Self'} },
  timeline:[
   {date:'12 Aug 2026', type:'Treatment', title:'Dressing change · Diabetic foot ulcer, right heel', author:'Nurse Anitha K.', summary:'Wound bed clean, granulation improving. Photo captured under active consent.'},
   {date:'05 Aug 2026', type:'Lab', title:'HbA1c &amp; Random Blood Sugar', author:'Lab · City Diagnostics', summary:'HbA1c 8.2% (elevated) · flagged for review.'},
   {date:'29 Jul 2026', type:'Consultation', title:'Follow-up consultation', author:'Dr. KVNN Santosh Murthy', summary:'Reviewed wound progress, adjusted dressing frequency to twice weekly.'},
   {date:'15 Jul 2026', type:'Treatment', title:'Wound debridement, right heel', author:'Dr. KVNN Santosh Murthy', summary:'Mild infection found; debrided and started on antibiotics.'},
   {date:'12 Jun 2024', type:'Registration', title:'Patient registered', author:'Priya Nair · Front Desk Lead', summary:'Registered with referral from Care Hospitals; diabetic foot ulcer diagnosed.'}
  ],
  consultations:[
   {date:'29 Jul 2026', doctor:'Dr. KVNN Santosh Murthy', complaint:'Follow-up · wound review', diagnosis:'Diabetic foot ulcer, healing, right heel', status:'signed'},
   {date:'15 Jul 2026', doctor:'Dr. KVNN Santosh Murthy', complaint:'Increased discharge from wound', diagnosis:'Diabetic foot ulcer with mild infection', status:'signed'}
  ],
  vitals:[
   {date:'12 Aug 2026', bp:'138/86', pulse:'78', temp:'98.4°F', spo2:'97%', weight:'74 kg', by:'Nurse Anitha K.'},
   {date:'29 Jul 2026', bp:'142/90', pulse:'82', temp:'98.6°F', spo2:'96%', weight:'75 kg', by:'Nurse Anitha K.'}
  ],
  problems:[
   {name:'Diabetic foot ulcer · right heel', status:'active', notedOn:'12 Jun 2024', notedBy:'Dr. KVNN Santosh Murthy'},
   {name:'Type 2 Diabetes Mellitus', status:'active', notedOn:'12 Jun 2024', notedBy:'Dr. KVNN Santosh Murthy'},
   {name:'Hypertension', status:'active', notedOn:'03 Feb 2025', notedBy:'Dr. Hrishikesh Korada'}
  ],
  meds:[
   {name:'Metformin 500mg', freq:'Twice daily, after food', prescribedBy:'Dr. KVNN Santosh Murthy', since:'12 Jun 2024', status:'active'},
   {name:'Amoxicillin-Clavulanate 625mg', freq:'Twice daily × 7 days', prescribedBy:'Dr. KVNN Santosh Murthy', since:'15 Jul 2026', status:'stopped'},
   {name:'Telmisartan 40mg', freq:'Once daily, morning', prescribedBy:'Dr. Hrishikesh Korada', since:'03 Feb 2025', status:'active'}
  ],
  labs:[
   {test:'HbA1c', date:'05 Aug 2026', result:'8.2 %', flag:'abnormal'},
   {test:'Random Blood Sugar', date:'05 Aug 2026', result:'196 mg/dL', flag:'abnormal'},
   {test:'Wound Swab Culture', date:'15 Jul 2026', result:'Staph aureus · sensitive to Amoxiclav', flag:'critical'}
  ],
  orders:[
   {type:'Procedure order', desc:'Wound debridement, right heel', status:'completed', date:'15 Jul 2026'},
   {type:'Care plan', desc:'Diabetic foot ulcer management · twice-weekly dressing, monthly HbA1c', status:'active', date:'12 Jun 2024'}
  ],
  treatments:[
   {name:'Wound debridement', date:'15 Jul 2026', doctor:'Dr. KVNN Santosh Murthy', room:'Procedure Room 1', status:'completed'},
   {name:'Dressing change', date:'12 Aug 2026', doctor:'Nurse Anitha K.', room:'Dressing Room 2', status:'completed'}
  ],
  docs:[
   {name:'Referral letter · Care Hospitals.pdf', type:'Referral', uploadedOn:'12 Jun 2024', by:'Priya Nair', external:true},
   {name:'HbA1c Lab Report · 05 Aug 2026.pdf', type:'Lab report', uploadedOn:'05 Aug 2026', by:'System', external:false}
  ],
  progress:[
   {session:'Session 9', date:'12 Aug 2026', note:'Wound area reduced ~30% from baseline; granulation tissue healthy.', consentLinked:true},
   {session:'Session 6', date:'15 Jul 2026', note:'Mild infection noted, photo taken before debridement.', consentLinked:true}
  ],
  followup:{next:'26 Aug 2026 · Dressing change', notes:'Continue twice-weekly dressing; repeat HbA1c in 4 weeks; review antibiotic response at next visit.'}
 },

 {id:'p2', name:'Sunitha Rajagopal', mrn:'AWH-2025-0387', dob:'22 Jul 1978', age:48, gender:'Female',
  mobile:'+91 99080 44215', email:'sunitha.raj78@yahoo.com', altContact:'',
  currAddr:'12-4-88, Sainikpuri, Secunderabad', permAddr:'Same as current address',
  caretaker:'', emergency:'+91 99080 44215 (Self)',
  abha:'', legacyId:'', aadhaarFull:'774411223344', panFull:'CXXPS9012K', photoOnFile:false,
  branch:'Banjara Hills', registeredOn:'02 Mar 2025', lastVisit:'08 Aug 2026', nextAppt:'20 Aug 2026 · Suture review',
  allergies:[],
  consents:{ treatment:{status:'granted',on:'02 Mar 2025',by:'Self'}, 'photo-consent':{status:'granted',on:'02 Mar 2025',by:'Self'}, 'wa-sms':{status:'granted',on:'02 Mar 2025',by:'Self'} },
  timeline:[
   {date:'08 Aug 2026', type:'Treatment', title:'Post-surgical wound dressing', author:'Nurse Anitha K.', summary:'Sutures intact, no signs of infection.'},
   {date:'02 Mar 2025', type:'Registration', title:'Patient registered', author:'Priya Nair · Front Desk Lead', summary:'Post-surgical wound care referred from City General Hospital.'}
  ],
  consultations:[{date:'02 Mar 2025', doctor:'Dr. Hrishikesh Korada', complaint:'Post-surgical wound review', diagnosis:'Post-surgical abdominal wound, healing well', status:'signed'}],
  vitals:[{date:'08 Aug 2026', bp:'118/76', pulse:'72', temp:'98.2°F', spo2:'98%', weight:'61 kg', by:'Nurse Anitha K.'}],
  problems:[{name:'Post-surgical wound · abdomen', status:'active', notedOn:'02 Mar 2025', notedBy:'Dr. Hrishikesh Korada'}],
  meds:[{name:'Cefixime 200mg', freq:'Twice daily × 5 days', prescribedBy:'Dr. Hrishikesh Korada', since:'02 Mar 2025', status:'stopped'}],
  labs:[], orders:[{type:'Care plan', desc:'Post-surgical wound care · weekly dressing till closure', status:'active', date:'02 Mar 2025'}],
  treatments:[{name:'Wound dressing', date:'08 Aug 2026', doctor:'Nurse Anitha K.', room:'Dressing Room 1', status:'completed'}],
  docs:[{name:'Discharge summary · City General Hospital.pdf', type:'Referral', uploadedOn:'02 Mar 2025', by:'Priya Nair', external:true}],
  progress:[{session:'Session 4', date:'08 Aug 2026', note:'Wound edges well-approximated, minimal scarring.', consentLinked:true}],
  followup:{next:'20 Aug 2026 · Suture review', notes:'Assess for suture removal at next visit.'}
 },

 {id:'p3', name:'Mohammed Aslam Sheikh', mrn:'AWH-2023-0089', dob:'05 Jan 1952', age:74, gender:'Male',
  mobile:'+91 96181 22987', email:'', altContact:'+91 88888 76543 (Daughter)',
  currAddr:'Plot 45, Toli Chowki, Hyderabad', permAddr:'Same as current address',
  caretaker:'Ayesha Sheikh (Daughter) · +91 88888 76543', emergency:'Ayesha Sheikh · +91 88888 76543',
  abha:'', legacyId:'', aadhaarFull:'661122334455', panFull:'', photoOnFile:true,
  branch:'Banjara Hills', registeredOn:'20 Sep 2023', lastVisit:'10 Aug 2026', nextAppt:'17 Aug 2026 · Dressing change',
  allergies:[{name:'Sulfa drugs', reaction:'Hives', severity:'Moderate', notedOn:'20 Sep 2023'}],
  consents:{ treatment:{status:'granted',on:'20 Sep 2023',by:'Ayesha Sheikh (Daughter)'}, 'photo-consent':{status:'granted',on:'20 Sep 2023',by:'Ayesha Sheikh (Daughter)'}, 'wa-sms':{status:'granted',on:'20 Sep 2023',by:'Ayesha Sheikh (Daughter)'} },
  timeline:[
   {date:'10 Aug 2026', type:'Treatment', title:'Pressure ulcer dressing · sacral region', author:'Nurse Anitha K.', summary:'Stage 2 pressure ulcer, stable; caretaker counselled on repositioning.'},
   {date:'22 Jul 2026', type:'Consultation', title:'Routine review', author:'Dr. KVNN Santosh Murthy', summary:'Advised air mattress and 2-hourly repositioning schedule.'},
   {date:'20 Sep 2023', type:'Registration', title:'Patient registered', author:'Priya Nair · Front Desk Lead', summary:'Bedridden patient, pressure ulcer care, registered by daughter/caretaker.'}
  ],
  consultations:[{date:'22 Jul 2026', doctor:'Dr. KVNN Santosh Murthy', complaint:'Routine pressure ulcer review', diagnosis:'Pressure ulcer, sacral region, Stage 2', status:'signed'}],
  vitals:[{date:'10 Aug 2026', bp:'128/80', pulse:'74', temp:'98.5°F', spo2:'95%', weight:'58 kg', by:'Nurse Anitha K.'}],
  problems:[{name:'Pressure ulcer · sacral region, Stage 2', status:'active', notedOn:'20 Sep 2023', notedBy:'Dr. KVNN Santosh Murthy'},
            {name:'Immobility · bedridden', status:'active', notedOn:'20 Sep 2023', notedBy:'Dr. KVNN Santosh Murthy'}],
  meds:[{name:'Paracetamol 500mg', freq:'As needed for pain', prescribedBy:'Dr. KVNN Santosh Murthy', since:'20 Sep 2023', status:'active'}],
  labs:[{test:'Complete Blood Count', date:'22 Jul 2026', result:'Within normal limits', flag:'normal'}],
  orders:[{type:'Care plan', desc:'Pressure ulcer management · repositioning schedule, air mattress', status:'active', date:'20 Sep 2023'}],
  treatments:[{name:'Pressure ulcer dressing', date:'10 Aug 2026', doctor:'Nurse Anitha K.', room:'Home visit', status:'completed'}],
  docs:[],
  progress:[{session:'Session 14', date:'10 Aug 2026', note:'Wound bed stable, no further tissue breakdown observed.', consentLinked:true}],
  followup:{next:'17 Aug 2026 · Dressing change', notes:'Caretaker to continue 2-hourly repositioning; review skin integrity weekly.'}
 },

 {id:'p4', name:'Lakshmi Priya Iyer', mrn:'AWH-2025-0410', dob:'30 Nov 1990', age:35, gender:'Female',
  mobile:'+91 91778 90234', email:'lakshmipriya.iyer@gmail.com', altContact:'',
  currAddr:'Flat 12B, Green Meadows, Miyapur, Hyderabad', permAddr:'Chennai, Tamil Nadu (parental home)',
  caretaker:'', emergency:'+91 91778 90234 (Self)',
  abha:'14-9988-7766-5544', legacyId:'', aadhaarFull:'', panFull:'', photoOnFile:false,
  branch:'Banjara Hills', registeredOn:'19 Aug 2026', lastVisit:'19 Aug 2026', nextAppt:'26 Aug 2026 · First dressing review',
  allergies:[],
  consents:{ treatment:{status:'granted',on:'19 Aug 2026',by:'Self'} },
  timeline:[{date:'19 Aug 2026', type:'Registration', title:'Patient registered', author:'Priya Nair · Front Desk Lead', summary:'Venous ulcer, left ankle, self-referred walk-in.'}],
  consultations:[{date:'19 Aug 2026', doctor:'Dr. Hrishikesh Korada', complaint:'Non-healing ulcer, left ankle, 3 weeks', diagnosis:'Venous ulcer, left ankle · under evaluation', status:'draft'}],
  vitals:[{date:'19 Aug 2026', bp:'122/78', pulse:'80', temp:'98.6°F', spo2:'99%', weight:'64 kg', by:'Nurse Anitha K.'}],
  problems:[{name:'Venous ulcer · left ankle', status:'active', notedOn:'19 Aug 2026', notedBy:'Dr. Hrishikesh Korada'}],
  meds:[], labs:[], orders:[], treatments:[], docs:[], progress:[],
  followup:{next:'26 Aug 2026 · First dressing review', notes:'Photography and communication consent still to be captured at next visit.'}
 },

 {id:'p5', name:'Krishnappa Venkataramana', mrn:'AWH-2022-0021', dob:'18 Aug 1958', age:68, gender:'Male',
  mobile:'+91 94407 12233', email:'', altContact:'+91 93000 55667 (Wife)',
  currAddr:'H.No. 8-3-227, Yousufguda, Hyderabad', permAddr:'Same as current address',
  caretaker:'Padma Venkataramana (Wife) · +91 93000 55667', emergency:'Padma Venkataramana · +91 93000 55667',
  abha:'', legacyId:'OLD-KVNN-00219', aadhaarFull:'331144556677', panFull:'DXXPV3345L', photoOnFile:true,
  branch:'Banjara Hills', registeredOn:'04 Feb 2022', lastVisit:'14 Aug 2026', nextAppt:'28 Aug 2026 · Dressing + HbA1c review',
  allergies:[{name:'Latex', reaction:'Contact dermatitis', severity:'Moderate', notedOn:'04 Feb 2022'}],
  consents:{ treatment:{status:'granted',on:'04 Feb 2022',by:'Self'}, 'photo-consent':{status:'granted',on:'04 Feb 2022',by:'Self'},
    'wa-sms':{status:'granted',on:'04 Feb 2022',by:'Self'}, 'referral-share':{status:'granted',on:'04 Feb 2022',by:'Self'},
    marketing:{status:'withdrawn',on:'11 Nov 2024',by:'Self'}, 'insurance-share':{status:'granted',on:'15 Jun 2025',by:'Self'} },
  timeline:[
   {date:'14 Aug 2026', type:'Treatment', title:'Dressing change · Diabetic ulcer, left foot', author:'Nurse Anitha K.', summary:'Ulcer size stable; patient counselled on foot care.'},
   {date:'02 Aug 2026', type:'Lab', title:'HbA1c &amp; Lipid Profile', author:'Lab · City Diagnostics', summary:'HbA1c 7.1% · improved from last quarter.'},
   {date:'20 Jul 2026', type:'Consultation', title:'Quarterly diabetes + wound review', author:'Dr. KVNN Santosh Murthy', summary:'Overall improvement; continue current medication and dressing plan.'},
   {date:'04 Feb 2022', type:'Registration', title:'Patient registered', author:'Priya Nair · Front Desk Lead', summary:'Migrated from legacy system; long-standing diabetic patient.'}
  ],
  consultations:[
   {date:'20 Jul 2026', doctor:'Dr. KVNN Santosh Murthy', complaint:'Quarterly diabetes + wound review', diagnosis:'Diabetic foot ulcer, left foot · improving; T2DM stable', status:'signed'},
   {date:'12 Apr 2026', doctor:'Dr. KVNN Santosh Murthy', complaint:'Quarterly review', diagnosis:'Diabetic foot ulcer, left foot · stable', status:'signed'}
  ],
  vitals:[
   {date:'14 Aug 2026', bp:'132/84', pulse:'76', temp:'98.3°F', spo2:'96%', weight:'79 kg', by:'Nurse Anitha K.'},
   {date:'20 Jul 2026', bp:'136/88', pulse:'80', temp:'98.4°F', spo2:'96%', weight:'80 kg', by:'Nurse Anitha K.'}
  ],
  problems:[
   {name:'Diabetic foot ulcer · left foot', status:'active', notedOn:'04 Feb 2022', notedBy:'Dr. KVNN Santosh Murthy'},
   {name:'Type 2 Diabetes Mellitus', status:'active', notedOn:'04 Feb 2022', notedBy:'Dr. KVNN Santosh Murthy'},
   {name:'Hyperlipidemia', status:'active', notedOn:'12 Apr 2026', notedBy:'Dr. KVNN Santosh Murthy'}
  ],
  meds:[
   {name:'Metformin 1000mg', freq:'Twice daily, after food', prescribedBy:'Dr. KVNN Santosh Murthy', since:'04 Feb 2022', status:'active'},
   {name:'Atorvastatin 20mg', freq:'Once daily, night', prescribedBy:'Dr. KVNN Santosh Murthy', since:'12 Apr 2026', status:'active'}
  ],
  labs:[
   {test:'HbA1c', date:'02 Aug 2026', result:'7.1 %', flag:'normal'},
   {test:'Lipid Profile', date:'02 Aug 2026', result:'LDL 118 mg/dL', flag:'abnormal'}
  ],
  orders:[{type:'Care plan', desc:'Diabetic foot ulcer management · weekly dressing, quarterly HbA1c', status:'active', date:'04 Feb 2022'}],
  treatments:[{name:'Dressing change', date:'14 Aug 2026', doctor:'Nurse Anitha K.', room:'Dressing Room 1', status:'completed'}],
  docs:[{name:'Legacy case file · scanned.pdf', type:'Historical record', uploadedOn:'04 Feb 2022', by:'Priya Nair', external:true}],
  progress:[{session:'Session 22', date:'14 Aug 2026', note:'Ulcer size stable at ~1.2cm, no signs of infection.', consentLinked:true}],
  followup:{next:'28 Aug 2026 · Dressing + HbA1c review', notes:'Continue weekly dressing; repeat lipid profile in 3 months.'}
 },

 {id:'p6', name:'Fathima Bhanu', mrn:'AWH-2026-0468', dob:'10 Feb 2001', age:25, gender:'Female',
  mobile:'+91 90144 76321', email:'fathima.bhanu01@gmail.com', altContact:'',
  currAddr:'Not captured yet', permAddr:'Not captured yet',
  caretaker:'', emergency:'+91 90144 76321 (Self)',
  abha:'', legacyId:'', aadhaarFull:'', panFull:'', photoOnFile:false,
  branch:'Banjara Hills', registeredOn:'17 Aug 2026', lastVisit:null, nextAppt:null,
  allergies:[],
  consents:{},
  timeline:[{date:'17 Aug 2026', type:'Registration', title:'Patient registered', author:'Priya Nair · Front Desk Lead', summary:'Walk-in registration · first appointment yet to be scheduled.'}],
  consultations:[], vitals:[], problems:[], meds:[], labs:[], orders:[], treatments:[], docs:[], progress:[],
  followup:{next:null, notes:''}
 }
];

let revealState = {};
let currentPatientId = null;
let activeRTab = 'overview';

const RTABS = [
 ['overview','Overview'], ['identity','Personal &amp; Identity'], ['consent','Consent &amp; Safety'],
 ['timeline','Timeline'], ['consult','Consultations'], ['vitals','Triage &amp; Metrics'],
 ['problems','Problems / Diagnoses'], ['meds','Medications &amp; Prescriptions'], ['labs','Labs'],
 ['orders','Orders &amp; Care Plans'], ['treat','Treatments / Procedures'], ['docs','Documents &amp; Scans'],
 ['progress','Progress &amp; Media'], ['followup','Follow-Up']
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
  return { set:v=>setVal(v,true), get:()=>hidden.value };
}
document.addEventListener('click', ()=>$$('.f.fsel').forEach(x=>x.classList.remove('open')));

const consentDD = initFsel('cstWrap','cstBtn','cstPanel','fConsent',
  [['','All patients'],['complete','Consent complete'],['pending','Consent pending']], applyFilters);
const dGenderDD = initFsel('dGenderWrap','dGenderBtn','dGenderPanel','dGender',
  [['','Select…'],['Male','Male'],['Female','Female'],['Other','Other']]);

/* ---------- helpers ---------- */
function isConsentComplete(p){ return CONSENT_TYPES.every(ct=>p.consents[ct.id] && p.consents[ct.id].status==='granted'); }
function pendingConsentNames(p){
  return CONSENT_TYPES.filter(ct => !(p.consents[ct.id] && p.consents[ct.id].status==='granted')).map(ct => ct.name.replace(/&amp;/g,'&'));
}
function consentChip(p){ return isConsentComplete(p) ? '<span class="stchip on"><i></i>Complete</span>' : '<span class="stchip warn"><i></i>Pending</span>'; }
function emptyBlock(title,sub){
  return `<div class="empty"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg><b>${title}</b><span>${sub}</span></div>`;
}
function rlist(items, mapper, emptyTitle, emptySub){
  if(!items.length) return emptyBlock(emptyTitle, emptySub);
  return '<div class="rlist">' + items.map(it=>{
    const m = mapper(it);
    return `<div class="ritem"><div class="ri-main"><b>${m.title}</b><span class="s">${m.meta}</span></div>${m.right||''}</div>`;
  }).join('') + '</div>';
}

/* ---------- list view ---------- */
function renderStats(){
  $('#stTotal').textContent = PATIENTS.length;
  $('#stNew').textContent = PATIENTS.filter(p=>p.registeredOn.endsWith('Aug 2026')).length;
  $('#stPending').textContent = PATIENTS.filter(p=>!isConsentComplete(p)).length;
  $('#stAlerts').textContent = PATIENTS.filter(p=>p.allergies.length).length;
}
function renderRow(p){
  return `<tr>
    <td><div style="display:flex;align-items:center;gap:9px"><span class="ravatar">${initials(p.name)}</span><div><b>${esc(p.name)}</b><span class="s">${esc(p.mrn)}</span></div></div></td>
    <td><span class="s">${esc(p.mobile)}</span></td>
    <td><span class="s">${esc(p.gender)} · ${p.age}y</span></td>
    <td><span class="s">${p.lastVisit ? esc(p.lastVisit) : '—'}</span></td>
    <td><span class="s">${p.nextAppt ? esc(p.nextAppt) : '—'}</span></td>
    <td>${consentChip(p)}</td>
    <td style="text-align:right"><button class="mini" data-view="${p.id}">View</button></td>
  </tr>`;
}
function applyFilters(){
  const q = $('#pSearch').value.trim().toLowerCase();
  const cst = consentDD.get();
  const list = PATIENTS.filter(p =>
    (!q || p.name.toLowerCase().includes(q) || p.mobile.includes(q) || p.mrn.toLowerCase().includes(q)) &&
    (!cst || (cst==='complete' ? isConsentComplete(p) : !isConsentComplete(p)))
  );
  renderList(list);
}
function renderList(list){
  const body=$('#pBody');
  if(!list.length){
    body.innerHTML=''; $('#pEmpty').style.display='block';
    $('#pFoot').textContent = `Showing 0 of ${PATIENTS.length} patients`;
    return;
  }
  $('#pEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#pFoot').textContent = `Showing ${list.length} of ${PATIENTS.length} patients`;
}
$('#pSearch').addEventListener('input', applyFilters);
$('#pBody').addEventListener('click', e=>{
  const b=e.target.closest('[data-view]'); if(!b) return;
  showRecord(b.dataset.view);
});

/* ---------- record view: tab renderers ---------- */
function renderOverview(p){
  const activeProblems = p.problems.filter(x=>x.status==='active');
  const activeMeds = p.meds.filter(x=>x.status==='active');
  const recentTL = p.timeline.slice(0,3);
  return `<div class="ogrid">
    <div class="card"><div class="ch"><h3>Active Problems</h3></div><div class="cb">${
      activeProblems.length ? '<div class="rlist">'+activeProblems.map(x=>`<div class="ritem"><div class="ri-main"><b>${esc(x.name)}</b><span class="s">since ${x.notedOn}</span></div></div>`).join('')+'</div>' : emptyBlock('No active problems','—')
    }</div></div>
    <div class="card"><div class="ch"><h3>Current Medications</h3></div><div class="cb">${
      activeMeds.length ? '<div class="rlist">'+activeMeds.map(x=>`<div class="ritem"><div class="ri-main"><b>${esc(x.name)}</b><span class="s">${esc(x.freq)}</span></div></div>`).join('')+'</div>' : emptyBlock('No current medications','—')
    }</div></div>
    <div class="card"><div class="ch"><h3>Recent Timeline</h3></div><div class="cb">${
      recentTL.length ? '<div class="tl">'+recentTL.map(e=>`<div class="tlitem"><div class="tldate">${e.date} · ${esc(e.type)}</div><div class="tltitle">${esc(e.title)}</div></div>`).join('')+'</div>' : emptyBlock('No recent activity','—')
    }</div></div>
    <div class="card"><div class="ch"><h3>Follow-Up</h3></div><div class="cb"><div class="rlist"><div class="ritem"><div class="ri-main"><b>${p.followup.next ? esc(p.followup.next) : 'No follow-up scheduled'}</b><span class="s">${esc(p.followup.notes||'—')}</span></div></div></div></div></div>
  </div>`;
}
function renderIdentity(p){
  const g = (lbl,val,extra) => `<div class="fitem"><div class="flbl">${lbl}</div><div class="fval">${val}</div>${extra||''}</div>`;
  const maskedRow = (lbl,fieldKey,fullVal) => {
    if(!fullVal) return g(lbl, '<span class="s">Not captured</span>');
    const revealed = revealState[p.id+'-'+fieldKey];
    const last4 = fullVal.slice(-4);
    const shown = revealed ? esc(fullVal) : ('•••• •••• '+last4);
    return `<div class="fitem"><div class="flbl">${lbl} <button type="button" class="revealbtn" data-reveal="${fieldKey}" title="${revealed?'Hide':'Show full value'}">${EYE_ICON}</button></div><div class="fval mono">${shown}</div></div>`;
  };
  return `
   <div class="fgroup"><h4>Identity</h4><div class="fgrid">
     ${g('Full Name', esc(p.name))}
     ${g('Date of Birth / Age', esc(p.dob)+' · '+p.age+'y')}
     ${g('Gender', esc(p.gender))}
     ${g('Photograph', p.photoOnFile ? '<span class="chip ok">On file</span>' : '<span class="chip mute">Not captured</span>')}
   </div></div>
   <div class="fgroup"><h4>Contact</h4><div class="fgrid">
     ${g('Mobile Number', esc(p.mobile))}
     ${g('Email Address', p.email ? esc(p.email) : '<span class="s">Not captured</span>')}
     ${g('Alternate Contact', p.altContact ? esc(p.altContact) : '<span class="s">Not captured</span>')}
   </div></div>
   <div class="fgroup"><h4>Address</h4><div class="fgrid">
     ${g('Current Address', esc(p.currAddr))}
     ${g('Permanent Address', esc(p.permAddr))}
   </div></div>
   <div class="fgroup"><h4>Caretaker &amp; Emergency</h4><div class="fgrid">
     ${g('Caretaker / Guardian', p.caretaker ? esc(p.caretaker) : '<span class="s">Not applicable</span>')}
     ${g('Emergency Contact', esc(p.emergency))}
   </div></div>
   <div class="fgroup"><h4>Restricted Identifiers</h4><div class="fgrid">
     ${g('MRN / UHID', '<span class="mono">'+esc(p.mrn)+'</span>'+LOCK_ICON)}
     ${g('ABHA Number', p.abha ? '<span class="mono">'+esc(p.abha)+'</span>' : '<span class="s">Not captured</span>')}
     ${p.legacyId ? g('Legacy ID (previous system)', '<span class="mono">'+esc(p.legacyId)+'</span>', '<span class="hint">⚠ Legacy-ID capture is not fully configured for all departments yet. See Patient Fields.</span>') : g('Legacy ID (previous system)','<span class="s">Not applicable</span>')}
     ${maskedRow('Aadhaar Number','aadhaar',p.aadhaarFull)}
     ${maskedRow('PAN Number','pan',p.panFull)}
   </div></div>
   <button class="btn btn-ghost" id="editIdentityBtn" type="button">Edit demographics</button>
  `;
}
function renderConsent(p){
  const rows = CONSENT_TYPES.map(ct=>{
    const inst = p.consents[ct.id];
    let chip, meta;
    if(!inst){ chip='<span class="stchip warn"><i></i>Not yet captured</span>'; meta='—'; }
    else if(inst.status==='granted'){ chip='<span class="stchip on"><i></i>Granted</span>'; meta=`${inst.on} · ${esc(inst.by)}`; }
    else { chip='<span class="stchip"><i></i>Withdrawn</span>'; meta=`Withdrawn ${inst.on}`; }
    return `<div class="ritem"><div class="ri-main"><b>${ct.name}</b><span class="s">${ct.validity} · ${meta}</span></div>${chip}<button class="mini" data-consent-edit="${ct.id}" style="margin-left:8px">Update</button></div>`;
  }).join('');
  const alRows = p.allergies.length
    ? '<div class="rlist">'+p.allergies.map(a=>`<div class="ritem"><div class="ri-main"><b>⚠ ${esc(a.name)}</b><span class="s">${a.reaction} · noted ${a.notedOn}</span></div><span class="chip bad">${esc(a.severity)}</span></div>`).join('')+'</div>'
    : emptyBlock('No known allergies recorded','Flag any known allergy or adverse reaction here.');
  return `<div class="fgroup"><h4>Allergies &amp; Safety</h4>${alRows}</div>
          <div class="fgroup"><h4>Consent Record</h4><div class="rlist">${rows}</div></div>`;
}
function renderTimeline(p){
  if(!p.timeline.length) return emptyBlock('No timeline events yet','Events appear here as the patient is seen: registration, consultations, labs, treatments and documents.');
  return '<div class="tl">' + p.timeline.map(e=>`<div class="tlitem"><div class="tldate">${e.date} · ${esc(e.type)}</div><div class="tltitle">${esc(e.title)}</div><div class="tlmeta">${esc(e.author)} · ${e.summary}</div></div>`).join('') + '</div>';
}
function renderConsultations(p){
  return rlist(p.consultations, c=>({title:esc(c.complaint), meta:`${c.date} · ${esc(c.doctor)} · ${c.diagnosis}`, right:`<span class="chip ${c.status==='signed'?'ok':'warn'}">${c.status==='signed'?'Signed':'Draft'}</span>`}), 'No consultation notes yet','Consultation notes appear here once the doctor documents a visit.');
}
function renderVitals(p){
  if(!p.vitals.length) return emptyBlock('No triage / vitals recorded yet','Vitals captured at check-in will appear here.');
  return `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Date</th><th>BP</th><th>Pulse</th><th>Temp</th><th>SpO₂</th><th>Weight</th><th>Recorded by</th></tr></thead><tbody>${
    p.vitals.map(v=>`<tr><td><span class="s">${v.date}</span></td><td>${v.bp}</td><td>${v.pulse}</td><td>${v.temp}</td><td>${v.spo2}</td><td>${v.weight}</td><td><span class="s">${esc(v.by)}</span></td></tr>`).join('')
  }</tbody></table></div>`;
}
function renderProblems(p){
  return rlist(p.problems, x=>({title:esc(x.name), meta:`Noted ${x.notedOn} · ${esc(x.notedBy)}`, right:`<span class="chip ${x.status==='active'?'warn':'mute'}">${x.status==='active'?'Active':'Resolved'}</span>`}), 'No diagnoses recorded yet','Diagnoses and the active problem list appear here.');
}
function renderMeds(p){
  return rlist(p.meds, m=>({title:esc(m.name), meta:`${esc(m.freq)} · since ${m.since} · ${esc(m.prescribedBy)}`, right:`<span class="chip ${m.status==='active'?'ok':'mute'}">${m.status==='active'?'Active':'Stopped'}</span>`}), 'No medications recorded yet','Current medications and prescription history appear here.');
}
function renderLabs(p){
  if(!p.labs.length) return emptyBlock('No lab results yet','Lab orders and results will appear here.');
  const flagChip = f => f==='critical' ? '<span class="chip bad">Critical</span>' : f==='abnormal' ? '<span class="chip warn">Abnormal</span>' : '<span class="chip ok">Normal</span>';
  return `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Test</th><th>Date</th><th>Result</th><th>Flag</th></tr></thead><tbody>${
    p.labs.map(l=>`<tr><td><b>${esc(l.test)}</b></td><td><span class="s">${l.date}</span></td><td><span class="s">${esc(l.result)}</span></td><td>${flagChip(l.flag)}</td></tr>`).join('')
  }</tbody></table></div>`;
}
function renderOrders(p){
  return rlist(p.orders, o=>({title:esc(o.type), meta:`${esc(o.desc)} · ${o.date}`, right:`<span class="chip ${o.status==='active'?'info':o.status==='completed'?'ok':'mute'}">${o.status.charAt(0).toUpperCase()+o.status.slice(1)}</span>`}), 'No orders or care plans yet','Clinical orders and care plans appear here.');
}
function renderTreat(p){
  return rlist(p.treatments, t=>({title:esc(t.name), meta:`${t.date} · ${esc(t.doctor)} · ${esc(t.room)}`, right:`<span class="chip ${t.status==='completed'?'ok':'info'}">${t.status.charAt(0).toUpperCase()+t.status.slice(1)}</span>`}), 'No treatments or procedures yet','Treatment and procedure sessions appear here.');
}
function renderDocs(p){
  return rlist(p.docs, d=>({title:esc(d.name), meta:`${esc(d.type)} · uploaded ${d.uploadedOn} · ${esc(d.by)}`, right: d.external ? '<span class="chip mute">External / scanned</span>' : ''}), 'No documents uploaded yet','Scanned history, referral letters and reports appear here.');
}
function renderProgress(p){
  return rlist(p.progress, x=>({title:esc(x.session), meta:`${x.date} · ${esc(x.note)}`, right: x.consentLinked ? '<span class="chip ok">Consent linked</span>' : '<span class="chip bad">No consent on file</span>'}), 'No progress photos yet','Progress media requires an active photography consent.');
}
function renderFollowup(p){
  return `<div class="fgroup"><h4>Next Follow-Up</h4><div class="rlist"><div class="ritem"><div class="ri-main"><b>${p.followup.next ? esc(p.followup.next) : 'No follow-up scheduled'}</b><span class="s">${esc(p.followup.notes||'—')}</span></div></div></div></div>`;
}

const TAB_RENDERERS = {
  overview:renderOverview, identity:renderIdentity, consent:renderConsent, timeline:renderTimeline,
  consult:renderConsultations, vitals:renderVitals, problems:renderProblems, meds:renderMeds, labs:renderLabs,
  orders:renderOrders, treat:renderTreat, docs:renderDocs, progress:renderProgress, followup:renderFollowup
};

/* ---------- record view: header + shell ---------- */
function renderHead(p){
  const criticalLab = p.labs.find(l=>l.flag==='critical');
  const consentComplete = isConsentComplete(p);
  $('#phAvatar').textContent = initials(p.name);
  $('#phName').textContent = p.name;
  $('#phMeta').textContent = `${p.mrn} · ${p.dob} · ${p.age}y · ${p.gender} · ${p.mobile} · ${p.branch}`;
  const al = $('#phAllergy'); al.className = 'safe' + (p.allergies.length ? ' bad' : '');
  al.innerHTML = `<span class="k">Allergy</span><span class="v">${p.allergies.length ? esc(p.allergies[0].name)+(p.allergies.length>1?' +'+(p.allergies.length-1):'') : 'None known'}</span>`;
  $('#phMeds').innerHTML = `<span class="k">Current Meds</span><span class="v">${p.meds.filter(m=>m.status==='active').length}</span>`;
  const pending = pendingConsentNames(p);
  const cs = $('#phConsent'); cs.className = 'safe' + (consentComplete ? '' : ' bad');
  cs.title = consentComplete ? '' : ('Pending: ' + pending.join(', ') + '. Click to review');
  cs.innerHTML = `<span class="k">Consent</span><span class="v">${consentComplete ? 'Complete' : pending.length+' pending'}</span>`;
  const cr = $('#phCritical'); cr.className = 'safe' + (criticalLab ? ' bad' : '');
  cr.innerHTML = `<span class="k">Critical Result</span><span class="v">${criticalLab ? esc(criticalLab.test) : 'None'}</span>`;
}
function renderRecordTab(){
  const p = PATIENTS.find(x=>x.id===currentPatientId);
  $('#rtabContent').innerHTML = TAB_RENDERERS[activeRTab](p);
}
function showRecord(id){
  const p = PATIENTS.find(x=>x.id===id);
  if(!p) return;
  currentPatientId = id; activeRTab = 'overview';
  $('#listView').style.display='none';
  $('#recordView').style.display='block';
  renderHead(p);
  $('#rtabs').innerHTML = RTABS.map(([k,l])=>`<button type="button" data-t="${k}" class="${k==='overview'?'on':''}">${l}</button>`).join('');
  renderRecordTab();
}
function showList(){
  $('#recordView').style.display='none';
  $('#listView').style.display='block';
  renderStats(); applyFilters();
}
$('#backBtn').addEventListener('click', showList);
function goToTab(key){
  activeRTab = key;
  $$('#rtabs button').forEach(x=>x.classList.toggle('on', x.dataset.t===key));
  renderRecordTab();
}
$('#rtabs').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  goToTab(b.dataset.t);
});
$('#phConsent').addEventListener('click', ()=>goToTab('consent'));
$('#rtabContent').addEventListener('click', e=>{
  const rb = e.target.closest('[data-reveal]');
  if(rb){
    const key = currentPatientId+'-'+rb.dataset.reveal;
    revealState[key] = !revealState[key];
    if(revealState[key]) toast('Full value shown, access logged for audit');
    renderRecordTab();
    return;
  }
  if(e.target.closest('#editIdentityBtn')){ toast('Demographic editing opens here, coming soon'); }
  const ce = e.target.closest('[data-consent-edit]');
  if(ce){ openConsentDrawer(ce.dataset.consentEdit); }
});

/* ---------- consent update drawer ---------- */
let editingConsentId = null;
function cSegSet(v){ $$('#cStatusSeg button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function cSegGet(){ const b=$('#cStatusSeg button.on'); return b ? b.dataset.v : 'none'; }
function openConsentDrawer(ctId){
  const p = PATIENTS.find(x=>x.id===currentPatientId); if(!p) return;
  const ct = CONSENT_TYPES.find(x=>x.id===ctId); if(!ct) return;
  editingConsentId = ctId;
  $('#cSub').textContent = ct.name.replace(/&amp;/g,'&');
  const inst = p.consents[ctId];
  if(!inst){ cSegSet('none'); $('#cDate').value=''; $('#cBy').value=''; }
  else { cSegSet(inst.status); $('#cDate').value=inst.on; $('#cBy').value=inst.by; }
  $('#cScrim').classList.add('show'); $('#cDrawer').classList.add('show');
}
function closeConsentDrawer(){ $('#cScrim').classList.remove('show'); $('#cDrawer').classList.remove('show'); editingConsentId=null; }
$('#cStatusSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) cSegSet(b.dataset.v); });
$('#cClose').addEventListener('click', closeConsentDrawer);
$('#cCancel').addEventListener('click', closeConsentDrawer);
$('#cScrim').addEventListener('click', closeConsentDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#cDrawer').classList.contains('show')) closeConsentDrawer(); });
$('#cSave').addEventListener('click', ()=>{
  const p = PATIENTS.find(x=>x.id===currentPatientId); if(!p || !editingConsentId) return;
  const status = cSegGet();
  if(status==='none'){
    delete p.consents[editingConsentId];
  } else {
    const on = $('#cDate').value.trim() || TODAY;
    const by = $('#cBy').value.trim() || 'Self';
    p.consents[editingConsentId] = { status, on, by };
  }
  closeConsentDrawer();
  toast('Consent updated');
  renderHead(p);
  renderRecordTab();
});

/* ---------- new patient drawer ---------- */
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){
  $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show');
  ['dName','dDob','dAge','dMobile','dEmail','dAddr'].forEach(id=>$('#'+id).value='');
  dGenderDD.set('');
}
$('#newBtn').addEventListener('click', openDrawer);
$('#dClose').addEventListener('click', closeDrawer);
$('#dCancel').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#drawer').classList.contains('show')) closeDrawer(); });

$('#dSave').addEventListener('click', ()=>{
  const name=$('#dName').value.trim(), dob=$('#dDob').value.trim(), age=$('#dAge').value.trim(),
        gender=$('#dGender').value, mobile=$('#dMobile').value.trim();
  if(!name || !dob || !age || !gender || !mobile){ toast('Please fill Name, DOB, Age, Gender and Mobile'); return; }
  const id = 'p-new-'+Date.now();
  const addr = $('#dAddr').value.trim() || 'Not captured yet';
  const newP = {
    id, name, mrn:'AWH-2026-0'+(468+PATIENTS.length), dob, age:Number(age)||0, gender, mobile,
    email:$('#dEmail').value.trim(), altContact:'', currAddr:addr, permAddr:addr,
    caretaker:'', emergency:mobile+' (Self)', abha:'', legacyId:'', aadhaarFull:'', panFull:'', photoOnFile:false,
    branch:'Banjara Hills', registeredOn:TODAY, lastVisit:null, nextAppt:null,
    allergies:[], consents:{},
    timeline:[{date:TODAY, type:'Registration', title:'Patient registered', author:'Rajeev Malhotra · Hospital Administrator', summary:'New patient registered · full history builds up from the first visit.'}],
    consultations:[], vitals:[], problems:[], meds:[], labs:[], orders:[], treatments:[], docs:[], progress:[],
    followup:{next:null, notes:''}
  };
  PATIENTS.unshift(newP);
  closeDrawer();
  toast('Patient registered');
  showRecord(id);
});

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

