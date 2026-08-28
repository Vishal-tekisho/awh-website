document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '17 August 2026';

const STATUS = { active:{n:'Active',cls:'on'}, inactive:{n:'Inactive',cls:''} };
const BRANCHES = ['Main Campus','OPD Annexe','Madhurawada Branch'];
const TYPES = { reception:'Reception', registration:'Registration', helpdesk:'Help Desk', labcollection:'Lab Collection', pharmacy:'Pharmacy', other:'Other (approved)' };
const DEPARTMENTS = ['Administration','OPD','Reception','Billing','Laboratory','Pharmacy','Wound Care','Diabetic Foot','Dermatology','General Surgery','Plastic Surgery','Physiotherapy','Dietetics','ENT'];
/* Counter Tasks · deliberately NOT called "Services": these are front-desk/administrative tasks a
   counter can complete for a walk-in (Registration, Billing Enquiry, coordinating a dressing…), a
   different concept from the clinical service catalogue on services-consultation-types.html, so it
   needs its own name to avoid confusion between the two. Admin-configurable, not hard-coded · same
   "add new option inline" pattern as Counter Type. */
let COUNTER_TASKS = ['Initial Consultation','Follow-up Review','Registration','Appointment Check-in',
  'Billing Enquiry','Prescription Billing','Medicine Dispensing','Wound Dressing','Debridement',
  'Lab Sample Collection','Document Collection','Report Handover','General Enquiry'];
const hhmm = v => { if(!v) return '—'; const [h,m] = v.split(':').map(Number);
  return ((h%12)||12) + ':' + String(m).padStart(2,'0') + ' ' + (h<12?'AM':'PM'); };

const COUNTERS = [
 {id:'ct-1', name:'Counter 1 · Registration', code:'CT-01', type:'registration', hoursOpen:'09:00', hoursClose:'19:00', counterTasks:['Registration','Appointment Check-in'], branch:'Main Campus', dept:'OPD', status:'active', updatedOn:'02 June 2024'},
 {id:'ct-2', name:'Counter 2 · Billing & Records', code:'CT-02', type:'other', hoursOpen:'09:00', hoursClose:'19:00', counterTasks:['Billing Enquiry','Document Collection','Report Handover'], branch:'Main Campus', dept:'Billing', status:'active', updatedOn:'02 June 2024'},
 {id:'ct-3', name:'Counter 3 · Enquiry', code:'CT-03', type:'helpdesk', hoursOpen:'09:00', hoursClose:'13:00', counterTasks:['General Enquiry','Wound Dressing'], branch:'Main Campus', dept:'OPD', status:'active', updatedOn:'15 July 2026'},
 {id:'ct-4', name:'Counter 4 · Appointment Check-in', code:'CT-04', type:'reception', hoursOpen:'09:00', hoursClose:'19:00', counterTasks:['Appointment Check-in'], branch:'Main Campus', dept:'OPD', status:'inactive', updatedOn:'10 August 2026'},
 {id:'ct-5', name:'Pharmacy Counter', code:'CT-05', type:'pharmacy', hoursOpen:'09:00', hoursClose:'20:00', counterTasks:['Medicine Dispensing','Prescription Billing'], branch:'Main Campus', dept:'Pharmacy', status:'active', updatedOn:'20 August 2026'},
 {id:'ct-6', name:'Cafeteria Counter', code:'CT-06', type:'other', hoursOpen:'07:00', hoursClose:'21:00', counterTasks:[], branch:'Main Campus', dept:'Administration', status:'active', updatedOn:'20 August 2026'}
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
  return { set:v=>setVal(v,true), get:()=>hidden.value, setOptions:(o2)=>{ opts=o2; panel.innerHTML = opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+v+'">'+l+'</button>').join(''); setVal(opts[0][0], true); } };
}
document.addEventListener('click', ()=>$$('.f.fsel').forEach(x=>x.classList.remove('open')));

