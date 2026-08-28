const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2300);};
const esc=s=>(s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
/* shared form components (same as doctors-staff / treatments-procedures): .f.fsel single-select, .mchk multi-select */
function initFsel(wrapId,btnId,panelId,hiddenId,opts,onPick){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  const setVal=(v,silent)=>{ hidden.value=v; const f=opts.find(o=>o[0]===v); btn.textContent=f?f[1]:(opts[0]?opts[0][1]:''); $$('#'+panelId+' .fselopt').forEach(x=>x.classList.toggle('on',x.dataset.v===v)); if(!silent&&onPick) onPick(v); };
  panel.innerHTML=opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+esc(v)+'">'+esc(l)+'</button>').join('');
  setVal(opts[0]?opts[0][0]:'', true);
  panel.addEventListener('click',e=>{ const b=e.target.closest('.fselopt'); if(!b) return; setVal(b.dataset.v); root.classList.remove('open'); });
  btn.addEventListener('click',e=>{ e.stopPropagation(); const was=root.classList.contains('open'); $$('.f.fsel,.mchk').forEach(x=>x.classList.remove('open')); if(!was) root.classList.add('open'); });
  const render=()=>{ panel.innerHTML=opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+esc(v)+'">'+esc(l)+'</button>').join(''); };
  return { set:v=>setVal(v,true), get:()=>hidden.value, setOptions:(o2,keep)=>{ opts=o2; render(); setVal(keep!==undefined?keep:hidden.value,true); } };
}
document.addEventListener('click',()=>$$('.f.fsel,.mchk').forEach(x=>x.classList.remove('open')));
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
/* Services a session can be booked for = the live Services catalogue (mirrored from services-consultation-types.js) */
/* Native <select class="fsel"> -> shared custom dropdown look, WITHOUT touching the existing wiring:
   the <select> stays in the DOM (hidden) as the source of truth; the custom button/panel mirrors its
   options and writes back .value + a change event. Re-syncs when its drawer opens, so .value set by
   code before opening shows correctly. */
function enhanceSelect(sel){
  const wrap=document.createElement('div'); wrap.className='f fsel';
  const btn=document.createElement('button'); btn.type='button'; btn.className='fselbtn'; btn.style.width='100%';
  const panel=document.createElement('div'); panel.className='fselpanel';
  sel.parentNode.insertBefore(wrap, sel); wrap.append(btn, panel, sel); sel.classList.add('xsel-native');
  const sync=()=>{ const o=sel.options[sel.selectedIndex]; btn.textContent=o?o.text:''; btn.disabled=sel.disabled;
    panel.innerHTML=[...sel.options].map(o=>'<button type="button" class="fselopt'+(o.selected?' on':'')+'" data-v="'+esc(o.value)+'">'+esc(o.text)+'</button>').join(''); };
  sync();
  btn.addEventListener('click',e=>{ e.stopPropagation(); const was=wrap.classList.contains('open'); $$('.f.fsel,.mchk').forEach(x=>x.classList.remove('open')); sync(); if(!was) wrap.classList.add('open'); });
  panel.addEventListener('click',e=>{ const b=e.target.closest('.fselopt'); if(!b) return; sel.value=b.dataset.v; sel.dispatchEvent(new Event('change',{bubbles:true})); sync(); wrap.classList.remove('open'); });
  sel.addEventListener('change',sync);
  new MutationObserver(sync).observe(sel,{childList:true,attributes:true,subtree:true});
  const drw=sel.closest('.drw'); if(drw) new MutationObserver(sync).observe(drw,{attributes:true,attributeFilter:['class']});
}
const SESSION_SERVICES = ["Wound Physio","Foot Scan & Analysis","Gait Analysis","PLATELET RICH PLASMA Procedure","WARM OXYGEN THERAPY","10 DAYS PACKAGE","15 DAYS PACKAGE","15-DAYS-PACKAGE","21 DAYS","21-Days package :HBOT-21,MHT-21,O3-21,WOUND PHYSIO-21,PRP-2,FAT GRAFTING -2,COLON-1,INFRA -3,C &D-10,DIET CONSULTATION,LAZER ,PROCEDURE","PACKAGE","LASERS","Foley Catheter charges","New Appointment","OZONE THERAPY","Ozone Therapy","VIP","PAIN MANAGEMENT","Wound Physiotherapy","2-D-ECHO","Ana profile","Ana titer","15 DAYS HYDROGEN 8H, OZONE THERAPY, CLEANING & DRESSING","10 DAYS -HBOT ,MHT,OZONE THERAPY","Skin-Grafting Procedure","DEBRIDMENT","BURNS DRESSING","DRESSING","DRESSINGS","WOUND PHYSIO","AIR WALKER","CARDIOLOGIST-CONSULTATON","Diabetologist consultation","DR KVNN CONSULTATION"];
const SESSION_ROOMS = ['Consulting Room 1','Consulting Room 2','PMR Room','Procedure Room 1'];
const root=document.documentElement;
document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-todo]');
  if(t){e.preventDefault();toast('Opens master · '+t.dataset.todo.replace(/&amp;/g,'&'));}
});

/* =====================================================================
   CONTENT · same 5 real doctors as doctors-staff.html. Dr. KVNN Santosh
   Murthy and Dr. Hrishikesh Korada carry the roster (16 and 3 mapped
   services per xlsx row 7); Dr. Harsh Atul, Dr. Raghavendra and Dr.
   Sameera are deliberately given ZERO sessions · the same documented
   "3 doctors without a roster, cannot be booked" fact already shown on
   the Config & Readiness dashboard and flagged as Missing mapping on
   Doctors & Staff. Room names and exact service labels are not given
   in any source doc · generic placeholders tied to real specialty only.
===================================================================== */
const DOCS=[
  {id:'kvnn', n:'Dr. KVNN Santosh Murthy', i:'SM', dep:'Consulting',                     c:'var(--ch1)', branch:'Main Campus',        services:['Wound Consultation OPD','Diabetic Foot Review','Dressing & Debridement','Follow-up Review']},
  {id:'hk',   n:'Dr. Hrishikesh Korada',   i:'HK', dep:'Consulting',                     c:'var(--ch3)', branch:'Main Campus',        services:['PMR Review','Follow-up Review']},
  {id:'ha',   n:'Dr. Harsh Atul',          i:'HA', dep:'Consulting',                     c:'var(--ch2)', branch:'Main Campus',        services:['Wound Consultation OPD','Follow-up Review']},
  {id:'rg',   n:'Dr. Raghavendra',         i:'RG', dep:'Consulting',                     c:'var(--ch5)', branch:'OPD Annexe',         services:['Dressing & Debridement']},
  {id:'sm2',  n:'Dr. Sameera',             i:'SA', dep:'OPD',                            c:'var(--ch4)', branch:'Madhurawada Branch', services:['Wound Consultation OPD']}
];
const DEPTS=['Orthotics & Prosthetics','Consulting','ECG','IPD','FOOTRYX Physiotherapy','Nursing','OPD','Pharmacy','Admission','Laboratory'];
/* Branch, resource-group and service-catalogue masters · additive per BRD Workspace 08 field list (Branch, Resource Group, Services Available) */
const BRANCHES=['Main Campus','OPD Annexe','Madhurawada Branch'];
const RESOURCE_GROUPS=['None','Wound Care Team A','Wound Care Team B','Diabetic Foot Unit','PMR Unit'];
const SVC_CATALOG=['Wound Consultation OPD','PMR Review','Diabetic Foot Review','Dressing & Debridement','Follow-up Review'];
/* Branch holidays · used to flag "session falls on branch holiday" in the session-builder preview (BRD required warning) */
const HOLIDAYS=['2026-08-27','2026-09-05','2026-09-17'];
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
/* week of Mon 17 Aug 2026 → Sun 23 Aug 2026 (today = Thu 20 Aug 2026 wait, actual "today" per app context is 14 Aug · kept as a plausible near week) */
const WEEK=[17,18,19,20,21,22,23];
/* k: normal | lv (leave) | bl (temporary block) | cf (conflict) */
let SESS=[
  {d:'kvnn',day:0,s:'09:00',e:'12:00',room:'Consulting Room 2',svc:'Wound Consultation OPD',k:'ok'},
  {d:'kvnn',day:1,s:'10:00',e:'13:00',room:'Consulting Room 2',svc:'Wound Consultation OPD',k:'cf',why:'Consulting Room 2 is booked 11:00–13:00 by another session'},
  {d:'kvnn',day:1,s:'11:00',e:'13:00',room:'Consulting Room 2',svc:'Wound Consultation OPD',k:'cf',why:'Overlaps 10:00–13:00 session, same room'},
  {d:'kvnn',day:2,s:'09:00',e:'12:00',room:'Consulting Room 2',svc:'Wound Consultation OPD',k:'ok'},
  {d:'kvnn',day:3,s:'14:00',e:'17:00',room:'Consulting Room 2',svc:'Wound Consultation OPD',k:'ok'},
  {d:'kvnn',day:4,s:'09:00',e:'12:00',room:'Consulting Room 2',svc:'Wound Consultation OPD',k:'ok'},

  {d:'hk',day:1,s:'09:30',e:'12:30',room:'PMR Room',svc:'PMR Review',k:'ok'},
  {d:'hk',day:3,s:'09:30',e:'12:30',room:'PMR Room',svc:'PMR Review',k:'ok'},
  {d:'hk',day:4,s:'—',e:'',room:'',svc:'Conference (wound care)',k:'lv'}
  /* Dr. Harsh Atul, Dr. Raghavendra, Dr. Sameera deliberately have NO sessions at all */
];
const SVCCOL={'Wound Consultation OPD':'var(--ch1)','PMR Review':'var(--ch3)'};

