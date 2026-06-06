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
function detectStall(exName){
  const h=planState.history[exName];
  if(!h||h.length<3)return false;
  const last3=h.slice(-3);
  return last3.every(s=>s.weight===last3[0].weight);
}

// Get coach's signature stall-buster technique
function stallBuster(exName){
  const id=activeCoach.id;
  if(id==='ivan')return`${exName} stalled. Apply rest-pause: hit failure, rest 15 seconds, grind 3-5 more reps. This extends the one set beyond normal failure.`;
  if(id==='caesar')return`${exName} stalled. Add a triple drop set after your working sets — drop weight 20% three times with no rest. The pump will break the plateau.`;
  if(id==='blaze')return`${exName} stalled. Superset with an isolation movement and add a drop set. Volume is your solution — attack it harder.`;
  if(id==='zen')return`${exName} stalled. Slow the tempo to 4-2-4. The weight doesn't need to go up — the connection needs to deepen. Master the movement first.`;
  if(id==='rex'||id==='thor')return`${exName} stalled. Deload 20% for one session, then come back fresh and aim for a new rep PR. Strength responds to reset.`;
  if(id==='ford')return`${exName} stalled. Introduce a micro-load (1.25kg plates). If unavailable, target +1 rep per session instead of weight increase.`;
  if(id==='marcus')return`${exName} stalled. Show up anyway. Perform the same weight with stricter form. Discipline through the plateau.`;
  return`${exName} stalled at the same weight for 3 sessions. Try adding 1 rep rather than weight, or deload 15% and rebuild.`;
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
  if(latest.reps>=10)return `${latestName}: last set ${latest.weight}kg × ${latest.reps}. Increase to ${(latest.weight+2.5).toFixed(1)}kg next session.`;
  if(latest.reps>=6)return `${latestName}: ${latest.weight}kg × ${latest.reps} is solid. Aim for ${latest.reps+1}+ reps before adding weight.`;
  return `${latestName}: ${latest.reps} reps is below target. Hold ${latest.weight}kg and build reps, or drop 2.5kg.`;
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

