// ── LOCALSTORAGE ───────────────────────────────────────────────
function saveData(){
  try{
    localStorage.setItem('traine_state',JSON.stringify({
      activeCoach:state.activeCoach,
      gender:state.gender,
      measurements:state.measurements,
      settings:state.settings,
      streak:state.streak,
      weight:state.weight,
      recovery:state.recovery,
      profile:{
        weight:document.getElementById('prof-weight').value,
        height:document.getElementById('prof-height').value,
        age:document.getElementById('prof-age').value,
        bf:document.getElementById('prof-bf').value,
        gender:document.getElementById('prof-gender').value
      },
      health:{
        sleep:document.getElementById('inp-sleep').value,
        energy:document.getElementById('inp-energy').value,
        rhr:document.getElementById('inp-rhr').value,
        hrv:document.getElementById('inp-hrv').value
      },
      bulk:{
        start:document.getElementById('set-bulk-start').value,
        goal:document.getElementById('set-bulk-goal').value
      },
      name:document.getElementById('set-name').value,
      goals:document.getElementById('goals-list').innerHTML,
      planState:planState,
      nutritionLog:state.nutritionLog,
      nutritionTargets:state.nutritionTargets,
      macroSplit:macroSplit,
      hasSeenWelcome:state.hasSeenWelcome,
      hasSeenWorkoutGuide:state.hasSeenWorkoutGuide,
      avatarData:state.avatarData,
      unitSystem:state.unitSystem,
      goalTarget:state.goalTarget,
      nutritionDisclaimerAcknowledged:state.nutritionDisclaimerAcknowledged,
      hasSeenStrengthTest:state.hasSeenStrengthTest,
      displayWeight:document.getElementById('home-weight').innerHTML,
      displayRec:document.getElementById('home-rec').innerHTML,
      displayRecStatus:document.getElementById('home-rec-status').textContent,
      displayRecColor:document.getElementById('home-rec-status').style.color,
      hSleep:document.getElementById('h-sleep').innerHTML,
      hRec:document.getElementById('h-rec').innerHTML,
      hRhr:document.getElementById('h-rhr').innerHTML,
      hHrv:document.getElementById('h-hrv').innerHTML,
      dispChest:document.getElementById('disp-chest').innerHTML,
      dispWaist:document.getElementById('disp-waist').innerHTML,
      dispHips:document.getElementById('disp-hips').innerHTML,
      dispShoulders:document.getElementById('disp-shoulders').innerHTML,
      dispLbicep:document.getElementById('disp-lbicep').innerHTML,
      dispRbicep:document.getElementById('disp-rbicep').innerHTML,
      dispLquad:document.getElementById('disp-lquad').innerHTML,
      dispRquad:document.getElementById('disp-rquad').innerHTML,
      dispLcalf:document.getElementById('disp-lcalf').innerHTML,
      dispRcalf:document.getElementById('disp-rcalf').innerHTML,
    }));
  }catch(e){console.log('Save error',e);}
}

