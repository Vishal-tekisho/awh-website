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

const lvTypeDD = initFormSelect('lvTypeWrap','lvTypeBtn','lvTypePanel','lvType', ['Vacation','Emergency Leave','Public Holiday','Maintenance Block']);
/* Calendar levels · Organization / Branch / Department / Resource (BRD: "Calendar
   levels ... Default: inherit from parent"). Departments match _DESIGN-SYSTEM.md;
   Resource list is populated lazily from ROOMS/EQUIPMENT (defined further below). */
const DEPARTMENTS = ['Wound Care','Diabetic Foot','Dermatology','General Surgery','Plastic Surgery','ENT','Physiotherapy'];
function scopeOptionsForLevel(level){
  if(level==='Organization') return ['KVNN Organization (all branches)'];
  if(level==='Department') return DEPARTMENTS;
  if(level==='Resource') return [...ROOMS, ...EQUIPMENT];
  return ['All branches','Main Campus','OPD Annexe','Madhurawada Branch'];
}
function toggleCalRepeatField(type){
  const show = ['Public Holiday','Clinic Holiday','Special Working Day'].includes(type);
  $('#calRepeatFld').style.display = show ? 'flex' : 'none';
  if(!show) $('#calRepeatSw').checked = false;
  /* Skeleton crew · only holidays actually close regular check-ups, so this only makes sense there */
  const showSkeleton = ['Public Holiday','Clinic Holiday'].includes(type);
  $('#calSkeletonFld').style.display = showSkeleton ? '' : 'none';
  if(!showSkeleton){ $('#calSkeletonSw').checked=false; $('#calSkeletonNote').value=''; }
  $('#calSkeletonNoteFld').style.display = (showSkeleton && $('#calSkeletonSw').checked) ? '' : 'none';
}
function lockScope(level, wrapId, lockId, hiddenId){
  const lock = level==='Branch', br=$('#ctxBrBtnLbl').textContent.trim();
  $('#'+wrapId).style.display = lock?'none':'';
  $('#'+lockId).style.display = lock?'flex':'none';
  if(lock){ $('#'+lockId+' span').textContent=br; $('#'+hiddenId).value=br; }
}
const calTypeDD = initFormSelect('calTypeWrap','calTypeBtn','calTypePanel','calType', ['Public Holiday','Clinic Holiday','Special Working Day','Temporary Closure','Calendar Exception'], toggleCalRepeatField);
const calLevelDD = initFormSelect('calLevelWrap','calLevelBtn','calLevelPanel','calLevel', ['Organization','Branch','Department','Resource'], level=>{ calScopeDD.setOptions(scopeOptionsForLevel(level)); lockScope(level,'calScopeWrap','calScopeLock','calScope'); });
const calScopeDD = initFormSelect('calScopeWrap','calScopeBtn','calScopePanel','calScope', ['All branches','Main Campus','OPD Annexe','Madhurawada Branch']);

/* ---------- weekly working hours ---------- */
const DAYS=[
  {d:'Monday',   on:1, s:'10:00', e:'18:00', dur:60, br:[['13:00','14:00','lunch']]},
  {d:'Tuesday',  on:1, s:'10:00', e:'18:00', dur:60, br:[['13:00','14:00','lunch'],['16:00','16:30','round']]},
  {d:'Wednesday',on:1, s:'10:00', e:'17:00', dur:60, br:[['13:00','13:45','lunch']]},
  {d:'Thursday', on:1, s:'10:00', e:'18:00', dur:90, br:[['13:00','14:00','lunch']]},
  {d:'Friday',   on:1, s:'10:00', e:'18:00', dur:120,br:[['13:00','14:00','lunch'],['15:00','17:00','session']]},
  {d:'Saturday', on:1, s:'09:30', e:'14:00', dur:60, br:[['12:00','12:30','lunch']]},
  {d:'Sunday',   on:0, s:'10:00', e:'13:00', dur:60, br:[['12:00','12:30','lunch']]}
];
const DURS=[60,90,120]; // therapy-clinic slots start at a minimum of 1hr
const durLabel = m => { const h=m/60; return (Number.isInteger(h) ? h : h.toFixed(1)) + ' hr'; };
const X='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const CLOCK='<svg class="ticon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
const mins = t => { const p=(t||'').split(':'); return p.length===2 ? (+p[0])*60 + (+p[1]) : 0; };
const label = m => { const h=Math.floor(m/60), mm=m%60; const ap=h<12?'AM':'PM'; const h12=(h%12)||12;
  return h12+':'+String(mm).padStart(2,'0')+' '+ap; };

/* ---------- break TYPES · a break is no longer one generic thing:
   lunch / doctor away on a hospital round / doctor tied up in a long
   procedure-session all block booking slots the same way, but need to
   read differently on the schedule and in the slot preview below.
   Breaks are edited through a modal (same pattern as recurring blocks /
   leave / downtime below) and shown as compact read-only chips here —
   no live inputs crammed into the table row. ---------- */
const TYPES={
  lunch:  {full:'Lunch break',    cls:'t-lunch'},
  round:  {full:'Hospital round', cls:'t-round'},
  session:{full:'In session',     cls:'t-session'},
  other:  {full:'Other',          cls:'t-other'}
};
const FULL_TO_KEY = Object.fromEntries(Object.entries(TYPES).map(([k,v])=>[v.full,k]));

function brkChipHTML(i, idx, brk){
  const [a,b,type]=brk, t=TYPES[type]||TYPES.other;
  return `<div class="brkchip ${t.cls}" data-i="${i}" data-idx="${idx}" title="Click to edit this break">
  <b>${t.full}</b><span class="bctime">${label(mins(a))} – ${label(mins(b))}</span>
  <button type="button" class="bcx" title="Remove break">${X}</button></div>`;
}
function renderBrkCol(i){
  const box=$('.dayblk[data-i="'+i+'"] .brkcol'), day=DAYS[i];
  box.innerHTML = (day.br.map((b,idx)=>brkChipHTML(i,idx,b)).join('') || '<span class="nobrk">No break</span>')
    + `<button type="button" class="addbrk" data-i="${i}">+ Add break</button>`;
}

$('#week').innerHTML = DAYS.map((x,i)=>`<div class="dayblk" data-i="${i}">
  <div class="drow">
    <span class="dnm"><span class="dav">${x.d[0]}</span>${x.d}</span>
    <div class="times">${CLOCK}<input type="time" class="st" value="${x.s}"><span class="dash">–</span><input type="time" class="en" value="${x.e}"></div>
    <div class="brkcol">${x.br.map((b,idx)=>brkChipHTML(i,idx,b)).join('') || '<span class="nobrk">No break</span>'}<button type="button" class="addbrk" data-i="${i}">+ Add break</button></div>
    <div class="fsel" id="durWrap-${i}"><button type="button" class="fselbtn sm durbtn" id="durBtn-${i}">${durLabel(x.dur)}</button><div class="fselpanel" id="durPanel-${i}"></div></div>
    <input type="hidden" class="dur" id="durVal-${i}" value="${x.dur}">
    <span class="sc num">0 slots</span>
    <label class="sw"><input type="checkbox" class="dayon"${x.on?' checked':''}><i></i></label>
  </div>
</div>`).join('');

function setDur(i, val){
  $('#durVal-'+i).value=val; $('#durBtn-'+i).textContent=durLabel(val);
  $$('#durPanel-'+i+' .fselopt').forEach(x=>x.classList.toggle('on', x.dataset.v==String(val)));
}
DAYS.forEach((x,i)=>{
  const wrap=$('#durWrap-'+i), btn=$('#durBtn-'+i), panel=$('#durPanel-'+i);
  panel.innerHTML = DURS.map(m=>'<button type="button" class="fselopt" data-v="'+m+'">'+durLabel(m)+'</button>').join('');
  panel.addEventListener('click', e=>{
    const b=e.target.closest('.fselopt'); if(!b) return;
    setDur(i, +b.dataset.v);
    wrap.classList.remove('open');
    recalcAll();
  });
  btn.addEventListener('click', e=>{
    e.stopPropagation();
    const wasOpen=wrap.classList.contains('open');
    $$('.fsel').forEach(x2=>x2.classList.remove('open'));
    if(!wasOpen) wrap.classList.add('open');
  });
  setDur(i, x.dur);
});

/* returns {on, slots:[{t,state}], count} for a day block */
function readDay(blk){
  const i=+blk.dataset.i;
  const on=$('.dayon',blk).checked;
  const s=mins($('.st',blk).value), e=mins($('.en',blk).value), dur=+$('.dur',blk).value;
  const breaks=DAYS[i].br.map(b=>[mins(b[0]),mins(b[1]),b[2]]).filter(([a,z])=>z>a);
  const slots=[];
  if(on && e>s){
    for(let t=s; t+dur<=e; t+=dur){
      const hit = breaks.find(([a,z]) => t < z && t+dur > a);
      slots.push({t, state: hit ? 'brk' : '', brkType: hit ? hit[2] : null});
    }
  }
  return {on, slots, count: slots.filter(x=>x.state!=='brk').length};
}

/* deterministic mock booking states so the preview looks real */
function decorate(slots, dayIdx){
  let n=0;
  return slots.map(sl=>{
    if(sl.state==='brk') return sl;
    n++;
    const k=(n*3 + dayIdx*5) % 11;
    return {...sl, state: k===1||k===4||k===7 ? 'booked' : (k===9 ? 'blocked' : '')};
  });
}

let previewDay=0;

function recalcAll(){
  let total=0, open=0;
  $$('.dayblk').forEach(blk=>{
    const on=$('.dayon',blk).checked;
    blk.classList.toggle('off',!on);
    $$('input[type=time], select, .durbtn', blk).forEach(el=>el.disabled=!on);
    $$('.addbrk', blk).forEach(b=>b.disabled=!on);
    const d=readDay(blk);
    $('.sc',blk).textContent = d.count + ' slot' + (d.count===1?'':'s');
    total+=d.count; if(on) open++;
  });
  $('#weekFoot').textContent = open + ' working days · ' + total + ' slots per week';
  $('#msSlots').textContent = total;
  $('#msUtil').textContent = total ? Math.round(96/total*100)+'%' : '0%';

  renderPreview();
}

