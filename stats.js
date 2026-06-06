// ── EXERCISE PICKER (add to current day) ──────────────────────
let allEx=Object.entries(ALL_EXERCISES).flatMap(([cat,arr])=>arr.map(e=>({...e,cat})));
let currentCat='all';
function openPicker(){document.getElementById('ex-picker').classList.add('open');renderExList();}
function closePicker(){document.getElementById('ex-picker').classList.remove('open');}
function filterExercises(){renderExList();}
function filterCat(el,cat){
  document.querySelectorAll('.pcat').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');currentCat=cat;renderExList();
}
function renderExList(){
  const search=document.getElementById('ex-search').value.toLowerCase();
  const filtered=allEx.filter(e=>(currentCat==='all'||e.cat===currentCat)&&e.name.toLowerCase().includes(search));
  document.getElementById('ex-list').innerHTML=filtered.map(e=>`
    <div class="ex-opt" onclick="addExerciseToDay('${e.name}','${e.cat}')">
      <div><div class="ex-opt-name">${e.name}</div><div class="ex-opt-cat">${e.cat.charAt(0).toUpperCase()+e.cat.slice(1)}</div></div>
      <i class="ti ti-plus" style="font-size:16px;color:var(--muted)"></i>
    </div>`).join('');
}
function addExerciseToDay(name,cat){
  const day=planState.currentDay||getTodayDay();
  if(!planState.plan)return;
  if(!planState.plan[day]||planState.plan[day].isRest)planState.plan[day]={name:'Custom',muscles:[cat],exercises:[]};
  const ex=EX_DB.find(e=>e.name===name);
  const sch=getSetScheme(planState.goal);
  if(ex){
    planState.plan[day].exercises.push({name:ex.name,muscle:ex.group,region:ex.region,type:ex.type,cue:ex.cue,sets:sch.sets,warmups:sch.warmups,reps:repsForExercise(ex,planState.goal)});
  } else {
    planState.plan[day].exercises.push({name,muscle:cat,sets:3,reps:10,warmups:1});
  }
  if(!planState.plan[day].muscles.includes(cat))planState.plan[day].muscles.push(cat);
  closePicker();
  renderDayWorkout(day);
  saveData();
}
function toggleEx(sId,bId){
  const s=document.getElementById(sId),b=document.getElementById(bId);
  const wasOpen=s.classList.contains('open');
  document.querySelectorAll('.sets-area').forEach(a=>a.classList.remove('open'));
  document.querySelectorAll('.ex-block').forEach(b=>b.classList.remove('active-ex'));
  if(!wasOpen){s.classList.add('open');b.classList.add('active-ex');}
}

function finishWorkout(){
  state.streak++;
  document.getElementById('home-streak').innerHTML=state.streak+'<span class="scard-unit">d</span>';
  document.getElementById('p-streak').innerHTML=`<i class="ti ti-flame" style="font-size:14px"></i> ${state.streak} Day Streak`;
  toast('Workout complete! Streak: '+state.streak+' days');saveData();
}

// ── STATS ─────────────────────────────────────────────────────
function switchStatsTab(id){
  const ids=['overview','measure','fat','symmetry','trends','strength'];
  document.querySelectorAll('.tbt').forEach((b,i)=>b.classList.toggle('on',ids[i]===id));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('on'));
  document.getElementById('pan-'+id).classList.add('on');
  if(id==='symmetry')calcSymmetry();
  if(id==='trends')renderAllTrends();
  if(id==='strength'){renderPRList();renderStrengthChart();checkDeload();}
}

function updateGender(){
  state.gender=document.getElementById('prof-gender').value;
  const isM=state.gender==='m';
  document.getElementById('sites-3-male').style.display=isM?'block':'none';
  document.getElementById('sites-3-female').style.display=isM?'none':'block';
}

function setCaliper(n){
  state.caliperMethod=n;
  document.getElementById('cm-3').classList.toggle('on',n===3);
  document.getElementById('cm-7').classList.toggle('on',n===7);
  document.getElementById('sites-3').style.display=n===3?'block':'none';
  document.getElementById('sites-7').style.display=n===7?'block':'none';
}

