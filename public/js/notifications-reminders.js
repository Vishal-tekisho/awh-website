document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $ = s => document.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ---------- channel meta ---------- */
const CH = {
  wa   :{n:'WhatsApp',  b:'var(--success-soft)',      c:'var(--success)'},
  sms  :{n:'SMS',       b:'var(--info-soft)',         c:'var(--info)'},
  email:{n:'Email',     b:'var(--st-inconsult-bg)',   c:'var(--st-inconsult)'},
  push :{n:'Push',      b:'var(--warning-soft)',      c:'var(--warning)'},
  ivr  :{n:'IVR / Voice',b:'var(--surface-3)',        c:'var(--ink-muted)'}
};
const VARS = {patient_name:'Meera Suresh', doctor_name:'Dr. Meera Nair',
  appointment_date:'24 July 2026', appointment_time:'11:30 AM', branch:'Banjara Hills', token_no:'A-42'};
const fill = s => s.replace(/\{\{(\w+)\}\}/g, (m,k) => VARS[k] || m);

/* ---------- templates ---------- */
const TPL = [
 {id:'confirm', name:'Appointment Confirmation', chans:['wa','sms','email'], active:true, edited:'18 July 2026', uses:'4,218',
  msg:{
    wa:{body:"Hello {{patient_name}},\nYour appointment at Advanced Wound Healing ({{branch}}) is confirmed.\n\nDoctor: {{doctor_name}}\nDate: {{appointment_date}}\nTime: {{appointment_time}}\nToken: {{token_no}}\n\nPlease reach 10 minutes early and carry your previous dressing chart.", foot:'Advanced Wound Healing · Reply STOP to opt out'},
    sms:{body:"AWH: Appointment confirmed with {{doctor_name}} on {{appointment_date}} at {{appointment_time}}, {{branch}}. Token {{token_no}}. Call 040-4567 8899 to change.", foot:'AWHCLN'},
    email:{subj:"Appointment confirmed · {{doctor_name}}, {{appointment_date}}",
      body:"Dear {{patient_name}},\n\nYour appointment at Advanced Wound Healing, {{branch}} is confirmed.\n\nDoctor  : {{doctor_name}}\nDate    : {{appointment_date}}\nTime    : {{appointment_time}}\nToken   : {{token_no}}\n\nConsultation fee ₹800 is payable at reception. Please carry your previous dressing chart and any lab reports from the last 30 days.", foot:'Advanced Wound Healing · Banjara Hills, Hyderabad · 040-4567 8899'}
  }},
 {id:'remind', name:'Appointment Reminder', chans:['wa','sms','push','ivr'], active:true, edited:'22 July 2026', uses:'6,940',
  msg:{
    wa:{body:"Hi {{patient_name}}, a reminder of your visit with {{doctor_name}} tomorrow, {{appointment_date}} at {{appointment_time}} at our {{branch}} branch. Token {{token_no}}.\n\nReply 1 to confirm or 2 to reschedule.", foot:'Advanced Wound Healing · Reply STOP to opt out'},
    sms:{body:"Reminder: {{doctor_name}} on {{appointment_date}} at {{appointment_time}}, AWH {{branch}}. Token {{token_no}}. Reply 1 confirm, 2 reschedule.", foot:'AWHCLN'},
    push:{body:"Visit tomorrow at {{appointment_time}} · {{doctor_name}}, {{branch}}. Tap to confirm your token {{token_no}}.", foot:'AWH Patient App'},
    ivr:{body:"Namaste {{patient_name}}. This is a call from Advanced Wound Healing. Your appointment with {{doctor_name}} is on {{appointment_date}} at {{appointment_time}}. Press 1 to confirm, press 2 to reschedule.", foot:'Voice script · Telugu, Hindi and English'}
  }},
 {id:'cancel', name:'Cancellation', chans:['wa','sms'], active:true, edited:'09 July 2026', uses:'612',
  msg:{
    wa:{body:"Hello {{patient_name}}, your appointment with {{doctor_name}} on {{appointment_date}} at {{appointment_time}} has been cancelled.\n\nAny advance paid is refunded to the original payment method within 5 working days.", foot:'Advanced Wound Healing · 040-4567 8899'},
    sms:{body:"AWH: Your appointment with {{doctor_name}} on {{appointment_date}} is cancelled. Refund of ₹500 in 5 working days. Call 040-4567 8899.", foot:'AWHCLN'}
  }},
 {id:'resched', name:'Reschedule', chans:['wa','sms','email'], active:true, edited:'02 August 2026', uses:'438',
  msg:{
    wa:{body:"Hello {{patient_name}}, your appointment has been moved to {{appointment_date}} at {{appointment_time}} with {{doctor_name}} at {{branch}}. Your new token is {{token_no}}.\n\nSorry for the inconvenience.", foot:'Advanced Wound Healing · Reply STOP to opt out'},
    sms:{body:"AWH: Appointment moved to {{appointment_date}} {{appointment_time}} with {{doctor_name}}, {{branch}}. New token {{token_no}}.", foot:'AWHCLN'},
    email:{subj:"Your appointment has been rescheduled · {{appointment_date}}",
      body:"Dear {{patient_name}},\n\nYour appointment with {{doctor_name}} has been rescheduled to {{appointment_date}} at {{appointment_time}} at our {{branch}} branch. Your new token number is {{token_no}}.\n\nIf this slot does not suit you, reply to this mail or call 040-4567 8899 and our front desk will find another one.", foot:'Advanced Wound Healing · Banjara Hills, Hyderabad'}
  }},
 {id:'followup', name:'Follow-up Reminder', chans:['wa','email'], active:true, edited:'28 July 2026', uses:'1,864',
  msg:{
    wa:{body:"Hello {{patient_name}}, it has been two weeks since your dressing review with {{doctor_name}}.\n\nWound healing works best with regular follow-ups. Reply BOOK or call 040-4567 8899 to fix a slot at {{branch}}.", foot:'Advanced Wound Healing · Reply STOP to opt out'},
    email:{subj:"Time for your follow-up review, {{patient_name}}",
      body:"Dear {{patient_name}},\n\nIt has been two weeks since your last dressing review with {{doctor_name}} at our {{branch}} branch.\n\nRegular reviews cut healing time for chronic and diabetic wounds substantially. Book online or call 040-4567 8899 · review consultations are charged at ₹500.", foot:'Advanced Wound Healing · Unsubscribe from care reminders'}
  }},
 {id:'presc', name:'Prescription Ready', chans:['wa','sms'], active:true, edited:'11 July 2026', uses:'1,205',
  msg:{
    wa:{body:"Hello {{patient_name}}, your prescription from {{doctor_name}} dated {{appointment_date}} is ready.\n\nCollect it at the {{branch}} pharmacy counter or download it from the AWH patient app.", foot:'Advanced Wound Healing · Reply STOP to opt out'},
    sms:{body:"AWH: Prescription from {{doctor_name}} is ready at {{branch}} pharmacy. Valid 30 days.", foot:'AWHCLN'}
  }},
 {id:'lab', name:'Lab Report Notification', chans:['wa','email','push'], active:true, edited:'05 August 2026', uses:'890',
  msg:{
    wa:{body:"Hello {{patient_name}}, your lab report from {{appointment_date}} is ready. View it in the AWH patient app or collect a printout at {{branch}} reception.", foot:'Advanced Wound Healing · Reply STOP to opt out'},
    email:{subj:"Lab report ready · {{patient_name}}, {{appointment_date}}",
      body:"Dear {{patient_name}},\n\nYour wound swab culture and sensitivity report from {{appointment_date}} is now available.\n\nThe attached PDF is password protected · the password is your date of birth in DDMMYYYY format. {{doctor_name}} will review the findings at your next visit at {{branch}}.", foot:'Advanced Wound Healing · Reports are retained for 3 years'},
    push:{body:"Lab report from {{appointment_date}} is ready. Tap to open it in the AWH app.", foot:'AWH Patient App'}
  }}
];