/* =====================================================================
   NURSING & STAFF ROSTER · same 5 real staff as doctors-staff.html
   (Sohela Farheen, Nida Firdous, Hanshith Reddy already existed there;
   Swathi Reddy and Manasa Chowdary added there too, dept 'Nursing').
   Hanshith Reddy (Lab Technician) deliberately has ZERO shifts here —
   same "no roster configured" pattern used for the 3 doctors above.
===================================================================== */
const STAFF=[
  {id:'swathi',   n:'Swathi Reddy',      i:'SW', dep:'Nursing',   role:'Staff Nurse',            c:'var(--ch4)', branch:'Main Campus'},
  {id:'manasa',   n:'Manasa Chowdary',   i:'MC', dep:'Nursing',   role:'Staff Nurse',            c:'var(--ch5)', branch:'Main Campus'},
  {id:'sohela',   n:'Sohela Farheen',    i:'SF', dep:'OPD',       role:'Receptionist',           c:'var(--ch2)', branch:'Main Campus'},
  {id:'nida',     n:'Nida Firdous',      i:'NF', dep:'Admission', role:'Front Desk Executive',   c:'var(--ch3)', branch:'OPD Annexe'},
  {id:'hanshith', n:'Hanshith Reddy',    i:'HR', dep:'Laboratory',role:'Lab Technician',         c:'var(--ch1)', branch:'Main Campus'}
];
const SHIFT_TEMPLATES=[
  {n:'Morning',            s:'07:00', e:'15:00'},
  {n:'Evening',            s:'15:00', e:'23:00'},
  {n:'Night',              s:'23:00', e:'07:00'},
  {n:'General / Admin',    s:'09:00', e:'17:00'}
];
const SHIFTCOL={'Morning':'var(--ch1)','Evening':'var(--ch2)','Night':'var(--st-inconsult)','General / Admin':'var(--ch3)'};
/* k: ok (scheduled) | lv (leave) | bl (temporary block) | ta (temporary assignment · different dept than home) | cf (conflict)
   oc: on-call · ot: overtime */
let SESS_STAFF=[
  {d:'swathi',day:0,s:'07:00',e:'15:00',dept:'Nursing',shift:'Morning',oc:false,ot:false,k:'ok'},
  {d:'swathi',day:1,s:'07:00',e:'15:00',dept:'Nursing',shift:'Morning',oc:false,ot:false,k:'ok'},
  {d:'swathi',day:2,s:'07:00',e:'15:00',dept:'Nursing',shift:'Morning',oc:true, ot:false,k:'ok'},
  {d:'swathi',day:3,s:'07:00',e:'15:00',dept:'Nursing',shift:'Morning',oc:false,ot:false,k:'ok'},
  {d:'swathi',day:4,s:'—',   e:'',      dept:'',        shift:'',       oc:false,ot:false,k:'lv'},

  {d:'manasa',day:1,s:'15:00',e:'23:00',dept:'Nursing',   shift:'Evening',oc:false,ot:false,k:'ok'},
  {d:'manasa',day:2,s:'15:00',e:'23:00',dept:'Nursing',   shift:'Evening',oc:false,ot:false,k:'ok'},
  {d:'manasa',day:3,s:'15:00',e:'23:00',dept:'Consulting',shift:'Evening',oc:false,ot:false,k:'ta'},
  {d:'manasa',day:4,s:'15:00',e:'23:30',dept:'Nursing',   shift:'Evening',oc:false,ot:true, k:'ok'},
  {d:'manasa',day:5,s:'15:00',e:'23:00',dept:'Nursing',   shift:'Evening',oc:false,ot:false,k:'ok'},

  {d:'sohela',day:0,s:'09:00',e:'17:00',dept:'OPD',shift:'General / Admin',oc:false,ot:false,k:'ok'},
  {d:'sohela',day:1,s:'09:00',e:'17:00',dept:'OPD',shift:'General / Admin',oc:false,ot:false,k:'cf',why:'Overlaps 10:00–18:00 shift, same staff member'},
  {d:'sohela',day:1,s:'10:00',e:'18:00',dept:'OPD',shift:'General / Admin',oc:false,ot:false,k:'cf',why:'Overlaps 09:00–17:00 shift, same staff member'},
  {d:'sohela',day:2,s:'09:00',e:'17:00',dept:'OPD',shift:'General / Admin',oc:false,ot:false,k:'ok'},
  {d:'sohela',day:3,s:'09:00',e:'17:00',dept:'OPD',shift:'Sick (same-day block)',oc:false,ot:false,k:'bl'},
  {d:'sohela',day:4,s:'09:00',e:'17:00',dept:'OPD',shift:'General / Admin',oc:false,ot:false,k:'ok'},

  {d:'nida',day:0,s:'09:00',e:'17:00',dept:'Admission',shift:'General / Admin',oc:false,ot:false,k:'ok'},
  {d:'nida',day:1,s:'09:00',e:'17:00',dept:'Admission',shift:'General / Admin',oc:false,ot:false,k:'ok'},
  {d:'nida',day:2,s:'09:00',e:'17:00',dept:'Admission',shift:'General / Admin',oc:false,ot:false,k:'ok'},
  {d:'nida',day:3,s:'09:00',e:'17:00',dept:'Admission',shift:'General / Admin',oc:false,ot:false,k:'ok'},
  {d:'nida',day:4,s:'09:00',e:'17:00',dept:'Admission',shift:'General / Admin',oc:false,ot:false,k:'ok'}
  /* Hanshith Reddy (Lab Technician) deliberately has NO shifts at all */
];
let activeRole='doc';

