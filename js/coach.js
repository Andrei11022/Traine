// ── COACHES ───────────────────────────────────────────────────
let activeCoach=COACHES.onyx;

function renderCoachList(){
  const list=document.getElementById('coach-list');
  const c=activeCoach||COACHES.onyx;
  list.innerHTML=`
    <div class="coach-row sel">
      <div class="coach-init" style="color:${c.color}">${c.init}</div>
      <div style="flex:1;min-width:0"><div class="coach-rname">${c.name}</div><div class="coach-rtag">${c.tag}</div></div>
      <div class="active-badge">ACTIVE</div>
    </div>
    <div style="padding:14px 18px;font-size:13px;color:var(--muted2);line-height:1.6">
      Onyx is the single elite coach in this version. Directives and workout guidance are precise, consistent, and data-driven.
    </div>`;
  renderDirectiveBoard();
}

function openCoachDetail(id){
  // Coach detail view is disabled in the simplified experience.
}

function closeCoachDetail(){
  document.getElementById('coach-list-view').style.display='block';
  document.getElementById('coach-detail-view').style.display='none';
}

function selectCoach(id){
  if(id==='onyx'){
    toast('Onyx is already your active coach.');
  } else {
    toast('Only the default elite coach is available in this version.');
  }
}

// Generate a directive based on the user's ACTUAL data
function generateInsight(){
  const c=activeCoach;
  const rec=state.recovery;
  const day=planState.currentDay||getTodayDay();
  const session=planState.plan?.[day];
  // Recovery-driven priority
  if(rec!==null&&rec<60){
    return c.id==='ivan'?'Recovery is low. The body grows in rest, not the gym. Do not train today — full recovery is non-negotiable.':
           c.id==='marcus'?'Recovery reads low. Discipline includes knowing when to back off. Light session or active recovery only.':
           'Your recovery score is '+rec+'%. Reduce volume by 30-40% today or take an active recovery day. Pushing hard now risks injury and poor adaptation.';
  }
  if(rec!==null&&rec>=85){
    return c.id==='blaze'?'Recovery is high — '+rec+'%! Attack today. Add a drop set to every working set. The body is primed.':
           c.id==='caesar'?'Your recovery is excellent at '+rec+'%! Today the muscle is ready to be punished. Chase the pump with everything!':
           'Recovery is strong at '+rec+'%. This is a green-light day — push your working sets hard and aim to beat last session\'s numbers.';
  }
  // Plan-driven
  if(session&&!session.isRest){
    return c.id==='ivan'?'Today is '+session.name+'. Two warm-ups, then one all-out working set per exercise to absolute failure. Nothing more.':
           c.id==='ford'?'Today: '+session.name+'. Target 6-10 reps at 75-80% 1RM. Rest 2-3 minutes on compounds. Track every set.':
           'Today is '+session.name+'. Focus on progressive overload — beat last session by a rep or 2.5kg on your main lifts.';
  }
  if(session&&session.isRest){
    return pick(c.responses.recovery||c.responses.default);
  }
  return c.responses.default[0];
}

// Build the directive board: prioritized action cards from real data
// ── UNIT SYSTEM ───────────────────────────────────────────────
// All values stored internally as metric (cm, kg). Imperial is display-only.
const CM_TO_IN=0.393701;
const IN_TO_CM=2.54;
const KG_TO_LBS=2.20462;
const LBS_TO_KG=0.453592;

function isImperial(){return state.unitSystem==='imperial';}

// Convert a cm value to display string
function dispLen(cm){
  if(!cm&&cm!==0)return'—';
  if(isImperial())return(cm*CM_TO_IN).toFixed(1)+' in';
  return cm.toFixed(1)+' cm';
}
// Convert a kg value to display string
function dispWt(kg){
  if(!kg&&kg!==0)return'—';
  if(isImperial())return(kg*KG_TO_LBS).toFixed(1)+' lbs';
  return kg.toFixed(1)+' kg';
}
// Length unit label
function lenUnit(){return isImperial()?'in':'cm';}
// Weight unit label
function wtUnit(){return isImperial()?'lbs':'kg';}

// Parse a length input value → always returns cm internally
function parseLen(val){
  const n=parseFloat(val);
  if(isNaN(n))return null;
  return isImperial()?n*IN_TO_CM:n;
}
// Parse a weight input value → always returns kg internally
function parseWt(val){
  const n=parseFloat(val);
  if(isNaN(n))return null;
  return isImperial()?n*LBS_TO_KG:n;
}
// Format cm for input field (user-facing)
function inputLen(cm){
  if(!cm)return'';
  return isImperial()?+(cm*CM_TO_IN).toFixed(1):+cm.toFixed(1);
}
// Format kg for input field
function inputWt(kg){
  if(!kg)return'';
  return isImperial()?+(kg*KG_TO_LBS).toFixed(1):+kg.toFixed(1);
}