const state = {filter:'all', sel:'confirm', pvch:'wa', edit:null};
const tplById = id => TPL.find(t => t.id === id);
const msgFor = (t,ch) => t.msg[ch] || t.msg.sms || t.msg.wa;
const activeChip = a => a ? 'on' : 'off';

/* ---------- templates list ---------- */
function renderList(){
  const list = TPL.filter(t => state.filter === 'all' || t.chans.includes(state.filter));
  $('#tplList').innerHTML = list.length ? list.map(t => `
    <div class="trow${t.id===state.sel?' sel':''}" data-id="${t.id}">
      <div class="r1">
        <b>${esc(t.name)}</b>
        <span class="stchip ${activeChip(t.active)}"><i></i>${t.active ? 'Active' : 'Inactive'}</span>
        <span class="sp"></span>
        <button class="mini" data-act="edit">Edit</button>
        <button class="mini" data-act="prev">Preview</button>
      </div>
      <div class="r2">
        ${t.chans.map(c=>`<span class="cch" style="--cb:${CH[c].b};--cc:${CH[c].c}">${CH[c].n}</span>`).join('')}
        <span class="sp"></span>
        <span class="meta">Edited <em>${t.edited}</em></span>
        <span class="meta">·</span>
        <span class="meta"><em>${t.uses}</em> sent this month</span>
      </div>
    </div>`).join('') : `
    <div class="empty">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v12H5.5L4 18z"/></svg>
      <b>No templates on this channel</b><span>Templates for this channel are provisioned by Tekisho.</span>
    </div>`;
  const inactive = TPL.filter(t=>!t.active).length;
  $('#tplSub').textContent = `${list.length} template${list.length===1?'':'s'} · ${inactive ? inactive+' inactive' : 'all active'} · admin-configurable`;
  document.querySelectorAll('#chanSel option').forEach(o => {
    const f = o.value;
    const n = f === 'all' ? TPL.length : TPL.filter(t => t.chans.includes(f)).length;
    o.textContent = (f === 'all' ? 'All channels' : CH[f].n) + ' (' + n + ')';
  });
}