function renderPreview(){
  const blk=$$('.dayblk')[previewDay];
  const d=readDay(blk);
  const list=decorate(d.slots, previewDay);
  const box=$('#slots'), empty=$('#slotsEmpty');
  if(!list.length){
    box.innerHTML=''; box.style.display='none'; empty.style.display='block';
    $('#previewSub').textContent = 'Doctor not available';
    return;
  }
  box.style.display='flex'; empty.style.display='none';
  box.innerHTML = list.map(sl=>{
    const isBrk = sl.state==='brk';
    const t=isBrk && TYPES[sl.brkType] ? TYPES[sl.brkType] : null;
    const cls = sl.state ? ' '+sl.state + (isBrk && t ? ' '+t.cls : '') : '';
    const title = sl.state==='booked' ? 'Booked' : sl.state==='blocked' ? 'Blocked' : isBrk ? (t ? t.full : 'Break') : 'Available';
    return `<span class="slot${cls}" title="${title}">${label(sl.t)}</span>`;
  }).join('');
  const booked=list.filter(x=>x.state==='booked').length;
  $('#previewSub').textContent = d.count + ' bookable slots · ' + booked + ' already booked';
}

/* one delegated listener for the whole weekly card · Working hours + Slot
   duration + Status stay live inputs; Breaks are read-only chips, edited
   through the modal below */
$('#week').addEventListener('input', recalcAll);
$('#week').addEventListener('change', recalcAll);
$('#week').addEventListener('click', e=>{
  const add=e.target.closest('.addbrk');
  if(add){ if(!add.disabled) openBrkModal(+add.dataset.i, -1); return; }
  const del=e.target.closest('.bcx');
  if(del){
    const chip=del.closest('.brkchip'), i=+chip.dataset.i, idx=+chip.dataset.idx;
    DAYS[i].br.splice(idx,1);
    renderBrkCol(i);
    recalcAll(); toast('Break removed');
    return;
  }
  const chip=e.target.closest('.brkchip');
  if(chip) openBrkModal(+chip.dataset.i, +chip.dataset.idx);
});

/* ---------- add/edit break modal ---------- */
const brkScrim=$('#brkScrim');
const brkTypeDD = initFormSelect('brkTypeWrap','brkTypeBtn','brkTypePanel','brkType', Object.values(TYPES).map(t=>t.full));
let brkDayIdx=-1, brkEditIdx=-1;
function openBrkModal(dayIdx, breakIdx){
  brkDayIdx=dayIdx; brkEditIdx=breakIdx;
  const day=DAYS[dayIdx];
  $('#brkModalTitle').textContent = breakIdx>-1 ? 'Edit break' : 'Add break';
  $('#brkFor').textContent = day.d+' · '+$('#docName').textContent;
  $('#brkWarn').style.display='none';
  if(breakIdx>-1){
    const [a,b,type]=day.br[breakIdx];
    brkTypeDD.set((TYPES[type]||TYPES.other).full);
    $('#brkFrom').value=a; $('#brkTo').value=b;
  } else {
    brkTypeDD.set(TYPES.other.full);
    $('#brkFrom').value='16:00'; $('#brkTo').value='16:30';
  }
  brkScrim.classList.add('show');
}
const closeBrk=()=>brkScrim.classList.remove('show');
$('#brkClose').addEventListener('click', closeBrk);
$('#brkCancel').addEventListener('click', closeBrk);
brkScrim.addEventListener('click', e=>{ if(e.target===brkScrim) closeBrk(); });
$('#brkSave').addEventListener('click', ()=>{
  const a=$('#brkFrom').value, b=$('#brkTo').value;
  if(mins(b)<=mins(a)){ $('#brkWarn').style.display='flex'; return; }
  const type=FULL_TO_KEY[$('#brkType').value]||'other';
  const day=DAYS[brkDayIdx];
  if(brkEditIdx>-1){
    day.br[brkEditIdx]=[a,b,type];
  } else {
    if(day.br.length>=4){ toast('Maximum four breaks per day'); return; }
    day.br.push([a,b,type]);
  }
  renderBrkCol(brkDayIdx);
  closeBrk(); recalcAll();
  toast(brkEditIdx>-1 ? 'Break updated' : 'Break added');
});

/* apply Monday to Tue–Fri */
$('#applyMon').addEventListener('click', ()=>{
  const blks=$$('.dayblk'), mon=blks[0];
  const src={s:$('.st',mon).value, e:$('.en',mon).value, dur:$('.dur',mon).value, br:DAYS[0].br.map(b=>[...b])};
  for(let i=1;i<5;i++){
    const b=blks[i];
    $('.dayon',b).checked=true;
    $('.st',b).value=src.s; $('.en',b).value=src.e; setDur(i, +src.dur);
    DAYS[i].br = src.br.map(x=>[...x]);
    renderBrkCol(i);
  }
  recalcAll();
  toast("Monday's timings applied to Tuesday – Friday");
});

/* preview day switcher */
$('#daySeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  [...b.parentElement.children].forEach(x=>x.classList.toggle('on',x===b));
  previewDay=+b.dataset.d; renderPreview();
});

/* ---------- teleconsultation ---------- */
$('#teleSw').addEventListener('change',()=>{
  toast('Teleconsultation '+($('#teleSw').checked?'enabled':'disabled'));
});

/* ---------- doctor picker ----------
   Same 5 doctors, same role/qualification/reg no./dept/branch as
   STAFF_DIRECTORY in doctors-staff.html · no fee/language fields
   because that onboarding form never captures them. */
const DOCS={
  'Dr. KVNN Santosh Murthy':{av:'KS', role:'Duty Doctor', qual:'MBBS, MD', reg:'TSMC/10234/2011', dept:'Consulting', br:'Main Campus'},
  'Dr. Hrishikesh Korada':  {av:'HK', role:'Physical Medicine & Rehabilitation', qual:'MBBS, MD (PMR)', reg:'TSMC/11876/2014', dept:'Consulting', br:'Main Campus'},
  'Dr. Harsh Atul':         {av:'HA', role:'Doctor', qual:'MBBS', reg:'TSMC/13021/2017', dept:'Consulting', br:'Main Campus'},
  'Dr. Raghavendra':        {av:'R',  role:'Doctor', qual:'MBBS', reg:'TSMC/13022/2017', dept:'Consulting', br:'Main Campus'},
  'Dr. Sameera':            {av:'S',  role:'Doctor', qual:'MBBS', reg:'TSMC/13023/2017', dept:'OPD', br:'OPD Annexe'}
};
function selectDoctor(name){
  const d=DOCS[name];
  $('#docAv').textContent=d.av; $('#docName').textContent=name;
  $('#docSpec').textContent=d.role+' · '+d.dept;
  $('#docMeta2').textContent=[d.qual, d.reg, d.br].filter(Boolean).join(' · ');
  branchSelDD.set(d.br);
  $('#leaveFor').textContent = name+' · '+d.br;
  toast('Loaded availability for '+name);
}
function selectBranch(val){
  $('#leaveFor').textContent = docSelDD.get()+' · '+val;
  toast('Switched to '+val);
}
const docSelDD = initFormSelect('docSelWrap','docSelBtn','docSelPanel','docSel', Object.keys(DOCS), selectDoctor);
const branchSelDD = initFormSelect('branchSelWrap','branchSelBtn','branchSelPanel','branchSel', ['Main Campus','OPD Annexe','Madhurawada Branch'], selectBranch);

/* ---------- header actions ---------- */
$('#publishBtn').addEventListener('click', ()=>{
  const n=$('#msSlots').textContent;
  toast('Schedule published · '+n+' slots open for booking');
});

/* ---------- leave & holidays table · real add/edit/approve/reject (was static) ---------- */
let LEAVE_ENTRIES=[
  {type:'Vacation', sub:'Full day', from:'2026-07-24', to:'2026-07-28', reason:'Family trip to Vizag', status:'Approved'},
  {type:'Public Holiday', sub:'Clinic-wide', from:'2026-08-15', to:'2026-08-15', reason:'Independence Day', status:'Approved'},
  {type:'Emergency Leave', sub:'Half day · afternoon', from:'2026-08-21', to:'2026-08-21', reason:'Emergency debridement at Yashoda Hospital', status:'Pending'},
  {type:'Maintenance Block', sub:'Room 4 · dressing bay', from:'2026-08-29', to:'2026-08-30', reason:'NPWT equipment servicing & recalibration', status:'Approved'},
  {type:'Vacation', sub:'Full day', from:'2026-09-12', to:'2026-09-19', reason:'Wound Care conference, Singapore', status:'Rejected'}
];
let editLeaveIdx=-1;
const EDIT_ICON='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>';

