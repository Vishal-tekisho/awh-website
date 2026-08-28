/* Slots, Capacity, Booking & Queue Rules · BRD §16 (Workspace 14)
   Six tabs (A–F) of structured settings + the required right-side Live Availability Preview.
   Settings live at Organization level; a branch can override any field (BRD §1.4 inheritance). */
document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show'); clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- shared dropdown components (same as every other screen) ---------- */
function initFsel(wrapId,btnId,panelId,hiddenId,opts,onPick){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  const setVal=(v,silent)=>{ hidden.value=v; const f=opts.find(o=>o[0]===v); btn.textContent=f?f[1]:(opts[0]?opts[0][1]:''); $$('#'+panelId+' .fselopt').forEach(x=>x.classList.toggle('on',x.dataset.v===v)); if(!silent&&onPick) onPick(v); };
  const render=()=>{ panel.innerHTML=opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+esc(v)+'">'+esc(l)+'</button>').join(''); };
  render(); setVal(opts[0]?opts[0][0]:'', true);
  panel.addEventListener('click',e=>{ const b=e.target.closest('.fselopt'); if(!b) return; setVal(b.dataset.v); root.classList.remove('open'); });
  btn.addEventListener('click',e=>{ e.stopPropagation(); const was=root.classList.contains('open'); $$('.f.fsel,.mchk').forEach(x=>x.classList.remove('open')); if(!was) root.classList.add('open'); });
  return { set:v=>setVal(v,true), get:()=>hidden.value, setOptions:(o2,keep)=>{ opts=o2; render(); setVal(keep!==undefined?keep:hidden.value,true); } };
}
function initMchk(rootId,btnId,panelId,chipsId,vocab,placeholder,searchable,onChange){
  const root=$('#'+rootId), btn=$('#'+btnId), panel=$('#'+panelId), chipsEl=$('#'+chipsId); let selected=[];
  const searchHTML=searchable?'<input type="text" class="mchk-search" placeholder="Search…" id="'+panelId+'Search">':'';
  const renderChips=()=>{ chipsEl.innerHTML=selected.map(v=>'<span class="mchip">'+esc(vocab[v]||v)+'<button type="button" data-rm="'+esc(v)+'">&times;</button></span>').join(''); btn.textContent=selected.length?selected.length+' selected':placeholder; };
  const renderPanel=()=>{ panel.innerHTML=searchHTML+Object.entries(vocab).map(([v,l])=>'<label class="mchk-opt"><input type="checkbox" value="'+esc(v)+'" '+(selected.includes(v)?'checked':'')+'><span>'+esc(l)+'</span></label>').join('');
    if(searchable){ const si=$('#'+panelId+'Search'); si.addEventListener('input',e=>{ const q=e.target.value.trim().toLowerCase(); $$('#'+panelId+' .mchk-opt').forEach(el=>{ el.style.display=(!q||el.textContent.toLowerCase().includes(q))?'':'none'; }); }); si.addEventListener('click',e=>e.stopPropagation()); } };
  renderPanel(); renderChips();
  btn.addEventListener('click',e=>{ e.stopPropagation(); const was=root.classList.contains('open'); $$('.f.fsel,.mchk').forEach(x=>x.classList.remove('open')); if(!was){ root.classList.add('open'); if(searchable){ const si=$('#'+panelId+'Search'); si.value=''; $$('#'+panelId+' .mchk-opt').forEach(el=>el.style.display=''); si.focus(); } } });
  panel.addEventListener('change',e=>{ const cb=e.target.closest('input[type=checkbox]'); if(!cb) return; if(cb.checked){ if(!selected.includes(cb.value)) selected.push(cb.value); } else selected=selected.filter(v=>v!==cb.value); renderChips(); if(onChange) onChange(selected.slice()); });
  chipsEl.addEventListener('click',e=>{ const b=e.target.closest('[data-rm]'); if(!b) return; selected=selected.filter(v=>v!==b.dataset.rm); renderChips(); renderPanel(); if(onChange) onChange(selected.slice()); });
  return { set(arr){ selected=Array.isArray(arr)?arr.slice():[]; renderPanel(); renderChips(); }, get(){ return selected.slice(); } };
}
document.addEventListener('click',()=>$$('.f.fsel,.mchk').forEach(x=>x.classList.remove('open')));