/* ---------- preview ---------- */
function renderPreview(){
  const t = tplById(state.sel);
  if(!t.chans.includes(state.pvch)) state.pvch = t.chans[0];
  const ch = state.pvch, m = msgFor(t,ch);
  $('#pvName').textContent = t.name;
  $('#pvChans').innerHTML = t.chans.map(c =>
    `<button class="cch pick${c===ch?' on':''}" data-ch="${c}" style="--cb:${CH[c].b};--cc:${CH[c].c}">${CH[c].n}</button>`).join('');

  const body = fill(m.body), foot = fill(m.foot || '');
  let html;
  if(ch === 'wa'){
    html = `<div class="wa">
      <div class="wa-hd"><span class="av">AW</span><div><b>Advanced Wound Healing</b><span>Business account · online</span></div></div>
      <div class="wa-bd"><div class="bub">${esc(body)}<span class="ft">${esc(foot)}</span><span class="tm">11:32 AM <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--info);vertical-align:-2px"><polyline points="18 7 9.5 17 6 13.5"/><polyline points="22 7 13.5 17 12.6 15.9"/></svg></span></div></div>
    </div>
    <div class="cmeta">WhatsApp Business API · ${t.active ? 'Active' : 'Inactive'} · UTILITY category</div>`;
  } else if(ch === 'email'){
    html = `<div class="mail">
      <div class="mail-hd">
        <div class="fr"><span class="av">AW</span><div><b style="color:var(--ink);font-size:11.5px;display:block">Advanced Wound Healing</b>care@awhclinic.in · to ${esc(VARS.patient_name.split(' ')[0].toLowerCase())}@gmail.com</div></div>
        <h4>${esc(fill(m.subj || t.name))}</h4>
      </div>
      <div class="mail-bd">${esc(body)}</div>
      <div class="mail-ft">${esc(foot)}</div>
    </div>
    <div class="cmeta">Transactional email · SendGrid · 45,000 of 60,000 quota left</div>`;
  } else {
    const n = body.length, seg = Math.ceil(n/160) || 1;
    const meta = ch === 'sms' ? `${n} / 160 · ${seg} SMS`
      : ch === 'push' ? `${n} characters · truncated at 120 on Android`
      : `${n} characters · approx ${Math.max(1,Math.round(n/14))} s read time`;
    html = `<div class="wa">
      <div class="wa-hd" style="background:var(--surface-3);color:var(--ink)"><span class="av" style="background:var(--surface);color:var(--ink-2)">${ch==='ivr'?'IV':ch==='push'?'PU':'SM'}</span><div><b>${CH[ch].n} · AWHCLN</b><span>${ch==='ivr'?'Outbound voice call':'Sender ID registered on DLT'}</span></div></div>
      <div class="wa-bd"><div class="bub grey">${esc(body)}<span class="ft">${esc(foot)}</span><span class="tm">11:32 AM</span></div></div>
    </div>
    <div class="cmeta">${meta}</div>`;
  }
  $('#pvBody').innerHTML = html;
}

/* ---------- tabs ---------- */
$('#tabSeg').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  [...b.parentElement.children].forEach(x => x.classList.toggle('on', x===b));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === 'v-'+b.dataset.v));
});

