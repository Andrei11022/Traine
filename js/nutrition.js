
// ── NUTRITION ─────────────────────────────────────────────────
// Macro split state (percentages of calories from each macro)
// Goal-specific macro presets (% of calories)
const GOAL_MACROS={
  mass:       {prot:25, carb:50, fat:25, label:'High carb bulk',     rationale:'Higher carbs fuel heavy training and maximise muscle glycogen for intense sessions.'},
  strength:   {prot:28, carb:47, fat:25, label:'Strength bulk',      rationale:'Slightly higher protein to support neural and muscular adaptation under heavy load.'},
  fatloss:    {prot:40, carb:30, fat:30, label:'High protein cut',   rationale:'High protein preserves lean mass in a deficit. Lower carbs create the caloric deficit.'},
  recomp:     {prot:35, carb:38, fat:27, label:'Body recomp',        rationale:'High protein for muscle retention and growth. Moderate carbs on training days, lower on rest.'},
  maintenance:{prot:28, carb:45, fat:27, label:'Maintenance',        rationale:'Balanced macros to sustain current composition and performance.'},
  endurance:  {prot:20, carb:60, fat:20, label:'Endurance fuelling', rationale:'Very high carbs for glycogen replenishment and sustained aerobic performance.'},
};

let macroSplit={prot:30,carb:45,fat:25};

function calcNutrition(){
  const w=state.weight||parseFloat(document.getElementById('prof-weight')?.value)||80;
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
  if(goal==='mass'||goal==='strength'){kcal=tdee+300;surplus='Lean bulk (+300 kcal surplus)';}
  else if(goal==='fatloss'){kcal=tdee-400;surplus='Moderate deficit (−400 kcal)';}
  else if(goal==='endurance'){kcal=tdee+100;surplus='Light surplus for performance';}
  else{kcal=tdee;surplus='Maintenance (TDEE match)';}

  // Apply goal-specific macro preset
  const preset=GOAL_MACROS[goal]||GOAL_MACROS.maintenance;
  macroSplit={prot:preset.prot,carb:preset.carb,fat:preset.fat};

  // Show results + macro split UI
  document.getElementById('nutrition-results').style.display='block';

  // Render macro split sliders
  const splitEl=document.getElementById('macro-split-ui');
  if(splitEl){
    // Update slider values to match new preset
    const sp=document.getElementById('slider-prot');const sc=document.getElementById('slider-carb');const sf=document.getElementById('slider-fat');
    if(sp)sp.value=macroSplit.prot;if(sc)sc.value=macroSplit.carb;if(sf)sf.value=macroSplit.fat;
    renderMacroSplit(kcal,lean,goal,surplus,tdee,days);
  } else {
    // First time — inject slider UI
    const resultsEl=document.getElementById('nutrition-results');
    const sliderHTML=`
    <div style="background:var(--bg2);border-left:2px solid var(--gold-bdr);padding:14px 16px;margin-bottom:10px" id="macro-split-ui">
      <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:12px">Macro Split — adjust to your preference</div>
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted2);margin-bottom:4px">
          <span>🥩 Protein</span><span id="prot-pct-lbl">${macroSplit.prot}%</span>
        </div>
        <input type="range" id="slider-prot" min="15" max="50" value="${macroSplit.prot}" oninput="onMacroSlide('prot',this.value,${kcal},${lean},'${goal}','${surplus}',${tdee},${days})" style="width:100%;accent-color:var(--gold)"/>
      </div>
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted2);margin-bottom:4px">
          <span>🍚 Carbs</span><span id="carb-pct-lbl">${macroSplit.carb}%</span>
        </div>
        <input type="range" id="slider-carb" min="10" max="65" value="${macroSplit.carb}" oninput="onMacroSlide('carb',this.value,${kcal},${lean},'${goal}','${surplus}',${tdee},${days})" style="width:100%;accent-color:var(--blue)"/>
      </div>
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted2);margin-bottom:4px">
          <span>🥑 Fat</span><span id="fat-pct-lbl">${macroSplit.fat}%</span>
        </div>
        <input type="range" id="slider-fat" min="15" max="45" value="${macroSplit.fat}" oninput="onMacroSlide('fat',this.value,${kcal},${lean},'${goal}','${surplus}',${tdee},${days})" style="width:100%;accent-color:var(--orange)"/>
      </div>
      <div id="split-total-bar" style="height:8px;border-radius:4px;background:var(--bg3);overflow:hidden;display:flex;margin-bottom:6px"></div>
      <div id="split-warning" style="font-size:11px;color:var(--red);min-height:14px"></div>
      <div style="font-size:10px;color:var(--muted);margin-top:4px">Percentages don't need to total exactly 100% — fat is adjusted automatically. Protein is prioritised.</div>
    </div>`;
    resultsEl.insertAdjacentHTML('afterbegin',sliderHTML);
    renderMacroSplit(kcal,lean,goal,surplus,tdee,days);
  }
  state.nutritionTargets={kcal,...computeMacros(kcal,lean)};
  saveData();
}

