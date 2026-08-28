document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

const LAB = [
 {id:'lb-1', name:'HbA1c', testCode:'LAB-HBA1C', panel:'Diabetes Panel', specimen:'Blood', collection:'Fasting not required; 2 mL EDTA vial', resultType:'Numeric', unit:'%', range:'&lt; 5.7 normal', abnormalRule:'Flag if &gt; 6.4%', critical:'Flag if &gt; 10%', verification:true, template:'Standard Numeric Result', attachCat:'Lab Report · Biochemistry', active:true, updatedOn:'12 June 2024'},
 {id:'lb-2', name:'Random Blood Sugar', testCode:'LAB-RBS', panel:'Diabetes Panel', specimen:'Blood', collection:'Random draw; 2 mL fluoride vial', resultType:'Numeric', unit:'mg/dL', range:'70 – 140', abnormalRule:'Flag if outside 70–140', critical:'Flag if &gt; 300 or &lt; 50', verification:true, template:'Standard Numeric Result', attachCat:'Lab Report · Biochemistry', active:true, updatedOn:'12 June 2024'},
 {id:'lb-3', name:'Complete Blood Count (CBC)', testCode:'LAB-CBC', panel:'Hematology Panel', specimen:'Blood', collection:'2 mL EDTA vial', resultType:'Descriptive', unit:'—', range:'Within normal limits', abnormalRule:'Flag if any parameter outside range', critical:'—', verification:true, template:'CBC Panel Result', attachCat:'Lab Report · Hematology', active:true, updatedOn:'12 June 2024'},
 {id:'lb-4', name:'Wound Swab Culture', testCode:'LAB-WSC', panel:'Microbiology Panel', specimen:'Swab', collection:'Sterile swab from wound bed, pre-dressing', resultType:'Text', unit:'—', range:'No growth', abnormalRule:'Flag if any growth reported', critical:'Flag if MRSA detected', verification:true, template:'Culture &amp; Sensitivity Result', attachCat:'Lab Report · Microbiology', active:true, updatedOn:'15 July 2026'},
 {id:'lb-5', name:'ESR', testCode:'LAB-ESR', panel:'Inflammation Panel', specimen:'Blood', collection:'2 mL EDTA vial', resultType:'Numeric', unit:'mm/hr', range:'0 – 20', abnormalRule:'Flag if &gt; 20', critical:'—', verification:false, template:'Standard Numeric Result', attachCat:'Lab Report · Biochemistry', active:true, updatedOn:'12 June 2024'}
];

const INVENTORY = [
 {id:'iv-1', name:'Sterile Gauze Rolls', itemCode:'INV-GAUZE-01', cat:'Consumable', loc:'Utility &amp; Sterile Store', uom:'Roll', onHand:120, reorder:30, batchTracking:false, expiryTracking:true, active:true, updatedOn:'10 August 2026'},
 {id:'iv-2', name:'Debridement Kits', itemCode:'INV-DEBKIT-01', cat:'Consumable', loc:'Procedure Room 1', uom:'Kit', onHand:18, reorder:10, batchTracking:true, expiryTracking:true, active:true, updatedOn:'10 August 2026'},
 {id:'iv-3', name:'Povidone-Iodine Solution', itemCode:'INV-PVI-01', cat:'Consumable', loc:'Dressing Room 1', uom:'Bottle', onHand:8, reorder:5, batchTracking:true, expiryTracking:true, active:true, updatedOn:'12 August 2026'},
 {id:'iv-4', name:'Compression Bandages', itemCode:'INV-COMP-01', cat:'Consumable', loc:'Dressing Room 2', uom:'Roll', onHand:45, reorder:15, batchTracking:false, expiryTracking:false, active:true, updatedOn:'10 August 2026'},
 {id:'iv-5', name:'Sharps Disposal Bins', itemCode:'INV-SHARP-01', cat:'Non-medical Supply', loc:'Procedure Room 1', uom:'Unit', onHand:3, reorder:2, batchTracking:false, expiryTracking:false, active:true, updatedOn:'16 August 2026'}
];

