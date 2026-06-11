// ── SETTINGS ──────────────────────────────────────────────────
function openGoalTargetModal(){
  const goal=planState.goal||'mass';
  const modal=document.getElementById('goal-target-modal');
  const title=document.getElementById('goal-target-title');
  const body=document.getElementById('goal-target-body');
  const w=wtUnit();
  const goalLabels={mass:'Build Mass',strength:'Strength',fatloss:'Fat Loss',recomp:'Recomp',maintenance:'Maintenance',endurance:'Endurance'};
  title.textContent='TARGET — '+goalLabels[goal];

  const curW=state.weight||parseFloat(document.getElementById('prof-weight')?.value)||0;
  const curBF=state.bfLog.length?state.bfLog[state.bfLog.length-1].value:
              parseFloat(document.getElementById('prof-bf')?.value)||null;
  const startWVal=curW?inputWt(curW):'';
  const startBFVal=state.goalTarget?.startBF||curBF||'';
  const targetBFVal=state.goalTarget?.targetBF||'';
  const targetWVal=state.goalTarget?.targetWeight?inputWt(state.goalTarget.targetWeight):'';

  // Goal-specific context
  const goalCtx={
    mass:{    bfDir:'up',   bfNote:'Bulking adds some fat — estimate your BF% at target weight.',       bfPh:'18',  wPh:isImperial()?'198':'90',  wNote:'Target weight for lean bulk'},
    strength:{bfDir:'up',   bfNote:'Strength bulk — similar to mass, some fat gain is expected.',       bfPh:'18',  wPh:isImperial()?'198':'90',  wNote:'Target weight for strength phase'},
    fatloss:{ bfDir:'down', bfNote:'Enter your target BF% and we calculate the weight automatically.', bfPh:'12',  wPh:isImperial()?'165':'75',  wNote:'Auto-calculated from BF% target'},
    recomp:{  bfDir:'down', bfNote:'Recomp: lose fat, gain muscle. Weight barely changes, BF% drops.',  bfPh:'15',  wPh:isImperial()?'185':'84',  wNote:'May stay similar to current weight'},
    maintenance:{bfDir:'',  bfNote:'Maintenance: keep your current composition stable.',                bfPh:String(curBF||18), wPh:startWVal,wNote:'Stay within 1-2kg of this'},
    endurance:{bfDir:'down',bfNote:'Endurance athletes typically aim for lower BF% for performance.',   bfPh:'12',  wPh:isImperial()?'165':'75',  wNote:'Performance-optimised weight'},
  };
  const ctx=goalCtx[goal]||goalCtx.mass;

  // Bulk BF% estimate: if user enters target weight, estimate BF% assuming 40% of gain is fat
  let bulkBFEstimate='';
  if(['mass','strength'].includes(goal)&&curW&&curBF&&targetWVal){
    const targetWkg=parseWt(targetWVal);
    if(targetWkg>curW){
      const weightGain=targetWkg-curW;
      const fatGain=weightGain*0.4;// 40% of bulk weight gain is fat (natural estimate)
      const newFatMass=curW*(curBF/100)+fatGain;
      const estBF=Math.round((newFatMass/targetWkg)*100*10)/10;
      bulkBFEstimate=estBF;
    }
  }

  body.innerHTML=`
    ${curW&&curBF?`<div style="background:var(--bg3);border-left:2px solid var(--gold);padding:10px 12px;margin-bottom:12px;font-size:12px;color:var(--muted2);line-height:1.7">
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:var(--gold);text-transform:uppercase;margin-bottom:6px">Your Current Stats</div>
      Weight: <strong style="color:var(--text)">${dispWt(curW)}</strong> · BF%: <strong style="color:var(--text)">${curBF}%</strong> · Lean mass: <strong style="color:var(--text)">${dispWt(Math.round(curW*(1-curBF/100)*10)/10)}</strong>
      ${['fatloss','recomp'].includes(goal)?`<div style="margin-top:6px;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:10px">${[10,12,15,18].map(bf=>{const lean=curW*(1-curBF/100);const tw=Math.round(lean/(1-bf/100)*10)/10;return`<div style="background:var(--bg2);padding:5px;text-align:center"><div style="color:var(--gold)">${bf}%</div><div style="color:var(--text)">${dispWt(tw)}</div></div>`;}).join('')}</div>`:''}
    </div>`:''}

    <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px">Body Fat % Target</div>
    <div style="font-size:11px;color:var(--muted2);margin-bottom:10px;line-height:1.5">${ctx.bfNote}</div>
    <div class="modal-row"><div class="modal-lbl">Current BF%</div><input class="modal-in" id="gt-start-bf" type="number" inputmode="decimal" step="0.1" value="${startBFVal}" placeholder="${curBF||'20'}" oninput="liveCalcTargetW()"/></div>
    <div class="modal-row"><div class="modal-lbl">Target BF%</div><input class="modal-in" id="gt-target-bf" type="number" inputmode="decimal" step="0.1" value="${targetBFVal}" placeholder="${ctx.bfPh}" oninput="liveCalcTargetW()"/></div>

    <div id="bf-to-weight-preview" style="background:var(--bg3);border-left:2px solid var(--gold);padding:10px 12px;margin:10px 0;font-size:12px;color:var(--muted2);display:none">
      <span id="bf-preview-label">At target BF%:</span> <strong id="bf-calc-result" style="color:var(--gold)"></strong>
      <div id="bf-calc-lean" style="font-size:10px;color:var(--muted);margin-top:3px"></div>
    </div>

    <div style="height:1px;background:rgba(255,255,255,0.07);margin:14px 0"></div>
    <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px">Weight Target</div>
    <div class="modal-row"><div class="modal-lbl">Starting Weight (${w})</div><input class="modal-in" id="gt-start-w" type="number" inputmode="decimal" step="0.1" value="${startWVal}" placeholder="${isImperial()?'176':'80'}"/></div>
    <div class="modal-row"><div class="modal-lbl">Target Weight (${w})</div><input class="modal-in" id="gt-target-w" type="number" inputmode="decimal" step="0.1" value="${targetWVal}" placeholder="${ctx.wPh}" oninput="liveCalcBFFromWeight()"/></div>
    <div style="font-size:11px;color:var(--muted2);margin-top:4px">${ctx.wNote}</div>
    <div id="w-to-bf-preview" style="background:var(--bg3);border-left:2px solid var(--orange);padding:10px 12px;margin-top:10px;font-size:12px;color:var(--muted2);display:${bulkBFEstimate?'block':'none'}">
      At <strong id="w-calc-result" style="color:var(--orange)">${bulkBFEstimate?bulkBFEstimate+'%':''}</strong> estimated BF at target weight
      <div id="w-calc-note" style="font-size:10px;color:var(--muted);margin-top:3px">${bulkBFEstimate?`Assuming ~40% of weight gain is fat (natural bulking estimate)`:''}
      </div>
    </div>
    <div style="font-size:11px;color:var(--muted2);margin-top:10px;line-height:1.5">Both progress bars update — weight bar tracks kg, BF% bar tracks body fat.</div>`;

  modal.classList.add('open');
  if(startBFVal&&targetBFVal)liveCalcTargetW();
  if(targetWVal&&['mass','strength','endurance','maintenance'].includes(goal))liveCalcBFFromWeight();
}