/* ---------- masters mirrored from other screens (no shared runtime in this prototype) ---------- */
const BRANCHES=['Main Campus','OPD Annexe','Madhurawada Branch'];
const BRANCH_HOURS={'Main Campus':['09:00','19:00'],'OPD Annexe':['10:00','18:00'],'Madhurawada Branch':['09:00','17:00']}; // Calendars & Availability
const BRANCH_LUNCH={'Main Campus':['13:00','14:00'],'OPD Annexe':['13:00','14:00'],'Madhurawada Branch':['13:00','13:30']};
const DOCTORS=['Dr. KVNN Santosh Murthy','Dr. Hrishikesh Korada','Dr. Harsh Atul','Dr. Raghavendra','Dr. Sameera']; // Doctors & Staff
/* Services & Consultation Types · the bookable ones that drive slot rules (procedures are staff-only by default) */
const SERVICES=[
  {n:'New Appointment', kind:'consult', dur:15, cap:1, buf:5},
  {n:'Wound Physio', kind:'treat', dur:30, cap:1, buf:5},
  {n:'Foot Scan & Analysis', kind:'consult', dur:20, cap:1, buf:5},
  {n:'Gait Analysis', kind:'consult', dur:20, cap:1, buf:5},
  {n:'PAIN MANAGEMENT', kind:'treat', dur:30, cap:1, buf:10},
  {n:'OZONE THERAPY', kind:'treat', dur:45, cap:2, buf:10},
  {n:'WARM OXYGEN THERAPY', kind:'treat', dur:45, cap:2, buf:10},
  {n:'LASERS', kind:'proc', dur:30, cap:1, buf:15},
  {n:'PLATELET RICH PLASMA Procedure', kind:'proc', dur:60, cap:1, buf:15}
];
const CHANNELS=[['web','Website Booking Form'],['assist','Website Assistant'],['wa','WhatsApp'],['voice','Voice / Call Agent'],['desk','Reception / Care Desk']];
/* Reference Masters · reason lists (Reference Masters, Identifiers & Audit) */
const CANCEL_REASONS={'Patient request':'Patient request','Doctor unavailable':'Doctor unavailable','Weather':'Weather','Other':'Other'};
const RESCHED_REASONS={'Doctor unavailable':'Doctor unavailable','Patient request':'Patient request','Equipment unavailable':'Equipment unavailable','Room conflict':'Room conflict','Weather/Travel':'Weather/Travel'};
const NOSHOW_REASONS={'No response':'No response','Transport issue':'Transport issue','Forgot appointment':'Forgot appointment','Medical emergency':'Medical emergency','Other':'Other'};
const PRIORITY_CATS={'Routine':'Routine','Urgent':'Urgent','Emergency':'Emergency'};
const APPT_TYPES={'New Consultation':'New Consultation','Follow-up Review':'Follow-up Review','Dressing Change':'Dressing Change','Second Opinion':'Second Opinion','Emergency Visit':'Emergency Visit'}; // Appointment Reasons master

/* ---------- settings · organization default + per-branch overrides ---------- */
const ORG_DEFAULT={
  /* A. Slot & Capacity */
  slotDuration:15, defaultApptDuration:15, slotTemplate:'std15', capacityPerSlot:1, parallel:false, overbooking:false, overbookLimit:1,
  reservedMode:'slots', reservedValue:2, bufferBefore:0, bufferAfter:5, cleanup:10,
  svcMatrix:SERVICES.map(s=>({n:s.n, dur:s.dur, cap:s.cap, buf:s.buf})),
  docOverrides:[{doc:'Dr. KVNN Santosh Murthy', svc:'New Appointment', dur:20},{doc:'Dr. Raghavendra', svc:'Wound Physio', dur:40}],
  /* B. Booking */
  advanceWindow:30, sameDay:true, minNotice:2, maxFuture:3, apptTypes:['New Consultation','Follow-up Review','Dressing Change'],
  providerMode:'patient', locationMode:'patient', resourceReq:'validate', restrictions:['procStaff','oneActive'], eligibility:['registered'],
  confirmMode:'auto', bookingSources:['web','wa','voice','desk'],
  /* C. Cancellation & Reschedule */
  cancelCutoff:4, reschedCutoff:2, cancelReasons:Object.keys(CANCEL_REASONS), reschedReasons:Object.keys(RESCHED_REASONS),
  staffOverride:true, overrideReason:true, providerChange:'notifyOffer', bulkRecovery:true, notifTriggers:['cancel','resched','provider'],
  /* D. Channels */
  chanMatrix:Object.fromEntries(SERVICES.map(s=>[s.n, s.kind==='proc'?['desk']:['web','assist','wa','voice','desk']])),
  chanCfg:{ web:{on:true,window:30,sameDay:true,verify:'otp',staffOnly:false}, assist:{on:true,window:30,sameDay:true,verify:'otp',staffOnly:false}, wa:{on:true,window:14,sameDay:true,verify:'otp',staffOnly:false}, voice:{on:true,window:14,sameDay:true,verify:'callback',staffOnly:false}, desk:{on:true,window:90,sameDay:true,verify:'none',staffOnly:true} },
  /* E. Walk-in / Waitlist / Recurring */
  walkinAllowed:true, walkinCapacity:5, walkinOpenGap:true, walkinReserved:false, walkinOverride:true,
  waitlist:true, waitPrefDate:true, waitPrefTime:true, waitExpiry:24, waitEarlier:true,
  recurring:true, treatmentSeries:true, multiSession:'all', seriesChange:'ask',
  /* F. Arrival / Queue / No-show */
  arrivalWindow:15, earlyThreshold:30, lateThreshold:10, checkinRule:'reception', waitingRule:'auto', doctorDelay:'reestimate', delayThreshold:15,
  noShowGrace:20, noShowReasons:Object.keys(NOSHOW_REASONS), repeatCount:2, repeatDays:60, repeatAction:'confirm',
  queueType:'two', tokenPrefix:'DR', tokenReset:'daily', priorityCats:['Urgent','Emergency']
};
const BRANCH_OVERRIDES={ 'Main Campus':{}, 'OPD Annexe':{slotDuration:20, defaultApptDuration:20, reservedValue:1, walkinCapacity:3}, 'Madhurawada Branch':{} };
let curBranch='Main Campus', curTab='slot', saveState='published';
const clone=v=>JSON.parse(JSON.stringify(v));
const eff=()=>Object.assign({}, ORG_DEFAULT, BRANCH_OVERRIDES[curBranch]||{});
const S=()=>eff();
function setVal(key,val){
  if(JSON.stringify(ORG_DEFAULT[key])===JSON.stringify(val)) delete BRANCH_OVERRIDES[curBranch][key]; else BRANCH_OVERRIDES[curBranch][key]=val;
  markDirty(); renderInherit(); renderPreview();
}
function markDirty(){ saveState='dirty'; renderSaveState(); }
function renderSaveState(){
  const c=$('#saveState'); const m={dirty:['warn','Unsaved changes'],draft:['info','Draft saved · not live'],published:['ok','All changes published']}[saveState];
  c.className='chip '+m[0]; c.textContent=m[1];
}
function renderInherit(){
  const n=Object.keys(BRANCH_OVERRIDES[curBranch]||{}).length, chip=$('#inhChip');
  chip.className='chip '+(n?'warn':'info'); chip.textContent=n?'Branch Override · '+n+' field'+(n===1?'':'s')+' differ from KVNN Organization Default':'Using Organization Default';
  $('#resetOrgBtn').style.display=n?'inline-flex':'none';
}
$('#resetOrgBtn').addEventListener('click',()=>{ BRANCH_OVERRIDES[curBranch]={}; markDirty(); renderTab(); renderInherit(); renderPreview(); toast(curBranch+' now uses the organization default'); });
$('#saveDraftBtn').addEventListener('click',()=>{ saveState='draft'; renderSaveState(); toast('Draft saved for '+curBranch+' · booking channels still use the published rules'); });
$('#publishBtn').addEventListener('click',()=>{ const w=validate(); if(w.some(x=>x.lvl==='bad')){ toast('Fix the blocking warnings in the preview before publishing'); return; } saveState='published'; renderSaveState(); toast('Rules published · all channels now read the new availability'); });