const STOCK_LOCATIONS = [
 {id:'sl-1', name:'Main Store', code:'STORE-MAIN', branch:'Main Campus', dept:'Central Stores', active:true, updatedOn:'01 June 2024'},
 {id:'sl-2', name:'Treatment Store', code:'STORE-TRT', branch:'Main Campus', dept:'Wound Care', active:true, updatedOn:'01 June 2024'},
 {id:'sl-3', name:'OPD Annexe Store', code:'STORE-OPD', branch:'OPD Annexe', dept:'General', active:true, updatedOn:'10 August 2026'},
 {id:'sl-4', name:'Sterile Utility Store', code:'STORE-STR', branch:'Main Campus', dept:'Central Stores', active:false, updatedOn:'14 August 2026'}
];

const BEDS = [
 {id:'bd-1', name:'Bed 1 · Day-care Bay', room:'Day-care Bay', bedLabel:'Bed 1', stayType:'daycare', status:'occupied', patient:'Ramesh Chandra Reddy', admitted:'17 August 2026, 9:30 AM', discharge:'17 August 2026, 4:00 PM', admitReason:'Wound debridement · day-care', dischargeReason:'', updatedOn:'17 August 2026'},
 {id:'bd-2', name:'Bed 2 · Observation Bay', room:'Observation Bay', bedLabel:'Bed 2', stayType:'observation', status:'available', patient:'', admitted:'', discharge:'', admitReason:'', dischargeReason:'Recovered · discharged', updatedOn:'01 June 2024'},
 {id:'bd-3', name:'Bed 3 · Short-Stay Room', room:'Short-Stay Room', bedLabel:'Bed 3', stayType:'shortstay', status:'blocked', patient:'', admitted:'', discharge:'', admitReason:'', dischargeReason:'', updatedOn:'14 August 2026'},
 {id:'bd-4', name:'Bed 4 · Day-care Bay 2', room:'Day-care Bay', bedLabel:'Bed 4', stayType:'daycare', status:'available', patient:'', admitted:'', discharge:'', admitReason:'', dischargeReason:'Recovered · discharged', updatedOn:'16 August 2026'}
];

const STAY_TYPES = { daycare:'Day-care', observation:'Observation', shortstay:'Short Stay', inpatient:'Inpatient' };
const BED_STATUS = { available:{n:'Available',cls:'on'}, occupied:{n:'Occupied',cls:'warn'}, blocked:{n:'Blocked',cls:''} };

const PHARM_LOCATIONS = [
 {id:'ph-1', name:'Main Pharmacy Counter', code:'PHARM-MAIN', branch:'Main Campus', active:true, updatedOn:'01 June 2024'},
 {id:'ph-2', name:'OPD Annexe Pharmacy Counter', code:'PHARM-OPD', branch:'OPD Annexe', active:true, updatedOn:'10 August 2026'},
 {id:'ph-3', name:'Madhurawada Dispensing Point', code:'PHARM-MDW', branch:'Madhurawada Branch', active:false, updatedOn:'14 August 2026'}
];

/* reference only · the medication itself is owned by medication-config.html, never edited from here */
const MED_AVAILABILITY = [
 {id:'ma-1', name:'Amoxicillin-Clavulanate 625mg', branch:'Main Campus', available:true, updatedOn:'12 June 2024'},
 {id:'ma-2', name:'Amoxicillin-Clavulanate 625mg', branch:'OPD Annexe', available:false, updatedOn:'10 August 2026'},
 {id:'ma-3', name:'Silver Sulfadiazine Cream', branch:'Main Campus', available:true, updatedOn:'12 June 2024'},
 {id:'ma-4', name:'Povidone-Iodine Solution', branch:'Madhurawada Branch', available:true, updatedOn:'14 August 2026'}
];