/* ---------- custom dropdown driver ---------- */
function makeDropdown(prefix,onPick){
  const root=$('#'+prefix+'Drop'),btn=$('#'+prefix+'Btn'),lbl=$('#'+prefix+'BtnLbl'),listSel='#'+prefix+'List';
  let value='', rows=[];
  const close=()=>root.classList.remove('open');
  btn.addEventListener('click',e=>{e.stopPropagation();root.classList.toggle('open');});
  document.addEventListener('click',e=>{if(!root.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  return {
    setOptions(list){
      rows=list;
      $(listSel).innerHTML=rows.map(r=>
        '<button type="button" class="cdrow'+(r.value===value?' on':'')+'" data-v="'+r.value+'"><span class="cdav">'+(r.av||'')+'</span>'
        +'<span class="cdtx">'+r.title+'</span>'
        +'<svg class="chk" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>'
      ).join('');
      $$(listSel+' .cdrow').forEach(row=>row.addEventListener('click',()=>{
        const r=rows.find(x=>x.value===row.dataset.v);
        value=r.value; lbl.textContent=r.title;
        $$(listSel+' .cdrow').forEach(x=>x.classList.toggle('on',x.dataset.v===value));
        close();
        if(onPick)onPick(value);
      }));
    },
    get value(){return value;},
    /* also syncs the visible label + highlighted row · a plain `value=v` alone left the
       button's displayed text stuck on whatever the HTML had baked in, and only worked
       by accident for 'Main Campus' because that happened to already be the static label. */
    set value(v){
      value=v;
      const r=rows.find(x=>x.value===v);
      if(r) lbl.textContent=r.title;
      $$(listSel+' .cdrow').forEach(x=>x.classList.toggle('on',x.dataset.v===v));
    }
  };
}
function renderActive(){ activeRole==='doc'?render():renderStaff(); }
const docDD=makeDropdown('doc',()=>renderActive());
const deptDD=makeDropdown('dept',()=>renderActive());
function populatePersonDropdown(){
  const list = activeRole==='doc'?DOCS:STAFF, label = activeRole==='doc'?'All doctors':'All staff';
  docDD.setOptions([{value:'',title:label,av:'★'}].concat(list.map(d=>({value:d.id,title:d.n,av:d.i}))));
  docDD.value=''; $('#docBtnLbl').textContent=label;
}
populatePersonDropdown();
deptDD.setOptions([{value:'',title:'All departments',av:'★'}].concat(DEPTS.map(d=>({value:d,title:d}))));

/* fill native selects in drawers */
['#bDoc','#eDoc'].forEach(sel=>{
  const el=$(sel);
  DOCS.forEach(d=>el.insertAdjacentHTML('beforeend',`<option value="${d.id}">${d.n}</option>`));
});
['#shDoc','#seDoc'].forEach(sel=>{
  const el=$(sel);
  STAFF.forEach(d=>el.insertAdjacentHTML('beforeend',`<option value="${d.id}">${d.n}</option>`));
});
/* Shift templates are Admin-configured, not hard-coded · "Manage shift templates" below the picker
   lets an admin add/edit/delete named shifts (e.g. "Shift 1: 6AM–4PM") instead of being stuck with
   a fixed list. #shTemplate itself is now built from SHIFT_TEMPLATES rather than static <option>s. */
function rebuildShTemplateOptions(){
  const cur = $('#shTemplate').value;
  $('#shTemplate').innerHTML = SHIFT_TEMPLATES.map(t=>`<option value="${esc(t.n)}">${esc(t.n)} (${t.s}–${t.e})</option>`).join('')
    + '<option value="custom">Custom</option>';
  if(SHIFT_TEMPLATES.some(t=>t.n===cur) || cur==='custom') $('#shTemplate').value = cur;
}
function renderShTplList(){
  $('#shTplList').innerHTML = SHIFT_TEMPLATES.map((t,i)=>
    '<div class="tplrow" data-i="'+i+'" style="display:flex;gap:8px;align-items:center;margin-bottom:6px">'
    + '<input class="fld tplname" type="text" value="'+esc(t.n)+'" placeholder="Shift name" style="flex:1;min-width:0">'
    + '<input class="tpls" type="time" value="'+t.s+'">'
    + '<span class="dash">–</span>'
    + '<input class="tple" type="time" value="'+t.e+'">'
    + '<button type="button" class="btn btn-ghost btn-sm" data-rmtpl="'+i+'" title="Remove">✕</button>'
    + '</div>'
  ).join('') || '<p class="hint">No shift templates yet. Add one below.</p>';
}
$('#shTplManageBtn').addEventListener('click',()=>{
  const open = $('#shTplManage').style.display!=='none';
  $('#shTplManage').style.display = open ? 'none' : '';
  if(!open) renderShTplList();
});
$('#shTplAdd').addEventListener('click',()=>{
  SHIFT_TEMPLATES.push({n:'New shift', s:'09:00', e:'17:00'});
  renderShTplList(); rebuildShTemplateOptions();
});
$('#shTplList').addEventListener('click', e=>{
  const b=e.target.closest('[data-rmtpl]'); if(!b) return;
  SHIFT_TEMPLATES.splice(+b.dataset.rmtpl,1);
  renderShTplList(); rebuildShTemplateOptions();
  toast('Shift template removed');
});
$('#shTplList').addEventListener('change', e=>{
  const row=e.target.closest('.tplrow'); if(!row) return;
  const i=+row.dataset.i, t=SHIFT_TEMPLATES[i];
  t.n=row.querySelector('.tplname').value.trim()||'Shift'; t.s=row.querySelector('.tpls').value; t.e=row.querySelector('.tple').value;
  rebuildShTemplateOptions();
  toast('Shift template updated');
});
rebuildShTemplateOptions();
$('#shTemplate').value='Evening';

/* Branch / Department / Resource group masters · doctor session builder + staff shift builder */
['#bBranch','#shBranch','#shTmpBranch'].forEach(sel=>{ $(sel).innerHTML=BRANCHES.map(b=>`<option>${b}</option>`).join(''); });
$('#bDept').innerHTML=DEPTS.map(d=>`<option>${d}</option>`).join('');
$('#bResGroup').innerHTML=RESOURCE_GROUPS.map(g=>`<option>${g}</option>`).join('');
function updateSessBranchDept(){
  const doc=DOCS.find(x=>x.id===$('#bDoc').value);
  if(doc){ $('#bBranch').value=doc.branch; $('#bDept').value=doc.dep; if(typeof bDeptDD!=='undefined'){ bDeptDD.set(doc.dep); setBranchLbl(doc.branch); } }
}
const bDocDD=initFsel('bDocWrap','bDocBtn','bDocPanel','bDoc', DOCS.map(d=>[d.id,d.n]), ()=>{ updateSessBranchDept(); preview(); });
const bDeptDD=initFsel('bDeptWrap','bDeptBtn','bDeptPanel','bDept', DEPTS.map(d=>[d,d]), ()=>preview());
const bRoomDD=initFsel('bRoomWrap','bRoomBtn','bRoomPanel','bRoom', SESSION_ROOMS.map(r=>[r,r]), ()=>preview());
const bResDD=initFsel('bResGroupWrap','bResGroupBtn','bResGroupPanel','bResGroup', RESOURCE_GROUPS.map(g=>[g,g]));
/* Resource group is Admin-configured (BRD §10: optional select; no separate master screen exists), so
   the dropdown carries an inline "add new" row, same as Sub-specialty on Doctors & Staff. */
function appendAddResRow(){
  const panel=$('#bResGroupPanel');
  panel.insertAdjacentHTML('beforeend','<div class="fseladdrow"><input type="text" placeholder="Add a new resource group…" id="bResNew"><button type="button" id="bResAdd" title="Add resource group"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div>');
  const row=panel.querySelector('.fseladdrow'), inp=$('#bResNew');
  row.addEventListener('click',e=>e.stopPropagation());
  const add=()=>{ const label=inp.value.trim(); if(!label) return;
    if(!RESOURCE_GROUPS.some(g=>g.toLowerCase()===label.toLowerCase())) RESOURCE_GROUPS.push(label);
    const val=RESOURCE_GROUPS.find(g=>g.toLowerCase()===label.toLowerCase());
    bResDD.setOptions(RESOURCE_GROUPS.map(g=>[g,g]), val); appendAddResRow();
    $('#bResGroupWrap').classList.remove('open'); toast('Resource group "'+val+'" added'); };
  $('#bResAdd').addEventListener('click',add);
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); add(); } });
}
appendAddResRow();
const bRecurDD=initFsel('bRecurWrap','bRecurBtn','bRecurPanel','bRecur', [['weekly','Weekly'],['custom','Custom']], ()=>{ updateRecurHint(); preview(); });
const bSvcMchk=initMchk('bSvcMchk','bSvcBtn','bSvcPanel','bSvcChips', Object.fromEntries(SESSION_SERVICES.map(v=>[v,v])), 'Select services…', true, ()=>preview());
function setBranchLbl(v){ $('#bBranch').value=v||''; $('#bBranchLbl').textContent=v||'Not set'; }
/* the hidden inputs are still the source of truth the rest of this file reads/writes; this re-syncs the
   custom controls' visuals after openSess() writes them */
function syncSessForm(){
  bDocDD.set($('#bDoc').value); bDeptDD.set($('#bDept').value); bRoomDD.set($('#bRoom').value);
  bResDD.set($('#bResGroup').value||RESOURCE_GROUPS[0]); bRecurDD.set($('#bRecur').value||'weekly'); setBranchLbl($('#bBranch').value);
  $$('#bStatusSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===($('#bStatus').value||'Active')));
  updateRecurHint();
}
$('#bStatusSeg').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; $('#bStatus').value=b.dataset.v; $$('#bStatusSeg button').forEach(x=>x.classList.toggle('on',x===b)); });
updateSessBranchDept(); syncSessForm();

/* ---------- RENDER ---------- */
let view='week';
const ic={warn:'<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'};
const visibleRows=()=>{
  const d=docDD.value, dep=deptDD.value, list=activeRole==='doc'?DOCS:STAFF;
  return list.filter(x=>(!d||x.id===d)&&(!dep||x.dep===dep));
};
function block(s,idx,mini){
  const col=SVCCOL[s.svc]||'var(--brand)';
  const cls='sess '+(s.k==='ok'?'':s.k)+(mini?' mini':'');
  const time = s.k==='lv'?'On leave' : s.s+'–'+s.e;
  const sub  = s.k==='lv'?s.svc : s.k==='bl'?s.svc : (s.room?s.room+' · ':'')+s.svc;
  const style = s.k==='ok'||s.k==='cf'?`--sc:${col};--sb:color-mix(in srgb,${col} 12%,#fff)`:'';
  return `<button class="${cls}" style="${style}" data-role="doc" data-i="${idx}" title="${s.why?s.why:s.svc}">
      ${s.k==='cf'?`<span class="wi">${ic.warn}</span>`:''}
      <b>${time}</b><span>${sub}</span></button>`;
}
function blockStaff(s,idx,mini){
  const col=SHIFTCOL[s.shift]||'var(--brand)';
  const cls='sess '+(s.k==='ok'?'':s.k)+(mini?' mini':'');
  const time = s.k==='lv'?'On leave' : s.s+'–'+s.e;
  let sub = s.k==='lv'?(s.shift||'Leave') : s.k==='bl'?s.shift : (s.k==='ta'?'Temp: '+s.dept+' · ':(s.dept?s.dept+' · ':''))+s.shift;
  if(s.k==='ok'||s.k==='ta'){ if(s.oc) sub+=' · On-call'; if(s.ot) sub+=' · OT'; }
  const style = s.k==='ok'||s.k==='cf'||s.k==='ta'?`--sc:${col};--sb:color-mix(in srgb,${col} 12%,#fff)`:'';
  return `<button class="${cls}" style="${style}" data-role="staff" data-i="${idx}" title="${s.why?s.why:s.shift}">
      ${s.k==='cf'?`<span class="wi">${ic.warn}</span>`:''}
      <b>${time}</b><span>${sub}</span></button>`;
}
function render(){
  const g=$('#rgrid'), docs=visibleRows();
  $('#gridEmpty').style.display = docs.length?'none':'block';
  g.style.display = docs.length?'grid':'none';
  g.className='rgrid '+(view==='week'?'wk':'mo');
  let h='';

  if(view==='week'){
    $('#gridTitle').textContent='Weekly roster · 17 – 23 August 2026';
    h+='<div class="dcorner">Doctor</div>';
    DAYS.forEach((d,i)=>{
      const cls = i>4?'dhead wknd':'dhead';
      h+=`<div class="${cls}"><b>${d}</b><span>${WEEK[i]} Aug</span></div>`;
    });
    docs.forEach(doc=>{
      const mine=SESS.map((s,i)=>({s,i})).filter(o=>o.s.d===doc.id);
      h+=`<div class="docc"><span class="av" style="--dc:${doc.c}">${doc.i}</span>
            <div class="dt"><b>${doc.n}</b><span>${doc.dep}</span></div></div>`;
      for(let day=0;day<7;day++){
        const cell=mine.filter(o=>o.s.day===day);
        h+=`<div class="dcell${day>4?' wknd':''}" data-doc="${doc.id}" data-day="${day}">`;
        if(!cell.length && !mine.length && day===0)
          h+=`<span style="font-size:10px;color:var(--ink-muted);font-weight:600;padding:4px">No sessions configured</span>`;
        cell.forEach(o=>h+=block(o.s,o.i,false));
        h+='</div>';
      }
    });
  }else{
    $('#gridTitle').textContent='Monthly roster · August 2026';
    h+='<div class="dcorner">Doctor</div>';
    for(let dt=1;dt<=31;dt++){
      const wd=(dt+5)%7; /* 1 Aug 2026 = Saturday → index 5 */
      const cls = wd>4?'dhead wknd':'dhead';
      h+=`<div class="${cls}"><b>${dt}</b><span>${DAYS[wd][0]}</span></div>`;
    }
    docs.forEach(doc=>{
      const mine=SESS.map((s,i)=>({s,i})).filter(o=>o.s.d===doc.id);
      h+=`<div class="docc"><span class="av" style="--dc:${doc.c}">${doc.i}</span>
            <div class="dt"><b>${doc.n}</b><span>${doc.dep}</span></div></div>`;
      for(let dt=1;dt<=31;dt++){
        const wd=(dt+5)%7;
        const cell=mine.filter(o=>o.s.day===wd && (o.s.k==='ok'||o.s.k==='cf'||(dt>=17&&dt<=23)));
        h+=`<div class="dcell${wd>4?' wknd':''}" data-doc="${doc.id}" data-day="${wd}">`;
        cell.forEach(o=>h+=block(o.s,o.i,true));
        h+='</div>';
      }
    });
  }
  g.innerHTML=h;
  stats();
}
function stats(){
  const docs=visibleRows().map(d=>d.id);
  const v=SESS.filter(s=>docs.includes(s.d));
  const norm=v.filter(s=>s.k==='ok'||s.k==='cf');
  const hrs=norm.reduce((a,s)=>a+(+s.e.split(':')[0]+ +s.e.split(':')[1]/60)-(+s.s.split(':')[0]+ +s.s.split(':')[1]/60),0);
  const cf=v.filter(s=>s.k==='cf').length;
  $('#tSess').textContent=norm.length;
  $('#tHrs').textContent=Math.round(hrs);
  $('#tLeave').textContent=v.filter(s=>s.k==='lv').length;
  $('#tBlock').textContent=v.filter(s=>s.k==='bl').length;
  $('#tConf').textContent=cf;
  $('#tNoRos').textContent=visibleRows().filter(d=>!SESS.some(s=>s.d===d.id)).length;
  $('#gridCount').textContent=visibleRows().length+' doctor'+(visibleRows().length===1?'':'s');
  const pairs=Math.ceil(cf/2);
  $('#cfBanner').classList.toggle('gone',cf===0);
  $('#cfText').textContent=pairs+' scheduling conflict'+(pairs===1?'':'s')+' on this roster';
  renderSummaryTabs();
}
render();

