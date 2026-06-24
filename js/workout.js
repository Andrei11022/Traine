// ── WORKOUT SYSTEM ────────────────────────────────────────────
// Exercise DB: group, region (specific head/area), type, equipment, rep range, form cue

let planState={
  goal:null,days:null,equipment:'full',
  prefs:{},// exName -> 'like'|'dislike'|'cant'
  plan:null,// {Mon:{name,muscles,exercises:[{name,sets,reps,lastWeight,lastReps}]}}
  currentDay:null,
  history:{},// exName -> [{weight,reps,date}]
  completedSets:{},// day -> exIndex -> {warmup:[idx],work:[idx]}
  pendingSets:{},// day -> exIndex -> {warmup:[{weight,reps}],work:[{weight,reps}]}
  sessionDone:{}// date -> true
};

// ── HISTORY HELPERS ───────────────────────────────────────────
// History is a flat array of per-set entries sharing a date.
// Group consecutive entries by date → one object per training session.
function groupHistoryByDate(exName){
  const hist=planState.history[exName];
  if(!hist||!hist.length)return[];
  const sessions=[];
  hist.forEach(e=>{
    const last=sessions[sessions.length-1];
    if(last&&last.date===e.date)last.sets.push({weight:e.weight,reps:e.reps});
    else sessions.push({date:e.date,sets:[{weight:e.weight,reps:e.reps}]});
  });
  return sessions;
}

// Estimate workout duration in minutes for the session
function estimateWorkoutDuration(session){
  if(!session||session.isRest)return 0;
  const warmupSets = session.exercises.reduce((sum, ex)=>sum + (ex.warmups||0), 0);
  const workingSets = session.exercises.reduce((sum, ex)=>sum + (ex.sets||0), 0);
  const warmupTime = warmupSets * 1.5; // minutes per warmup set
  const workTime = workingSets * 1.25; // minutes per working set
  const restTime = workingSets * 1.5; // average rest time
  const transition = 3; // setup + walk time
  return Math.max(10, Math.round(warmupTime + workTime + restTime + transition));
}

// One-line summary of the most recent session: "60×11, 50×12, 50×11"
function lastSessionSummary(exName){
  const sessions=groupHistoryByDate(exName);
  if(!sessions.length)return null;
  const last=sessions[sessions.length-1];
  const best=last.sets.reduce((b,s)=>e1rm(s.weight,s.reps)>e1rm(b.weight,b.reps)?s:b,last.sets[0]);
  return{
    text:last.sets.map(s=>`${s.weight}×${s.reps}`).join(', '),
    date:last.date,
    setCount:last.sets.length,
    topSet:best
  };
}

// Friendly relative date: Today / Yesterday / 3d ago / Jun 9
function relDate(iso){
  if(!iso)return'';
  const d=new Date(iso+'T00:00:00'),now=new Date();
  const days=Math.round((new Date(now.toISOString().split('T')[0])-d)/864e5);
  if(days===0)return'Today';
  if(days===1)return'Yesterday';
  if(days<7)return days+'d ago';
  return d.toLocaleDateString(undefined,{month:'short',day:'numeric'});
}

// Full collapsible history table for an exercise (newest first)
function renderExerciseHistory(exName){
  const sessions=groupHistoryByDate(exName);
  if(!sessions.length)return'<div style="font-size:12px;color:var(--muted);padding:10px 2px">No history yet — log your first set.</div>';
  return sessions.slice().reverse().map(sess=>{
    const vol=sess.sets.reduce((t,s)=>t+s.weight*s.reps,0);
    const top=sess.sets.reduce((b,s)=>e1rm(s.weight,s.reps)>e1rm(b.weight,b.reps)?s:b,sess.sets[0]);
    const setStr=sess.sets.map(s=>`<span style="display:inline-block;background:var(--bg3);border-radius:3px;padding:2px 7px;margin:2px 3px 2px 0;font-size:12px;color:var(--text)">${s.weight}<span style="color:var(--muted)">×</span>${s.reps}</span>`).join('');
    return `<div style="padding:9px 2px;border-bottom:1px solid rgba(255,255,255,.05)">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px">
        <span style="font-size:11px;font-weight:600;letter-spacing:.5px;color:var(--gold)">${relDate(sess.date)}</span>
        <span style="font-size:10px;color:var(--muted)">${sess.sets.length} sets · ${vol>0?Math.round(vol)+'kg vol':'bodyweight'} · est 1RM ${e1rm(top.weight,top.reps)}kg</span>
      </div>
      <div>${setStr}</div>
    </div>`;
  }).join('');
}

function getRecentWorkoutSessions(){
  const sessions={};
  for(const exName in planState.history){
    (planState.history[exName]||[]).forEach(entry=>{
      if(!sessions[entry.date])sessions[entry.date]={date:entry.date,sets:[],volume:0};
      sessions[entry.date].sets.push({exName,weight:entry.weight,reps:entry.reps});
      sessions[entry.date].volume += (entry.weight||0)*(entry.reps||0);
    });
  }
  return Object.values(sessions).sort((a,b)=>b.date.localeCompare(a.date));
}

function renderWorkoutHistoryPanel(){
  const panel=document.getElementById('workout-history-panel');
  if(!panel)return;
  const recent=getRecentWorkoutSessions();
  if(!recent.length){
    panel.innerHTML=`<div class="history-empty">No workout history yet. Log a set to start tracking progress.</div>`;
    return;
  }
  const open=workoutHistoryOpen;
  const header=`<div class="history-panel-toggle" onclick="toggleWorkoutHistoryPanel()">
      <div><span class="history-panel-title">Workout History</span><span class="history-panel-count">${recent.length} sessions logged</span></div>
      <div id="history-panel-arrow" class="history-panel-arrow">${open?'−':'+'}</div>
    </div>`;
  const body=`<div id="workout-history-body" class="history-panel-body" style="display:${open?'block':'none'}">
      ${recent.slice(0,3).map(sess=>renderSessionCard(sess)).join('')}
    </div>`;
  panel.innerHTML=header+body;
}

