// ── HEALTH ────────────────────────────────────────────────────
function calcRecovery(){
  const sleep=parseFloat(document.getElementById('inp-sleep').value)||0;
  const energy=parseFloat(document.getElementById('inp-energy').value)||0;
  const rhr=parseFloat(document.getElementById('inp-rhr').value)||0;
  const hrv=parseFloat(document.getElementById('inp-hrv').value)||0;
  if(!sleep){toast('Enter sleep hours first');return;}
  const sleepScore=sleep>=8?100:sleep>=7?85:sleep>=6?65:sleep>=5?40:20;
  const energyScore=energy>0?energy*10:70;
  const hrvScore=hrv>0?(hrv>=80?100:hrv>=60?80:hrv>=40?60:40):0;
  const rhrScore=rhr>0?(rhr<=45?100:rhr<=55?80:rhr<=65?60:40):0;
  let rec;
  if(hrv>0&&rhr>0)rec=Math.round(sleepScore*0.35+hrvScore*0.35+rhrScore*0.2+energyScore*0.1);
  else if(hrv>0)rec=Math.round(sleepScore*0.45+hrvScore*0.40+energyScore*0.15);
  else if(rhr>0)rec=Math.round(sleepScore*0.45+rhrScore*0.40+energyScore*0.15);
  else rec=Math.round(sleepScore*0.60+energyScore*0.40);
  rec=Math.min(100,Math.max(0,rec));
  state.recovery=rec;
  logEntry(state.recLog,rec);
  document.getElementById('h-sleep').innerHTML=sleep+'<span class="hcard-unit">hrs</span>';
  document.getElementById('h-rec').innerHTML=rec+'<span class="hcard-unit">%</span>';
  if(rhr)document.getElementById('h-rhr').innerHTML=rhr+'<span class="hcard-unit">bpm</span>';
  if(hrv)document.getElementById('h-hrv').innerHTML=hrv+'<span class="hcard-unit">ms</span>';
  document.getElementById('home-rec').innerHTML=rec+'<span class="scard-unit">%</span>';
  const col=rec>=85?'var(--green)':rec>=60?'var(--gold)':'var(--red)';
  const st=rec>=85?'Go hard today':rec>=60?'Train as planned':'Recovery day';
  document.getElementById('home-rec-status').textContent=st;
  document.getElementById('home-rec-status').style.color=col;
  toast('Recovery score: '+rec+'%');saveData();
}

// ── GOALS ─────────────────────────────────────────────────────
function toggleGoal(el){
  el.classList.toggle('done');
  const done=el.classList.contains('done');
  el.innerHTML=done?'<i class="ti ti-check"></i>':'';
  const item=el.closest('.goal-item');
  if(done){
    item.dataset.completed=new Date().toISOString();
    toast('Goal complete! 🔥 It will reset next period.');
  } else {
    delete item.dataset.completed;
  }
  saveData();
}

// Reset completed goals when their period has elapsed
function checkGoalResets(){
  const now=new Date();
  document.querySelectorAll('.goal-item').forEach(item=>{
    const completed=item.dataset.completed;
    if(!completed)return;
    const tag=item.querySelector('.g-tag');
    if(!tag)return;
    const type=tag.classList.contains('d')?'d':tag.classList.contains('w')?'w':tag.classList.contains('m')?'m':'y';
    const done=new Date(completed);
    let elapsed=false;
    if(type==='d'&&now.toDateString()!==done.toDateString())elapsed=true;
    if(type==='w'&&(now-done)>7*864e5)elapsed=true;
    if(type==='m'&&(now.getMonth()!==done.getMonth()||now.getFullYear()!==done.getFullYear()))elapsed=true;
    if(type==='y'&&now.getFullYear()!==done.getFullYear())elapsed=true;
    if(elapsed){
      const check=item.querySelector('.g-check');
      check.classList.remove('done');check.innerHTML='';
      delete item.dataset.completed;
    }
  });
  saveData();
}
function addGoal(){
  const text=document.getElementById('goal-text-in').value.trim();
  const type=document.getElementById('goal-type-in').value;
  if(!text){toast('Enter a goal first');return;}
  const labels={d:'Daily',w:'Weekly',m:'Monthly',y:'Yearly'};
  document.getElementById('goals-list').insertAdjacentHTML('beforeend',`
    <div class="goal-item">
      <div class="g-check" onclick="toggleGoal(this)"></div>
      <span class="g-text">${text}</span>
      <span class="g-tag ${type}">${labels[type]}</span>
    </div>`);
  document.getElementById('goal-text-in').value='';
  document.getElementById('goal-modal').classList.remove('open');
  toast('Goal added');
  saveData();
}

// ── PHASE 4: NUTRITION, ACHIEVEMENTS, COMPARISON, EXPORT ──────
