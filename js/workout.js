// ── WORKOUT SYSTEM ────────────────────────────────────────────
// Exercise DB: group, region (specific head/area), type, equipment, rep range, form cue

let planState={
  goal:null,days:null,equipment:'full',
  prefs:{},// exName -> 'like'|'dislike'|'cant'
  plan:null,// {Mon:{name,muscles,exercises:[{name,sets,reps,lastWeight,lastReps}]}}
  currentDay:null,
  history:{},// exName -> [{weight,reps,date}]
  sessionDone:{}// date -> true
};

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
  const confirmBox=document.getElementById('days-confirm-box');
  const confirmMsg=document.getElementById('days-confirm-msg');
  // Highlight recommended day
  document.querySelectorAll('.day-num-btn').forEach(b=>b.classList.remove('on','recommended'));
  const recBtn=document.getElementById('days-'+rec.days);
  if(recBtn)recBtn.classList.add('recommended');
  if(suggEl){
    suggEl.style.display='block';
    suggEl.innerHTML=`<strong style="color:var(--gold)">Recommended: ${rec.days} days/week</strong><br>${rec.why}`;
  }
  if(confirmMsg)confirmMsg.textContent=`Train ${rec.days} days/week — does this fit your current schedule and lifestyle?`;
  if(confirmBox)confirmBox.style.display='block';
  // Pre-select recommended days
  planState.days=rec.days;
  if(recBtn)recBtn.classList.add('on');
  checkNextReady();
}

function selectDays(n){
  document.querySelectorAll('.day-num-btn').forEach(b=>b.classList.remove('on','recommended'));
  const btn=document.getElementById('days-'+n);
  if(btn)btn.classList.add('on');
  planState.days=n;
  const goal=planState.goal||'mass';
  const rec=DAYS_REC[goal];
  const suggEl=document.getElementById('days-suggestion');
  const confirmBox=document.getElementById('days-confirm-box');
  const confirmMsg=document.getElementById('days-confirm-msg');
  // Show context for this specific day count
  const dayContext=DAYS_SUGGESTIONS[goal]?.[n]||'';
  if(suggEl&&dayContext){
    suggEl.style.display='block';
    const isRec=rec&&rec.days===n;
    suggEl.innerHTML=`${isRec?`<strong style="color:var(--gold)">✓ Recommended for your goal</strong><br>`:''}${dayContext}`;
  }
  if(confirmMsg)confirmMsg.textContent=`Train ${n} days/week — does this fit your schedule?`;
  if(confirmBox)confirmBox.style.display='block';
  checkNextReady();
}

function confirmDays(yes){
  const confirmBox=document.getElementById('days-confirm-box');
  if(yes){
    if(confirmBox)confirmBox.style.display='none';
    toast(`${planState.days} training days/week confirmed ✓`);
  } else {
    // Show alternative suggestions
    const goal=planState.goal||'mass';
    const confirmMsg=document.getElementById('days-confirm-msg');
    const suggEl=document.getElementById('days-suggestion');
    if(suggEl)suggEl.innerHTML=`<strong style="color:var(--gold)">No problem!</strong> Pick the number that fits your life — even 2-3 days is enough to make progress. Consistency beats perfection every time. Any of the options below will work.`;
    if(confirmBox){
      // Replace buttons with just a close
      const btns=confirmBox.querySelector('div[style*="display:flex"]');
      if(btns)btns.innerHTML=`<button onclick="document.getElementById('days-confirm-box').style.display='none'" style="width:100%;background:var(--bg2);border:1px solid rgba(255,255,255,0.1);padding:10px;font-family:var(--ff);font-size:14px;color:var(--gold);cursor:pointer">OK — I'LL PICK THE RIGHT NUMBER FOR ME</button>`;
    }
  }
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
  return Math.round((lo+hi)/2);
}

