document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

const STATUS = { active:{n:'Active',cls:'on'}, draft:{n:'Draft',cls:''}, inactive:{n:'Inactive',cls:'warn'} };

/* structured field option sets (per spec §13 Workspace 11 field tables) */
const CATEGORY_OPTS = [['wound-care','Wound Care'],['diabetic-foot','Diabetic Foot Care'],['post-surgical','Post-Surgical Care'],['compression','Compression Therapy'],['advanced-wound','Advanced Wound Therapy'],['physiotherapy','Physiotherapy']];
const FREQUENCY_OPTS = [['daily','Daily'],['weekly','Weekly'],['3day','3-day'],['5day','5-day'],['7day','7-day'],['custom','Custom']];
/* ROOM_TYPE_OPTS = rooms-areas.js's actual 3 room families (same list services-consultation-types
   uses) · real master data owned by Rooms & Care Areas, not an invented room list. */
const ROOM_TYPE_OPTS = ['General Room','Procedure & Treatment Room','Staying Room'];
/* EQUIPMENT_OPTS = the exact equipment names from equipment-resources.js's EQUIPMENT list (Resources
   & Equipment tab) · whatever the Admin adds there is what shows here. */
const EQUIPMENT_OPTS = ['Debridement Kit Set A','Wound VAC Unit','Digital Wound Camera','Autoclave Sterilizer','Patient Wheelchair','Dressing Trolley B'];
/* CONSENT_OPTS mirrors the consent master on patient-fields.html (Workspace 15 "Consent
   configuration") · the exact record names the Admin configures there, the same way DEPARTMENTS
   mirrors doctors-staff.html. It's real master data owned by that screen, so no "add new" row here.
   (The old local list had "Device Use" / "Anaesthesia" entries that exist neither in the master nor
   in the BRD · anaesthesia/OT is explicitly out of scope.) */
/* Consent types exactly as listed in BRD §17 (Workspace 15 → Consent configuration). */
const CONSENT_OPTS = ['Treatment Consent','Procedure Consent','Clinical Photography / Media','Communication Consent','Data / Document Sharing Consent'];
/* DOCTORS mirrors the doctor records on doctors-staff.html (name + department + role) · real
   master data owned there, so the Required Doctor picker is a fixed list with no "add new" row. */
const DOCTORS = [
  {n:'Dr. KVNN Santosh Murthy', dept:'Consulting', role:'Duty Doctor'},
  {n:'Dr. Hrishikesh Korada', dept:'Consulting', role:'Physical Medicine & Rehabilitation'},
  {n:'Dr. Harsh Atul', dept:'Consulting', role:'Duty Doctor'},
  {n:'Dr. Raghavendra', dept:'Consulting', role:'Duty Doctor'},
  {n:'Dr. Sameera', dept:'OPD', role:'Duty Doctor'}
];
/* NURSES mirrors the nursing records on doctors-staff.html the same way DOCTORS does. */
const NURSES = [
  {n:'Swathi Reddy', dept:'Nursing', role:'Staff Nurse'},
  {n:'Manasa Chowdary', dept:'Nursing', role:'Staff Nurse'}
];
/* SERVICE_LINKS mirrors the "Included treatments & procedures" mapping on services-consultation-
   types.html (INCLUDED_MAP there) · which Services include a given treatment/procedure. Read-only
   here; the mapping is edited on the Service form. */
const SERVICES_MIRROR = [{"sr":3,"n":"Wound Physio","br":"OPD Annexe"},{"sr":4,"n":"Foot Scan & Analysis","br":"Main Campus"},{"sr":5,"n":"Gait Analysis","br":"Main Campus"},{"sr":20,"n":"PLATELET RICH PLASMA Procedure","br":"Main Campus"},{"sr":21,"n":"WARM OXYGEN THERAPY","br":"Main Campus"},{"sr":30,"n":"10 DAYS PACKAGE","br":"Main Campus"},{"sr":37,"n":"15 DAYS PACKAGE","br":"Main Campus"},{"sr":40,"n":"15-DAYS-PACKAGE","br":"OPD Annexe"},{"sr":47,"n":"21 DAYS","br":"Main Campus"},{"sr":49,"n":"21-Days package :HBOT-21,MHT-21,O3-21,WOUND PHYSIO-21,PRP-2,FAT GRAFTING -2,COLON-1,INFRA -3,C &D-10,DIET CONSULTATION,LAZER ,PROCEDURE","br":"Main Campus"},{"sr":69,"n":"PACKAGE","br":"Main Campus"},{"sr":73,"n":"LASERS","br":"Main Campus"},{"sr":83,"n":"PACKAGE","br":"Main Campus"},{"sr":142,"n":"Foley Catheter charges","br":"Main Campus"},{"sr":207,"n":"New Appointment","br":"OPD Annexe"},{"sr":220,"n":"OZONE THERAPY","br":"Main Campus"},{"sr":229,"n":"Ozone Therapy","br":"Main Campus"},{"sr":263,"n":"PACKAGE","br":"Main Campus"},{"sr":307,"n":"VIP","br":"Main Campus"},{"sr":6,"n":"PAIN MANAGEMENT","br":"Main Campus"},{"sr":10,"n":"PAIN MANAGEMENT","br":"Main Campus"},{"sr":11,"n":"Wound Physiotherapy","br":"OPD Annexe"},{"sr":45,"n":"2-D-ECHO","br":"Main Campus"},{"sr":78,"n":"Ana profile","br":"Main Campus"},{"sr":79,"n":"Ana titer","br":"Madhurawada Branch"},{"sr":2,"n":"15 DAYS HYDROGEN 8H, OZONE THERAPY, CLEANING & DRESSING","br":"Main Campus"},{"sr":25,"n":"10 DAYS -HBOT ,MHT,OZONE THERAPY","br":"Main Campus"},{"sr":26,"n":"10 DAYS -HBOT ,MHT,OZONE THERAPY","br":"Main Campus"},{"sr":14,"n":"Skin-Grafting Procedure","br":"OPD Annexe"},{"sr":17,"n":"Skin-Grafting Procedure","br":"Main Campus"},{"sr":109,"n":"DEBRIDMENT","br":"Main Campus"},{"sr":7,"n":"BURNS DRESSING","br":"Main Campus"},{"sr":8,"n":"DRESSING","br":"Main Campus"},{"sr":72,"n":"DRESSINGS","br":"Main Campus"},{"sr":9,"n":"Gait Analysis","br":"Main Campus"},{"sr":19,"n":"WOUND PHYSIO","br":"Main Campus"},{"sr":76,"n":"AIR WALKER","br":"OPD Annexe"},{"sr":93,"n":"CARDIOLOGIST-CONSULTATON","br":"Main Campus"},{"sr":124,"n":"Diabetologist consultation","br":"Main Campus"},{"sr":125,"n":"DR KVNN CONSULTATION","br":"Main Campus"}];
/* treatment/procedure name -> service sr numbers that include it (mirrors INCLUDED_MAP there) */
const SERVICE_LINKS = {
  'Diabetic Foot Ulcer Management Program': [30,37],   // 10 DAYS PACKAGE, 15 DAYS PACKAGE
  'Compression Therapy Program': [11],                 // Wound Physiotherapy
  'Skin Graft Dressing Change': [14,17],
  'Sharp Debridement': [109]
};