// BF% → weight (for fat loss, recomp, endurance)
function liveCalcTargetW(){
  const sbEl=document.getElementById('gt-start-bf');
  const tbEl=document.getElementById('gt-target-bf');
  const twEl=document.getElementById('gt-target-w');
  const preview=document.getElementById('bf-to-weight-preview');
  const result=document.getElementById('bf-calc-result');
  const leanEl=document.getElementById('bf-calc-lean');
  const label=document.getElementById('bf-preview-label');
  if(!sbEl||!tbEl)return;
  const startBF=parseFloat(sbEl.value);
  const targetBF=parseFloat(tbEl.value);
  const curW=state.weight||parseFloat(document.getElementById('prof-weight')?.value);
  const goal=planState.goal||'mass';
  if(!startBF||!targetBF||!curW){if(preview)preview.style.display='none';return;}
  const lean=Math.round(curW*(1-startBF/100)*10)/10;

  if(['mass','strength'].includes(goal)){
    // For bulk: if target BF% is given, what weight would you be at that BF% with same lean mass?
    // (useful for lean bulk — stay at X% BF while gaining muscle)
    const targetWkg=Math.round(lean/(1-targetBF/100)*10)/10;
    const displayW=isImperial()?+(targetWkg*KG_TO_LBS).toFixed(1):targetWkg;
    if(twEl&&!twEl.value)twEl.value=displayW;
    if(preview)preview.style.display='block';
    if(label)label.textContent=`At ${targetBF}% BF with current lean mass:`;
    if(result)result.textContent=displayW+' '+wtUnit();
    if(leanEl)leanEl.textContent=`Lean mass stays at ${dispWt(lean)} — only fat % changes`;
  } else if(['fatloss','recomp','endurance'].includes(goal)){
    // Fat loss: lean mass stays same, fat drops
    const targetWkg=Math.round(lean/(1-targetBF/100)*10)/10;
    const displayW=isImperial()?+(targetWkg*KG_TO_LBS).toFixed(1):targetWkg;
    if(twEl)twEl.value=displayW;
    const fatLost=Math.round((curW-targetWkg)*10)/10;
    if(preview)preview.style.display='block';
    if(label)label.textContent=`At ${targetBF}% BF you'll weigh:`;
    if(result)result.textContent=displayW+' '+wtUnit();
    if(leanEl)leanEl.textContent=`Lean mass: ${dispWt(lean)} preserved · Fat to lose: ~${dispWt(Math.max(0,fatLost))}`;
  } else {
    if(preview)preview.style.display='none';
  }
}