// Coach-weighted, like-aware exercise picker for a muscle GROUP, ensuring REGION coverage.
// Returns array of exercise objects. compounds first.
function pickForGroup(group,count){
  const{equipment,prefs,goal}=planState;
  const cantDo=name=>prefs[name]==='cant';
  const isDisliked=name=>prefs[name]==='dislike';
  const eqOk=e=>equipment==='full'||(equipment==='dumbbells'&&(e.eq==='dumbbells'||e.eq==='home'))||(equipment==='home'&&e.eq==='home');
  const pref=COACH_EX_PREF[activeCoach.id]||COACH_EX_PREF.aria;
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
  const makeDay=(name,groups,counts)=>{
    let exercises=[];
    groups.forEach((g,i)=>{
      const picks=pickForGroup(g,counts[i]||2);
      picks.forEach(ex=>{
        const sch=getSetScheme(goal);
        exercises.push({name:ex.name,muscle:g,region:ex.region,type:ex.type,cue:ex.cue,sets:sch.sets,warmups:sch.warmups,reps:repsForExercise(ex,goal)});
      });
    });
    // compounds first across the whole day
    exercises.sort((a,b)=>(a.type==='compound'?0:1)-(b.type==='compound'?0:1));
    return{name,muscles:groups,exercises};
  };
  let plan={},restDays=[];
  if(days===3){
    ['Mon','Wed','Fri'].forEach(d=>{plan[d]=makeDay('Full Body',['legs','chest','back','shoulders','arms'],[2,1,1,1,1]);});
    restDays=['Tue','Thu','Sat','Sun'];
  } else if(days===4){
    plan['Mon']=makeDay('Upper Body',['chest','back','shoulders','arms'],[2,2,1,2]);
    plan['Tue']=makeDay('Lower Body',['legs','core'],[5,1]);
    plan['Thu']=makeDay('Upper Body',['back','chest','shoulders','arms'],[2,2,1,2]);
    plan['Fri']=makeDay('Lower Body',['legs','core'],[5,1]);
    restDays=['Wed','Sat','Sun'];
  } else if(days===5){
    plan['Mon']=makeDay('Push',['chest','shoulders','arms'],[3,2,1]);
    plan['Tue']=makeDay('Pull',['back','arms'],[3,2]);
    plan['Wed']=makeDay('Legs',['legs','core'],[5,1]);
    plan['Thu']=makeDay('Upper',['chest','back','shoulders'],[2,2,2]);
    plan['Sat']=makeDay('Legs',['legs','core'],[5,1]);
    restDays=['Fri','Sun'];
  } else {
    plan['Mon']=makeDay('Push',['chest','shoulders','arms'],[3,2,1]);
    plan['Tue']=makeDay('Pull',['back','arms'],[3,2]);
    plan['Wed']=makeDay('Legs',['legs','core'],[5,1]);
    plan['Thu']=makeDay('Push',['chest','shoulders','arms'],[3,2,1]);
    plan['Fri']=makeDay('Pull',['back','arms'],[3,2]);
    plan['Sat']=makeDay('Legs',['legs','core'],[5,1]);
    restDays=['Sun'];
  }
  restDays.forEach(d=>{plan[d]={name:'Rest',muscles:[],exercises:[],isRest:true};});
  return plan;
}

function generatePlan(){
  planState.plan=buildPlanStructure();
  // New users always start on the first training day, not whatever today is
  const isNewUser=!planState.hasSeenWorkoutGuide&&!state.hasSeenWorkoutGuide;
  planState.currentDay=isNewUser?getFirstTrainingDay(planState.plan):getTodayDay();
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
  const todayName=days[new Date().getDay()];
  // If we have a plan, make sure we don't land on a rest day
  if(planState.plan){
    const todaySession=planState.plan[todayName];
    if(todaySession&&!todaySession.isRest)return todayName;
    // Find the next training day from today
    const order=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const todayIdx=order.indexOf(todayName);
    for(let i=1;i<=7;i++){
      const candidate=order[(todayIdx+i)%7];
      if(planState.plan[candidate]&&!planState.plan[candidate].isRest)return candidate;
    }
  }
  return todayName;
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
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayName=days[new Date().getDay()];
  const todaySession=planState.plan?.[todayName];
  let startDay;
  if(todaySession&&!todaySession.isRest){
    // Today is a training day — show it
    startDay=todayName;
  } else {
    // Today is rest — find next upcoming training day
    startDay=getNextTrainingDay(todayName)||getFirstTrainingDay(planState.plan);
  }
  planState.currentDay=startDay;
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
  const today=getTodayDay();
  document.getElementById('day-row').innerHTML=days.map(d=>{
    const session=planState.plan?.[d];
    const isToday=d===today;
    const isRest=session?.isRest;
    return `<div class="dpill${isToday?' on':''}" onclick="renderDayWorkout('${d}',this)">${d}${isRest?'<br><span style="font-size:8px">REST</span>':''}</div>`;
  }).join('');
}