function calcOverview(){
  const w=parseWt(document.getElementById('prof-weight').value);
  const hRaw=parseFloat(document.getElementById('prof-height').value);
  const h=isImperial()?hRaw*IN_TO_CM:hRaw;// height in cm
  const bf=parseFloat(document.getElementById('prof-bf').value);
  if(!w||!h){toast('Enter weight and height first');return;}
  const bmi=w/((h/100)**2);
  const bmiLbl=bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obese';
  document.getElementById('ov-weight').innerHTML=w.toFixed(1)+'<span class="mc-unit">kg</span>';
  document.getElementById('ov-bmi').innerHTML=bmi.toFixed(1);
  document.getElementById('ov-bmi-lbl').textContent=bmiLbl;
  if(!isNaN(bf)&&bf>0){
    const fm=w*(bf/100),lm=w-fm,hm=h/100,ffmi=lm/(hm*hm);
    const ffmiLbl=ffmi<18?'Below Average':ffmi<20?'Average':ffmi<22?'Above Average':ffmi<23?'Excellent':ffmi<25?'Superior':'Elite';
    document.getElementById('ov-bf').innerHTML=bf.toFixed(1)+'<span class="mc-unit">%</span>';
    document.getElementById('ov-fatmass').innerHTML=fm.toFixed(1)+'<span class="mc-unit">kg</span>';
    document.getElementById('ov-leanmass').innerHTML=lm.toFixed(1)+'<span class="mc-unit">kg</span>';
    document.getElementById('ov-ffmi').innerHTML=ffmi.toFixed(1);
    document.getElementById('ov-ffmi-lbl').textContent=ffmiLbl;
  }
  toast('Overview calculated');saveData();
}

function logWeight(){
  const raw=document.getElementById('log-weight').value;
  const v=parseWt(raw);
  if(!v){toast('Enter a weight first');return;}
  state.weight=v;
  logEntry(state.weightLog,v);
  document.getElementById('prof-weight').value=v;
  document.getElementById('home-weight').innerHTML=dispWt(v)+'<span class="scard-unit">'+wtUnit()+'</span>';
  document.getElementById('home-weight-sub').textContent='Logged today';
  document.getElementById('home-weight-sub').style.color='var(--green)';
  calcOverview();
  updateProgressBar();
  toast('Weight logged: '+dispWt(v));saveData();
}

function saveMeasurements(){
  const fields=['neck','shoulders','upperchest','chest','lbicep-r','lbicep-f','rbicep-r','rbicep-f','lforearm','rforearm','lwrist','rwrist','waist','navel','hips','lquad','rquad','lham','rham','lcalf','rcalf'];
  fields.forEach(f=>{
    const el=document.getElementById('m-'+f);
    if(el&&el.value){
      // Always store in cm internally
      state.measurements[f]=parseLen(el.value);
    }
  });
  const d=state.measurements;
  const upd=(id,val)=>{if(val)document.getElementById(id).innerHTML=val.toFixed(1)+'<span class="mc-unit">cm</span>';};
  upd('disp-chest',d.chest);upd('disp-waist',d.waist);upd('disp-hips',d.hips);
  upd('disp-shoulders',d.shoulders);upd('disp-lbicep',d['lbicep-f']);upd('disp-rbicep',d['rbicep-f']);
  upd('disp-lquad',d.lquad);upd('disp-rquad',d.rquad);upd('disp-lcalf',d.lcalf);upd('disp-rcalf',d.rcalf);
  // snapshot measurements with date
  const t=today();const snap={date:t,...JSON.parse(JSON.stringify(state.measurements))};
  const ex=state.measureLog.find(e=>e.date===t);
  if(ex)Object.assign(ex,snap);else state.measureLog.push(snap);
  toast('Measurements saved');saveData();
}