/* ---------- STAFF GRID RENDER ---------- */
function renderStaff(){
  const g=$('#rgridStaff'), rows=visibleRows();
  $('#sGridEmpty').style.display = rows.length?'none':'block';
  g.style.display = rows.length?'grid':'none';
  g.className='rgrid '+(view==='week'?'wk':'mo');
  let h='';
  if(view==='week'){
    $('#sGridTitle').textContent='Weekly roster · 17 – 23 August 2026';
    h+='<div class="dcorner">Staff</div>';
    DAYS.forEach((d,i)=>{
      const cls = i>4?'dhead wknd':'dhead';
      h+=`<div class="${cls}"><b>${d}</b><span>${WEEK[i]} Aug</span></div>`;
    });
    rows.forEach(person=>{
      const mine=SESS_STAFF.map((s,i)=>({s,i})).filter(o=>o.s.d===person.id);
      h+=`<div class="docc"><span class="av" style="--dc:${person.c}">${person.i}</span>
            <div class="dt"><b>${person.n}</b><span>${person.role}</span></div></div>`;
      for(let day=0;day<7;day++){
        const cell=mine.filter(o=>o.s.day===day);
        h+=`<div class="dcell${day>4?' wknd':''}" data-doc="${person.id}" data-day="${day}">`;
        if(!cell.length && !mine.length && day===0)
          h+=`<span style="font-size:10px;color:var(--ink-muted);font-weight:600;padding:4px">No shifts configured</span>`;
        cell.forEach(o=>h+=blockStaff(o.s,o.i,false));
        h+='</div>';
      }
    });
  }else{
    $('#sGridTitle').textContent='Monthly roster · August 2026';
    h+='<div class="dcorner">Staff</div>';
    for(let dt=1;dt<=31;dt++){
      const wd=(dt+5)%7;
      const cls = wd>4?'dhead wknd':'dhead';
      h+=`<div class="${cls}"><b>${dt}</b><span>${DAYS[wd][0]}</span></div>`;
    }
    rows.forEach(person=>{
      const mine=SESS_STAFF.map((s,i)=>({s,i})).filter(o=>o.s.d===person.id);
      h+=`<div class="docc"><span class="av" style="--dc:${person.c}">${person.i}</span>
            <div class="dt"><b>${person.n}</b><span>${person.role}</span></div></div>`;
      for(let dt=1;dt<=31;dt++){
        const wd=(dt+5)%7;
        const cell=mine.filter(o=>o.s.day===wd && (o.s.k==='ok'||o.s.k==='ta'||o.s.k==='cf'||(dt>=17&&dt<=23)));
        h+=`<div class="dcell${wd>4?' wknd':''}" data-doc="${person.id}" data-day="${wd}">`;
        cell.forEach(o=>h+=blockStaff(o.s,o.i,true));
        h+='</div>';
      }
    });
  }
  g.innerHTML=h;
  statsStaff();
}
function statsStaff(){
  const ids=visibleRows().map(d=>d.id);
  const v=SESS_STAFF.filter(s=>ids.includes(s.d));
  const norm=v.filter(s=>s.k==='ok'||s.k==='cf'||s.k==='ta');
  const hrs=norm.reduce((a,s)=>{
    let d=(+s.e.split(':')[0]+ +s.e.split(':')[1]/60)-(+s.s.split(':')[0]+ +s.s.split(':')[1]/60);
    if(d<=0) d+=24; /* overnight shift, e.g. Night 23:00–07:00 */
    return a+d;
  },0);
  const cf=v.filter(s=>s.k==='cf').length;
  $('#sTSess').textContent=norm.length;
  $('#sTHrs').textContent=Math.round(hrs);
  $('#sTLeave').textContent=v.filter(s=>s.k==='lv').length;
  $('#sTTemp').textContent=v.filter(s=>s.k==='ta').length;
  $('#sTConf').textContent=cf;
  $('#sTNoRos').textContent=visibleRows().filter(d=>!SESS_STAFF.some(s=>s.d===d.id)).length;
  $('#sGridCount').textContent=visibleRows().length+' staff';
  const pairs=Math.ceil(cf/2);
  $('#sCfBanner').classList.toggle('gone',cf===0);
  $('#sCfText').textContent=pairs+' scheduling conflict'+(pairs===1?'':'s')+' on this roster';
  const gapDays=checkCoverageGap();
  $('#covGapBanner').classList.toggle('gone',gapDays.length===0);
  $('#covGapDetail').textContent = gapDays.length? `No nurse is rostered on ${gapDays.join(', ')} this week, Nursing dept coverage gap` : '';
  renderSummaryTabs();
}
/* "Nursing coverage gap" · required warning (BRD Workspace 08 §"Required warnings"). Checked across
   the full staff roster, independent of the current person/department filter, so a gap is never hidden. */
function checkCoverageGap(){
  const gapDays=[];
  for(let day=0;day<7;day++){
    const covered = SESS_STAFF.some(s=>s.dept==='Nursing' && s.day===day && (s.k==='ok'||s.k==='ta'));
    if(!covered) gapDays.push(DAYS[day]);
  }
  return gapDays;
}
$('#covGapDismiss').addEventListener('click',()=>{$('#covGapBanner').classList.add('gone');toast('Banner dismissed. Coverage gap still unresolved');});

/* ---------- ON-CALL / LEAVE & BLOCKS / SUBSTITUTIONS SUMMARY TABS ---------- */
function renderSummaryTabs(){
  /* On-call */
  const ocRows=SESS_STAFF.filter(s=>s.oc && s.k!=='lv');
  $('#oncallCount').textContent=ocRows.length+' on-call';
  $('#oncallBody').innerHTML = ocRows.length? `<div class="prev">${ocRows.map(r=>{
      const st=STAFF.find(x=>x.id===r.d);
      return `<div class="prow"><span class="pd" style="width:120px">${DAYS[r.day]}</span>
        <span class="pi"><b>${st.n}</b> · ${r.dept||st.dep} · ${r.s}–${r.e}</span>
        <span class="chip warn">On-call</span></div>`;
    }).join('')}</div>`
    : `<div class="empty" style="padding:28px 12px"><b>No on-call shifts this week</b><span>Toggle On-call in the shift builder to flag one.</span></div>`;

  /* Leave & Blocks · combined from both rosters */
  const leaveRows=[
    ...SESS.filter(s=>s.k==='lv'||s.k==='bl').map(s=>({name:DOCS.find(d=>d.id===s.d).n,role:'Doctor',day:s.day,k:s.k,label:s.svc})),
    ...SESS_STAFF.filter(s=>s.k==='lv'||s.k==='bl').map(s=>({name:STAFF.find(d=>d.id===s.d).n,role:'Staff',day:s.day,k:s.k,label:s.shift}))
  ].sort((a,b)=>a.day-b.day);
  $('#leaveCount').textContent=leaveRows.length+' entries';
  $('#leaveBody').innerHTML = leaveRows.length? `<div class="prev">${leaveRows.map(r=>`
      <div class="prow"><span class="pd" style="width:120px">${DAYS[r.day]}</span>
        <span class="pi"><b>${r.name}</b> · ${r.role} · ${r.label}</span>
        <span class="chip ${r.k==='lv'?'mute':'warn'}">${r.k==='lv'?'Leave':'Block'}</span></div>`).join('')}</div>`
    : `<div class="empty" style="padding:28px 12px"><b>No leave or blocks this week</b><span>Apply one from the Exceptions &amp; leave drawer.</span></div>`;

  /* Substitutions · cover created from the Exception & leave drawer */
  const subRows=[
    ...SESS.filter(s=>s.svc==='Cover clinic').map(s=>({name:DOCS.find(d=>d.id===s.d).n,role:'Doctor',day:s.day,s:s.s,e:s.e})),
    ...SESS_STAFF.filter(s=>s.shift==='Cover shift').map(s=>({name:STAFF.find(d=>d.id===s.d).n,role:'Staff',day:s.day,s:s.s,e:s.e}))
  ].sort((a,b)=>a.day-b.day);
  $('#subsCount').textContent=subRows.length+' active';
  $('#subsBody').innerHTML = subRows.length? `<div class="prev">${subRows.map(r=>`
      <div class="prow"><span class="pd" style="width:120px">${DAYS[r.day]}</span>
        <span class="pi"><b>${r.name}</b> covering · ${r.role} · ${r.s}–${r.e}</span>
        <span class="chip ok">Covering</span></div>`).join('')}</div>`
    : `<div class="empty" style="padding:28px 12px"><b>No substitutions active</b><span>Assign a substitute when applying a leave or block exception.</span></div>`;
}