function renderDayWorkout(day,el){
  planState.currentDay=day;
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
  if(sessionName)sessionName.textContent=session.name.toUpperCase();
  if(dayLabel)dayLabel.textContent=`${day} · ${session.isRest?'Rest Day':session.muscles.join(', ')||'Rest'}`;
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
      aria:'Scheduled rest day. Your muscles are recovering and growing right now. Stay out of the gym.'
    };
    const msg=restMessages[activeCoach.id]||restMessages.aria;
    container.innerHTML=`<div style="padding:40px 18px;text-align:center">
      <div style="font-family:var(--ff);font-size:36px;color:var(--muted);letter-spacing:2px;margin-bottom:10px">REST DAY</div>
      <div style="font-size:13px;color:var(--muted2);line-height:1.6;max-width:280px;margin:0 auto">${msg}</div>
    </div>`;
    return;
  }
  container.innerHTML=session.exercises.map((ex,i)=>{
    const hist=planState.history[ex.name];
    const lastStr=hist?.length?`Last: ${hist[hist.length-1].weight}kg × ${hist[hist.length-1].reps} reps`:`${ex.sets} × ${ex.reps} reps · ${(ex.region||'').replace(/-/g,' ')}`;
    const target=hist?.length?calcTarget(ex.name):`${ex.reps} REPS`;
    const id=`ex-${day}-${i}`;
    const sId=`sets-${day}-${i}`;
    const typeBadge=ex.type==='compound'?'<span style="font-size:9px;font-weight:700;letter-spacing:1px;color:var(--gold);background:var(--gold-dim);padding:1px 6px;margin-left:6px">COMPOUND</span>':'';
    // Pre-fill warmup placeholder from history (50% of last working weight)
    const lastW=hist?.length?hist[hist.length-1].weight:null;
    const warmupHint=lastW?Math.round(lastW*0.5/2.5)*2.5:null;
    const targetW=hist?.length?calcTargetWeight(ex.name):'';
    const warmupRows=Array.from({length:ex.warmups||1},(_,wi)=>`
      <div class="set-cols warmup-row">
        <div class="set-num" style="font-size:9px;line-height:1.1;text-align:center;color:var(--muted)">WARM<br>UP ${wi+1}</div>
        <input class="si" type="number" inputmode="decimal" ${warmupHint?`placeholder="${warmupHint}"`:'placeholder="kg"'}  oninput="liveCalcFromWarmup(this,'${ex.name}','${day}',${i})"/>
        <input class="si" type="number" inputmode="numeric" placeholder="reps" oninput="liveCalcFromWarmup(this,'${ex.name}','${day}',${i})"/>
        <div class="set-done" onclick="markDone(this)"><i class="ti ti-check"></i></div>
      </div>`).join('');
    const workingRows=Array.from({length:ex.sets},(_,si)=>`
      <div class="set-cols">
        <div class="set-num">${si+1}</div>
        <input class="si" type="number" inputmode="decimal" ${targetW?`value="${targetW}"`:'placeholder="kg"'} />
        <input class="si" type="number" inputmode="numeric" placeholder="${ex.reps}" onchange="onRepEntered(this,'${ex.name}','${day}',${i})"/>
        <div class="set-done" onclick="markDoneEx(this,'${ex.name}','${day}',${i})"><i class="ti ti-check"></i></div>
      </div>`).join('');
    return `<div class="ex-block${i===0?' active-ex':''}" id="${id}">
      <div class="ex-hdr" onclick="toggleEx('${sId}','${id}')">
        <div><div class="ex-name">${ex.name.toUpperCase()}${typeBadge}</div><div class="ex-last">${lastStr}</div></div>
        <div class="ex-target">${target}</div>
      </div>
      <div class="sets-area${i===0?' open':''}" id="${sId}">
        <div class="set-cols"><div></div><div class="col-lbl">Weight (kg)</div><div class="col-lbl">Reps</div><div class="col-lbl">Done</div></div>
        ${warmupRows}${workingRows}
        ${ex.cue?`<div style="font-size:11px;color:var(--muted);padding:8px 2px 0;line-height:1.5"><i class="ti ti-info-circle" style="font-size:12px;color:var(--gold)"></i> ${ex.cue}</div>`:''}
        <div class="coach-tip">
          <div class="coach-tip-name">${activeCoach.name}</div>
          <div id="tip-${day}-${i}">Target ${ex.reps} reps. ${ex.type==='compound'?'Heavy compound — rest fully and brace hard.':'Isolation — focus on the squeeze and controlled tempo.'}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function calcTargetWeight(name){
  const hist=planState.history[name];
  if(!hist?.length)return'';
  const last=hist[hist.length-1];
  const goal=planState.goal||'mass';
  const rules=GOAL_RULES[goal]||GOAL_RULES.mass;
  const{increaseAt,dropBelow}=rules;
  if(last.reps>=increaseAt){
    const s=getIncrement(name,goal,'up');
    return(last.weight+s).toFixed(1);
  }
  if(last.reps<dropBelow){
    const d=getIncrement(name,goal,'drop');
    return Math.max(0,last.weight-d).toFixed(1);
  }
  return last.weight.toFixed(1);
}

function calcTarget(name){
  const hist=planState.history[name];
  if(!hist?.length)return'NEW';
  const last=hist[hist.length-1];
  const goal=planState.goal||'mass';
  const rules=GOAL_RULES[goal]||GOAL_RULES.mass;
  const{increaseAt,dropBelow}=rules;
  if(last.reps>=increaseAt){
    const s=getIncrement(name,goal,'up');
    return`ADD ${s}kg → ${(last.weight+s).toFixed(1)}kg`;
  }
  if(last.reps<dropBelow){
    const d=getIncrement(name,goal,'drop');
    return`DROP → ${Math.max(0,last.weight-d).toFixed(1)}kg`;
  }
  const needed=increaseAt-last.reps;
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

  if(el.classList.contains('checked')){
    // Save data for working sets only
    if(!isWarmup&&w&&r){
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
      saveData();
      updateNextSet(row,exName,w,r);
    }
    startRestTimer(isWarmup?'Warm-up set':exName,r||10);
    // Check if exercise is fully done — works even if w/r empty
    checkExerciseComplete(el,day,idx);
  }
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
function markDone(el){
  el.classList.toggle('checked');
  if(el.classList.contains('checked')){
    startRestTimer('Warm-up set',15);
  }
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