/* ---------- channel filter ---------- */
$('#chanSel').addEventListener('change', e => {
  state.filter = e.target.value;
  const first = TPL.find(t => state.filter==='all' || t.chans.includes(state.filter));
  if(first && !(state.filter!=='all' && tplById(state.sel).chans.includes(state.filter))) state.sel = first.id;
  if(state.filter !== 'all') state.pvch = state.filter;
  renderList(); renderPreview();
});

/* ---------- list + preview clicks ---------- */
$('#tplList').addEventListener('click', e => {
  const row = e.target.closest('.trow'); if(!row) return;
  state.sel = row.dataset.id;
  const act = e.target.closest('.mini') && e.target.closest('.mini').dataset.act;
  renderList(); renderPreview();
  if(act === 'edit') openDrawer(state.sel);
  if(act === 'prev') toast('Preview updated: ' + tplById(state.sel).name);
});
$('#pvChans').addEventListener('click', e => {
  const b = e.target.closest('.pick'); if(!b) return;
  state.pvch = b.dataset.ch; renderPreview();
});

/* ---------- drawer · templates are admin-configurable (BRD Theme 07: "Templates, reminder
   timing, fallback and enabled channels are configurable"); Tekisho only owns deployment /
   channel-provider credentials & infra, not template wording (BRD personas section) ---------- */
let dSelectedChans = [];   // channels checked in the multi-select, this drawer session
let draftMsg = {};         // { chan: {subj,body,foot} } · per-channel drafts while editing
let dEditCh = '';          // which channel's message the fields currently show

function openDrawer(id){
  state.edit = id; // null = creating a new template
  const t = id ? tplById(id) : null;
  dSelectedChans = t ? [...t.chans] : [state.pvch || 'wa'];
  draftMsg = t ? JSON.parse(JSON.stringify(t.msg)) : {};
  dEditCh = dSelectedChans[0] || '';
  $('#dTitle').textContent = t ? 'Edit template' : 'New template';
  $('#dSub').textContent = t ? `${t.name} · ${t.chans.length} channel${t.chans.length===1?'':'s'}` : 'Pick channels and write the message for each';
  $('#dName').value = t ? t.name : '';
  $('#dActive').checked = t ? !!t.active : true;
  $('#dSave').textContent = t ? 'Save changes' : 'Create template';
  document.querySelectorAll('#dChanMenu input').forEach(cb => cb.checked = dSelectedChans.includes(cb.value));
  renderChanBtn(); renderChanTabs(); loadChanFields(dEditCh);
  $('#scrim').classList.add('show'); $('#drawer').classList.add('show');
  $('#dName').focus();
}
function closeDrawer(){ $('#scrim').classList.remove('show'); $('#drawer').classList.remove('show'); $('#dChanMenu').classList.remove('show'); state.edit=null; }

function renderChanBtn(){
  $('#dChanBtn').textContent = dSelectedChans.length ? dSelectedChans.map(c=>CH[c].n).join(', ') : 'Select channels';
}
function renderChanTabs(){
  $('#dChanTabs').innerHTML = dSelectedChans.length ? dSelectedChans.map(c =>
    `<button type="button" class="cch pick${c===dEditCh?' on':''}" data-ch="${c}" style="--cb:${CH[c].b};--cc:${CH[c].c}">${CH[c].n}</button>`).join('')
    : `<span style="font-size:11.5px;color:var(--ink-muted)">Select at least one channel above</span>`;
}
function saveChanFieldsToDraft(ch){
  if(!ch) return;
  draftMsg[ch] = { subj: $('#dSubj').value, body: $('#dBody').value, foot: $('#dFoot').value };
}
function loadChanFields(ch){
  const m = draftMsg[ch] || {};
  $('#dSubj').value = m.subj || '';
  $('#dBody').value = m.body || '';
  $('#dFoot').value = m.foot || '';
  const isEmail = ch === 'email';
  $('#dSubjWrap').style.display = isEmail ? '' : 'none';
  $('#emailHdrBand').style.display = isEmail ? '' : 'none';
  $('#emailFtrBand').style.display = isEmail ? '' : 'none';
  $('#dFootWrap').style.display = isEmail ? 'none' : '';
  $('#bodyLbl').textContent = 'Message body';
  document.body.classList.toggle('email-mode', isEmail);
  count();
}
function count(){
  const n = $('#dBody').value.length, ch = dEditCh;
  $('#dCount').textContent = ch === 'sms'
    ? `${n} / 160 · ${Math.ceil(n/160)||1} SMS`
    : `${n} characters${ch==='wa' ? ' · 1024 max' : ''}`;
}
$('#dBody').addEventListener('input', count);
$('#varRow').addEventListener('click', e => {
  const b = e.target.closest('.varchip'); if(!b) return;
  const ta = $('#dBody'), v = b.textContent, s = ta.selectionStart, en = ta.selectionEnd;
  ta.value = ta.value.slice(0,s) + v + ta.value.slice(en);
  ta.focus(); ta.selectionStart = ta.selectionEnd = s + v.length;
  count();
});