function setUnitSystem(sys){
  state.unitSystem=sys;
  document.getElementById('unit-metric').style.cssText=
    sys==='metric'?'flex:1;background:var(--gold-dim);border:1px solid var(--gold);padding:10px;text-align:center;cursor:pointer':
    'flex:1;background:var(--bg3);border:1px solid rgba(255,255,255,0.07);padding:10px;text-align:center;cursor:pointer';
  document.getElementById('unit-metric').querySelector('[style*="font-family"]').style.color=sys==='metric'?'var(--gold)':'var(--muted)';
  document.getElementById('unit-imperial').style.cssText=
    sys==='imperial'?'flex:1;background:var(--gold-dim);border:1px solid var(--gold);padding:10px;text-align:center;cursor:pointer':
    'flex:1;background:var(--bg3);border:1px solid rgba(255,255,255,0.07);padding:10px;text-align:center;cursor:pointer';
  document.getElementById('unit-imperial').querySelector('[style*="font-family"]').style.color=sys==='imperial'?'var(--gold)':'var(--muted)';
  applyUnitLabels();
  saveData();
}

function applyUnitLabels(){
  const u=lenUnit(),w=wtUnit();
  // Profile inputs
  const hl=document.getElementById('prof-height-lbl');if(hl)hl.textContent=`Height (${u})`;
  const wl=document.getElementById('prof-weight-lbl');if(wl)wl.textContent=`Weight (${w})`;
  const ll=document.getElementById('log-weight-lbl');if(ll)ll.textContent=`Today's Weight (${w})`;
  // Update placeholders and current values for height/weight
  const ph=document.getElementById('prof-height');
  const pw=document.getElementById('prof-weight');
  const lw=document.getElementById('log-weight');
  if(ph){ph.placeholder=isImperial()?'71':'180';}
  if(pw){pw.placeholder=isImperial()?'176':'80';}
  if(lw){lw.placeholder=isImperial()?'176':'80';}

  // Measurement labels — find all inp-lbl spans inside pan-measure
  const mPanel=document.getElementById('pan-measure');
  if(mPanel){
    mPanel.querySelectorAll('.inp-lbl[data-m]').forEach(el=>{
      el.textContent=el.dataset.m+' ('+u+')';
    });
    // Update saved measurement displays
    const dispIds=['disp-chest','disp-waist','disp-hips','disp-shoulders','disp-lbicep','disp-rbicep','disp-lquad','disp-rquad','disp-lcalf','disp-rcalf'];
    const mKeys=['chest','waist','hips','shoulders','lbicep-f','rbicep-f','lquad','rquad','lcalf','rcalf'];
    dispIds.forEach((id,i)=>{
      const el=document.getElementById(id);
      const val=state.measurements[mKeys[i]];
      if(el&&val)el.innerHTML=dispLen(val)+'';
    });
    // Repopulate input fields with correct unit values
    const fieldMap={neck:'m-neck',shoulders:'m-shoulders',upperchest:'m-upperchest',chest:'m-chest',
      'lbicep-r':'m-lbicep-r','lbicep-f':'m-lbicep-f','rbicep-r':'m-rbicep-r','rbicep-f':'m-rbicep-f',
      lforearm:'m-lforearm',rforearm:'m-rforearm',lwrist:'m-lwrist',rwrist:'m-rwrist',
      waist:'m-waist',navel:'m-navel',hips:'m-hips',
      lquad:'m-lquad',rquad:'m-rquad',lham:'m-lham',rham:'m-rham',lcalf:'m-lcalf',rcalf:'m-rcalf'};
    for(const key in fieldMap){
      const el=document.getElementById(fieldMap[key]);
      const val=state.measurements[key];
      if(el&&val)el.value=inputLen(val);
    }
  }

  // Stats overview weight + height inputs
  const oh=document.getElementById('prof-height');
  const ow=document.getElementById('prof-weight');
  if(oh&&state.settings?.height)oh.value=inputLen(state.settings.height);
  if(ow&&state.weight)ow.value=inputWt(state.weight);

  // Workout exercise weights — update target labels
  document.querySelectorAll('.ex-target').forEach(el=>{
    // Leave as-is — workout weights handled separately
  });

  // Update home weight display
  const hw=document.getElementById('home-weight');
  if(hw&&state.weight)hw.innerHTML=inputWt(state.weight)+'<span class="scard-unit">'+w+'</span>';
}

function initUnitUI(){
  const sys=state.unitSystem||'metric';
  // Set correct button state
  const im=document.getElementById('unit-metric');
  const ii=document.getElementById('unit-imperial');
  if(im){
    im.style.cssText=sys==='metric'?'flex:1;background:var(--gold-dim);border:1px solid var(--gold);padding:10px;text-align:center;cursor:pointer':'flex:1;background:var(--bg3);border:1px solid rgba(255,255,255,0.07);padding:10px;text-align:center;cursor:pointer';
    const span=im.querySelector('[style*="font-family"]');if(span)span.style.color=sys==='metric'?'var(--gold)':'var(--muted)';
  }
  if(ii){
    ii.style.cssText=sys==='imperial'?'flex:1;background:var(--gold-dim);border:1px solid var(--gold);padding:10px;text-align:center;cursor:pointer':'flex:1;background:var(--bg3);border:1px solid rgba(255,255,255,0.07);padding:10px;text-align:center;cursor:pointer';
    const span=ii.querySelector('[style*="font-family"]');if(span)span.style.color=sys==='imperial'?'var(--gold)':'var(--muted)';
  }
  applyUnitLabels();
}

// Coach-aware volume config — what counts as enough for THIS coach