// Weight → BF% estimate (for bulk/strength — entering target weight estimates resulting BF%)
function liveCalcBFFromWeight(){
  const twEl=document.getElementById('gt-target-w');
  const sbEl=document.getElementById('gt-start-bf');
  const preview=document.getElementById('w-to-bf-preview');
  const result=document.getElementById('w-calc-result');
  const note=document.getElementById('w-calc-note');
  const goal=planState.goal||'mass';
  if(!['mass','strength','maintenance','endurance'].includes(goal)){if(preview)preview.style.display='none';return;}
  if(!twEl||!sbEl)return;
  const targetWkg=parseWt(twEl.value);
  const startBF=parseFloat(sbEl.value)||parseFloat(document.getElementById('prof-bf')?.value)||20;
  const curW=state.weight||parseFloat(document.getElementById('prof-weight')?.value);
  if(!targetWkg||!curW){if(preview)preview.style.display='none';return;}

  let estBF,noteText;
  if(['mass','strength'].includes(goal)){
    if(targetWkg<=curW){if(preview)preview.style.display='none';return;}
    const weightGain=targetWkg-curW;
    const curFatMass=curW*(startBF/100);
    const fatGain=weightGain*0.40;// ~40% of bulk is fat (natural estimate)
    const newFatMass=curFatMass+fatGain;
    estBF=Math.round((newFatMass/targetWkg)*100*10)/10;
    noteText=`Assuming ~40% of gain (${dispWt(fatGain)}) is fat — natural bulking estimate`;
  } else if(goal==='maintenance'){
    const lean=curW*(1-startBF/100);
    estBF=Math.round(((targetWkg-lean)/targetWkg)*100*10)/10;
    noteText='Estimated BF% at this weight with current lean mass';
  } else {
    if(preview)preview.style.display='none';return;
  }
  estBF=Math.max(3,Math.min(50,estBF));
  // Auto-fill BF target field
  const tbEl=document.getElementById('gt-target-bf');
  if(tbEl&&!tbEl.value)tbEl.value=estBF.toFixed(1);
  if(preview)preview.style.display='block';
  if(result)result.textContent=estBF.toFixed(1)+'%';
  if(note)note.textContent=noteText;
}