/* channel multi-select: open/close + check/uncheck */
$('#dChanBtn').addEventListener('click', e => { e.stopPropagation(); $('#dChanMenu').classList.toggle('show'); });
document.addEventListener('click', e => { if(!e.target.closest('#dChanSel')) $('#dChanMenu').classList.remove('show'); });
$('#dChanMenu').addEventListener('change', e => {
  const cb = e.target.closest('input[type=checkbox]'); if(!cb) return;
  const ch = cb.value;
  saveChanFieldsToDraft(dEditCh);
  if(cb.checked){
    if(!dSelectedChans.includes(ch)) dSelectedChans.push(ch);
    dEditCh = ch;
  } else {
    dSelectedChans = dSelectedChans.filter(c => c !== ch);
    if(dEditCh === ch) dEditCh = dSelectedChans[0] || '';
  }
  renderChanBtn(); renderChanTabs(); loadChanFields(dEditCh);
});
/* channel tabs: switch which channel's message the fields show */
$('#dChanTabs').addEventListener('click', e => {
  const b = e.target.closest('.pick'); if(!b) return;
  saveChanFieldsToDraft(dEditCh);
  dEditCh = b.dataset.ch;
  renderChanTabs(); loadChanFields(dEditCh);
});

function todayLong(){
  return new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'long', year:'numeric'});
}
$('#dSave').addEventListener('click', () => {
  const name = $('#dName').value.trim();
  if(!name){ toast('Give the template a name first'); $('#dName').focus(); return; }
  if(!dSelectedChans.length){ toast('Pick at least one channel'); return; }
  saveChanFieldsToDraft(dEditCh);
  for(const ch of dSelectedChans){
    if(!draftMsg[ch] || !draftMsg[ch].body || !draftMsg[ch].body.trim()){
      toast('Add a message body for ' + CH[ch].n + ' before saving');
      dEditCh = ch; renderChanTabs(); loadChanFields(ch);
      return;
    }
  }
  const active = $('#dActive').checked;
  const finalMsg = {};
  dSelectedChans.forEach(ch => {
    const d = draftMsg[ch], entry = { body: d.body.trim() };
    if(ch === 'email') entry.subj = (d.subj || '').trim() || name;
    const foot = (d.foot || '').trim();
    if(foot) entry.foot = foot;
    finalMsg[ch] = entry;
  });

  /* Deactivating a template that's still actively sending is guarded by a dependency review,
     same shape as doctors-staff.js's hasStaffDeps/showStaffImpactModal · t.uses ("sent this
     month") is the one real, locally-tracked usage signal a template carries. Turning a
     template active never needs the guardrail, and neither does a brand-new one. */
  if(state.edit){
    const t = tplById(state.edit);
    const usesNum = +String(t.uses).replace(/,/g,'') || 0;
    if(t.active && !active && usesNum > 0){
      showTplImpactModal(t, usesNum, () => commitTplSave(name, finalMsg, active));
      return;
    }
  }
  commitTplSave(name, finalMsg, active);
});
function commitTplSave(name, finalMsg, active){
  if(state.edit){
    const t = tplById(state.edit);
    t.name = name; t.chans = [...dSelectedChans]; t.msg = finalMsg; t.active = active; t.edited = todayLong();
    state.sel = t.id;
    toast('Template updated: ' + name);
  } else {
    const id = 'tpl-' + Date.now();
    TPL.push({ id, name, chans:[...dSelectedChans], active, edited: todayLong(), uses:'0', msg: finalMsg });
    state.sel = id;
    toast('New template created: ' + name);
  }
  state.pvch = dEditCh;
  closeDrawer();
  renderList(); renderPreview();
}
let impactTplCtx = null;
function showTplImpactModal(t, usesNum, onContinue){
  impactTplCtx = onContinue;
  $('#iTitle').textContent = 'Deactivate ' + t.name + '?';
  $('#iBody').innerHTML = '<p class="dep-intro">Deactivating this template affects:</p><div class="deprow"><span>Messages sent this month</span><b>' + t.uses + '</b></div>';
  $('#iFootHint').innerHTML = '<b>Sent messages keep their history.</b> Any automation still pointing at this template will have nothing to send. Point it at another template first if that is not intended.';
  $('#iScrim').classList.add('show');
}
function closeTplImpactModal(){ $('#iScrim').classList.remove('show'); impactTplCtx = null; }
$('#iCancel').addEventListener('click', closeTplImpactModal);
$('#iContinue').addEventListener('click', () => {
  const cb = impactTplCtx; if(!cb){ closeTplImpactModal(); return; }
  closeTplImpactModal();
  cb();
});
$('#iScrim').addEventListener('click', e => { if(e.target.id === 'iScrim') closeTplImpactModal(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && $('#iScrim').classList.contains('show')) closeTplImpactModal(); });
$('#dCancel').addEventListener('click', closeDrawer);
$('#dClose').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
document.addEventListener('keydown', e => { if(e.key !== 'Escape') return;
  if($('#drawer').classList.contains('show')) closeDrawer();
  if($('#alertMenu').classList.contains('show')) closeAlertMenu(); });