/* ---------- field renderers (one small DSL so every tab looks identical) ---------- */
const fsel=(id,w)=>'<div class="f fsel" id="'+id+'Wrap"><button type="button" class="fselbtn" id="'+id+'Btn"></button><div class="fselpanel" id="'+id+'Panel"></div><input type="hidden" id="'+id+'"></div>';
const mchk=(id,ph)=>'<div class="mchk" id="'+id+'Wrap"><div class="mchk-chips" id="'+id+'Chips"></div><button type="button" class="fselbtn" id="'+id+'Btn">'+esc(ph||'Select')+'</button><div class="mchk-panel" id="'+id+'Panel"></div></div>';
const F={
  dur:(k,l,unit,h)=>'<div class="fg"><label>'+l+'</label><div class="iunit"><input type="number" class="inp" min="0" step="1" data-k="'+k+'" data-t="num" value="'+S()[k]+'"><span>'+(unit||'min')+'</span></div>'+(h?'<span class="hint">'+h+'</span>':'')+'</div>',
  num:(k,l,h)=>'<div class="fg"><label>'+l+'</label><input type="number" class="inp" min="0" step="1" data-k="'+k+'" data-t="num" value="'+S()[k]+'">'+(h?'<span class="hint">'+h+'</span>':'')+'</div>',
  text:(k,l,h,ph)=>'<div class="fg"><label>'+l+'</label><input type="text" class="inp" data-k="'+k+'" data-t="text" value="'+esc(S()[k])+'" placeholder="'+esc(ph||'')+'">'+(h?'<span class="hint">'+h+'</span>':'')+'</div>',
  tog:(k,l,h)=>'<div class="fg togrow"><div><label>'+l+'</label>'+(h?'<span class="hint">'+h+'</span>':'')+'</div><label class="sw"><input type="checkbox" data-k="'+k+'" data-t="bool"'+(S()[k]?' checked':'')+'><i></i></label></div>',
  seg:(k,l,opts,h)=>'<div class="fg"><label>'+l+'</label><div class="mseg" data-k="'+k+'" data-t="seg">'+opts.map(([v,t])=>'<button type="button" data-v="'+v+'"'+(S()[k]===v?' class="on"':'')+'>'+t+'</button>').join('')+'</div>'+(h?'<span class="hint">'+h+'</span>':'')+'</div>',
  sel:(k,l,h)=>'<div class="fg"><label>'+l+'</label>'+fsel('f_'+k)+(h?'<span class="hint">'+h+'</span>':'')+'</div>',
  multi:(k,l,h,ph)=>'<div class="fg"><label>'+l+'</label>'+mchk('f_'+k,ph)+(h?'<span class="hint">'+h+'</span>':'')+'</div>'
};
const card=(title,sub,body,extra)=>'<div class="card"><div class="ch"><div><h3>'+title+'</h3>'+(sub?'<p>'+sub+'</p>':'')+'</div>'+(extra||'')+'</div><div class="cb">'+body+'</div></div>';
const grid=(...cells)=>'<div class="fgrid">'+cells.join('')+'</div>';
const SELECT_OPTS={
  slotTemplate:[['std15','Standard 15 min'],['std20','Standard 20 min'],['treat30','Treatment 30 min'],['proc60','Procedure 60 min'],['custom','Custom']],
  providerMode:[['patient','Patient chooses the doctor'],['any','Any available doctor'],['staff','Staff assigns the doctor']],
  locationMode:[['patient','Patient chooses the branch'],['home','Default to the patient\'s home branch'],['staff','Staff assigns the branch']],
  resourceReq:[['validate','Validate room and equipment before confirming'],['warn','Warn only, staff can still confirm'],['none','Do not check resources at booking']],
  providerChange:[['notifyOffer','Notify the patient and offer rebooking'],['notify','Notify the patient only'],['substitute','Move to the substitute doctor, then notify']],
  checkinRule:[['reception','Reception check-in required'],['self','Patient can confirm arrival on WhatsApp, reception verifies'],['auto','Mark arrived at scheduled time']],
  waitingRule:[['auto','Checked-in → Waiting automatically'],['manual','Reception moves the patient to Waiting']],
  doctorDelay:[['reestimate','Re-estimate wait times and notify waiting patients'],['hold','Hold the queue, no notification'],['reassign','Offer next available doctor']],
  repeatAction:[['confirm','Reception must confirm the next booking'],['deposit','Flag only, no restriction'],['block','Block online booking, reception only']],
  tokenReset:[['daily','Resets daily'],['session','Resets per session'],['never','Never resets']]
};
const MULTI_VOCAB={
  apptTypes:APPT_TYPES,
  restrictions:{procStaff:'Procedures are staff-only',oneActive:'One active booking per service per patient',newVerify:'New patients must verify mobile first',noBackToBack:'No back-to-back bookings for the same patient'},
  eligibility:{registered:'Registered patients only',referral:'Referral required for procedures',adult:'Patients under 18 need a caretaker on file',package:'Package sessions only while the package is valid'},
  bookingSources:Object.fromEntries(CHANNELS),
  cancelReasons:CANCEL_REASONS, reschedReasons:RESCHED_REASONS, noShowReasons:NOSHOW_REASONS, priorityCats:PRIORITY_CATS,
  notifTriggers:{cancel:'Cancellation',resched:'Reschedule',provider:'Provider-initiated change',reminder:'Reminder before appointment'}
};
const SEG_OPTS={
  reservedMode:[['slots','Slots per day'],['pct','% of capacity']],
  confirmMode:[['auto','Auto-confirm'],['staff','Staff-confirm']],
  multiSession:[['all','Generate every session'],['first','Generate the first, rest on review']],
  seriesChange:[['ask','Ask each time'],['one','This occurrence only'],['series','Whole remaining series']],
  queueType:[['single','Single queue'],['two','Doctor queue + Reception queue']]
};

