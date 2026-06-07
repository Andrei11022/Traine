// ── AUTH — Supabase email/password + password reset ───────────────

function renderLoginScreen(){
  const el=document.createElement('div');
  el.id='auth-screen';
  el.style.cssText='position:fixed;inset:0;background:#111;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;overflow-y:auto';
  el.innerHTML=`
    <div style="width:100%;max-width:360px;display:flex;flex-direction:column;align-items:center;gap:20px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:52px;color:#c9a84c;letter-spacing:4px;line-height:1">TRAINE</div>
      <div style="font-size:12px;color:#666;letter-spacing:2px;margin-top:-14px">YOUR AI COACHING APP</div>

      <!-- PANELS -->
      <div id="auth-login" style="width:100%;display:flex;flex-direction:column;gap:10px">
        <div style="font-size:11px;color:#888;letter-spacing:1.5px;text-align:center;margin-bottom:4px">SIGN IN</div>
        <input id="li-email" type="email" placeholder="Email" style="${_inp()}"/>
        <input id="li-pass" type="password" placeholder="Password" style="${_inp()}"/>
        <button onclick="doLogin()" style="${_btnGold()}">LOG IN</button>
        <div style="display:flex;justify-content:space-between;margin-top:2px">
          <span onclick="showPanel('forgot')" style="${_link()}">Forgot password?</span>
          <span onclick="showPanel('register')" style="${_link()}">Create account</span>
        </div>
      </div>

      <div id="auth-register" style="width:100%;display:none;flex-direction:column;gap:10px">
        <div style="font-size:11px;color:#888;letter-spacing:1.5px;text-align:center;margin-bottom:4px">CREATE ACCOUNT</div>
        <input id="reg-email" type="email" placeholder="Email" style="${_inp()}"/>
        <input id="reg-pass" type="password" placeholder="Password (min 6 chars)" style="${_inp()}"/>
        <input id="reg-pass2" type="password" placeholder="Confirm password" style="${_inp()}"/>
        <button onclick="doRegister()" style="${_btnGold()}">CREATE ACCOUNT</button>
        <span onclick="showPanel('login')" style="${_link()};text-align:center">Already have an account? Sign in</span>
      </div>

      <div id="auth-forgot" style="width:100%;display:none;flex-direction:column;gap:10px">
        <div style="font-size:11px;color:#888;letter-spacing:1.5px;text-align:center;margin-bottom:4px">RESET PASSWORD</div>
        <div style="font-size:12px;color:#666;text-align:center;line-height:1.6">Enter your email and we'll send you a link to reset your password.</div>
        <input id="forgot-email" type="email" placeholder="Email" style="${_inp()}"/>
        <button onclick="doForgot()" style="${_btnGold()}">SEND RESET LINK</button>
        <span onclick="showPanel('login')" style="${_link()};text-align:center">Back to login</span>
      </div>

      <div id="auth-reset" style="width:100%;display:none;flex-direction:column;gap:10px">
        <div style="font-size:11px;color:#888;letter-spacing:1.5px;text-align:center;margin-bottom:4px">NEW PASSWORD</div>
        <input id="reset-pass" type="password" placeholder="New password (min 6 chars)" style="${_inp()}"/>
        <input id="reset-pass2" type="password" placeholder="Confirm new password" style="${_inp()}"/>
        <button onclick="doResetPassword()" style="${_btnGold()}">SET NEW PASSWORD</button>
      </div>

      <div id="auth-msg" style="font-size:12px;color:#888;text-align:center;min-height:16px;line-height:1.5"></div>
      <div style="font-size:11px;color:#444;text-align:center">🔒 Data stored securely · HTTPS encrypted</div>
    </div>
  `;
  document.body.appendChild(el);

  // Check if this is a password reset redirect (has access_token in URL hash)
  const hash=window.location.hash;
  if(hash.includes('type=recovery')){
    showPanel('reset');
  }
}

function _inp(){
  return'background:#1a1a1a;border:1px solid #333;color:#fff;padding:13px 16px;font-size:14px;border-radius:4px;width:100%;box-sizing:border-box;outline:none';
}
function _btnGold(){
  return'background:#c9a84c;color:#111;border:none;padding:14px;font-family:"Bebas Neue",sans-serif;font-size:18px;letter-spacing:2px;cursor:pointer;border-radius:4px;width:100%';
}
function _link(){
  return'font-size:12px;color:#888;cursor:pointer;text-decoration:underline;text-underline-offset:3px';
}