function renderWarmupBlock(session,day){
  const container=document.getElementById('warmup-container');
  if(!container){return;}
  if(!session||session.isRest){container.innerHTML='';return;}
  const rows=session.exercises.map((ex,i)=>{
    const warmups=ex.warmups||1;
    const completedEx=planState.completedSets?.[day]?.[i]||{warmup:[]};
    const buttons=Array.from({length:warmups},(_,wi)=>{
      const checked=completedEx.warmup.includes(wi);
      return `<button class="warmup-step${checked?' checked':''}" onclick="markDone(this,'${day}',${i},'warmup',${wi})">${wi+1}</button>`;
    }).join('');
    return `<div class="warmup-ex-row"><div class="warmup-ex-name">${ex.name}</div><div class="warmup-step-row">${buttons}</div></div>`;
  }).join('');
  container.innerHTML=`<div class="warmup-block"><div class="slbl">Warm-up</div><div class="warmup-copy">Finish these warm-up sets before starting the working sets below.</div>${rows}</div>`;
}

function renderQuickMove(session){
  const container=document.getElementById('quick-move-container');
  if(!container){return;}
  if(!session||session.isRest){container.innerHTML='';return;}
  const prompts=[
    'Do 20 push-ups with strict form.',
    'Hold a plank for 45 seconds.',
    'Do 30 seconds of hip opener stretches.',
    'Do 15 slow air squats.',
    'Perform 10 slow lunges per side.',
    'Hold a wall sit for 45 seconds.',
    'Do 30 seconds of shoulder dislocations with a band or broomstick.'
  ];
  container.innerHTML=`<div class="quick-move-card"><div class="quick-move-label">Quick Move</div><div class="quick-move-text">${pick(prompts)}</div></div>`;
}

function updateHomeSessionSummary(){
  const focus=document.getElementById('home-desc');
  const duration=document.getElementById('home-duration');
  const session=planState.plan?.[getTodayDay()];
  if(!session){
    if(focus)focus.textContent='Set up your training plan to see today’s session';
    if(duration)duration.textContent='Start with the Workout tab to create your plan';
    return;
  }
  if(session.isRest){
    if(focus)focus.textContent='Rest day — recovery is part of the plan.';
    if(duration)duration.textContent='Take a walk, stretch, and recover for tomorrow’s workout.';
    return;
  }
  if(focus)focus.textContent=session.muscles.join(' · ');
  if(duration)duration.textContent=`Estimated ${estimateWorkoutDuration(session)} min · ${session.exercises.length} exercises`;
}

let workoutHistoryOpen=false;

function toggleWorkoutHistoryPanel(){
  const body=document.getElementById('workout-history-body');
  const arrow=document.getElementById('history-panel-arrow');
  if(!body||!arrow)return;
  workoutHistoryOpen=!workoutHistoryOpen;
  body.style.display=workoutHistoryOpen?'block':'none';
  arrow.textContent=workoutHistoryOpen?'−':'+';
}

function toggleSessionDetails(date){
  const details=document.getElementById('session-details-'+date.replace(/[^a-zA-Z0-9]/g,''));
  const button=document.getElementById('session-toggle-'+date.replace(/[^a-zA-Z0-9]/g,''));
  if(!details||!button)return;
  const open=details.style.display==='block';
  details.style.display=open?'none':'block';
  button.textContent=open?'Details':'Hide details';
}

function getPendingSet(day,exIdx,type,setIdx){
  return planState.pendingSets?.[day]?.[exIdx]?.[type]?.[setIdx]||{};
}

function saveSetInput(el,day,exIdx,setIdx,type){
  const row=el.closest('.set-cols');
  if(!row)return;
  const inputs=row.querySelectorAll('.si');
  const weight=inputs[0]?.value?parseFloat(inputs[0].value):null;
  const reps=inputs[1]?.value?parseInt(inputs[1].value):null;
  planState.pendingSets=planState.pendingSets||{};
  const dayState=planState.pendingSets[day]=planState.pendingSets[day]||{};
  const exState=dayState[exIdx]=dayState[exIdx]||{warmup:[],work:[]};
  exState[type]=exState[type]||[];
  exState[type][setIdx]={weight:weight, reps:reps};
  saveData();
}

function renderSessionCard(sess){
  const exercises={};
  sess.sets.forEach(set=>{(exercises[set.exName]=exercises[set.exName]||[]).push(set);});
  const sessionId=sess.date.replace(/[^a-zA-Z0-9]/g,'');
  const exerciseRows=Object.entries(exercises).map(([name,sets])=>{
    const topCurrent=sets.reduce((best,s)=>e1rm(s.weight,s.reps)>e1rm(best.weight,best.reps)?s:best,sets[0]);
    const trend=compareExerciseTrend(name,sess.date,topCurrent);
    const trendText=trend?`<span class="session-trend">${trend}</span>`:'';
    const setRows=sets.map((s,idx)=>`<div class="session-set-row">Set ${idx+1}: ${s.weight}kg × ${s.reps}</div>`).join('');
    return `<div class="session-ex-card"><div class="session-ex-header"><div>${name}</div>${trendText}</div>${setRows}</div>`;
  }).join('');
  const top=sess.sets.reduce((best,set)=>e1rm(set.weight,set.reps)>e1rm(best.weight,best.reps)?set:best,sess.sets[0]);
  return `<div class="history-card session-card"><div class="session-card-summary"><div><div class="history-date">${relDate(sess.date)}</div><div class="history-meta">${sess.sets.length} sets · ${Math.round(sess.volume)}kg volume · ${top.weight}kg×${top.reps} top</div></div><button class="session-toggle-btn" id="session-toggle-${sessionId}" onclick="toggleSessionDetails('${sess.date}')">Details</button></div><div id="session-details-${sessionId}" class="session-details" style="display:none">${exerciseRows}</div></div>`;
}

function compareExerciseTrend(exName,currentDate,topCurrent){
  const sessions=getRecentWorkoutSessions().filter(s=>s.date<currentDate && s.sets.some(set=>set.exName===exName));
  if(!sessions.length)return null;
  const older=sessions[2]||sessions[0];
  const prior=older.sets.filter(set=>set.exName===exName);
  if(!prior.length)return null;
  const topPrior=prior.reduce((best,s)=>e1rm(s.weight,s.reps)>e1rm(best.weight,best.reps)?s:best,prior[0]);
  const diffWeight=topCurrent.weight-topPrior.weight;
  const diffReps=topCurrent.reps-topPrior.reps;
  const signW=diffWeight>=0?'+':'−';
  const signR=diffReps>=0?'+':'−';
  return `${signW}${Math.abs(diffWeight)}kg ${signR}${Math.abs(diffReps)} reps vs ${sessions[2]? '3 sessions ago':'last session'}`;
}

