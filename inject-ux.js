const fs = require('fs');

const files = ['emr-templates.html', 'medication-config.html', 'orders-care-plans.html', 'clinical-support-masters.html'];

const depDialogHtml = `  <div class="scrim" id="depScrim" style="display:none; z-index:999"></div>
  <div class="drawer" id="depDrawer" style="display:none; z-index:1000; width:450px; right:0">
    <div class="dh">
      <h3>Deactivate Configuration</h3>
      <button type="button" class="x" onclick="document.getElementById('depScrim').style.display='none';document.getElementById('depDrawer').style.display='none'">×</button>
    </div>
    <div class="db">
      <div class="note warn" style="margin-bottom:16px"><b>Warning: Active Dependencies</b><br>This configuration is currently used by <b id="depCount">8</b> future sessions/records. Deactivating it may disrupt workflows.</div>
      <label>Affected Areas</label>
      <table class="tbl mini" style="margin-bottom:16px">
        <thead><tr><th>Dependency Type</th><th>Impact</th></tr></thead>
        <tbody id="depBody">
          <tr><td>Upcoming Appointments</td><td>4 active bookings missing required metric</td></tr>
          <tr><td>Care Plans</td><td>2 active care plans referencing this order</td></tr>
        </tbody>
      </table>
    </div>
    <div class="df">
      <button type="button" class="btn" onclick="document.getElementById('depScrim').style.display='none';document.getElementById('depDrawer').style.display='none'">Cancel</button>
      <button type="button" class="btn primary" style="background:var(--danger);border-color:var(--danger)" id="btnForceDeactivate">Force Deactivate</button>
    </div>
  </div>
`;

const validBarStr = `<div id="validationSummary" style="display:none; padding:12px 24px; background:var(--surface-2); border-top:1px solid var(--line);">
          <b style="display:block; margin-bottom:8px">Validation Rules</b>
          <div id="valList" style="font-size:13px; line-height:1.6"></div>
        </div>
        <div class="df" style="position:sticky; bottom:0; background:var(--surface); z-index:10">
          <button type="button" class="btn" id="dCancel" onclick="document.getElementById('scrim').style.display='none';document.getElementById('drawer').className='drawer'">Cancel</button>
          <div style="flex:1"></div>
          <button type="button" class="btn" id="dSaveDraft">Save Draft</button>
          <button type="button" class="btn" id="btnValidate" onclick="this.parentElement.previousElementSibling.style.display='block';this.parentElement.previousElementSibling.querySelector('#valList').innerHTML='<span style=\\'color:var(--success)\\'>✓ Required fields present</span><br><span style=\\'color:var(--success)\\'>✓ No conflicting configurations</span><br><span style=\\'color:var(--success)\\'>✓ Hard dependencies met</span>';document.getElementById('dSave').disabled=false;">Validate</button>
          <button type="button" class="btn primary" id="dSave" disabled>Publish</button>
        </div>`;

for (let file of files) {
  let content = fs.readFileSync('../'+file, 'utf8');
  
  if (!content.includes('id="depDrawer"')) {
    content = content.replace('<div class="drawer" id="drawer">', depDialogHtml + '<div class="drawer" id="drawer">');
  }

  // Replace drawer footer securely
  // Match standard drawer footers containing id="dCancel" up to </div>
  const footerRegex = /<div class="df">\s*<button[^>]*id="dCancel"[\s\S]*?<\/div>/g;
  if (footerRegex.test(content)) {
    content = content.replace(footerRegex, validBarStr);
  }

  fs.writeFileSync('../'+file, content, 'utf8');
  console.log('Injected UX to ' + file);
}