function calcFat(){
  const age=parseFloat(document.getElementById('fat-age').value);
  const w=parseFloat(document.getElementById('prof-weight').value)||80;
  const h=parseFloat(document.getElementById('prof-height').value)||175;
  if(!age){toast('Enter your age first');return;}
  let sum=0,bf=0;
  if(state.caliperMethod===3){
    if(state.gender==='m'){
      const c=parseFloat(document.getElementById('c3m-chest').value)||0;
      const a=parseFloat(document.getElementById('c3m-abdomen').value)||0;
      const t=parseFloat(document.getElementById('c3m-thigh').value)||0;
      sum=c+a+t;
      const d=1.10938-(0.0008267*sum)+(0.0000016*sum*sum)-(0.0002574*age);
      bf=(495/d)-450;
    } else {
      const tr=parseFloat(document.getElementById('c3f-tricep').value)||0;
      const s=parseFloat(document.getElementById('c3f-supra').value)||0;
      const t=parseFloat(document.getElementById('c3f-thigh').value)||0;
      sum=tr+s+t;
      const d=1.0994921-(0.0009929*sum)+(0.0000023*sum*sum)-(0.0001392*age);
      bf=(495/d)-450;
    }
  } else {
    const c=parseFloat(document.getElementById('c7-chest').value)||0;
    const m=parseFloat(document.getElementById('c7-mid').value)||0;
    const tr=parseFloat(document.getElementById('c7-tricep').value)||0;
    const sb=parseFloat(document.getElementById('c7-sub').value)||0;
    const a=parseFloat(document.getElementById('c7-abdomen').value)||0;
    const s=parseFloat(document.getElementById('c7-supra').value)||0;
    const t=parseFloat(document.getElementById('c7-thigh').value)||0;
    sum=c+m+tr+sb+a+s+t;
    if(state.gender==='m'){
      const d=1.112-(0.00043499*sum)+(0.00000055*sum*sum)-(0.00028826*age);
      bf=(495/d)-450;
    } else {
      const d=1.097-(0.00046971*sum)+(0.00000056*sum*sum)-(0.00012828*age);
      bf=(495/d)-450;
    }
  }
  bf=Math.max(3,Math.min(50,bf));
  const fm=w*(bf/100),lm=w-fm,hm=h/100,ffmi=lm/(hm*hm);
  const ffmiLbl=ffmi<18?'Below Average':ffmi<20?'Average':ffmi<22?'Above Average':ffmi<23?'Excellent':ffmi<25?'Superior':'Elite';
  let bfCat,bfColor;
  if(state.gender==='m'){bfCat=bf<6?'Essential':bf<14?'Athletic':bf<18?'Fitness':bf<25?'Average':'Obese';bfColor=bf<14?'var(--green)':bf<18?'var(--gold)':bf<25?'var(--orange)':'var(--red)';}
  else{bfCat=bf<14?'Essential':bf<21?'Athletic':bf<25?'Fitness':bf<32?'Average':'Obese';bfColor=bf<21?'var(--green)':bf<25?'var(--gold)':bf<32?'var(--orange)':'var(--red)';}
  document.getElementById('fat-pct').innerHTML=bf.toFixed(1)+'<span class="mc-unit">%</span>';
  document.getElementById('fat-cat').textContent=bfCat;document.getElementById('fat-cat').style.color=bfColor;
  document.getElementById('fat-mass').innerHTML=fm.toFixed(1)+'<span class="mc-unit">kg</span>';
  document.getElementById('fat-lean').innerHTML=lm.toFixed(1)+'<span class="mc-unit">kg</span>';
  document.getElementById('fat-ffmi').innerHTML=ffmi.toFixed(1);
  document.getElementById('fat-ffmi-lbl').textContent=ffmiLbl;
  document.getElementById('prof-bf').value=bf.toFixed(1);
  logEntry(state.bfLog,parseFloat(bf.toFixed(1)));
  const ins=document.getElementById('fat-insight');
  ins.style.display='block';
  let txt=`<div class="insight-item">Body fat: <strong>${bf.toFixed(1)}% — ${bfCat}</strong></div>`;
  txt+=`<div class="insight-item">FFMI: <strong>${ffmi.toFixed(1)}</strong> (${ffmiLbl}). Natural ceiling ~25.</div>`;
  if(ffmi>=25)txt+=`<div class="insight-item" style="color:var(--red)">FFMI above 25 is extremely rare naturally. Verify measurements.</div>`;
  const targetBF=state.gender==='m'?10:18;
  const fatToLose=Math.max(0,fm-(w*(targetBF/100)));
  if(fatToLose>0.5)txt+=`<div class="insight-item">To reach ${targetBF}% body fat, lose approx <strong>${fatToLose.toFixed(1)}kg fat</strong>.</div>`;
  document.getElementById('fat-insight-text').innerHTML=txt;
  toast('Body fat calculated: '+bf.toFixed(1)+'%');saveData();
}