function renderLeaveTable(){
  if(!LEAVE_ENTRIES.length){
    $('#leaveBody').innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--ink-muted);padding:22px">No leave records.</td></tr>';
  } else {
    $('#leaveBody').innerHTML = LEAVE_ENTRIES.map((r,i)=>{
      let actions = '<button class="iconb" title="Edit" data-editleave="'+i+'">'+EDIT_ICON+'</button>';
      if(r.status==='Pending'){
        actions = '<button class="iconb" title="Approve" data-approveleave="'+i+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>'
          + '<button class="iconb del" title="Reject" data-rejectleave="'+i+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
      } else if(r.status==='Rejected'){
        actions = '<button class="iconb" title="Re-submit" data-resubmitleave="'+i+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>'
          + actions;
      }
      return '<tr><td><b>'+r.type+'</b><span class="sub">'+(r.sub||'')+'</span></td>'
        + '<td class="num">'+fmtDate(r.from)+'</td><td class="num">'+fmtDate(r.to)+'</td><td class="num">'+dateDiffDays(r.from,r.to)+'</td>'
        + '<td>'+r.reason+'</td>'
        + '<td style="text-align:right;white-space:nowrap">'+actions+'</td></tr>';
    }).join('');
  }
  const pending=LEAVE_ENTRIES.filter(r=>r.status==='Pending').length;
  const totalDays=LEAVE_ENTRIES.filter(r=>r.status==='Approved').reduce((a,r)=>a+dateDiffDays(r.from,r.to),0);
  $('#leaveFoot').textContent = LEAVE_ENTRIES.length+' record'+(LEAVE_ENTRIES.length===1?'':'s')
    +' · '+pending+' pending approval · '+totalDays+' leave days booked in 2026';
}
$('#leaveBody').addEventListener('click', e=>{
  const ed=e.target.closest('[data-editleave]'), ap=e.target.closest('[data-approveleave]'),
        rj=e.target.closest('[data-rejectleave]'), rs=e.target.closest('[data-resubmitleave]');
  if(ed){ openLeave(+ed.dataset.editleave); return; }
  if(ap){ const r=LEAVE_ENTRIES[+ap.dataset.approveleave]; r.status='Approved'; renderLeaveTable(); toast(r.type+' approved'); return; }
  if(rj){ const r=LEAVE_ENTRIES[+rj.dataset.rejectleave]; r.status='Rejected'; renderLeaveTable(); toast(r.type+' rejected'); return; }
  if(rs){ const r=LEAVE_ENTRIES[+rs.dataset.resubmitleave]; r.status='Pending'; renderLeaveTable(); toast(r.type+' re-submitted for approval'); return; }
});

/* ---------- add/edit-leave modal ---------- */
const scrim=$('#leaveScrim');
const openLeave=(i)=>{
  editLeaveIdx = (typeof i==='number') ? i : -1;
  if(editLeaveIdx>-1){
    const r=LEAVE_ENTRIES[editLeaveIdx];
    $('#leaveModalTitle').textContent='Edit leave';
    lvTypeDD.set(r.type); $('#lvFrom').value=r.from; $('#lvTo').value=r.to; $('#lvReason').value=r.reason;
    $('#leaveSave').textContent='Save changes';
    $('#lvTypeFld').style.display='none';
    $('#lvTypeStatic').style.display='block';
    $('#lvTypeStatic').innerHTML='<b>'+r.type+'</b>: type can\'t be changed once raised. Shorten the dates below for a partial approval, or reject it entirely.';
    $('#leaveReject').style.display = r.status==='Rejected' ? 'none' : 'inline-flex';
    $('#lvReason').disabled=true;
  } else {
    $('#leaveModalTitle').textContent='Add leave';
    lvTypeDD.set('Vacation'); $('#lvFrom').value='2026-08-24'; $('#lvTo').value='2026-08-26'; $('#lvReason').value='';
    $('#leaveSave').textContent='Block these dates';
    $('#lvTypeFld').style.display='';
    $('#lvTypeStatic').style.display='none';
    $('#leaveReject').style.display='none';
    $('#lvReason').disabled=false;
  }
  scrim.classList.add('show'); lvWarn();
};
const closeLeave=()=>scrim.classList.remove('show');
$('#addLeave').addEventListener('click', ()=>openLeave());
$('#leaveClose').addEventListener('click', closeLeave);
$('#leaveCancel').addEventListener('click', closeLeave);
$('#leaveReject').addEventListener('click', ()=>{
  if(editLeaveIdx<0) return;
  const r=LEAVE_ENTRIES[editLeaveIdx];
  r.status='Rejected';
  closeLeave(); renderLeaveTable();
  toast(r.type+' rejected');
});
scrim.addEventListener('click', e=>{ if(e.target===scrim) closeLeave(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeLeave(); });

function lvWarn(){
  const a=new Date($('#lvFrom').value), b=new Date($('#lvTo').value);
  const days = isNaN(a)||isNaN(b) ? 0 : Math.floor((b-a)/864e5)+1;
  const txt=$('#lvWarnTxt');
  if(days<1){ txt.textContent='The "to" date must be on or after the "from" date.'; return; }
  /* ponytail: affected count is a deterministic mock; wire to the bookings API when it exists */
  const appts = days*11 - 3;
  txt.textContent = appts+' appointment'+(appts===1?'':'s')+' will be affected. Patients will be notified to reschedule.';
}
['#lvFrom','#lvTo'].forEach(s=>$(s).addEventListener('change', lvWarn));
$('#leaveSave').addEventListener('click', ()=>{
  const from=$('#lvFrom').value, to=$('#lvTo').value;
  if(dateDiffDays(from,to)<1){ toast('The "to" date must be on or after the "from" date.'); return; }
  const type=$('#lvType').value, reason=$('#lvReason').value.trim();
  if(editLeaveIdx>-1){
    Object.assign(LEAVE_ENTRIES[editLeaveIdx], {type, from, to, reason});
    closeLeave(); renderLeaveTable();
    toast(type+' updated');
  } else {
    LEAVE_ENTRIES.push({type, sub: from===to?'Full day':'', from, to, reason, status:'Approved'});
    closeLeave(); renderLeaveTable();
    toast(type+' blocked · affected patients notified');
  }
});

/* ==================================================================
   TABS · Doctor schedule / Room & equipment / Clinic calendar
   (BRD epic 02.8: area 26 Calendar & Holiday Configuration is clinic-
   level, area 27 Doctor & Resource Schedule Configuration covers
   doctors AND rooms/equipment · these were missing before this pass)
   ================================================================== */
const DAY_NAMES=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_NAMES_FULL=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function syncTab(v){
  $$('#tabSeg button').forEach(x=>x.classList.toggle('on', x.dataset.v===v));
  $$('.view').forEach(x=>x.classList.toggle('on', x.id==='view-'+v));
  $('#docHeaderControls').style.display = v==='doctor' ? 'flex' : 'none';
  const subs={
    calendars:'Base working days and hours at organization, branch, department and resource level',
    doctor:'Working days, slots, breaks and leave for every doctor',
    clinic:'Holidays, special working days, closures, shift holidays and calendar exceptions'
  };
  $('#hSub').textContent = subs[v];
}
$('#tabSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  syncTab(b.dataset.v);
});

/* small date helpers shared by the new tabs */
function fmtDate(iso){
  return new Date(iso).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
}
function dateDiffDays(a,b){ return Math.floor((new Date(b)-new Date(a))/864e5)+1; }

/* ==================================================================
   RECURRING BLOCKS · real add/edit/delete (was a "coming soon" stub)
   ================================================================== */
let BLOCKS=[
  {label:'Ward Rounds', day:0, s:'08:00', e:'09:00'},
  {label:'OT Day', day:2, s:'09:00', e:'17:00'}
];
let editBlockIdx=-1;

function renderBlocks(){
  const box=$('#blocksBody');
  if(!BLOCKS.length){
    box.innerHTML = '<div class="empty">'
      + '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>'
      + '<b>No recurring blocks yet</b><span>Add a weekly block to keep OT or ward-round hours off the booking calendar.</span></div>';
    return;
  }
  box.innerHTML = BLOCKS.map((b,i)=>
    '<div class="blkrow"><span class="bdaychip">'+DAY_NAMES[b.day]+'</span>'
    + '<div class="btxt"><b>'+b.label+'</b><span>'+label(mins(b.s))+' – '+label(mins(b.e))+' · every week</span></div>'
    + '<div class="bact">'
    + '<button class="iconb" title="Edit" data-edit="'+i+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg></button>'
    + '<button class="iconb del" title="Delete" data-del="'+i+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>'
    + '</div></div>'
  ).join('');
}
$('#blocksBody').addEventListener('click', e=>{
  const ed=e.target.closest('[data-edit]'), del=e.target.closest('[data-del]');
  if(ed) openBlockModal(+ed.dataset.edit);
  if(del){
    const b=BLOCKS[+del.dataset.del];
    BLOCKS.splice(+del.dataset.del,1);
    renderBlocks();
    toast(b.label+' block removed');
  }
});
$('#addBlock').addEventListener('click', ()=>openBlockModal(-1));

const blockScrim=$('#blockScrim');
function openBlockModal(i){
  editBlockIdx=i;
  $('#blockModalTitle').textContent = i>-1 ? 'Edit recurring block' : 'Add recurring block';
  $('#blockFor').textContent = $('#docName').textContent+' · every week';
  $('#bkDayLbl').textContent = i>-1 ? 'Day of week' : 'Days of week (pick one or more)';
  if(i>-1){
    const b=BLOCKS[i];
    $('#bkLabel').value=b.label;
    $$('#bkDayPick button').forEach(btn=>btn.classList.toggle('on', +btn.dataset.d===b.day));
    $('#bkStart').value=b.s; $('#bkEnd').value=b.e;
  } else {
    $('#bkLabel').value='';
    $$('#bkDayPick button').forEach(btn=>btn.classList.remove('on'));
    $('#bkStart').value='08:00'; $('#bkEnd').value='09:00';
  }
  blockScrim.classList.add('show');
}
const closeBlock=()=>blockScrim.classList.remove('show');
$('#blockClose').addEventListener('click', closeBlock);
$('#blockCancel').addEventListener('click', closeBlock);
blockScrim.addEventListener('click', e=>{ if(e.target===blockScrim) closeBlock(); });
$('#bkDayPick').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  if(editBlockIdx>-1){
    $$('#bkDayPick button').forEach(x=>x.classList.toggle('on', x===b)); // editing one block = single day
  } else {
    b.classList.toggle('on'); // adding new = multi-day
  }
});
$('#blockSave').addEventListener('click', ()=>{
  const lbl=$('#bkLabel').value.trim();
  if(!lbl){ toast('Give this block a label'); return; }
  const s=$('#bkStart').value, e=$('#bkEnd').value;
  if(mins(e)<=mins(s)){ toast('End time must be after start time'); return; }
  const days=$$('#bkDayPick button.on').map(b=>+b.dataset.d);
  if(!days.length){ toast('Pick at least one day'); return; }
  if(editBlockIdx>-1){
    BLOCKS[editBlockIdx]={label:lbl, day:days[0], s, e};
    renderBlocks(); closeBlock();
    toast('Block updated: '+lbl);
  } else {
    days.forEach(d=>BLOCKS.push({label:lbl, day:d, s, e}));
    renderBlocks(); closeBlock();
    toast('Block added: '+lbl+' ('+days.length+' day'+(days.length>1?'s':'')+')');
  }
});