function toggleHistory(exName,btnEl){
  const box=document.getElementById('hist-'+exName.replace(/[^a-zA-Z0-9]/g,''));
  if(!box)return;
  const open=box.style.display==='block';
  if(open){box.style.display='none';btnEl.textContent='View full history';}
  else{box.innerHTML=renderExerciseHistory(exName);box.style.display='block';btnEl.textContent='Hide history';}
}

function selectGoal(g){
  planState.goal=g;
  document.querySelectorAll('.ob-opt').forEach(o=>o.classList.remove('on'));
  document.getElementById('goal-'+g).classList.add('on');
  // Auto-recommend days for this goal
  showDaysRecommendation(g);
  checkNextReady();
}

// Goal + experience based days recommendation
const DAYS_REC={
  mass:{     days:4, why:'4 days is the sweet spot for building mass — Upper/Lower split hits every muscle twice a week with enough recovery between sessions. Great for beginners and intermediates.'},
  strength:{ days:4, why:'4 days is ideal for strength — 2 upper and 2 lower sessions per week lets you push heavy compounds frequently without burning out.'},
  fatloss:{  days:4, why:'4 days for fat loss — your diet does most of the work, but 4 sessions preserves muscle and keeps metabolism elevated. More than 5 days in a deficit increases injury risk.'},
  recomp:{   days:4, why:'4 days is the recomp sweet spot — enough stimulus to build muscle while the deficit burns fat. Consistency matters more than frequency here.'},
  maintenance:{days:3, why:'3 days is plenty for maintenance — you\'re keeping what you have, not building. Low commitment, sustainable long term.'},
  endurance:{ days:4, why:'4 days for endurance — 2 resistance + 2 cardio/conditioning sessions. Add daily 30-min walks on rest days for aerobic base.'},
};

function showDaysRecommendation(goal){
  const rec=DAYS_REC[goal];
  if(!rec)return;
  const suggEl=document.getElementById('days-suggestion');
  // Highlight recommended day
  document.querySelectorAll('.day-num-btn').forEach(b=>b.classList.remove('on','recommended'));
  const recBtn=document.getElementById('days-'+rec.days);
  if(recBtn)recBtn.classList.add('recommended');
  if(suggEl){
    suggEl.style.display='block';
    suggEl.innerHTML=`<strong style="color:var(--gold)">Recommended: ${rec.days} days/week</strong><br>${rec.why}`;
  }
  // Pre-select recommended days
  planState.days=rec.days;
  if(recBtn)recBtn.classList.add('on');
  checkNextReady();
}

function toggleEquip(el,eq){
  planState.equipment=eq;
  el.parentElement.querySelectorAll('.eq-btn').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  saveData();
}

function selectDays(n){
  document.querySelectorAll('.day-num-btn').forEach(b=>b.classList.remove('on','recommended'));
  const btn=document.getElementById('days-'+n);
  if(btn)btn.classList.add('on');
  planState.days=n;
  const goal=planState.goal||'mass';
  const rec=DAYS_REC[goal];
  const suggEl=document.getElementById('days-suggestion');
  // Show context for this specific day count
  const dayContext=DAYS_SUGGESTIONS[goal]?.[n]||'';
  if(suggEl&&dayContext){
    suggEl.style.display='block';
    const isRec=rec&&rec.days===n;
    suggEl.innerHTML=`${isRec?`<strong style="color:var(--gold)">✓ Recommended for your goal</strong><br>`:''}${dayContext}`;
  }
  checkNextReady();
}

function checkNextReady(){
  const btn=document.getElementById('next-to-prefs');
  const ready=planState.goal&&planState.days;
  if(btn){btn.disabled=!ready;btn.style.opacity=ready?'1':'0.4';}
}

function goToPrefs(){
  document.getElementById('ob-step-1').style.display='none';
  document.getElementById('ob-step-2').style.display='block';
  renderPrefList();
}

function renderPrefList(){
  const cats=Object.keys(ALL_EXERCISES);
  const eq=planState.equipment;
  let html='';
  cats.forEach(cat=>{
    const exs=ALL_EXERCISES[cat].filter(e=>eq==='full'||(eq==='dumbbells'&&(e.eq==='dumbbells'||e.eq==='home'))||eq==='home'&&e.eq==='home');
    if(!exs.length)return;
    html+=`<div class="pref-section-hdr">${cat.toUpperCase()}</div>`;
    exs.forEach(ex=>{
      const pref=planState.prefs[ex.name]||'like';
      html+=`<div class="pref-item" id="pref-${ex.name.replace(/\s/g,'_')}">
        <div><div class="pref-name">${ex.name}</div><div class="pref-cat">${(ex.region||cat).replace(/-/g,' ')} · ${ex.type}</div></div>
        <div class="pref-toggle">
          <div class="pt-btn ${pref==='like'?'like':''}" title="Like" onclick="setPref('${ex.name}','like',this)"><i class="ti ti-check"></i></div>
          <div class="pt-btn ${pref==='dislike'?'dislike':''}" title="Dislike" onclick="setPref('${ex.name}','dislike',this)"><i class="ti ti-x"></i></div>
          <div class="pt-btn ${pref==='cant'?'cant':''}" title="Can't do" onclick="setPref('${ex.name}','cant',this)"><i class="ti ti-ban"></i></div>
        </div>
      </div>`;
    });
  });
  document.getElementById('pref-list').innerHTML=html;
}

function setPref(name,pref,el){
  planState.prefs[name]=pref;
  const row=el.closest('.pref-toggle');
  row.querySelectorAll('.pt-btn').forEach(b=>{b.classList.remove('like','dislike','cant');});
  el.classList.add(pref);
}

// Module-level set/rep scheme by coach + goal
// Sets per exercise + warmups based on coach + goal (reps come from the exercise itself)
function getSetScheme(goal){
  const id=activeCoach.id;
  if(id==='ivan')return{sets:1,warmups:2};
  if(id==='blaze')return{sets:5,warmups:1};
  if(id==='caesar')return{sets:4,warmups:1};
  if(id==='thor')return{sets:4,warmups:2};
  if(id==='rex')return{sets:3,warmups:2};
  if(id==='marcus')return{sets:3,warmups:1};
  if(id==='ford')return{sets:3,warmups:2};
  if(id==='zen')return{sets:3,warmups:1};
  return{sets:3,warmups:1};
}

