document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2300); };
const esc = s => (s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const TODAY = '13 August 2026';

/* ---------- data ---------- */
const CH = {
  wa:{n:'WhatsApp',    b:'var(--success-soft)', c:'var(--success)'},
  cb:{n:'Chatbot',     b:'var(--info-soft)',    c:'var(--info)'},
  va:{n:'Voice Agent', b:'var(--surface-3)',    c:'var(--ink-muted)'}
};
const STATUS = { pub:{n:'Published',cls:'on'}, review:{n:'Needs review',cls:'warn'}, draft:{n:'Draft',cls:''} };
const CATS = {
  hours:'Clinic Hours & Location', booking:'Appointments & Booking Policy',
  visit:'What to Bring / Before Your Visit', billing:'Billing & Payments',
  aftercare:'Aftercare Logistics', docs:'Insurance & Documents',
  avail:'Branch & Doctor Availability', urgent:'Emergency / Urgent · Route to Reception'
};

const KB = [
 {id:'hours-sun', cat:'hours', q:'What are your clinic timings, and where are you located?',
  ans:"Advanced Wound Healing, Banjara Hills is open Monday–Saturday 9:00 AM–7:00 PM, and Sunday 9:00 AM–1:00 PM for urgent dressing changes only. We're on Road No. 12, Banjara Hills, Hyderabad, opposite Care Hospitals.",
  voice:'', chans:['wa','cb','va'], status:'pub', route:false, attachment:null,
  updatedBy:'Priya Nair · Front Desk Lead', updatedOn:'24 July 2026'},

 {id:'book-sameday', cat:'booking', q:'Can I get a same-day appointment, or do I need to book in advance?',
  ans:"Same-day slots open every morning at 8:30 AM on a first-come basis, alongside pre-booked appointments. Consultation fee is ₹800, payable at reception. WhatsApp or call 040-4567 8899 to check today's availability before you travel.",
  voice:"Yes, we do keep same-day slots · they open at 8:30 in the morning. Consultation is ₹800. Please call ahead to check today's availability.",
  chans:['wa','cb','va'], status:'pub', route:false, attachment:null,
  updatedBy:'Priya Nair · Front Desk Lead', updatedOn:'22 July 2026'},

 {id:'visit-bring', cat:'visit', q:'What should I bring for my first wound-care visit?',
  ans:"Please carry your previous dressing chart, any referral letter, a list of current medication, and a photo ID (Aadhaar, PAN or similar). If you've had recent lab reports or scans, bring those too.",
  voice:'', chans:['wa','cb'], status:'pub', route:false, attachment:null,
  updatedBy:'Dr. Hrishikesh Korada', updatedOn:'18 July 2026'},

 {id:'billing-rates', cat:'billing', q:'What are your consultation and dressing charges, and how can I pay?',
  ans:"Consultation is ₹800. Dressing sessions range ₹500–₹1,200 depending on wound size and materials used · the exact estimate is shared before the session. We accept UPI, card and cash; receipts are given on request.",
  voice:'', chans:['wa','cb'], status:'review', route:false, attachment:{name:'Consultation-Dressing-Fee-Schedule.pdf', size:'214 KB'},
  updatedBy:'Ganesh Bhandari · Billing Desk', updatedOn:'05 August 2026'},

 {id:'aftercare-loose', cat:'aftercare', q:'My dressing feels loose or wet before my next appointment · should I call or come in?',
  ans:"If your dressing becomes loose, wet, or falls off before your scheduled date, message us on WhatsApp or call the clinic · our care coordinator will advise whether to come in early. Please don't redress the wound yourself.",
  voice:'', chans:['wa','cb','va'], status:'pub', route:true, attachment:null,
  updatedBy:'Dr. KVNN Santosh Murthy', updatedOn:'30 July 2026'},

 {id:'docs-insurance', cat:'docs', q:'Do you accept insurance, and what ID proof do you need for registration?',
  ans:"We support cashless treatment with select insurers · share your policy details with reception to confirm coverage. For registration we need one photo ID (Aadhaar/PAN) and, where available, your ABHA number to link your health record.",
  voice:'', chans:['wa','cb'], status:'draft', route:false, attachment:{name:'Accepted-Insurance-Partners.pdf', size:'96 KB'},
  updatedBy:'Priya Nair · Front Desk Lead', updatedOn:'13 August 2026'},

 {id:'avail-saturday', cat:'avail', q:'Which doctor is available on Saturdays at Banjara Hills?',
  ans:"Dr. KVNN Santosh Murthy and Dr. Hrishikesh Korada see patients on Saturdays, 9:00 AM–1:00 PM at Banjara Hills. Sunday urgent dressing changes are covered by the on-call duty doctor.",
  voice:'', chans:['wa','cb','va'], status:'pub', route:false, attachment:null,
  updatedBy:'Priya Nair · Front Desk Lead', updatedOn:'10 August 2026'},

 {id:'urgent-bleeding', cat:'urgent', q:'My wound is bleeding heavily / I have a fever · what should I do?',
  ans:"This may need urgent clinical attention that we can't assess over WhatsApp, chat or a phone call. Please call the clinic immediately on 040-4567 8899, or if this is a medical emergency, go to your nearest emergency room.",
  voice:"This may need urgent medical attention. Please call the clinic right away on 040-4567 8899, or go to your nearest emergency room if it's an emergency.",
  chans:['wa','cb','va'], status:'pub', route:true, attachment:null,
  updatedBy:'Dr. KVNN Santosh Murthy', updatedOn:'01 August 2026'}
];

/* ---------- list render ---------- */
function fmtChans(chans){
  return '<div class="chanrow">' + chans.map(k=>{
    const c=CH[k];
    return `<span class="cch" style="--cb:${c.b};--cc:${c.c}">${c.n}</span>`;
  }).join('') + '</div>';
}
const CLIP_ICON = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="clip"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';
function renderRow(e){
  const st=STATUS[e.status];
  return `<tr>
    <td><b>${esc(e.q)}${e.attachment ? `<span title="Attached: ${esc(e.attachment.name)}">${CLIP_ICON}</span>` : ''}</b></td>
    <td><span class="s">${esc(CATS[e.cat])}</span></td>
    <td>${fmtChans(e.chans)}</td>
    <td><span class="stchip ${st.cls}"><i></i>${st.n}</span></td>
    <td>${e.route ? '<span class="chip pur">Routes to Reception</span>' : '<span class="s">—</span>'}</td>
    <td><span class="s">${e.updatedOn}</span></td>
    <td style="text-align:right"><button class="mini" data-edit="${e.id}">Edit</button></td>
  </tr>`;
}
function renderStats(){
  $('#stTotal').textContent = KB.length;
  $('#stPub').textContent = KB.filter(e=>e.status==='pub').length;
  $('#stReview').textContent = KB.filter(e=>e.status==='review').length;
  $('#stRoute').textContent = KB.filter(e=>e.route).length;
}
function applyFilters(){
  const q = $('#kbSearch').value.trim().toLowerCase();
  const cat = catDD.get(), chan = chanDD.get(), stat = statDD.get();
  const list = KB.filter(e =>
    (!q || e.q.toLowerCase().includes(q) || e.ans.toLowerCase().includes(q)) &&
    (!cat || e.cat === cat) &&
    (!chan || e.chans.includes(chan)) &&
    (!stat || e.status === stat)
  );
  renderList(list);
}
function renderList(list){
  const body = $('#kbBody');
  if(!KB.length){
    body.innerHTML=''; $('#kbEmpty').style.display='none'; $('#kbEmptyAll').style.display='block';
    $('#kbFoot').textContent='';
    return;
  }
  $('#kbEmptyAll').style.display='none';
  if(!list.length){
    body.innerHTML=''; $('#kbEmpty').style.display='block';
    $('#kbFoot').textContent = `Showing 0 of ${KB.length} entries`;
    return;
  }
  $('#kbEmpty').style.display='none';
  body.innerHTML = list.map(renderRow).join('');
  $('#kbFoot').textContent = `Showing ${list.length} of ${KB.length} entries`;
}

/* ---------- custom dropdown (Category / Channel / Status) ---------- */
function initFsel(wrapId,btnId,panelId,hiddenId,opts,onPick){
  const root=$('#'+wrapId), btn=$('#'+btnId), panel=$('#'+panelId), hidden=$('#'+hiddenId);
  const setVal=(v,silent)=>{
    hidden.value=v;
    const found=opts.find(o=>o[0]===v);
    btn.textContent = found ? found[1] : opts[0][1];
    $$('.fselopt',panel).forEach(x=>x.classList.toggle('on', x.dataset.v===v));
    if(!silent && onPick) onPick(v);
  };
  panel.innerHTML = opts.map(([v,l])=>'<button type="button" class="fselopt" data-v="'+v+'">'+esc(l)+'</button>').join('');
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

const catDD = initFsel('catWrap','catBtn','catPanel','fCat',
  [['','All categories'], ...Object.entries(CATS)], applyFilters);
const chanDD = initFsel('chanWrap','chanBtn','chanPanel','fChan',
  [['','All channels'],['wa','WhatsApp'],['cb','Chatbot'],['va','Voice Agent']], applyFilters);
const statDD = initFsel('statWrap','statBtn','statPanel','fStat',
  [['','All statuses'],['pub','Published'],['review','Needs review'],['draft','Draft']], applyFilters);

$('#kbSearch').addEventListener('input', applyFilters);
$('#kbBody').addEventListener('click', e=>{
  const b=e.target.closest('[data-edit]'); if(!b) return;
  openDrawer(b.dataset.edit);
});

/* ---------- category dropdown in drawer ---------- */
const dCatDD = initFsel('dCatWrap','dCatBtn','dCatPanel','dCat', Object.entries(CATS));

/* ---------- drawer ---------- */
const scrim=$('#scrim'), drawer=$('#drawer');
let editId=null, previewChan='wa';

function openDrawer(id){
  editId = id;
  const e = id ? KB.find(x=>x.id===id) : null;
  $('#dTitle').textContent = e ? 'Edit entry' : 'New entry';
  $('#dSub').textContent = e ? 'Update this Knowledge Base entry' : 'Add a new shared Q&A entry';
  $('#dQ').value = e ? e.q : '';
  dCatDD.set(e ? e.cat : Object.keys(CATS)[0]);
  $$('#dChans .cch').forEach(b=>b.classList.toggle('on', e ? e.chans.includes(b.dataset.c) : true));
  $('#dAns').value = e ? e.ans : '';
  updateAnsCount();
  $('#dVoice').value = e ? (e.voice||'') : '';
  $$('#dStatusSeg button').forEach(b=>b.classList.toggle('on', b.dataset.v === (e ? e.status : 'draft')));
  $('#dRoute').checked = e ? e.route : false;
  $('#dFile').value='';
  setAttachment(e ? e.attachment : null);
  if(e){ $('#dMetaWrap').style.display='block'; $('#dMeta').textContent = `Last updated ${e.updatedOn} by ${e.updatedBy}`; }
  else { $('#dMetaWrap').style.display='none'; }
  previewChan='wa';
  $$('#pvChans .cch').forEach(b=>b.classList.toggle('on', b.dataset.pv==='wa'));
  renderPreview();
  scrim.classList.add('show'); drawer.classList.add('show');
}
function closeDrawer(){ scrim.classList.remove('show'); drawer.classList.remove('show'); editId=null; }

$('#newBtn').addEventListener('click', ()=>openDrawer(null));
$('#emptyNewBtn').addEventListener('click', ()=>openDrawer(null));
$('#dClose').addEventListener('click', closeDrawer);
$('#dCancel').addEventListener('click', closeDrawer);
scrim.addEventListener('click', closeDrawer);
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ $$('.f.fsel').forEach(x=>x.classList.remove('open')); if(drawer.classList.contains('show')) closeDrawer(); } });