function computeMacros(kcal,lean){
  const gender=document.getElementById('prof-gender')?.value||state.gender||'m';
  const goal=planState.goal||'mass';
  // Gender + goal aware protein: females need slightly less per kg lean mass
  const protPerKg=protPerKgLean(gender,goal);
  const protFromLean=Math.round(lean*protPerKg);
  const protFromSplit=Math.round(kcal*(macroSplit.prot/100)/4);
  const prot=Math.max(protFromLean,protFromSplit);
  const fat=Math.round(kcal*(macroSplit.fat/100)/9);
  const carb=Math.max(0,Math.round((kcal-prot*4-fat*9)/4));
  return{prot,carb,fat};
}

function renderMacroSplit(kcal,lean,goal,surplus,tdee,days){
  const{prot,carb,fat}=computeMacros(kcal,lean);
  document.getElementById('n-kcal').innerHTML=kcal+'<span class="mc-unit">kcal</span>';
  document.getElementById('n-prot').innerHTML=prot+'<span class="mc-unit">g</span>';
  document.getElementById('n-carb').innerHTML=carb+'<span class="mc-unit">g</span>';
  document.getElementById('n-fat').innerHTML=fat+'<span class="mc-unit">g</span>';
  // Update % labels
  const pl=document.getElementById('prot-pct-lbl');if(pl)pl.textContent=macroSplit.prot+'%';
  const cl=document.getElementById('carb-pct-lbl');if(cl)cl.textContent=macroSplit.carb+'%';
  const fl=document.getElementById('fat-pct-lbl');if(fl)fl.textContent=macroSplit.fat+'%';
  // Split bar
  const bar=document.getElementById('split-total-bar');
  if(bar){
    const total=macroSplit.prot+macroSplit.carb+macroSplit.fat;
    const warn=document.getElementById('split-warning');
    if(total>100){if(warn)warn.textContent='Total exceeds 100% — fat will be adjusted down.';}
    else if(total<80){if(warn)warn.textContent='Total is only '+total+'% — consider increasing carbs or fat.';}
    else{if(warn)warn.textContent='';}
    bar.innerHTML=`
      <div style="width:${macroSplit.prot}%;background:var(--gold);height:8px"></div>
      <div style="width:${macroSplit.carb}%;background:var(--blue);height:8px"></div>
      <div style="width:${macroSplit.fat}%;background:var(--orange);height:8px"></div>`;
  }
  // Advice
  const adv=document.getElementById('nutrition-advice');
  const preset=GOAL_MACROS[goal]||GOAL_MACROS.maintenance;
  if(adv)adv.innerHTML=`<div class="insight-title">Macro Strategy: ${preset.label}</div>
    <div class="insight-item"><strong>Why this split:</strong> ${preset.rationale}</div>
    <div class="insight-item"><strong>Strategy:</strong> ${surplus}</div>
    <div class="insight-item"><strong>Protein:</strong> ${prot}g (${macroSplit.prot}%) — spread across ${Math.ceil(prot/40)} meals (~${Math.round(prot/Math.ceil(prot/40))}g each). Eat within 2hrs post-workout.</div>
    <div class="insight-item"><strong>Carbs:</strong> ${carb}g (${macroSplit.carb}%) — ${goal==='mass'||goal==='strength'?'focus around training (pre + post workout)':goal==='fatloss'?'earlier in the day, reduce at night and on rest days':goal==='endurance'?'distribute evenly — your primary fuel source':'balanced throughout the day'}.</div>
    <div class="insight-item"><strong>Fat:</strong> ${fat}g (${macroSplit.fat}%) — olive oil, nuts, avocado, eggs. Essential for testosterone and hormone health.</div>
    <div class="insight-item"><strong>TDEE:</strong> ${tdee} kcal/day · ${days} training days/week · adjust split with sliders above.</div>`;
  state.nutritionTargets={kcal,prot,carb,fat};
}