/* ---------- TOP-LEVEL TABS ---------- */
let topTab='roster';
$('#topTabSeg').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  [...b.parentElement.children].forEach(x=>x.classList.toggle('on',x===b));
  topTab=b.dataset.tab;
  $('#roleDocView').style.display = (topTab==='roster' && activeRole==='doc')?'':'none';
  $('#roleStaffView').style.display = (topTab==='roster' && activeRole==='staff')?'':'none';
  $('#tabOncall').style.display = topTab==='oncall'?'':'none';
  $('#tabLeave').style.display = topTab==='leave'?'':'none';
  $('#tabSubs').style.display = topTab==='subs'?'':'none';
  $('#viewSeg').style.display = topTab==='roster'?'':'none';
  if(topTab!=='roster') renderSummaryTabs();
  toast(b.textContent.trim());
});

/* ---------- ROLE TOGGLE ---------- */
/* the doctor/dept/view filter bar is a single shared node (one set of ids) · move it into whichever
   roster card (doc or staff) is active so it always reads as part of that card's box, not a floating row */
function placeRosterFilterbar(){
  const bar=$('#rosterFilterbar');
  const card=$(activeRole==='doc'?'#docRosterCard':'#staffRosterCard');
  if(bar && card && card.firstElementChild!==bar) card.insertBefore(bar, card.firstElementChild);
}
$('#roleSeg').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  [...b.parentElement.children].forEach(x=>x.classList.toggle('on',x===b));
  activeRole=b.dataset.r;
  $('#roleDocView').style.display = (topTab==='roster' && activeRole==='doc')?'':'none';
  $('#roleStaffView').style.display = (topTab==='roster' && activeRole==='staff')?'':'none';
  placeRosterFilterbar();
  $('#addBtnTxt').textContent = activeRole==='doc'?'Add session':'Add shift';
  deptDD.value=''; $('#deptBtnLbl').textContent='All departments';
  populatePersonDropdown();
  renderActive();
  toast(activeRole==='doc'?'Doctor roster':'Nursing & staff roster');
});

$('#viewSeg').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  [...b.parentElement.children].forEach(x=>x.classList.toggle('on',x===b));
  view=b.dataset.v; renderActive(); toast(view==='week'?'Week view':'Month view. Scroll for later dates');
});

/* ---------- CONFLICT BANNER ---------- */
$('#cfReview').addEventListener('click',()=>{
  const first=$('#roleDocView .sess.cf');
  if(!first) return toast('No conflicts left');
  $$('#roleDocView .sess.cf').forEach(el=>{el.classList.remove('hl');void el.offsetWidth;el.classList.add('hl');});
  first.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});
  toast('Highlighted every conflicting block');
});
$('#cfDismiss').addEventListener('click',()=>{$('#cfBanner').classList.add('gone');toast('Banner dismissed. Conflict still unresolved');});
$('#sCfReview').addEventListener('click',()=>{
  const first=$('#roleStaffView .sess.cf');
  if(!first) return toast('No conflicts left');
  $$('#roleStaffView .sess.cf').forEach(el=>{el.classList.remove('hl');void el.offsetWidth;el.classList.add('hl');});
  first.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});
  toast('Highlighted every conflicting block');
});
$('#sCfDismiss').addEventListener('click',()=>{$('#sCfBanner').classList.add('gone');toast('Banner dismissed. Conflict still unresolved');});

/* ---------- POPOVER ---------- */
let popIdx=null, popRole='doc';
document.addEventListener('click',e=>{
  const b=e.target.closest('.sess');
  const cell=e.target.closest('.dcell');
  if(b){
    popRole=b.dataset.role||'doc'; popIdx=+b.dataset.i;
    if(popRole==='doc'){
      const s=SESS[popIdx];
      $('#popT').textContent = s.k==='lv'?'On leave':s.svc;
      $('#popS').textContent = DOCS.find(d=>d.id===s.d).n+' · '+DAYS[s.day]+(s.room?' · '+s.room:'');
    } else {
      const s=SESS_STAFF[popIdx];
      $('#popT').textContent = s.k==='lv'?'On leave':s.shift;
      $('#popS').textContent = STAFF.find(d=>d.id===s.d).n+' · '+DAYS[s.day]+(s.dept?' · '+s.dept:'');
    }
    $('#popEditTxt').textContent = popRole==='doc'?'Edit session':'Edit shift';
    $('#popSubTxt').textContent = popRole==='doc'?'Assign substitute':'Assign cover';
    $('#popDelTxt').textContent = popRole==='doc'?'Delete session':'Delete shift';
    const p=$('#pop'), r=b.getBoundingClientRect();
    p.classList.add('on');
    p.style.left=Math.min(r.left,innerWidth-210)+'px';
    p.style.top=Math.min(r.bottom+6,innerHeight-230)+'px';
    return;
  }
  if(!e.target.closest('#pop')) $('#pop').classList.remove('on');
  if(cell && !b){
    if(activeRole==='doc') openSess(cell.dataset.doc, +cell.dataset.day);
    else openShift(cell.dataset.doc, +cell.dataset.day);
  }
});
$('#pop').addEventListener('click',e=>{
  const b=e.target.closest('button[data-a]'); if(!b) return;
  const a=b.dataset.a;
  $('#pop').classList.remove('on');
  if(popRole==='doc'){
    const s=SESS[popIdx];
    if(a==='edit') openSess(s.d,s.day,popIdx);
    if(a==='block'){ s.k='bl'; s.svc='Blocked (admin)'; render(); markDirty(); toast('Date blocked'); }
    if(a==='sub')  openExc(s.d,'lv');
    if(a==='del'){ SESS.splice(popIdx,1); render(); markDirty(); toast('Session deleted'); }
  } else {
    const s=SESS_STAFF[popIdx];
    if(a==='edit') openShift(s.d,s.day,popIdx);
    if(a==='block'){ s.k='bl'; s.shift='Blocked (admin)'; renderStaff(); markDirtyStaff(); toast('Date blocked'); }
    if(a==='sub')  openStaffExc(s.d,'lv');
    if(a==='del'){ SESS_STAFF.splice(popIdx,1); renderStaff(); markDirtyStaff(); toast('Shift deleted'); }
  }
});

/* ---------- DRAWERS ---------- */
const ovl=$('#ovl');
function closeDrw(){ovl.classList.remove('on');$$('.drw').forEach(d=>d.classList.remove('on'));}
ovl.addEventListener('click',closeDrw);
$$('[data-close]').forEach(b=>b.addEventListener('click',closeDrw));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDrw();$('#pop').classList.remove('on');}});

let editIdx=null;
function getSelectedSvcs(){ return bSvcMchk.get(); }
function setSelectedSvcs(list){ bSvcMchk.set(list); }
function openSess(docId,day,idx){
  editIdx = idx==null?null:idx;
  $('#sessTitle').textContent = idx==null?'Add recurring session':'Edit session';
  if(docId) $('#bDoc').value=docId;
  updateSessBranchDept();
  if(day!=null) $$('#bDays .dchip').forEach(c=>c.classList.toggle('on',+c.dataset.d===day));
  if(idx!=null){
    const s=SESS[idx];
    if(s.k!=='lv'){$('#bStart').value=s.s;$('#bEnd').value=s.e;}
    if(s.room)$('#bRoom').value=s.room;
    if(s.branch) $('#bBranch').value=s.branch;
    if(s.dept) $('#bDept').value=s.dept;
    $('#bSessName').value = s.sessName||'';
    $('#bResGroup').value = s.resGroup||RESOURCE_GROUPS[0];
    $('#bStatus').value = s.status||'Active';
    $('#bRecur').value = s.recur||'weekly';
    $('#bNotes').value = s.notes||'';
    setSelectedSvcs(s.svcs && s.svcs.length ? s.svcs : (s.svc?[s.svc]:[]));
    $('#bRecurCustom').value = s.recurCustom||'';
  } else {
    $('#bSessName').value=''; $('#bResGroup').value=RESOURCE_GROUPS[0]; $('#bStatus').value='Active';
    $('#bRecur').value='weekly'; $('#bNotes').value='';
    setSelectedSvcs([]); $('#bRecurCustom').value='';
  }
  syncSessForm();
  preview(); ovl.classList.add('on'); $('#drwSess').classList.add('on');
}
$('#addBtn').addEventListener('click',()=>{ if(activeRole==='doc') openSess(null,null); else openShift(null,null); });