const DISPENSING_UNITS = [
 {id:'du-1', name:'Tablet', code:'TAB', active:true, updatedOn:'01 June 2024'},
 {id:'du-2', name:'Capsule', code:'CAP', active:true, updatedOn:'01 June 2024'},
 {id:'du-3', name:'Strip (10s)', code:'STRIP10', active:true, updatedOn:'01 June 2024'},
 {id:'du-4', name:'Bottle', code:'BTL', active:true, updatedOn:'01 June 2024'},
 {id:'du-5', name:'Vial', code:'VIAL', active:true, updatedOn:'01 June 2024'},
 {id:'du-6', name:'ml', code:'ML', active:true, updatedOn:'01 June 2024'},
 {id:'du-7', name:'mg', code:'MG', active:false, updatedOn:'14 August 2026'}
];

/* room/area identity lives in rooms-areas.html · this only maps support capability against that area name */
const PROC_AREAS = [
 {id:'pa-1', name:'Wound Debridement Bay', treatments:'Wound Care, Diabetic Foot', procedures:'Sharp debridement, Surgical debridement', staffCap:'Wound-care certified doctor', equip:'Debridement kit, dressing trolley, sharps disposal', capacity:1, blocked:false, updatedOn:'20 July 2026'},
 {id:'pa-2', name:'Dressing Change Station A', treatments:'Wound Care', procedures:'Dressing change, Compression bandaging', staffCap:'Wound-care certified nurse', equip:'Dressing trolley, sterile kit', capacity:2, blocked:false, updatedOn:'20 July 2026'},
 {id:'pa-3', name:'Dressing Change Station B', treatments:'Wound Care', procedures:'Dressing change', staffCap:'Wound-care certified nurse', equip:'Dressing trolley, sterile kit', capacity:2, blocked:false, updatedOn:'20 July 2026'},
 {id:'pa-4', name:'Progress Photography Station', treatments:'Wound Care, Dermatology', procedures:'Wound photography, Progress documentation', staffCap:'Any clinical staff', equip:'Camera / tablet, consent record on file', capacity:1, blocked:true, updatedOn:'14 August 2026'}
];

let activeTab = 'lab';
let activeSub = 'items'; // meaning depends on activeTab: inv -> items|loc, pharm -> loc|avail|unit

const SUB_CONFIG = {
  inv: [{v:'items',l:'Items'},{v:'loc',l:'Stock Locations'}],
  pharm: [{v:'loc',l:'Pharmacy Locations'},{v:'avail',l:'Branch Availability'},{v:'unit',l:'Dispensing Units'}]
};
function mode(){
  if(activeTab==='inv') return 'inv-'+activeSub;
  if(activeTab==='pharm') return 'pharm-'+activeSub;
  return activeTab; // lab | bed | proc
}

const NAME_LBL = { lab:'Test name', 'inv-items':'Item name', 'inv-loc':'Location name', bed:'Bed name', 'pharm-loc':'Pharmacy location name', 'pharm-avail':'Medication (reference)', 'pharm-unit':'Unit name', proc:'Area name' };
const NEW_BTN_TXT = { lab:'Add test', 'inv-items':'Add item', 'inv-loc':'Add location', bed:'Add bed', 'pharm-loc':'Add pharmacy location', 'pharm-avail':'Add availability', 'pharm-unit':'Add unit', proc:'Add area capability' };
const ADD_SUB = { lab:'New lab test', 'inv-items':'New inventory item', 'inv-loc':'New stock location', bed:'New stay bed', 'pharm-loc':'New pharmacy location', 'pharm-avail':'New branch availability mapping', 'pharm-unit':'New dispensing unit', proc:'New area capability mapping' };
const EDIT_NOUN = { lab:'test', 'inv-items':'item', 'inv-loc':'location', bed:'bed', 'pharm-loc':'pharmacy location', 'pharm-avail':'availability mapping', 'pharm-unit':'unit', proc:'area capability' };
const ID_PREFIX = { lab:'lb-', 'inv-items':'iv-', 'inv-loc':'sl-', bed:'bd-', 'pharm-loc':'ph-', 'pharm-avail':'ma-', 'pharm-unit':'du-', proc:'pa-' };