function onMacroSlide(macro,val,kcal,lean,goal,surplus,tdee,days){
  macroSplit[macro]=parseInt(val);
  renderMacroSplit(kcal,lean,goal,surplus,tdee,days);
  saveData();
}

function logNutrition(){
  const kcal=parseInt(document.getElementById('log-kcal').value)||0;
  if(!kcal){toast('Enter calories');return;}
  if(!state.nutritionLog)state.nutritionLog=[];
  const t=today();
  const ex=state.nutritionLog.find(e=>e.date===t);
  if(ex)ex.kcal=kcal;else state.nutritionLog.push({date:t,kcal});
  const target=state.nutritionTargets?.kcal||0;
  const diff=kcal-target;
  const col=Math.abs(diff)<150?'var(--green)':diff>0?'var(--orange)':'var(--red)';
  const msg=Math.abs(diff)<150?'On target 🎯':diff>0?`${diff} kcal over target`:` ${Math.abs(diff)} kcal under target`;
  document.getElementById('nutrition-log-display').innerHTML=`
    <div style="background:var(--bg2);border-left:3px solid ${col};padding:10px 14px">
      <div style="font-size:13px;font-weight:600;color:var(--text)">${kcal} kcal logged today</div>
      <div style="font-size:12px;color:var(--muted2);margin-top:4px">${msg}</div>
      ${target?`<div style="font-size:11px;color:var(--muted);margin-top:4px">Target: ${target} kcal</div>`:''}
    </div>`;
  toast('Calories logged');saveData();
}

// ── ACHIEVEMENTS ──────────────────────────────────────────────
const ACHIEVEMENT_DEFS=[
  {id:'first_workout',icon:'🏋️',title:'First Rep',desc:'Complete your first workout',check:()=>state.streak>=1},
  {id:'week_streak',icon:'🔥',title:'On Fire',desc:'7-day training streak',check:()=>state.streak>=7},
  {id:'fortnight',icon:'💪',title:'Two Weeks Strong',desc:'14-day training streak',check:()=>state.streak>=14},
  {id:'month_warrior',icon:'🗓️',title:'Month Warrior',desc:'30-day training streak',check:()=>state.streak>=30},
  {id:'first_pr',icon:'⚡',title:'Personal Best',desc:'Set your first estimated 1RM',check:()=>Object.keys(planState.history||{}).length>=1},
  {id:'five_exercises',icon:'📋',title:'Exercise Library',desc:'Log 5 different exercises',check:()=>Object.keys(planState.history||{}).length>=5},
  {id:'ten_exercises',icon:'📚',title:'Exercise Scholar',desc:'Log 10 different exercises',check:()=>Object.keys(planState.history||{}).length>=10},
  {id:'weight_logged',icon:'⚖️',title:'Tracked',desc:'Log your first body weight',check:()=>(state.weightLog||[]).length>=1},
  {id:'ten_weight_logs',icon:'📈',title:'Consistent Tracker',desc:'Log body weight 10 times',check:()=>(state.weightLog||[]).length>=10},
  {id:'measurements_done',icon:'📏',title:'Body Scanner',desc:'Log your first full measurements',check:()=>Object.keys(state.measurements||{}).length>=5},
  {id:'recovery_logged',icon:'😴',title:'Sleep Tracker',desc:'Log your first recovery score',check:()=>(state.recLog||[]).length>=1},
  {id:'plan_built',icon:'🗺️',title:'Mission Briefed',desc:'Generate your first training plan',check:()=>!!planState.plan},
  {id:'nutrition_set',icon:'🥩',title:'Dialled In',desc:'Calculate your nutrition targets',check:()=>!!state.nutritionTargets},
  {id:'bf_calculated',icon:'🔬',title:'Body Composition',desc:'Calculate your body fat percentage',check:()=>(state.bfLog||[]).length>=1},
];