$('#dChans').addEventListener('click', e=>{
  const b=e.target.closest('.cch'); if(!b) return;
  b.classList.toggle('on');
});
$('#dAns').addEventListener('input', ()=>{ updateAnsCount(); renderPreview(); });
$('#dVoice').addEventListener('input', renderPreview);
$('#dRoute').addEventListener('change', renderPreview);
function updateAnsCount(){ $('#dAnsCnt').textContent = $('#dAns').value.length + ' characters'; }

/* ---------- file attachment ---------- */
const UPLOAD_ICON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
const FILE_ICON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
const dUpload=$('#dUpload'), dFile=$('#dFile'), dFileName=$('#dFileName'), dFileHint=$('#dFileHint'), dFileRemove=$('#dFileRemove'), dFileIcon=$('#dFileIcon');
let currentAttachment = null;
function fmtSize(bytes){
  const kb = bytes/1024;
  return kb > 1024 ? (kb/1024).toFixed(1)+' MB' : Math.max(1,Math.round(kb))+' KB';
}
function setAttachment(att){
  currentAttachment = att;
  if(!att){
    dFileName.textContent = 'Drag a file or browse';
    dFileHint.textContent = 'PDF, DOC or DOCX up to 10 MB, sent as a document link on WhatsApp & Chatbot';
    dFileRemove.style.display='none';
    dFileIcon.innerHTML = UPLOAD_ICON;
    return;
  }
  dFileName.textContent = att.name;
  dFileHint.textContent = att.size + ' · attached';
  dFileRemove.style.display='inline-flex';
  dFileIcon.innerHTML = FILE_ICON;
}
dFile.addEventListener('change', ()=>{
  const f = dFile.files[0];
  setAttachment(f ? {name:f.name, size:fmtSize(f.size)} : null);
});
dFileRemove.addEventListener('click', e=>{
  e.preventDefault(); e.stopPropagation();
  dFile.value=''; setAttachment(null);
});
dUpload.addEventListener('dragover', e=>{ e.preventDefault(); dUpload.classList.add('drag'); });
dUpload.addEventListener('dragleave', ()=>{ dUpload.classList.remove('drag'); });
dUpload.addEventListener('drop', e=>{
  e.preventDefault(); dUpload.classList.remove('drag');
  const f = e.dataTransfer.files[0];
  if(!f) return;
  dFile.files = e.dataTransfer.files;
  setAttachment({name:f.name, size:fmtSize(f.size)});
});

