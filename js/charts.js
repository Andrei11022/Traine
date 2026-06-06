// ── SVG MINI-CHART ENGINE ──────────────────────────────────────
function sparkline(data,opts={}){
  if(!data||data.length<2)return '<div style="font-size:12px;color:var(--muted);padding:10px 0">Not enough data yet — keep logging!</div>';
  const W=opts.w||340,H=opts.h||90;
  const vals=data.map(d=>d.value);
  const labels=data.map(d=>d.date?d.date.slice(5):'');// MM-DD
  const min=Math.min(...vals),max=Math.max(...vals);
  const range=max-min||1;
  const px=(v,w)=>Math.round(((v-min)/range)*(w-40))+20;
  const py=(v)=>Math.round(H-14-((v-min)/range)*(H-28));
  const pts=data.map((d,i)=>`${px(d.value,W)},${py(d.value)}`).join(' ');
  const fillPts=`20,${H-14} ${pts} ${px(data[data.length-1].value,W)},${H-14}`;
  const color=opts.color||'var(--gold)';
  const lastVal=vals[vals.length-1];
  const trend=vals.length>1?(lastVal-vals[0]).toFixed(1):0;
  const trendCol=parseFloat(trend)>=0?'var(--green)':'var(--red)';
  const trendStr=parseFloat(trend)>=0?'+'+trend:trend;
  // axis labels
  const nLabels=Math.min(data.length,5);
  const step=Math.max(1,Math.floor(data.length/nLabels));
  let axisLabels='';
  for(let i=0;i<data.length;i+=step){
    const x=px(data[i].value,W);
    axisLabels+=`<text x="${x}" y="${H-2}" text-anchor="middle" fill="#6b6870" font-size="9">${labels[i]}</text>`;
  }
  return `<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px">
    <span style="font-family:var(--ff);font-size:26px;color:var(--text)">${lastVal.toFixed(1)}</span>
    <span style="font-size:11px;font-weight:700;color:${trendCol}">${trendStr}</span>
  </div>
  <svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
    <defs>
      <linearGradient id="sg${opts.id||0}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <polygon points="${fillPts}" fill="url(#sg${opts.id||0})"/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${data.map((d,i)=>`<circle cx="${px(d.value,W)}" cy="${py(d.value)}" r="3" fill="${color}"/>`).join('')}
    ${axisLabels}
  </svg>`;
}

// ── TRENDS ────────────────────────────────────────────────────
function renderAllTrends(){
  const c=(id,data,color,cid)=>{
    const el=document.getElementById(id);
    if(el)el.innerHTML=sparkline(data,{color,id:cid});
  };
  c('chart-weight',state.weightLog,'var(--gold)',1);
  c('chart-bf',state.bfLog,'var(--orange)',2);
  c('chart-rec',state.recLog,'var(--green)',3);
  renderMeasureTrend();
}

function renderMeasureTrend(){
  const sel=document.getElementById('measure-trend-sel');
  if(!sel)return;
  const key=sel.value;
  const data=state.measureLog.filter(e=>e[key]!=null).map(e=>({date:e.date,value:e[key]}));
  const el=document.getElementById('chart-measure');
  if(el)el.innerHTML=sparkline(data,{color:'var(--blue)',id:4});
}

// ── STRENGTH & 1RM ────────────────────────────────────────────
// Epley formula: 1RM = weight × (1 + reps/30)
function epley(w,r){return r===1?w:Math.round(w*(1+r/30)*10)/10;}

function getAllPRs(){
  const prs={};
  for(const name in planState.history){
    const hist=planState.history[name];
    if(!hist.length)continue;
    let best=0;
    hist.forEach(s=>{
      const est=epley(s.weight,s.reps);
      if(est>best)best=est;
    });
    prs[name]=Math.round(best*10)/10;
  }
  return prs;
}

function renderPRList(){
  const prs=getAllPRs();
  const el=document.getElementById('pr-list');
  if(!el)return;
  const entries=Object.entries(prs).sort((a,b)=>b[1]-a[1]);
  if(!entries.length){
    el.innerHTML='<div style="font-size:13px;color:var(--muted);padding:10px 0">No workout data yet. Log sets to see your estimated 1RMs here.</div>';
    return;
  }
  // Populate exercise selector
  const sel=document.getElementById('strength-ex-sel');
  if(sel){
    sel.innerHTML=entries.map(([name])=>`<option value="${name}">${name}</option>`).join('');
  }
  el.innerHTML=entries.slice(0,10).map(([name,orm],i)=>{
    const hist=planState.history[name];
    const last=hist[hist.length-1];
    const prev=hist.length>1?hist[hist.length-2]:null;
    const prevOrm=prev?epley(prev.weight,prev.reps):null;
    const diff=prevOrm?Math.round((orm-prevOrm)*10)/10:null;
    const diffStr=diff!==null?(diff>=0?`<span style="color:var(--green);font-size:11px;font-weight:700">+${diff}</span>`:`<span style="color:var(--red);font-size:11px;font-weight:700">${diff}</span>`):'';
    const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
    return `<div style="background:var(--bg2);border-left:2px solid var(--gold-bdr);padding:10px 14px;margin-bottom:6px;display:flex;align-items:center;gap:10px">
      <div style="font-size:18px">${badge}</div>
      <div style="flex:1">
        <div style="font-family:var(--ff);font-size:16px;color:var(--text);letter-spacing:.5px">${name.toUpperCase()}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">Last: ${last.weight}kg × ${last.reps} reps</div>
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--ff);font-size:22px;color:var(--gold)">${orm}<span style="font-size:12px;color:var(--muted)">kg</span></div>
        ${diffStr}
        <div style="font-size:9px;color:var(--muted)">est. 1RM</div>
      </div>
    </div>`;
  }).join('');
}