// Reps for an exercise: its natural range, shifted by goal
function repsForExercise(ex,goal){
  let lo=ex.lo,hi=ex.hi;
  if(goal==='strength'){lo=Math.max(3,Math.round(lo*0.6));hi=Math.max(5,Math.round(hi*0.6));}
  else if(goal==='fatloss'||goal==='endurance'){lo=Math.round(lo*1.3);hi=Math.round(hi*1.4);}
  return{lo,hi,mid:Math.round((lo+hi)/2)};
}
// Return just the mid for backward compat where a number is needed
function repsTarget(ex,goal){const r=repsForExercise(ex,goal);return typeof r==='object'?r.mid:r;}

// Coach-weighted, like-aware exercise picker for a muscle GROUP, ensuring REGION coverage.
// Returns array of exercise objects. compounds first.
function pickForGroup(group,count){
  const{equipment,prefs,goal}=planState;
  const cantDo=name=>prefs[name]==='cant';
  const isDisliked=name=>prefs[name]==='dislike';
  const eqOk=e=>equipment==='full'||(equipment==='dumbbells'&&(e.eq==='dumbbells'||e.eq==='home'))||(equipment==='home'&&e.eq==='home');
  const pref=COACH_EX_PREF[activeCoach.id]||COACH_EX_PREF.onyx;
  // 'cant' = hard exclude. 'dislike' = allowed but low priority
  let pool=EX_DB.filter(e=>e.group===group&&eqOk(e)&&!cantDo(e.name));
  if(!pool.length)return [];
  // score each by coach preference
  const score=e=>{
    let s=pref[e.type]||1;
    s*=pref[exTool(e)]||1;
    if(isDisliked(e.name))s*=0.1;// disliked = strong penalty but not excluded
    s*=(0.8+Math.random()*0.5); // variation
    return s;
  };
  // Group by region to ensure coverage
  const byRegion={};
  pool.forEach(e=>{(byRegion[e.region]=byRegion[e.region]||[]).push(e);});
  const regions=Object.keys(byRegion);
  let chosen=[];
  // For major groups, always anchor with the best COMPOUND first (even coaches who favor isolation still need a squat/press/row)
  const majorGroups=['legs','chest','back'];
  if(majorGroups.includes(group)){
    const compounds=pool.filter(e=>e.type==='compound');
    if(compounds.length){
      const anchor=compounds.sort((a,b)=>score(b)-score(a))[0];
      chosen.push(anchor);
    }
  }
  // Take the best exercise from each region (coverage) up to count
  regions.sort(()=>Math.random()-.5).forEach(r=>{
    if(chosen.length>=count)return;
    const best=byRegion[r].filter(e=>!chosen.includes(e)).sort((a,b)=>score(b)-score(a))[0];
    if(best)chosen.push(best);
  });
  // If we still need more, fill with highest-scoring remaining
  if(chosen.length<count){
    const remaining=pool.filter(e=>!chosen.includes(e)).sort((a,b)=>score(b)-score(a));
    chosen=chosen.concat(remaining.slice(0,count-chosen.length));
  }
  // compounds first
  chosen.sort((a,b)=>(a.type==='compound'?-1:1)-(b.type==='compound'?-1:1));
  return chosen.slice(0,count);
}

function buildPlanStructure(){
  const{goal,days}=planState;
  const ALL_DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  // Anchor the plan to a FIXED weekday stored at first build.
  // Rebuilds (goal change, coach change) keep sessions on the same days
  // instead of redistributing relative to whatever day it happens to be.
  if(planState.weekAnchor==null)planState.weekAnchor=new Date().getDay();
  const todayIdx=planState.weekAnchor;
  const makeDay=(name,groups,counts)=>{
    let exercises=[];
    groups.forEach((g,i)=>{
      const picks=pickForGroup(g,counts[i]||2);
      picks.forEach(ex=>{
        const sch=getSetScheme(goal);
        const repR=repsForExercise(ex,goal);
        exercises.push({name:ex.name,muscle:g,region:ex.region,type:ex.type,cue:ex.cue,sets:sch.sets,warmups:sch.warmups,reps:repR.mid,repLo:repR.lo,repHi:repR.hi});
      });
    });
    exercises.sort((a,b)=>(a.type==='compound'?0:1)-(b.type==='compound'?0:1));
    return{name,muscles:groups,exercises};
  };
  // Build training slots starting from today
  const plan={};
  ALL_DAYS.forEach(d=>plan[d]={name:'Rest',muscles:[],exercises:[],isRest:true});

  let sessionDefs=[];
  if(days===3){
    sessionDefs=[
      ['Full Body',['legs','chest','back','shoulders','arms'],[2,1,1,1,1]],
      ['Full Body',['legs','chest','back','shoulders','arms'],[2,1,1,1,1]],
      ['Full Body',['legs','chest','back','shoulders','arms'],[2,1,1,1,1]],
    ];
  } else if(days===4){
    sessionDefs=[
      ['Upper Body',['chest','back','shoulders','arms'],[2,2,1,2]],
      ['Lower Body',['legs','core'],[5,1]],
      ['Upper Body',['back','chest','shoulders','arms'],[2,2,1,2]],
      ['Lower Body',['legs','core'],[5,1]],
    ];
  } else if(days===5){
    sessionDefs=[
      ['Push',['chest','shoulders','arms'],[3,2,1]],
      ['Pull',['back','arms'],[3,2]],
      ['Legs',['legs','core'],[5,1]],
      ['Upper',['chest','back','shoulders'],[2,2,2]],
      ['Legs',['legs','core'],[5,1]],
    ];
  } else {
    sessionDefs=[
      ['Push',['chest','shoulders','arms'],[3,2,1]],
      ['Pull',['back','arms'],[3,2]],
      ['Legs',['legs','core'],[5,1]],
      ['Push',['chest','shoulders','arms'],[3,2,1]],
      ['Pull',['back','arms'],[3,2]],
      ['Legs',['legs','core'],[5,1]],
    ];
  }

  // Distribute sessions across the week starting from today
  // Space them out: for 3 days use every-other-day, for 6 consecutive
  const gap = days<=3 ? 2 : days<=4 ? 2 : 1;
  let assigned=0, dayOffset=0;
  while(assigned<sessionDefs.length && dayOffset<14){
    const d=ALL_DAYS[(todayIdx+dayOffset)%7];
    if(!plan[d]||plan[d].isRest){
      const[name,groups,counts]=sessionDefs[assigned];
      plan[d]=makeDay(name,groups,counts);
      assigned++;
      dayOffset+=gap;
    } else {
      dayOffset++;
    }
  }
  return plan;
}