$('#newTplBtn').addEventListener('click', () => openDrawer(null));

/* ---------- automation ---------- */
function syncWf(sw){
  const wf = sw.closest('.wf'), on = sw.checked;
  wf.classList.toggle('off', !on);
  wf.querySelectorAll('.bot input, .bot select').forEach(el => el.disabled = !on);
  const live = document.querySelectorAll('.wfsw:checked').length;
  $('#autoOnCount').textContent = `${live} of 6 active`;
}
document.querySelectorAll('.wfsw').forEach(sw => {
  syncWf(sw);
  sw.addEventListener('change', () => {
    syncWf(sw);
    toast(`${sw.closest('.wf').querySelector('.tx b').textContent} ${sw.checked ? 'activated' : 'paused'}`);
  });
});
/* ---------- quiet-hours bar · live, tied to the From/To time inputs (was static/hardcoded) ---------- */
function pctOfDay(hhmm){
  const [h,m] = (hhmm || '0:0').split(':').map(Number);
  return ((h*60+m)/1440)*100;
}
function updateQuietBar(){
  const from = $('#qhFrom').value || '21:30', to = $('#qhTo').value || '08:00';
  const fPct = pctOfDay(from), tPct = pctOfDay(to);
  const segs = $('#qhBar').querySelectorAll('i');
  if(fPct > tPct){                                   // overnight wrap, e.g. 21:30 → 08:00
    segs[0].style.left = '0%';       segs[0].style.width = tPct + '%';
    segs[1].style.left = fPct + '%'; segs[1].style.width = (100 - fPct) + '%';
  } else if(fPct < tPct){                             // same-day window
    segs[0].style.left = fPct + '%'; segs[0].style.width = (tPct - fPct) + '%';
    segs[1].style.width = '0%';
  } else {                                             // from === to → no window
    segs[0].style.width = '0%'; segs[1].style.width = '0%';
  }
  $('#qhBar').title = `Quiet window · ${from} to ${to} · held messages release at ${to}`;
  $('#qhNoteTxt').textContent = `Non-urgent messages queued during quiet hours are held and released at ${to} IST. Cancellations, refunds and OTPs are always delivered immediately.`;
}
document.querySelectorAll('#qhFrom, #qhTo').forEach(el => el.addEventListener('input', updateQuietBar));
updateQuietBar();

$('#qhSw').addEventListener('change', e => {
  document.querySelectorAll('.qhf').forEach(el => el.disabled = !e.target.checked);
  $('#qhNote').style.opacity = e.target.checked ? 1 : .5;
  toast('Quiet hours ' + (e.target.checked ? `enabled · ${$('#qhFrom').value} to ${$('#qhTo').value} IST` : 'disabled'));
});

/* ---------- delivery log ---------- */
const MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];
const pad2 = n => String(n).padStart(2,'0');
const isoDate = (y,m,d) => y+'-'+pad2(m+1)+'-'+pad2(d);
const parseISO = s => { const [y,m,d]=s.split('-').map(Number); return {y, m:m-1, d}; };
function fmtDrLabel(fromISO, toISO){
  const a=parseISO(fromISO), b=parseISO(toISO), shortM=m=>MONTH_NAMES[m].slice(0,3);
  if(a.y===b.y && a.m===b.m) return a.d+' – '+b.d+' '+shortM(a.m)+' '+a.y;
  if(a.y===b.y) return a.d+' '+shortM(a.m)+' – '+b.d+' '+shortM(b.m)+' '+a.y;
  return a.d+' '+shortM(a.m)+' '+a.y+' – '+b.d+' '+shortM(b.m)+' '+b.y;
}

