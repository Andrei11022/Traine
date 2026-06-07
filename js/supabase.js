// ── SUPABASE — pure fetch, no SDK, no eval ────────────────────────
const SUPABASE_URL='https://nxziyrbxggxgjryrayeg.supabase.co';
const SUPABASE_KEY='sb_publishable_uFk5lLvRRey43YNo7s-myA_E_C3N_Ws';

let currentUser=null;
let _accessToken=null;
let _refreshToken=null;

function _headers(extra={}){
  const h={'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':'Bearer '+(_accessToken||SUPABASE_KEY)};
  return Object.assign(h,extra);
}

// ── AUTH ──────────────────────────────────────────────────────────
const _sb={
  auth:{
    async getSession(){
      const raw=localStorage.getItem('sb_session');
      if(!raw)return{data:{session:null}};
      try{
        const s=JSON.parse(raw);
        // Check if token expired
        if(s.expires_at&&Date.now()/1000>s.expires_at-60){
          const refreshed=await _sb.auth._refresh(s.refresh_token);
          if(!refreshed)return{data:{session:null}};
          return{data:{session:refreshed}};
        }
        _accessToken=s.access_token;
        _refreshToken=s.refresh_token;
        return{data:{session:s}};
      }catch(e){return{data:{session:null}};}
    },
    async _refresh(token){
      try{
        const r=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{
          method:'POST',headers:_headers(),body:JSON.stringify({refresh_token:token})
        });
        if(!r.ok)return null;
        const d=await r.json();
        const session={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Math.floor(Date.now()/1000)+d.expires_in,user:d.user};
        localStorage.setItem('sb_session',JSON.stringify(session));
        _accessToken=d.access_token;
        _refreshToken=d.refresh_token;
        return session;
      }catch(e){return null;}
    },
    async signInWithPassword({email,password}){
      try{
        const r=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=password',{
          method:'POST',headers:_headers(),body:JSON.stringify({email,password})
        });
        const d=await r.json();
        if(!r.ok)return{error:{message:d.error_description||d.msg||'Login failed'}};
        const session={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:Math.floor(Date.now()/1000)+d.expires_in,user:d.user};
        localStorage.setItem('sb_session',JSON.stringify(session));
        _accessToken=d.access_token;
        _refreshToken=d.refresh_token;
        currentUser=d.user;
        if(_authCallback)_authCallback('SIGNED_IN',session);
        return{data:session,error:null};
      }catch(e){return{error:{message:e.message}};}
    },
    async signUp({email,password}){
      try{
        const r=await fetch(SUPABASE_URL+'/auth/v1/signup',{
          method:'POST',headers:_headers(),body:JSON.stringify({email,password})
        });
        const d=await r.json();
        if(!r.ok)return{error:{message:d.error_description||d.msg||'Signup failed'}};
        return{data:d,error:null};
      }catch(e){return{error:{message:e.message}};}
    },
    async resetPasswordForEmail(email,{redirectTo}={}){
      try{
        const r=await fetch(SUPABASE_URL+'/auth/v1/recover',{
          method:'POST',headers:_headers(),body:JSON.stringify({email,redirectTo})
        });
        if(!r.ok){const d=await r.json();return{error:{message:d.error_description||'Failed'}};}
        return{error:null};
      }catch(e){return{error:{message:e.message}};}
    },
    async updateUser({password}){
      try{
        const r=await fetch(SUPABASE_URL+'/auth/v1/user',{
          method:'PUT',headers:_headers(),body:JSON.stringify({password})
        });
        const d=await r.json();
        if(!r.ok)return{error:{message:d.error_description||'Update failed'}};
        return{data:d,error:null};
      }catch(e){return{error:{message:e.message}};}
    },
    async signOut(){
      try{
        await fetch(SUPABASE_URL+'/auth/v1/logout',{method:'POST',headers:_headers()});
      }catch(e){}
      localStorage.removeItem('sb_session');
      _accessToken=null;_refreshToken=null;currentUser=null;
    },
    onAuthStateChange(cb){_authCallback=cb;},
  },
  from(table){
    return{
      async select(cols='*'){
        return _sbReq('GET',table,null,{select:cols});
      },
      select(cols='*'){
        let _filters=[];
        const q={
          eq(col,val){_filters.push(`${col}=eq.${val}`);return q;},
          single(){q._single=true;return q;},
          async then(resolve,reject){
            try{
              let qs='select='+(cols||'*');
              _filters.forEach(f=>qs+='&'+f);
              const r=await fetch(SUPABASE_URL+'/rest/v1/'+table+'?'+qs,{
                headers:Object.assign(_headers(),{'Prefer':q._single?'return=representation':'','Accept':q._single?'application/vnd.pgrst.object+json':'application/json'})
              });
              if(!r.ok&&r.status!==406){const e=await r.json();return resolve({data:null,error:e});}
              if(r.status===406)return resolve({data:null,error:null});
              const data=await r.json();
              resolve({data,error:null});
            }catch(e){resolve({data:null,error:{message:e.message}});}
          }
        };
        return q;
      },
      async upsert(obj,opts={}){
        return _sbReq('POST',table,obj,{},{'Prefer':'resolution=merge-duplicates,return=minimal'});
      },
    };
  }
};

let _authCallback=null;

async function _sbReq(method,table,body,params={},extraHeaders={}){
  try{
    let qs=Object.entries(params).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&');
    const url=SUPABASE_URL+'/rest/v1/'+table+(qs?'?'+qs:'');
    const r=await fetch(url,{
      method,
      headers:Object.assign(_headers(),extraHeaders),
      body:body?JSON.stringify(body):undefined
    });
    if(!r.ok){const e=await r.json();return{data:null,error:e};}
    const text=await r.text();
    return{data:text?JSON.parse(text):null,error:null};
  }catch(e){return{data:null,error:{message:e.message}};}
}

async function initSupabase(){
  const{data:{session}}=await _sb.auth.getSession();
  currentUser=session?.user||null;
  // Handle password reset from URL hash
  const hash=window.location.hash;
  if(hash.includes('access_token')){
    const params=new URLSearchParams(hash.replace('#',''));
    const token=params.get('access_token');
    const refresh=params.get('refresh_token');
    const type=params.get('type');
    if(token){
      _accessToken=token;
      _refreshToken=refresh;
      const session={access_token:token,refresh_token:refresh,expires_at:Math.floor(Date.now()/1000)+3600};
      localStorage.setItem('sb_session',JSON.stringify(session));
      if(type==='recovery'&&_authCallback)_authCallback('PASSWORD_RECOVERY',session);
    }
  }
  return currentUser;
}

function getUser(){return currentUser;}
function isLoggedIn(){return!!currentUser;}