function loadData(){
  try{
    const raw=localStorage.getItem('traine_state');
    if(!raw)return;
    const s=JSON.parse(raw);
    if(s.activeCoach&&COACHES[s.activeCoach]){
      state.activeCoach=s.activeCoach;
      activeCoach=COACHES[s.activeCoach];
    }
    if(s.gender)state.gender=s.gender;
    if(s.measurements)state.measurements=s.measurements;
    if(s.settings)state.settings=s.settings;
    if(s.streak)state.streak=s.streak;
    if(s.weight)state.weight=s.weight;
    if(s.recovery)state.recovery=s.recovery;
    // restore profile inputs
    if(s.profile){
      if(s.profile.weight)document.getElementById('prof-weight').value=s.profile.weight;
      if(s.profile.height)document.getElementById('prof-height').value=s.profile.height;
      if(s.profile.age)document.getElementById('prof-age').value=s.profile.age;
      if(s.profile.bf)document.getElementById('prof-bf').value=s.profile.bf;
      if(s.profile.gender){document.getElementById('prof-gender').value=s.profile.gender;state.gender=s.profile.gender;}
    }
    // restore health inputs
    if(s.health){
      if(s.health.sleep)document.getElementById('inp-sleep').value=s.health.sleep;
      if(s.health.energy)document.getElementById('inp-energy').value=s.health.energy;
      if(s.health.rhr)document.getElementById('inp-rhr').value=s.health.rhr;
      if(s.health.hrv)document.getElementById('inp-hrv').value=s.health.hrv;
    }
    // restore settings
    if(s.name){document.getElementById('set-name').value=s.name;}
    if(s.bulk){
      if(s.bulk.start)document.getElementById('set-bulk-start').value=s.bulk.start;
      if(s.bulk.goal)document.getElementById('set-bulk-goal').value=s.bulk.goal;
    }
    // restore measurement inputs
    const mFields=['neck','shoulders','upperchest','chest','lbicep-r','lbicep-f','rbicep-r','rbicep-f','lforearm','rforearm','lwrist','rwrist','waist','navel','hips','lquad','rquad','lham','rham','lcalf','rcalf'];
    mFields.forEach(f=>{
      const el=document.getElementById('m-'+f);
      if(el&&state.measurements[f])el.value=state.measurements[f];
    });
    // restore displays
    if(s.displayWeight)document.getElementById('home-weight').innerHTML=s.displayWeight;
    if(s.displayRec)document.getElementById('home-rec').innerHTML=s.displayRec;
    if(s.displayRecStatus){document.getElementById('home-rec-status').textContent=s.displayRecStatus;document.getElementById('home-rec-status').style.color=s.displayRecColor||'var(--muted)';}
    if(s.hSleep)document.getElementById('h-sleep').innerHTML=s.hSleep;
    if(s.hRec)document.getElementById('h-rec').innerHTML=s.hRec;
    if(s.hRhr)document.getElementById('h-rhr').innerHTML=s.hRhr;
    if(s.hHrv)document.getElementById('h-hrv').innerHTML=s.hHrv;
    if(s.dispChest)document.getElementById('disp-chest').innerHTML=s.dispChest;
    if(s.dispWaist)document.getElementById('disp-waist').innerHTML=s.dispWaist;
    if(s.dispHips)document.getElementById('disp-hips').innerHTML=s.dispHips;
    if(s.dispShoulders)document.getElementById('disp-shoulders').innerHTML=s.dispShoulders;
    if(s.dispLbicep)document.getElementById('disp-lbicep').innerHTML=s.dispLbicep;
    if(s.dispRbicep)document.getElementById('disp-rbicep').innerHTML=s.dispRbicep;
    if(s.dispLquad)document.getElementById('disp-lquad').innerHTML=s.dispLquad;
    if(s.dispRquad)document.getElementById('disp-rquad').innerHTML=s.dispRquad;
    if(s.dispLcalf)document.getElementById('disp-lcalf').innerHTML=s.dispLcalf;
    if(s.dispRcalf)document.getElementById('disp-rcalf').innerHTML=s.dispRcalf;
    // restore name and streak
    if(s.settings.name){
      document.getElementById('p-name').textContent=s.settings.name.toUpperCase();
      document.getElementById('p-av').textContent=s.settings.name[0].toUpperCase();
    }
    if(s.streak){
      document.getElementById('home-streak').innerHTML=s.streak+'<span class="scard-unit">d</span>';
      document.getElementById('p-streak').innerHTML=`<i class="ti ti-flame" style="font-size:14px"></i> ${s.streak} Day Streak`;
    }
    if(s.goals)document.getElementById('goals-list').innerHTML=s.goals;
    if(s.planState){Object.assign(planState,s.planState);}
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
    // Restore inline name field
    if(s.settings?.name){const il=document.getElementById('inline-name');if(il)il.value=s.settings.name;}
    // Restore profile stats
    setTimeout(()=>{
      restoreAvatar();
      const pw=document.getElementById('prof-stat-weight');if(pw&&state.weight)pw.textContent=state.weight.toFixed(1)+'kg';
      const ps=document.getElementById('prof-stat-streak');if(ps)ps.textContent=state.streak||0;
      const pr=document.getElementById('prof-stat-rec');if(pr&&state.recovery!==null)pr.textContent=state.recovery+'%';
    },50);
    // Let updateProgressBar handle progress display — no more manual bulkStart/bulkGoal overrides
    updateGender();
  }catch(e){console.log('Load error',e);}
}

// ── INIT ──────────────────────────────────────────────────────
initHome();
loadData();
renderCoachList();
updateGender();
initWorkoutPage();
checkGoalResets();
renderDirectiveBoard();
initUnitUI();
updateProgressBar();
// Show welcome modal on very first launch
if(!planState.plan&&!state.weight&&!state.hasSeenWelcome){
  state.hasSeenWelcome=true;
  saveData();
  setTimeout(()=>{document.getElementById('welcome-modal').classList.add('open');},300);
}