/* ==================================================================
   CLINIC & BRANCH CALENDAR · BRD area 26 (was entirely missing)
   Working hours are per-branch (Madhurawada is a weekday-only day-care
   branch, OPD Annexe runs a shorter Saturday, Main Campus runs the fullest week).
   Branch names match doctors-staff.html's BRANCHES array exactly.
   ================================================================== */
/* Sunday is deliberately kept OPEN with short hours (never fully closed) · the clinic's own
   "48-Hour Rule": a wound-care/burns patient can't go 2 days without a dressing change, so
   Sunday stays open a few critical hours instead of closing outright like a normal weekly off. */
const CLINIC_WEEK={
  'Main Campus': [
    {on:1,s:'09:00',e:'19:00'},{on:1,s:'09:00',e:'19:00'},{on:1,s:'09:00',e:'19:00'},
    {on:1,s:'09:00',e:'19:00'},{on:1,s:'09:00',e:'19:00'},{on:1,s:'09:00',e:'17:00'},
    {on:1,s:'09:00',e:'13:00',note:'Critical dressing changes only'}
  ],
  'OPD Annexe': [
    {on:1,s:'10:00',e:'18:00'},{on:1,s:'10:00',e:'18:00'},{on:1,s:'10:00',e:'18:00'},
    {on:1,s:'10:00',e:'18:00'},{on:1,s:'10:00',e:'18:00'},{on:1,s:'10:00',e:'14:00'},
    {on:1,s:'10:00',e:'13:00',note:'Critical dressing changes only'}
  ],
  'Madhurawada Branch': [
    {on:1,s:'09:00',e:'17:00'},{on:1,s:'09:00',e:'17:00'},{on:1,s:'09:00',e:'17:00'},
    {on:1,s:'09:00',e:'17:00'},{on:1,s:'09:00',e:'17:00'},{on:0,s:'09:00',e:'13:00'},
    {on:1,s:'09:00',e:'13:00',note:'Critical dressing changes only'}
  ]
};
/* Day Blocks · named reference sub-ranges within a working day (e.g. shift planning, reception
   handover cues). Purely informational against the day's own open/close range above; not enforced
   against it. Defaults match the standard Morning/Afternoon/Evening split every branch starts from. */
const DEFAULT_DAYBLOCKS = ()=>[{name:'Morning',s:'06:00',e:'11:00'},{name:'Afternoon',s:'11:00',e:'16:00'},{name:'Evening',s:'16:00',e:'21:00'}];
const CLINIC_DAYBLOCKS={
  'Main Campus': DEFAULT_DAYBLOCKS(),
  'OPD Annexe': DEFAULT_DAYBLOCKS(),
  'Madhurawada Branch': DEFAULT_DAYBLOCKS()
};
/* ---------- calendar levels · Organization default vs Branch override
   (BRD: "Calendar levels ... Default: inherit from parent" + preview must
   show "inherited vs override markers") ---------- */
const ORG_DEFAULT_WEEK = [
  {on:1,s:'09:00',e:'19:00'},{on:1,s:'09:00',e:'19:00'},{on:1,s:'09:00',e:'19:00'},
  {on:1,s:'09:00',e:'19:00'},{on:1,s:'09:00',e:'19:00'},{on:1,s:'09:00',e:'17:00'},
  {on:1,s:'09:00',e:'13:00',note:'Critical dressing changes only'}
];
function weeksMatch(a,b){ return a.every((d,i)=> d.on===b[i].on && (!d.on || (d.s===b[i].s && d.e===b[i].e))); }
function renderClinicLevelBadge(){
  const branch=$('#clinicBranchSel').value;
  let html, resetVisible=false;
  if(branch==='All branches'){
    html='<span class="chip info">Organization level</span>';
  } else if(weeksMatch(CLINIC_WEEK[branch], ORG_DEFAULT_WEEK)){
    html='<span class="chip soft">Inherited from KVNN Organization Default</span>';
  } else {
    html='<span class="chip warn">Branch Override</span>';
    resetVisible=true;
  }
  $('#clinicLevelBadge').innerHTML=html;
  $('#clinicLevelChipTop').innerHTML=html;
  $('#clinicResetDefault').style.display = resetVisible ? 'inline-flex' : 'none';
}
$('#clinicResetDefault').addEventListener('click', ()=>{
  const branch=$('#clinicBranchSel').value; if(branch==='All branches') return;
  CLINIC_WEEK[branch]=ORG_DEFAULT_WEEK.map(d=>({...d}));
  renderClinicWeek(); renderClinicStrip(); renderCalendarView();
  toast(branch+' hours reset to organization default');
});

function renderClinicWeek(){
  const branch=$('#clinicBranchSel').value;
  if(branch==='All branches'){
    $('#clinicWeek').innerHTML = '<div class="empty">'
      + '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
      + '<b>Pick a branch to view its hours</b><span>Working hours are set per branch. Choose one above to view or edit.</span></div>';
    $('#clinicDayBlocks').innerHTML='';
    renderClinicLevelBadge();
    return;
  }
  const wk=CLINIC_WEEK[branch];
  $('#clinicWeek').innerHTML = wk.map((x,i)=>
    '<div class="dayblk'+(x.on?'':' off')+'" data-i="'+i+'">'
    + '<div class="drow" style="grid-template-columns:114px minmax(0,1fr) 96px 46px">'
    + '<span class="dnm">'+DAY_NAMES_FULL[i]+'</span>'
    + '<div class="times"><input type="time" class="cst" value="'+x.s+'"'+(x.on?'':' disabled')+'><span class="dash">–</span><input type="time" class="cen" value="'+x.e+'"'+(x.on?'':' disabled')+'></div>'
    + '<span class="sc">'+(x.on?'Open':'Closed')+'</span>'
    + '<label class="sw"><input type="checkbox" class="cdayon"'+(x.on?' checked':'')+'><i></i></label>'
    + '</div>'
    + (x.note ? '<div style="font-size:11px;color:var(--ink-muted);margin-top:3px;padding-left:2px">'+esc(x.note)+'</div>' : '')
    + '</div>'
  ).join('');
  renderClinicDayBlocks();
  const todayIdx=(new Date().getDay()+6)%7; // Mon=0..Sun=6
  $('#clinicStatus').textContent = wk[todayIdx].on ? 'Open now' : 'Closed today';
  $('#clinicStatus').className = 'chip '+(wk[todayIdx].on?'soft':'bad');
  renderClinicLevelBadge();
}
$('#clinicWeek').addEventListener('change', e=>{
  const blk=e.target.closest('.dayblk'); if(!blk) return;
  const branch=$('#clinicBranchSel').value; if(branch==='All branches') return;
  const i=+blk.dataset.i, wk=CLINIC_WEEK[branch];
  wk[i].on=$('.cdayon',blk).checked; wk[i].s=$('.cst',blk).value; wk[i].e=$('.cen',blk).value;
  renderClinicWeek(); renderClinicStrip();
  toast(branch+' hours updated');
});

/* Day Blocks · purely a labelled reference list, no validation against the day's own hours above */
function renderClinicDayBlocks(){
  const branch=$('#clinicBranchSel').value;
  const blocks=CLINIC_DAYBLOCKS[branch]||[];
  $('#clinicDayBlocks').innerHTML = blocks.map((b,i)=>
    '<div class="dblkrow" data-i="'+i+'" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
    + '<input class="fld dblkname" type="text" value="'+esc(b.name)+'" placeholder="Block name" style="max-width:130px">'
    + '<input class="dblks" type="time" value="'+b.s+'">'
    + '<span class="dash">–</span>'
    + '<input class="dblke" type="time" value="'+b.e+'">'
    + '<button type="button" class="iconb del" data-rmblk="'+i+'" title="Remove block"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
    + '</div>'
  ).join('') || '<p class="hint">No day blocks yet. Add one above.</p>';
}
$('#clinicDayBlockAdd').addEventListener('click', ()=>{
  const branch=$('#clinicBranchSel').value; if(branch==='All branches') return;
  (CLINIC_DAYBLOCKS[branch]=CLINIC_DAYBLOCKS[branch]||[]).push({name:'New block', s:'09:00', e:'13:00'});
  renderClinicDayBlocks();
});
$('#clinicDayBlocks').addEventListener('click', e=>{
  const b=e.target.closest('[data-rmblk]'); if(!b) return;
  const branch=$('#clinicBranchSel').value; if(branch==='All branches') return;
  CLINIC_DAYBLOCKS[branch].splice(+b.dataset.rmblk,1);
  renderClinicDayBlocks();
});
$('#clinicDayBlocks').addEventListener('change', e=>{
  const row=e.target.closest('.dblkrow'); if(!row) return;
  const branch=$('#clinicBranchSel').value; if(branch==='All branches') return;
  const i=+row.dataset.i, blk=CLINIC_DAYBLOCKS[branch][i];
  blk.name=$('.dblkname',row).value.trim()||'Block'; blk.s=$('.dblks',row).value; blk.e=$('.dblke',row).value;
});