function generatePlan(){
  planState.weekAnchor=new Date().getDay(); // fresh plan = fresh anchor
  planState.plan=buildPlanStructure();
  // New users see the first scheduled training session, while returning users land on today's plan day.
  const isNewUser=!planState.hasSeenWorkoutGuide&&!state.hasSeenWorkoutGuide;
  planState.currentDay=isNewUser?getFirstTrainingDay(planState.plan):getTodayDay();
  planState.daySelectedOn=today();
  saveData();
  showActivePlan();
  const showGuide=!planState.hasSeenWorkoutGuide&&!state.hasSeenWorkoutGuide;
  const showStrengthTest=!state.hasSeenStrengthTest;
  if(showGuide){
    setTimeout(()=>document.getElementById('first-workout-modal').classList.add('open'),400);
  } else if(showStrengthTest){
    state.hasSeenStrengthTest=true;
    saveData();
    setTimeout(()=>document.getElementById('strength-test-modal').classList.add('open'),400);
  }
}

function dismissFirstWorkout(){
  document.getElementById('first-workout-modal').classList.remove('open');
  planState.hasSeenWorkoutGuide=true;
  state.hasSeenWorkoutGuide=true;
  saveData();
  // Open strength test tip AFTER workout guide is closed
  if(!state.hasSeenStrengthTest){
    state.hasSeenStrengthTest=true;
    saveData();
    setTimeout(()=>document.getElementById('strength-test-modal').classList.add('open'),300);
  }
}

// Rebuild plan with new coach's scheme but keep all history
function rebuildPlanKeepHistory(){
  // history lives in planState.history keyed by exercise name — untouched.
  planState.plan=buildPlanStructure();
  if(document.getElementById('wo-active').style.display!=='none')showActivePlan();
}

// Weekly volume: working sets per muscle across the whole plan
function calcWeeklyVolume(){
  const vol={};
  if(!planState.plan)return vol;
  for(const day in planState.plan){
    const s=planState.plan[day];
    if(s.isRest)continue;
    s.exercises.forEach(ex=>{
      vol[ex.muscle]=(vol[ex.muscle]||0)+(ex.sets||0);
    });
  }
  return vol;
}

// Auto-advance to next exercise when all sets are done


function getTodayDay(){
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return days[new Date().getDay()];
}

// Also fix initialisation — when plan is first built, set currentDay to first training day
function getFirstTrainingDay(plan){
  // Start from TODAY and find the next training day — not always Monday
  const allDays=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayIdx=new Date().getDay();
  // Build order starting from today
  const order=[];
  for(let i=0;i<7;i++)order.push(allDays[(todayIdx+i)%7]);
  for(const d of order){
    if(plan[d]&&!plan[d].isRest)return d;
  }
  return allDays[todayIdx];
}

function showActivePlan(){
  document.getElementById('wo-onboarding').style.display='none';
  document.getElementById('wo-active').style.display='block';
  renderDayRow();
  // RESPECT the user's selected day if it was chosen TODAY and is valid.
  // A selection from a previous day expires — fresh day, fresh session.
  let startDay=(planState.daySelectedOn===today())?planState.currentDay:null;
  if(!startDay||!planState.plan?.[startDay]){
    const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const todayName=days[new Date().getDay()];
    const todaySession=planState.plan?.[todayName];
    if(todaySession){
      startDay=todayName;
    } else {
      startDay=getNextTrainingDay(todayName)||getFirstTrainingDay(planState.plan);
    }
    planState.currentDay=startDay;
  }
  renderDayWorkout(startDay);
}

function getNextTrainingDay(fromDay){
  const order=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const idx=order.indexOf(fromDay);
  for(let i=1;i<=7;i++){
    const candidate=order[(idx+i)%7];
    if(planState.plan[candidate]&&!planState.plan[candidate].isRest)return candidate;
  }
  return null;
}

function renderDayRow(){
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const activeDay=planState.currentDay||getTodayDay();
  document.getElementById('day-row').innerHTML=days.map(d=>{
    const session=planState.plan?.[d];
    const isToday=d===activeDay;
    const isRest=session?.isRest;
    return `<div class="dpill${isToday?' on':''}" onclick="renderDayWorkout('${d}',this)">${d}${isRest?'<br><span style="font-size:8px">REST</span>':''}</div>`;
  }).join('');
}