const TREATMENTS = [
 {id:'tr-1', name:'Diabetic Foot Ulcer Management Program', duration:45, sessions:'12 sessions, twice weekly', validity:'6 months from start',
  required:'Wound-care certified doctor, Dressing Room, debridement kit', prereq:'Initial consultation + HbA1c on file', followup:'Doctor review every 4 sessions', status:'active', updatedOn:'20 July 2026',
  code:'TRT-101', category:'diabetic-foot', description:'Structured 12-session diabetic foot ulcer management combining debridement, dressing and doctor review.', consentReq:['Treatment Consent'],
  sessionCount:12, frequency:'custom', frequencyCustom:'twice weekly', programDuration:'6 months', reqDoctor:{required:'yes',doctors:['Dr. KVNN Santosh Murthy']}, reqNursing:{count:1,staff:['Swathi Reddy']},
  roomTypes:['Procedure & Treatment Room'], equipment:['Debridement Kit Set A'], prereqTags:['Initial Consultation Completed','HbA1c on File'], completionRule:'Auto-complete after 12th session confirmed by nurse'},
 {id:'tr-2', name:'Compression Therapy Program', duration:30, sessions:'8 sessions, weekly', validity:'3 months from start',
  required:'Wound-care nurse, Dressing Room, compression bandage kit', prereq:'Doppler assessment on file', followup:'Review at session 4 and completion', status:'active', updatedOn:'18 July 2026',
  code:'TRT-102', category:'compression', description:'8-session compression therapy course for venous/lymphatic wound support.', consentReq:['Treatment Consent'],
  sessionCount:8, frequency:'weekly', programDuration:'3 months', reqDoctor:{required:'no',doctors:[]}, reqNursing:{count:1,staff:['Swathi Reddy']},
  roomTypes:['Procedure & Treatment Room'], equipment:[], prereqTags:['Doppler Assessment on File'], completionRule:'Marked complete when 8 sessions are logged and final review is done'},
 {id:'tr-3', name:'Negative Pressure Wound Therapy (NPWT) Course', duration:20, sessions:'6 sessions, every 3 days', validity:'6 weeks from start',
  required:'Doctor, Procedure Room 1, NPWT unit', prereq:'Consent for device use', followup:'Doctor review at every dressing change', status:'active', updatedOn:'22 July 2026',
  code:'TRT-103', category:'advanced-wound', description:'Negative Pressure Wound Therapy course with device management every 3 days.', consentReq:['Treatment Consent'],
  sessionCount:6, frequency:'3day', programDuration:'6 weeks', reqDoctor:{required:'yes',doctors:['Dr. KVNN Santosh Murthy']}, reqNursing:{count:1,staff:['Swathi Reddy']},
  roomTypes:['Procedure & Treatment Room'], equipment:['Wound VAC Unit'], prereqTags:['Consent for Device Use'], completionRule:'Auto-complete after device removal is confirmed'},
 {id:'tr-4', name:'Post-Surgical Wound Care Program', duration:30, sessions:'4 sessions, weekly', validity:'6 weeks from start',
  required:'Wound-care nurse, Dressing Room', prereq:'Discharge summary from operating facility', followup:'Suture-removal check at session 3', status:'draft', updatedOn:'12 August 2026',
  code:'TRT-104', category:'post-surgical', description:'4-session post-surgical wound monitoring and suture-removal check program.', consentReq:['Treatment Consent'],
  sessionCount:4, frequency:'weekly', programDuration:'6 weeks', reqDoctor:{required:'no',doctors:[]}, reqNursing:{count:1,staff:['Swathi Reddy']},
  roomTypes:['Procedure & Treatment Room'], equipment:[], prereqTags:['Discharge Summary Available'], completionRule:'Auto-complete after suture-removal check is confirmed'}
];