function dataset(){
  const m = mode();
  if(m==='lab') return LAB;
  if(m==='inv-items') return INVENTORY;
  if(m==='inv-loc') return STOCK_LOCATIONS;
  if(m==='bed') return BEDS;
  if(m==='pharm-loc') return PHARM_LOCATIONS;
  if(m==='pharm-avail') return MED_AVAILABILITY;
  if(m==='pharm-unit') return DISPENSING_UNITS;
  return PROC_AREAS; // proc
}

function renderHead(){
  const heads = {
    'lab': '<tr><th>Test</th><th>Code</th><th>Specimen</th><th>Unit</th><th>Reference Range</th><th>Critical Rule</th><th>Status</th><th style="text-align:right">Actions</th></tr>',
    'inv-items': '<tr><th>Item</th><th>Code</th><th>Category</th><th>Stock Location</th><th>On Hand</th><th>Reorder At</th><th>Status</th><th style="text-align:right">Actions</th></tr>',
    'inv-loc': '<tr><th>Location</th><th>Code</th><th>Branch</th><th>Department</th><th>Status</th><th style="text-align:right">Actions</th></tr>',
    'bed': '<tr><th>Bed</th><th>Room</th><th>Stay Type</th><th>Status</th><th>Current Patient</th><th>Admitted</th><th style="text-align:right">Actions</th></tr>',
    'pharm-loc': '<tr><th>Pharmacy Location</th><th>Code</th><th>Branch</th><th>Status</th><th style="text-align:right">Actions</th></tr>',
    'pharm-avail': '<tr><th>Medication (reference)</th><th>Branch</th><th>Available</th><th style="text-align:right">Actions</th></tr>',
    'pharm-unit': '<tr><th>Dispensing Unit</th><th>Code</th><th>Status</th><th style="text-align:right">Actions</th></tr>',
    'proc': '<tr><th>Area</th><th>Treatments Supported</th><th>Procedures Supported</th><th>Staff Capability</th><th>Equipment</th><th>Capacity</th><th>Status</th><th style="text-align:right">Actions</th></tr>'
  };
  $('#tblHead').innerHTML = heads[mode()];
}
function renderRow(e){
  const m = mode();
  const activeChip = a => a!==false ? '<span class="chip ok">Active</span>' : '<span class="chip mute">Inactive</span>';
  if(m==='lab'){
    return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.testCode||'—')}</span></td><td><span class="s">${esc(e.specimen)}</span></td><td><span class="s">${esc(e.unit)}</span></td>
      <td><span class="s">${e.range}</span></td><td>${e.critical!=='—'?'<span class="chip bad">'+e.critical+'</span>':'<span class="s">—</span>'}</td>
      <td>${activeChip(e.active)}</td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  if(m==='inv-items'){
    const low = e.onHand <= e.reorder;
    return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.itemCode||'—')}</span></td><td><span class="s">${e.cat}</span></td><td><span class="s">${e.loc}</span></td>
      <td>${low?'<span class="chip warn">'+e.onHand+' '+esc(e.uom)+' · reorder</span>':'<span class="s">'+e.onHand+' '+esc(e.uom)+'</span>'}</td>
      <td><span class="s">${e.reorder} ${esc(e.uom)}</span></td>
      <td>${activeChip(e.active)}</td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  if(m==='inv-loc'){
    return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.code)}</span></td><td><span class="s">${esc(e.branch)}</span></td><td><span class="s">${esc(e.dept)}</span></td>
      <td>${activeChip(e.active)}</td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  if(m==='bed'){
    const st = BED_STATUS[e.status];
    return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.room||'—')}</span></td><td><span class="s">${STAY_TYPES[e.stayType]}</span></td>
      <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
      <td><span class="s">${e.patient?esc(e.patient):'—'}</span></td><td><span class="s">${e.admitted||'—'}</span></td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  if(m==='pharm-loc'){
    return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.code)}</span></td><td><span class="s">${esc(e.branch)}</span></td>
      <td>${activeChip(e.active)}</td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  if(m==='pharm-avail'){
    return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.branch)}</span></td>
      <td>${e.available?'<span class="chip ok">Available</span>':'<span class="chip mute">Not available</span>'}</td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  if(m==='pharm-unit'){
    return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.code)}</span></td>
      <td>${activeChip(e.active)}</td>
      <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
  }
  return `<tr><td><b>${esc(e.name)}</b></td><td><span class="s">${esc(e.treatments)}</span></td><td><span class="s">${esc(e.procedures)}</span></td>
    <td><span class="s">${esc(e.staffCap)}</span></td><td><span class="s">${esc(e.equip)}</span></td><td><span class="s">${e.capacity}</span></td>
    <td>${e.blocked?'<span class="chip bad">Blocked</span>':'<span class="chip ok">Available</span>'}</td>
    <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td></tr>`;
}
function renderStats(){
  const list = dataset(); const m = mode();
  if(m==='lab'){
    $('#stTotalLbl').textContent='Total tests'; $('#stActiveLbl').textContent='Configured'; $('#stWarnLbl').textContent='Critical rules';
    $('#stTotal').textContent=list.length; $('#stActive').textContent=list.length; $('#stWarn').textContent=list.filter(e=>e.critical!=='—').length;
  } else if(m==='inv-items'){
    $('#stTotalLbl').textContent='Total items'; $('#stActiveLbl').textContent='Well-stocked'; $('#stWarnLbl').textContent='Needs reorder';
    $('#stTotal').textContent=list.length; $('#stActive').textContent=list.filter(e=>e.onHand>e.reorder).length; $('#stWarn').textContent=list.filter(e=>e.onHand<=e.reorder).length;
  } else if(m==='inv-loc'){
    $('#stTotalLbl').textContent='Total locations'; $('#stActiveLbl').textContent='Active'; $('#stWarnLbl').textContent='Inactive';
    $('#stTotal').textContent=list.length; $('#stActive').textContent=list.filter(e=>e.active!==false).length; $('#stWarn').textContent=list.filter(e=>e.active===false).length;
  } else if(m==='bed'){
    $('#stTotalLbl').textContent='Total beds'; $('#stActiveLbl').textContent='Available'; $('#stWarnLbl').textContent='Occupied / Blocked';
    $('#stTotal').textContent=list.length; $('#stActive').textContent=list.filter(e=>e.status==='available').length; $('#stWarn').textContent=list.filter(e=>e.status!=='available').length;
  } else if(m==='pharm-loc'){
    $('#stTotalLbl').textContent='Total pharmacy points'; $('#stActiveLbl').textContent='Active'; $('#stWarnLbl').textContent='Inactive';
    $('#stTotal').textContent=list.length; $('#stActive').textContent=list.filter(e=>e.active!==false).length; $('#stWarn').textContent=list.filter(e=>e.active===false).length;
  } else if(m==='pharm-avail'){
    $('#stTotalLbl').textContent='Total mappings'; $('#stActiveLbl').textContent='Available'; $('#stWarnLbl').textContent='Not available';
    $('#stTotal').textContent=list.length; $('#stActive').textContent=list.filter(e=>e.available).length; $('#stWarn').textContent=list.filter(e=>!e.available).length;
  } else if(m==='pharm-unit'){
    $('#stTotalLbl').textContent='Total units'; $('#stActiveLbl').textContent='Active'; $('#stWarnLbl').textContent='Inactive';
    $('#stTotal').textContent=list.length; $('#stActive').textContent=list.filter(e=>e.active!==false).length; $('#stWarn').textContent=list.filter(e=>e.active===false).length;
  } else {
    $('#stTotalLbl').textContent='Total areas'; $('#stActiveLbl').textContent='Available'; $('#stWarnLbl').textContent='Blocked';
    $('#stTotal').textContent=list.length; $('#stActive').textContent=list.filter(e=>!e.blocked).length; $('#stWarn').textContent=list.filter(e=>e.blocked).length;
  }
}
function applyFilters(){
  const q = $('#sSearch').value.trim().toLowerCase();
  const list = dataset().filter(e => !q || e.name.toLowerCase().includes(q));
  renderList(list);
}
function renderList(list){
  const full = dataset();
  const body = $('#sBody');
  if(!list.length){
    body.innerHTML=''; $('#sEmpty').style.display='block';
    $('#sFoot').textContent = `Showing 0 of ${full.length}`;
    return;
  }
  $('#sEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#sFoot').textContent = `Showing ${list.length} of ${full.length}`;
}
$('#sSearch').addEventListener('input', applyFilters);