function saveGoalTarget(){
  const goal=planState.goal||'mass';
  if(!state.goalTarget)state.goalTarget={};

  const swEl=document.getElementById('gt-start-w');
  const twEl=document.getElementById('gt-target-w');
  const sbEl=document.getElementById('gt-start-bf');
  const tbEl=document.getElementById('gt-target-bf');

  if(swEl?.value)state.goalTarget.startWeight=parseWt(swEl.value);
  if(twEl?.value)state.goalTarget.targetWeight=parseWt(twEl.value);
  if(sbEl?.value)state.goalTarget.startBF=parseFloat(sbEl.value);
  if(tbEl?.value)state.goalTarget.targetBF=parseFloat(tbEl.value);
  state.goalTarget.goal=goal;

  // Auto-calculate target weight from target BF% if weight not manually set
  if(state.goalTarget.targetBF&&!twEl?.value){
    const curW=state.weight||parseFloat(document.getElementById('prof-weight')?.value);
    const startBF=state.goalTarget.startBF;
    if(curW&&startBF){
      const leanMass=Math.round(curW*(1-startBF/100)*10)/10;
      const calcTargetW=Math.round(leanMass/(1-state.goalTarget.targetBF/100)*10)/10;
      state.goalTarget.targetWeight=calcTargetW;
      state.goalTarget.startWeight=state.goalTarget.startWeight||curW;
      toast(`Auto-calc: lean mass ${dispWt(leanMass)} → at ${state.goalTarget.targetBF}% BF = ${dispWt(calcTargetW)}`);
    }
  }
  // Also auto-set start weight if not set
  if(!state.goalTarget.startWeight&&state.weight){
    state.goalTarget.startWeight=state.weight;
  }

  document.getElementById('goal-target-modal').classList.remove('open');
  updateProgressBar();
  saveData();
  toast('Target saved ✓');
}

// Goal-aware dual progress bars
function updateProgressBar(){
  const goal=planState.goal||'mass';
  const target=state.goalTarget;
  const progLabel=document.getElementById('progress-label');
  const noTarget=document.getElementById('progress-no-target');
  const labels={mass:'Bulk Progress',strength:'Strength Progress',fatloss:'Cut Progress',recomp:'Recomp Progress',maintenance:'Maintenance Progress',endurance:'Endurance Progress'};
  if(progLabel)progLabel.textContent=labels[goal]||'Goal Progress';

  const hasWeightTarget=target?.targetWeight;
  const hasBFTarget=target?.targetBF&&target?.startBF;
  if(!hasWeightTarget&&!hasBFTarget){
    if(noTarget)noTarget.style.display='block';
    const nw=document.getElementById('bulk-now-lbl');
    if(nw)nw.textContent=state.weight?dispWt(state.weight):'—';
    const ns=document.getElementById('bulk-start-lbl');if(ns)ns.textContent='—';
    const ng=document.getElementById('bulk-goal-lbl');if(ng)ng.textContent='Set target';
    const bfs=document.getElementById('prog-bf-section');if(bfs)bfs.style.display='none';
    return;
  }
  if(noTarget)noTarget.style.display='none';

  // WEIGHT BAR
  const weightSection=document.getElementById('prog-weight-section');
  if(hasWeightTarget){
    if(weightSection)weightSection.style.display='block';
    const sw=target.startWeight||state.weight||target.targetWeight;
    const tw=target.targetWeight;
    const now=state.weight||sw;
    const total=Math.abs(tw-sw);
    const done=Math.abs(now-sw);
    const pct=total>0?Math.min(100,Math.max(0,(done/total)*100)):0;
    const fill=document.getElementById('bulk-prog');
    if(fill){fill.style.width=pct.toFixed(0)+'%';fill.style.background=pct>=100?'var(--green)':'var(--gold)';}
    const sl=document.getElementById('bulk-start-lbl');
    const gl=document.getElementById('bulk-goal-lbl');
    const nl=document.getElementById('bulk-now-lbl');
    if(sl)sl.textContent=dispWt(sw);
    if(gl)gl.textContent=dispWt(tw);
    if(nl)nl.textContent=dispWt(now);
  } else {
    if(weightSection)weightSection.style.display='none';
  }

  // BF% BAR
  const bfSection=document.getElementById('prog-bf-section');
  if(hasBFTarget){
    if(bfSection)bfSection.style.display='block';
    const startBF=target.startBF;
    const targetBF=target.targetBF;
    const curBF=state.bfLog.length?state.bfLog[state.bfLog.length-1].value:startBF;
    const total=Math.abs(startBF-targetBF);
    const done=Math.abs(startBF-curBF);
    const pct=total>0?Math.min(100,Math.max(0,(done/total)*100)):0;
    const fill=document.getElementById('bf-prog');
    if(fill){fill.style.width=pct.toFixed(0)+'%';fill.style.background=pct>=100?'var(--green)':'var(--orange)';}
    const sl=document.getElementById('bf-start-lbl');
    const gl=document.getElementById('bf-goal-lbl');
    const nl=document.getElementById('bf-now-lbl');
    if(sl)sl.textContent=startBF.toFixed(1)+'%';
    if(gl)gl.textContent=targetBF+'%';
    if(nl)nl.textContent=curBF.toFixed(1)+'%';
  } else {
    if(bfSection)bfSection.style.display='none';
  }
}

