// ── AUTH ──────────────────────────────────────────────────────────
// Injects a login screen over the app if user is not logged in.
// On successful login, hides the screen and loads user data.

function renderLoginScreen(){
  const el=document.createElement('div');
  el.id='auth-screen';
  el.style.cssText='position:fixed;inset:0;background:var(--bg,#111);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:32px';
  el.innerHTML=`
    <div style="font-family:'Bebas Neue',sans-serif;font-size:52px;color:#c9a84c;letter-spacing:4px;line-height:1">TRAINE</div>
    <div style="font-size:14px;color:#888;letter-spacing:1px;margin-top:-16px">YOUR AI COACHING APP</div>
    <div style="width:100%;max-width:340px;display:flex;flex-direction:column;gap:12px;margin-top:8px">
      <button id="btn-google" style="display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;color:#222;border:none;padding:14px 20px;font-size:15px;font-weight:600;cursor:pointer;border-radius:4px;width:100%">
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Continue with Google
      </button>
      <div style="display:flex;align-items:center;gap:10px;color:#555;font-size:12px">
        <div style="flex:1;height:1px;background:#333"></div>
        OR
        <div style="flex:1;height:1px;background:#333"></div>
      </div>
      <input id="auth-email" type="email" placeholder="Email address" style="background:#1a1a1a;border:1px solid #333;color:#fff;padding:13px 16px;font-size:14px;border-radius:4px;width:100%;box-sizing:border-box"/>
      <button id="btn-magic" style="background:#c9a84c;color:#111;border:none;padding:14px;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2px;cursor:pointer;border-radius:4px;width:100%">SEND MAGIC LINK</button>
      <div id="auth-msg" style="font-size:12px;color:#888;text-align:center;min-height:18px"></div>
    </div>
    <div style="font-size:11px;color:#555;text-align:center;max-width:280px;line-height:1.6">Your data is stored securely in the cloud.<br>Works across all your devices.</div>
  `;
  document.body.appendChild(el);

  document.getElementById('btn-google').onclick=async()=>{
    const{error}=await _sb.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:window.location.origin+window.location.pathname}
    });
    if(error)document.getElementById('auth-msg').textContent='Error: '+error.message;
  };

  document.getElementById('btn-magic').onclick=async()=>{
    const email=document.getElementById('auth-email').value.trim();
    if(!email){document.getElementById('auth-msg').textContent='Enter your email first.';return;}
    const msg=document.getElementById('auth-msg');
    msg.textContent='Sending...';
    const{error}=await _sb.auth.signInWithOtp({
      email,
      options:{emailRedirectTo:window.location.origin+window.location.pathname}
    });
    if(error)msg.textContent='Error: '+error.message;
    else msg.style.color='#4caf50',msg.textContent='✓ Check your email for the login link!';
  };
}

function hideLoginScreen(){
  const el=document.getElementById('auth-screen');
  if(el)el.remove();
}

function renderUserBadge(user){
  // Add small logout button to settings modal
  const settingsModal=document.getElementById('settings-modal');
  if(!settingsModal)return;
  if(document.getElementById('logout-btn'))return;
  const div=document.createElement('div');
  div.style.cssText='margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.07)';
  div.innerHTML=`
    <div style="font-size:11px;color:var(--muted,#888);margin-bottom:8px;letter-spacing:1px">ACCOUNT</div>
    <div style="font-size:13px;color:var(--text,#fff);margin-bottom:10px">${user.email}</div>
    <button id="logout-btn" onclick="signOut()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:var(--muted,#888);padding:8px 14px;font-size:13px;cursor:pointer;width:100%">Sign out</button>
  `;
  settingsModal.querySelector('.modal-body')?.appendChild(div)||settingsModal.appendChild(div);
}

async function signOut(){
  await _sb.auth.signOut();
  window.location.reload();
}

// ── MAIN AUTH INIT ────────────────────────────────────────────────
async function initAuth(){
  const user=await initSupabase();
  if(!user){
    renderLoginScreen();
    // Listen for auth state change (after OAuth redirect or magic link)
    _sb.auth.onAuthStateChange(async(event,session)=>{
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
  // Already logged in
  renderUserBadge(user);
  return true;
}