function renderSubSeg(){
  const cfg = SUB_CONFIG[activeTab];
  if(!cfg){ $('#subSegWrap').style.display='none'; $('#subSeg').innerHTML=''; return; }
  $('#subSegWrap').style.display='';
  $('#subSeg').innerHTML = cfg.map(o=>`<button type="button" data-sub="${o.v}" class="${o.v===activeSub?'on':''}">${o.l}</button>`).join('');
}
$('#subSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  activeSub = b.dataset.sub;
  $$('#subSeg button').forEach(x=>x.classList.toggle('on', x===b));
  $('#newBtnTxt').textContent = NEW_BTN_TXT[mode()];
  $('#sSearch').value='';
  renderHead(); renderStats(); applyFilters();
});

$('#tabSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  activeTab = b.dataset.t;
  activeSub = activeTab==='inv' ? 'items' : activeTab==='pharm' ? 'loc' : '';
  $$('#tabSeg button').forEach(x=>x.classList.toggle('on', x===b));
  $('#newBtnTxt').textContent = NEW_BTN_TXT[mode()];
  $('#pharmNote').style.display = activeTab==='pharm' ? '' : 'none';
  $('#procNote').style.display = activeTab==='proc' ? '' : 'none';
  $('#sSearch').value='';
  renderSubSeg(); renderHead(); renderStats(); applyFilters();
});