function filterLog(){
  const from = $('#fFrom').value, to = $('#fTo').value,
        ch = $('#fChan').value, st = $('#fStat').value,
        q = $('#fSearch').value.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll('#logBody tr').forEach(tr => {
    const d = tr.dataset.date;
    const ok = (!from || d >= from) && (!to || d <= to)
      && (!ch || tr.dataset.ch === ch) && (!st || tr.dataset.st === st)
      && (!q || tr.textContent.toLowerCase().includes(q));
    tr.style.display = ok ? '' : 'none';
    if(ok) shown++;
  });
  $('#logEmpty').style.display = shown ? 'none' : '';
  const rangeTxt = (from && to) ? fmtDrLabel(from, to) : 'all dates';
  $('#logCount').textContent = `Showing ${shown} of 9 deliveries · ${rangeTxt}`;
}
$('#fFrom').addEventListener('change', filterLog);
$('#fTo').addEventListener('change', filterLog);
$('#fSearch').addEventListener('input', filterLog);

/* ---------- custom dropdown (Channel / Status) · value can differ from its label ---------- */
function initFsel(wrapId,btnId,panelId,hiddenId,opts){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  const setVal=(v,silent)=>{
    hidden.value=v;
    const found=opts.find(o=>o[0]===v);
    btn.textContent = found ? found[1] : opts[0][1];
    $$('.fselopt',panel).forEach(x=>x.classList.toggle('on', x.dataset.v===v));
    if(!silent){ hidden.dispatchEvent(new Event('change')); filterLog(); }
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
    $$('.f.fsel, .f.drwrap').forEach(x=>x.classList.remove('open'));
    if(!wasOpen) root.classList.add('open');
  });
  return { set:v=>setVal(v,true), get:()=>hidden.value };
}
document.addEventListener('click', ()=>$$('.f.fsel, .f.drwrap').forEach(x=>x.classList.remove('open')));
document.addEventListener('keydown', e=>{ if(e.key==='Escape') $$('.f.fsel, .f.drwrap').forEach(x=>x.classList.remove('open')); });

const chanDD = initFsel('chanWrap','chanBtn','chanPanel','fChan',
  [['','All channels'],['wa','WhatsApp'],['sms','SMS'],['email','Email'],['push','Push']]);
const statDD = initFsel('statWrap','statBtn','statPanel','fStat',
  [['','All statuses'],['Delivered','Delivered'],['Sent','Sent'],['Failed','Failed'],['Queued','Queued']]);

/* ---------- date-range picker · one control, custom calendar popup ---------- */
let drViewY=2026, drViewM=7; // August 2026 · matches this app's demo "today"
let drStart=$('#fFrom').value, drEnd=$('#fTo').value; // committed range
let drPickStart=null, drPickEnd=null; // in-progress selection while the panel is open

function renderDrLabel(){ $('#drLabel').textContent = fmtDrLabel(drStart, drEnd); }

function renderDrGrid(){
  $('#drMonthLabel').textContent = MONTH_NAMES[drViewM]+' '+drViewY;
  const firstWeekday=(new Date(drViewY, drViewM, 1).getDay()+6)%7; // Mon=0
  const daysInMonth=new Date(drViewY, drViewM+1, 0).getDate();
  const daysInPrevMonth=new Date(drViewY, drViewM, 0).getDate();
  const cells=[];
  for(let i=firstWeekday-1;i>=0;i--) cells.push({d:daysInPrevMonth-i, other:true});
  for(let d=1; d<=daysInMonth; d++) cells.push({d, other:false, iso:isoDate(drViewY, drViewM, d)});
  while(cells.length % 7 !== 0) cells.push({d:cells.length, other:true});

  const s=drPickStart, e=drPickEnd;
  $('#drGridBody').innerHTML = cells.map(c=>{
    if(c.other) return '<button type="button" class="drday other" disabled>'+c.d+'</button>';
    let cls='drday';
    if(s && !e && c.iso===s) cls+=' instart inend';
    else {
      if(s && c.iso===s) cls+=' instart';
      if(e && c.iso===e) cls+=' inend';
      if(s && e && c.iso>s && c.iso<e) cls+=' inrange';
    }
    return '<button type="button" class="'+cls+'" data-date="'+c.iso+'">'+c.d+'</button>';
  }).join('');
}