function calcSymmetry(){
  const d=state.measurements;
  const gender=state.gender||document.getElementById('prof-gender')?.value||'m';

  // Need at least shoulders and waist
  const shoulders=d.shoulders;
  const waist=d.waist;
  const chest=d.chest;
  const hips=d.hips;
  const bicep=((d['lbicep-f']||0)+(d['rbicep-f']||0))/2||(d['lbicep-f']||d['rbicep-f']);
  const neck=d.neck;
  const calf=((d.lcalf||0)+(d.rcalf||0))/2||(d.lcalf||d.rcalf);
  const quad=((d.lquad||0)+(d.rquad||0))/2||(d.lquad||d.rquad);
  const forearm=((d.lforearm||0)+(d.rforearm||0))/2;

  if(!shoulders||!waist){
    document.getElementById('sym-desc').textContent='Enter at least Shoulders and Waist in the Measure tab to calculate your aesthetic score.';
    return;
  }

  // ── GOLDEN RATIO PROPORTIONS ──────────────────────────────────
  // Based on classical aesthetic bodybuilding standards + golden ratio (1.618)
  const GOLDEN=1.618;

  // Gender-specific ideal ratios
  const isMale=gender==='m';

  const ratios=[];

  // 1. SHOULDER-TO-WAIST (V-Taper) — most important aesthetic metric
  // Male ideal: 1.618 (golden ratio). Female ideal: 1.4 (hourglass)
  const swIdeal=isMale?1.618:1.40;
  const swActual=shoulders/waist;
  const swScore=scoreRatio(swActual,swIdeal,0.08);
  ratios.push({
    name:'Shoulder-to-Waist (V-Taper)',
    weight:0.30,
    actual:swActual.toFixed(2),
    ideal:swIdeal.toFixed(2),
    score:swScore,
    unit:'ratio',
    tip:swActual<swIdeal?'Build wider shoulders (lateral raises, OHP) and/or reduce waist with cardio/diet.':
        swActual>swIdeal+0.15?'Waist may be too narrow relative to shoulders — ensure you\'re not in too aggressive a deficit.':
        'V-taper is solid.',
    actual_str:`${shoulders}cm ÷ ${waist}cm = ${swActual.toFixed(2)}`
  });

  // 2. CHEST-TO-WAIST ratio
  // Male ideal: 1.45-1.50. Female ideal: 1.35
  if(chest){
    const cwIdeal=isMale?1.47:1.35;
    const cwActual=chest/waist;
    const cwScore=scoreRatio(cwActual,cwIdeal,0.07);
    ratios.push({
      name:'Chest-to-Waist',
      weight:0.20,
      actual:cwActual.toFixed(2),
      ideal:cwIdeal.toFixed(2),
      score:cwScore,
      unit:'ratio',
      tip:cwActual<cwIdeal?'Build chest thickness (bench press, incline) while managing waist circumference.':'Great chest-to-waist proportion.',
      actual_str:`${chest}cm ÷ ${waist}cm = ${cwActual.toFixed(2)}`
    });
  }

  // 3. WAIST-TO-HIP ratio
  // Male ideal: 0.85-0.90 (athletic). Female ideal: 0.70 (hourglass)
  if(hips){
    const whIdeal=isMale?0.87:0.70;
    const whActual=waist/hips;
    const whScore=scoreRatio(whActual,whIdeal,isMale?0.05:0.04);
    ratios.push({
      name:isMale?'Waist-to-Hip (Athletic)':'Waist-to-Hip (Hourglass)',
      weight:isMale?0.15:0.25,
      actual:whActual.toFixed(2),
      ideal:whIdeal.toFixed(2),
      score:whScore,
      unit:'ratio',
      tip:whActual>whIdeal+0.05?'Waist is high relative to hips — focus on body fat reduction and hip/glute development.':'Waist-to-hip proportion is good.',
      actual_str:`${waist}cm ÷ ${hips}cm = ${whActual.toFixed(2)}`
    });
  }

  // 4. ARM-TO-NECK (flexed bicep should ~= neck) — classic golden-era standard
  if(bicep&&neck){
    const anActual=bicep/neck;
    const anIdeal=1.00;// equal is the goal
    const anScore=scoreRatio(anActual,anIdeal,0.06);
    ratios.push({
      name:'Arm-to-Neck (Bicep = Neck)',
      weight:0.15,
      actual:anActual.toFixed(2),
      ideal:'1.00',
      score:anScore,
      unit:'ratio',
      tip:bicep<neck?`Arms lag behind neck. Need ${(neck-bicep).toFixed(1)}cm more on the bicep — focus on bicep training and reduce any neck/trap excess.`:
          bicep>neck*1.08?'Arms are well developed. Ensure neck/trap development keeps pace.':'Arm-to-neck proportion is balanced.',
      actual_str:`${bicep.toFixed(1)}cm bicep ÷ ${neck}cm neck = ${anActual.toFixed(2)}`
    });
  }

  // 5. CALF-TO-ARM (calves should match flexed arm — classic standard)
  if(calf&&bicep){
    const caActual=calf/bicep;
    const caIdeal=1.00;
    const caScore=scoreRatio(caActual,caIdeal,0.07);
    ratios.push({
      name:'Calf-to-Arm Proportion',
      weight:0.10,
      actual:caActual.toFixed(2),
      ideal:'1.00',
      score:caScore,
      unit:'ratio',
      tip:calf<bicep*0.92?`Calves lag by ${(bicep-calf).toFixed(1)}cm. Add 3-4 sets of heavy calf raises (standing + seated) per session.`:'Calf-to-arm proportion is balanced.',
      actual_str:`${calf.toFixed(1)}cm calf ÷ ${bicep.toFixed(1)}cm arm = ${caActual.toFixed(2)}`
    });
  }

  // ── COMPOSITE SCORE ───────────────────────────────────────────
  const totalWeight=ratios.reduce((a,r)=>a+r.weight,0);
  const weightedScore=ratios.reduce((a,r)=>a+(r.score*r.weight),0)/totalWeight;
  const finalScore=Math.round(weightedScore);

  // Update ring
  document.getElementById('sym-score').textContent=finalScore;
  const circ=326.7,off=circ-(circ*(finalScore/100));
  document.getElementById('sym-ring-fill').style.strokeDashoffset=off.toFixed(1);
  const col=finalScore>=85?'var(--green)':finalScore>=70?'var(--gold)':finalScore>=55?'var(--orange)':'var(--red)';
  document.getElementById('sym-ring-fill').style.stroke=col;

  // Tier
  let tier,tierCol,tierDesc;
  if(finalScore>=90){
    tier='🏆 ELITE';tierCol='var(--gold)';
    tierDesc=isMale?'Your proportions are in the top tier of aesthetic physiques. V-taper, waist, and muscle balance are all working together.':'Your proportions reflect elite aesthetic balance. Shoulder-to-waist and hourglass ratios are exceptional.';
  } else if(finalScore>=75){
    tier='💪 ATHLETIC';tierCol='var(--green)';
    tierDesc='Clearly trained with strong proportional balance. A few measurements away from elite-level aesthetics.';
  } else if(finalScore>=60){
    tier='✅ GOOD';tierCol='var(--blue)';
    tierDesc='Solid physique with good foundational proportions. Focus on the priority improvements below.';
  } else if(finalScore>=45){
    tier='📈 DEVELOPING';tierCol='var(--muted2)';
    tierDesc='You\'re building the foundation. The proportions are taking shape — keep training consistently.';
  } else {
    tier='🔨 EARLY STAGE';tierCol='var(--muted)';
    tierDesc='Early in the journey. Use the ideal targets below as your long-term roadmap.';
  }

  document.getElementById('sym-status').textContent=tier;
  document.getElementById('sym-status').style.color=tierCol;
  document.getElementById('sym-desc').textContent='';

  const tierEl=document.getElementById('sym-tier');
  tierEl.style.display='block';
  document.getElementById('sym-tier-badge').textContent=tier;
  document.getElementById('sym-tier-badge').style.cssText=`display:inline-block;padding:8px 24px;font-family:var(--ff);font-size:18px;letter-spacing:2px;color:${tierCol};background:var(--bg2);border:1px solid ${tierCol}`;
  document.getElementById('sym-tier-desc').textContent=tierDesc;

  // Proportion bars
  const ratioEl=document.getElementById('sym-ratios');
  ratioEl.innerHTML=ratios.map(r=>{
    const barPct=Math.min(100,r.score);
    const barCol=r.score>=85?'var(--green)':r.score>=65?'var(--gold)':'var(--orange)';
    const gapLabel=r.score>=90?'✓ On point':r.score>=70?'Close':r.score<50?'Needs work':'Developing';
    return `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
        <span style="font-size:12px;font-weight:600;color:var(--text)">${r.name}</span>
        <span style="font-size:11px;font-weight:700;color:${barCol}">${r.score}/100</span>
      </div>
      <div style="font-size:10px;color:var(--muted);margin-bottom:5px">${r.actual_str} · Ideal: ${r.ideal}</div>
      <div style="background:var(--bg3);height:5px;border-radius:2px;overflow:hidden">
        <div style="width:${barPct}%;background:${barCol};height:5px;transition:width .5s;border-radius:2px"></div>
      </div>
    </div>`;
  }).join('');

  // Priority improvements — sorted by lowest score
  const sorted=[...ratios].sort((a,b)=>a.score-b.score);
  const improvements=sorted.filter(r=>r.score<85);
  const impWrap=document.getElementById('sym-improve-wrap');
  const impEl=document.getElementById('sym-improve');
  if(improvements.length){
    impWrap.style.display='block';
    impEl.innerHTML=improvements.slice(0,3).map((r,i)=>`
      <div style="background:var(--bg2);border-left:2px solid ${i===0?'var(--gold)':'rgba(255,255,255,0.08)'};padding:12px 14px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px">${i===0?'#1 Priority: ':''}${r.name}</div>
        <div style="font-size:12px;color:var(--muted2);line-height:1.5">${r.tip}</div>
      </div>`).join('');
  } else {
    impWrap.style.display='none';
  }

  // Ideal targets — compute what measurements would hit ideal ratios
  const targWrap=document.getElementById('sym-targets-wrap');
  const targEl=document.getElementById('sym-targets');
  targWrap.style.display='block';
  const targets=[];
  const swIdealFinal=isMale?1.618:1.40;
  targets.push({label:'Ideal Shoulders',val:(waist*swIdealFinal).toFixed(1)+'cm',current:shoulders?shoulders+'cm':null});
  if(chest)targets.push({label:'Ideal Chest',val:(waist*(isMale?1.47:1.35)).toFixed(1)+'cm',current:chest+'cm'});
  if(hips)targets.push({label:'Ideal Waist',val:((isMale?0.87:0.70)*hips).toFixed(1)+'cm',current:waist+'cm'});
  if(bicep)targets.push({label:'Ideal Bicep (flexed)',val:bicep.toFixed(1)+'cm (match neck)',current:neck?neck+'cm neck':null});
  if(bicep)targets.push({label:'Ideal Calf',val:bicep.toFixed(1)+'cm (match arm)',current:calf?calf.toFixed(1)+'cm':null});
  targEl.innerHTML=`<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">`+
    targets.map(t=>`
      <div style="background:var(--bg2);padding:10px 12px">
        <div style="font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:4px">${t.label}</div>
        <div style="font-family:var(--ff);font-size:18px;color:var(--gold)">${t.val}</div>
        ${t.current?`<div style="font-size:10px;color:var(--muted);margin-top:2px">Now: ${t.current}</div>`:''}
      </div>`).join('')+'</div>';
}