function showGroupsFor(m){
  $('#labOnlyGroup').style.display = m==='lab' ? '' : 'none';
  $('#invOnlyGroup').style.display = m==='inv-items' ? '' : 'none';
  $('#invLocOnlyGroup').style.display = m==='inv-loc' ? '' : 'none';
  $('#bedOnlyGroup').style.display = m==='bed' ? '' : 'none';
  $('#pharmLocOnlyGroup').style.display = m==='pharm-loc' ? '' : 'none';
  $('#pharmAvailOnlyGroup').style.display = m==='pharm-avail' ? '' : 'none';
  $('#pharmUnitOnlyGroup').style.display = m==='pharm-unit' ? '' : 'none';
  $('#procOnlyGroup').style.display = m==='proc' ? '' : 'none';
}

let editingId = null;
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId, v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b ? b.dataset.v : null; }
$$('#dStayTypeSeg,#dBedStatusSeg').forEach(seg=>{
  seg.addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet(seg.id, b.dataset.v); });
});

/* Branch is read-only in these forms (Inventory Location / Pharmacy Location / Medication
   Availability) · set from whichever branch the page's header switcher (ctxBrDD) is currently on
   when adding, or from the record's own branch when editing. */
function setBranchFixed(idBase, v){ $('#'+idBase+'FixedLabel').textContent = v; $('#'+idBase).value = v; }