$('#dStatusSeg').addEventListener('click', e=>{
  const b=e.target.closest('button'); if(!b) return;
  $$('#dStatusSeg button').forEach(x=>x.classList.toggle('on', x===b));
});

$('#pvChans').addEventListener('click', e=>{
  const b=e.target.closest('.cch'); if(!b) return;
  previewChan = b.dataset.pv;
  $$('#pvChans .cch').forEach(x=>x.classList.toggle('on', x===b));
  renderPreview();
});

function renderPreview(){
  const routeOn = $('#dRoute').checked;
  const ans = $('#dAns').value.trim() || 'Your answer will appear here.';
  const voice = $('#dVoice').value.trim();
  const box = $('#pvBox');
  if(routeOn){
    box.innerHTML = `<div class="wa"><div class="wa-hd" style="background:var(--surface-3);color:var(--ink)"><span class="av">RC</span><div><b>Routed to Reception</b><span>Not answered automatically</span></div></div>
      <div class="wa-bd"><div class="bub grey">This topic routes to Reception, not answered automatically. Care Desk receives the patient's question and channel context.</div></div></div>`;
    return;
  }
  const attLine = currentAttachment ? `<div class="cmeta">${CLIP_ICON} ${esc(currentAttachment.name)} · ${currentAttachment.size}</div>` : '';
  if(previewChan==='wa'){
    box.innerHTML = `<div class="wa"><div class="wa-hd"><span class="av">AWH</span><div><b>Advanced Wound Healing</b><span>WhatsApp Business</span></div></div>
      <div class="wa-bd"><div class="bub">${esc(ans).replace(/\n/g,'<br>')}<span class="tm">10:24 AM ✓✓</span></div></div></div>${attLine}`;
  } else if(previewChan==='cb'){
    box.innerHTML = `<div class="wa"><div class="wa-hd" style="background:var(--surface-3);color:var(--ink)"><span class="av">CB</span><div><b>Website Chatbot Widget</b><span>Live chat assistant</span></div></div>
      <div class="wa-bd"><div class="bub grey">${esc(ans).replace(/\n/g,'<br>')}</div></div></div>${attLine}`;
  } else {
    const text = voice || ans;
    const n = text.length, secs = Math.max(1, Math.round(n/14));
    box.innerHTML = `<div class="wa"><div class="wa-hd" style="background:var(--surface-3);color:var(--ink)"><span class="av">VA</span><div><b>Voice / Call Agent</b><span>Spoken script read-back</span></div></div>
      <div class="wa-bd"><div class="bub grey">${esc(text).replace(/\n/g,'<br>')}</div></div></div>
      <div class="cmeta">≈${secs}s read time · Telugu, Hindi and English</div>`;
  }
}