const PROCEDURES = [
 {id:'pr-1', name:'Sharp Debridement', duration:25, prep:10, recovery:15, practitioners:'Doctor only',
  required:'1 nurse assistant, Procedure Room 1, debridement kit, sharps disposal', instructions:'Consent required before start; keep dressing dry 24h post-procedure', status:'active', updatedOn:'20 July 2026',
  code:'PRC-201', category:'advanced-wound', description:'Sharp surgical debridement of non-viable wound tissue.', consentReq:['Procedure Consent'],
  cleaningBuffer:10, reqAssistants:1, procRoomCapability:['Sterile Field'], consumables:['Debridement Kit','Sharps Disposal Bag'],
  sessionCount:1, frequency:'custom', frequencyCustom:'single session', programDuration:'Single visit', reqDoctor:{required:'yes',doctors:['Dr. KVNN Santosh Murthy']}, reqNursing:{count:1,staff:['Swathi Reddy']}, roomTypes:['Procedure & Treatment Room'], equipment:['Debridement Kit Set A'], prereqTags:['Initial Consultation Completed'], followup:'Review at next scheduled dressing change', completionRule:'Complete when the debridement note is signed',
  preInstructions:'Confirm consent and review wound photos before start', postInstructions:'Keep dressing dry 24h post-procedure', followupReq:'Review at next scheduled dressing change'},
 {id:'pr-2', name:'Wound VAC Application', duration:30, prep:10, recovery:10, practitioners:'Doctor or trained nurse',
  required:'NPWT unit, sterile drapes, Dressing Room', instructions:'Explain device operation to patient/caretaker before discharge', status:'active', updatedOn:'22 July 2026',
  code:'PRC-202', category:'advanced-wound', description:'Application and setup of Negative Pressure Wound Therapy (Wound VAC) device.', consentReq:['Procedure Consent'],
  cleaningBuffer:10, reqAssistants:0, procRoomCapability:['NPWT-Capable'], consumables:['NPWT Canister','Sterile Gauze'],
  sessionCount:1, frequency:'custom', frequencyCustom:'single session', programDuration:'Single visit', reqDoctor:{required:'yes',doctors:['Dr. KVNN Santosh Murthy']}, reqNursing:{count:1,staff:['Swathi Reddy']}, roomTypes:['Procedure & Treatment Room'], equipment:['Wound VAC Unit'], prereqTags:['Consent for Device Use'], followup:'Device check within 48 hours', completionRule:'Complete when the device seal and canister are confirmed',
  preInstructions:'Explain device operation to patient/caretaker before start', postInstructions:'Confirm device seal and canister level before discharge', followupReq:'Device check within 48 hours'},
 {id:'pr-3', name:'Skin Graft Dressing Change', duration:20, prep:5, recovery:10, practitioners:'Doctor only',
  required:'1 nurse assistant, sterile kit, Procedure Room 1', instructions:'Photograph graft site under active consent before and after', status:'active', updatedOn:'01 August 2026',
  code:'PRC-203', category:'advanced-wound', description:'Dressing change and site assessment for a healing skin graft.', consentReq:['Procedure Consent','Clinical Photography / Media'],
  cleaningBuffer:10, reqAssistants:1, procRoomCapability:['Sterile Field'], consumables:['Dressing Kit'],
  sessionCount:1, frequency:'custom', frequencyCustom:'single session', programDuration:'Single visit', reqDoctor:{required:'yes',doctors:['Dr. Hrishikesh Korada']}, reqNursing:{count:1,staff:['Manasa Chowdary']}, roomTypes:['Procedure & Treatment Room'], equipment:['Digital Wound Camera'], prereqTags:[], followup:'Doctor review at next graft check', completionRule:'Complete after redressing and photo documentation',
  preInstructions:'Confirm active photography consent before exposing graft site', postInstructions:'Photograph graft site after redressing per protocol', followupReq:'Doctor review at next graft check'},
 {id:'pr-4', name:'Suture Removal', duration:10, prep:2, recovery:5, practitioners:'Doctor or trained nurse',
  required:'Suture removal kit, Dressing Room', instructions:'Check for signs of infection before removal', status:'active', updatedOn:'18 July 2026',
  code:'PRC-204', category:'post-surgical', description:'Removal of sutures once the wound has sufficiently healed.', consentReq:['Procedure Consent'],
  cleaningBuffer:5, reqAssistants:0, procRoomCapability:[], consumables:['Suture Kit'],
  sessionCount:1, frequency:'custom', frequencyCustom:'single session', programDuration:'Single visit', reqDoctor:{required:'no',doctors:[]}, reqNursing:{count:1,staff:['Manasa Chowdary']}, roomTypes:['General Room'], equipment:[], prereqTags:['Discharge Summary Available'], followup:'No follow-up unless complications are noted', completionRule:'Complete when sutures are removed and the site is checked',
  preInstructions:'Check for signs of infection before removal', postInstructions:'Advise patient on wound care post-removal', followupReq:'No follow-up required unless complications are noted'}
];

/* The list's summary strings (Sessions / Required Resources / Practitioners / Prerequisites) are
   ALWAYS derived from the structured fields · on load for the seed rows and again on every save —
   so a row can never say something the edit form doesn't show. */
function freqText(rec){ return rec.frequency==='custom' ? (rec.frequencyCustom||'') : ((FREQUENCY_OPTS.find(o=>o[0]===rec.frequency)||[])[1]||'').toLowerCase(); }
function deriveSummary(rec, isTreat){
  const rd = rec.reqDoctor || {required:'no', doctors:[]}, rn = rec.reqNursing || {count:0, staff:[]};
  const parts = [
    rd.required==='yes' ? (rd.doctors.length ? rd.doctors.join(', ') : 'Doctor') : '',
    rn.staff.length ? rn.staff.join(', ') : (rn.count ? rn.count+' nurse'+(rn.count>1?'s':'') : ''),
    ...(rec.roomTypes||[]), ...(rec.equipment||[])
  ].filter(Boolean);
  const ft = freqText(rec), sc = rec.sessionCount||0;
  rec.sessions = sc ? sc+' session'+(sc>1?'s':'')+(ft ? ', '+ft : '') : '—';
  rec.required = parts.length ? parts.join(', ') : '—';
  rec.prereq = (rec.prereqTags||[]).length ? rec.prereqTags.join(', ') : '—';
  if(!isTreat) rec.practitioners = rd.required==='yes' && rd.doctors.length ? rd.doctors.join(', ')
    : rn.staff.length ? rn.staff.join(', ') : (rd.required==='yes' ? 'Doctor' : '—');
  return rec;
}
TREATMENTS.forEach(r => deriveSummary(r, true));
PROCEDURES.forEach(r => deriveSummary(r, false));