/* ---------- multi-select checklist with search ("multi-select chips") ---------- */
function initMchk(rootId, btnId, panelId, chipsId, vocab, placeholder, searchable){
  const root=$('#'+rootId), btn=$('#'+btnId), panel=$('#'+panelId), chipsEl=$('#'+chipsId);
  let selected = [];
  let extraHTML = '', onRerender = null; // optional "add a new option" row + its listener re-binder,
                                          // re-applied after every panel rebuild (setVocab/set both rebuild)
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
      // filters by hiding (not removing) non-matching rows, so already-ticked checkboxes
      // outside the current search text still count when the panel closes / form saves
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
  });
  chipsEl.addEventListener('click', e=>{
    const b=e.target.closest('[data-rm]'); if(!b) return;
    selected = selected.filter(v=>v!==b.dataset.rm);
    renderChips(); renderPanel();
  });
  return {
    set(arr){ selected = Array.isArray(arr) ? arr.slice() : []; renderPanel(); renderChips(); },
    get(){ return selected.slice(); },
    setVocab(v){ vocab = v; renderPanel(); renderChips(); },
    setExtra(html, rerenderFn){ extraHTML = html; onRerender = rerenderFn; renderPanel(); }
  };
}
document.addEventListener('click', ()=>$$('.mchk').forEach(x=>x.classList.remove('open')));

const statDD = initFsel('statWrap','statBtn','statPanel','fStat',
  [['','All statuses'],['active','Active'],['inactive','Inactive']], applyFilters);
const typeDD = initFsel('typeWrap','typeBtn','typePanel','fType',
  [['','All types'], ...Object.entries(TYPES)], applyFilters);
/* Branch is read-only in this form · set from whichever branch the page's header switcher
   (ctxBrDD) is currently on when adding, or from the record's own branch when editing. */
function setDBranch(v){ $('#dBranchFixedLabel').textContent = v; $('#dBranch').value = v; }
const dServicesMchk = initMchk('dServicesMchk','dServicesBtn','dServicesPanel','dServicesChips', Object.fromEntries(COUNTER_TASKS.map(s=>[s,s])), 'Select counter tasks…', true);
/* Counter Tasks is Admin-configured, not hard-coded · the panel itself lets the Admin add a new
   task inline (same pattern as Counter Type / Room Capability elsewhere in the app). */
(function setupCounterTaskAddRow(){
  const rowHTML = '<div class="fseladdrow"><input type="text" placeholder="Add a new task…" id="dTaskNewInput">'
    + '<button type="button" id="dTaskAddBtn" title="Add task"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div>';
  const bind = () => {
    const input = $('#dTaskNewInput'), addBtn = $('#dTaskAddBtn');
    if(!input || !addBtn) return;
    const commit = () => {
      const label = input.value.trim();
      if(!label) return;
      if(!COUNTER_TASKS.some(t=>t.toLowerCase()===label.toLowerCase())) COUNTER_TASKS.push(label);
      dServicesMchk.setVocab(Object.fromEntries(COUNTER_TASKS.map(s=>[s,s])));
      toast('"'+label+'" added to counter tasks');
    };
    addBtn.addEventListener('click', e=>{ e.stopPropagation(); commit(); });
    input.addEventListener('click', e=>e.stopPropagation());
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(); } });
  };
  dServicesMchk.setExtra(rowHTML, bind);
})();
const dTypeDD = initFsel('dTypeWrap','dTypeBtn','dTypePanel','dType', Object.entries(TYPES));
const dDeptDD = initFsel('dDeptWrap','dDeptBtn','dDeptPanel','dDept', DEPARTMENTS.map(d=>[d,d]));

/* Counter Type is Admin-configured, not hard-coded · the dropdown itself lets the Admin add a new
   type on the spot, same "configuration-first, don't hard-code" pattern used for Department unit
   subtypes elsewhere (roles-departments.html). A new type also becomes selectable in the page-level
   Type filter above, so counters saved with it can still be found. */