/* ---------- tab bodies ---------- */
function tabSlot(){
  const s=S();
  const matrix='<div class="tblwrap"><table class="tbl"><thead><tr><th>Service</th><th>Duration</th><th>Capacity</th><th>Buffer</th><th>Doctor override</th></tr></thead><tbody>'
    +s.svcMatrix.map((r,i)=>{ const ov=s.docOverrides.filter(o=>o.svc===r.n);
      return '<tr><td><b>'+esc(r.n)+'</b><span class="sub">'+({consult:'Consultation',treat:'Treatment',proc:'Procedure'}[SERVICES[i].kind])+'</span></td>'
      +'<td><div class="iunit sm"><input type="number" class="inp" min="5" step="5" value="'+r.dur+'" data-mx="'+i+'" data-f="dur"><span>min</span></div></td>'
      +'<td><input type="number" class="inp sm" min="1" step="1" value="'+r.cap+'" data-mx="'+i+'" data-f="cap"></td>'
      +'<td><div class="iunit sm"><input type="number" class="inp" min="0" step="5" value="'+r.buf+'" data-mx="'+i+'" data-f="buf"><span>min</span></div></td>'
      +'<td>'+(ov.map(o=>'<span class="chip soft ovchip">'+esc(o.doc.replace('Dr. ',''))+' · '+o.dur+' min<button type="button" data-rmov="'+esc(o.doc)+'|'+esc(o.svc)+'" title="Remove">&times;</button></span>').join(' ')||'<span class="mutetxt">Service duration</span>')+' <button type="button" class="mini" data-addov="'+i+'">+ Override</button></td></tr>'; }).join('')
    +'</tbody></table></div>'
    +'<div class="precedence"><b>Precedence</b> Doctor Override <span>›</span> Service Duration <span>›</span> Default Duration</div>'
    +'<div id="ovForm" class="ovform" style="display:none"><span class="lbl">New doctor override</span><div class="fgrid three">'
    +'<div class="fg"><label>Doctor</label>'+fsel('ovDoc')+'</div><div class="fg"><label>Service</label>'+fsel('ovSvc')+'</div>'
    +'<div class="fg"><label>Duration</label><div class="iunit"><input type="number" class="inp" id="ovDur" min="5" step="5" value="20"><span>min</span></div></div></div>'
    +'<div class="ovbtns"><button type="button" class="btn btn-ghost btn-sm" id="ovCancel">Cancel</button><button type="button" class="btn btn-primary btn-sm" id="ovSave">Add override</button></div></div>';
  return card('Slot & capacity defaults','Applies to every service unless the matrix below or a doctor override says otherwise',
      grid(F.dur('slotDuration','Slot duration'), F.dur('defaultApptDuration','Default appointment duration'), F.sel('slotTemplate','Slot template','Picking a template fills slot and appointment duration'),
           F.num('capacityPerSlot','Capacity per slot','Patients that can hold the same slot'), F.tog('parallel','Parallel appointments','Lets two doctors or rooms take the same slot time'),
           '<div class="fg togrow"><div><label>Overbooking</label><span class="hint">Allow bookings beyond capacity, up to the limit</span></div><div class="togwithlimit"><label class="sw"><input type="checkbox" data-k="overbooking" data-t="bool"'+(s.overbooking?' checked':'')+'><i></i></label><div class="iunit sm" id="obLimitWrap" style="'+(s.overbooking?'':'display:none')+'"><input type="number" class="inp" min="1" step="1" data-k="overbookLimit" data-t="num" value="'+s.overbookLimit+'"><span>max</span></div></div></div>',
           '<div class="fg"><label>Reserved / urgent same-day capacity</label><div class="reserved"><input type="number" class="inp" min="0" step="1" data-k="reservedValue" data-t="num" value="'+s.reservedValue+'"><div class="mseg" data-k="reservedMode" data-t="seg">'+SEG_OPTS.reservedMode.map(([v,t])=>'<button type="button" data-v="'+v+'"'+(s.reservedMode===v?' class="on"':'')+'>'+t+'</button>').join('')+'</div></div><span class="hint">Held back from advance booking for same-day urgent cases</span></div>',
           F.dur('bufferBefore','Buffer before'), F.dur('bufferAfter','Buffer after'), F.dur('cleanup','Cleanup / recovery','min','Added after procedures and treatments')))
    +card('Service-specific duration matrix','Overrides the defaults per service; a doctor override wins over both', matrix);
}
function tabBook(){
  return card('Booking window','How far ahead and how late a booking can be made',
      grid(F.dur('advanceWindow','Advance booking window','days'), F.dur('maxFuture','Maximum future bookings','per patient','Open bookings one patient can hold at a time'), F.dur('minNotice','Minimum notice','hr'), F.tog('sameDay','Same-day booking','Opens remaining capacity on the day itself')))
    +card('Appointment & provider rules','',
      grid(F.multi('apptTypes','Appointment types','From the Appointment Reasons master','Select types'), F.sel('providerMode','Provider selection mode'), F.sel('locationMode','Location / branch selection'), F.sel('resourceReq','Resource requirement','Room and equipment come from the service and treatment setup')))
    +card('Restrictions, eligibility & confirmation','',
      grid(F.multi('restrictions','Booking restrictions','','Select restrictions'), F.multi('eligibility','Eligibility rules','','Select rules'), F.seg('confirmMode','Confirmation',SEG_OPTS.confirmMode,'Staff-confirm holds the slot until reception approves'), F.multi('bookingSources','Booking sources','Every booking is tagged with the channel it came from','Select sources')));
}
function tabCancel(){
  return card('Cutoffs','After the cutoff only staff can change the appointment',
      grid(F.dur('cancelCutoff','Cancellation cutoff','hr before'), F.dur('reschedCutoff','Reschedule cutoff','hr before'),
           F.tog('staffOverride','Staff override','Reception and Admin can act past the cutoff'), F.tog('overrideReason','Reason required for override','Logged against the appointment')))
    +card('Reasons','Lists come from Reference Masters; edit them there',
      grid(F.multi('cancelReasons','Cancellation reasons','','Select reasons'), F.multi('reschedReasons','Reschedule reasons','','Select reasons')))
    +card('Provider-initiated change & recovery','No fees or penalties: billing is out of scope',
      grid(F.sel('providerChange','Provider-initiated change rule'), F.tog('bulkRecovery','Bulk recovery for doctor / resource disruption','Reschedule every appointment on a blocked day in one go'), F.multi('notifTriggers','Notification triggers','Messages go out through Notifications & Reminders','Select triggers')));
}
function tabChannel(){
  const s=S();
  const matrix='<div class="tblwrap"><table class="tbl chan"><thead><tr><th>Service</th>'+CHANNELS.map(([k,l])=>'<th>'+l.split(' / ')[0].replace(' Booking Form','')+'</th>').join('')+'</tr></thead><tbody>'
    +SERVICES.map(sv=>'<tr><td><b>'+esc(sv.n)+'</b><span class="sub">'+({consult:'Consultation',treat:'Treatment',proc:'Procedure'}[sv.kind])+'</span></td>'
      +CHANNELS.map(([k])=>{ const on=(s.chanMatrix[sv.n]||[]).includes(k), dis=!s.chanCfg[k].on; return '<td class="cc"><label class="cbx'+(dis?' dis':'')+'"><input type="checkbox" data-cm="'+esc(sv.n)+'" data-ch="'+k+'"'+(on?' checked':'')+(dis?' disabled':'')+'><i></i></label></td>'; }).join('')+'</tr>').join('')
    +'</tbody></table></div><span class="hint">All channels read the same availability. Ticking a box only decides whether that channel can offer the service.</span>';
  const cards='<div class="chgrid">'+CHANNELS.map(([k,l])=>{ const c=s.chanCfg[k];
    return '<div class="chcard'+(c.on?'':' off')+'"><div class="chhead"><b>'+l+'</b><label class="sw"><input type="checkbox" data-cc="'+k+'" data-f="on"'+(c.on?' checked':'')+'><i></i></label></div>'
      +'<div class="chbody"><div class="fg"><label>Booking window</label><div class="iunit sm"><input type="number" class="inp" min="0" data-cc="'+k+'" data-f="window" value="'+c.window+'"><span>days</span></div></div>'
      +'<div class="fg togrow"><label>Same-day allowed</label><label class="sw"><input type="checkbox" data-cc="'+k+'" data-f="sameDay"'+(c.sameDay?' checked':'')+'><i></i></label></div>'
      +'<div class="fg"><label>Patient verification</label><div class="mseg sm" data-cc="'+k+'" data-f="verify">'+[['none','None'],['otp','Mobile OTP'],['callback','Call-back']].map(([v,t])=>'<button type="button" data-v="'+v+'"'+(c.verify===v?' class="on"':'')+'>'+t+'</button>').join('')+'</div></div>'
      +'<div class="fg togrow"><label>Staff-only channel</label><label class="sw"><input type="checkbox" data-cc="'+k+'" data-f="staffOnly"'+(c.staffOnly?' checked':'')+'><i></i></label></div></div></div>'; }).join('')+'</div>';
  return card('Channel matrix','Which service each approved channel may book', matrix)+card('Per-channel settings','', cards);
}
function tabWalk(){
  return card('Walk-in','',
      grid(F.tog('walkinAllowed','Walk-in allowed'), F.dur('walkinCapacity','Walk-in capacity','per day'), F.tog('walkinOpenGap','Can use open gap','Fill any unbooked slot'), F.tog('walkinReserved','Can use reserved capacity','Consume the urgent same-day slots'), F.tog('walkinOverride','Staff override required','Reception confirms before the walk-in joins the queue')))
    +card('Waitlist','The patient is never rebooked automatically; reception confirms the offer',
      grid(F.tog('waitlist','Waitlist enabled'), F.tog('waitPrefDate','Capture preferred date'), F.tog('waitPrefTime','Capture preferred time'), F.dur('waitExpiry','Offer expiry','hr','Unanswered offers move to the next patient'), F.tog('waitEarlier','Earlier-slot suggestion','Offer a cancelled slot to the first matching patient')))
    +card('Recurring care','Treatment series from Treatments & Procedures and package entitlements',
      grid(F.tog('recurring','Recurring booking allowed'), F.tog('treatmentSeries','Treatment series booking','Book a whole program in one go'), F.seg('multiSession','Multi-session generation',SEG_OPTS.multiSession), F.seg('seriesChange','Change behaviour',SEG_OPTS.seriesChange,'What a reschedule or cancel applies to')));
}
function tabQueue(){
  const s=S();
  const token='<div class="fg"><label>Token format</label><div class="tokenrow"><input type="text" class="inp" data-k="tokenPrefix" data-t="text" value="'+esc(s.tokenPrefix)+'" maxlength="4" style="max-width:90px;text-transform:uppercase">'+fsel('f_tokenReset')+'<span class="tokenprev" id="tokenPrev">'+esc(s.tokenPrefix)+'-001</span></div><span class="hint">Reception queue always uses RC-001 style tokens</span></div>';
  return card('Arrival & check-in','',
      grid(F.dur('arrivalWindow','Expected arrival window','min before'), F.dur('earlyThreshold','Early arrival threshold','min','Earlier than this waits outside the queue'), F.dur('lateThreshold','Late arrival threshold','min'), F.sel('checkinRule','Check-in rule'), F.sel('waitingRule','Waiting transition rule'),
           '<div class="fg"><label>Doctor delay behaviour</label>'+fsel('f_doctorDelay')+'<div class="iunit sm" style="margin-top:8px;max-width:150px"><input type="number" class="inp" min="5" step="5" data-k="delayThreshold" data-t="num" value="'+s.delayThreshold+'"><span>min late</span></div></div>'))
    +card('No-show','',
      grid(F.dur('noShowGrace','No-show grace period','min after'), F.multi('noShowReasons','No-show reason master','From Reference Masters','Select reasons'),
           '<div class="fg"><label>Repeat no-show policy</label><div class="repeatrow"><div class="iunit sm"><input type="number" class="inp" min="1" data-k="repeatCount" data-t="num" value="'+s.repeatCount+'"><span>no-shows</span></div><span class="mutetxt">in</span><div class="iunit sm"><input type="number" class="inp" min="7" step="1" data-k="repeatDays" data-t="num" value="'+s.repeatDays+'"><span>days</span></div></div></div>', F.sel('repeatAction','Then')))
    +card('Queue & token','No kiosk or emergency-department workflow',
      grid(F.seg('queueType','Queue type',SEG_OPTS.queueType), token, F.multi('priorityCats','Queue priority categories','From the Priority Categories master; these move up the queue','Select categories')));
}
const TAB_FN={slot:tabSlot,book:tabBook,cancel:tabCancel,channel:tabChannel,walk:tabWalk,queue:tabQueue};
const TAB_SUB={slot:'Slot duration, capacity, buffers and reserved same-day capacity',book:'Booking windows, provider and branch selection, restrictions and confirmation',cancel:'Cutoffs, reasons, staff override and provider-initiated changes',channel:'Which services each approved channel can book, and how',walk:'Walk-in capacity, waitlist behaviour and recurring treatment series',queue:'Arrival thresholds, check-in, no-show policy, queue type and tokens'};