let activeTab = 'treat';

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

/* ---- multi-select checklist with search ("multi-select chips") · same .mchk component as
   services-consultation-types.html/doctors-staff.html; used here for Consent Requirement ---- */
function initMchk(rootId, btnId, panelId, chipsId, vocab, placeholder, searchable, onChange){
  const root=$('#'+rootId), btn=$('#'+btnId), panel=$('#'+panelId), chipsEl=$('#'+chipsId);
  let selected = [];
  const searchHTML = searchable ? '<input type="text" class="mchk-search" placeholder="Search…" id="'+panelId+'Search">' : '';
  const renderChips = ()=>{
    /* a vocab entry can be a plain label string or {l, s} (two-line: title + muted subline);
       chips only ever show the title */
    chipsEl.innerHTML = selected.map(v=>'<span class="mchip">'+esc((vocab[v]&&vocab[v].l)||vocab[v]||v)+'<button type="button" data-rm="'+esc(v)+'">&times;</button></span>').join('');
    btn.textContent = selected.length ? selected.length+' selected' : placeholder;
  };
  const renderPanel = ()=>{
    panel.innerHTML = searchHTML + Object.entries(vocab).map(([v,l])=>
      '<label class="mchk-opt"><input type="checkbox" value="'+esc(v)+'" '+(selected.includes(v)?'checked':'')+'><span>'+((l&&typeof l==='object') ? '<b>'+esc(l.l)+'</b><small>'+esc(l.s)+'</small>' : esc(l))+'</span></label>').join('');
    if(searchable){
      const searchInput = $('#'+panelId+'Search');
      searchInput.addEventListener('input', e=>{
        const q = e.target.value.trim().toLowerCase();
        $$('#'+panelId+' .mchk-opt').forEach(el=>{ el.style.display = (!q || el.textContent.toLowerCase().includes(q)) ? '' : 'none'; });
      });
      searchInput.addEventListener('click', e=>e.stopPropagation());
    }
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
    get(){ return selected.slice(); }
  };
}
document.addEventListener('click', ()=>$$('.mchk').forEach(x=>x.classList.remove('open')));
const consentMchk = initMchk('consentMchk','consentBtn','consentPanel','consentChips', Object.fromEntries(CONSENT_OPTS.map(v=>[v,v])), 'Select consent types…', true);
/* Required Doctor picker · stored value is the doctor's name; the option label shows name plus
   department and role so the Admin can tell the Duty Doctors apart. Only shown while the
   Required Doctor toggle is "Yes" (see syncReqDoc). */
const reqDocMchk = initMchk('reqDocMchk','reqDocBtn','reqDocPanel','reqDocChips', Object.fromEntries(DOCTORS.map(d=>[d.n, {l:d.n, s:d.dept+' · '+d.role}])), 'Select doctors…', true);
function syncReqDoc(){ $('#reqDocFld').style.display = segGet('dReqDoctorSeg')==='yes' ? '' : 'none'; }
const roomMchk = initMchk('roomMchk','roomBtn','roomPanel','roomChips', Object.fromEntries(ROOM_TYPE_OPTS.map(v=>[v,v])), 'Select room types…', true);
const equipMchk = initMchk('equipMchk','equipBtn','equipPanel','equipChips', Object.fromEntries(EQUIPMENT_OPTS.map(v=>[v,v])), 'Select equipment…', true);
const nurseMchk = initMchk('nurseMchk','nurseBtn','nursePanel','nurseChips', Object.fromEntries(NURSES.map(d=>[d.n, {l:d.n, s:d.dept+' · '+d.role}])), 'Select nursing staff…', true);

const statDD = initFsel('statWrap','statBtn','statPanel','fStat',
  [['','All statuses'],['active','Active'],['draft','Draft'],['inactive','Inactive']], applyFilters);
const categoryDD = initFsel('dCategoryWrap','dCategoryBtn','dCategoryPanel','dCategory', CATEGORY_OPTS);
/* Frequency = Custom reveals a free-text "Custom frequency" box (the fixed options can't express
   "twice weekly for 4 weeks, then weekly"); any other option hides it. */
function syncFreqCustom(){ $('#freqCustomFld').style.display = $('#dFrequency').value==='custom' ? '' : 'none'; }
const frequencyDD = initFsel('dFrequencyWrap','dFrequencyBtn','dFrequencyPanel','dFrequency', FREQUENCY_OPTS, syncFreqCustom);

/* every multi-value field in the drawer is a .mchk (see initMchk above) · the old .mpick
   button-row pickers are gone. */

$('#tabSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  activeTab = b.dataset.t;
  $$('#tabSeg button').forEach(x=>x.classList.toggle('on', x===b));
  $('#newBtnTxt').textContent = 'Add treatment / procedure'; // one button; Treatment vs Procedure is picked inside the form
  $('#tSearch').value=''; statDD.set('');
  renderHead();
  applyFilters();
});