function renderStrengthChart(){
  const sel=document.getElementById('strength-ex-sel');
  if(!sel||!sel.value)return;
  const name=sel.value;
  const hist=planState.history[name];
  if(!hist||hist.length<2)return;
  const data=hist.map(s=>({date:s.date,value:epley(s.weight,s.reps)}));
  const el=document.getElementById('chart-strength');
  if(el)el.innerHTML=`<div style="font-size:11px;color:var(--muted);margin-bottom:6px">Estimated 1RM trend — ${name}</div>`+sparkline(data,{color:'var(--gold)',id:5});
}

function calcORM(){
  const w=parseFloat(document.getElementById('orm-weight').value);
  const r=parseInt(document.getElementById('orm-reps').value);
  if(!w||!r){toast('Enter weight and reps');return;}
  const orm=epley(w,r);
  const pct=(p)=>Math.round(orm*p*10)/10;
  document.getElementById('orm-result').innerHTML=`
    <div style="background:var(--bg2);border-left:3px solid var(--gold);padding:14px 16px">
      <div style="font-family:var(--ff);font-size:30px;color:var(--gold);margin-bottom:10px">${orm}<span style="font-size:14px;color:var(--muted)"> kg est. 1RM</span></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:12px">
        ${[['100%',1],['95%',.95],['90%',.9],['85%',.85],['80%',.8],['75%',.75]].map(([pct,v])=>`
          <div style="background:var(--bg3);padding:8px;text-align:center">
            <div style="font-size:10px;color:var(--muted);font-weight:600">${pct}</div>
            <div style="font-family:var(--ff);font-size:16px;color:var(--text)">${Math.round(orm*v*10)/10}kg</div>
          </div>`).join('')}
      </div>
    </div>`;
}

// ── DELOAD DETECTION ──────────────────────────────────────────
function checkDeload(){
  const el=document.getElementById('deload-alert');
  if(!el)return;
  const flags=[];
  const cfg=coachVolConfig();

  // 1. Recovery low 3+ days
  if(state.recLog.length>=3){
    const last3=state.recLog.slice(-3).map(e=>e.value);
    if(last3.every(v=>v<65)){
      const id=activeCoach.id;
      const msg=id==='ivan'?'Recovery below 65% for 3 consecutive days. A full rest week is mandatory — the CNS cannot produce quality contractions in this state.':
                'Recovery has been below 65% for 3 days. Your body is signalling accumulated fatigue.';
      flags.push(msg);
    }
  }

  // 2. 1RM dropping on 2+ exercises
  let dropping=0;
  for(const name in planState.history){
    const h=planState.history[name];
    if(h.length<3)continue;
    const orms=h.slice(-3).map(s=>epley(s.weight,s.reps));
    if(orms[2]<orms[0]-2.5)dropping++;
  }
  if(dropping>=2){
    const id=activeCoach.id;
    flags.push(id==='ivan'?`Performance declining on ${dropping} exercises. The body is overtrained. Full rest week — no training at all.`:
      `Estimated 1RM declining on ${dropping} exercises. Performance regression = accumulated fatigue.`);
  }

  // 3. Streak too long (coach-adjusted threshold)
  const id=activeCoach.id;
  const streakLimit=id==='ivan'?10:id==='blaze'||id==='caesar'?18:14;
  if(state.streak>streakLimit){
    flags.push(`${state.streak}-day streak exceeds ${activeCoach.name}'s recommended limit of ${streakLimit} consecutive days.`);
  }

  if(!flags.length){el.style.display='none';return;}

  // Deload prescription based on coach
  const deloadAdvice=id==='ivan'?'Complete rest for 7 days. No training. Eat, sleep, let the CNS recover fully. You will come back stronger.':
    id==='blaze'||id==='caesar'?'One week at 50% volume, 60% of normal weights. Keep the frequency, cut the sets in half.':
    'One deload week: reduce weight 40-50%, cut sets by 60%. Same exercises, same schedule, far less stress.';

  el.style.display='block';
  el.innerHTML=`<div style="background:var(--bg2);border-left:3px solid var(--red);padding:14px 16px;margin-bottom:10px">
    <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--red);text-transform:uppercase;margin-bottom:8px"><i class="ti ti-alert-triangle"></i> ${activeCoach.name}: Deload Recommended</div>
    ${flags.map(f=>`<div style="font-size:12px;color:var(--muted2);padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04)">${f}</div>`).join('')}
    <div style="font-size:11px;color:var(--muted);margin-top:8px">${deloadAdvice}</div>
  </div>`;
  detectWeakPoints();
}