const mins=t=>{const[a,b]=t.split(':').map(Number);return a*60+b;};
const MONTH=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function clash(day,st,en,room,doc){
  return SESS.some((s,i)=> i!==editIdx && s.day===day && s.k!=='lv' && s.e &&
    (s.room===room || s.d===doc) && mins(s.s)<en && st<mins(s.e));
}
const isoDate=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function updateRecurHint(){
  $('#bRecurCustomFld').style.display = $('#bRecur').value==='custom' ? '' : 'none';
  $('#bRecurHint').textContent = $('#bRecur').value==='custom'
    ? 'Custom recurrence. Adjust individual occurrences from the roster grid after creating this session.'
    : 'Repeats every week on the days selected above.';
}
function preview(){
  const days=$$('#bDays .dchip.on').map(c=>+c.dataset.d);
  const st=mins($('#bStart').value||'00:00'), en=mins($('#bEnd').value||'00:00');
  const room=$('#bRoom').value, svcs=getSelectedSvcs(), svc=svcs.join(' + ')||'No service selected', doc=$('#bDoc').value;
  const from=new Date($('#bFrom').value||'2026-08-17'), until=new Date($('#bUntil').value||'2026-09-30');
  const out=[]; let bad=0, hol=0;
  for(let d=new Date(from); d<=until && out.length<400; d.setDate(d.getDate()+1)){
    const wd=(d.getDay()+6)%7;
    if(!days.includes(wd)) continue;
    const c=clash(wd,st,en,room,doc);
    const isHol=HOLIDAYS.includes(isoDate(d));
    if(c) bad++; if(isHol) hol++;
    out.push({label:d.getDate()+' '+MONTH[d.getMonth()]+' '+d.getFullYear(),wd,c,isHol});
  }
  const p=$('#bPrev');
  if(!out.length || en<=st){
    p.innerHTML=`<div class="empty" style="padding:20px 12px">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <b>Nothing to create</b><span>${en<=st?'End time must be after start time.':'Pick at least one repeat day inside the validity range.'}</span></div>`;
  }else{
    p.innerHTML = out.slice(0,7).map(o=>`<div class="prow${o.c||o.isHol?' bad':''}">
        <span class="pd">${DAYS[o.wd]} ${o.label}</span>
        <span class="pi">${$('#bStart').value}–${$('#bEnd').value} · ${room} · ${svc}</span>
        ${o.c?'<span class="chip bad">Clash</span>':o.isHol?'<span class="chip warn">Branch holiday</span>':'<span class="chip ok">No clash</span>'}</div>`).join('')
      + (out.length>7?`<div class="prow"><span class="pi" style="color:var(--ink-muted)">+ ${out.length-7} more occurrences through ${out[out.length-1].label}</span></div>`:'');
  }
  const slots=en>st?Math.floor((en-st)/parseInt($('#bSlot').value)):0;
  $('#bWarn').innerHTML = (!svcs.length?`<div class="warnbox bad">
      <span style="color:var(--danger);flex:none">${ic.warn}</span>
      <div><b>No service selected</b><span>Pick at least one service this session can be booked for.</span></div></div>`:'')
    + (bad?`<div class="warnbox bad">
      <span style="color:var(--danger);flex:none">${ic.warn}</span>
      <div><b>${bad} of ${out.length} occurrences conflict</b>
      <span>${room} or the doctor is already rostered in that window. Save anyway and they will appear as conflicts on the grid.</span></div></div>`:'')
    + (hol?`<div class="warnbox">
      <span style="color:var(--warning);flex:none">${ic.warn}</span>
      <div><b>${hol} occurrence${hol===1?'':'s'} fall${hol===1?'s':''} on a branch holiday</b>
      <span>These dates are skipped automatically once the roster is published.</span></div></div>`:'')
    + (!bad && !hol && svcs.length && out.length?`<div class="warnbox" style="background:var(--success-soft);border-color:#BFE6D0">
      <span style="color:var(--success);flex:none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
      <div><b>${out.length} occurrences · ${slots} bookable slots each</b><span>No clash with existing roster, rooms or leave.</span></div></div>`:'');
}
['#bDoc','#bStart','#bEnd','#bRoom','#bSlot','#bFrom','#bUntil','#bBranch','#bDept'].forEach(s=>$(s).addEventListener('input',preview));
$('#bDays').addEventListener('click',e=>{const c=e.target.closest('.dchip');if(!c)return;c.classList.toggle('on');preview();});
$('#bSave').addEventListener('click',()=>{
  const days=$$('#bDays .dchip.on').map(c=>+c.dataset.d);
  if(!days.length) return toast('Pick at least one repeat day');
  const st=mins($('#bStart').value), en=mins($('#bEnd').value);
  if(en<=st) return toast('End time must be after start time');
  const svcs=getSelectedSvcs();
  if(!svcs.length) return toast('Pick at least one service');
  const rec={d:$('#bDoc').value,day:days[0],s:$('#bStart').value,e:$('#bEnd').value,
    room:$('#bRoom').value,svc:svcs.join(' + '),svcs,
    branch:$('#bBranch').value,dept:$('#bDept').value,sessName:$('#bSessName').value,
    recur:$('#bRecur').value,recurCustom:$('#bRecurCustom').value,resGroup:$('#bResGroup').value,status:$('#bStatus').value,notes:$('#bNotes').value,
    k:clash(days[0],st,en,$('#bRoom').value,$('#bDoc').value)?'cf':'ok',why:'Overlaps an existing session'};
  if(editIdx!=null) SESS[editIdx]=rec; else days.forEach(dy=>SESS.push({...rec,day:dy}));
  closeDrw(); render(); markDirty();
  toast(editIdx!=null?'Session updated':days.length+' weekly session'+(days.length>1?'s':'')+' created');
});

/* EXCEPTION & LEAVE */
function openExc(docId,type){
  if(docId) $('#eDoc').value=docId;
  if(type) $('#eType').value=type;
  subs(); impact(); ovl.classList.add('on'); $('#drwExc').classList.add('on');
}
$('#excBtn').addEventListener('click',()=>{ if(activeRole==='doc') openExc('hk','lv'); else openStaffExc('sohela','lv'); });
function subs(){
  const cur=$('#eDoc').value, curDoc=DOCS.find(d=>d.id===cur), dep=curDoc.dep, curSvcs=curDoc.services||[];
  $('#eSubs').innerHTML = DOCS.filter(d=>d.id!==cur).map(d=>{
    const capOk = !curSvcs.length || (d.services||[]).some(sv=>curSvcs.includes(sv));
    return `
    <button class="sub" data-s="${d.id}">
      <span class="av" style="--dc:${d.c}">${d.i}</span>
      <span class="st"><b>${d.n}</b><span>${d.dep} · ${SESS.filter(s=>s.d===d.id&&s.k!=='lv').length} sessions this week</span></span>
      <span style="display:flex;flex-direction:column;gap:3px;align-items:flex-end">
        ${d.dep===dep?'<span class="chip ok">Same dept</span>':'<span class="chip mute">Cross-cover</span>'}
        ${capOk?'':'<span class="chip bad">Can’t perform service</span>'}
      </span>
    </button>`;}).join('')
    + `<button class="sub on" data-s="none">
        <span class="av" style="--dc:var(--ink-muted)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
        <span class="st"><b>Leave uncovered</b><span>Slots are withdrawn and patients are contacted</span></span>
        <span class="chip bad">Cancels bookings</span></button>`;
}
function impact(){
  const cur=$('#eDoc').value, curDoc=DOCS.find(d=>d.id===cur), curSvcs=curDoc.services||[];
  const from=new Date($('#eFrom').value||'2026-08-20'), until=new Date($('#eUntil').value||'2026-08-21');
  const dayset=[]; for(let d=new Date(from);d<=until;d.setDate(d.getDate()+1)) dayset.push((d.getDay()+6)%7);
  const hit=SESS.filter(s=>s.d===cur&&dayset.includes(s.day)&&s.k!=='lv');
  /* real appointment count comes from the appointments service · this is a deterministic stand-in for the demo */
  const appts=hit.length*6;
  const sub=$('#eSubs .sub.on'), covered = sub && sub.dataset.s!=='none';
  $('#eImpactT').textContent = appts?`${appts} booked appointments affected`:'No booked appointments affected';
  $('#eImpactS').textContent = `${hit.length} session${hit.length===1?'':'s'} fall inside this range · `+
    (covered?`covered by ${DOCS.find(d=>d.id===sub.dataset.s).n}`:'currently uncovered, bookings will be cancelled');
  $('#eImpact').className='warnbox'+(covered||!appts?'':' bad');
  if(covered){
    const subDoc=DOCS.find(d=>d.id===sub.dataset.s);
    const capOk = !curSvcs.length || (subDoc.services||[]).some(sv=>curSvcs.includes(sv));
    $('#eCapWarn').innerHTML = capOk?'':`<div class="warnbox bad">
      <span style="color:var(--danger);flex:none">${ic.warn}</span>
      <div><b>Substitute doctor cannot perform ${curDoc.n.split(' ').slice(-1)[0]}'s mapped service</b>
      <span>${subDoc.n} does not carry any of ${curDoc.n}'s services (${curSvcs.join(', ')||'none mapped'}). Choose a different substitute or leave uncovered.</span></div></div>`;
  } else { $('#eCapWarn').innerHTML=''; }
}
['#eDoc','#eFrom','#eUntil','#eType'].forEach(s=>$(s).addEventListener('change',()=>{subs();impact();}));
$('#eSubs').addEventListener('click',e=>{
  const b=e.target.closest('.sub'); if(!b) return;
  $$('#eSubs .sub').forEach(x=>x.classList.toggle('on',x===b)); impact();
});
$('#eType').addEventListener('change',e=>{
  const t=e.target.value;
  $('#excTitle').textContent = t==='lv'?'Leave':t==='bl'?'Block':t==='tc'?'Temporary change':'Substitution';
  $('#eDoc').disabled = t==='hd';
  $('#eTcFields').style.display = t==='tc'?'grid':'none';
  $('#eSubsSect').textContent = t==='sub'?'Substitute doctor (required)':'Substitute doctor';
});
$('#eSave').addEventListener('click',()=>{
  const cur=$('#eDoc').value, t=$('#eType').value;
  const from=new Date($('#eFrom').value), until=new Date($('#eUntil').value);
  const dayset=[]; for(let d=new Date(from);d<=until;d.setDate(d.getDate()+1)) dayset.push((d.getDay()+6)%7);
  const sub=$('#eSubs .sub.on'), covered = sub && sub.dataset.s!=='none';

  if(t==='tc'){
    const ns=$('#eTcStart').value, ne=$('#eTcEnd').value;
    if(mins(ne)<=mins(ns)) return toast('New end time must be after new start time');
    let changed=0;
    SESS.forEach(s=>{ if(s.d===cur && dayset.includes(s.day) && s.k!=='lv'){ s.s=ns; s.e=ne; changed++; } });
    closeDrw(); render(); markDirty();
    toast(changed?`Timing changed for ${changed} session${changed===1?'':'s'} in range`:'No sessions in this range to change');
    return;
  }
  if(t==='sub' && !covered) return toast('Pick a substitute doctor for a substitution');

  const label = t==='lv'?($('#eReason').value.slice(0,26)||'Leave'):t==='bl'?'Blocked ('+($('#eReason').value.slice(0,18)||'admin')+')':t==='sub'?'Substituted':'Clinic holiday';
  SESS=SESS.filter(s=>!(s.d===cur&&dayset.includes(s.day)));
  dayset.forEach(dy=>SESS.push({d:cur,day:dy,s:'—',e:'',room:'',svc:label,k:t==='bl'?'bl':'lv'}));
  if(covered) dayset.forEach(dy=>SESS.push({d:sub.dataset.s,day:dy,s:'10:00',e:'13:00',room:'Consulting Room 1',svc:'Cover clinic',k:'ok'}));
  closeDrw(); render(); markDirty();
  toast(covered?'Exception applied · cover assigned':'Exception applied · slots uncovered');
});