function openSettings(){document.getElementById('settings-modal').classList.add('open');}
function saveSettings(){
  const name=document.getElementById('set-name').value.trim();
  const bs=parseFloat(document.getElementById('set-bulk-start').value);
  const bg=parseFloat(document.getElementById('set-bulk-goal').value);
  if(name)applyName(name);
  if(bs)state.settings.bulkStart=bs;
  if(bg)state.settings.bulkGoal=bg;
  document.getElementById('settings-modal').classList.remove('open');
  updateProgressBar();
  toast('Settings saved');saveData();
}

function applyName(name){
  state.settings.name=name;
  // Sync all name displays
  const pn=document.getElementById('p-name');if(pn)pn.textContent=name.toUpperCase();
  const il=document.getElementById('inline-name');if(il&&il.value!==name)il.value=name;
  const sn=document.getElementById('set-name');if(sn&&sn.value!==name)sn.value=name;
  const av=document.getElementById('p-av-letter');if(av)av.textContent=name[0]?.toUpperCase()||'?';
  // Update home coach name display
  const hcn=document.getElementById('home-coach-name');if(hcn)hcn.textContent=activeCoach.name;
}

function saveInlineName(inp){
  const name=inp.value.trim();
  if(name)applyName(name);
  saveData();
}

function handleAvatarUpload(input){
  const file=input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    // Resize to max 200x200 before storing — keeps it small for Supabase
    const imgEl=new Image();
    imgEl.onload=()=>{
      const canvas=document.createElement('canvas');
      const MAX=200;
      let w=imgEl.width,h=imgEl.height;
      if(w>h){if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}}
      else{if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}}
      canvas.width=w;canvas.height=h;
      canvas.getContext('2d').drawImage(imgEl,0,0,w,h);
      const resized=canvas.toDataURL('image/jpeg',0.8);
      state.avatarData=resized;
      const img=document.getElementById('p-av-img');
      const letter=document.getElementById('p-av-letter');
      if(img){img.src=resized;img.style.display='block';}
      if(letter)letter.style.display='none';
      saveData();
      toast('Profile photo updated');
    };
    imgEl.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

function restoreAvatar(){
  if(!state.avatarData)return;
  const img=document.getElementById('p-av-img');
  const letter=document.getElementById('p-av-letter');
  if(img){img.src=state.avatarData;img.style.display='block';}
  if(letter)letter.style.display='none';
}