function detectWeakPoints(){
  const el=document.getElementById('weak-point-list');
  if(!el)return;
  const issues=[];
  const vol=calcWeeklyVolume();
  const cfg=coachVolConfig();
  const muscleLabels={chest:'Chest',back:'Back',legs:'Legs',shoulders:'Shoulders',arms:'Arms',core:'Core'};

  for(const m in vol){
    if(activeCoach.id==='ivan'){
      // Ivan: 1 set IS the protocol — never flag undertrained
      if(vol[m]>5)issues.push({severity:'warn',msg:`${muscleLabels[m]||m}: ${vol[m]} sets/week contradicts Ivan's HIT principle. Reduce to 1 working set per muscle.`});
    } else {
      if(vol[m]>0&&vol[m]<cfg.min)issues.push({severity:'warn',msg:`${muscleLabels[m]||m}: ${vol[m]} sets/week is below ${activeCoach.name}'s minimum of ${cfg.min}. Plan auto-adjusted.`});
      if(vol[m]>cfg.max)issues.push({severity:'warn',msg:`${muscleLabels[m]||m}: ${vol[m]} sets/week exceeds ${activeCoach.name}'s maximum of ${cfg.max}. Excess isolation work removed.`});
    }
  }

  // Stall detection
  for(const name in planState.history){
    if(detectStall(name))issues.push({severity:'info',msg:stallBuster(name)});
  }

  // Measurement gaps > 2cm
  const d=state.measurements;
  const mPairs=[{name:'Biceps',l:'lbicep-f',r:'rbicep-f'},{name:'Quads',l:'lquad',r:'rquad'},{name:'Calves',l:'lcalf',r:'rcalf'}];
  mPairs.forEach(p=>{
    const lv=d[p.l],rv=d[p.r];
    if(lv&&rv&&Math.abs(lv-rv)>2)issues.push({severity:'info',msg:`${p.name}: ${Math.abs(lv-rv).toFixed(1)}cm left/right measurement difference. Consider starting unilateral work with the smaller side.`});
  });

  if(!issues.length){
    el.innerHTML='<div style="font-size:13px;color:var(--green);padding:10px 0">No issues detected. Volume is within '+activeCoach.name+'\'s optimal range.</div>';
    return;
  }
  el.innerHTML=issues.map(i=>`
    <div style="background:var(--bg2);border-left:2px solid ${i.severity==='warn'?'var(--orange)':'var(--blue)'};padding:10px 14px;margin-bottom:6px">
      <div style="font-size:12px;color:var(--muted2);line-height:1.5">${i.msg}</div>
    </div>`).join('');
}

// ── NAVY TAPE METHOD ──────────────────────────────────────────
let fatMethod='caliper';
function setFatMethod(m){
  fatMethod=m;
  document.getElementById('method-caliper').classList.toggle('on',m==='caliper');
  document.getElementById('method-navy').classList.toggle('on',m==='navy');
  document.getElementById('caliper-method').style.display=m==='caliper'?'block':'none';
  document.getElementById('navy-method').style.display=m==='navy'?'block':'none';
  const isMale=state.gender==='m'||(document.getElementById('prof-gender')?.value||'m')==='m';
  document.getElementById('navy-male-fields').style.display=isMale?'block':'none';
  document.getElementById('navy-female-fields').style.display=isMale?'none':'block';
}

function calcNavyFat(){
  const g=state.gender;
  let bf=0;
  if(g==='m'){
    const neck=parseFloat(document.getElementById('navy-neck').value);
    const waist=parseFloat(document.getElementById('navy-waist').value);
    const h=parseFloat(document.getElementById('navy-height').value);
    if(!neck||!waist||!h){toast('Enter neck, waist, and height');return;}
    // US Navy formula (cm): BF = 86.010×log10(waist-neck) − 70.041×log10(height) + 36.76
    bf=86.010*Math.log10(waist-neck)-70.041*Math.log10(h)+36.76;
  } else {
    const neck=parseFloat(document.getElementById('navy-neck-f').value);
    const waist=parseFloat(document.getElementById('navy-waist-f').value);
    const hips=parseFloat(document.getElementById('navy-hips-f').value);
    const h=parseFloat(document.getElementById('navy-height-f').value);
    if(!neck||!waist||!hips||!h){toast('Enter all fields');return;}
    // Female Navy: 163.205×log10(waist+hips−neck) − 97.684×log10(height) − 78.387
    bf=163.205*Math.log10(waist+hips-neck)-97.684*Math.log10(h)-78.387;
  }
  bf=Math.max(3,Math.min(50,Math.round(bf*10)/10));
  document.getElementById('prof-bf').value=bf.toFixed(1);
  toast('Navy tape BF%: '+bf.toFixed(1)+'% — saved to profile. Run Calculate on Overview tab.');
  logEntry(state.bfLog,bf);
  saveData();
}