function renderAchievements(){
  const el=document.getElementById('achievements-list');
  if(!el)return;
  const earned=ACHIEVEMENT_DEFS.filter(a=>{try{return a.check();}catch(e){return false;}});
  const pending=ACHIEVEMENT_DEFS.filter(a=>!earned.includes(a));
  let html='';
  if(earned.length){
    html+=earned.map(a=>`
      <div style="background:var(--bg2);border-left:2px solid var(--gold);padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:12px">
        <div style="font-size:24px">${a.icon}</div>
        <div><div style="font-size:13px;font-weight:700;color:var(--text)">${a.title}</div><div style="font-size:11px;color:var(--muted2)">${a.desc}</div></div>
        <div style="margin-left:auto;font-size:10px;font-weight:700;color:var(--gold);letter-spacing:1px">UNLOCKED</div>
      </div>`).join('');
  }
  if(pending.length){
    html+=`<div style="font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--muted);padding:10px 0 6px">Locked</div>`;
    html+=pending.map(a=>`
      <div style="background:var(--bg2);border-left:2px solid rgba(255,255,255,0.06);padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:12px;opacity:.5">
        <div style="font-size:24px;filter:grayscale(1)">${a.icon}</div>
        <div><div style="font-size:13px;font-weight:700;color:var(--text)">${a.title}</div><div style="font-size:11px;color:var(--muted)">${a.desc}</div></div>
      </div>`).join('');
  }
  el.innerHTML=html||'<div style="font-size:13px;color:var(--muted)">Start training to unlock achievements.</div>';
}

// ── COMPARISON REPORT ─────────────────────────────────────────
function runComparison(){
  const from=document.getElementById('comp-from').value;
  const to=document.getElementById('comp-to').value;
  if(!from||!to){toast('Select both dates');return;}
  if(from>=to){toast('From date must be before To date');return;}
  const el=document.getElementById('comparison-result');
  let html='<div style="font-family:var(--ff);font-size:20px;color:var(--text);letter-spacing:.5px;margin-bottom:12px">PROGRESS REPORT</div>';
  const diffRow=(label,before,after,unit='',higherGood=true)=>{
    if(before==null||after==null)return '';
    const d=(after-before).toFixed(1);
    const pos=parseFloat(d)>0;
    const good=higherGood?pos:!pos;
    const col=parseFloat(d)===0?'var(--muted)':good?'var(--green)':'var(--red)';
    const arrow=parseFloat(d)>0?'↑':parseFloat(d)<0?'↓':'→';
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)">
      <span style="font-size:12px;color:var(--muted2)">${label}</span>
      <span style="font-size:13px;font-weight:700;color:${col}">${arrow} ${Math.abs(parseFloat(d)).toFixed(1)}${unit} <span style="font-size:10px;color:var(--muted)">(${before}→${after}${unit})</span></span>
    </div>`;
  };
  // Weight comparison
  const wBefore=state.weightLog.filter(e=>e.date<=from).slice(-1)[0]?.value;
  const wAfter=state.weightLog.filter(e=>e.date<=to).slice(-1)[0]?.value;
  if(wBefore||wAfter)html+=`<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin-bottom:6px">Body Weight</div>`+diffRow('Weight',wBefore,wAfter,'kg',planState.goal!=='fatloss');
  // BF comparison
  const bfBefore=state.bfLog.filter(e=>e.date<=from).slice(-1)[0]?.value;
  const bfAfter=state.bfLog.filter(e=>e.date<=to).slice(-1)[0]?.value;
  if(bfBefore||bfAfter)html+=diffRow('Body Fat %',bfBefore,bfAfter,'%',false);
  // Measurements
  const mBefore=state.measureLog.filter(e=>e.date<=from).slice(-1)[0];
  const mAfter=state.measureLog.filter(e=>e.date<=to).slice(-1)[0];
  if(mBefore&&mAfter){
    html+=`<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin:10px 0 6px">Measurements</div>`;
    const mKeys={chest:'Chest',waist:'Waist','lbicep-f':'L Bicep (flexed)','rbicep-f':'R Bicep (flexed)',lquad:'L Quad',rquad:'R Quad',shoulders:'Shoulders'};
    for(const k in mKeys){if(mBefore[k]!=null&&mAfter[k]!=null)html+=diffRow(mKeys[k],mBefore[k],mAfter[k],'cm',k!=='waist');}
  }
  // Strength PRs
  const prs=getAllPRs();
  if(Object.keys(prs).length){
    html+=`<div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--muted);text-transform:uppercase;margin:10px 0 6px">Strength (est. 1RM)</div>`;
    for(const name in planState.history){
      const h=planState.history[name];
      const before=h.filter(s=>s.date<=from).slice(-1)[0];
      const after=h.filter(s=>s.date<=to).slice(-1)[0];
      if(before&&after){const o1=epley(before.weight,before.reps),o2=epley(after.weight,after.reps);html+=diffRow(name,o1,o2,'kg');}
    }
  }
  if(html.length<100)html+='<div style="font-size:13px;color:var(--muted)">Not enough logged data in this date range. Keep logging consistently to see comparisons.</div>';
  el.innerHTML=`<div style="background:var(--bg2);border-left:3px solid var(--gold);padding:16px">${html}</div>`;
}