/* ====================================================================
   NURSING & STAFF · shift builder, exception & leave, publish
==================================================================== */
function setToggle(id,val){ const b=$('#'+id); b.classList.toggle('on',val); b.textContent=val?'On':'Off'; }
const isToggleOn=id=>$('#'+id).classList.contains('on');
$('#shOnCall').addEventListener('click',()=>setToggle('shOnCall',!isToggleOn('shOnCall')));
/* Temporary assignment (BRD §10 C): conditional branch/unit, only when the toggle is on */
$('#shTmpAsg').addEventListener('click',()=>{ const on=!isToggleOn('shTmpAsg'); setToggle('shTmpAsg',on); $('#shTmpFields').style.display=on?'grid':'none'; });
$('#shOT').addEventListener('click',()=>{ setToggle('shOT',!isToggleOn('shOT')); updateOTFieldsVis(); shiftPreview(); });
function updateOTFieldsVis(){
  const on=isToggleOn('shOT');
  $('#shOTFields').style.display = on?'grid':'none';
  $('#shOTHint').style.display = on?'block':'none';
}

function updateShiftDeptOptions(){
  const sel=$('#shDept'); sel.innerHTML=DEPTS.map(d=>`<option value="${d}">${d}</option>`).join('');
  $('#shTmpDept').innerHTML=sel.innerHTML;
  const st=STAFF.find(x=>x.id===$('#shDoc').value);
  if(st) sel.value=st.dep;
}
function updateShiftBranchDefault(){
  const st=STAFF.find(x=>x.id===$('#shDoc').value);
  if(st) $('#shBranch').value=st.branch;
}
$('#shDoc').addEventListener('change',()=>{ updateShiftDeptOptions(); updateShiftBranchDefault(); shiftPreview(); });
$('#shTemplate').addEventListener('change',()=>{
  const t=SHIFT_TEMPLATES.find(x=>x.n===$('#shTemplate').value);
  if(t){ $('#shStart').value=t.s; $('#shEnd').value=t.e; }
  shiftPreview();
});

let editShiftIdx=null;
function openShift(staffId,day,idx){
  editShiftIdx = idx==null?null:idx;
  $('#shiftTitle').textContent = idx==null?'Add shift':'Edit shift';
  if(staffId) $('#shDoc').value=staffId;
  updateShiftDeptOptions(); updateShiftBranchDefault();
  if(day!=null) $$('#shDays .dchip').forEach(c=>c.classList.toggle('on',+c.dataset.d===day));
  if(idx!=null){
    const s=SESS_STAFF[idx];
    if(s.k!=='lv'){ $('#shStart').value=s.s; $('#shEnd').value=s.e; }
    if(s.dept) $('#shDept').value=s.dept;
    if(s.branch) $('#shBranch').value=s.branch;
    $('#shName').value = s.shName||'';
    $('#shRotation').value = s.rotation||'Fixed';
    $('#shNotes').value = s.notes||'';
    $('#shTemplate').value = SHIFT_TEMPLATES.some(t=>t.n===s.shift)?s.shift:'custom';
    setToggle('shOnCall',!!s.oc); setToggle('shOT',!!s.ot);
    if(s.ot){ if(s.otStart)$('#shOTStart').value=s.otStart; if(s.otEnd)$('#shOTEnd').value=s.otEnd; }
  } else {
    setToggle('shOnCall',false); setToggle('shOT',false); setToggle('shTmpAsg',false); $('#shTmpFields').style.display='none';
    $('#shName').value=''; $('#shRotation').value='Fixed'; $('#shNotes').value='';
  }
  updateOTFieldsVis();
  shiftPreview(); ovl.classList.add('on'); $('#drwShift').classList.add('on');
}
function clashStaff(day,st,en,staffId){
  const enAdj = en<=st ? en+1440 : en; /* overnight shift (e.g. Night 23:00–07:00) wraps past midnight */
  return SESS_STAFF.some((s,i)=> i!==editShiftIdx && s.day===day && s.k!=='lv' && s.e && s.d===staffId && mins(s.s)<enAdj && st<mins(s.e));
}
function shiftPreview(){
  const days=$$('#shDays .dchip.on').map(c=>+c.dataset.d);
  const st=mins($('#shStart').value||'00:00'), en=mins($('#shEnd').value||'00:00');
  const staffId=$('#shDoc').value, dept=$('#shDept').value||'', branch=$('#shBranch').value||'';
  const home=STAFF.find(x=>x.id===staffId);
  const outsideBranch = home && branch && branch!==home.branch;
  const shiftName=$('#shTemplate').value==='custom'?'Custom shift':$('#shTemplate').value;
  const from=new Date($('#shFrom').value||'2026-08-17'), until=new Date($('#shUntil').value||'2026-09-30');
  const out=[]; let bad=0;
  for(let d=new Date(from); d<=until && out.length<400; d.setDate(d.getDate()+1)){
    const wd=(d.getDay()+6)%7;
    if(!days.includes(wd)) continue;
    const c=clashStaff(wd,st,en,staffId);
    if(c) bad++;
    out.push({label:d.getDate()+' '+MONTH[d.getMonth()]+' '+d.getFullYear(),wd,c});
  }
  const p=$('#shPrev');
  if(!out.length || en===st){
    p.innerHTML=`<div class="empty" style="padding:20px 12px">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      <b>Nothing to create</b><span>${en===st?'Start and end time can&rsquo;t be the same.':'Pick at least one repeat day inside the validity range.'}</span></div>`;
  }else{
    p.innerHTML = out.slice(0,7).map(o=>`<div class="prow${o.c?' bad':''}">
        <span class="pd">${DAYS[o.wd]} ${o.label}</span>
        <span class="pi">${$('#shStart').value}–${$('#shEnd').value} · ${dept} · ${shiftName}</span>
        ${o.c?'<span class="chip bad">Clash</span>':'<span class="chip ok">No clash</span>'}</div>`).join('')
      + (out.length>7?`<div class="prow"><span class="pi" style="color:var(--ink-muted)">+ ${out.length-7} more occurrences through ${out[out.length-1].label}</span></div>`:'');
  }
  $('#shWarn').innerHTML = (bad?`<div class="warnbox bad">
      <span style="color:var(--danger);flex:none">${ic.warn}</span>
      <div><b>${bad} of ${out.length} occurrences conflict</b>
      <span>This staff member is already rostered in that window. Save anyway and they will appear as conflicts on the grid.</span></div></div>`:'')
    + (outsideBranch?`<div class="warnbox">
      <span style="color:var(--warning);flex:none">${ic.warn}</span>
      <div><b>Outside branch employment mapping</b>
      <span>${home.n} is employed at ${home.branch}. This shift is at ${branch}, recorded as a temporary assignment.</span></div></div>`:'')
    + (!bad && !outsideBranch && out.length?`<div class="warnbox" style="background:var(--success-soft);border-color:#BFE6D0">
      <span style="color:var(--success);flex:none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
      <div><b>${out.length} occurrences</b><span>No clash with this staff member's existing roster or leave.</span></div></div>`:'');
}
['#shStart','#shEnd','#shDept','#shBranch','#shFrom','#shUntil'].forEach(s=>$(s).addEventListener('input',shiftPreview));
$('#shDays').addEventListener('click',e=>{const c=e.target.closest('.dchip');if(!c)return;c.classList.toggle('on');shiftPreview();});
$('#shSave').addEventListener('click',()=>{
  const days=$$('#shDays .dchip.on').map(c=>+c.dataset.d);
  if(!days.length) return toast('Pick at least one repeat day');
  const st=mins($('#shStart').value), en=mins($('#shEnd').value);
  if(en===st) return toast('Start and end time can’t be the same');
  const staffId=$('#shDoc').value, dept=$('#shDept').value, branch=$('#shBranch').value;
  const homeStaff=STAFF.find(x=>x.id===staffId), home=homeStaff.dep;
  const shiftName=$('#shTemplate').value==='custom'?'Custom shift':$('#shTemplate').value;
  const isTemp = dept!==home || branch!==homeStaff.branch;
  const ot=isToggleOn('shOT');
  const rec={d:staffId,day:days[0],s:$('#shStart').value,e:$('#shEnd').value,
    dept, branch, shName:$('#shName').value, rotation:$('#shRotation').value, notes:$('#shNotes').value,
    shift:shiftName, oc:isToggleOn('shOnCall'), ot, otStart:ot?$('#shOTStart').value:'', otEnd:ot?$('#shOTEnd').value:'',
    k: clashStaff(days[0],st,en,staffId)?'cf':(isTemp?'ta':'ok'), why:'Overlaps an existing shift for this staff member'};
  if(editShiftIdx!=null) SESS_STAFF[editShiftIdx]=rec; else days.forEach(dy=>SESS_STAFF.push({...rec,day:dy}));
  closeDrw(); renderStaff(); markDirtyStaff();
  toast(editShiftIdx!=null?'Shift updated':days.length+' weekly shift'+(days.length>1?'s':'')+' created');
});