const clinicHoursScrim=$('#clinicHoursScrim');
const openClinicHours=()=>clinicHoursScrim.classList.add('show');
const closeClinicHours=()=>clinicHoursScrim.classList.remove('show');
$('#editClinicHours').addEventListener('click', openClinicHours);
$('#clinicHoursClose').addEventListener('click', closeClinicHours);
$('#clinicHoursDone').addEventListener('click', closeClinicHours);
clinicHoursScrim.addEventListener('click', e=>{ if(e.target===clinicHoursScrim) closeClinicHours(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeClinicHours(); });

let CAL_ENTRIES=[
  {type:'Public Holiday', date:'2026-08-15', dateTo:'2026-08-15', scope:'All branches', level:'Branch', repeatAnnual:true, partial:false, note:'Independence Day', skeletonCrew:true, skeletonNote:'Nursing team on standby · urgent dressing/burns only'},
  {type:'Public Holiday', date:'2026-08-27', dateTo:'2026-08-27', scope:'All branches', level:'Branch', repeatAnnual:true, partial:false, note:'Ganesh Chaturthi'},
  {type:'Public Holiday', date:'2026-10-02', dateTo:'2026-10-02', scope:'All branches', level:'Branch', repeatAnnual:true, partial:false, note:'Gandhi Jayanti'},
  {type:'Clinic Holiday', date:'2026-12-25', dateTo:'2026-12-25', scope:'All branches', level:'Branch', repeatAnnual:true, partial:false, note:'Christmas', skeletonCrew:true, skeletonNote:'Nursing team on standby · urgent dressing/burns only'},
  {type:'Special Working Day', date:'2026-08-16', dateTo:'2026-08-16', scope:'Main Campus', level:'Branch', repeatAnnual:false, partial:false, note:'Sunday clinic · festival backlog'},
  {type:'Special Working Day', date:'2026-11-01', dateTo:'2026-11-01', scope:'Madhurawada Branch', level:'Branch', repeatAnnual:false, partial:false, note:'Extended Saturday hours · camp follow-ups'},
  {type:'Temporary Closure', date:'2026-09-05', dateTo:'2026-09-07', scope:'OPD Annexe', level:'Branch', repeatAnnual:false, partial:false, note:'Branch renovation'},
  {type:'Calendar Exception', date:'2026-09-10', dateTo:'2026-09-10', scope:'Wound Care', level:'Department', repeatAnnual:false, partial:true, timeFrom:'14:00', timeTo:'18:00', note:'Fumigation · Wound Care dept. suspended for the afternoon'}
];
function renderCalEntries(){
  const scope=$('#clinicBranchSel').value;
  const rows=CAL_ENTRIES.filter(r=>scope==='All branches' || (r.level && r.level!=='Branch') || r.scope==='All branches' || r.scope===scope);
  if(!rows.length){
    $('#calBody').innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--ink-muted);padding:22px">No holidays or exceptions for this branch.</td></tr>';
  } else {
    $('#calBody').innerHTML = rows.map(r=>{
      const idx=CAL_ENTRIES.indexOf(r);
      const typeChip = r.type==='Public Holiday'?'ok':r.type==='Clinic Holiday'?'info':r.type==='Special Working Day'?'soft':r.type==='Calendar Exception'?'warn':'bad';
      let dateTxt=fmtDate(r.date);
      if(r.dateTo && r.dateTo!==r.date) dateTxt+=' – '+fmtDate(r.dateTo);
      const timeSub = r.partial && r.timeFrom && r.timeTo ? '<span class="sub">'+label(mins(r.timeFrom))+' – '+label(mins(r.timeTo))+'</span>' : '';
      const scopeSub = r.level && r.level!=='Branch' ? '<span class="sub">'+r.level+' level</span>' : '';
      const repeatsCell = r.repeatAnnual ? '<span class="chip soft">↻ Annually</span>' : '<span style="color:var(--ink-muted);font-size:11px">One-time</span>';
      const skeletonSub = r.skeletonCrew ? '<span class="chip warn" style="margin-top:4px" title="'+esc(r.skeletonNote||'')+'">Skeleton crew</span>' : '';
      const notesSub = r.notes ? '<span class="sub">'+esc(r.notes)+'</span>' : '';
      return '<tr><td><b>'+esc(r.note)+'</b>'+skeletonSub+'</td><td><span class="chip '+typeChip+'">'+r.type+'</span></td>'
        + '<td class="num">'+dateTxt+timeSub+'</td><td>'+r.scope+scopeSub+'</td><td>'+esc(r.reason||'Not set')+notesSub+'</td>'
        + '<td>'+repeatsCell+'</td>'
        + '<td style="text-align:right;white-space:nowrap"><button class="iconb del" title="Remove" data-delcal="'+idx+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button></td></tr>';
    }).join('');
  }
  $('#calFoot').textContent = rows.length+' entr'+(rows.length===1?'y':'ies')+' for this branch';
}
$('#calBody').addEventListener('click', e=>{
  const del=e.target.closest('[data-delcal]'); if(!del) return;
  CAL_ENTRIES.splice(+del.dataset.delcal,1);
  renderCalEntries(); renderClinicStrip(); renderCalendarView();
  toast('Calendar entry removed');
});
const clinicBranchSelDD = initFormSelect('clinicBranchSelWrap','clinicBranchSelBtn','clinicBranchSelPanel','clinicBranchSel',
  ['Main Campus','OPD Annexe','Madhurawada Branch','All branches'],
  ()=>{ renderClinicWeek(); renderCalEntries(); renderClinicStrip(); renderCalendarView(); });

/* ---------- calendar month view ---------- */
const MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];
let calYear=2026, calMonth=7; // August 2026 · matches this app's demo "today"
const pad2 = n => String(n).padStart(2,'0');
const isoDate = (y,m,d) => y+'-'+pad2(m+1)+'-'+pad2(d);

function renderCalendarView(){
  $('#calMonthLabel').textContent = MONTH_NAMES[calMonth]+' '+calYear;
  const branch = $('#clinicBranchSel').value;
  const entries = CAL_ENTRIES.filter(r=>branch==='All branches' || (r.level && r.level!=='Branch') || r.scope==='All branches' || r.scope===branch);
  const entryMap = {};
  /* date-range entries tag every day in the range; "repeat annually" entries are
     re-projected onto whichever year is currently being viewed */
  entries.forEach(r=>{
    const push = iso => { (entryMap[iso]=entryMap[iso]||[]).push(r); };
    const start=new Date(r.date), end=new Date(r.dateTo||r.date);
    const spanDays=Math.max(0, Math.round((end-start)/864e5));
    if(r.repeatAnnual){
      for(let i=0;i<=spanDays;i++){
        const dd=new Date(calYear, start.getMonth(), start.getDate()+i);
        push(isoDate(dd.getFullYear(), dd.getMonth(), dd.getDate()));
      }
    } else {
      for(let i=0;i<=spanDays;i++){
        const dd=new Date(start.getFullYear(), start.getMonth(), start.getDate()+i);
        push(isoDate(dd.getFullYear(), dd.getMonth(), dd.getDate()));
      }
    }
  });
  const wk = branch!=='All branches' ? CLINIC_WEEK[branch] : null;

  const firstWeekday = (new Date(calYear, calMonth, 1).getDay()+6)%7; // Mon=0
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();
  const t=new Date(); t.setHours(0,0,0,0);
  const todayIso = isoDate(t.getFullYear(), t.getMonth(), t.getDate());

  const cells=[];
  for(let i=firstWeekday-1;i>=0;i--) cells.push({d:daysInPrevMonth-i, other:true});
  for(let d=1; d<=daysInMonth; d++) cells.push({d, other:false, iso:isoDate(calYear, calMonth, d)});
  while(cells.length % 7 !== 0) cells.push({d:cells.length-(firstWeekday+daysInMonth)+1, other:true});

  $('#calGridBody').innerHTML = cells.map(c=>{
    if(c.other) return '<div class="calday other"><span class="dnum">'+c.d+'</span></div>';
    const dow=(new Date(calYear, calMonth, c.d).getDay()+6)%7;
    const isOff = wk ? !wk[dow].on : false;
    const isToday = c.iso===todayIso;
    const list = entryMap[c.iso]||[];
    const tags = list.map(r=>{
      const cls = r.type.includes('Holiday')?'hol':r.type==='Special Working Day'?'spec':r.type==='Calendar Exception'?'exc':'close';
      return '<span class="caltag '+cls+'" title="'+r.type+' · '+r.note+'">'+r.note+'</span>';
    }).join('');
    return '<div class="calday'+(isOff?' off':'')+(isToday?' today':'')+'" data-date="'+c.iso+'" title="'+c.iso+'">'
      + '<span class="dnum">'+c.d+'</span>'
      + (tags?'<div class="dtags">'+tags+'</div>':'')
      + '</div>';
  }).join('');
}
$('#calPrevMonth').addEventListener('click', ()=>{
  calMonth--; if(calMonth<0){ calMonth=11; calYear--; }
  renderCalendarView();
});
$('#calNextMonth').addEventListener('click', ()=>{
  calMonth++; if(calMonth>11){ calMonth=0; calYear++; }
  renderCalendarView();
});
$('#calGridBody').addEventListener('click', e=>{
  const cell=e.target.closest('.calday'); if(!cell || cell.classList.contains('other')) return;
  openCalModal(cell.dataset.date);
});