function renderHead(){
  $('#tblHead').innerHTML = activeTab==='treat'
    ? '<tr><th>Treatment</th><th>Duration</th><th>Sessions</th><th>Required Resources</th><th>Status</th><th style="text-align:right">Actions</th></tr>'
    : '<tr><th>Procedure</th><th>Duration</th><th>Prep / Recovery</th><th>Practitioners</th><th>Status</th><th style="text-align:right">Actions</th></tr>';
}

function dataset(){ return activeTab==='treat' ? TREATMENTS : PROCEDURES; }

function renderRow(e){
  const st = STATUS[e.status];
  if(activeTab==='treat'){
    return `<tr>
      <td><b>${esc(e.name)}</b><span class="s">${esc(e.code||'—')}</span></td>
      <td><span class="s">${e.duration} min</span></td>
      <td><span class="s">${esc(e.sessions)}</span></td>
      <td><span class="s">${esc(e.required)}</span></td>
      <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
      <td style="text-align:right"><span style="display:inline-flex;gap:6px;align-items:center"><button class="mini" data-edit="${e.id}">Edit</button><button class="kebab-btn" data-kebab="${e.id}" title="More actions" aria-label="More actions">&#8942;</button></span></td>
    </tr>`;
  }
  return `<tr>
    <td><b>${esc(e.name)}</b><span class="s">${esc(e.code||'—')}</span></td>
    <td><span class="s">${e.duration} min</span></td>
    <td><span class="s">${e.prep}m prep · ${e.recovery}m recovery</span></td>
    <td><span class="s">${esc(e.practitioners)}</span></td>
    <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td style="text-align:right"><span style="display:inline-flex;gap:6px;align-items:center"><button class="mini" data-edit="${e.id}">Edit</button><button class="kebab-btn" data-kebab="${e.id}" title="More actions" aria-label="More actions">&#8942;</button></span></td>
  </tr>`;
}
function renderStats(){
  const list = dataset();
  $('#stTotalLbl').textContent = activeTab==='treat' ? 'Total treatments' : 'Total procedures';
  $('#stTotal').textContent = list.length;
  $('#stActive').textContent = list.filter(e=>e.status==='active').length;
  $('#stDraft').textContent = list.filter(e=>e.status==='draft').length;
}
function applyFilters(){
  const q = $('#tSearch').value.trim().toLowerCase();
  const stat = statDD.get();
  const list = dataset().filter(e => (!q || e.name.toLowerCase().includes(q)) && (!stat || e.status===stat));
  renderList(list);
}
function renderList(list){
  const full = dataset();
  const body = $('#tBody');
  $('#tEmptyTxt').textContent = activeTab==='treat' ? 'No treatments match these filters' : 'No procedures match these filters';
  if(!list.length){
    body.innerHTML=''; $('#tEmpty').style.display='block';
    $('#tFoot').textContent = `Showing 0 of ${full.length} ${activeTab==='treat'?'treatments':'procedures'}`;
    return;
  }
  $('#tEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#tFoot').textContent = `Showing ${list.length} of ${full.length} ${activeTab==='treat'?'treatments':'procedures'}`;
}
$('#tSearch').addEventListener('input', applyFilters);

let editingId = null;
/* The drawer's shape follows drawerKind ('treat' | 'proc'), chosen in the "Record type" field at the
   top of the form (hidden while editing — a record's kind never changes). */