function showPanel(name){
  ['login','register','forgot','reset'].forEach(p=>{
    const el=document.getElementById('auth-'+p);
    if(el)el.style.display=p===name?'flex':'none';
  });
  setMsg('');
}

function setMsg(msg,color='#888'){
  const el=document.getElementById('auth-msg');
  if(el){el.textContent=msg;el.style.color=color;}
}

async function doLogin(){
  const email=document.getElementById('li-email').value.trim();
  const pass=document.getElementById('li-pass').value;
  if(!email||!pass){setMsg('Fill in all fields.');return;}
  setMsg('Logging in...');
  const{error}=await _sb.auth.signInWithPassword({email,password:pass});
  if(error)setMsg(error.message,'#e57373');
  else setMsg('✓ Logged in!','#81c784');
}

async function doRegister(){
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value;
  const pass2=document.getElementById('reg-pass2').value;
  if(!email||!pass||!pass2){setMsg('Fill in all fields.');return;}
  if(pass.length<6){setMsg('Password must be at least 6 characters.','#e57373');return;}
  if(pass!==pass2){setMsg('Passwords do not match.','#e57373');return;}
  setMsg('Creating account...');
  const{error}=await _sb.auth.signUp({email,password:pass});
  if(error)setMsg(error.message,'#e57373');
  else setMsg('✓ Account created! Check your email to confirm.','#81c784');
}

async function doForgot(){
  const email=document.getElementById('forgot-email').value.trim();
  if(!email){setMsg('Enter your email first.');return;}
  setMsg('Sending reset link...');
  const{error}=await _sb.auth.resetPasswordForEmail(email,{
    redirectTo:window.location.origin+window.location.pathname
  });
  if(error)setMsg(error.message,'#e57373');
  else setMsg('✓ Reset link sent! Check your email.','#81c784');
}

async function doResetPassword(){
  const pass=document.getElementById('reset-pass').value;
  const pass2=document.getElementById('reset-pass2').value;
  if(!pass||!pass2){setMsg('Fill in both fields.');return;}
  if(pass.length<6){setMsg('Password must be at least 6 characters.','#e57373');return;}
  if(pass!==pass2){setMsg('Passwords do not match.','#e57373');return;}
  setMsg('Updating password...');
  const{error}=await _sb.auth.updateUser({password:pass});
  if(error)setMsg(error.message,'#e57373');
  else{
    setMsg('✓ Password updated! Logging you in...','#81c784');
    // Clean URL hash
    history.replaceState(null,'',window.location.pathname);
    setTimeout(()=>hideLoginScreen(),1500);
  }
}

function hideLoginScreen(){
  const el=document.getElementById('auth-screen');
  if(el)el.remove();
}

function renderUserBadge(user){
  const settingsModal=document.getElementById('settings-modal');
  if(!settingsModal||document.getElementById('logout-btn'))return;
  const div=document.createElement('div');
  div.style.cssText='margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.07)';
  div.innerHTML=`
    <div style="font-size:11px;color:var(--muted,#888);margin-bottom:6px;letter-spacing:1px">ACCOUNT</div>
    <div style="font-size:13px;color:var(--text,#fff);margin-bottom:10px;word-break:break-all">${user.email}</div>
    <button id="logout-btn" onclick="signOut()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:var(--muted,#888);padding:8px 14px;font-size:13px;cursor:pointer;width:100%;border-radius:2px">Sign out</button>
  `;
  const body=settingsModal.querySelector('.modal-body');
  if(body)body.appendChild(div);else settingsModal.appendChild(div);
}

async function signOut(){
  await _sb.auth.signOut();
  window.location.reload();
}

async function initAuth(){
  const user=await initSupabase();
  if(!user){
    renderLoginScreen();
    _sb.auth.onAuthStateChange(async(event,session)=>{
      if(event==='PASSWORD_RECOVERY'){
        // User clicked reset link — show the reset panel
        showPanel('reset');
        return;
      }
      if(session?.user){
        currentUser=session.user;
        hideLoginScreen();
        await loadData();
        renderUserBadge(session.user);
        initHome();
        renderDirectiveBoard();
      }
    });
    return false;
  }
  renderUserBadge(user);
  return true;
}