function renderClinicStrip(){
  const branch=$('#clinicBranchSel').value;
  $('#clinicBranchName').textContent=branch;
  $('#clinicAv').textContent = branch==='All branches' ? 'ALL' : branch.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  if(branch==='All branches'){
    $('#clinicHrsToday').textContent='Viewing all branches';
    $('#clinicDaysWk').textContent='—';
  } else {
    const wk=CLINIC_WEEK[branch];
    const todayIdx=(new Date().getDay()+6)%7, today=wk[todayIdx];
    $('#clinicHrsToday').textContent = today.on ? ('Open today · '+label(mins(today.s))+' – '+label(mins(today.e))) : 'Closed today';
    $('#clinicDaysWk').textContent = wk.filter(d=>d.on).length+' / week';
  }
  const relevant = CAL_ENTRIES.filter(r=>branch==='All branches' || (r.level && r.level!=='Branch') || r.scope==='All branches' || r.scope===branch);
  const now=new Date();
  const upcoming = relevant.filter(r=>(r.type==='Public Holiday'||r.type==='Clinic Holiday') && new Date(r.date)>=now)
    .sort((a,b)=>new Date(a.date)-new Date(b.date))[0];
  $('#clinicNextHoliday').textContent = upcoming ? (upcoming.note+' · '+fmtDate(upcoming.date)) : 'None scheduled';
  $('#clinicHolCount').textContent = relevant.filter(r=>r.type.includes('Holiday')).length;
  $('#clinicExcCount').textContent = relevant.filter(r=>!r.type.includes('Holiday')).length;
}

const calScrim=$('#calScrim');
/* shared modal-open/reset for both the "Add entry" button and clicking a day
   on the month grid · keeps the new Date-range / Partial-day / Repeat-annually
   fields in a known state every time the modal opens */
function openCalModal(defaultDate){
  const d = defaultDate || '2026-08-27';
  calTypeDD.set('Public Holiday'); toggleCalRepeatField('Public Holiday');
  calLevelDD.set('Branch'); calScopeDD.setOptions(scopeOptionsForLevel('Branch')); lockScope('Branch','calScopeWrap','calScopeLock','calScope');
  calScopeDD.set($('#clinicBranchSel').value==='All branches' ? 'All branches' : $('#clinicBranchSel').value);
  $$('#calDateTypeSeg button').forEach(b=>b.classList.toggle('on', b.dataset.v==='single'));
  $('#calDateSingleFld').style.display=''; $('#calDateRangeFld').style.display='none';
  $('#calDate').value=d; $('#calDateFrom').value=d; $('#calDateTo').value=d;
  $('#calPartialSw').checked=false; $('#calTimeFld').style.display='none';
  $('#calStart').value='09:00'; $('#calEnd').value='13:00';
  $('#calRepeatSw').checked=false;
  $('#calSkeletonSw').checked=false; $('#calSkeletonNote').value=''; $('#calSkeletonNoteFld').style.display='none';
  $('#calNote').value=''; $('#calNotes').value=''; calReasonDD.set(CAL_REASONS[0]);
  calScrim.classList.add('show');
}
$('#addCalEntry').addEventListener('click', ()=>openCalModal());
const closeCal=()=>calScrim.classList.remove('show');
$('#calClose').addEventListener('click', closeCal);
$('#calCancel').addEventListener('click', closeCal);
calScrim.addEventListener('click', e=>{ if(e.target===calScrim) closeCal(); });
$('#calSkeletonSw').addEventListener('change', ()=>{
  $('#calSkeletonNoteFld').style.display = $('#calSkeletonSw').checked ? '' : 'none';
});
$('#calDateTypeSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  $$('#calDateTypeSeg button').forEach(x=>x.classList.toggle('on',x===b));
  const isRange=b.dataset.v==='range';
  $('#calDateSingleFld').style.display = isRange ? 'none' : '';
  $('#calDateRangeFld').style.display = isRange ? 'grid' : 'none';
});
$('#calPartialSw').addEventListener('change', ()=>{
  $('#calTimeFld').style.display = $('#calPartialSw').checked ? 'grid' : 'none';
});
/* ---------- 48-Hour Rule · the clinic's own policy, never leave a branch closed 2 days
   running (wound-care/burns patients can't skip a dressing change that long). Checked only
   against the boundary days of a new full-day closure, not the closure's own internal span —
   a deliberate multi-day closure (e.g. renovation) is an intentional admin decision, not an
   accidental gap from a holiday landing next to an already-closed weekly-off day. ---------- */
function dayOfWeekIdx(dateStr){ return (new Date(dateStr).getDay()+6)%7; } // Mon=0..Sun=6
function addDaysISO(dateStr, delta){ const d=new Date(dateStr); d.setDate(d.getDate()+delta); return d.toISOString().slice(0,10); }
function isDayClosed(branch, dateStr, entries){
  const covering = entries.filter(r=>
    (r.level==='Organization' || r.level==='Branch') &&
    (r.scope==='All branches' || r.scope===branch) &&
    dateStr>=r.date && dateStr<=r.dateTo
  );
  if(covering.some(r=>r.type==='Special Working Day')) return false; // explicitly reopened
  if(covering.some(r=>(r.type==='Public Holiday'||r.type==='Clinic Holiday'||r.type==='Temporary Closure') && !r.partial)) return true;
  return !CLINIC_WEEK[branch][dayOfWeekIdx(dateStr)].on;
}
function violates48HourRule(type, level, scope, date, dateTo, partial){
  if(partial) return null; // still open some hours · not a full closure
  if(!['Public Holiday','Clinic Holiday','Temporary Closure'].includes(type)) return null;
  if(level!=='Organization' && level!=='Branch') return null;
  const branches = scope==='All branches' ? CTX_BRANCHES : [scope];
  for(const branch of branches){
    if(isDayClosed(branch, addDaysISO(date,-1), CAL_ENTRIES)) return {branch, day:addDaysISO(date,-1)};
    if(isDayClosed(branch, addDaysISO(dateTo,1), CAL_ENTRIES)) return {branch, day:addDaysISO(dateTo,1)};
  }
  return null;
}
$('#calSave').addEventListener('click', ()=>{
  const note=$('#calNote').value.trim();
  if(!note){ toast('Give this entry a name'); return; }
  const rangeBtn=$('#calDateTypeSeg button.on');
  const isRange = rangeBtn && rangeBtn.dataset.v==='range';
  const date = isRange ? $('#calDateFrom').value : $('#calDate').value;
  const dateTo = isRange ? $('#calDateTo').value : date;
  if(dateDiffDays(date,dateTo)<1){ toast('The "to" date must be on or after the "from" date.'); return; }
  const partial = $('#calPartialSw').checked;
  if(partial && mins($('#calEnd').value)<=mins($('#calStart').value)){ toast('End time must be after the start time.'); return; }
  const type=$('#calType').value, level=$('#calLevel').value, scope=$('#calScope').value;
  const conflict = violates48HourRule(type, level, scope, date, dateTo, partial);
  if(conflict){
    toast("Can't close 2 days in a row. "+conflict.branch+' is already closed on '+fmtDate(conflict.day)+' (48-Hour Rule)');
    return;
  }
  const repeatAnnual = $('#calRepeatFld').style.display!=='none' && $('#calRepeatSw').checked;
  const skeletonCrew = $('#calSkeletonFld').style.display!=='none' && $('#calSkeletonSw').checked;
  CAL_ENTRIES.push({
    type, date, dateTo, scope, level,
    partial, timeFrom: partial?$('#calStart').value:null, timeTo: partial?$('#calEnd').value:null,
    repeatAnnual, skeletonCrew, skeletonNote: skeletonCrew?$('#calSkeletonNote').value.trim():'', note,
    reason:$('#calReason').value, notes:$('#calNotes').value.trim()
  });
  renderCalEntries(); renderClinicStrip(); renderCalendarView(); closeCal();
  toast($('#calType').value+' added to the calendar');
});