/* ---------- render + bind ---------- */
const liveDD={}; const liveMC={};
function renderTab(){
  const root=$('#tabContent'); root.innerHTML=TAB_FN[curTab](); $('#hSub').textContent=TAB_SUB[curTab];
  const s=S();
  Object.keys(SELECT_OPTS).forEach(k=>{ if($('#f_'+k+'Wrap')) { liveDD[k]=initFsel('f_'+k+'Wrap','f_'+k+'Btn','f_'+k+'Panel','f_'+k,SELECT_OPTS[k],v=>{ setVal(k,v); if(k==='slotTemplate') applyTemplate(v); if(k==='tokenReset') renderTokenPrev(); }); liveDD[k].set(s[k]); } });
  Object.keys(MULTI_VOCAB).forEach(k=>{ if($('#f_'+k+'Wrap')) { liveMC[k]=initMchk('f_'+k+'Wrap','f_'+k+'Btn','f_'+k+'Panel','f_'+k+'Chips',MULTI_VOCAB[k],'Select',Object.keys(MULTI_VOCAB[k]).length>5,arr=>setVal(k,arr)); liveMC[k].set(s[k]); } });
  if(curTab==='slot'){
    liveDD.ovDoc=initFsel('ovDocWrap','ovDocBtn','ovDocPanel','ovDoc',DOCTORS.map(d=>[d,d]));
    liveDD.ovSvc=initFsel('ovSvcWrap','ovSvcBtn','ovSvcPanel','ovSvc',SERVICES.map(x=>[x.n,x.n]));
  }
}
function applyTemplate(v){ const map={std15:[15,15],std20:[20,20],treat30:[30,30],proc60:[60,60]}; if(!map[v]) return; setVal('slotDuration',map[v][0]); setVal('defaultApptDuration',map[v][1]); $$('[data-k="slotDuration"],[data-k="defaultApptDuration"]').forEach(i=>i.value=S()[i.dataset.k]); }
function renderTokenPrev(){ const p=$('#tokenPrev'); if(p) p.textContent=(S().tokenPrefix||'DR').toUpperCase()+'-001'; }
const root=$('#tabContent');
root.addEventListener('input',e=>{ const el=e.target;
  if(el.dataset.k){ const t=el.dataset.t; if(t==='num') setVal(el.dataset.k, +el.value||0); else if(t==='text') setVal(el.dataset.k, el.value.trim()); if(el.dataset.k==='tokenPrefix') renderTokenPrev(); return; }
  if(el.dataset.mx!==undefined){ const m=clone(S().svcMatrix); m[+el.dataset.mx][el.dataset.f]=+el.value||0; setVal('svcMatrix',m); return; }
  if(el.dataset.cc && el.type==='number'){ const c=clone(S().chanCfg); c[el.dataset.cc][el.dataset.f]=+el.value||0; setVal('chanCfg',c); }
});
root.addEventListener('change',e=>{ const el=e.target;
  if(el.dataset.k && el.dataset.t==='bool'){ setVal(el.dataset.k, el.checked); if(el.dataset.k==='overbooking') $('#obLimitWrap').style.display=el.checked?'':'none'; return; }
  if(el.dataset.cm){ const m=clone(S().chanMatrix); const list=m[el.dataset.cm]||[]; m[el.dataset.cm]=el.checked?[...new Set([...list,el.dataset.ch])]:list.filter(x=>x!==el.dataset.ch); setVal('chanMatrix',m); return; }
  if(el.dataset.cc && el.type==='checkbox'){ const c=clone(S().chanCfg); c[el.dataset.cc][el.dataset.f]=el.checked; setVal('chanCfg',c); if(el.dataset.f==='on') renderTab(); }
});
root.addEventListener('click',e=>{
  const sb=e.target.closest('.mseg button'); if(sb){ const seg=sb.closest('.mseg'); $$('button',seg).forEach(x=>x.classList.toggle('on',x===sb));
    if(seg.dataset.k) setVal(seg.dataset.k, sb.dataset.v); else if(seg.dataset.cc){ const c=clone(S().chanCfg); c[seg.dataset.cc][seg.dataset.f]=sb.dataset.v; setVal('chanCfg',c); } return; }
  const add=e.target.closest('[data-addov]'); if(add){ $('#ovForm').style.display=''; liveDD.ovSvc.set(SERVICES[+add.dataset.addov].n); $('#ovForm').scrollIntoView({block:'nearest'}); return; }
  const rm=e.target.closest('[data-rmov]'); if(rm){ const [doc,svc]=rm.dataset.rmov.split('|'); setVal('docOverrides', S().docOverrides.filter(o=>!(o.doc===doc&&o.svc===svc))); renderTab(); return; }
  if(e.target.id==='ovCancel'){ $('#ovForm').style.display='none'; return; }
  if(e.target.id==='ovSave'){ const doc=$('#ovDoc').value, svc=$('#ovSvc').value, dur=+$('#ovDur').value||0; if(dur<5){ toast('Duration must be at least 5 minutes'); return; }
    const list=S().docOverrides.filter(o=>!(o.doc===doc&&o.svc===svc)); list.push({doc,svc,dur}); setVal('docOverrides',list); renderTab(); toast(doc+' · '+svc+' now '+dur+' min'); }
});
$('#tabSeg').addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; $$('#tabSeg button').forEach(x=>x.classList.toggle('on',x===b)); curTab=b.dataset.v; renderTab(); });

