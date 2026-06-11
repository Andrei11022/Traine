// ── UTILITY ───────────────────────────────────────────────────
function pick(arr){if(!arr||!arr.length)return'';return arr[Math.floor(Math.random()*arr.length)];}
// ── STATE ──────────────────────────────────────────────────────
let state={
  activeCoach:'aria',
  gender:'m',
  caliperMethod:3,
  measurements:{},
  settings:{name:'',bulkStart:82,bulkGoal:92},
  streak:0,
  weight:null,
  recovery:null,
  weightLog:[],
  bfLog:[],
  recLog:[],
  measureLog:[],
  prs:{},
  nutritionLog:[],
  nutritionTargets:null,
  hasSeenWelcome:false,
  hasSeenWorkoutGuide:false,
  avatarData:null,
  unitSystem:'metric',
  goalTarget:null,
  nutritionDisclaimerAcknowledged:false,
  hasSeenStrengthTest:false
};

function today(){return new Date().toISOString().split('T')[0];}
// Push a dated entry, replacing same-day entry
function logEntry(arr,value){
  const t=today();
  const existing=arr.find(e=>e.date===t);
  if(existing)existing.value=value;
  else arr.push({date:t,value});
}
// Epley estimated 1RM
function e1rm(weight,reps){return reps<=1?weight:Math.round(weight*(1+reps/30)*10)/10;}

// ── NAV ───────────────────────────────────────────────────────
const PAGES=['home','workout','coach','stats','profile'];
function goPage(id){
  PAGES.forEach((p,i)=>{
    document.getElementById('pg-'+p).classList.toggle('on',p===id);
    document.querySelectorAll('.nb')[i].classList.toggle('on',p===id);
  });
  window.scrollTo(0,0);
  if(id==='coach')renderCoachList();
  if(id==='workout')initWorkoutPage();
  if(id==='stats'){prefillOvp();if(document.querySelector('.tbt.on')?.textContent==='Symmetry')calcSymmetry();}
  if(id==='profile'){renderAchievements();initComparisonDates();renderProfileGoalSelector();initUnitUI();setTimeout(()=>restoreAvatar(),50);}
}

// ── TOAST ─────────────────────────────────────────────────────
function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg;el.classList.add('show');
  clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2500);
}