// Render goal selector cards on profile page
function renderProfileGoalSelector(){
  const el=document.getElementById('profile-goal-selector');
  if(!el)return;
  const goals=[
    {id:'mass',    icon:'ti-barbell', label:'Build Mass',    sub:'Bulk + high carbs'},
    {id:'strength',icon:'ti-trophy',  label:'Strength',      sub:'Bulk + compounds'},
    {id:'fatloss', icon:'ti-flame',   label:'Fat Loss',      sub:'Cut + high protein'},
    {id:'recomp',  icon:'ti-refresh', label:'Recomp',        sub:'Balanced + high protein'},
    {id:'maintenance',icon:'ti-equal',label:'Maintenance',   sub:'TDEE match'},
    {id:'endurance',icon:'ti-run',    label:'Endurance',     sub:'Very high carbs'},
  ];
  const current=planState.goal||'mass';
  el.innerHTML=goals.map(g=>`
    <div onclick="selectProfileGoal('${g.id}')" style="background:var(--bg3);border:1px solid ${g.id===current?'var(--gold)':'rgba(255,255,255,0.07)'};border-radius:0;padding:10px 12px;cursor:pointer;transition:border-color .15s;${g.id===current?'background:var(--gold-dim)':''}">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
        <i class="ti ${g.icon}" style="font-size:14px;color:${g.id===current?'var(--gold)':'var(--muted)'}"></i>
        <span style="font-size:12px;font-weight:700;color:${g.id===current?'var(--gold)':'var(--text)'}">${g.label}</span>
      </div>
      <div style="font-size:10px;color:var(--muted)">${g.sub}</div>
    </div>`).join('');
  updateGoalCalPreview();
}

function selectProfileGoal(goal){
  planState.goal=goal;
  renderProfileGoalSelector();
  if(planState.plan)rebuildPlanKeepHistory();
  updateProgressBar();
  // Show recommendation card
  const rec=DAYS_REC[goal];
  if(rec){
    const preview=document.getElementById('goal-calorie-preview');
    if(preview){
      preview.style.display='block';
      const currentDays=planState.days||4;
      const dayMatch=currentDays===rec.days;
      preview.innerHTML=`<div style="margin-bottom:8px"><strong style="color:var(--gold)">📅 Recommended: ${rec.days} days/week</strong><br><span style="font-size:11px">${rec.why}</span></div>
        ${!dayMatch?`<div style="font-size:11px;color:var(--orange);margin-bottom:8px">Your current plan uses ${currentDays} days/week. Consider rebuilding your plan with ${rec.days} days for better results.</div>`:''}
        <button onclick="goPage('workout')" style="background:none;border:1px solid var(--gold-bdr);padding:4px 12px;font-size:11px;font-weight:600;color:var(--gold);cursor:pointer;font-family:var(--fb);margin-bottom:8px">REBUILD PLAN WITH ${rec.days} DAYS →</button><br>
        ${updateGoalCalPreviewHTML(goal)}`;
    }
  } else {
    updateGoalCalPreview();
  }
  saveData();
  toast('Goal updated to '+goal+' — plan adjusted');
}

