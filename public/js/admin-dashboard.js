document.querySelector('.nav a.on')?.scrollIntoView({block:'nearest'});
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2000); };

/* ring animates in from empty on load */
const CIRC = 2 * Math.PI * 55;
$('#ringArc').style.strokeDashoffset = CIRC * (1 - 58 / 100);

$('#alertBtn').addEventListener('click', () => toast('3 configuration alerts pending'));
$('#runValidationBtn').addEventListener('click', () => toast('Validation complete · 3 blocked, 10 partial, 6 ready · see readiness below'));

/* ---------------------------------------------------------------
   Branch switcher · same custom dropdown pattern used on Doctors &
   Staff's department/branch pickers (makeDropdown()).
   --------------------------------------------------------------- */
const BRANCHES = ['Main Campus', 'OPD Annexe', 'Madhurawada Branch'];
function makeDropdown(prefix, onPick) {
  const rt = $('#' + prefix + 'Drop'), btn = $('#' + prefix + 'Btn'), lbl = $('#' + prefix + 'BtnLbl');
  const searchEl = $('#' + prefix + 'Search'), emptyEl = $('#' + prefix + 'Empty'), listSel = '#' + prefix + 'List';
  let value = '', rows = [];
  const close = () => { rt.classList.remove('open'); };
  const draw = list => {
    $(listSel).innerHTML = list.map(r =>
      '<button type="button" class="cdrow' + (r.value === value ? ' on' : '') + '" data-v="' + r.value + '"><span class="cdav">' + (r.av || '') + '</span>'
      + '<div class="cdtx"><b>' + r.title + '</b>' + (r.sub ? '<span>' + r.sub + '</span>' : '') + '</div>'
      + '<svg class="chk" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></button>'
    ).join('');
    $$(listSel + ' .cdrow').forEach(row => row.addEventListener('click', () => {
      const r = rows.find(x => x.value === row.dataset.v);
      api.select(row.dataset.v, r ? r.title : row.dataset.v);
      close();
    }));
    emptyEl.style.display = list.length ? 'none' : 'block';
    $(listSel).style.display = list.length ? 'block' : 'none';
  };
  const filter = q => { q = q.trim().toLowerCase(); draw(!q ? rows : rows.filter(r => (r.title + ' ' + (r.sub || '')).toLowerCase().includes(q))); };
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = rt.classList.toggle('open');
    if (open) { searchEl.value = ''; filter(''); searchEl.focus(); }
  });
  searchEl.addEventListener('input', e => filter(e.target.value));
  searchEl.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', e => { if (!rt.contains(e.target)) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  const api = {
    setOptions(list) { rows = list; filter(searchEl.value); },
    select(v, label) {
      value = v; lbl.textContent = label || v; btn.classList.toggle('has-value', !!v);
      $$(listSel + ' .cdrow').forEach(r => r.classList.toggle('on', r.dataset.v === v));
      if (onPick) onPick(v);
    },
    reset(placeholder) { value = ''; lbl.textContent = placeholder; btn.classList.remove('has-value'); $$(listSel + ' .cdrow').forEach(r => r.classList.remove('on')); },
    get value() { return value; }
  };
  return api;
}
const brDD = makeDropdown('br', v => {
  toast('Switched to ' + v);
  $('#metaTxt').textContent = $('#metaTxt').textContent.replace(/Main Campus|OPD Annexe|Madhurawada Branch/, v);
});
brDD.setOptions(BRANCHES.map(b => ({ value: b, title: b, av: b.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() })));
brDD.select('Main Campus', 'Main Campus');

/* ---------------------------------------------------------------
   Where each P01-XX master now actually lives · every screen below
   has been built, so a click on any card/row/cell/button jumps to
   the real page instead of just simulating it.
   --------------------------------------------------------------- */
const GOTO = [
  ['P01-02', 'clinic-branch.html'],
  ['P01-03', 'roles-departments.html'],
  ['P01-04', 'rooms-areas.html'],
  ['P01-05', 'counters-points.html'],
  ['P01-06', 'equipment-resources.html'],
  ['P01-07', 'doctors-staff.html'],
  ['P01-08', 'roster-sessions.html'],
  ['P01-09', 'user-onboard.html'],
  ['P01-10', 'services-consultation-types.html'],
  ['P01-11', 'treatments-procedures.html'],
  ['P01-12', 'packages-pricing.html'],
  ['P01-13', 'availability.html'],
  ['P01-14', 'slots-queue-rules.html'],
  ['P01-15', 'patient-fields.html'],
  ['P01-16', 'emr-templates.html'],
  ['P01-17', 'medication-config.html'],
  ['P01-18', 'orders-care-plans.html'],
  ['P01-19', 'clinical-support-masters.html'],
  ['Audit &', 'reference-audit.html#audit'],
  ['P01-20', 'reference-audit.html']
];

/* ---------------------------------------------------------------
   Category-card popover · click a readiness card to see exactly
   which masters in that category are still incomplete.
   --------------------------------------------------------------- */
