const COACH_VOLUME={
  ivan: {min:1,   opt:3,   max:5,   note:'1 all-out set IS sufficient — High Intensity Training principle'},
  caesar:{min:12,  opt:18,  max:25,  note:'High volume is the stimulus — more sets means more pump and growth'},
  blaze: {min:15,  opt:22,  max:30,  note:'Maximum volume approach — every set counts toward exhaustion'},
  thor:  {min:8,   opt:14,  max:20,  note:'Moderate-high volume on big compound lifts'},
  rex:   {min:8,   opt:14,  max:18,  note:'Strength-first with moderate hypertrophy volume'},
  marcus:{min:9,   opt:15,  max:21,  note:'Consistent moderate volume — same effort every session'},
  ford:  {min:10,  opt:16,  max:20,  note:'Evidence-based MEV to MAV range for hypertrophy'},
  zen:   {min:8,   opt:12,  max:16,  note:'Quality over quantity — controlled reps, full mind-muscle'},
  aria:  {min:10,  opt:16,  max:20,  note:'Adaptive — balanced evidence-based volume targets'}
};

function coachVolConfig(){
  return COACH_VOLUME[activeCoach.id]||COACH_VOLUME.aria;
}

// Stall detection — same weight 3+ sessions on same exercise
// ── EXERCISE CLASSIFICATION DATABASE ─────────────────────────────
const EX_PROFILE={
  'Squat':                {cat:'lower_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:5,  isolMulti:1},
  'Deadlift':             {cat:'lower_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:5,  isolMulti:1},
  'Romanian Deadlift':    {cat:'lower_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Stiff-Leg Deadlift':   {cat:'lower_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Front Squat':          {cat:'lower_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Hack Squat':           {cat:'lower_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:5,  isolMulti:1},
  'Leg Press':            {cat:'lower_compound',loadClass:'heavy', weeklyGain:5,  sessionGain:5,  isolMulti:1},
  'Bulgarian Split Squat':{cat:'lower_compound',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Hip Thrust':           {cat:'lower_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Lunges':               {cat:'lower_compound',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Bench Press':          {cat:'upper_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Incline Bench Press':  {cat:'upper_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Decline Bench Press':  {cat:'upper_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Close Grip Bench':     {cat:'upper_compound',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Barbell Row':          {cat:'upper_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'T-Bar Row':            {cat:'upper_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Pendlay Row':          {cat:'upper_compound',loadClass:'heavy', weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Overhead Press':       {cat:'upper_compound',loadClass:'medium',weeklyGain:1.25,sessionGain:1.25,isolMulti:1},
  'Push Press':           {cat:'upper_compound',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Pull-Ups':             {cat:'upper_compound',loadClass:'bw',    weeklyGain:1.25,sessionGain:1.25,isolMulti:1},
  'Chin-Ups':             {cat:'upper_compound',loadClass:'bw',    weeklyGain:1.25,sessionGain:1.25,isolMulti:1},
  'Lat Pulldown':         {cat:'upper_compound',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Cable Row':            {cat:'upper_compound',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:1},
  'Dumbbell Row':         {cat:'upper_compound',loadClass:'medium',weeklyGain:2,  sessionGain:2,  isolMulti:1},
  'Lateral Raises':       {cat:'isolation',loadClass:'light', weeklyGain:0.5,sessionGain:0.5,isolMulti:0.5},
  'Rear Delt Flyes':      {cat:'isolation',loadClass:'light', weeklyGain:0.5,sessionGain:0.5,isolMulti:0.5},
  'Front Raises':         {cat:'isolation',loadClass:'light', weeklyGain:0.5,sessionGain:0.5,isolMulti:0.5},
  'Face Pulls':           {cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:2.5,isolMulti:0.5},
  'Arnold Press':         {cat:'isolation',loadClass:'medium',weeklyGain:1,  sessionGain:1,  isolMulti:0.5},
  'Dumbbell Shoulder Press':{cat:'isolation',loadClass:'medium',weeklyGain:1,sessionGain:1, isolMulti:0.5},
  'Dumbbell Flyes':       {cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:1,  isolMulti:0.5},
  'Cable Crossover':      {cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:1,  isolMulti:0.5},
  'Pec Deck':             {cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:2.5,isolMulti:0.5},
  'Barbell Curl':         {cat:'isolation',loadClass:'medium',weeklyGain:1,  sessionGain:1.25,isolMulti:0.5},
  'Dumbbell Curl':        {cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:1,  isolMulti:0.5},
  'Hammer Curl':          {cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:1,  isolMulti:0.5},
  'Cable Curl':           {cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:2.5,isolMulti:0.5},
  'Preacher Curl':        {cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:1.25,isolMulti:0.5},
  'Concentration Curl':   {cat:'isolation',loadClass:'light', weeklyGain:0.5,sessionGain:0.5,isolMulti:0.5},
  'Incline Dumbbell Curl':{cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:1,  isolMulti:0.5},
  'Cross-Body Hammer Curl':{cat:'isolation',loadClass:'light',weeklyGain:1,  sessionGain:1,  isolMulti:0.5},
  'Skull Crushers':       {cat:'isolation',loadClass:'medium',weeklyGain:1,  sessionGain:1.25,isolMulti:0.5},
  'Tricep Pushdown':      {cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:2.5,isolMulti:0.5},
  'Overhead Tricep Extension':{cat:'isolation',loadClass:'light',weeklyGain:1,sessionGain:1.25,isolMulti:0.5},
  'Dips':                 {cat:'isolation',loadClass:'bw',    weeklyGain:1,  sessionGain:1.25,isolMulti:0.5},
  'Leg Curl':             {cat:'isolation',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:0.5},
  'Leg Extension':        {cat:'isolation',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:0.5},
  'Calf Raises':          {cat:'isolation',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:0.5},
  'Seated Calf Raise':    {cat:'isolation',loadClass:'light', weeklyGain:2.5,sessionGain:2.5,isolMulti:0.5},
  'Glute Kickback':       {cat:'isolation',loadClass:'light', weeklyGain:1,  sessionGain:1,  isolMulti:0.5},
  'Adductor Machine':     {cat:'isolation',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:0.5},
};

// ── GOAL PROGRESSION RULES ────────────────────────────────────────
const GOAL_RULES={
  strength:   {repRange:[3,5],  increaseAt:5,  dropBelow:3,  dropPct:0.10},
  mass:       {repRange:[6,12], increaseAt:12, dropBelow:6,  dropPct:0.10},
  recomp:     {repRange:[8,12], increaseAt:12, dropBelow:7,  dropPct:0.10},
  fatloss:    {repRange:[12,20],increaseAt:18, dropBelow:10, dropPct:0.10},
  endurance:  {repRange:[15,25],increaseAt:22, dropBelow:12, dropPct:0.08},
  maintenance:{repRange:[8,15], increaseAt:999,dropBelow:6,  dropPct:0.08},
};

function getExProfile(name){
  if(EX_PROFILE[name])return EX_PROFILE[name];
  const l=name.toLowerCase();
  if(/curl|raise|fly|flye|extension|pushdown|kickback|adduct|pec|crossover/.test(l))
    return{cat:'isolation',    loadClass:'light', weeklyGain:1,  sessionGain:1,  isolMulti:0.5};
  if(/squat|deadlift|leg press|lunge|hip|glute/.test(l))
    return{cat:'lower_compound',loadClass:'heavy',weeklyGain:2.5,sessionGain:5,  isolMulti:1};
  return{cat:'upper_compound',loadClass:'medium',weeklyGain:2.5,sessionGain:2.5,isolMulti:1};
}

function getTrainingAge(){
  const hist=planState.history||{};
  let total=0;
  for(const ex in hist)total+=hist[ex].length;
  if(total<30) return'beginner';
  if(total<150)return'intermediate';
  return'advanced';
}

function getIncrement(exName,goal,direction){
  const prof=getExProfile(exName);
  const age=getTrainingAge();
  const isLower=prof.cat==='lower_compound';
  const isIso=prof.cat==='isolation';
  const rules=GOAL_RULES[goal]||GOAL_RULES.mass;
  let step=prof.sessionGain;
  if(age==='beginner'&&isLower)step=Math.max(step,5);
  if(age==='advanced')step=Math.max(step*0.5,1.25);
  if(goal==='fatloss'||goal==='endurance')step=Math.max(step*0.5,1.25);
  if(goal==='maintenance')step=0;
  if(isIso)step=Math.min(step,2.5);
  if(direction==='drop'){
    const h=planState.history[exName];
    const lastW=h&&h.length?h[h.length-1].weight:null;
    if(lastW)return Math.round(lastW*(rules.dropPct||0.10)/1.25)*1.25;
    return step;
  }
  return Math.round(step/1.25)*1.25;
}

// ── STALL DETECTION — smarter (4 sessions, checks reps too) ──────
function detectStall(exName){
  const h=planState.history[exName];
  if(!h||h.length<4)return false;
  const last4=h.slice(-4);
  const weightStuck=last4.every(s=>s.weight===last4[0].weight);
  const maxReps=Math.max(...last4.map(s=>s.reps));
  const minReps=Math.min(...last4.map(s=>s.reps));
  return weightStuck&&(maxReps-minReps)<=1;
}

// ── STALL BUSTERS — exercise-specific + coach personality ─────────
function stallBuster(exName){
  const id=activeCoach.id;
  const prof=getExProfile(exName);
  const isIso=prof.cat==='isolation';
  const age=getTrainingAge();
  const exBusters={
    'Bench Press':   'Try paused reps (2s pause at chest) — eliminates the stretch reflex and builds real strength off the chest.',
    'Squat':         'Add a tempo: 3s down, 1s pause in the hole. Exposes weaknesses and drives adaptation without adding weight.',
    'Deadlift':      'Switch to deficit deadlifts (stand on 2-5cm plate) for 3 weeks — strengthens the hardest part of the pull.',
    'Overhead Press':'OHP stalls fastest. Add 1.25kg micro-plates — the jump from 2.5kg is often too large for OHP.',
    'Pull-Ups':      'Add band-assisted volume sets or try negatives (jump up, lower in 5s). More volume before adding load.',
    'Barbell Row':   'Reset to 80% of current weight, focus on a 1s pause at the top. Row strength needs technique as much as load.',
    'Lateral Raises':'Slow the eccentric to 3s. You don\'t need heavier — you need more tension. Cheat raises kill delts.',
    'Leg Press':     'Add half-reps at the top after each full rep — this burns out the quads when full ROM stalls.',
    'Hip Thrust':    'Add a 2s pause at the top of each rep — forces full glute contraction and breaks mechanical stalls.',
  };
  if(exBusters[exName])return`${exName} plateaued. ${exBusters[exName]}`;
  if(isIso){
    if(id==='ivan')  return`${exName} stalled. Rest-pause: failure, 15s rest, grind 3-4 more. One brutal set beats three lazy ones.`;
    if(id==='caesar')return`${exName} stalled. Drop set: current weight to failure, drop 20%, failure again, drop 20%, finish. That's the pump that breaks it.`;
    return`${exName} stalled. Switch to a cable variation for 3 weeks — constant tension is a new stimulus. Come back stronger.`;
  }
  if(age==='beginner')return`${exName} stalled — unusual for a beginner. Check sleep (7-9h), protein (${Math.round((state.weight||80)*2)}g/day), and training frequency. These fix 90% of beginner plateaus.`;
  if(age==='advanced')return`${exName} plateau expected at your level. Options: (1) Deload 15% for 1 week, (2) Switch rep range for 4 weeks, (3) Add a slow-tempo technique set before working sets.`;
  if(id==='ivan')  return`${exName} stalled. One top set to absolute failure with a training partner. The mind gives up before the muscle.`;
  if(id==='ford')  return`${exName} stalled. Micro-load: add 1.25kg. If plates unavailable, add 1 rep per session. Precision beats aggression.`;
  if(id==='marcus')return`${exName} stalled. Show up. Same weight. Stricter form. Discipline through the plateau.`;
  if(id==='zen')   return`${exName} stalled. Slow the tempo: 4s eccentric, 1s pause, 2s concentric. Master the movement before chasing the load.`;
  return`${exName} plateaued for 4 sessions. Deload 10%, hit +1 rep per set for 2 sessions, then reload. Volume beats stubbornness.`;
}

// Auto-adjust today's session based on recovery
function applyRecoveryAdjustment(session){
  const rec=state.recovery;
  if(rec===null||session.isRest)return session;
  if(rec>=60)return session; // no change

  // Low recovery — reduce sets by 1 (Ivan stays at 1 always)
  const adjusted={...session,exercises:session.exercises.map(ex=>{
    const id=activeCoach.id;
    if(id==='ivan')return ex; // HIT: 1 set is already minimum — never reduce
    const reducedSets=Math.max(1,ex.sets-1);
    return{...ex,sets:reducedSets};
  })};
  adjusted._recoveryAdjusted=true;
  adjusted._recoveryScore=rec;
  return adjusted;
}

// Auto-fix undertrained/overtrained muscles in the plan
function autoBalancePlan(){
  if(!planState.plan)return;
  const vol=calcWeeklyVolume();
  const cfg=coachVolConfig();
  const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  for(const muscle in vol){
    // OVERTRAINED — remove lowest-priority isolation from next relevant session
    if(vol[muscle]>cfg.max){
      for(const day of DAYS){
        const s=planState.plan[day];
        if(!s||s.isRest)continue;
        const relevant=s.exercises.filter(e=>e.muscle===muscle&&e.type==='isolation');
        if(relevant.length>0){
          // Remove last isolation exercise for this muscle
          const idx=s.exercises.lastIndexOf(relevant[relevant.length-1]);
          s.exercises.splice(idx,1);
          break;
        }
      }
    }

    // UNDERTRAINED — add one exercise to next relevant session (skip Ivan — he's always enough)
    if(activeCoach.id!=='ivan'&&vol[muscle]>0&&vol[muscle]<cfg.min){
      for(const day of DAYS){
        const s=planState.plan[day];
        if(!s||s.isRest)continue;
        if(s.muscles.includes(muscle)){
          const sch=getSetScheme(planState.goal);
          const pool=pickForGroup(muscle,1);
          if(pool.length){
            const ex=pool[0];
            // Only add if not already in this session
            const alreadyThere=s.exercises.some(e=>e.name===ex.name);
            if(!alreadyThere){
              s.exercises.push({
                name:ex.name,muscle:ex.group,region:ex.region,
                type:ex.type,cue:ex.cue,sets:sch.sets,warmups:sch.warmups,
                reps:repsForExercise(ex,planState.goal),
                _autoAdded:true
              });
            }
          }
          break;
        }
      }
    }
  }
  saveData();
}

function renderDirectiveBoard(){
  const board=document.getElementById('directive-board');
  if(!board)return;
  document.getElementById('directive-coach-lbl').textContent=activeCoach.name;
  const cards=[];
  const day=planState.currentDay||getTodayDay();
  const rawSession=planState.plan?.[day];
  const rec=state.recovery;
  const cfg=coachVolConfig();

  // Run auto-balance once when board renders (silently adjusts plan)
  if(planState.plan)autoBalancePlan();

  // Apply recovery adjustment for display
  const session=rawSession?applyRecoveryAdjustment(rawSession):null;

  // 1. Recovery card — coach-voiced
  if(rec!==null){
    const col=rec>=85?'var(--green)':rec>=60?'var(--gold)':'var(--red)';
    const icon=rec>=85?'ti-bolt':rec>=60?'ti-activity':'ti-bed';
    let txt;
    if(rec>=85){
      const id=activeCoach.id;
      txt=id==='ivan'?`Recovery at ${rec}% — CNS is primed. Today your working set must reach absolute failure. No excuses.`:
          id==='blaze'?`Recovery at ${rec}%! Attack everything today. Add a drop set to every working set. The body is ready.`:
          id==='caesar'?`Recovery is ${rec}% — MAGNIFICO! Today the muscle is ready to be annihilated with volume!`:
          `Recovery ${rec}% — green light. Push your working weights hard today.`;
    } else if(rec>=60){
      txt=`Recovery ${rec}% — moderate. Train as planned. Listen to your body on the last rep of each set.`;
    } else {
      const id=activeCoach.id;
      txt=id==='ivan'?`Recovery only ${rec}%. The body is not ready. Either rest completely or reduce to warm-ups only — forced training on a fatigued CNS is counterproductive.`:
          `Recovery ${rec}% — I've automatically reduced your sets by 1 today to protect your recovery. Train smart, not hard.`;
    }
    cards.push({icon,col,title:'Recovery',txt});
  } else {
    cards.push({icon:'ti-bed',col:'var(--muted)',title:'Recovery',txt:'Log sleep in Profile → Health Log to get recovery-based session adjustments.'});
  }

  // 2. Today's session card
  if(session){
    if(session.isRest){
      const id=activeCoach.id;
      const restMsg=id==='ivan'?'Rest day. This is where the growth happens. Do not train. Sleep, eat, recover.':
                    id==='marcus'?'Scheduled rest day. Recovery is part of the mission. Execute it.':
                    id==='zen'?'Rest day — but not idle. Breathe, stretch, connect to the body without iron.':
                    'Rest day. Stick to the plan — recovery is training too.';
      cards.push({icon:'ti-zzz',col:'var(--muted)',title:'Rest Day',txt:restMsg});
    } else {
      const exCount=session.exercises.length;
      const totalSets=session.exercises.reduce((a,e)=>a+(e.sets||0),0);
      const adjusted=session._recoveryAdjusted?` (reduced from full volume — recovery at ${session._recoveryScore}%)`:'';
      cards.push({
        icon:'ti-barbell',col:'var(--gold)',
        title:'Today: '+session.name,
        txt:`${exCount} exercises · ${totalSets} working sets · ${session.muscles.join(', ')}${adjusted}.`
      });
    }
  } else {
    cards.push({icon:'ti-clipboard',col:'var(--muted)',title:'No Plan',txt:'Set up your training plan in the Workout tab.'});
  }

  // 3. Volume card — coach-aware, no dumb alerts for Ivan
  if(planState.plan){
    const vol=calcWeeklyVolume();
    const issues=[];
    for(const m in vol){
      if(activeCoach.id==='ivan'){
        // Ivan: only flag if somehow >5 sets on a muscle — that contradicts his philosophy
        if(vol[m]>5)issues.push(`${m} has ${vol[m]} sets/week — above Ivan's HIT protocol. Your plan should have 1 working set per muscle. Review your plan.`);
      } else {
        if(vol[m]>0&&vol[m]<cfg.min)issues.push(`${m}: ${vol[m]} sets/week is below ${activeCoach.name}'s minimum of ${cfg.min}. Auto-adjusting next session.`);
        if(vol[m]>cfg.max)issues.push(`${m}: ${vol[m]} sets/week exceeds ${activeCoach.name}'s maximum of ${cfg.max}. Removing excess isolation work.`);
      }
    }
    if(issues.length){
      cards.push({icon:'ti-adjustments',col:'var(--orange)',title:'Plan Auto-Adjusted',txt:issues.slice(0,2).join(' ')});
    } else if(Object.keys(vol).length>0){
      const totalSetsWeek=Object.values(vol).reduce((a,b)=>a+b,0);
      cards.push({icon:'ti-check',col:'var(--green)',title:'Volume On Track',txt:`Weekly plan: ${totalSetsWeek} total sets across ${Object.keys(vol).length} muscle groups. Within ${activeCoach.name}'s optimal range (${cfg.note}).`});
    }
  }

  // 4. Stall detection across recent exercises
  const stalls=Object.keys(planState.history||{}).filter(detectStall);
  if(stalls.length>0){
    cards.push({icon:'ti-alert-circle',col:'var(--orange)',title:'Plateau Detected',txt:stallBuster(stalls[0])});
  }

  // 5. Progression from last logged session
  const prog=getLatestProgressionTip();
  if(prog)cards.push({icon:'ti-trending-up',col:'var(--green)',title:'Progression',txt:prog});

  // 6. Cardio reminder (every goal except endurance)
  const cardio=getCardioReminder();
  if(cardio)cards.push({icon:'ti-heart',col:'var(--blue)',title:'Daily Cardio',txt:cardio});

  board.innerHTML=cards.map(c=>`
    <div style="background:var(--bg2);border-left:3px solid ${c.col};padding:12px 14px;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <i class="ti ${c.icon}" style="font-size:18px;color:${c.col}"></i>
        <span style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${c.col}">${c.title}</span>
      </div>
      <div style="font-size:13px;color:var(--muted2);line-height:1.5">${c.txt}</div>
    </div>`).join('');
}

function getLatestProgressionTip(){
  let latest=null,latestName=null;
  for(const name in planState.history){
    const h=planState.history[name];
    if(h.length){
      const last=h[h.length-1];
      if(!latest||last.date>=latest.date){latest=last;latestName=name;}
    }
  }
  if(!latest)return null;
  const goal=planState.goal||'mass';
  const rules=GOAL_RULES[goal]||GOAL_RULES.mass;
  const step=getIncrement(latestName,goal,'up');
  const{increaseAt,repRange}=rules;
  if(latest.reps>=increaseAt){
    return`${latestName}: ${latest.weight}kg × ${latest.reps} reps — time to go up. Add ${step}kg next session → ${(latest.weight+step).toFixed(1)}kg.`;
  }
  const needed=increaseAt-latest.reps;
  return`${latestName}: ${latest.weight}kg × ${latest.reps} reps. Need ${needed} more rep${needed>1?'s':''} to earn the weight increase. Stay in the range.`;
}

function startOnboarding(){
  document.getElementById('welcome-modal').classList.remove('open');
  goPage('workout');
}

// Data-driven coach query — reads actual user data to answer questions
function coachAnswer(msg){
  const lower=msg.toLowerCase();
  const c=activeCoach;

  // Find mentioned exercise from history
  const histKeys=Object.keys(planState.history||{});
  const mentionedEx=histKeys.find(name=>lower.includes(name.toLowerCase().split(' ')[0]));

  if(mentionedEx){
    const hist=planState.history[mentionedEx];
    const last=hist[hist.length-1];
    const target=calcTargetWeight(mentionedEx);
    const orm=epley(last.weight,last.reps);
    const prevOrm=hist.length>1?epley(hist[hist.length-2].weight,hist[hist.length-2].reps):null;
    const trend=prevOrm?(orm>prevOrm?'↑ up':'↓ down'):null;
    return `${mentionedEx}: last session ${last.weight}kg × ${last.reps} reps (${last.date}). Est. 1RM: ${orm}kg${trend?' — '+trend+' from previous session':''}.${target?' Next target: '+target+'kg.':' First time — start light and feel it out.'}`;
  }

  // Recovery question
  if(lower.includes('recover')||lower.includes('sleep')||lower.includes('tired')||lower.includes('rest')){
    const rec=state.recovery;
    if(rec!==null){
      const status=rec>=85?'strong — green light to push hard today':rec>=60?'moderate — train as planned but listen to your body':'low — reduce volume by 30% or take an active recovery day';
      return `Your recovery is ${rec}% — ${status}. ${c.responses.recovery?pick(c.responses.recovery):''}`;
    }
    return 'Log your sleep in the Profile tab to get recovery-based advice. I need that data to give you an accurate picture.';
  }

  // Volume/plan question
  if(lower.includes('volume')||lower.includes('sets')||lower.includes('plan')){
    const vol=calcWeeklyVolume();
    if(Object.keys(vol).length){
      const entries=Object.entries(vol).map(([m,s])=>`${m}: ${s} sets`).join(', ');
      return `Current weekly volume — ${entries}. Optimal hypertrophy range is 10-20 sets per muscle per week.`;
    }
    return 'No workout data yet. Build your plan in the Workout tab and start logging sessions.';
  }

  // PR question
  if(lower.includes('pr')||lower.includes('record')||lower.includes('best')||lower.includes('1rm')||lower.includes('max')){
    const prs=getAllPRs();
    const top=Object.entries(prs).sort((a,b)=>b[1]-a[1]).slice(0,3);
    if(top.length)return `Your top estimated 1RMs: ${top.map(([n,v])=>n+' '+v+'kg').join(', ')}. Check the Strength tab for full history.`;
    return 'No PRs logged yet. Start logging your sets in the Workout tab.';
  }

  // Progress question
  if(lower.includes('progress')||lower.includes('improve')||lower.includes('trend')){
    const tip=getLatestProgressionTip();
    return tip||'Keep logging consistently to see your progression trends.';
  }

  // Today / what should I do
  if(lower.includes('today')||lower.includes('do')||lower.includes('train')||lower.includes('session')){
    return generateInsight();
  }

  // Fallback — direct to directive board
  return `I don't have enough context for that yet. Check the Directive Board above — it reads your actual data (recovery, volume, last session) and gives you a daily action. ${c.responses.default?pick(c.responses.default):''}`;
}

function submitCoachQuery(){
  const inp=document.getElementById('coach-query-input');
  if(!inp)return;
  const msg=inp.value.trim();
  if(!msg)return;
  const answer=coachAnswer(msg);
  const result=document.getElementById('coach-query-result');
  if(result){
    result.style.display='block';
    result.innerHTML=`<div style="background:var(--bg2);border-left:3px solid var(--gold);padding:14px 16px">
      <div style="font-size:9px;font-weight:700;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:6px">${activeCoach.name}</div>
      <div style="font-size:13px;color:var(--muted2);line-height:1.6">${answer}</div>
      <div style="font-size:10px;color:var(--muted);margin-top:8px">Based on your logged data · ${today()}</div>
    </div>`;
  }
  inp.value='';
}

// Gender-aware BMR using Mifflin-St Jeor formula
// Male:   BMR = 10×weight + 6.25×height − 5×age + 5
// Female: BMR = 10×weight + 6.25×height − 5×age − 161
// Falls back to lean-mass method if age/height missing
function calcBMR(w,h,age,gender,bf){
  if(h&&age){
    if(gender==='f')return Math.round(10*w+6.25*h-5*age-161);
    return Math.round(10*w+6.25*h-5*age+5);
  }
  // Fallback: Katch-McArdle from lean mass (gender-neutral but needs BF%)
  const defaultBF=gender==='f'?0.25:0.18;// female avg ~25%, male avg ~18%
  const lean=bf?w*(1-bf/100):w*(1-defaultBF);
  return Math.round(370+(21.6*lean));
}

// Gender-aware lean mass estimate
function estLean(w,bf,gender){
  const defaultBF=gender==='f'?0.25:0.18;
  return bf?w*(1-bf/100):w*(1-(defaultBF));
}

// Gender-aware protein multiplier — females need slightly less per kg lean mass
// Evidence: 1.6-2.2g/kg for males, 1.4-2.0g/kg for females
function protPerKgLean(gender,goal){
  const base=gender==='f'?1.8:2.2;
  if(goal==='fatloss')return base+0.2;// higher in deficit to preserve muscle
  if(goal==='recomp')return base+0.1;
  return base;
}

function initComparisonDates(){
  const toEl=document.getElementById('comp-to');
  const fromEl=document.getElementById('comp-from');
  if(toEl&&!toEl.value)toEl.value=today();
  if(fromEl&&!fromEl.value){
    const d=new Date();d.setDate(d.getDate()-30);
    fromEl.value=d.toISOString().split('T')[0];
  }
}