$('#dSave').addEventListener('click', ()=>{
  const q = $('#dQ').value.trim();
  const ans = $('#dAns').value.trim();
  if(q.length < 4){ toast('Give this entry a question / topic'); return; }
  if(ans.length < 10){ toast('Write an answer before saving'); return; }
  const chans = $$('#dChans .cch.on').map(b=>b.dataset.c);
  if(!chans.length){ toast('Enable at least one channel'); return; }
  const cat = $('#dCat').value;
  const voice = $('#dVoice').value.trim();
  const statusBtn = $('#dStatusSeg button.on');
  const status = statusBtn ? statusBtn.dataset.v : 'draft';
  const route = $('#dRoute').checked;
  const btn = $('#dSave');
  const wasEdit = !!editId;
  btn.disabled = true; btn.textContent = 'Publishing…';
  setTimeout(()=>{
    if(wasEdit){
      const e = KB.find(x=>x.id===editId);
      Object.assign(e, {q, cat, ans, voice, chans, status, route, attachment:currentAttachment, updatedBy:'Rajeev Malhotra · Hospital Administrator', updatedOn:TODAY});
    } else {
      KB.push({id:'kb-'+Date.now(), q, cat, ans, voice, chans, status, route, attachment:currentAttachment, updatedBy:'Rajeev Malhotra · Hospital Administrator', updatedOn:TODAY});
    }
    btn.disabled = false; btn.textContent = 'Save entry';
    closeDrawer();
    renderStats();
    applyFilters();
    toast(wasEdit ? 'Entry updated' : 'Entry added');
  }, 600);
});

/* ---------- init ---------- */
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