let drawerKind = 'treat';
const dKindDD = initFsel('dKindWrap','dKindBtn','dKindPanel','dKind', [['treat','Treatment'],['proc','Procedure']], v => { drawerKind = v; applyKind(); });
function applyKind(){
  const isTreat = drawerKind==='treat';
  $('#dKindFld').style.display = editingId ? 'none' : '';
  $('#dNameLbl').textContent = isTreat ? 'Treatment name' : 'Procedure name';
  $('#dDurLbl').textContent = isTreat ? 'Session Default Duration' : 'Duration';
  $('#procOnlyGroup').style.display = isTreat ? 'none' : '';
  if(!editingId){
    $('#dTitle').textContent = isTreat ? 'Add treatment' : 'Add procedure';
    $('#dSub').textContent = isTreat ? 'Define a new treatment program' : 'Define a new procedure';
  }
}
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId, v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b ? b.dataset.v : null; }
$('#dStatusSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  /* same guard in the drawer: switching an included, currently-active record to Inactive shows
     the impact review first */
  const item = editingId ? dataset().find(x=>x.id===editingId) : null;
  if(b.dataset.v==='inactive' && segGet('dStatusSeg')!=='inactive' && item && item.status==='active' && serviceDeps(item).length){
    showDepModal(item, ()=>segSet('dStatusSeg','inactive'));
    return;
  }
  segSet('dStatusSeg', b.dataset.v);
});
$('#dReqDoctorSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b){ segSet('dReqDoctorSeg', b.dataset.v); syncReqDoc(); } });
/* Consent Requirement = Yes/No; the consent-types picker only shows for Yes */
function syncConsent(){ $('#consentFld').style.display = segGet('dConsentSeg')==='yes' ? '' : 'none'; }
$('#dConsentSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b){ segSet('dConsentSeg', b.dataset.v); syncConsent(); } });

$('#newBtn').addEventListener('click', ()=>{
  editingId = null;
  drawerKind = activeTab; dKindDD.set(drawerKind);
  const isTreat = drawerKind==='treat';
  $('#dNameLbl').textContent = isTreat ? 'Treatment name' : 'Procedure name';
  $('#dDurLbl').textContent = isTreat ? 'Session Default Duration' : 'Duration';
  $('#dTitle').textContent = isTreat ? 'Add treatment' : 'Add procedure';
  $('#dSub').textContent = isTreat ? 'Define a new treatment program' : 'Define a new procedure';
  /* BRD §13: Procedure fields = Treatment fields + additional · so the treatment blocks always
     show; only the additional procOnlyGroup toggles. */
  applyKind();
  $('#dName').value=''; $('#dDuration').value='';
  $('#dFollowup').value='';
  $('#dPrep').value=''; $('#dRecovery').value='';
  $('#dCode').value=''; categoryDD.set(CATEGORY_OPTS[0][0]); $('#dDescription').value=''; segSet('dConsentSeg','yes'); consentMchk.set([]); syncConsent();
  $('#dSessionCount').value=''; frequencyDD.set(FREQUENCY_OPTS[0][0]); $('#dFreqCustom').value=''; syncFreqCustom(); $('#dProgramDuration').value='';
  segSet('dReqDoctorSeg','yes'); reqDocMchk.set([]); syncReqDoc(); $('#dNurseCount').value='0'; nurseMchk.set([]);
  roomMchk.set([]); equipMchk.set([]); $('#dPrereq').value='';
  $('#dCompletionRule').value='';
  $('#dCleaningBuffer').value=''; $('#dReqAssistants').value='0';
  $('#dPreInstructions').value=''; $('#dPostInstructions').value=''; $('#dFollowupReq').value='';
  segSet('dStatusSeg','draft');
  $('#dMetaWrap').style.display='none';
  openDrawer();
});
$('#tBody').addEventListener('click', e=>{
  const b=e.target.closest('[data-edit]'); if(!b) return;
  const item = dataset().find(x=>x.id===b.dataset.edit); if(!item) return;
  editingId = item.id;
  drawerKind = activeTab; dKindDD.set(drawerKind);
  const isTreat = drawerKind==='treat';
  $('#dNameLbl').textContent = isTreat ? 'Treatment name' : 'Procedure name';
  $('#dDurLbl').textContent = isTreat ? 'Session Default Duration' : 'Duration';
  $('#dTitle').textContent = 'Edit ' + (isTreat?'treatment':'procedure');
  $('#dSub').textContent = item.name;
  /* BRD §13: Procedure fields = Treatment fields + additional · so the treatment blocks always
     show; only the additional procOnlyGroup toggles. */
  applyKind();
  $('#dName').value = item.name; $('#dDuration').value = item.duration;
  $('#dCode').value = item.code||''; categoryDD.set(item.category||CATEGORY_OPTS[0][0]); $('#dDescription').value = item.description||'';
  segSet('dConsentSeg', (item.consentReq||[]).length ? 'yes' : 'no'); consentMchk.set(item.consentReq||[]); syncConsent();
  { /* treatment-structured fields load for BOTH kinds (procedure = treatment + additional) */
    $('#dFollowup').value=item.followup||'';
    $('#dSessionCount').value = item.sessionCount||''; frequencyDD.set(item.frequency||FREQUENCY_OPTS[0][0]); $('#dFreqCustom').value = item.frequencyCustom||''; syncFreqCustom(); $('#dProgramDuration').value = item.programDuration||'';
    segSet('dReqDoctorSeg', (item.reqDoctor&&item.reqDoctor.required)||'yes'); reqDocMchk.set((item.reqDoctor&&item.reqDoctor.doctors)||[]); syncReqDoc();
    $('#dNurseCount').value = (item.reqNursing&&item.reqNursing.count)||0; nurseMchk.set((item.reqNursing&&item.reqNursing.staff)||[]);
    roomMchk.set(item.roomTypes||[]); equipMchk.set(item.equipment||[]);
    $('#dPrereq').value = (item.prereqTags||[]).join(', '); $('#dCompletionRule').value = item.completionRule||'';
  }
  if(!isTreat){
    $('#dPrep').value=item.prep; $('#dRecovery').value=item.recovery;
    $('#dCleaningBuffer').value = item.cleaningBuffer||''; $('#dReqAssistants').value = item.reqAssistants||0;
    $('#dPreInstructions').value = item.preInstructions||''; $('#dPostInstructions').value = item.postInstructions||''; $('#dFollowupReq').value = item.followupReq||'';
  }
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
  const name=$('#dName').value.trim();
  if(!name){ toast('Please fill the name'); return; }
  const isTreat = drawerKind==='treat';
  const commonExtra = {
    code: $('#dCode').value.trim()||'—', category: $('#dCategory').value, description: $('#dDescription').value.trim()||'—',
    consentReq: segGet('dConsentSeg')==='yes' ? consentMchk.get() : []
  };
  let payload;
  {
    /* the list's "Sessions" and "Required Resources" summary strings are derived from the
       structured fields (the free-text duplicates were removed from the form per BRD §13).
       This block runs for both kinds · a procedure carries every treatment field plus extras. */
    const sessionCount = Number($('#dSessionCount').value)||0;
    const frequency = $('#dFrequency').value;
    const frequencyCustom = $('#dFreqCustom').value.trim();
    const freqText = frequency==='custom' ? frequencyCustom : ((FREQUENCY_OPTS.find(o=>o[0]===frequency)||[])[1]||'').toLowerCase();
    const reqDoctor = { required: segGet('dReqDoctorSeg'), doctors: segGet('dReqDoctorSeg')==='yes' ? reqDocMchk.get() : [] };
    const reqNursing = { count: Number($('#dNurseCount').value)||0, staff: nurseMchk.get() };
    const roomTypes = roomMchk.get(), equipment = equipMchk.get();
    /* Prerequisites is free text; stored as comma-separated tags so the list summary stays the same */
    const prereqTags = $('#dPrereq').value.split(',').map(x=>x.trim()).filter(Boolean);
    const requiredParts = [
      reqDoctor.required==='yes' ? (reqDoctor.doctors.length ? reqDoctor.doctors.join(', ') : 'Doctor') : '',
      reqNursing.staff.length ? reqNursing.staff.join(', ') : (reqNursing.count ? reqNursing.count+' nurse'+(reqNursing.count>1?'s':'') : ''),
      ...roomTypes, ...equipment
    ].filter(Boolean);
    payload = Object.assign({ name, duration: Number($('#dDuration').value)||0,
      sessions: sessionCount ? sessionCount+' session'+(sessionCount>1?'s':'')+(freqText ? ', '+freqText : '') : '—',
      required: requiredParts.length ? requiredParts.join(', ') : '—',
      prereq: prereqTags.length ? prereqTags.join(', ') : '—',
      followup: $('#dFollowup').value.trim()||'—',
      status: segGet('dStatusSeg'), updatedOn: TODAY }, commonExtra, {
      sessionCount, frequency, frequencyCustom: frequency==='custom' ? frequencyCustom : '', programDuration: $('#dProgramDuration').value.trim()||'—',
      reqDoctor, reqNursing, roomTypes, equipment, prereqTags,
      completionRule: $('#dCompletionRule').value.trim()||'—' });
    if(!isTreat){
      /* list's "Practitioners" column = the doctors picked (else nurses, else generic) */
      const practitioners = reqDoctor.required==='yes' && reqDoctor.doctors.length ? reqDoctor.doctors.join(', ')
        : reqNursing.staff.length ? reqNursing.staff.join(', ') : (reqDoctor.required==='yes' ? 'Doctor' : '—');
      Object.assign(payload, {
        prep: Number($('#dPrep').value)||0, recovery: Number($('#dRecovery').value)||0,
        practitioners, required: requiredParts.join(', ')||'—',
        cleaningBuffer: Number($('#dCleaningBuffer').value)||0, reqAssistants: Number($('#dReqAssistants').value)||0,
        preInstructions: $('#dPreInstructions').value.trim()||'—', postInstructions: $('#dPostInstructions').value.trim()||'—',
        followupReq: $('#dFollowupReq').value.trim()||'—' });
    }
  }
  deriveSummary(payload, isTreat); // single source of truth for the row text
  const wasNew = !editingId;
  if(editingId){
    Object.assign(dataset().find(x=>x.id===editingId), payload);
    toast((isTreat?'Treatment':'Procedure') + ' updated');
  } else {
    (isTreat ? TREATMENTS : PROCEDURES).push(Object.assign({id:(isTreat?'tr-':'pr-')+Date.now()}, payload));
    toast((isTreat?'Treatment':'Procedure') + ' added');
  }
  closeDrawer();
  if(wasNew && drawerKind!==activeTab){ $('#tabSeg [data-t="'+drawerKind+'"]').click(); } // show the new record on its tab
  else { renderStats(); applyFilters(); }
});

renderHead();
renderStats();
applyFilters();

/* ---------- row actions overflow ("kebab") menu · same pattern as counters-points.js ----------
   Treatments/procedures carry no locally-tracked usage data (no future sessions/bookings field),
   so Deactivate is a direct status flip here · no dependency-review modal is fabricated. */
let rowMenuCtx = null;
function closeRowMenu(){ $('#rowMenu').classList.remove('show'); rowMenuCtx = null; }
function buildRowMenu(item){
  /* shortcuts straight to the mapping that most often needs attention, then the status flip —
     same shape as counters-points' "Edit Counter Tasks" row action */
  return [
    {action:'mappedServices', label:'Mapped services'},
    {action:'mapStaff', label:'Map Doctors & Staff'},
    {action:'mapRoom', label:'Map Room & Equipment'},
    item.status==='active' ? {action:'deactivate', label:'Deactivate', danger:true} : {action:'activate', label:'Activate'}
  ];
}
function openRowMenu(btn, id){
  const item = dataset().find(x=>x.id===id); if(!item) return;
  rowMenuCtx = id;
  const menu = $('#rowMenu');
  menu.innerHTML = buildRowMenu(item).map(it=>
    '<button type="button" data-action="'+it.action+'"'+(it.danger?' class="danger"':'')+'>'+esc(it.label)+'</button>').join('');
  menu.classList.add('show');
  const r = btn.getBoundingClientRect();
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  let left = r.right - mw; if(left < 8) left = 8;
  let top = r.bottom + 6; if(top + mh > window.innerHeight - 8) top = r.top - mh - 6;
  menu.style.left = left + 'px'; menu.style.top = top + 'px';
}
/* open the edit drawer for this row and land on a specific picker with its panel already open */
function openEditFocus(item, btnId){
  $('[data-edit="'+item.id+'"]').click();
  setTimeout(()=>{
    const b=$('#'+btnId); if(!b) return;
    b.scrollIntoView({block:'center'});
    if(getComputedStyle(b.closest('.fgrp')).display==='none'){ // Required Doctor = No hides the doctor picker
      segSet('dReqDoctorSeg','yes'); syncReqDoc();
    }
    b.click();
  },60);
}
function applyStatus(item, status){
  item.status = status; item.updatedOn = TODAY;
  renderStats(); applyFilters();
  toast(item.name + (status==='active' ? ' activated' : ' deactivated'));
}
/* Deactivation impact review (BRD §1.3): the real, locally-tracked dependency here is the set of
   Services that include this record (SERVICE_LINKS). With none, it's a direct flip · no fabricated
   counts. */
let depPending = null; // () => void, run on "Deactivate anyway"
function serviceDeps(item){
  const srs = SERVICE_LINKS[item.name] || [];
  return SERVICES_MIRROR.filter(s => srs.includes(s.sr));
}
function showDepModal(item, onContinue){
  const deps = serviceDeps(item);
  const kind = activeTab==='treat' ? 'treatment' : 'procedure';
  $('#depTitle').textContent = 'Deactivate ' + item.name + '?';
  $('#depBody').innerHTML = (deps.length
    ? '<p class="dep-intro">Deactivating this ' + kind + ' affects the ' + deps.length + ' service' + (deps.length>1?'s':'') + ' that include' + (deps.length>1?'':'s') + ' it:</p>'
    : '<p class="dep-intro">No service includes this ' + kind + '. It will stop being bookable on its own until it is reactivated.</p>')
    + deps.map(s => '<div class="deprow"><span>'+esc(s.n)+'</span><small>'+esc(s.br||'All branches')+' · Sr #'+s.sr+'</small></div>').join('');
  $('#depHint').innerHTML = deps.length
    ? '<b>Past sessions keep their history.</b> New bookings of these services will no longer include it. If that is not intended, unmap it from the services first.'
    : '';
  $('#depHint').style.display = deps.length ? '' : 'none';
  $('#depContinue').textContent = deps.length ? 'Deactivate anyway' : 'Deactivate';
  depPending = onContinue;
  $('#depScrim').classList.add('show');
}
function closeDepModal(){ $('#depScrim').classList.remove('show'); depPending = null; }
$('#depCancel').addEventListener('click', closeDepModal);
$('#depScrim').addEventListener('click', e=>{ if(e.target.id==='depScrim') closeDepModal(); });
$('#depContinue').addEventListener('click', ()=>{ const fn = depPending; closeDepModal(); if(fn) fn(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#depScrim').classList.contains('show')) closeDepModal(); });
function toggleItemStatus(item){
  /* the row-menu Deactivate always confirms (with the real service list when there is one; a plain
     confirm when there is none) · a destructive row action shouldn't flip silently */
  if(item.status==='active'){ showDepModal(item, ()=>applyStatus(item,'inactive')); return; }
  applyStatus(item, item.status==='active' ? 'inactive' : 'active');
}
$('#tBody').addEventListener('click', e=>{
  const kb = e.target.closest('[data-kebab]'); if(!kb) return;
  e.stopPropagation();
  const id = kb.dataset.kebab;
  if(rowMenuCtx===id){ closeRowMenu(); return; }
  openRowMenu(kb, id);
});
$('#rowMenu').addEventListener('click', e=>{
  const b = e.target.closest('button[data-action]'); if(!b || !rowMenuCtx) return;
  const id = rowMenuCtx, action = b.dataset.action;
  const item = dataset().find(x=>x.id===id);
  closeRowMenu();
  if(!item) return;
  if(action==='mappedServices') openMappedServices(item);
  else if(action==='mapStaff') openEditFocus(item, 'reqDocBtn');
  else if(action==='mapRoom') openEditFocus(item, 'roomBtn');
  else if(action==='activate' || action==='deactivate') toggleItemStatus(item);
});
document.addEventListener('click', e=>{
  if(rowMenuCtx && !e.target.closest('#rowMenu') && !e.target.closest('[data-kebab]')) closeRowMenu();
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && rowMenuCtx) closeRowMenu(); });
document.addEventListener('scroll', closeRowMenu, true);

/* ---------- "Map services" popup: tick the Services that include this treatment/procedure ----------
   Same mapping the Service form edits via "Included treatments & procedures", from the other side. */
let mapCtxName = null;
function renderMapList(){
  const q = $('#mapSearch').value.trim().toLowerCase();
  const picked = new Set(SERVICE_LINKS[mapCtxName] || []);
  const rows = SERVICES_MIRROR.filter(s => !q || s.n.toLowerCase().includes(q));
  $('#mapList').innerHTML = rows.length ? rows.map(s =>
    '<label class="mchk-opt"><input type="checkbox" value="'+s.sr+'" '+(picked.has(s.sr)?'checked':'')+'><span><b>'+esc(s.n)+'</b><small>'+esc(s.br||'All branches')+' · Sr #'+s.sr+'</small></span></label>'
  ).join('') : '<div class="empty"><span>No services match "'+esc(q)+'"</span></div>';
}
function openMappedServices(item){
  mapCtxName = item.name;
  const n = (SERVICE_LINKS[item.name] || []).length;
  $('#mapTitle').textContent = 'Map services · ' + item.name + (n ? ' (' + n + ' mapped)' : '');
  $('#mapSearch').value = '';
  renderMapList();
  $('#mapScrim').classList.add('show');
  $('#mapSearch').focus();
}
function closeMappedServices(){ $('#mapScrim').classList.remove('show'); mapCtxName = null; }
$('#mapSearch').addEventListener('input', renderMapList);
/* keep the tick state across search filtering: update SERVICE_LINKS draft on every change */
$('#mapList').addEventListener('change', e=>{
  const cb = e.target.closest('input[type=checkbox]'); if(!cb || !mapCtxName) return;
  const sr = Number(cb.value);
  const cur = new Set(SERVICE_LINKS[mapCtxName] || []);
  if(cb.checked) cur.add(sr); else cur.delete(sr);
  SERVICE_LINKS[mapCtxName] = [...cur];
});
$('#mapSave').addEventListener('click', ()=>{
  const n = (SERVICE_LINKS[mapCtxName] || []).length;
  toast(mapCtxName + (n ? ' mapped to ' + n + ' service' + (n>1?'s':'') : ' not mapped to any service'));
  closeMappedServices();
});
$('#mapClose').addEventListener('click', closeMappedServices);
$('#mapScrim').addEventListener('click', e=>{ if(e.target.id==='mapScrim') closeMappedServices(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#mapScrim').classList.contains('show')) closeMappedServices(); });
window.addEventListener('resize', closeRowMenu);

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