// Score a ratio vs its ideal — returns 0-100
function scoreRatio(actual,ideal,tolerance){
  const diff=Math.abs(actual-ideal);
  if(diff<=tolerance*0.3)return 100;
  if(diff<=tolerance)return Math.round(100-(diff/tolerance)*30);
  if(diff<=tolerance*2)return Math.round(70-(diff/tolerance-1)*35);
  if(diff<=tolerance*4)return Math.round(35-(diff/tolerance-2)*15);
  return Math.max(0,Math.round(5));
}

// ── DAYS PER WEEK SUGGESTIONS ─────────────────────────────────
const DAYS_SUGGESTIONS={
  mass:{     3:'3 days is solid for beginners and works well for mass — Full Body 3x gives every muscle enough stimulus and recovery.',
             4:'4 days is the sweet spot for mass — Upper/Lower split gives great frequency and volume balance.',
             5:'5 days is good for intermediate lifters — PPL+2 lets you hit each muscle twice a week.',
             6:'6 days is high frequency — best for advanced lifters with good recovery. Make sure sleep and nutrition are dialled in.'},
  strength:{ 3:'3 days is the classic strength approach — used by Starting Strength and StrongLifts. Plenty of recovery between heavy sessions.',
             4:'4 days works well for strength — Upper/Lower lets you hit big compounds twice a week.',
             5:'5 days for strength is for intermediate to advanced. You\'ll need solid sleep and nutrition to recover.',
             6:'6 days strength training is advanced territory. Periodisation becomes very important.'},
  fatloss:{  3:'3 days is perfect for fat loss — you don\'t need high frequency, diet does the heavy lifting. Keep the sessions intense.',
             4:'4 days is great for fat loss — enough to preserve muscle while in a deficit.',
             5:'5 days is on the higher end for a deficit — make sure calories are high enough to recover.',
             6:'6 days in a caloric deficit is aggressive. Only recommended if you\'re experienced and keeping deficit moderate.'},
  recomp:{   3:'3 days works for recomp but progress will be slow. Expect 6-12 months for visible changes.',
             4:'4 days is ideal for recomp — enough frequency to stimulate muscle while burning fat.',
             5:'5 days accelerates recomp — good choice if you enjoy training and recover well.',
             6:'6 days recomp is only for experienced lifters. Prioritise sleep and protein.'},
  maintenance:{3:'3 days is plenty for maintenance — you\'re just keeping what you have.',
               4:'4 days keeps the stimulus high enough to maintain strength and size comfortably.',
               5:'5 days for maintenance is more than needed but fine if you enjoy it.',
               6:'6 days for maintenance is overkill unless you enjoy the lifestyle.'},
  endurance:{ 3:'3 days is the minimum for endurance development — great for beginners.',
              4:'4 days adds a cardio-only session alongside resistance training.',
              5:'5 days is solid endurance programming — mix of resistance and conditioning.',
              6:'6 days endurance training is for serious athletes. Recovery and nutrition are critical.'},
};