function renderDayWorkout(day,el){
  planState.currentDay=day;
  planState.daySelectedOn=today(); // selection valid for the rest of this calendar day
  saveData(); // persist day selection so refresh/re-render can't hijack it
  // Always update pill highlight
  document.querySelectorAll('.dpill').forEach(p=>p.classList.remove('on'));
  if(el)el.classList.add('on');
  else{
    // Find and highlight correct pill by day name
    document.querySelectorAll('.dpill').forEach(p=>{
      if(p.textContent.trim().startsWith(day))p.classList.add('on');
    });
  }
  const session=planState.plan?.[day];
  if(!session){return;}
  const sessionName=document.getElementById('wo-session-name');
  const dayLabel=document.getElementById('wo-day-label');
  const metaEl=document.getElementById('wo-session-meta');
  if(sessionName)sessionName.textContent=session.name.toUpperCase();
  if(dayLabel)dayLabel.textContent=`${day} · ${session.isRest?'Rest Day':session.muscles.join(', ')||'Rest'}`;
  if(metaEl){
    if(session.isRest){
      metaEl.textContent='Recovery-focused day — follow the plan and return refreshed.';
    } else {
      const warmupSets=session.exercises.reduce((sum,ex)=>sum+(ex.warmups||0),0);
      metaEl.textContent=`Estimated ${estimateWorkoutDuration(session)} min · ${session.exercises.length} exercises · ${session.exercises.reduce((sum,ex)=>sum+(ex.sets||0),0)} working sets${warmupSets?` · ${warmupSets} warmup sets`:''}`;
    }
  }
  updateHomeSessionSummary();
  renderWarmupBlock(session,day);
  renderQuickMove(session);
  renderWorkoutHistoryPanel();
  const container=document.getElementById('ex-container');
  if(!container)return;
  if(session.isRest){
    const restMessages={
      ivan:'Rest day. The body grows during recovery, not during training. Do not train — full systemic rest is mandatory.',
      caesar:'Rest day! Give the muscle time to grow. Eat well, sleep deeply, come back tomorrow with fire!',
      thor:'Rest day. Eat big and sleep. The body is repairing. Show up stronger tomorrow.',
      ford:'Scheduled rest day. Muscle protein synthesis peaks 24-48hrs post-session. Rest is part of the programme.',
      marcus:'Rest day. Recovery is part of the mission. Execute it with the same discipline as training.',
      zen:'Rest day. Move gently, breathe deeply, let the body speak. You do not always need iron to improve.',
      rex:'Rest day. Strength is built during recovery. Come back tomorrow ready to add weight to the bar.',
      blaze:'Rest day. Even the hardest athletes rest. Eat, sleep, recover — attack it harder tomorrow.',
      onyx:'Scheduled rest day. Your muscles are recovering and growing right now. Stay out of the gym.'
    };
    const msg=restMessages[activeCoach.id]||restMessages.onyx;
    container.innerHTML=`<div style="padding:40px 18px;text-align:center">
      <div style="font-family:var(--ff);font-size:36px;color:var(--muted);letter-spacing:2px;margin-bottom:10px">REST DAY</div>
      <div style="font-size:13px;color:var(--muted2);line-height:1.6;max-width:280px;margin:0 auto">${msg}</div>
    </div>`;
    return;
  }
  container.innerHTML=session.exercises.map((ex,i)=>{
    const hist=planState.history[ex.name];
    const _ls=lastSessionSummary(ex.name);
    const lastStr=_ls?`Last (${relDate(_ls.date)}): ${_ls.text}`:`${ex.sets} × ${ex.reps} reps · ${(ex.region||'').replace(/-/g,' ')}`;
    const target=hist?.length?calcTarget(ex.name):`${ex.sets}×${ex.reps} target`;
    const id=`ex-${day}-${i}`;
    const sId=`sets-${day}-${i}`;
    const typeBadge=ex.type==='compound'?'<span style="font-size:9px;font-weight:700;letter-spacing:1px;color:var(--gold);background:var(--gold-dim);padding:1px 6px;margin-left:6px">COMPOUND</span>':'';
    const targetW=hist?.length?calcTargetWeight(ex.name):'';
    const completedDay=planState.completedSets?.[day]||{};
    const completedEx=completedDay[i]||{warmup:[],work:[]};
    const repRange=ex.repLo&&ex.repHi?`${ex.repLo}-${ex.repHi}`:ex.reps;
    const workingRows=Array.from({length:ex.sets},(_,si)=>{
      const checked=completedEx.work.includes(si);
      const pending=getPendingSet(day,i,'work',si);
      const weightValue=pending?.weight!=null?pending.weight:(targetW||'');
      const repsValue=pending?.reps!=null?pending.reps:'';
      return `
      <div class="set-cols">
        <div class="set-num">${si+1}</div>
        <input class="si" type="number" inputmode="decimal" ${weightValue!==''?`value="${weightValue}"`:'placeholder="kg"'} oninput="saveSetInput(this,'${day}',${i},${si},'work')"/>
        <input class="si" type="number" inputmode="numeric" ${repsValue!==''?`value="${repsValue}"`:`placeholder="${repRange}"`} onchange="onRepEntered(this,'${ex.name}','${day}',${i})" oninput="saveSetInput(this,'${day}',${i},${si},'work')"/>
        <div class="set-done${checked?' checked':''}" onclick="markDoneEx(this,'${ex.name}','${day}',${i})"><i class="ti ti-check"></i></div>
      </div>`;
    }).join('');
    return `<div class="ex-block${i===0?' active-ex':''}" id="${id}">
      <div class="ex-hdr" onclick="toggleEx('${sId}','${id}')">
        <div><div class="ex-name">${ex.name.toUpperCase()}${typeBadge}</div><div class="ex-last">${lastStr}</div></div>
        <div class="ex-target">${target}</div>
      </div>
      <div class="sets-area${i===0?' open':''}" id="${sId}">
        <div class="set-cols"><div></div><div class="col-lbl">Weight (kg)</div><div class="col-lbl">Reps</div><div class="col-lbl">Done</div></div>
        ${workingRows}
        ${ex.cue?`<div style="font-size:11px;color:var(--muted);padding:8px 2px 0;line-height:1.5"><i class="ti ti-info-circle" style="font-size:12px;color:var(--gold)"></i> ${ex.cue}</div>`:''}
        <div class="coach-tip">
          <div class="coach-tip-name">${activeCoach.name}</div>
          <div id="tip-${day}-${i}">Target ${repRange} reps. ${ex.type==='compound'?'Heavy compound — rest fully and brace hard.':'Isolation — focus on the squeeze and controlled tempo.'} <span style="color:var(--muted2);font-size:11px">Complete warmup to get working weight suggestion.</span></div>
        </div>
        ${_ls?`<div style="padding-top:8px"><button onclick="toggleHistory('${ex.name.replace(/'/g,"\\'")}',this)" style="background:none;border:none;color:var(--gold);font-size:12px;cursor:pointer;text-decoration:underline;text-underline-offset:3px;padding:4px 0">View full history</button><div id="hist-${ex.name.replace(/[^a-zA-Z0-9]/g,'')}" style="display:none;margin-top:4px"></div></div>`:''}
      </div>
    </div>`;
  }).join('');
}

function calcTargetWeight(name){
  const sessions=groupHistoryByDate(name);
  if(!sessions.length)return'';
  const last=sessions[sessions.length-1];
  const topSet=last.sets.reduce((b,s)=>e1rm(s.weight,s.reps)>e1rm(b.weight,b.reps)?s:b,last.sets[0]);
  const goal=planState.goal||'mass';
  const rules=GOAL_RULES[goal]||GOAL_RULES.mass;
  const{increaseAt,dropBelow}=rules;
  if(topSet.reps>=increaseAt){
    const s=getIncrement(name,goal,'up');
    return(topSet.weight+s).toFixed(1);
  }
  if(topSet.reps<dropBelow){
    const d=getIncrement(name,goal,'drop');
    return Math.max(0,topSet.weight-d).toFixed(1);
  }
  return topSet.weight.toFixed(1);
}

function calcTarget(name){
  const sessions=groupHistoryByDate(name);
  if(!sessions.length)return null;
  const last=sessions[sessions.length-1];
  const topSet=last.sets.reduce((b,s)=>e1rm(s.weight,s.reps)>e1rm(b.weight,b.reps)?s:b,last.sets[0]);
  const goal=planState.goal||'mass';
  const rules=GOAL_RULES[goal]||GOAL_RULES.mass;
  const{increaseAt,dropBelow}=rules;
  if(topSet.reps>=increaseAt){
    const s=getIncrement(name,goal,'up');
    return`ADD ${s}kg → ${(topSet.weight+s).toFixed(1)}kg`;
  }
  if(topSet.reps<dropBelow){
    const d=getIncrement(name,goal,'drop');
    return`DROP → ${Math.max(0,topSet.weight-d).toFixed(1)}kg`;
  }
  const needed=increaseAt-topSet.reps;
  return`+${needed} REPS TO PROGRESS`;
}

function onRepEntered(el,exName,day,idx){
  const reps=parseInt(el.value);if(!reps)return;
  const row=el.closest('.set-cols');
  const w=parseFloat(row.querySelector('.si').value);
  const tipEl=document.getElementById(`tip-${day}-${idx}`);
  if(!tipEl||!w)return;
  const goal=planState.goal||'mass';
  const coach=activeCoach.id;
  const rules=GOAL_RULES[goal]||GOAL_RULES.mass;
  const{increaseAt,dropBelow,repRange}=rules;
  const setsArea=row.closest('.sets-area');
  const allWorking=setsArea?[...setsArea.querySelectorAll('.set-cols:not(.warmup-row)')]:[]; 
  const isLastSet=allWorking.indexOf(row)===allWorking.length-1;
  const word=isLastSet?'next session':'next set';
  const step=getIncrement(exName,goal,'up');
  const drop=getIncrement(exName,goal,'drop');

  let msg='';
  if(coach==='ivan'){
    const ex=planState.plan?.[planState.currentDay]?.exercises.find(e=>e.name===exName);
    const target=ex?.reps||8;
    if(reps>=target)msg=`${reps} reps — HIT target. Add ${step}kg ${word} (→${(w+step).toFixed(1)}kg). Maximum Overload.`;
    else if(reps>=target-2)msg=`${reps} reps — close to failure. Hold ${w}kg and go harder ${word}.`;
    else msg=`Only ${reps} reps. Too heavy. Reduce to ${Math.max(0,w-drop).toFixed(1)}kg ${word} — full recovery required.`;
  } else if(reps>=increaseAt){
    msg=`${reps} reps — top of range! ${isLastSet?`Add ${step}kg next session → ${(w+step).toFixed(1)}kg.`:`Loading ${(w+step).toFixed(1)}kg for ${word}.`}`;
  } else if(reps>=repRange[0]){
    const needed=increaseAt-reps;
    msg=`${reps} reps — in the zone. Need ${needed} more rep${needed>1?'s':''} before earning a weight increase. Hold ${w}kg.`;
  } else if(reps<dropBelow){
    msg=`${reps} reps — too heavy. Drop to ~${Math.max(0,w-drop).toFixed(1)}kg ${word}. Can't build muscle you can't control.`;
  } else {
    msg=`${reps} reps — just under the zone. Hold ${w}kg and push harder ${word}.`;
  }
  if(coach==='zen'&&reps<dropBelow)msg=`${reps} reps — the weight is beyond you today. Reduce with no ego. Mastery before load.`;
  if(coach==='marcus'&&reps<dropBelow)msg=`${reps} reps. Reduce. Discipline means knowing when to retreat and reload.`;
  tipEl.textContent=msg;
}

function markDoneEx(el,exName,day,idx){
  el.classList.toggle('checked');
  const row=el.closest('.set-cols');
  const inputs=row?row.querySelectorAll('.si'):[];
  const w=parseFloat(inputs[0]?.value)||0;
  const r=parseInt(inputs[1]?.value)||0;
  const isWarmup=row&&(row.classList.contains('warmup-row')||row.querySelector('.set-num')?.textContent.trim().startsWith('W'));

  const dayState=planState.completedSets=planState.completedSets||{};
  const exState=dayState[day]=dayState[day]||{};
  const rowState=exState[idx]=exState[idx]||{warmup:[],work:[]};
  const workRows=[...row.closest('.sets-area')?.querySelectorAll('.set-cols')||[]].filter(rw=>!rw.classList.contains('warmup-row')&&rw.querySelector('.set-done'));
  const setIndex=workRows.indexOf(row);
  if(el.classList.contains('checked')){
    if(setIndex>=0&&!rowState.work.includes(setIndex))rowState.work.push(setIndex);
  } else {
    const pos=rowState.work.indexOf(setIndex);
    if(pos!==-1)rowState.work.splice(pos,1);
  }

  if(el.classList.contains('checked')){
    // Save data for working sets only
    if(!isWarmup&&r&&!isNaN(parseFloat(inputs[0]?.value))){
      if(!planState.history[exName])planState.history[exName]=[];
      planState.history[exName].push({weight:w,reps:r,date:today()});
      const ex=planState.plan?.[day]?.exercises[idx];
      if(ex){ex.lastWeight=w;ex.lastReps=r;}
      const est=e1rm(w,r);
      const cur=state.prs[exName];
      if(!cur||est>cur.e1rm){
        state.prs[exName]={weight:w,reps:r,e1rm:est,date:today()};
        toast('🏆 PR: '+exName+' '+w+'kg × '+r+' reps');
      }
      updateNextSet(row,exName,w,r);
    }
    startRestTimer(isWarmup?'Warm-up set':exName,r||10);
    // Check if exercise is fully done — works even if w/r empty
    checkExerciseComplete(el,day,idx);
  }
  saveData();
  renderWorkoutHistoryPanel();
}

function updateNextSet(currentRow,exName,w,r){
  const setsArea=currentRow.closest('.sets-area');
  if(!setsArea)return;
  const allWorking=[...setsArea.querySelectorAll('.set-cols:not(.warmup-row)')];
  const curIdx=allWorking.indexOf(currentRow);
  if(curIdx===-1||curIdx>=allWorking.length-1)return;

  const goal=planState.goal||'mass';
  const coach=activeCoach.id;
  const rules=GOAL_RULES[goal]||GOAL_RULES.mass;
  const{increaseAt,dropBelow}=rules;
  const ex=planState.plan?.[planState.currentDay]?.exercises.find(e=>e.name===exName);
  const targetReps=ex?.reps||rules.repRange[1];

  let nextW=w;

  if(coach==='ivan'){
    const step=getIncrement(exName,goal,'up');
    const drop=getIncrement(exName,goal,'drop');
    if(r>=targetReps)nextW=Math.round((w+step)*100)/100;
    else if(r<targetReps-3)nextW=Math.max(0,Math.round((w-drop)*100)/100);
  } else {
    if(r>=increaseAt){
      nextW=Math.round((w+getIncrement(exName,goal,'up'))*100)/100;
    } else if(r<dropBelow){
      nextW=Math.max(0,Math.round((w-getIncrement(exName,goal,'drop'))*100)/100);
    }
    // within range — hold weight, build reps (double progression)
  }

  // Apply to all following unchecked sets
  for(let i=curIdx+1;i<allWorking.length;i++){
    const row=allWorking[i];
    if(row.querySelector('.set-done')?.classList.contains('checked'))continue;
    const inp=row.querySelectorAll('.si');
    if(inp[0]&&!inp[0].value){
      inp[0].value=nextW;
      inp[0].style.borderColor='var(--gold)';
      setTimeout(()=>{if(inp[0])inp[0].style.borderColor='';},1500);
    }
  }
}

function checkExerciseComplete(doneEl,day,idx){
  const setsArea=doneEl.closest('.sets-area');
  if(!setsArea)return;
  // Check all set-done buttons (warmup + working) — all must be checked
  const allDoneBtns=[...setsArea.querySelectorAll('.set-done')];
  if(!allDoneBtns.every(b=>b.classList.contains('checked')))return;
  // All sets done
  const exBlock=setsArea.closest('.ex-block');
  if(exBlock){
    exBlock.style.borderLeft='2px solid var(--green)';
    exBlock.style.opacity='0.65';
  }
  setTimeout(()=>{
    setsArea.classList.remove('open');
    const allBlocks=[...document.querySelectorAll('.ex-block')];
    const curBlockIdx=allBlocks.indexOf(exBlock);
    const nextBlock=allBlocks[curBlockIdx+1];
    if(nextBlock){
      const nextSets=nextBlock.querySelector('.sets-area');
      if(nextSets)nextSets.classList.add('open');
      nextBlock.style.borderLeft='2px solid var(--gold)';
      nextBlock.scrollIntoView({behavior:'smooth',block:'nearest'});
      setTimeout(()=>{nextBlock.style.borderLeft='';},2000);
    }
  },500);
}

// Warmup sets — mark done + short timer
function markDone(el,day,exIndex,type,index){
  el.classList.toggle('checked');
  if(!planState.completedSets)planState.completedSets={};
  const dayState=planState.completedSets[day]=planState.completedSets[day]||{};
  const exState=dayState[exIndex]=dayState[exIndex]||{warmup:[],work:[]};
  const list=type==='warmup'?exState.warmup:exState.work;
  if(el.classList.contains('checked')){
    if(!list.includes(index))list.push(index);
  } else {
    const pos=list.indexOf(index);
    if(pos!==-1)list.splice(pos,1);
  }
  if(el.classList.contains('checked')){
    startRestTimer('Warm-up set',15);
  }
  checkExerciseComplete(el,day,exIndex);
  saveData();
  renderWorkoutHistoryPanel();
}

function finishWorkout(){
  const day=planState.currentDay||getTodayDay();
  if(!day)return;
  planState.sessionDone=planState.sessionDone||{};
  planState.sessionDone[today()]=true;
  saveData();
  renderWorkoutHistoryPanel();
  toast('Workout session marked complete.');
}

// ── REST TIMER ────────────────────────────────────────────────
let restInterval=null;
let _restRemaining=0;

function recommendedRest(exName,reps){
  // Warmup sets always get 60s
  if(exName==='Warm-up set')return 60;
  const compounds=['Bench Press','Squat','Deadlift','Overhead Press','Barbell Row','Romanian Deadlift','Incline Bench Press','Hack Squat','Leg Press','Pull-Ups','T-Bar Row','Rack Pull','Close Grip Bench','Decline Bench Press','Bulgarian Split Squat','Lunges','Front Squat','Hip Thrust'];
  const isCompound=compounds.includes(exName);
  const id=activeCoach.id;
  if(id==='ivan')return isCompound?240:180;
  if(id==='rex'||id==='thor')return isCompound?210:120;
  if(id==='blaze')return isCompound?60:45;
  if(id==='caesar')return isCompound?90:60;
  if(reps<=5)return isCompound?210:150;
  if(reps<=8)return isCompound?180:120;
  if(reps<=12)return isCompound?120:75;
  return 60;
}

function startRestTimer(exName,reps){
  const secs=recommendedRest(exName,reps||10);
  _restRemaining=secs;
  clearInterval(restInterval);
  const bar=document.getElementById('rest-timer-bar');
  const label=document.getElementById('rest-ex-label');
  const countdown=document.getElementById('rest-countdown');
  if(!bar)return;
  if(label)label.textContent='Rest · '+exName;
  bar.style.display='flex';
  const tick=()=>{
    if(!countdown)return;
    const m=Math.floor(_restRemaining/60);
    const s=_restRemaining%60;
    countdown.textContent=m+':'+(s<10?'0':'')+s;
    countdown.style.color=_restRemaining<=10?'var(--red)':'var(--text)';
    if(_restRemaining<=0){
      clearInterval(restInterval);
      countdown.textContent='GO!';
      countdown.style.color='var(--green)';
      if(label)label.textContent='Rest complete';
      if(navigator.vibrate)navigator.vibrate([200,100,200]);
      setTimeout(skipRest,3000);
    }
  };
  tick();
  restInterval=setInterval(()=>{_restRemaining--;tick();},1000);
}

function addRest(n){
  _restRemaining+=n;
}

function skipRest(){
  clearInterval(restInterval);
  _restRemaining=0;
  const bar=document.getElementById('rest-timer-bar');
  if(bar)bar.style.display='none';
}


function resetPlan(){
  if(!confirm('Reset your training plan and preferences? Your workout history will be kept.'))return;
  planState.plan=null;planState.goal=null;planState.days=null;planState.prefs={};
  document.getElementById('wo-active').style.display='none';
  document.getElementById('wo-onboarding').style.display='block';
  document.getElementById('ob-step-1').style.display='block';
  document.getElementById('ob-step-2').style.display='none';
  document.querySelectorAll('.ob-opt').forEach(o=>o.classList.remove('on'));
  document.querySelectorAll('.day-num-btn').forEach(b=>b.classList.remove('on'));
  saveData();
}

function initWorkoutPage(){
  if(planState.plan){showActivePlan();}
  else{
    document.getElementById('wo-onboarding').style.display='block';
    document.getElementById('wo-active').style.display='none';
  }
}