function openDr(){
  drPickStart=drStart; drPickEnd=drEnd;
  const p=parseISO(drStart); drViewY=p.y; drViewM=p.m;
  renderDrGrid();
  $('#drWrap').classList.add('open');
}
const closeDr=()=>$('#drWrap').classList.remove('open');

$('#drBtn').addEventListener('click', e=>{
  e.stopPropagation();
  const wasOpen=$('#drWrap').classList.contains('open');
  $$('.f.fsel, .f.drwrap').forEach(x=>x.classList.remove('open'));
  if(!wasOpen) openDr();
});
$('#drPanel').addEventListener('click', e=>e.stopPropagation()); // multi-step picker · never let a click inside close it
$('#drPrev').addEventListener('click', ()=>{ drViewM--; if(drViewM<0){ drViewM=11; drViewY--; } renderDrGrid(); });
$('#drNext').addEventListener('click', ()=>{ drViewM++; if(drViewM>11){ drViewM=0; drViewY++; } renderDrGrid(); });
$('#drGridBody').addEventListener('click', e=>{
  const cell=e.target.closest('.drday'); if(!cell || cell.disabled) return;
  const iso=cell.dataset.date;
  if(!drPickStart || (drPickStart && drPickEnd) || iso<drPickStart){ drPickStart=iso; drPickEnd=null; }
  else drPickEnd=iso;
  renderDrGrid();
});
$('#drCancel').addEventListener('click', closeDr);
$('#drApply').addEventListener('click', ()=>{
  if(!drPickStart){ toast('Pick a start date'); return; }
  drStart=drPickStart; drEnd=drPickEnd||drPickStart;
  $('#fFrom').value=drStart; $('#fTo').value=drEnd;
  renderDrLabel(); closeDr(); filterLog();
  toast('Date range updated');
});
renderDrLabel();


/* ---------- delivery log actions · retry & human follow-up (BRD 07.5) ---------- */
$('#logBody').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  const tr = b.closest('tr'), name = tr.children[1].querySelector('b').textContent;
  if(b.classList.contains('act-retry')){
    tr.dataset.st = 'Queued';
    tr.children[4].innerHTML = '<span class="chip warn">Queued</span>';
    tr.children[5].textContent = String((+tr.children[5].textContent || 0) + 1);
    tr.children[6].innerHTML = '<span style="color:var(--ink-muted);font-size:11.5px">Manual retry queued · deduplicated</span>';
    tr.children[7].innerHTML = '<span style="color:var(--ink-muted)">—</span>';
    toast('Retry queued for ' + name + ' · idempotent, no duplicate message');
  } else if(b.classList.contains('act-fu')){
    tr.children[6].innerHTML = '<span style="color:var(--success);font-size:11.5px;font-weight:600">Followed up manually · front desk</span>';
    tr.children[7].innerHTML = '<span style="color:var(--ink-muted)">—</span>';
    toast(name + ' marked followed up · removed from attention list');
  }
});

/* ---------- staff operational alerts (BRD 07.4) ---------- */
function syncAlerts(){
  const n = document.querySelectorAll('#alertList .arow').length;
  $('#alertChip').textContent = n ? n + ' active' : 'All clear';
  $('#alertChip').className = 'chip ' + (n ? 'bad' : 'ok');
  $('#alertEmpty').style.display = n ? 'none' : '';
  const c = $('#bellCnt'); c.textContent = n; c.style.display = n ? '' : 'none';
}
$('#alertList').addEventListener('click', e => {
  const b = e.target.closest('.mini'); if(!b) return;
  const row = b.closest('.arow');
  toast('Resolved · removed from the attention list');
  row.remove(); syncAlerts();
});
/* bell popover · click toggles, outside click / Escape closes */
const alertMenu = $('#alertMenu'), alertBtn = $('#alertBtn');
function closeAlertMenu(){ alertMenu.classList.remove('show'); alertBtn.setAttribute('aria-expanded','false'); }
alertBtn.addEventListener('click', e => {
  e.stopPropagation();
  const open = alertMenu.classList.toggle('show');
  alertBtn.setAttribute('aria-expanded', open);
});
alertMenu.addEventListener('click', e => e.stopPropagation());
document.addEventListener('click', closeAlertMenu);

renderList(); renderPreview(); filterLog(); syncAlerts();

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