function updateGoalCalPreviewHTML(goal){
  const w=parseFloat(document.getElementById('prof-weight')?.value)||state.weight||0;
  if(!w)return '';
  const days=planState.days||4;
  const bf=parseFloat(document.getElementById('prof-bf')?.value)||null;
  const gender=document.getElementById('prof-gender')?.value||state.gender||'m';
  const h=parseFloat(document.getElementById('prof-height')?.value)||null;
  const age=parseFloat(document.getElementById('prof-age')?.value)||null;
  const lean=estLean(w,bf,gender);
  const bmr=calcBMR(w,h,age,gender,bf);
  const act=days>=6?1.725:days>=5?1.65:days>=4?1.55:days>=3?1.45:1.375;
  const tdee=Math.round(bmr*act);
  let kcal,surplus;
  if(goal==='mass'||goal==='strength'){kcal=tdee+300;surplus='+300 kcal bulk';}
  else if(goal==='fatloss'){kcal=tdee-400;surplus='−400 kcal cut';}
  else if(goal==='endurance'){kcal=tdee+100;surplus='+100 kcal';}
  else{kcal=tdee;surplus='maintenance';}
  const preset=GOAL_MACROS[goal]||GOAL_MACROS.maintenance;
  const prot=Math.round(lean*protPerKgLean(gender,goal));
  const fat=Math.round(kcal*(preset.fat/100)/9);
  const carb=Math.max(0,Math.round((kcal-prot*4-fat*9)/4));
  return `<strong style="color:var(--gold)">${kcal} kcal/day</strong> · ${surplus} · P: ${prot}g · C: ${carb}g · F: ${fat}g<br><span style="font-size:10px;color:var(--muted)">${preset.rationale}</span><br><button onclick="goPage('profile');setTimeout(calcNutrition,100)" style="margin-top:6px;background:var(--gold);border:none;padding:5px 12px;font-family:var(--ff);font-size:14px;color:var(--bg);cursor:pointer">Calculate Full Targets →</button>`;
}

function updateGoalCalPreview(){
  const el=document.getElementById('goal-calorie-preview');
  if(!el)return;
  const w=parseFloat(document.getElementById('prof-weight')?.value)||state.weight||0;
  if(!w){el.style.display='none';return;}
  const goal=planState.goal||'mass';
  const days=planState.days||4;
  const bf=parseFloat(document.getElementById('prof-bf')?.value)||null;
  const gender=document.getElementById('prof-gender')?.value||state.gender||'m';
  const h=parseFloat(document.getElementById('prof-height')?.value)||null;
  const age=parseFloat(document.getElementById('prof-age')?.value)||null;
  const lean=estLean(w,bf,gender);
  const bmr=calcBMR(w,h,age,gender,bf);
  const act=days>=6?1.725:days>=5?1.65:days>=4?1.55:days>=3?1.45:1.375;
  const tdee=Math.round(bmr*act);
  let kcal,surplus;
  if(goal==='mass'||goal==='strength'){kcal=tdee+300;surplus='+300 kcal bulk';}
  else if(goal==='fatloss'){kcal=tdee-400;surplus='−400 kcal cut';}
  else if(goal==='endurance'){kcal=tdee+100;surplus='+100 kcal';}
  else{kcal=tdee;surplus='maintenance';}
  const preset=GOAL_MACROS[goal]||GOAL_MACROS.maintenance;
  const prot=Math.round(lean*protPerKgLean(gender,goal));
  const fat=Math.round(kcal*(preset.fat/100)/9);
  const carb=Math.round((kcal-prot*4-fat*9)/4);
  el.style.display='block';
  el.innerHTML=`<strong style="color:var(--gold)">${kcal} kcal/day</strong> · ${surplus} · P: ${prot}g · C: ${Math.max(0,carb)}g · F: ${fat}g<br><span style="font-size:10px;color:var(--muted)">${preset.rationale}</span><br><button onclick="goPage('profile');setTimeout(calcNutrition,100)" style="margin-top:6px;background:var(--gold);border:none;padding:5px 12px;font-family:var(--ff);font-size:14px;color:var(--bg);cursor:pointer">Calculate Full Targets →</button>`;
}

// ── HOME ──────────────────────────────────────────────────────
function initHome(){
  const g=document.getElementById('home-greet');
  if(g){
    const hr=new Date().getHours();
    const part=hr<5?'Late night':hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
    const nm=state.settings?.name;
    g.innerHTML=nm?`${part}, <b>${nm}</b> — ready to train?`:`${part} — ready to train?`;
  }

  const d=new Date();
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('home-date').textContent=`${days[d.getDay()]} · ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  // data-driven insight (after load)
  setTimeout(()=>{try{document.getElementById('insight-text').textContent=generateInsight();}catch(e){}},50);
}

