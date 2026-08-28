document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ---------- custom dropdown driver (replaces native <select> · its popup can't be styled) ---------- */
function initFormSelect(wrapId,btnId,panelId,hiddenId,options,onPick){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  const buildPanel = opts => { panel.innerHTML = opts.map(o=>'<button type="button" class="fselopt" data-v="'+o+'">'+o+'</button>').join(''); };
  const setVal = v => {
    hidden.value=v; btn.textContent=v;
    $$('.fselopt',panel).forEach(x=>x.classList.toggle('on', x.dataset.v===v));
  };
  buildPanel(options);
  if(options.length) setVal(options[0]);
  panel.addEventListener('click', e=>{
    const b=e.target.closest('.fselopt'); if(!b) return;
    setVal(b.dataset.v);
    root.classList.remove('open');
    if(onPick) onPick(b.dataset.v);
  });
  btn.addEventListener('click', e=>{
    e.stopPropagation();
    const wasOpen=root.classList.contains('open');
    $$('.fsel').forEach(x=>x.classList.remove('open'));
    if(!wasOpen) root.classList.add('open');
  });
  return { set:setVal, get:()=>hidden.value, setOptions:opts=>{ buildPanel(opts); setVal(opts[0]); } };
}
document.addEventListener('click', ()=>$$('.fsel').forEach(x=>x.classList.remove('open')));
document.addEventListener('keydown', e=>{ if(e.key==='Escape') $$('.fsel').forEach(x=>x.classList.remove('open')); });

const dnReasonDD = initFormSelect('dnReasonWrap','dnReasonBtn','dnReasonPanel','dnReason', ['Maintenance','Servicing / recalibration','Reserved (internal use)','Out of service']);
function fmtDate(iso){ const d=new Date(iso); return d.getDate().toString().padStart(2,'0')+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'][d.getMonth()]+' '+d.getFullYear(); }
function dateDiffDays(a,b){ return Math.floor((new Date(b)-new Date(a))/864e5)+1; }
const DAY_NAMES_FULL=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const EDIT_ICON='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>';
const X='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const mins = t => { const p=(t||'').split(':'); return p.length===2 ? (+p[0])*60 + (+p[1]) : 0; };
const label = m => { const h=Math.floor(m/60), mm=m%60; const ap=h<12?'AM':'PM'; const h12=(h%12)||12; return h12+':'+String(mm).padStart(2,'0')+' '+ap; };
const daysTxt=d=>{ const n=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; const on=d.map((x,i)=>x?i:-1).filter(i=>i>=0); if(!on.length) return 'None';
  let run=true; for(let i=1;i<on.length;i++) if(on[i]!==on[i-1]+1) run=false; return run&&on.length>1 ? n[on[0]]+'–'+n[on[on.length-1]] : on.map(i=>n[i]).join(', '); };
const readChips=id=>[0,1,2,3,4,5,6].map(i=>$('#'+id+' [data-d="'+i+'"]').classList.contains('on')?1:0);
const setChips=(id,days)=>days.forEach((v,i)=>$('#'+id+' [data-d="'+i+'"]').classList.toggle('on',!!v));
$$('.daychips').forEach(w=>w.addEventListener('click',e=>{ const b=e.target.closest('.dchip'); if(b) b.classList.toggle('on'); }));
/* ==================================================================
   ROOM & EQUIPMENT SCHEDULE · BRD area 27 (was entirely missing)
   Room names match roster-sessions.html's established placeholders.
   Equipment names are not given in any source doc · generic wound-
   care equipment placeholders, same convention as those room names.
   ================================================================== */
/* Real records, mirrored from Rooms & Care Areas (3 room families) and Resources & Equipment.
   No shared runtime in this prototype, so the lists are copied by hand and must be kept in step. */
const RES_FAMILIES={
  rooms:'General Rooms', procedure:'Procedure & Treatment Rooms', stay:'Staying Rooms', equip:'Equipment'
};
const RESOURCE_META={
  /* A. General rooms */
  'Consultation Room 1':{fam:'rooms', loc:'Main Campus · OPD', cap:'Consultation · general consultation, follow-up review', sched:true},
  'Consultation Room 2':{fam:'rooms', loc:'Main Campus · OPD', cap:'Consultation · general consultation', sched:true},
  'Recovery Bay':{fam:'rooms', loc:'Main Campus · General Surgery', cap:'Waiting · post-procedure recovery', sched:false},
  'Counselling Room':{fam:'rooms', loc:'Main Campus · Wound Care', cap:'Counselling / Review · patient and family counselling', sched:true},
  'Utility & Sterile Store':{fam:'rooms', loc:'Main Campus · Administration', cap:'Utility · not bookable', sched:false},
  /* B. Procedure & treatment rooms */
  'Procedure Room 1':{fam:'procedure', loc:'Main Campus · General Surgery', cap:'Wound Debridement Bay · debridement, bedside · 1 at a time', sched:true},
  'Procedure Room 2':{fam:'procedure', loc:'Main Campus · General Surgery', cap:'Debridement, bedside, long-duration · 1 at a time', sched:true},
  'Procedure Room 3':{fam:'procedure', loc:'OPD Annexe · General Surgery', cap:'Debridement, bedside · 1 at a time', sched:true},
  'Dressing Room 1':{fam:'procedure', loc:'Main Campus · Wound Care', cap:'Dressing Change Station A · 1 at a time', sched:true},
  'Dressing Room 2':{fam:'procedure', loc:'Main Campus · Wound Care', cap:'Dressing Change Station B · 1 at a time', sched:true},
  'Progress Photography Station':{fam:'procedure', loc:'Main Campus · Wound Care', cap:'Review · progress photography, 1 at a time', sched:true},
  /* C. Staying rooms */
  'Short Stay Room 1':{fam:'stay', loc:'Main Campus · Short Stay', cap:'Day-care, Observation · 2 beds (A, B)', sched:true},
  'Short Stay Room 2':{fam:'stay', loc:'Main Campus · Short Stay', cap:'Short Stay · 1 bed (A)', sched:true},
  'Day-care Bay 1':{fam:'stay', loc:'OPD Annexe · Short Stay', cap:'Day-care · 3 beds (A, B, C)', sched:true},
  /* Equipment */
  'Debridement Kit Set A':{fam:'equip', loc:'Main Campus · Wound Care · Procedure Room 1', cap:'Procedure Equipment · qty 3', sched:true},
  'Wound VAC Unit':{fam:'equip', loc:'Main Campus · Wound Care · Dressing Room 1', cap:'Treatment Equipment · KCI ActiV.A.C. · qty 1', sched:true},
  'Digital Wound Camera':{fam:'equip', loc:'Main Campus · Wound Care · Procedure Room 1', cap:'Diagnostic Equipment · Canon EOS 250D · qty 1', sched:true},
  'Autoclave Sterilizer':{fam:'equip', loc:'Main Campus · Administration · Utility & Sterile Store', cap:'Machine · Astell AMB330 · not schedulable', sched:false},
  'Patient Wheelchair':{fam:'equip', loc:'Main Campus · OPD · no fixed location', cap:'Mobility Aid · qty 4 · not schedulable', sched:false},
  'Dressing Trolley B':{fam:'equip', loc:'Main Campus · Wound Care · Dressing Room 2', cap:'Portable Device · qty 1', sched:true}
};
const listOf=fam=>Object.keys(RESOURCE_META).filter(k=>RESOURCE_META[k].fam===fam);
const ROOMS=[...listOf('rooms'),...listOf('procedure'),...listOf('stay')];
const EQUIPMENT=listOf('equip');
const mkWeek=(onArr,s,e)=>onArr.map(on=>({on, s, e}));
const RES_WEEK={};
Object.keys(RESOURCE_META).forEach(r=>{ const f=RESOURCE_META[r].fam;
  RES_WEEK[r]= f==='stay' ? mkWeek([1,1,1,1,1,1,1],'08:00','20:00') : f==='procedure' ? mkWeek([1,1,1,1,1,1,0],'09:00','18:00') : mkWeek([1,1,1,1,1,1,0],'09:00','19:00');
  if(!RESOURCE_META[r].sched) RES_WEEK[r]=mkWeek([0,0,0,0,0,0,0],'09:00','19:00'); });
/* Downtime mirrors the block/maintenance dates already recorded on the source screens */
const DOWNTIME={};
Object.keys(RESOURCE_META).forEach(r=>DOWNTIME[r]=[]);
DOWNTIME['Procedure Room 1']=[{reason:'Servicing / recalibration', from:'2026-08-29', to:'2026-08-30', note:'Equipment servicing and recalibration'}];
DOWNTIME['Day-care Bay 1']=[{reason:'Out of service', from:'2026-08-12', to:'2026-08-19', note:'Under housekeeping · reopening next week'}];
DOWNTIME['Autoclave Sterilizer']=[{reason:'Servicing / recalibration', from:'2026-09-01', to:'2026-09-05', note:'Sent for annual calibration · back 05 Sep'}];
DOWNTIME['Dressing Trolley B']=[{reason:'Maintenance', from:'2026-08-16', to:'2026-08-23', note:'Wheel repair pending'}];
DOWNTIME['Recovery Bay']=[{reason:'Reserved (internal use)', from:'2026-08-14', to:'2026-08-31', note:'Blocked on Rooms & Care Areas'}];
DOWNTIME['Consultation Room 1']=[
  {reason:'Reserved (internal use)', from:'2026-09-04', to:'2026-09-04', note:'Clinic manager review meeting · 2 PM to 4 PM'},
  {reason:'Maintenance', from:'2026-09-12', to:'2026-09-13', note:'Air-conditioning servicing'}
];
DOWNTIME['Consultation Room 2']=[{reason:'Maintenance', from:'2026-09-12', to:'2026-09-13', note:'Air-conditioning servicing'}];
DOWNTIME['Counselling Room']=[{reason:'Reserved (internal use)', from:'2026-09-09', to:'2026-09-09', note:'Staff counselling training'}];
DOWNTIME['Dressing Room 1']=[{reason:'Out of service', from:'2026-09-20', to:'2026-09-21', note:'Deep cleaning and re-stocking'}];
DOWNTIME['Short Stay Room 1']=[{reason:'Maintenance', from:'2026-09-15', to:'2026-09-15', note:'Oxygen point inspection'}];
DOWNTIME['Wound VAC Unit']=[{reason:'Servicing / recalibration', from:'2026-09-08', to:'2026-09-09', note:'Vendor preventive service (KCI)'}];
DOWNTIME['Digital Wound Camera']=[{reason:'Servicing / recalibration', from:'2026-11-10', to:'2026-11-10', note:'Calibration due'}];

/* ---------- resource availability templates (BRD: "Resource availability template
   ... e.g. Procedure Room Standard Availability ... assignable to room / equipment /
   resource group" · shown here as an inherited-vs-override marker on the weekly
   availability card, same inheritance idea as the clinic-level badge below) ---------- */
const RES_TEMPLATES = {
  'Consulting Room Standard Availability':  {days:[1,1,1,1,1,1,0], s:'09:00', e:'19:00', note:'Mon–Sat 09:00–19:00'},
  'Procedure Room Standard Availability':   {days:[1,1,1,1,1,1,0], s:'09:00', e:'18:00', lunch:{s:'13:00',e:'14:00'}, note:'Mon–Sat 09:00–18:00 with a 13:00–14:00 lunch block'},
  'Staying Room Standard Availability':     {days:[1,1,1,1,1,1,1], s:'08:00', e:'20:00', note:'Mon–Sun 08:00–20:00'},
  'Equipment Standard Availability':        {days:[1,1,1,1,1,1,0], s:'09:00', e:'19:00', note:'Mon–Sat 09:00–19:00'}
};
const RES_TEMPLATE_ASSIGN = {};
Object.keys(RESOURCE_META).forEach(r=>{ const m=RESOURCE_META[r]; if(!m.sched) return;
  RES_TEMPLATE_ASSIGN[r]= m.fam==='rooms'?'Consulting Room Standard Availability' : m.fam==='procedure'?'Procedure Room Standard Availability' : m.fam==='stay'?'Staying Room Standard Availability' : 'Equipment Standard Availability'; });
function weekMatchesTemplate(wk,tpl){
  return wk.every((d,i)=> !!d.on===!!tpl.days[i] && (!d.on || (d.s===tpl.s && d.e===tpl.e)));
}
function renderResTemplateBadge(){
  const tplName=RES_TEMPLATE_ASSIGN[curRes], tpl=RES_TEMPLATES[tplName];
  const badge=$('#resTemplateBadge');
  if(typeof resTplDD!=='undefined'){ resTplDD.setOptions(['No template',...Object.keys(RES_TEMPLATES)]); resTplDD.set(tplName||'No template'); }
  if(!tpl){ badge.textContent=''; $('#resResetTemplate').style.display='none'; return; }
  const inherited=weekMatchesTemplate(RES_WEEK[curRes], tpl);
  badge.className='chip '+(inherited?'soft':'warn');
  badge.textContent=inherited ? 'Inherited' : 'Custom override';
  badge.title=tplName+' · '+tpl.note;
  $('#resResetTemplate').style.display=inherited?'none':'inline-flex';
}
$('#resResetTemplate').addEventListener('click', ()=>{
  const tpl=RES_TEMPLATES[RES_TEMPLATE_ASSIGN[curRes]]; if(!tpl) return;
  RES_WEEK[curRes]=tpl.days.map(on=>({on, s:tpl.s, e:tpl.e}));
  renderResWeek(); renderResStrip(); renderResTemplateBadge();
  toast(curRes+' reset to '+RES_TEMPLATE_ASSIGN[curRes]);
});

let resType='rooms';
let curRes=ROOMS[0];

const resSelDD = initFormSelect('resSelWrap','resSelBtn','resSelPanel','resSel', ROOMS, v=>{
  curRes=v;
  renderResWeek(); renderDowntime(); renderResStrip();
});
function populateResSel(){
  const list = listOf(resType);
  resSelDD.setOptions(list);
  curRes=list[0];
}
function shortCode(name){
  const m=name.match(/\d+$/);
  const words=name.replace(/\d+$/,'').trim().split(/\s+/);
  const letters=words.map(w=>w[0]).join('').toUpperCase().slice(0,2);
  return m ? letters[0]+m[0] : letters;
}
function renderResStrip(){
  const meta=RESOURCE_META[curRes]||{};
  const wk=RES_WEEK[curRes];
  $('#resAv').textContent=shortCode(curRes);
  $('#resName').textContent=curRes;
  $('#resMeta').textContent=meta.loc||'';
  $('#resCap').textContent=meta.cap||'—';
  $('#resDaysOpen').textContent=wk.filter(d=>d.on).length;
  $('#resHrsWk').textContent=Math.round(wk.reduce((a,d)=>a+(d.on?(mins(d.e)-mins(d.s))/60:0),0));
  $('#resDownCount').textContent=(DOWNTIME[curRes]||[]).length;
}
function renderResWeek(){
  const wk=RES_WEEK[curRes]; const sched=RESOURCE_META[curRes].sched;
  $('#resWeek').classList.toggle('locked',!sched); $('#resNotSched').style.display=sched?'none':'';
  $('#resWeekTitle').textContent = 'Weekly availability';
  $('#resWeek').innerHTML = wk.map((x,i)=>
    '<div class="dayblk'+(x.on?'':' off')+'" data-i="'+i+'">'
    + '<div class="drow" style="grid-template-columns:114px minmax(0,1fr) 96px 46px">'
    + '<span class="dnm">'+DAY_NAMES_FULL[i]+'</span>'
    + '<div class="times"><input type="time" class="rst" value="'+x.s+'"'+(x.on?'':' disabled')+'><span class="dash">–</span><input type="time" class="ren" value="'+x.e+'"'+(x.on?'':' disabled')+'></div>'
    + '<span class="sc">'+(x.on?'Available':'Unavailable')+'</span>'
    + '<label class="sw"><input type="checkbox" class="rdayon"'+(x.on?' checked':'')+'><i></i></label>'
    + '</div></div>'
  ).join('');
  renderResTemplateBadge(); renderResPreview();
}
$('#resWeek').addEventListener('change', e=>{
  const blk=e.target.closest('.dayblk'); if(!blk) return;
  const i=+blk.dataset.i, wk=RES_WEEK[curRes];
  wk[i].on=$('.rdayon',blk).checked; wk[i].s=$('.rst',blk).value; wk[i].e=$('.ren',blk).value;
  renderResWeek(); renderResStrip();
});

function isTodayInRange(a,b){
  const t=new Date(); t.setHours(0,0,0,0);
  return new Date(a)<=t && t<=new Date(b);
}
function renderDowntime(){
  const rows=DOWNTIME[curRes]||[];
  const downNow = rows.some(r=>isTodayInRange(r.from,r.to));
  $('#resStatus').textContent = downNow ? 'Down today' : 'Available';
  $('#resStatus').className = 'chip '+(downNow?'bad':'info');
  if(!rows.length){
    $('#downtimeBody').innerHTML='<tr><td colspan="5"><div class="empty" style="padding:28px 12px"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M9 16l2 2 4-4"/></svg><b>No downtime planned</b><span>'+curRes+' is available on all its weekly hours. Add downtime for maintenance, servicing or internal use.</span></div></td></tr>';
  } else {
    $('#downtimeBody').innerHTML = rows.map((r,i)=>{
      return '<tr><td><b>'+r.reason+'</b><span class="sub">'+(r.note||'')+'</span></td>'
        + '<td class="num">'+fmtDate(r.from)+'</td><td class="num">'+fmtDate(r.to)+'</td><td class="num">'+dateDiffDays(r.from,r.to)+'</td>'
        + '<td style="text-align:right;white-space:nowrap"><button class="iconb del" title="Remove" data-deldown="'+i+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button></td></tr>';
    }).join('');
  }
  $('#resDownCount').textContent=rows.length;
}
$('#downtimeBody').addEventListener('click', e=>{
  const del=e.target.closest('[data-deldown]'); if(!del) return;
  DOWNTIME[curRes].splice(+del.dataset.deldown,1);
  renderDowntime(); renderResPreview();
  toast('Downtime block removed');
});

$('#resTypeSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  $$('#resTypeSeg button').forEach(x=>x.classList.toggle('on', x===b));
  resType=b.dataset.t;
  populateResSel(); renderResWeek(); renderDowntime(); renderResStrip();
});

const downScrim=$('#downScrim');
$('#addDowntime').addEventListener('click', ()=>{
  $('#downFor').textContent=curRes;
  dnReasonDD.set('Maintenance'); $('#dnFrom').value='2026-08-24'; $('#dnTo').value='2026-08-25'; $('#dnNote').value='';
  downScrim.classList.add('show');
});
const closeDown=()=>downScrim.classList.remove('show');
$('#downClose').addEventListener('click', closeDown);
$('#downCancel').addEventListener('click', closeDown);
downScrim.addEventListener('click', e=>{ if(e.target===downScrim) closeDown(); });
$('#downSave').addEventListener('click', ()=>{
  const from=$('#dnFrom').value, to=$('#dnTo').value;
  if(dateDiffDays(from,to)<1){ toast('The "to" date must be on or after the "from" date.'); return; }
  DOWNTIME[curRes].push({reason:$('#dnReason').value, from, to, note:$('#dnNote').value.trim()});
  renderDowntime(); renderResPreview(); closeDown();
  toast(curRes+' blocked '+fmtDate(from)+' – '+fmtDate(to));
});


/* ---------- availability preview · timeline of the resolved week (template → override → downtime) ---------- */
function renderResPreview(){
  const wk=RES_WEEK[curRes], tplName=RES_TEMPLATE_ASSIGN[curRes], tpl=RES_TEMPLATES[tplName];
  const T0=6*60, T1=22*60, pct=m=>Math.max(0,Math.min(100,(m-T0)/(T1-T0)*100));
  const inherited = tpl && weekMatchesTemplate(wk,tpl);
  $('#resPrevSub').innerHTML = tpl ? (inherited?'<span class="chip soft">Inherited from '+esc(tplName)+'</span>':'<span class="chip warn">Custom override of '+esc(tplName)+'</span>') : '<span class="chip">No template · own hours</span>';
  const ticks=[6,9,12,15,18,21].map(h=>'<span style="left:'+pct(h*60)+'%">'+(h>12?h-12+' PM':h===12?'12 PM':h+' AM')+'</span>').join('');
  const down=(DOWNTIME[curRes]||[]);
  $('#resPrev').innerHTML='<div class="wkprev"><div class="wkprev-ticks"><span class="wkprev-daylbl"></span><div class="wkprev-axis">'+ticks+'</div></div>'
    +wk.map((d,i)=>{ const lunch = d.on && tpl && tpl.lunch;
      return '<div class="wkprev-row'+(d.on?'':' off')+'"><span class="wkprev-daylbl">'+DAY_NAMES_FULL[i]+'</span><div class="wkprev-track">'
      +(d.on?'<div class="wkprev-bar" style="left:'+pct(mins(d.s))+'%;width:'+(pct(mins(d.e))-pct(mins(d.s)))+'%"><span>'+label(mins(d.s))+' – '+label(mins(d.e))+'</span></div>'
        +(lunch?'<div class="wkprev-gap" style="left:'+pct(mins(tpl.lunch.s))+'%;width:'+(pct(mins(tpl.lunch.e))-pct(mins(tpl.lunch.s)))+'%" title="Lunch block"></div>':''):'<span class="wkprev-offlbl">Unavailable</span>')
      +'</div><span class="chip '+(d.on?'ok':'')+'" style="'+(d.on?'':'background:var(--surface-3);color:var(--ink-muted)')+'">'+(d.on?'Available':'Unavailable')+'</span></div>'; }).join('')
    +(down.length?'<div class="wkprev-down"><b>Downtime on top of this week</b>'+down.map(r=>'<span class="chip bad">'+esc(r.reason)+' · '+fmtDate(r.from)+(r.to!==r.from?' – '+fmtDate(r.to):'')+'</span>').join('')+'</div>':'')
    +'</div>';
}
/* ---------- Resource availability templates ---------- */
const assignTargets=()=>Object.keys(RESOURCE_META).filter(r=>RESOURCE_META[r].sched).map(r=>({v:r,g:RES_FAMILIES[RESOURCE_META[r].fam]}));
let editTplName=null;
function renderResTpls(){
  const names=Object.keys(RES_TEMPLATES);
  $('#resTplBody').innerHTML=names.map(n=>{ const t=RES_TEMPLATES[n]; const assigned=Object.entries(RES_TEMPLATE_ASSIGN).filter(([,v])=>v===n).map(([k])=>k);
    return '<tr><td><b>'+esc(n)+'</b></td><td>'+daysTxt(t.days)+'</td><td class="num">'+label(mins(t.s))+' – '+label(mins(t.e))+'</td><td>'+(t.lunch?label(mins(t.lunch.s))+' – '+label(mins(t.lunch.e)):'<span style="color:var(--ink-muted)">None</span>')+'</td>'
      +'<td>'+(assigned.length?assigned.length+' · <span style="color:var(--ink-muted)">'+esc(assigned.slice(0,3).join(', '))+(assigned.length>3?' +'+(assigned.length-3):'')+'</span>':'<span style="color:var(--ink-muted)">Not assigned</span>')+'</td>'
      +'<td style="text-align:right;white-space:nowrap"><button class="iconb" title="Edit" data-edittpl="'+esc(n)+'">'+EDIT_ICON+'</button><button class="iconb del" title="Remove" data-deltpl="'+esc(n)+'">'+X+'</button></td></tr>'; }).join('');
  $('#resTplFoot').textContent=names.length+' templates';
}
const tplScrim=$('#tplScrim');
function openTplModal(name){
  editTplName=name; const t=name?RES_TEMPLATES[name]:null;
  $('#tplScrimTitle').textContent=t?'Edit availability template':'Add availability template';
  $('#tpName').value=name||''; setChips('tpDays',t?t.days:[1,1,1,1,1,1,0]);
  $('#tpStart').value=t?t.s:'09:00'; $('#tpEnd').value=t?t.e:'18:00';
  $('#tpLunchSw').checked=!!(t&&t.lunch); $('#tpLunchFld').style.display=(t&&t.lunch)?'grid':'none';
  $('#tpLunchS').value=t&&t.lunch?t.lunch.s:'13:00'; $('#tpLunchE').value=t&&t.lunch?t.lunch.e:'14:00';
  $('#tpAssign').innerHTML=assignTargets().map(a=>'<label class="assignopt"><input type="checkbox" value="'+esc(a.v)+'"'+(name&&RES_TEMPLATE_ASSIGN[a.v]===name?' checked':'')+'><span>'+esc(a.v)+'</span><small>'+a.g+'</small></label>').join('');
  $('#tpSave').textContent=t?'Save changes':'Save template';
  tplScrim.classList.add('show');
}
$('#tpLunchSw').addEventListener('change',()=>{ $('#tpLunchFld').style.display=$('#tpLunchSw').checked?'grid':'none'; });
$('#addResTpl').addEventListener('click',()=>openTplModal(null));
$('#resTplBody').addEventListener('click',e=>{
  const ed=e.target.closest('[data-edittpl]'); if(ed){ openTplModal(ed.dataset.edittpl); return; }
  const del=e.target.closest('[data-deltpl]'); if(!del) return;
  const n=del.dataset.deltpl, used=Object.keys(RES_TEMPLATE_ASSIGN).filter(k=>RES_TEMPLATE_ASSIGN[k]===n);
  if(used.length){ toast('Unassign it first: '+used.length+' resource'+(used.length===1?'':'s')+' still inherit '+n); return; }
  delete RES_TEMPLATES[n]; renderResTpls(); renderResTemplateBadge(); toast('Template removed');
});
const closeTpl=()=>tplScrim.classList.remove('show');
$('#tpClose').addEventListener('click',closeTpl); $('#tpCancel').addEventListener('click',closeTpl);
tplScrim.addEventListener('click',e=>{ if(e.target===tplScrim) closeTpl(); });
$('#tpSave').addEventListener('click',()=>{
  const name=$('#tpName').value.trim(); if(!name){ toast('Give the template a name'); return; }
  const days=readChips('tpDays'); if(!days.some(Boolean)){ toast('Pick at least one day'); return; }
  if(mins($('#tpEnd').value)<=mins($('#tpStart').value)){ toast('End time must be after the start time'); return; }
  const lunch=$('#tpLunchSw').checked?{s:$('#tpLunchS').value,e:$('#tpLunchE').value}:null;
  if(editTplName && editTplName!==name){ delete RES_TEMPLATES[editTplName]; Object.keys(RES_TEMPLATE_ASSIGN).forEach(k=>{ if(RES_TEMPLATE_ASSIGN[k]===editTplName) RES_TEMPLATE_ASSIGN[k]=name; }); }
  RES_TEMPLATES[name]={days, s:$('#tpStart').value, e:$('#tpEnd').value, lunch, note:daysTxt(days)+' '+$('#tpStart').value+'–'+$('#tpEnd').value+(lunch?' with a '+lunch.s+'–'+lunch.e+' lunch block':'')};
  $$('#tpAssign input').forEach(cb=>{ if(cb.checked){ RES_TEMPLATE_ASSIGN[cb.value]=name; if(RES_WEEK[cb.value]) RES_WEEK[cb.value]=days.map(on=>({on:!!on,s:$('#tpStart').value,e:$('#tpEnd').value})); } else if(RES_TEMPLATE_ASSIGN[cb.value]===name) delete RES_TEMPLATE_ASSIGN[cb.value]; });
  renderResTpls(); renderResWeek(); renderResStrip(); closeTpl(); toast('Template "'+name+'" saved');
});
/* per-resource template assign (inherit) · on the weekly availability card */
var resTplDD=initFormSelect('resTplSelWrap','resTplSelBtn','resTplSelPanel','resTplSel',['No template',...Object.keys(RES_TEMPLATES)],v=>{
  if(v==='No template'){ delete RES_TEMPLATE_ASSIGN[curRes]; }
  else { RES_TEMPLATE_ASSIGN[curRes]=v; const t=RES_TEMPLATES[v]; RES_WEEK[curRes]=t.days.map(on=>({on:!!on,s:t.s,e:t.e})); }
  renderResWeek(); renderResStrip(); renderResTpls(); toast(curRes+(v==='No template'?' no longer inherits a template':' now inherits '+v));
});
renderResTpls(); renderResTemplateBadge();

/* tabs */
$('#tabSeg').addEventListener('click', e=>{ const b=e.target.closest('button'); if(!b) return;
  $$('#tabSeg button').forEach(x=>x.classList.toggle('on', x===b)); $$('.view').forEach(x=>x.classList.toggle('on', x.id==='view-'+b.dataset.v)); $('#resCtrls').style.display = b.dataset.v==='resource' ? 'flex' : 'none';
  $('#hSub').textContent = b.dataset.v==='templates' ? 'Standard weekly availability that rooms, equipment and resource groups inherit' : 'Weekly availability, templates and downtime for rooms and equipment'; });
/* boot */
populateResSel(); renderResWeek(); renderDowntime(); renderResStrip(); renderResTpls(); renderResTemplateBadge();
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


const CTX_BRANCHES = ['Main Campus','OPD Annexe','Madhurawada Branch'];
const ctxBrDD = makeDropdown('ctxBr', v => toast('Switched to ' + v));
ctxBrDD.setOptions(CTX_BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.select('Main Campus','Main Campus');

/* ---------- header bell · real alerts from RESOURCE_META / RES_WEEK / DOWNTIME / RES_TEMPLATE_ASSIGN ---------- */
function resourceAlerts(){
  const out=[]; const today=new Date(); today.setHours(0,0,0,0);
  const days=d=>Math.round((new Date(d)-today)/864e5);
  Object.keys(RESOURCE_META).forEach(r=>{
    const m=RESOURCE_META[r], fam=RES_FAMILIES[m.fam];
    (DOWNTIME[r]||[]).forEach(d=>{ const a=days(d.from), b=days(d.to);
      if(b<0) return;
      if(a<=0) out.push({lvl:'bad', t:r+' is down now', s:d.reason+' · until '+fmtDate(d.to)+(d.note?' · '+d.note:''), fam:m.fam, res:r});
      else if(a<=14) out.push({lvl:'warn', t:r+' goes down '+(a===1?'tomorrow':'in '+a+' days'), s:d.reason+' · '+fmtDate(d.from)+(d.to!==d.from?' – '+fmtDate(d.to):''), fam:m.fam, res:r}); });
    if(!m.sched) return;
    const tplName=RES_TEMPLATE_ASSIGN[r], tpl=RES_TEMPLATES[tplName];
    if(!tpl) out.push({lvl:'warn', t:r+' has no availability template', s:fam+' · runs on its own hours only', fam:m.fam, res:r});
    else if(!weekMatchesTemplate(RES_WEEK[r],tpl)) out.push({lvl:'info', t:r+' overrides '+tplName, s:'Custom days or hours · reset to the template if this was not intended', fam:m.fam, res:r});
    if(!RES_WEEK[r].some(d=>d.on)) out.push({lvl:'bad', t:r+' has no available day', s:'Schedulable but every day is switched off · nothing can be booked here', fam:m.fam, res:r});
  });
  return out;
}
const BELL_ICO={
  warn:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
  info:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  bad:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
};
function renderBell(){
  const a=resourceAlerts();
  $('#bellCnt').textContent=a.length; $('#bellCnt').style.display=a.length?'grid':'none';
  $('#bellSub').textContent=a.length?a.length+' item'+(a.length===1?'':'s'):'Nothing needs attention';
  $('#bellList').innerHTML=a.length?a.map(x=>'<button type="button" class="bellrow '+x.lvl+'" data-fam="'+x.fam+'" data-res="'+esc(x.res)+'"><span class="bic">'+BELL_ICO[x.lvl]+'</span><div class="btx"><b>'+esc(x.t)+'</b><span>'+esc(x.s)+'</span></div><span class="goto">Open →</span></button>').join(''):'<div class="bellempty">No downtime, missing templates or empty weeks.</div>';
}
$('#bellBtn').addEventListener('click',e=>{ e.stopPropagation(); renderBell(); $('#bellWrap').classList.toggle('open'); });
$('#bellList').addEventListener('click',e=>{ const r=e.target.closest('.bellrow'); if(!r) return; $('#bellWrap').classList.remove('open');
  $('#tabSeg [data-v="resource"]').click(); $('#resTypeSeg [data-t="'+r.dataset.fam+'"]').click(); resSelDD.set(r.dataset.res); curRes=r.dataset.res; renderResWeek(); renderDowntime(); renderResStrip(); renderResPreview(); });
document.addEventListener('click',e=>{ if(!$('#bellWrap').contains(e.target)) $('#bellWrap').classList.remove('open'); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') $('#bellWrap').classList.remove('open'); });
renderBell();
['downSave','tpSave','resResetTemplate'].forEach(id=>$('#'+id).addEventListener('click',()=>setTimeout(renderBell,0)));
['downtimeBody','resWeek','resTplBody','resTplSelPanel'].forEach(id=>$('#'+id).addEventListener(id==='resWeek'?'change':'click',()=>setTimeout(renderBell,0)));