/* ---------- boot ---------- */
syncTab('calendars');
recalcAll(); lvWarn();
renderBlocks(); renderLeaveTable();
renderClinicWeek(); renderCalEntries(); renderClinicStrip(); renderCalendarView();

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
/* mirror of Resource Availability's rooms/equipment · used for Applies-to lists at Resource level */
const ROOMS=['Consultation Room 1','Consultation Room 2','Recovery Bay','Counselling Room','Utility & Sterile Store','Procedure Room 1','Procedure Room 2','Procedure Room 3','Dressing Room 1','Dressing Room 2','Progress Photography Station','Short Stay Room 1','Short Stay Room 2','Day-care Bay 1'];
const EQUIPMENT=['Debridement Kit Set A','Wound VAC Unit','Digital Wound Camera','Autoclave Sterilizer','Patient Wheelchair','Dressing Trolley B'];
const ctxBrDD = makeDropdown('ctxBr', v => { toast('Switched to ' + v); clinicBranchSelDD.set(v); renderClinicWeek(); renderCalEntries(); renderClinicStrip(); renderCalendarView(); });
ctxBrDD.setOptions(CTX_BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.select('Main Campus','Main Campus');

/* deep-link from clinic-branch.html's "→ Configure Branch Calendar" button · same
   location.href='target.html?param=...' + URLSearchParams convention used by
   doctors-staff.html's "Also create login access" → user-onboard.html?linkStaff=...
   Placed last so every const/function it touches (MONTH_NAMES, calYear, the render*
   functions' own dependencies) has already been initialized by the time it runs. */
(function(){
  const params = new URLSearchParams(location.search);
  if(params.get('tab')==='clinic') syncTab('clinic');
  const linkBranch = params.get('branch');
  if(linkBranch){
    clinicBranchSelDD.set(linkBranch);
    renderClinicWeek(); renderCalEntries(); renderClinicStrip(); renderCalendarView();
  }
})();


/* ======================================================================
   BRD §15 additions · Calendars (levels + fields), holiday Reason, Shift
   holidays, Resource availability templates (assignable)
   ====================================================================== */
const CTX_BRANCH_LIST=['Main Campus','OPD Annexe','Madhurawada Branch'];
const WEEKEND_OPTS=['Sunday','Saturday','Saturday and Sunday','No weekly off'];
const daysTxt=d=>{ const n=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']; const on=d.map((x,i)=>x?i:-1).filter(i=>i>=0); if(!on.length) return 'None';
  let run=true; for(let i=1;i<on.length;i++) if(on[i]!==on[i-1]+1) run=false; return run&&on.length>1 ? n[on[0]]+'–'+n[on[on.length-1]] : on.map(i=>n[i]).join(', '); };
const readChips=id=>[0,1,2,3,4,5,6].map(i=>$('#'+id+' [data-d="'+i+'"]').classList.contains('on')?1:0);
const setChips=(id,days)=>days.forEach((v,i)=>$('#'+id+' [data-d="'+i+'"]').classList.toggle('on',!!v));
$$('.daychips').forEach(w=>w.addEventListener('click',e=>{ const b=e.target.closest('.dchip'); if(b) b.classList.toggle('on'); }));

/* ---------- Calendars ---------- */
const wkToDays=wk=>wk.map(d=>d.on?1:0);
let CALENDARS=[
  {name:'KVNN Organization Default', level:'Organization', scope:'KVNN Organization (all branches)', days:wkToDays(ORG_DEFAULT_WEEK), open:'09:00', close:'19:00', weekend:'No weekly off', from:'2026-01-01', until:'', status:'Active', inherit:false},
  {name:'Main Campus Calendar', level:'Branch', scope:'Main Campus', days:wkToDays(CLINIC_WEEK['Main Campus']), open:'09:00', close:'19:00', weekend:'No weekly off', from:'2026-01-01', until:'', status:'Active', inherit:true},
  {name:'OPD Annexe Calendar', level:'Branch', scope:'OPD Annexe', days:wkToDays(CLINIC_WEEK['OPD Annexe']), open:'10:00', close:'18:00', weekend:'No weekly off', from:'2026-01-01', until:'', status:'Active', inherit:false},
  {name:'Madhurawada Branch Calendar', level:'Branch', scope:'Madhurawada Branch', days:wkToDays(CLINIC_WEEK['Madhurawada Branch']), open:'09:00', close:'17:00', weekend:'Saturday', from:'2026-01-01', until:'', status:'Active', inherit:false},
  {name:'Physiotherapy Calendar', level:'Department', scope:'Physiotherapy', days:[1,1,1,1,1,1,0], open:'08:00', close:'18:00', weekend:'Sunday', from:'2026-09-01', until:'2026-12-31', status:'Draft', inherit:false},
  {name:'Procedure Room 1 Calendar', level:'Resource', scope:'Procedure Room 1', days:[1,1,1,1,1,1,0], open:'09:00', close:'18:00', weekend:'Sunday', from:'2026-01-01', until:'', status:'Active', inherit:true}
];
let editCalIdx=-1;
function renderCalendars(){
  $('#calendarsBody').innerHTML=CALENDARS.map((c,i)=>{
    const lvl=c.level==='Organization'?'info':c.level==='Branch'?'soft':c.level==='Department'?'purple':'warn';
    const inh=c.level==='Organization'?'' : c.inherit?'<span class="sub">Inherited from parent</span>':'<span class="sub">Override</span>';
    return '<tr><td><b>'+esc(c.name)+'</b>'+inh+'</td><td><span class="chip '+lvl+'">'+c.level+'</span></td><td>'+esc(c.scope)+'</td>'
      +'<td>'+daysTxt(c.days)+'</td><td class="num">'+label(mins(c.open))+' – '+label(mins(c.close))+'</td><td>'+c.weekend+'</td>'
      +'<td class="num">'+fmtDate(c.from)+(c.until?' – '+fmtDate(c.until):' onwards')+'</td>'
      +'<td><span class="chip '+(c.status==='Active'?'ok':'warn')+'">'+c.status+'</span></td>'
      +'<td style="text-align:right;white-space:nowrap"><button class="iconb" title="Edit" data-editcal="'+i+'">'+EDIT_ICON+'</button>'
      +(c.level==='Organization'?'':'<button class="iconb del" title="Remove" data-delcalendar="'+i+'">'+X+'</button>')+'</td></tr>';
  }).join('');
  $('#calendarsFoot').textContent=CALENDARS.length+' calendars · '+CALENDARS.filter(c=>c.status==='Draft').length+' draft';
  cdefPrevDD.setOptions(CALENDARS.map(c=>c.name)); if(!CALENDARS.some(c=>c.name===$('#cdefPrevSel').value)) cdefPrevDD.set(CALENDARS[0].name);
  renderCdefPreview();
}
function resolveCalendar(c){ // inherit = take the parent's days/hours (Organization for branch, branch for department/resource)
  if(!c.inherit||c.level==='Organization') return c;
  const parent = c.level==='Branch' ? CALENDARS[0] : (CALENDARS.find(x=>x.level==='Branch'&&x.status==='Active')||CALENDARS[0]);
  return {...c, days:parent.days, open:parent.open, close:parent.close, weekend:parent.weekend, parentName:parent.name};
}
function renderCdefPreview(){
  const c=CALENDARS.find(x=>x.name===$('#cdefPrevSel').value)||CALENDARS[0]; const r=resolveCalendar(c);
  $('#cdefPrevSub').innerHTML = c.level==='Organization' ? 'Organization level · nothing to inherit from'
    : (c.inherit ? '<span class="chip soft">Inherited from '+esc(r.parentName)+'</span>' : '<span class="chip warn">Override at '+c.level+' level</span>');
  const T0=6*60, T1=22*60, pct=m=>Math.max(0,Math.min(100,(m-T0)/(T1-T0)*100));
  const open=r.days.filter(Boolean).length, hrs=open*(mins(r.close)-mins(r.open))/60;
  const ticks=[6,9,12,15,18,21].map(h=>'<span style="left:'+pct(h*60)+'%">'+(h>12?h-12+' PM':h===12?'12 PM':h+' AM')+'</span>').join('');
  $('#cdefPrev').innerHTML='<div class="wkprev">'
    +'<div class="wkprev-stats"><div><b>'+open+'</b><span>days open · week</span></div><div><b>'+(Number.isInteger(hrs)?hrs:hrs.toFixed(1))+'</b><span>hours · week</span></div><div><b>'+label(mins(r.open))+' – '+label(mins(r.close))+'</b><span>opening hours</span></div><div><b>'+esc(r.weekend)+'</b><span>weekend</span></div></div>'
    +'<div class="wkprev-ticks"><span class="wkprev-daylbl"></span><div class="wkprev-axis">'+ticks+'</div></div>'
    +r.days.map((on,i)=>'<div class="wkprev-row'+(on?'':' off')+'"><span class="wkprev-daylbl">'+DAY_NAMES_FULL[i]+'</span>'
      +'<div class="wkprev-track">'+(on?'<div class="wkprev-bar" style="left:'+pct(mins(r.open))+'%;width:'+(pct(mins(r.close))-pct(mins(r.open)))+'%"><span>'+label(mins(r.open))+' – '+label(mins(r.close))+'</span></div>':'<span class="wkprev-offlbl">Weekly off</span>')+'</div>'
      +'<span class="chip '+(on?'ok':'')+'" style="'+(on?'':'background:var(--surface-3);color:var(--ink-muted)')+'">'+(on?'Open':'Closed')+'</span></div>').join('')
    +'</div>';
}
const cdefPrevDD=initFormSelect('cdefPrevSelWrap','cdefPrevSelBtn','cdefPrevSelPanel','cdefPrevSel',CALENDARS.map(c=>c.name),renderCdefPreview);
const cdLevelDD=initFormSelect('cdLevelWrap','cdLevelBtn','cdLevelPanel','cdLevel',['Organization','Branch','Department','Resource'],l=>{ cdScopeDD.setOptions(scopeOptionsForLevel(l).filter(x=>x!=='All branches')); lockScope(l,'cdScopeWrap','cdScopeLock','cdScope'); });
const cdScopeDD=initFormSelect('cdScopeWrap','cdScopeBtn','cdScopePanel','cdScope',CTX_BRANCH_LIST);
const cdWeekendDD=initFormSelect('cdWeekendWrap','cdWeekendBtn','cdWeekendPanel','cdWeekend',WEEKEND_OPTS);
const cdefScrim=$('#cdefScrim');
function openCalendarModal(i){
  editCalIdx=i; const c=i>=0?CALENDARS[i]:null;
  $('#cdefScrimTitle').textContent=c?'Edit calendar':'Add calendar';
  $('#cdName').value=c?c.name:'';
  cdLevelDD.set(c?c.level:'Branch'); cdScopeDD.setOptions(scopeOptionsForLevel(c?c.level:'Branch').filter(x=>x!=='All branches')); cdScopeDD.set(c?c.scope:CTX_BRANCH_LIST[0]); lockScope(c?c.level:'Branch','cdScopeWrap','cdScopeLock','cdScope'); if(c&&c.level==='Branch'){ $('#cdScopeLock span').textContent=c.scope; $('#cdScope').value=c.scope; }
  setChips('cdDays', c?c.days:[1,1,1,1,1,1,0]);
  $('#cdOpen').value=c?c.open:'09:00'; $('#cdClose').value=c?c.close:'19:00';
  cdWeekendDD.set(c?c.weekend:'Sunday');
  $('#cdFrom').value=c?c.from:'2026-09-01'; $('#cdUntil').value=c?c.until:'';
  $$('#cdStatusSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===(c?c.status:'Active')));
  $('#cdSave').textContent=c?'Save changes':'Save calendar';
  cdefScrim.classList.add('show');
}
$('#addCalendar').addEventListener('click',()=>openCalendarModal(-1));
$('#calendarsBody').addEventListener('click',e=>{
  const ed=e.target.closest('[data-editcal]'); if(ed){ openCalendarModal(+ed.dataset.editcal); return; }
  const del=e.target.closest('[data-delcalendar]'); if(del){ CALENDARS.splice(+del.dataset.delcalendar,1); renderCalendars(); toast('Calendar removed'); }
});
$('#cdStatusSeg').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; $$('#cdStatusSeg button').forEach(x=>x.classList.toggle('on',x===b)); });
const closeCdef=()=>cdefScrim.classList.remove('show');
$('#cdClose').addEventListener('click',closeCdef); $('#cdCancel').addEventListener('click',closeCdef);
cdefScrim.addEventListener('click',e=>{ if(e.target===cdefScrim) closeCdef(); });
$('#cdSave').addEventListener('click',()=>{
  const name=$('#cdName').value.trim(); if(!name){ toast('Give the calendar a name'); return; }
  const days=readChips('cdDays'); if(!days.some(Boolean)){ toast('Pick at least one working day'); return; }
  if(mins($('#cdClose').value)<=mins($('#cdOpen').value)){ toast('Closing time must be after opening time'); return; }
  const rec={name, level:$('#cdLevel').value, scope:$('#cdScope').value, days, open:$('#cdOpen').value, close:$('#cdClose').value,
    weekend:$('#cdWeekend').value, from:$('#cdFrom').value, until:$('#cdUntil').value, status:$('#cdStatusSeg button.on').dataset.v, inherit:false};
  const org=CALENDARS[0]; rec.inherit = rec.level!=='Organization' && rec.days.join()===org.days.join() && rec.open===org.open && rec.close===org.close;
  if(editCalIdx>=0) CALENDARS[editCalIdx]=rec; else CALENDARS.push(rec);
  renderCalendars(); closeCdef(); toast(editCalIdx>=0?'Calendar updated':'Calendar "'+name+'" added'+(rec.status==='Draft'?' as draft':''));
});

