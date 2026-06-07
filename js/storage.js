// ── STORAGE — Supabase + localStorage fallback ────────────────────
// If logged in: reads/writes to Supabase (data syncs across devices)
// If not logged in: falls back to localStorage (works offline)

// ── HELPERS ───────────────────────────────────────────────────────
function _readDOM(){
  const g=id=>document.getElementById(id);
  return{
    profile:{
      weight:g('prof-weight')?.value,
      height:g('prof-height')?.value,
      age:g('prof-age')?.value,
      bf:g('prof-bf')?.value,
      gender:g('prof-gender')?.value,
    },
    health:{
      sleep:g('inp-sleep')?.value,
      energy:g('inp-energy')?.value,
      rhr:g('inp-rhr')?.value,
      hrv:g('inp-hrv')?.value,
    },
    bulk:{
      start:g('set-bulk-start')?.value,
      goal:g('set-bulk-goal')?.value,
    },
    name:g('set-name')?.value,
    goals:g('goals-list')?.innerHTML,
    displays:{
      weight:g('home-weight')?.innerHTML,
      rec:g('home-rec')?.innerHTML,
      recStatus:g('home-rec-status')?.textContent,
      recColor:g('home-rec-status')?.style.color,
      sleep:g('h-sleep')?.innerHTML,
      hrec:g('h-rec')?.innerHTML,
      rhr:g('h-rhr')?.innerHTML,
      hrv:g('h-hrv')?.innerHTML,
      chest:g('disp-chest')?.innerHTML,
      waist:g('disp-waist')?.innerHTML,
      hips:g('disp-hips')?.innerHTML,
      shoulders:g('disp-shoulders')?.innerHTML,
      lbicep:g('disp-lbicep')?.innerHTML,
      rbicep:g('disp-rbicep')?.innerHTML,
      lquad:g('disp-lquad')?.innerHTML,
      rquad:g('disp-rquad')?.innerHTML,
      lcalf:g('disp-lcalf')?.innerHTML,
      rcalf:g('disp-rcalf')?.innerHTML,
    }
  };
}

function _restoreDOM(s){
  const g=id=>document.getElementById(id);
  const set=(id,val)=>{const el=g(id);if(el&&val!=null)el.value=val;};
  const html=(id,val)=>{const el=g(id);if(el&&val)el.innerHTML=val;};
  const txt=(id,val)=>{const el=g(id);if(el&&val)el.textContent=val;};

  if(s.profile){
    set('prof-weight',s.profile.weight);
    set('prof-height',s.profile.height);
    set('prof-age',s.profile.age);
    set('prof-bf',s.profile.bf);
    if(s.profile.gender){set('prof-gender',s.profile.gender);state.gender=s.profile.gender;}
  }
  if(s.health){
    set('inp-sleep',s.health.sleep);
    set('inp-energy',s.health.energy);
    set('inp-rhr',s.health.rhr);
    set('inp-hrv',s.health.hrv);
  }
  if(s.bulk){
    set('set-bulk-start',s.bulk.start);
    set('set-bulk-goal',s.bulk.goal);
  }
  if(s.name)set('set-name',s.name);
  if(s.goals)html('goals-list',s.goals);

  const mFields=['neck','shoulders','upperchest','chest','lbicep-r','lbicep-f','rbicep-r','rbicep-f','lforearm','rforearm','lwrist','rwrist','waist','navel','hips','lquad','rquad','lham','rham','lcalf','rcalf'];
  mFields.forEach(f=>{const el=g('m-'+f);if(el&&state.measurements[f])el.value=state.measurements[f];});

  if(s.displays){
    const d=s.displays;
    html('home-weight',d.weight);html('home-rec',d.rec);
    if(d.recStatus){txt('home-rec-status',d.recStatus);const el=g('home-rec-status');if(el)el.style.color=d.recColor||'var(--muted)';}
    html('h-sleep',d.sleep);html('h-rec',d.hrec);html('h-rhr',d.rhr);html('h-hrv',d.hrv);
    html('disp-chest',d.chest);html('disp-waist',d.waist);html('disp-hips',d.hips);html('disp-shoulders',d.shoulders);
    html('disp-lbicep',d.lbicep);html('disp-rbicep',d.rbicep);
    html('disp-lquad',d.lquad);html('disp-rquad',d.rquad);
    html('disp-lcalf',d.lcalf);html('disp-rcalf',d.rcalf);
  }
  if(s.settings?.name){
    const el=g('p-name');if(el)el.textContent=s.settings.name.toUpperCase();
    const av=g('p-av');if(av)av.textContent=s.settings.name[0].toUpperCase();
    const il=g('inline-name');if(il)il.value=s.settings.name;
  }
  if(s.streak){
    html('home-streak',s.streak+'<span class="scard-unit">d</span>');
    const ps=g('p-streak');if(ps)ps.innerHTML=`<i class="ti ti-flame" style="font-size:14px"></i> ${s.streak} Day Streak`;
  }
  setTimeout(()=>{
    restoreAvatar();
    const pw=g('prof-stat-weight');if(pw&&state.weight)pw.textContent=state.weight.toFixed(1)+'kg';
    const ps=g('prof-stat-streak');if(ps)ps.textContent=state.streak||0;
    const pr=g('prof-stat-rec');if(pr&&state.recovery!==null)pr.textContent=state.recovery+'%';
  },50);
  updateGender();
}