/* STAFF EXCEPTION & LEAVE */
function openStaffExc(staffId,type){
  if(staffId) $('#seDoc').value=staffId;
  if(type) $('#seType').value=type;
  subsStaff(); impactStaff(); ovl.classList.add('on'); $('#drwStaffExc').classList.add('on');
}
function subsStaff(){
  const cur=$('#seDoc').value, dep=STAFF.find(d=>d.id===cur).dep;
  $('#seSubs').innerHTML = STAFF.filter(d=>d.id!==cur).map(d=>`
    <button class="sub" data-s="${d.id}">
      <span class="av" style="--dc:${d.c}">${d.i}</span>
      <span class="st"><b>${d.n}</b><span>${d.dep} · ${SESS_STAFF.filter(s=>s.d===d.id&&s.k!=='lv').length} shifts this week</span></span>
      ${d.dep===dep?'<span class="chip ok">Same dept</span>':'<span class="chip mute">Cross-cover</span>'}
    </button>`).join('')
    + `<button class="sub on" data-s="none">
        <span class="av" style="--dc:var(--ink-muted)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
        <span class="st"><b>Leave uncovered</b><span>Shift is withdrawn, shift-lead is notified</span></span>
        <span class="chip bad">Uncovered floor</span></button>`;
}
function impactStaff(){
  const cur=$('#seDoc').value;
  const from=new Date($('#seFrom').value||'2026-08-20'), until=new Date($('#seUntil').value||'2026-08-21');
  const dayset=[]; for(let d=new Date(from);d<=until;d.setDate(d.getDate()+1)) dayset.push((d.getDay()+6)%7);
  const hit=SESS_STAFF.filter(s=>s.d===cur&&dayset.includes(s.day)&&s.k!=='lv');
  const sub=$('#seSubs .sub.on'), covered = sub && sub.dataset.s!=='none';
  $('#seImpactT').textContent = hit.length?`${hit.length} shift${hit.length===1?'':'s'} affected`:'No shifts affected';
  $('#seImpactS').textContent = `${hit.length} shift${hit.length===1?'':'s'} fall inside this range · `+
    (covered?`covered by ${STAFF.find(d=>d.id===sub.dataset.s).n}`:'currently uncovered, floor runs short-staffed');
  $('#seImpact').className='warnbox'+(covered||!hit.length?'':' bad');
}
['#seDoc','#seFrom','#seUntil','#seType'].forEach(s=>$(s).addEventListener('change',()=>{subsStaff();impactStaff();}));
$('#seSubs').addEventListener('click',e=>{
  const b=e.target.closest('.sub'); if(!b) return;
  $$('#seSubs .sub').forEach(x=>x.classList.toggle('on',x===b)); impactStaff();
});
$('#seType').addEventListener('change',e=>{
  const t=e.target.value;
  $('#sExcTitle').textContent = t==='lv'?'Leave':t==='bl'?'Temporary block':'Clinic holiday';
  $('#seDoc').disabled = t==='hd';
});
$('#seSave').addEventListener('click',()=>{
  const cur=$('#seDoc').value, t=$('#seType').value;
  const from=new Date($('#seFrom').value), until=new Date($('#seUntil').value);
  const dayset=[]; for(let d=new Date(from);d<=until;d.setDate(d.getDate()+1)) dayset.push((d.getDay()+6)%7);
  const sub=$('#seSubs .sub.on'), covered = sub && sub.dataset.s!=='none';
  const label = t==='lv'?($('#seReason').value.slice(0,26)||'Leave'):t==='bl'?'Blocked ('+($('#seReason').value.slice(0,18)||'admin')+')':'Clinic holiday';
  SESS_STAFF=SESS_STAFF.filter(s=>!(s.d===cur&&dayset.includes(s.day)));
  dayset.forEach(dy=>SESS_STAFF.push({d:cur,day:dy,s:'—',e:'',dept:'',shift:label,oc:false,ot:false,k:t==='bl'?'bl':'lv'}));
  if(covered) dayset.forEach(dy=>SESS_STAFF.push({d:sub.dataset.s,day:dy,s:'09:00',e:'17:00',dept:STAFF.find(x=>x.id===cur).dep,shift:'Cover shift',oc:false,ot:false,k:'ok'}));
  closeDrw(); renderStaff(); markDirtyStaff();
  toast(covered?'Exception applied · cover assigned':'Exception applied · shift uncovered');
});

/* ---------- STAFF PUBLISH ---------- */
let publishedStaff=false;
function updateStaffPubStatus(){
  const chip=$('#sPubStatus'), btn=$('#sPublishBtn');
  chip.className='chip '+(publishedStaff?'ok':'warn');
  chip.textContent=publishedStaff?'Confirmed · visible to shift-leads':'Draft · not confirmed';
  chip.title=publishedStaff?'Nursing lead and department heads can see this roster':'Draft changes are only visible to Clinic Admin so far';
  btn.innerHTML=(publishedStaff
    ?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Confirmed'
    :'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Confirm roster');
  btn.className='btn btn-sm '+(publishedStaff?'btn-ghost':'btn-primary');
}
function markDirtyStaff(){ if(publishedStaff){ publishedStaff=false; updateStaffPubStatus(); toast('Roster changed, reconfirm to notify shift-leads'); } }
$('#sPublishBtn').addEventListener('click',()=>{
  const cf=SESS_STAFF.filter(s=>s.k==='cf').length;
  if(cf){
    toast(`Cannot confirm: ${Math.ceil(cf/2)} conflict(s) must be resolved`);
    $('#sCfBanner').classList.remove('gone');
    $('#sCfReview').click();
    return;
  }
  publishedStaff=true; updateStaffPubStatus();
  toast('Roster confirmed, visible to Nursing lead and department heads');
});
updateStaffPubStatus();

/* ---------- PUBLISH · draft roster only becomes live/bookable once published ---------- */
let published=false;
function updatePubStatus(){
  const chip=$('#pubStatus'), btn=$('#publishBtn');
  chip.className='chip '+(published?'ok':'warn');
  chip.textContent=published?'Published · live on booking channels':'Draft · not published';
  chip.title=published?'Website, WhatsApp, Voice and Reception all read this roster':'Draft changes are not visible to any booking channel yet';
  btn.innerHTML=(published
    ?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Published'
    :'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Publish roster');
  btn.className='btn btn-sm '+(published?'btn-ghost':'btn-primary');
}
function markDirty(){ if(published){ published=false; updatePubStatus(); toast('Roster changed, republish to update booking channels'); } }
$('#publishBtn').addEventListener('click',()=>{
  const cf=SESS.filter(s=>s.k==='cf').length;
  if(cf){
    toast(`Cannot publish: ${Math.ceil(cf/2)} conflict(s) must be resolved`);
    $('#cfBanner').classList.remove('gone');
    $('#cfReview').click();
    return;
  }
  published=true; updatePubStatus();
  toast('Roster published, now live on website, WhatsApp, Voice and Reception');
});
updatePubStatus();

/* current-branch context switcher (shared across every admin screen) */
const CTX_BRANCHES = ['Main Campus','OPD Annexe','Madhurawada Branch'];
const ctxBrDD = makeDropdown('ctxBr', v => toast('Switched to ' + v));
ctxBrDD.setOptions(CTX_BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.value = 'Main Campus';

/* deep-link from clinic-branch.html's "→ Configure Staff Shifts" button · same
   location.href='target.html?param=...' + URLSearchParams convention used by
   doctors-staff.html's "Also create login access" → user-onboard.html?linkStaff=... */
(function(){
  const params = new URLSearchParams(location.search);
  const linkBranch = params.get('branch');
  if(linkBranch && CTX_BRANCHES.includes(linkBranch)) ctxBrDD.value = linkBranch;
  if(params.get('role')==='staff'){
    const b = $('#roleSeg button[data-r="staff"]');
    if(b) b.click();
  }
})();


/* ---------- BRD workspace tabs (Doctor Sessions / Staff Rosters / On-call / Leave & Blocks / Substitutions) ----------
   Drives the existing role + top-tab logic, which stays as the single source of truth. */
$('#wsTabs').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  $$('#wsTabs button').forEach(x=>x.classList.toggle('on',x===b));
  const ws=b.dataset.ws;
  if(ws==='docsess'||ws==='staffrost'){ $('#topTabSeg [data-tab="roster"]').click(); $('#roleSeg [data-r="'+(ws==='docsess'?'doc':'staff')+'"]').click(); }
  else $('#topTabSeg [data-tab="'+ws+'"]').click();
});
$$('.drw select.fsel').forEach(enhanceSelect);