/* ---------- Holiday reason (BRD: Reason select) ---------- */
const CAL_REASONS=['Public holiday','Festival','Maintenance / renovation','Staff event / training','Weather / emergency','Extended clinic hours','Other'];
const calReasonDD=initFormSelect('calReasonWrap','calReasonBtn','calReasonPanel','calReason',CAL_REASONS);
CAL_ENTRIES.forEach(r=>{ if(!r.reason) r.reason = r.type==='Public Holiday'?'Public holiday':r.type==='Clinic Holiday'?'Festival':r.type==='Temporary Closure'?'Maintenance / renovation':r.type==='Special Working Day'?'Extended clinic hours':'Other'; });
renderCalEntries();

/* ---------- Shift holidays (BRD §15) · shift templates mirror Doctor Sessions & Staff Rosters ---------- */
const SHIFT_TEMPLATES_MIRROR=['Morning (07:00–15:00)','Evening (15:00–23:00)','Night (23:00–07:00)','General / Admin (09:00–17:00)'];
const SHIFT_HOL_REASONS=['Festival','Public holiday','Low expected footfall','Maintenance / renovation','Other'];
let SHIFT_HOLS=[ {tpl:'Night (23:00–07:00)', date:'2026-08-27', level:'Branch', scope:'Main Campus', reason:'Festival'} ];
function renderShiftHols(){
  $('#shiftHolBody').innerHTML=SHIFT_HOLS.map((s,i)=>'<tr><td><b>'+esc(s.tpl)+'</b></td><td class="num">'+fmtDate(s.date)+'</td><td>'+esc(s.scope)+'<span class="sub">'+s.level+' level</span></td><td>'+esc(s.reason)+'</td>'
    +'<td style="text-align:right"><button class="iconb del" title="Remove" data-delsh="'+i+'">'+X+'</button></td></tr>').join('')
    || '<tr><td colspan="5" style="text-align:center;color:var(--ink-muted);padding:22px">No shift holidays.</td></tr>';
  $('#shiftHolFoot').textContent=SHIFT_HOLS.length+' shift holiday'+(SHIFT_HOLS.length===1?'':'s');
}
$('#shiftHolBody').addEventListener('click',e=>{ const d=e.target.closest('[data-delsh]'); if(!d) return; SHIFT_HOLS.splice(+d.dataset.delsh,1); renderShiftHols(); toast('Shift holiday removed'); });
const shTplDD=initFormSelect('shTplWrap','shTplBtn','shTplPanel','shTpl',SHIFT_TEMPLATES_MIRROR);
const shLevelDD=initFormSelect('shLevelWrap','shLevelBtn','shLevelPanel','shLevel',['Branch','Department'],l=>{ shScopeDD.setOptions(l==='Branch'?CTX_BRANCH_LIST:DEPARTMENTS); lockScope(l,'shScopeWrap','shScopeLock','shScope'); });
const shScopeDD=initFormSelect('shScopeWrap','shScopeBtn','shScopePanel','shScope',CTX_BRANCH_LIST);
const shReasonDD=initFormSelect('shReasonWrap','shReasonBtn','shReasonPanel','shReason',SHIFT_HOL_REASONS);
const shiftHolScrim=$('#shiftHolScrim');
$('#addShiftHol').addEventListener('click',()=>{ shTplDD.set(SHIFT_TEMPLATES_MIRROR[0]); $('#shDate').value='2026-08-27'; shLevelDD.set('Branch'); shScopeDD.setOptions(CTX_BRANCH_LIST); shScopeDD.set($('#clinicBranchSel').value==='All branches'?CTX_BRANCH_LIST[0]:$('#clinicBranchSel').value); shReasonDD.set(SHIFT_HOL_REASONS[0]); lockScope('Branch','shScopeWrap','shScopeLock','shScope'); shiftHolScrim.classList.add('show'); });
const closeShiftHol=()=>shiftHolScrim.classList.remove('show');
$('#shClose').addEventListener('click',closeShiftHol); $('#shCancel').addEventListener('click',closeShiftHol);
shiftHolScrim.addEventListener('click',e=>{ if(e.target===shiftHolScrim) closeShiftHol(); });
$('#shSave').addEventListener('click',()=>{ SHIFT_HOLS.push({tpl:$('#shTpl').value, date:$('#shDate').value, level:$('#shLevel').value, scope:$('#shScope').value, reason:$('#shReason').value}); renderShiftHols(); closeShiftHol(); toast('Shift holiday added'); });
renderShiftHols();

renderCalendars();

/* ---------- header bell · real alerts derived from CALENDARS / CAL_ENTRIES / SHIFT_HOLS (no static count) ---------- */
function calendarAlerts(){
  const out=[]; const today=new Date(); today.setHours(0,0,0,0);
  const soon=d=>{ const x=new Date(d); const diff=Math.round((x-today)/864e5); return diff>=0 && diff<=14 ? diff : null; };
  const when=d=>d===0?'today':d===1?'tomorrow':'in '+d+' days';
  CALENDARS.forEach(c=>{ if(c.status==='Draft') out.push({lvl:'warn', t:c.name+' is still a draft', s:c.level+' level · not used for booking until it is made Active', tab:'calendars'}); });
  CALENDARS.forEach(c=>{ if(c.until && new Date(c.until)<today) out.push({lvl:'bad', t:c.name+' has expired', s:'Effective until '+fmtDate(c.until)+' · extend it or the parent calendar applies', tab:'calendars'}); });
  CAL_ENTRIES.forEach(r=>{ const d=soon(r.date); if(d===null) return;
    if(r.type==='Temporary Closure') out.push({lvl:'bad', t:r.scope+' closes '+when(d), s:r.note+' · '+fmtDate(r.date)+(r.dateTo!==r.date?' – '+fmtDate(r.dateTo):'')+' · move or inform booked patients', tab:'clinic'});
    else if(r.type.includes('Holiday')) out.push({lvl:'info', t:r.note+' '+when(d), s:r.type+' · '+r.scope+' · '+fmtDate(r.date), tab:'clinic'});
    else if(r.type==='Calendar Exception') out.push({lvl:'warn', t:'Calendar exception '+when(d)+' · '+r.scope, s:r.note+(r.partial?' · '+label(mins(r.timeFrom))+' – '+label(mins(r.timeTo)):''), tab:'clinic'});
    else out.push({lvl:'info', t:r.note+' '+when(d), s:r.type+' · '+r.scope+' · '+fmtDate(r.date), tab:'clinic'});
  });
  SHIFT_HOLS.forEach(s=>{ const d=soon(s.date); if(d===null) return; out.push({lvl:'warn', t:s.tpl.replace(/ \(.*\)/,'')+' shift off '+when(d), s:s.scope+' · '+s.reason+' · '+fmtDate(s.date), tab:'clinic'}); });
  return out;
}
const BELL_ICO={
  warn:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
  info:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  bad:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
};
function renderBell(){
  const a=calendarAlerts();
  $('#bellCnt').textContent=a.length; $('#bellCnt').style.display=a.length?'grid':'none';
  $('#bellSub').textContent=a.length?a.length+' item'+(a.length===1?'':'s')+' · next 14 days':'Nothing needs attention';
  $('#bellList').innerHTML=a.length?a.map(x=>'<button type="button" class="bellrow '+x.lvl+'" data-tab="'+x.tab+'"><span class="bic">'+BELL_ICO[x.lvl]+'</span><div class="btx"><b>'+esc(x.t)+'</b><span>'+esc(x.s)+'</span></div><span class="goto">'+(x.tab==='calendars'?'Calendars':'Holidays')+' →</span></button>').join(''):'<div class="bellempty">No drafts, expiries, holidays or closures in the next 14 days.</div>';
}
$('#bellBtn').addEventListener('click',e=>{ e.stopPropagation(); renderBell(); $('#bellWrap').classList.toggle('open'); });
$('#bellList').addEventListener('click',e=>{ const r=e.target.closest('.bellrow'); if(!r) return; $('#bellWrap').classList.remove('open'); syncTab(r.dataset.tab); });
document.addEventListener('click',e=>{ if(!$('#bellWrap').contains(e.target)) $('#bellWrap').classList.remove('open'); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape') $('#bellWrap').classList.remove('open'); });
renderBell();
/* keep the badge honest when data changes on this page */
['cdSave','calSave','shSave'].forEach(id=>$('#'+id).addEventListener('click',()=>setTimeout(renderBell,0)));
['calendarsBody','calBody','shiftHolBody'].forEach(id=>$('#'+id).addEventListener('click',()=>setTimeout(renderBell,0)));
