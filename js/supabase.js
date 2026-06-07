// ── SUPABASE CLIENT ───────────────────────────────────────────────
const SUPABASE_URL='https://nxziyrbxggxgjryrayeg.supabase.co';
const SUPABASE_KEY='sb_publishable_uFk5lLvRRey43YNo7s-myA_E_C3N_Ws';
const _sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

// Current logged-in user (null if not logged in)
let currentUser=null;

async function initSupabase(){
  const{data:{session}}=await _sb.auth.getSession();
  currentUser=session?.user||null;
  _sb.auth.onAuthStateChange((_,session)=>{
    currentUser=session?.user||null;
  });
  return currentUser;
}

function getUser(){return currentUser;}
function isLoggedIn(){return!!currentUser;}