// ── LOCAL STORAGE SAVE/LOAD (fallback) ───────────────────────────
function _saveLocal(){
  try{
    const dom=_readDOM();
    localStorage.setItem('traine_state',JSON.stringify({
      activeCoach:state.activeCoach,gender:state.gender,
      measurements:state.measurements,settings:state.settings,
      streak:state.streak,weight:state.weight,recovery:state.recovery,
      planState,nutritionLog:state.nutritionLog,
      nutritionTargets:state.nutritionTargets,macroSplit,
      hasSeenWelcome:state.hasSeenWelcome,
      hasSeenWorkoutGuide:state.hasSeenWorkoutGuide,
      avatarData:state.avatarData,unitSystem:state.unitSystem,
      goalTarget:state.goalTarget,
      nutritionDisclaimerAcknowledged:state.nutritionDisclaimerAcknowledged,
      hasSeenStrengthTest:state.hasSeenStrengthTest,
      ...dom,
      displayWeight:dom.displays.weight,displayRec:dom.displays.rec,
      displayRecStatus:dom.displays.recStatus,displayRecColor:dom.displays.recColor,
      hSleep:dom.displays.sleep,hRec:dom.displays.hrec,
      hRhr:dom.displays.rhr,hHrv:dom.displays.hrv,
      dispChest:dom.displays.chest,dispWaist:dom.displays.waist,
      dispHips:dom.displays.hips,dispShoulders:dom.displays.shoulders,
      dispLbicep:dom.displays.lbicep,dispRbicep:dom.displays.rbicep,
      dispLquad:dom.displays.lquad,dispRquad:dom.displays.rquad,
      dispLcalf:dom.displays.lcalf,dispRcalf:dom.displays.rcalf,
    }));
  }catch(e){console.log('Local save error',e);}
}

function _loadLocal(){
  try{
    const raw=localStorage.getItem('traine_state');
    if(!raw)return;
    const s=JSON.parse(raw);
    if(s.activeCoach&&COACHES[s.activeCoach]){state.activeCoach=s.activeCoach;activeCoach=COACHES[s.activeCoach];}
    if(s.gender)state.gender=s.gender;
    if(s.measurements)state.measurements=s.measurements;
    if(s.settings)state.settings=s.settings;
    if(s.streak)state.streak=s.streak;
    if(s.weight)state.weight=s.weight;
    if(s.recovery)state.recovery=s.recovery;
    if(s.planState)Object.assign(planState,s.planState);
    if(s.nutritionLog)state.nutritionLog=s.nutritionLog;
    if(s.nutritionTargets)state.nutritionTargets=s.nutritionTargets;
    if(s.macroSplit)Object.assign(macroSplit,s.macroSplit);
    if(s.hasSeenWelcome)state.hasSeenWelcome=s.hasSeenWelcome;
    if(s.hasSeenWorkoutGuide)state.hasSeenWorkoutGuide=s.hasSeenWorkoutGuide;
    if(s.avatarData)state.avatarData=s.avatarData;
    if(s.unitSystem)state.unitSystem=s.unitSystem;
    if(s.goalTarget)state.goalTarget=s.goalTarget;
    if(s.nutritionDisclaimerAcknowledged)state.nutritionDisclaimerAcknowledged=s.nutritionDisclaimerAcknowledged;
    if(s.hasSeenStrengthTest)state.hasSeenStrengthTest=s.hasSeenStrengthTest;
    _restoreDOM(s);
  }catch(e){console.log('Local load error',e);}
}

// ── SUPABASE SAVE ─────────────────────────────────────────────────
async function _saveSupabase(){
  const uid=currentUser?.id;
  if(!uid)return;
  const dom=_readDOM();

  // Upsert profile
  await _sb.from('profiles').upsert({
    id:uid,
    name:dom.name||state.settings?.name,
    gender:state.gender,
    unit_system:state.unitSystem,
    active_coach:state.activeCoach,
    settings:state.settings,
    goal_target:state.goalTarget,
    nutrition_targets:state.nutritionTargets,
    macro_split:macroSplit,
    has_seen_welcome:state.hasSeenWelcome,
    has_seen_workout_guide:state.hasSeenWorkoutGuide,
    has_seen_strength_test:state.hasSeenStrengthTest,
    nutrition_disclaimer_acknowledged:state.nutritionDisclaimerAcknowledged,
    avatar_data:state.avatarData,
    updated_at:new Date().toISOString(),
  });

  // Upsert plan state (entire planState object as JSON)
  await _sb.from('plan_state').upsert({
    id:uid,
    data:{
      ...planState,
      nutritionLog:state.nutritionLog,
      goals:dom.goals,
      displays:dom.displays,
    },
    updated_at:new Date().toISOString(),
  });

  // Upsert profile inputs
  await _sb.from('profile_inputs').upsert({
    id:uid,
    weight:parseFloat(dom.profile.weight)||state.weight,
    height:parseFloat(dom.profile.height),
    age:parseInt(dom.profile.age),
    bf:parseFloat(dom.profile.bf),
    sleep:parseFloat(dom.health.sleep),
    energy:parseFloat(dom.health.energy),
    rhr:parseFloat(dom.health.rhr),
    hrv:parseFloat(dom.health.hrv),
    bulk_start:parseFloat(dom.bulk.start),
    bulk_goal:parseFloat(dom.bulk.goal),
    streak:state.streak,
    recovery:state.recovery,
    measurements:state.measurements,
    updated_at:new Date().toISOString(),
  });

  // Upsert today's log entries
  const today_=new Date().toISOString().split('T')[0];
  if(state.weight)
    await _sb.from('weight_log').upsert({user_id:uid,value:state.weight,date:today_},{onConflict:'user_id,date'});
  if(state.recovery!=null)
    await _sb.from('rec_log').upsert({user_id:uid,value:state.recovery,date:today_},{onConflict:'user_id,date'});
}