// ── NUTRITION DISCLAIMER ──────────────────────────────────────
function calcNutritionWithDisclaimer(){
  if(!state.nutritionDisclaimerAcknowledged){
    document.getElementById('nutrition-disclaimer-modal').classList.add('open');
  } else {
    calcNutrition();
  }
}
function acknowledgeNutrition(){
  state.nutritionDisclaimerAcknowledged=true;
  saveData();
  document.getElementById('nutrition-disclaimer-modal').classList.remove('open');
  calcNutrition();
}

// ── SIMPLE TARGET AUTO-CALC ───────────────────────────────────
// User just enters starting weight + BF% → app sets optimal target automatically
function autoSetTarget(){
  const goal=planState.goal||'mass';
  const curW=state.weight||parseFloat(document.getElementById('prof-weight')?.value)||0;
  const curBF=state.bfLog.length?state.bfLog[state.bfLog.length-1].value:
              parseFloat(document.getElementById('prof-bf')?.value)||null;
  if(!curW||!curBF){toast('Enter your weight and body fat % in Stats → Overview first');return;}
  if(!state.goalTarget)state.goalTarget={};
  const lean=Math.round(curW*(1-curBF/100)*10)/10;
  const gender=state.gender||'m';
  // Recommended target BF% by goal and gender
  const recBF={
    mass:{m:15,f:22},strength:{m:15,f:22},fatloss:{m:12,f:18},
    recomp:{m:13,f:19},maintenance:{m:curBF,f:curBF},endurance:{m:10,f:16}
  };
  const targetBF=(recBF[goal]?.[gender])||15;
  const targetW=Math.round(lean/(1-targetBF/100)*10)/10;
  state.goalTarget={
    startWeight:curW,startBF:curBF,
    targetWeight:targetW,targetBF,goal
  };
  saveData();
  updateProgressBar();
  toast(`Target auto-set: ${dispWt(targetW)} at ${targetBF}% BF — based on your current stats`);
}