/* ---------- validation + live preview ---------- */
const mins=t=>{ const [h,m]=t.split(':').map(Number); return h*60+m; };
const lbl=m=>{ const h=Math.floor(m/60), mm=m%60, ap=h<12?'AM':'PM'; return ((h%12)||12)+':'+String(mm).padStart(2,'0')+' '+ap; };
function validate(){
  const s=S(), w=[];
  if(s.defaultApptDuration>s.slotDuration) w.push({lvl:'bad',t:'Default appointment ('+s.defaultApptDuration+' min) is longer than the slot ('+s.slotDuration+' min)'});
  if(s.overbooking&&s.overbookLimit<1) w.push({lvl:'bad',t:'Overbooking is on without a limit'});
  if(s.capacityPerSlot>1&&!s.parallel) w.push({lvl:'warn',t:'Capacity per slot is '+s.capacityPerSlot+' but parallel appointments are off'});
  if(s.minNotice>s.advanceWindow*24) w.push({lvl:'bad',t:'Minimum notice is longer than the advance booking window'});
  if(s.walkinReserved&&s.reservedValue===0) w.push({lvl:'warn',t:'Walk-ins may use reserved capacity but none is reserved'});
  const on=CHANNELS.filter(([k])=>s.chanCfg[k].on); if(!on.length) w.push({lvl:'bad',t:'No booking channel is enabled'});
  if(!s.sameDay&&on.some(([k])=>s.chanCfg[k].sameDay)) w.push({lvl:'warn',t:'Same-day booking is off but a channel still allows it'});
  if(s.noShowGrace<s.lateThreshold) w.push({lvl:'warn',t:'No-show grace ('+s.noShowGrace+' min) is shorter than the late-arrival threshold ('+s.lateThreshold+' min)'});
  SERVICES.forEach(sv=>{ if(sv.kind!=='proc' && !(s.chanMatrix[sv.n]||[]).length) w.push({lvl:'warn',t:esc(sv.n)+' is bookable on no channel'}); });
  if(s.docOverrides.some(o=>o.dur>s.slotDuration*2)) w.push({lvl:'warn',t:'A doctor override is more than twice the slot duration'});
  return w;
}
function renderPreview(){
  const s=S(); const [open,close]=BRANCH_HOURS[curBranch], lunch=BRANCH_LUNCH[curBranch];
  const step=s.slotDuration+s.bufferBefore+s.bufferAfter; const cells=[]; let t=mins(open), i=0;
  const totalSlots=Math.floor((mins(close)-mins(open)-(mins(lunch[1])-mins(lunch[0])))/step);
  const reserved = s.reservedMode==='pct' ? Math.round(totalSlots*s.reservedValue/100) : s.reservedValue;
  let resLeft=reserved, booked=0;
  while(t+s.slotDuration<=mins(close)){
    if(t>=mins(lunch[0])&&t<mins(lunch[1])){ if(!cells.some(c=>c.s==='unavail')) cells.push({t:lbl(mins(lunch[0])),s:'unavail',l:'Lunch block · until '+lbl(mins(lunch[1]))}); t=mins(lunch[1]); continue; }
    if(s.bufferBefore){ cells.push({t:lbl(t),s:'buffer',l:'Buffer '+s.bufferBefore+' min'}); t+=s.bufferBefore; }
    let st='avail', l='Open'; i++;
    if(t>=12*60 && resLeft>0){ st='reserved'; l='Reserved · urgent'; resLeft--; }
    else if(i%3===0){ st='booked'; l=['R. Reddy','S. Rajagopal','M. Sheikh','P. Devi'][booked%4]; booked++; }
    cells.push({t:lbl(t),s:st,l:l+(s.capacityPerSlot>1?' · cap '+s.capacityPerSlot:'')}); t+=s.slotDuration;
    if(s.bufferAfter){ cells.push({t:lbl(t),s:'buffer',l:'Buffer '+s.bufferAfter+' min'}); t+=s.bufferAfter; }
  }
  const slots=cells.filter(c=>c.s==='avail'||c.s==='booked'||c.s==='reserved').length;
  const bookable=(slots-reserved)*s.capacityPerSlot + (s.overbooking?s.overbookLimit:0);
  const bufMin=cells.filter(c=>c.s==='buffer').reduce((a,c)=>a+(+c.l.match(/\d+/)[0]),0);
  const openMin=mins(close)-mins(open)-(mins(lunch[1])-mins(lunch[0]));
  const chans=CHANNELS.filter(([k])=>s.chanCfg[k].on).map(([,l])=>l.split(' / ')[0].replace(' Booking Form',''));
  const w=validate();
  $('#lpSub').textContent='Consultation Room 1 · '+curBranch+' · '+lbl(mins(open))+' – '+lbl(mins(close));
  $('#lpBody').innerHTML=
    '<div class="lp-stats"><div><b>'+bookable+'</b><span>bookable / day</span></div><div><b>'+reserved+'</b><span>reserved urgent</span></div><div><b>'+Math.round(bufMin/openMin*100)+'%</b><span>buffer</span></div><div><b>'+(s.parallel?s.capacityPerSlot+'×':'1×')+'</b><span>concurrent</span></div></div>'
    +'<div class="plegend"><span><i class="a"></i>Open</span><span><i class="b"></i>Booked</span><span><i class="f"></i>Buffer</span><span><i class="r"></i>Reserved</span><span><i class="u"></i>Unavailable</span></div>'
    +'<div class="previewgrid">'+cells.map(c=>'<div class="pcell '+c.s+'"><b>'+c.t+'</b><span>'+esc(c.l)+'</span></div>').join('')+'</div>'
    +'<div class="lp-sec"><b>Enabled channels</b><div class="chips">'+(chans.length?chans.map(c=>'<span class="chip soft">'+esc(c)+'</span>').join(''):'<span class="chip bad">None</span>')+'</div></div>'
    +'<div class="lp-sec"><b>Validation'+(w.length?' · '+w.length:'')+'</b>'+(w.length?w.map(x=>'<div class="lp-warn '+x.lvl+'">'+x.t+'</div>').join(''):'<div class="lp-ok">No warnings. Ready to publish.</div>')+'</div>';
}