function appendAddTypeRow(){
  const panel = $('#dTypePanel');
  const row = document.createElement('div');
  row.className = 'fseladdrow';
  row.innerHTML = '<input type="text" placeholder="Add a new type…" id="dTypeNewInput">'
    + '<button type="button" id="dTypeAddBtn" title="Add type"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>';
  panel.appendChild(row);
  const input = $('#dTypeNewInput');
  const commit = () => {
    const label = input.value.trim();
    if(!label) return;
    const existing = Object.entries(TYPES).find(([,l])=>l.toLowerCase()===label.toLowerCase());
    let key = existing ? existing[0] : label.toLowerCase().replace(/[^a-z0-9]+/g,'') || 'type';
    if(!existing){
      while(TYPES[key]) key += 'x';
      TYPES[key] = label;
    }
    dTypeDD.setOptions(Object.entries(TYPES));
    appendAddTypeRow();
    dTypeDD.set(key);
    const curFilter = typeDD.get();
    typeDD.setOptions([['','All types'], ...Object.entries(TYPES)]);
    typeDD.set(curFilter);
    toast('"'+label+'" added to counter types');
  };
  $('#dTypeAddBtn').addEventListener('click', e=>{ e.stopPropagation(); commit(); });
  input.addEventListener('click', e=>e.stopPropagation());
  input.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); commit(); } });
}
appendAddTypeRow();

/* the list only shows counters for whichever branch the header context switcher (ctxBrDD below)
   is currently on · same branch new records default to. */
let branchFilter = 'Main Campus';
function inBranch(){ return COUNTERS.filter(c=>!c.branch||c.branch===branchFilter); }
function renderStats(){
  const list = inBranch();
  $('#stTotal').textContent = list.length;
  $('#stActive').textContent = list.filter(c=>c.status==='active').length;
}
function renderRow(c){
  const st = STATUS[c.status];
  return `<tr>
    <td><b>${esc(c.name)}</b><span class="s">${esc(c.code||'—')}</span></td>
    <td><span class="chip mute">${esc(TYPES[c.type]||'—')}</span></td>
    <td><span class="s">${hhmm(c.hoursOpen)} – ${hhmm(c.hoursClose)}</span></td>
    <td><span class="s">${esc((c.counterTasks||[]).join(', ')) || '—'}</span></td>
    <td><span class="s">${esc(c.dept||'—')}</span></td>
    <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td style="text-align:right"><span style="display:inline-flex;gap:6px;align-items:center"><button class="mini" data-edit="${c.id}">Edit</button><button class="kebab-btn" data-kebab="${c.id}" title="More actions" aria-label="More actions">&#8942;</button></span></td>
  </tr>`;
}
function applyFilters(){
  const q = $('#cSearch').value.trim().toLowerCase();
  const stat = statDD.get(), type = typeDD.get();
  const list = inBranch().filter(c => (!q || c.name.toLowerCase().includes(q)) && (!stat || c.status===stat) && (!type || c.type===type));
  renderList(list);
}
function renderList(list){
  const body = $('#cBody');
  const total = inBranch().length;
  if(!list.length){
    body.innerHTML=''; $('#cEmpty').style.display='block';
    $('#cFoot').textContent = `Showing 0 of ${total} counters`;
    return;
  }
  $('#cEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#cFoot').textContent = `Showing ${list.length} of ${total} counters`;
}
$('#cSearch').addEventListener('input', applyFilters);