const CAT_MASTERS = {
  clinicsetup: [
    {no:'04', name:'Rooms &amp; Care Areas', st:'miss', note:'11 rooms · purpose missing on 4', todo:'P01-04 Rooms &amp; Care Areas'},
    {no:'05', name:'Counters &amp; Service Points', st:'miss', note:'2 counters · service hours not set', todo:'P01-05 Counters &amp; Service Points'},
    {no:'06', name:'Resources &amp; Equipment', st:'miss', note:'24 items · capability unverified', todo:'P01-06 Resources &amp; Equipment'}
  ],
  peopleaccess: [
    {no:'08', name:'Roster &amp; Doctor Sessions', st:'miss', note:'3 doctors have no recurring session', todo:'P01-08 Roster &amp; Doctor Sessions'},
    {no:'09', name:'Users, Roles &amp; Permissions', st:'miss', note:'2 users with no role assigned', todo:'P01-09 Users, Roles &amp; Permissions'}
  ],
  clinicalcatalogue: [
    {no:'10', name:'Services &amp; Consultation Types', st:'err', note:'297 of 316 have no doctor mapped', todo:'P01-10 Services &amp; Consultation Types'},
    {no:'11', name:'Treatments &amp; Procedures', st:'miss', note:'2 missing a required room', todo:'P01-11 Treatments &amp; Procedures'},
    {no:'12', name:'Packages &amp; Reference Pricing', st:'miss', note:'53 imported · 6 with invalid inclusions', todo:'P01-12 Packages &amp; Reference Pricing'}
  ],
  schedulingrules: [
    {no:'14', name:'Slots, Capacity, Booking &amp; Queue Rules', st:'err', note:'Draft · not published, blocks booking', todo:'P01-14 Slots, Capacity, Booking &amp; Queue Rules'}
  ],
  patientemr: [
    {no:'15', name:'Patient Fields &amp; Consent', st:'miss', note:'Draft · consent applicability pending', todo:'P01-15 Patient Fields, Identity &amp; Consent'},
    {no:'17', name:'Medication &amp; Prescription Config', st:'miss', note:'Formulary draft · frequencies not defined', todo:'P01-17 Medication &amp; Prescription'},
    {no:'18', name:'Clinical Order &amp; Care Plan Config', st:'err', note:'Not started · order types missing', todo:'P01-18 Clinical Orders &amp; Care Plans'}
  ],
  clinicalsupport: [
    {no:'19', name:'Clinical Support &amp; Stay Masters', st:'miss', note:'51 lab tests misfiled in service master', todo:'P01-19 Clinical Support &amp; Stay Masters'}
  ],
  referencemasters: []
};

const rgPop = document.createElement('div');
rgPop.className = 'rgpop';
document.body.appendChild(rgPop);
let rgPopFor = null;
const closeRgPop = () => { rgPop.classList.remove('show'); if (rgPopFor) rgPopFor.classList.remove('open'); rgPopFor = null; };

$$('.rgcard').forEach(card => card.addEventListener('click', e => {
  e.stopPropagation();
  if (rgPopFor === card) { closeRgPop(); return; }
  if (rgPopFor) rgPopFor.classList.remove('open');
  rgPopFor = card;
  card.classList.add('open');

  const catName = card.querySelector('.rgname').textContent;
  const total = (+card.dataset.done) + (+card.dataset.warn) + (+card.dataset.err);
  const done = +card.dataset.done;
  const list = CAT_MASTERS[card.dataset.cat] || [];
  const rows = list.length
    ? list.map(m => `<div class="rgpoprow">
        <span class="rgpst ${m.st}">${m.st === 'err' ? '✕' : '!'}</span>
        <div class="rgpx"><b>${m.no} · ${m.name}</b><span>${m.note}</span></div>
        <span class="rgpfix ${m.st}" data-todo="${m.todo}">Fix</span>
      </div>`).join('')
    : `<div class="rgpempty">All ${total} master${total > 1 ? 's' : ''} in this category are fully configured. ✓</div>`;
  rgPop.innerHTML = `<div class="rgpophead"><b>${catName}</b><span>${done}/${total} ready</span></div>${rows}`;
  rgPop.classList.add('show');

  const r = card.getBoundingClientRect();
  rgPop.style.top = Math.min(r.bottom + 8, innerHeight - 340) + 'px';
  rgPop.style.left = Math.max(10, Math.min(r.left, innerWidth - 296)) + 'px';
}));
document.addEventListener('click', e => { if (!rgPop.contains(e.target) && !e.target.closest('.rgcard')) closeRgPop(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeRgPop(); });

/* jump-to-master / Fix / Resolve · navigates to the real screen where one
   exists (GOTO), otherwise falls back to a toast (e.g. the action-plan
   button, which has no dedicated screen). */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-todo]');
  if (!t) return;
  e.preventDefault();
  if (rgPop.contains(t)) closeRgPop();
  const label = t.dataset.todo.replace(/&amp;/g, '&');
  const hit = GOTO.find(g => label.includes(g[0]));
  if (hit) location.href = hit[1];
  else toast('Opens · ' + label.replace(/^P01-\d+\s*/, ''));
});