// ── CARDIO REMINDER ───────────────────────────────────────────
function getCardioReminder(){
  const goal=planState.goal||'mass';
  if(goal==='endurance'){
    // Only remind if they haven't logged enough cardio (no cardio log system yet — just show if recovery is low)
    if(state.recovery&&state.recovery<60)return null;// already training hard
    return null;// endurance users train more than 30min anyway
  }
  return'💧 30 min cardio daily — walk, cycle, swim, or row. Every goal benefits: heart health, recovery circulation, and mental clarity. It doesn\'t need to be intense.';
}

// ── STRENGTH TEST TIP ─────────────────────────────────────────
// Live calculate working weight from warmup set
function liveCalcFromWarmup(inputEl,exName,day,idx){
  const row=inputEl.closest('.set-cols');
  const inputs=row.querySelectorAll('.si');
  const warmupW=parseFloat(inputs[0]?.value);
  const warmupR=parseInt(inputs[1]?.value);
  if(!warmupW||!warmupR||warmupR<1)return;

  const goal=planState.goal||'mass';

  // Use Epley to estimate 1RM from warmup set
  // Then apply goal-appropriate working % of that 1RM
  const orm=epley(warmupW,warmupR);

  // Working weight % by goal
  const pcts={mass:.72,strength:.82,fatloss:.65,recomp:.70,maintenance:.68,endurance:.60};
  const workPct=pcts[goal]||.70;
  let workingW=Math.round(orm*workPct/2.5)*2.5;

  // Safety cap: working weight can never exceed estimated 1RM
  // And should always be >= warmup weight (otherwise it's not a warmup)
  if(workingW<warmupW)workingW=warmupW;
  if(workingW>orm)workingW=Math.round(orm*0.95/2.5)*2.5;

  // Get target reps for this exercise
  const setsArea=row.closest('.sets-area');
  if(!setsArea)return;
  const dayPlan=planState.plan?.[day];
  const targetReps=dayPlan?.exercises[idx]?.reps||8;

  // Show what we calculated
  const isNearMax=warmupR>=10;// high rep warmup = close to working weight already
  if(isNearMax){
    toast(`Warmup at ${warmupW}kg×${warmupR} → est. 1RM ${orm}kg → working weight: ${workingW}kg`);
  }

  // Pre-fill all unchecked working set weight inputs
  const workingSetRows=[...setsArea.querySelectorAll('.set-cols:not(.warmup-row)')];
  workingSetRows.forEach(wr=>{
    const wInputs=wr.querySelectorAll('.si');
    const done=wr.querySelector('.set-done');
    if(done&&done.classList.contains('checked'))return;// skip done sets
    if(wInputs[0]&&!wInputs[0].value)wInputs[0].value=workingW;
    if(wInputs[1]&&!wInputs[1].value)wInputs[1].placeholder=targetReps;
  });
}
function calcWorkingWeightsFromFirstSet(exName,weight,reps){
  if(reps<20||!weight)return null;
  // User hit 20+ reps — weight is too light. Estimate 1RM and set working weight
  const orm=epley(weight,reps);
  const goal=planState.goal||'mass';
  // Rep max percentages by goal
  const pcts={mass:.70,strength:.80,fatloss:.65,recomp:.70,maintenance:.70,endurance:.60};
  const pct=pcts[goal]||.70;
  const workingW=Math.round(orm*pct/2.5)*2.5;// round to nearest 2.5kg
  return{orm,workingW,pct:Math.round(pct*100)};
}