// ── DATA EXPORT ───────────────────────────────────────────────
function downloadCSV(filename,rows){
  const csv=rows.map(r=>r.map(c=>JSON.stringify(c??'')).join(',')).join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download=filename;a.click();
}

function exportWorkouts(){
  const rows=[['Date','Exercise','Weight (kg)','Reps','Estimated 1RM (kg)']];
  for(const name in planState.history){
    planState.history[name].forEach(s=>{
      rows.push([s.date,name,s.weight,s.reps,epley(s.weight,s.reps)]);
    });
  }
  rows.sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
  if(rows.length<2){toast('No workout history to export yet');return;}
  downloadCSV('traine_workouts.csv',rows);
  toast('Workout history downloaded');
}

function exportMeasurements(){
  const rows=[['Date','Weight (kg)','BF%','Chest','Waist','Hips','Shoulders','L Bicep (f)','R Bicep (f)','L Quad','R Quad','L Calf','R Calf']];
  const dates=[...new Set([...state.weightLog.map(e=>e.date),...state.measureLog.map(e=>e.date),...state.bfLog.map(e=>e.date)])].sort();
  dates.forEach(d=>{
    const w=state.weightLog.find(e=>e.date===d)?.value??'';
    const bf=state.bfLog.find(e=>e.date===d)?.value??'';
    const m=state.measureLog.find(e=>e.date===d)||{};
    rows.push([d,w,bf,m.chest??'',m.waist??'',m.hips??'',m.shoulders??'',m['lbicep-f']??'',m['rbicep-f']??'',m.lquad??'',m.rquad??'',m.lcalf??'',m.rcalf??'']);
  });
  if(rows.length<2){toast('No measurement data to export yet');return;}
  downloadCSV('traine_measurements.csv',rows);
  toast('Measurements downloaded');
}

function exportFullReport(){
  const report={
    exportDate:today(),
    profile:{weight:state.weight,gender:state.gender,settings:state.settings},
    weightLog:state.weightLog,bfLog:state.bfLog,recLog:state.recLog,
    measureLog:state.measureLog,nutritionLog:state.nutritionLog||[],
    workoutHistory:planState.history,
    personalRecords:getAllPRs(),
    weeklyVolume:calcWeeklyVolume(),
  };
  const a=document.createElement('a');
  a.href='data:application/json;charset=utf-8,'+encodeURIComponent(JSON.stringify(report,null,2));
  a.download='traine_full_report.json';a.click();
  toast('Full report downloaded');
}