$('#newBtn').addEventListener('click', ()=>{
  editingId = null;
  const m = mode();
  $('#dNameLbl').textContent = NAME_LBL[m];
  $('#dTitle').textContent = NEW_BTN_TXT[m];
  $('#dSub').textContent = ADD_SUB[m];
  showGroupsFor(m);
  $('#dName').value='';
  $('#dTestCode').value=''; $('#dPanel').value=''; $('#dSpecimen').value=''; $('#dCollection').value=''; $('#dResultType').value='Numeric';
  $('#dUnit').value=''; $('#dRange').value=''; $('#dAbnormal').value=''; $('#dCritical').value=''; $('#dTemplate').value='';
  $('#dAttachCat').value='Lab Report · Biochemistry'; $('#dVerification').checked=true; $('#dLabActive').checked=true;
  $('#dItemCode').value=''; $('#dCat').value=''; $('#dLoc').value=''; $('#dUOM').value=''; $('#dOnHand').value=''; $('#dReorder').value='';
  $('#dBatchTracking').checked=false; $('#dExpiryTracking').checked=false; $('#dInvActive').checked=true;
  $('#dLocCode').value=''; setBranchFixed('dLocBranch', ctxBrDD.value || 'Main Campus'); $('#dLocDept').value=''; $('#dLocActive').checked=true;
  $('#dBedRoom').value=''; $('#dBedLabel').value=''; $('#dPatient').value=''; $('#dAdmitted').value=''; $('#dDischarge').value='';
  $('#dAdmitReason').value=''; $('#dDischargeReason').value='';
  $('#dPharmLocCode').value=''; setBranchFixed('dPharmLocBranch', ctxBrDD.value || 'Main Campus'); $('#dPharmLocActive').checked=true;
  setBranchFixed('dAvailBranch', ctxBrDD.value || 'Main Campus'); $('#dAvailYes').checked=true;
  $('#dUnitCode').value=''; $('#dUnitActive').checked=true;
  $('#dProcTreatments').value=''; $('#dProcProcedures').value=''; $('#dProcStaffCap').value=''; $('#dProcEquip').value=''; $('#dProcCapacity').value=''; $('#dProcBlocked').checked=false;
  segSet('dStayTypeSeg','daycare'); segSet('dBedStatusSeg','available');
  $('#dMetaWrap').style.display='none';
  openDrawer();
});
$('#sBody').addEventListener('click', e=>{
  const b=e.target.closest('[data-edit]'); if(!b) return;
  const item = dataset().find(x=>x.id===b.dataset.edit); if(!item) return;
  editingId = item.id;
  const m = mode();
  $('#dNameLbl').textContent = NAME_LBL[m];
  $('#dTitle').textContent = 'Edit ' + EDIT_NOUN[m];
  $('#dSub').textContent = item.name;
  showGroupsFor(m);
  $('#dName').value = item.name;
  if(m==='lab'){
    $('#dTestCode').value=item.testCode||''; $('#dPanel').value=item.panel||''; $('#dSpecimen').value=item.specimen; $('#dCollection').value=item.collection||'';
    $('#dResultType').value=item.resultType||'Numeric'; $('#dUnit').value=item.unit; $('#dRange').value=item.range; $('#dAbnormal').value=item.abnormalRule||'';
    $('#dCritical').value=item.critical; $('#dTemplate').value=item.template||''; $('#dAttachCat').value=item.attachCat||'Lab Report · Biochemistry';
    $('#dVerification').checked=item.verification!==false; $('#dLabActive').checked=item.active!==false;
  } else if(m==='inv-items'){
    $('#dItemCode').value=item.itemCode||''; $('#dCat').value=item.cat; $('#dLoc').value=item.loc; $('#dUOM').value=item.uom; $('#dOnHand').value=item.onHand; $('#dReorder').value=item.reorder;
    $('#dBatchTracking').checked=!!item.batchTracking; $('#dExpiryTracking').checked=!!item.expiryTracking; $('#dInvActive').checked=item.active!==false;
  } else if(m==='inv-loc'){
    $('#dLocCode').value=item.code; setBranchFixed('dLocBranch', item.branch); $('#dLocDept').value=item.dept; $('#dLocActive').checked=item.active!==false;
  } else if(m==='bed'){
    $('#dBedRoom').value=item.room||''; $('#dBedLabel').value=item.bedLabel||'';
    segSet('dStayTypeSeg', item.stayType); segSet('dBedStatusSeg', item.status);
    $('#dPatient').value=item.patient; $('#dAdmitted').value=item.admitted; $('#dDischarge').value=item.discharge;
    $('#dAdmitReason').value=item.admitReason||''; $('#dDischargeReason').value=item.dischargeReason||'';
  } else if(m==='pharm-loc'){
    $('#dPharmLocCode').value=item.code; setBranchFixed('dPharmLocBranch', item.branch); $('#dPharmLocActive').checked=item.active!==false;
  } else if(m==='pharm-avail'){
    setBranchFixed('dAvailBranch', item.branch); $('#dAvailYes').checked=!!item.available;
  } else if(m==='pharm-unit'){
    $('#dUnitCode').value=item.code; $('#dUnitActive').checked=item.active!==false;
  } else {
    $('#dProcTreatments').value=item.treatments; $('#dProcProcedures').value=item.procedures; $('#dProcStaffCap').value=item.staffCap;
    $('#dProcEquip').value=item.equip; $('#dProcCapacity').value=item.capacity; $('#dProcBlocked').checked=!!item.blocked;
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
  const m = mode();
  let payload;
  if(m==='lab') payload = { name, testCode: $('#dTestCode').value.trim()||'—', panel: $('#dPanel').value.trim()||'—', specimen: $('#dSpecimen').value.trim()||'—',
    collection: $('#dCollection').value.trim()||'—', resultType: $('#dResultType').value, unit: $('#dUnit').value.trim()||'—', range: esc($('#dRange').value.trim())||'—',
    abnormalRule: esc($('#dAbnormal').value.trim())||'—', critical: esc($('#dCritical').value.trim())||'—', template: $('#dTemplate').value.trim()||'—',
    attachCat: $('#dAttachCat').value, verification: $('#dVerification').checked, active: $('#dLabActive').checked, updatedOn: TODAY };
  else if(m==='inv-items') payload = { name, itemCode: $('#dItemCode').value.trim()||'—', cat: $('#dCat').value.trim()||'—', loc: $('#dLoc').value.trim()||'—',
    uom: $('#dUOM').value.trim()||'—', onHand: Number($('#dOnHand').value)||0, reorder: Number($('#dReorder').value)||0,
    batchTracking: $('#dBatchTracking').checked, expiryTracking: $('#dExpiryTracking').checked, active: $('#dInvActive').checked, updatedOn: TODAY };
  else if(m==='inv-loc') payload = { name, code: $('#dLocCode').value.trim()||'—', branch: $('#dLocBranch').value, dept: $('#dLocDept').value.trim()||'—', active: $('#dLocActive').checked, updatedOn: TODAY };
  else if(m==='bed') payload = { name, room: $('#dBedRoom').value.trim()||'—', bedLabel: $('#dBedLabel').value.trim()||'—', stayType: segGet('dStayTypeSeg'), status: segGet('dBedStatusSeg'),
    patient: $('#dPatient').value.trim(), admitted: $('#dAdmitted').value.trim(), discharge: $('#dDischarge').value.trim(),
    admitReason: $('#dAdmitReason').value.trim(), dischargeReason: $('#dDischargeReason').value.trim(), updatedOn: TODAY };
  else if(m==='pharm-loc') payload = { name, code: $('#dPharmLocCode').value.trim()||'—', branch: $('#dPharmLocBranch').value, active: $('#dPharmLocActive').checked, updatedOn: TODAY };
  else if(m==='pharm-avail') payload = { name, branch: $('#dAvailBranch').value, available: $('#dAvailYes').checked, updatedOn: TODAY };
  else if(m==='pharm-unit') payload = { name, code: $('#dUnitCode').value.trim()||'—', active: $('#dUnitActive').checked, updatedOn: TODAY };
  else payload = { name, treatments: $('#dProcTreatments').value.trim()||'—', procedures: $('#dProcProcedures').value.trim()||'—', staffCap: $('#dProcStaffCap').value.trim()||'—',
    equip: $('#dProcEquip').value.trim()||'—', capacity: Number($('#dProcCapacity').value)||1, blocked: $('#dProcBlocked').checked, updatedOn: TODAY };

  if(editingId){
    Object.assign(dataset().find(x=>x.id===editingId), payload);
    toast('Updated');
  } else {
    dataset().push(Object.assign({id:ID_PREFIX[m]+Date.now()}, payload));
    toast('Added');
  }
  closeDrawer();
  renderStats(); applyFilters();
});

renderSubSeg();
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

