const $ = s => document.querySelector(s);
const toast = m => { const t=$('#toast'); t.textContent=m; t.classList.add('show');
  clearTimeout(t._x); t._x=setTimeout(()=>t.classList.remove('show'),2400); };

/* ---------- panel switching ---------- */
function go(id){
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('on',p.id===id));
  if(id==='pOtp'){ startTimer(); setTimeout(()=>$('#otpBox input').focus(),140); }
  if(id==='pNew'){ setTimeout(()=>$('#np').focus(),140); }
}
document.addEventListener('click', e=>{
  const b=e.target.closest('[data-go]'); if(b){ e.preventDefault(); go(b.dataset.go); return; }
  const eye=e.target.closest('[data-eye]');
  if(eye){ const i=document.getElementById(eye.dataset.eye); i.type = i.type==='password'?'text':'password'; }
});

/* ---------- 1. sign in ---------- */
$('#signinForm').addEventListener('submit', e=>{
  e.preventDefault();
  const email=$('#email'), pwd=$('#pwd'), err=$('#pwdErr'), aErr=$('#authErr');
  aErr.classList.remove('on');
  if(!/^\S+@\S+\.\S+$/.test(email.value.trim())){ email.classList.add('err'); email.focus(); return; }
  email.classList.remove('err');
  if(!pwd.value.trim()){ pwd.classList.add('err'); err.classList.add('on'); pwd.focus(); return; }
  pwd.classList.remove('err'); err.classList.remove('on');

  const btn=$('#signinBtn'); btn.classList.add('loading'); btn.disabled=true;
  btn.querySelector('.lbl').textContent='Signing in…';
  setTimeout(()=>{
    btn.classList.remove('loading'); btn.disabled=false; btn.querySelector('.lbl').textContent='Sign in';
    if(pwd.value.trim().toLowerCase()==='wrong'){
      aErr.classList.add('on'); pwd.classList.add('err'); pwd.value=''; pwd.focus(); return;
    }
    toast('Signed in · opening dashboard');
    setTimeout(()=>location.href='admin-dashboard.html',600);
  },900);
});
['#pwd','#email'].forEach(s=>$(s).addEventListener('input',()=>{
  $(s).classList.remove('err'); $('#pwdErr').classList.remove('on'); $('#authErr').classList.remove('on');
}));

/* ---------- 2. send OTP ---------- */
$('#sendOtpBtn').addEventListener('click', ()=>{
  const v=$('#femail').value.trim();
  if(!/^\S+@\S+\.\S+$/.test(v)){ $('#femail').classList.add('err'); $('#femailErr').classList.add('on'); $('#femail').focus(); return; }
  $('#femail').classList.remove('err'); $('#femailErr').classList.remove('on');
  const btn=$('#sendOtpBtn'); btn.classList.add('loading'); btn.disabled=true;
  btn.querySelector('.lbl').textContent='Sending…';
  setTimeout(()=>{
    btn.classList.remove('loading'); btn.disabled=false; btn.querySelector('.lbl').textContent='Send OTP';
    $('#otpMail').textContent=v;
    toast('OTP sent to ' + v);
    go('pOtp');
  },900);
});
$('#femail').addEventListener('input',()=>{ $('#femail').classList.remove('err'); $('#femailErr').classList.remove('on'); });

/* ---------- 3. OTP boxes ---------- */
const boxes=[...document.querySelectorAll('#otpBox input')];
const otpValue = ()=>boxes.map(b=>b.value).join('');
boxes.forEach((b,i)=>{
  b.addEventListener('input', ()=>{
    b.value=b.value.replace(/\D/g,'');
    b.classList.toggle('filled', !!b.value); b.classList.remove('bad');
    if(b.value && i<boxes.length-1) boxes[i+1].focus();
    $('#verifyBtn').disabled = boxes.some(x=>!x.value);
    $('#otpErr').classList.remove('on');
  });
  b.addEventListener('keydown', e=>{ if(e.key==='Backspace' && !b.value && i>0) boxes[i-1].focus(); });
  b.addEventListener('paste', e=>{
    const d=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,6);
    if(!d) return; e.preventDefault();
    d.split('').forEach((c,j)=>{ if(boxes[j]){ boxes[j].value=c; boxes[j].classList.add('filled'); } });
    $('#verifyBtn').disabled = boxes.some(x=>!x.value);
    boxes[Math.min(d.length,5)].focus();
  });
});
$('#verifyBtn').addEventListener('click', ()=>{
  const btn=$('#verifyBtn'); btn.classList.add('loading'); btn.disabled=true;
  btn.querySelector('.lbl').textContent='Verifying…';
  setTimeout(()=>{
    btn.classList.remove('loading'); btn.querySelector('.lbl').textContent='Verify code';
    /* demo: 000000 is treated as a wrong code */
    if(otpValue()==='000000'){
      btn.disabled=false; $('#otpErr').classList.add('on');
      boxes.forEach(b=>{b.value='';b.classList.remove('filled');b.classList.add('bad')});
      boxes[0].focus(); return;
    }
    clearInterval(tid); go('pNew');
  },900);
});

/* ---------- resend timer ---------- */
let tid;
function startTimer(){
  let n=30; const btn=$('#resendBtn');
  btn.disabled=true; btn.innerHTML='Resend in <span id="tmr">'+n+'</span>s';
  clearInterval(tid);
  tid=setInterval(()=>{
    n--; const t=$('#tmr'); if(t) t.textContent=n;
    if(n<=0){ clearInterval(tid); btn.disabled=false; btn.textContent='Resend code'; }
  },1000);
}
$('#resendBtn').addEventListener('click', ()=>{
  toast('New code sent to ' + $('#otpMail').textContent);
  boxes.forEach(b=>{b.value='';b.classList.remove('filled','bad')});
  $('#verifyBtn').disabled=true; boxes[0].focus(); startTimer();
});

/* ---------- 4. new password ---------- */
const CHECKS={ len:v=>v.length>=8, up:v=>/[A-Z]/.test(v), num:v=>/\d/.test(v), sym:v=>/[^A-Za-z0-9]/.test(v) };
function scorePwd(){
  const v=$('#np').value; let passed=0;
  document.querySelectorAll('#rules li').forEach(li=>{
    const ok=CHECKS[li.dataset.r](v); li.classList.toggle('ok',ok); if(ok) passed++;
  });
  const lvl = !v ? '' : passed<=2 ? 's' : passed===3 ? 'm' : 'w';
  $('#strength').className = 'strength' + (lvl ? ' on ' + lvl : '');
  if(lvl) $('#sword').textContent = lvl==='s' ? 'Weak' : lvl==='m' ? 'Medium' : 'Strong';
  const match = $('#cp').value && $('#np').value===$('#cp').value;
  $('#cpErr').classList.toggle('on', !!$('#cp').value && !match);
  $('#saveBtn').disabled = !(passed===4 && match);
}
$('#np').addEventListener('input',scorePwd);
$('#cp').addEventListener('input',scorePwd);
$('#saveBtn').addEventListener('click', ()=>{
  const btn=$('#saveBtn'); btn.classList.add('loading'); btn.disabled=true;
  btn.querySelector('.lbl').textContent='Updating…';
  setTimeout(()=>{
    btn.classList.remove('loading'); btn.querySelector('.lbl').textContent='Update password';
    toast('Password updated successfully'); go('pDone');
  },900);
});