// ── SUPABASE LOAD ─────────────────────────────────────────────────
async function _loadSupabase(){
  const uid=currentUser?.id;
  if(!uid)return false;

  const[{data:prof},{data:plan},{data:inputs}]=await Promise.all([
    _sb.from('profiles').select('*').eq('id',uid).single(),
    _sb.from('plan_state').select('*').eq('id',uid).single(),
    _sb.from('profile_inputs').select('*').eq('id',uid).single(),
  ]);

  if(!prof&&!plan)return false; // new user, nothing saved yet

  if(prof){
    if(prof.active_coach&&COACHES[prof.active_coach]){state.activeCoach=prof.active_coach;activeCoach=COACHES[prof.active_coach];}
    if(prof.gender)state.gender=prof.gender;
    if(prof.unit_system)state.unitSystem=prof.unit_system;
    if(prof.settings)state.settings=prof.settings;
    if(prof.goal_target)state.goalTarget=prof.goal_target;
    if(prof.nutrition_targets)state.nutritionTargets=prof.nutrition_targets;
    if(prof.macro_split)Object.assign(macroSplit,prof.macro_split);
    if(prof.has_seen_welcome)state.hasSeenWelcome=prof.has_seen_welcome;
    if(prof.has_seen_workout_guide)state.hasSeenWorkoutGuide=prof.has_seen_workout_guide;
    if(prof.has_seen_strength_test)state.hasSeenStrengthTest=prof.has_seen_strength_test;
    if(prof.nutrition_disclaimer_acknowledged)state.nutritionDisclaimerAcknowledged=prof.nutrition_disclaimer_acknowledged;
    if(prof.avatar_data)state.avatarData=prof.avatar_data;
  }

  if(plan?.data){
    const d=plan.data;
    Object.assign(planState,d);
    if(d.nutritionLog)state.nutritionLog=d.nutritionLog;
    // Build restore object for DOM
    const restoreObj={
      settings:prof,
      name:prof?.name,
      goals:d.goals,
      displays:d.displays,
      profile:{},
      health:{},
      bulk:{},
    };
    _restoreDOM(restoreObj);
  }

  if(inputs){
    state.streak=inputs.streak||0;
    state.weight=inputs.weight;
    state.recovery=inputs.recovery;
    if(inputs.measurements)state.measurements=inputs.measurements;
    const restoreInputs={
      profile:{weight:inputs.weight,height:inputs.height,age:inputs.age,bf:inputs.bf,gender:state.gender},
      health:{sleep:inputs.sleep,energy:inputs.energy,rhr:inputs.rhr,hrv:inputs.hrv},
      bulk:{start:inputs.bulk_start,goal:inputs.bulk_goal},
      streak:inputs.streak,
      settings:prof,
      name:prof?.name,
    };
    _restoreDOM(restoreInputs);
  }

  return true;
}

// ── PUBLIC API ────────────────────────────────────────────────────
// Debounced save — don't hammer Supabase on every keystroke
let _saveTimer=null;
function saveData(){
  _saveLocal(); // always save locally for instant restore
  if(!isLoggedIn())return;
  clearTimeout(_saveTimer);
  _saveTimer=setTimeout(()=>_saveSupabase().catch(e=>console.log('Supabase save error',e)),1500);
}

async function loadData(){
  if(isLoggedIn()){
    const loaded=await _loadSupabase().catch(e=>{console.log('Supabase load error',e);return false;});
    if(!loaded)_loadLocal(); // new user or error — try local
  } else {
    _loadLocal();
  }
}

// ── INIT ──────────────────────────────────────────────────────────
(async()=>{
  initHome();
  const loggedIn=await initAuth();
  await loadData();
  renderCoachList();
  updateGender();
  initWorkoutPage();
  checkGoalResets();
  renderDirectiveBoard();
  initUnitUI();
  updateProgressBar();
  if(!planState.plan&&!state.weight&&!state.hasSeenWelcome){
    state.hasSeenWelcome=true;
    saveData();
    setTimeout(()=>{document.getElementById('welcome-modal').classList.add('open');},300);
  }
})();