/* ---------- header branch context ---------- */
function makeDropdown(prefix,onPick){
  const rt=$('#'+prefix+'Drop'),btn=$('#'+prefix+'Btn'),lbl=$('#'+prefix+'BtnLbl');
  const searchEl=$('#'+prefix+'Search'),emptyEl=$('#'+prefix+'Empty'),listSel='#'+prefix+'List';
  let value='',rows=[];
  const close=()=>{rt.classList.remove('open');};
  const draw=list=>{
    $(listSel).innerHTML=list.map(r=>'<button type="button" class="cdrow'+(r.value===value?' on':'')+'" data-v="'+r.value+'"><span class="cdav">'+(r.av||'')+'</span><div class="cdtx"><b>'+r.title+'</b>'+(r.sub?'<span>'+r.sub+'</span>':'')+'</div><svg class="chk" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>').join('');
    $$(listSel+' .cdrow').forEach(row=>row.addEventListener('click',()=>{ const r=rows.find(x=>x.value===row.dataset.v); api.select(row.dataset.v,r?r.title:row.dataset.v); close(); }));
    emptyEl.style.display=list.length?'none':'block'; $(listSel).style.display=list.length?'block':'none';
  };
  const filter=q=>{q=q.trim().toLowerCase();draw(!q?rows:rows.filter(r=>(r.title+' '+(r.sub||'')).toLowerCase().includes(q)));};
  btn.addEventListener('click',e=>{ e.stopPropagation(); const open=rt.classList.toggle('open'); if(open){searchEl.value='';filter('');searchEl.focus();} });
  searchEl.addEventListener('input',e=>filter(e.target.value)); searchEl.addEventListener('click',e=>e.stopPropagation());
  document.addEventListener('click',e=>{if(!rt.contains(e.target))close();}); document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  const api={ setOptions(list){rows=list;filter(searchEl.value);}, select(v,label){ value=v;lbl.textContent=label||v;btn.classList.toggle('has-value',!!v); $$(listSel+' .cdrow').forEach(r=>r.classList.toggle('on',r.dataset.v===v)); if(onPick)onPick(v); }, get value(){return value;} };
  return api;
}
const ctxBrDD = makeDropdown('ctxBr', v => { curBranch=v; renderTab(); renderInherit(); renderPreview(); toast('Switched to '+v); });
ctxBrDD.setOptions(BRANCHES.map(b => ({ value:b, title:b, av:b.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() })));
ctxBrDD.select('Main Campus','Main Campus');
/* boot */
saveState='published'; renderSaveState(); renderTab(); renderInherit(); renderPreview();