let editingId = null;
function openDrawer(){ $('#scrim').classList.add('show'); $('#drawer').classList.add('show'); }
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); editingId=null; }
function segSet(segId, v){ $$('#'+segId+' button').forEach(b=>b.classList.toggle('on', b.dataset.v===v)); }
function segGet(segId){ const b=$('#'+segId+' button.on'); return b ? b.dataset.v : null; }
$('#dStatusSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(b) segSet('dStatusSeg', b.dataset.v); });
$('#newBtn').addEventListener('click', ()=>{
  editingId = null;
  $('#dTitle').textContent='New counter'; $('#dSub').textContent='Add a reception or service counter';
  $('#dName').value=''; $('#dCode').value=''; $('#dHoursOpen').value=''; $('#dHoursClose').value=''; dServicesMchk.set([]); setDBranch(ctxBrDD.value || BRANCHES[0]);
  dTypeDD.set('reception'); dDeptDD.set(DEPARTMENTS[0]);
  segSet('dStatusSeg','active');
  $('#dMetaWrap').style.display='none';
  openDrawer();
});
/* shared by: the row "Edit" button, and the kebab menu's Edit Counter Tasks action
   (which is just Edit, pre-focused/scrolled to the Counter Tasks field · see doc §Row Actions) */
function openEditDrawer(item, focusFieldId){
  editingId = item.id;
  $('#dTitle').textContent='Edit counter'; $('#dSub').textContent=item.name;
  $('#dName').value=item.name; $('#dCode').value=item.code||''; $('#dHoursOpen').value=item.hoursOpen||''; $('#dHoursClose').value=item.hoursClose||''; dServicesMchk.set(item.counterTasks||[]); setDBranch(item.branch);
  dTypeDD.set(item.type); dDeptDD.set(item.dept);
  segSet('dStatusSeg', item.status);
  $('#dMeta').textContent = 'Last updated ' + item.updatedOn;
  $('#dMetaWrap').style.display='block';
  openDrawer();
  if(focusFieldId){
    const f = $('#'+focusFieldId);
    if(f) setTimeout(()=>{ f.scrollIntoView({block:'center', behavior:'smooth'}); f.focus({preventScroll:true}); }, 320); // after the .3s drawer slide-in
  }
}
$('#cBody').addEventListener('click', e=>{
  const b=e.target.closest('[data-edit]'); if(!b) return;
  const item = COUNTERS.find(x=>x.id===b.dataset.edit); if(!item) return;
  openEditDrawer(item);
});
$('#dClose').addEventListener('click', closeDrawer);
$('#dCancel').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#drawer').classList.contains('show')) closeDrawer(); });

$('#dSave').addEventListener('click', ()=>{
  const name=$('#dName').value.trim();
  if(!name){ toast('Please fill the counter name'); return; }
  const payload = { name, code: $('#dCode').value.trim()||'—', hoursOpen: $('#dHoursOpen').value, hoursClose: $('#dHoursClose').value, counterTasks: dServicesMchk.get(),
    branch: $('#dBranch').value.trim(), type: $('#dType').value, dept: $('#dDept').value,
    status: segGet('dStatusSeg'), updatedOn: TODAY };
  if(editingId){
    Object.assign(COUNTERS.find(x=>x.id===editingId), payload);
    toast('Counter updated');
  } else {
    COUNTERS.push(Object.assign({id:'ct-'+Date.now()}, payload));
    toast('Counter added');
  }
  closeDrawer();
  renderStats(); applyFilters();
});

renderStats();
applyFilters();

/* ---------- duplicate ---------- */
function duplicateCounter(item){
  const clone = JSON.parse(JSON.stringify(item));
  // no dependency/usage-style data model exists on counters (unlike rooms-areas.html's `deps` or
  // equipment-resources.html's `usage`), so there is nothing else to strip from a fresh duplicate.
  clone.id = 'ct-' + Date.now();
  clone.name = item.name + ' · copy';
  clone.code = ''; // distinct/blank code · admin assigns the real one via Edit
  clone.status = 'active'; // safe, non-blocking default
  clone.updatedOn = TODAY;
  COUNTERS.push(clone);
  renderStats(); applyFilters();
  toast(clone.name + ' created');
}

/* ---------- activate / deactivate, guarded by a dependency review (same shape as
   equipment-resources.js's hasEquipUsage/showEquipImpactModal · never a bare status flip) ---------- */
function hasCounterDeps(item){
  return (item.counterTasks||[]).length > 0;
}
function depRowsHtml(item){
  const n = (item.counterTasks||[]).length;
  return '<div class="deprow"><span>Counter tasks assigned</span><b'+(n===0?' class="zero"':'')+'>'+n+'</b></div>';
}
let impactCounterItem = null;
function showCounterImpactModal(item){
  impactCounterItem = item;
  $('#iTitle').textContent = 'Deactivate ' + item.name + '?';
  $('#iBody').innerHTML = '<p class="dep-intro">Deactivating this counter affects:</p>' + depRowsHtml(item);
  $('#iFootHint').innerHTML = '<b>Past records keep their history.</b> New queue activity will no longer route here. Map its tasks to another counter first if that is not intended.';
  $('#iScrim').classList.add('show');
}
function closeCounterImpactModal(){ $('#iScrim').classList.remove('show'); impactCounterItem=null; }
$('#iCancel').addEventListener('click', closeCounterImpactModal);
$('#iContinue').addEventListener('click', ()=>{
  const item = impactCounterItem; if(!item){ closeCounterImpactModal(); return; }
  item.status = 'inactive'; item.updatedOn = TODAY;
  closeCounterImpactModal();
  renderStats(); applyFilters();
  toast(item.name + ' deactivated');
});
$('#iScrim').addEventListener('click', e=>{ if(e.target.id==='iScrim') closeCounterImpactModal(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && $('#iScrim').classList.contains('show')) closeCounterImpactModal(); });

function toggleCounterStatus(item){
  if(item.status !== 'inactive'){ // deactivating · review dependencies first
    if(hasCounterDeps(item)){ showCounterImpactModal(item); return; }
    item.status = 'inactive'; item.updatedOn = TODAY;
    renderStats(); applyFilters();
    toast(item.name + ' deactivated');
    return;
  }
  item.status = 'active'; item.updatedOn = TODAY; // reactivating never needs the guardrail
  renderStats(); applyFilters();
  toast(item.name + ' activated');
}


/* ---------- row actions overflow ("kebab") menu ---------- */
let rowMenuCtx = null; // id of the row the open menu belongs to
function closeRowMenu(){ $('#rowMenu').classList.remove('show'); rowMenuCtx = null; }
function buildRowMenu(item){
  const items = [{action:'duplicate', label:'Duplicate'}];
  items.push({action:'mapServices', label:'Edit Counter Tasks'});
  items.push(item.status==='inactive' ? {action:'activate', label:'Activate'} : {action:'deactivate', label:'Deactivate', danger:true});
  return items;
}
function openRowMenu(btn, id){
  const item = COUNTERS.find(x=>x.id===id); if(!item) return;
  rowMenuCtx = id;
  const menu = $('#rowMenu');
  menu.innerHTML = buildRowMenu(item).map(it=>
    '<button type="button" data-action="'+it.action+'"'+(it.danger?' class="danger"':'')+'>'+esc(it.label)+'</button>').join('');
  menu.classList.add('show'); // must show before measuring so offsetWidth/Height aren't 0
  const r = btn.getBoundingClientRect();
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  let left = r.right - mw; if(left < 8) left = 8;
  let top = r.bottom + 6; if(top + mh > window.innerHeight - 8) top = r.top - mh - 6;
  menu.style.left = left + 'px'; menu.style.top = top + 'px';
}
$('#cBody').addEventListener('click', e=>{
  const kb = e.target.closest('[data-kebab]'); if(!kb) return;
  e.stopPropagation();
  const id = kb.dataset.kebab;
  if(rowMenuCtx===id){ closeRowMenu(); return; }
  openRowMenu(kb, id);
});
$('#rowMenu').addEventListener('click', e=>{
  const b = e.target.closest('button[data-action]'); if(!b || !rowMenuCtx) return;
  const id = rowMenuCtx, action = b.dataset.action;
  const item = COUNTERS.find(x=>x.id===id);
  closeRowMenu();
  if(!item) return;
  if(action==='duplicate') duplicateCounter(item);
  else if(action==='mapServices') openEditDrawer(item, 'dServicesBtn');
  else if(action==='activate' || action==='deactivate') toggleCounterStatus(item);
});
document.addEventListener('click', e=>{
  if(rowMenuCtx && !e.target.closest('#rowMenu') && !e.target.closest('[data-kebab]')) closeRowMenu();
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && rowMenuCtx) closeRowMenu(); });
document.addEventListener('scroll', closeRowMenu, true); // any ancestor scrolling invalidates the fixed-position menu
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
const ctxBrDD = makeDropdown('ctxBr', v => { toast('Switched to ' + v); branchFilter=v; renderStats(); applyFilters(); });
ctxBrDD.setOptions(CTX_BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.select('Main Campus','Main Campus');

