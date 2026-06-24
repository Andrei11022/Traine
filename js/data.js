const COACHES={
  onyx:{id:'onyx',init:'OX',name:'ONYX',tag:'Your Elite Coach',color:'#F2AA4C',
    bio:'Onyx is Traine\'s elite adaptive coach — precise, consistent, and grounded in your performance history. No gimmicks, just real guidance based on your data.',
    philosophy:'Progressive overload, individual recovery, sustainable volume. Onyx reads your data first, then speaks.',
    pillars:[{k:'Volume',v:'Evidence-based 10-20 sets per muscle per week'},{k:'Progression',v:'2.5-5% load increase when rep targets are hit'},{k:'Recovery',v:'Rest days guided by performance trends'},{k:'Frequency',v:'2x per muscle minimum per week'}],
    catchphrase:'Data first. Ego never.',
    responses:{
      default:['Your data shows consistent progress. Keep executing the plan.','Based on your recent sessions, your recovery is trending well. Push today.','Progressive overload is working. Stay the course and trust the process.'],
      bench:['Target your working weight for 6 clean reps. Rest 3 minutes between working sets.','Warm up progressively: 60%, then 80% of working weight, then all-out.','You\'re in an upward trend on the bench. Stay consistent.'],
      progress:['You\'re ahead of the weekly curve. Excellent consistency.','Volume and intensity are both trending up. Textbook progression.'],
      recovery:['Recovery score is strong. Today is a good day to push hard.','Moderate recovery. Train as planned but listen to your body.','Low recovery detected. Reduce intensity today and prioritise sleep tonight.']
    }
  },
  ivan:{id:'ivan',init:'IV',name:'IVAN VOLKOV',tag:'High Intensity · Maximum Effort',color:'#e05555',
    bio:'Ivan Volkov is forged in cold discipline. A former Soviet-era strength athlete, Ivan believes the body grows only under absolute, total muscular failure. He does not believe in wasting energy. Every session is surgical.',
    philosophy:'One warm-up. One working set taken to positive failure, then 2-3 forced reps. Then complete rest until the nervous system fully recovers. Not one day earlier.',
    pillars:[{k:'Warm-up',v:'2 progressive sets at 60% and 80% to potentiate the CNS'},{k:'Working Sets',v:'1 set only — taken to positive failure, then 2-3 forced reps'},{k:'Frequency',v:'Each muscle group once every 5-7 days'},{k:'Rest-Pause',v:'Advanced: fail, rest 15 seconds, grind 3-5 more reps'},{k:'Recovery',v:'Full systemic recovery required before returning'}],
    catchphrase:'One set. Total failure. Complete recovery. This is the only truth.',
    responses:{
      default:['One set to failure. If you did more, you wasted energy that belongs to recovery.','The body does not grow in the gym. It grows during complete rest. Rest is not optional.','More volume is weakness. One set done correctly destroys more than ten done casually.'],
      bench:['Two warm-up sets at 60% and 80%. Then one working set to absolute positive failure. No more.','After failure, have your partner assist 2-3 forced negatives. Then you are done with this muscle.','Working weight for maximum reps until failure. If you can lift it again, you have not reached failure.'],
      progress:['Progress is one number: your working weight. Is it going up? That is all that matters.','If you hit 8 reps, increase weight next session. Failure should occur at 6-8 reps.']
    }
  },
  caesar:{id:'caesar',init:'CR',name:'CAESAR ROMAN',tag:'Volume · Golden Era · Passion',color:'#F2AA4C',
    bio:'Caesar Roman is theatre. Born into a family of athletes in Southern Italy, Caesar coaches with the fire of the golden era — when men trained twice a day and the gym was a cathedral. He believes bodybuilding is art, and the body is the canvas.',
    philosophy:'High volume, high frequency, feel every repetition. The pump is sacred. The mind-muscle connection is not optional — it is everything. Train with passion or do not train at all.',
    pillars:[{k:'Volume',v:'20-25 working sets per muscle per week'},{k:'Frequency',v:'Each muscle 2-3 times per week'},{k:'Techniques',v:'Supersets, drop sets, giant sets — the burn is the signal'},{k:'Mind-Muscle',v:'Feel the muscle or the rep does not count'},{k:'Rest',v:'60-90 seconds — keep blood in the muscle'}],
    catchphrase:'The PUMP is proof the muscle is working. Chase it like your life depends on it!',
    responses:{
      default:['More sets! More reps! The muscle must be flooded with blood before it will grow!','Feel every contraction. If you cannot feel the muscle working, you are just moving weight.','The pump is not vanity — it is biology. The swelling delivers nutrients. Feed the muscle!'],
      bench:['Three working sets of twelve, then a drop set! Exhaust every fibre!','Slow the eccentric — three seconds down, explosive up! Make the chest do the work!','After your working sets — cable flyes! Stretch the chest fully. Non-negotiable!'],
      progress:['More volume is also progress. More total reps at the same weight means more muscle.','You grew last week. Now add sets. The muscle must never adapt.']
    }
  },
  thor:{id:'thor',init:'TB',name:'THOR BRENDEN',tag:'Mass · Strength · Heavy Compounds',color:'#5b9bd5',
    bio:'Thor Brenden is mass personified. From the Norwegian fjords, 20 years of moving maximum weight. Simple, heavy, brutal. Thor does not believe in small weights or small thinking.',
    philosophy:'Squat, deadlift, press. Everything else is accessory work. Get stronger in the big movements and the size follows without question. Eat big, sleep big, lift big.',
    pillars:[{k:'Core Movements',v:'Squat, Deadlift, Bench, Row, Press — these are the only lifts that matter'},{k:'Progressive Overload',v:'Add weight every single session — no exceptions'},{k:'Volume',v:'4-6 sets of 4-8 reps on compound work'},{k:'Diet',v:'Caloric surplus always — you cannot build what you cannot fuel'},{k:'Rest',v:'2-3 minutes minimum between sets'}],
    catchphrase:'Add weight. Go home. Eat. Sleep. Repeat. This is all.',
    responses:{
      default:['Is the weight going up? That is the only question. If not, eat more and sleep more.','Simple does not mean easy. Squat, deadlift, press — heavier than last time.','You do not need more exercises. You need more weight on the bar.'],
      bench:['Add 2.5kg each side every week until you cannot. Then 1.25kg. Never stop adding.','Low bar, big breath, drive your feet into the floor. Leg drive is half the bench press.','85kg next session if you hit your reps today. No discussion.'],
      progress:['Weight went up. Good. Same time next week with more weight.','Consistent progression over months builds more muscle than any program switch.']
    }
  },
  ford:{id:'ford',init:'EF',name:'DR. ELIAS FORD',tag:'Science-Based · Precision · Evidence',color:'#4caf7d',
    bio:'Dr. Elias Ford holds a PhD in exercise physiology and spent a decade publishing peer-reviewed research. He applies science with precision — no bro-science, no guesswork, only evidence.',
    philosophy:'Every training variable has an optimal range supported by research. Train within those ranges, track everything, and adjust based on measurable outcomes.',
    pillars:[{k:'Volume',v:'10-20 MEV-MAV sets per muscle per week'},{k:'Intensity',v:'65-85% 1RM for hypertrophy'},{k:'Frequency',v:'2x per week per muscle minimum'},{k:'Rest Periods',v:'2-3 min compound, 90s isolation'},{k:'Deload',v:'Structured deload every 4-6 weeks'}],
    catchphrase:'If you cannot measure it, you cannot improve it. Track everything.',
    responses:{
      default:['Your volume is within the hypertrophy-optimised range. Maintain stimulus-fatigue balance.','Per your session data, you are operating near optimal intensity for hypertrophy.','Research indicates 72-hour recovery between sessions for the same muscle group is sufficient.'],
      bench:['Two warm-up sets, then 3 working sets at 75-80% 1RM for 6-10 reps. Rest 2.5 minutes.','Control the eccentric at 2-3 seconds. Mechanotransduction requires sustained time under tension.','Your estimated 1RM is increasing — you are in a productive progressive overload phase.'],
      progress:['Progressive overload confirmed across multiple sessions. Volume load is trending up.','Recommend increasing working weight by 2.5kg next session based on rep performance.']
    }
  },
  marcus:{id:'marcus',init:'MS',name:'MARCUS STEEL',tag:'Military Discipline · No Excuses',color:'#888780',
    bio:'Marcus Steel spent 12 years in special operations before becoming a strength coach. For Marcus, discipline is not motivation — it is a decision made once, every morning, regardless of how you feel.',
    philosophy:'Show up. Execute the plan. Leave. Repeat tomorrow. Motivation is a luxury. Discipline is a weapon.',
    pillars:[{k:'Consistency',v:'5-6 training days per week — non-negotiable'},{k:'Structure',v:'Same exercises, same time, same effort'},{k:'Intensity',v:'Hard work every session — no easy days'},{k:'Recovery',v:'8 hours sleep minimum — recovery is part of the mission'},{k:'Mindset',v:'Discomfort is data. Pain is weakness leaving the body.'}],
    catchphrase:'You either do it or you do not. There is no middle ground.',
    responses:{
      default:['Did you show up? Good. Now execute. No further discussion needed.','How you feel is irrelevant. The plan exists. Follow the plan.','Warriors do not wait for perfect conditions. They create results from whatever conditions exist.'],
      bench:['The program says 3 sets. You do 3 sets. Not 2, not 2.5. Three.','Rest exactly 3 minutes. Start the next set when the clock says. Not before. Not after.','The target weight is the target weight. Hit it.'],
      progress:['You showed up every day. That is the mission. The weight is secondary.','Consistency compounds. Three months of this and you will not recognise yourself.']
    }
  },
  zen:{id:'zen',init:'ZN',name:'ZEN',tag:'Mind-Muscle · Flow · Mastery',color:'#5DCAA5',
    bio:'Zen has no surname. A former meditation teacher who found the gym, Zen treats every session as a conversation between mind and muscle — slow, intentional, deeply focused.',
    philosophy:'The body knows. Most lifters never hear it because they train too fast, too heavy, too mindlessly. Slow down. Feel each fibre engage.',
    pillars:[{k:'Tempo',v:'4-2-4: 4s eccentric, 2s pause, 4s concentric'},{k:'Mind-Muscle',v:'Visualise the target muscle before every rep'},{k:'Breath',v:'Exhale on exertion — control breath, control set'},{k:'Weight',v:'Lighter than ego demands — heavy enough to feel muscle work'},{k:'Recovery',v:'Cold exposure, breathwork, and sleep are sacred'}],
    catchphrase:'The weight is not your enemy. It is your teacher.',
    responses:{
      default:['Slow down. Feel the muscle before you lift. Visualise the contraction.','The fastest way to grow is to slow down. Master movement before adding weight.','Your mind was elsewhere during that set. Come back. Be present.'],
      bench:['4 seconds down. Pause at the chest. Exhale and press. Feel the pec throughout.','Reduce the weight if you cannot feel the chest contracting. Feeling the muscle is the goal.','Visualise your pectorals lengthening as the bar descends. Squeeze before you press.'],
      progress:['You moved the same weight with more control. That is real progress.','Master the movement. The weight will rise as a consequence of mastery, not pursuit.']
    }
  },
  rex:{id:'rex',init:'RH',name:'REX HUNTER',tag:'Powerbuilding · Strength First',color:'#EF9F27',
    bio:'Rex Hunter has pulled 300kg from the floor and built the physique to match. A competitive powerlifter turned hybrid athlete — strength is the foundation of all physical development.',
    philosophy:'Strength first, aesthetics follow. If your squat goes up, your legs grow. Chase strength numbers and the body transforms as a consequence.',
    pillars:[{k:'Big Three',v:'Squat, Bench, Deadlift form the core of every block'},{k:'Rep Ranges',v:'1-5 for strength, 6-12 for hypertrophy after compounds'},{k:'Periodisation',v:'4-week strength blocks followed by 2-week hypertrophy phases'},{k:'Accessories',v:'Support the main lifts — rows for bench, RDLs for deadlift'},{k:'Weak Points',v:'Identify and attack your limiting factor every cycle'}],
    catchphrase:'Get stronger. Everything else takes care of itself.',
    responses:{
      default:['What is your squat number? Your deadlift? If those are not going up, nothing else matters.','Strength is the foundation. Add weight and eat enough to recover.','Identify your weakest lift and attack it. Weak points dictate your ceiling.'],
      bench:['Start with 85% 1RM for working sets. 3-5 reps. Strength, not pump.','Pause bench once per month — 2 seconds on the chest — to build raw strength.','Arch, leg drive, and grip width determine your bench. Technique is 30% of the lift.'],
      progress:['Your total is going up. That is the only metric that matters in this phase.','1% strength gain per week is elite progress at your stage. Keep pushing.']
    }
  },
  blaze:{id:'blaze',init:'BZ',name:'BLAZE',tag:'High Volume · Maximum Energy',color:'#e05555',
    bio:'Blaze is 26, trains 6 days a week, and has never heard of overtraining. A product of the modern high-volume, high-energy philosophy — keep the intensity sky-high and the rest periods short.',
    philosophy:'Volume is king. Attack every muscle from every angle with maximum effort. Drop sets, supersets, giant sets — the moment the muscle stops burning, you\'re resting.',
    pillars:[{k:'Volume',v:'25+ sets per muscle per week'},{k:'Rest',v:'30-60 seconds between sets'},{k:'Techniques',v:'Drop sets, supersets, rest-pause on every exercise'},{k:'Frequency',v:'6 days per week'},{k:'Cardio',v:'20 minutes LISS post-session — non-negotiable'}],
    catchphrase:'If you\'re not exhausted, you\'re not done.',
    responses:{
      default:['Rest 45 seconds and go again. The pump is fading — do not let it.','Drop sets after every working set. The muscle has more in it. Exhaust it.','Six days a week. Every week. Consistency is the only secret.'],
      bench:['3 working sets, then a drop set at 70%, then another at 50%. Failure on every one.','Superset with cable flyes immediately after. No rest between. Chase the pump.','After bench — incline, then dips, then cable crossover. The chest must be completely done.'],
      progress:['More volume added. Next week we add another drop set. Keep adapting.','You handled high volume today. Next week we push more. Volume is the variable.']
    }
  }
};

const EX_DB=[
  // ===== CHEST =====
  {name:'Bench Press',group:'chest',region:'mid',type:'compound',eq:'full',lo:5,hi:8,cue:'Retract shoulder blades, slight arch, bar to mid-chest, drive through your feet.'},
  {name:'Incline Bench Press',group:'chest',region:'upper',type:'compound',eq:'full',lo:6,hi:10,cue:'30-45° incline. Bar to upper chest, elbows ~45° to torso.'},
  {name:'Decline Bench Press',group:'chest',region:'lower',type:'compound',eq:'full',lo:6,hi:10,cue:'Targets lower pecs. Control the bar to the lower chest line.'},
  {name:'Incline Dumbbell Press',group:'chest',region:'upper',type:'compound',eq:'dumbbells',lo:8,hi:12,cue:'Deep stretch at bottom, press dumbbells together at top.'},
  {name:'Dumbbell Press',group:'chest',region:'mid',type:'compound',eq:'dumbbells',lo:8,hi:12,cue:'Lower until you feel a stretch, press without clanking.'},
  {name:'Decline Dumbbell Press',group:'chest',region:'lower',type:'compound',eq:'dumbbells',lo:8,hi:12,cue:'Decline bench, slight pinky-up wrist angle, lower to bottom of pec line, full stretch.'},
  {name:'Chest Dips',group:'chest',region:'lower',type:'compound',eq:'full',lo:6,hi:12,cue:'Lean forward to bias chest, deep stretch at the bottom.'},
  {name:'Cable Crossover',group:'chest',region:'mid',type:'isolation',eq:'full',lo:12,hi:20,cue:'Slight forward lean, squeeze hands together, control the stretch.'},
  {name:'Incline Cable Fly',group:'chest',region:'upper',type:'isolation',eq:'full',lo:12,hi:20,cue:'Low-to-high path, constant tension, squeeze at the top.'},
  {name:'Low Cable Fly',group:'chest',region:'lower',type:'isolation',eq:'full',lo:12,hi:20,cue:'High pulley, pull down and across — targets sternal lower pec. Squeeze hard at the cross-over point.'},
  {name:'Single Arm Cable Crossover',group:'chest',region:'mid',type:'isolation',eq:'full',lo:12,hi:20,cue:'One arm at a time — exposes side asymmetries, maximises stretch and squeeze per pec.'},
  {name:'Dumbbell Fly',group:'chest',region:'mid',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Soft elbows, big stretch, hug a tree on the way up.'},
  {name:'Pec Dec',group:'chest',region:'mid',type:'isolation',eq:'full',lo:12,hi:20,cue:'Constant tension, pause and squeeze at peak contraction.'},
  {name:'Dumbbell Pullover',group:'chest',region:'lower',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Lie across bench, hips dropped, arc the dumbbell back over the head — stretches chest and lats.'},
  {name:'Landmine Press',group:'chest',region:'upper',type:'compound',eq:'full',lo:8,hi:12,cue:'Kneel or stand, one end of barbell loaded, press at an angle. Shoulder-friendly upper chest builder.'},
  {name:'Svend Press',group:'chest',region:'mid',type:'isolation',eq:'full',lo:15,hi:25,cue:'Squeeze a plate between palms, press out and back. The squeeze is the exercise — constant pec tension.'},
  {name:'Push-Up',group:'chest',region:'mid',type:'compound',eq:'home',lo:10,hi:25,cue:'Body in a straight line, full range, elbows ~45°.'},
  {name:'Weighted Push-Up',group:'chest',region:'mid',type:'compound',eq:'home',lo:8,hi:20,cue:'Plate or vest on back, same as a push-up but progressive. Keep core rigid throughout.'},
  {name:'Decline Push-Up',group:'chest',region:'upper',type:'compound',eq:'home',lo:10,hi:25,cue:'Feet elevated on a chair — shifts load to upper chest and front delts. Greater range of motion.'},
  // ===== BACK =====
  {name:'Deadlift',group:'back',region:'lower-back',type:'compound',eq:'full',lo:3,hi:6,cue:'Neutral spine, bar over mid-foot, push the floor away, lock out with glutes.'},
  {name:'Deficit Deadlift',group:'back',region:'lower-back',type:'compound',eq:'full',lo:3,hi:6,cue:'Stand on a plate or mat for extra ROM. Builds strength off the floor and upper-back thickness.'},
  {name:'Rack Pull',group:'back',region:'traps',type:'compound',eq:'full',lo:5,hi:8,cue:'Pins at/below knee, heavy load, shrug-and-lock at top for traps.'},
  {name:'Good Morning',group:'back',region:'lower-back',type:'compound',eq:'full',lo:8,hi:12,cue:'Bar on upper back, hinge at hips until parallel, feel hamstrings load, return with glutes.'},
  {name:'Pull-Ups',group:'back',region:'lats',type:'compound',eq:'home',lo:5,hi:12,cue:'Full hang, drive elbows down and back, chest to bar.'},
  {name:'Wide Grip Pull-Up',group:'back',region:'lats',type:'compound',eq:'home',lo:5,hi:12,cue:'Grip wider than shoulder width — biases outer lats for width. Pull chest to bar.'},
  {name:'Neutral Grip Pull-Up',group:'back',region:'lats',type:'compound',eq:'home',lo:5,hi:12,cue:'Palms facing each other — shoulder-friendly option. Hits lats and biceps evenly.'},
  {name:'Lat Pulldown',group:'back',region:'lats',type:'compound',eq:'full',lo:8,hi:12,cue:'Pull to upper chest, lead with elbows, no swinging.'},
  {name:'Barbell Row',group:'back',region:'mid-back',type:'compound',eq:'full',lo:6,hi:10,cue:'Hinge ~45°, pull to lower ribs, squeeze shoulder blades.'},
  {name:'Pendlay Row',group:'back',region:'mid-back',type:'compound',eq:'full',lo:4,hi:8,cue:'Bar starts on floor each rep. Explosive horizontal pull to the lower chest, reset fully. Builds raw pulling strength.'},
  {name:'T-Bar Row',group:'back',region:'mid-back',type:'compound',eq:'full',lo:8,hi:12,cue:'Chest supported feel, drive elbows back, full squeeze.'},
  {name:'Meadows Row',group:'back',region:'lats',type:'compound',eq:'full',lo:8,hi:12,cue:'Stand perpendicular to a barbell\'s loaded end, staggered stance, pull to hip. Brutal lat thickness.'},
  {name:'Seated Cable Row',group:'back',region:'mid-back',type:'compound',eq:'full',lo:8,hi:12,cue:'Tall chest, pull to navel, control the stretch forward.'},
  {name:'Chest-Supported Row',group:'back',region:'mid-back',type:'compound',eq:'full',lo:8,hi:12,cue:'Incline bench eliminates momentum completely — pure row with strict form.'},
  {name:'Single Arm Row',group:'back',region:'lats',type:'compound',eq:'dumbbells',lo:8,hi:12,cue:'Brace on bench, pull elbow to hip, full stretch each rep.'},
  {name:'Kroc Row',group:'back',region:'lats',type:'compound',eq:'dumbbells',lo:8,hi:15,cue:'Heavy dumbbell, straps allowed, massive ROM, aggressive rowing. Builds raw back thickness.'},
  {name:'Inverted Row',group:'back',region:'mid-back',type:'compound',eq:'home',lo:8,hi:15,cue:'Body rigid, pull chest to bar, squeeze blades.'},
  {name:'Straight Arm Pulldown',group:'back',region:'lats',type:'isolation',eq:'full',lo:12,hi:20,cue:'Arms straight, drive the bar down with your lats, feel the stretch up top.'},
  {name:'Face Pulls',group:'back',region:'traps',type:'isolation',eq:'full',lo:12,hi:20,cue:'Pull to forehead, external rotation, great for rear delts and mid-traps.'},
  {name:'Shrugs',group:'back',region:'traps',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Straight up to ears, pause at top, no rolling.'},
  {name:'Hyperextension',group:'back',region:'lower-back',type:'isolation',eq:'full',lo:10,hi:15,cue:'Hinge at hips, squeeze glutes at top, no hyperextending the spine.'},
  // ===== LEGS =====
  {name:'Squat',group:'legs',region:'quads',type:'compound',eq:'full',lo:5,hi:8,cue:'Brace core, break at hips and knees, depth below parallel, drive up.'},
  {name:'Front Squat',group:'legs',region:'quads',type:'compound',eq:'full',lo:5,hi:8,cue:'Elbows high, upright torso, biases the quads hard.'},
  {name:'Box Squat',group:'legs',region:'quads',type:'compound',eq:'full',lo:5,hi:8,cue:'Sit back to the box, pause briefly, drive up through the heels. Teaches posterior chain engagement.'},
  {name:'Pause Squat',group:'legs',region:'quads',type:'compound',eq:'full',lo:5,hi:8,cue:'Pause 2-3 seconds in the hole. Eliminates the bounce, builds raw strength and positional awareness.'},
  {name:'Hack Squat',group:'legs',region:'quads',type:'compound',eq:'full',lo:8,hi:12,cue:'Feet low for quads, full depth, controlled descent.'},
  {name:'Leg Press',group:'legs',region:'quads',type:'compound',eq:'full',lo:10,hi:15,cue:'Feet low/narrow for quads, don\'t lock out hard, deep ROM.'},
  {name:'Leg Press High Stance',group:'legs',region:'glutes',type:'compound',eq:'full',lo:10,hi:15,cue:'Feet high and wide — shifts emphasis from quads to glutes and hamstrings.'},
  {name:'Single Leg Press',group:'legs',region:'quads',type:'compound',eq:'full',lo:10,hi:15,cue:'One leg at a time — spots left-right strength imbalances, great for symmetry work.'},
  {name:'Bulgarian Split Squat',group:'legs',region:'quads',type:'compound',eq:'dumbbells',lo:8,hi:12,cue:'Rear foot elevated, drop straight down, drive through front heel.'},
  {name:'Goblet Squat',group:'legs',region:'quads',type:'compound',eq:'dumbbells',lo:10,hi:15,cue:'Hold weight at chest, upright, elbows inside knees at bottom.'},
  {name:'Lunges',group:'legs',region:'quads',type:'compound',eq:'dumbbells',lo:10,hi:15,cue:'Long step, drop the back knee, push through the front heel.'},
  {name:'Reverse Lunge',group:'legs',region:'quads',type:'compound',eq:'dumbbells',lo:10,hi:15,cue:'Step back instead of forward — easier on the knees, more quad isolation, better balance.'},
  {name:'Step Ups',group:'legs',region:'quads',type:'compound',eq:'dumbbells',lo:10,hi:15,cue:'Drive through the heel of the elevated leg. Unilateral — exposes side-to-side imbalances.'},
  {name:'Leg Extension',group:'legs',region:'quads',type:'isolation',eq:'full',lo:12,hi:20,cue:'Squeeze at the top, control down, point toes slightly out for sweep.'},
  {name:'Romanian Deadlift',group:'legs',region:'hamstrings',type:'compound',eq:'full',lo:8,hi:12,cue:'Soft knees, push hips back, feel the hamstring stretch, bar close.'},
  {name:'Sumo Deadlift',group:'legs',region:'hamstrings',type:'compound',eq:'full',lo:3,hi:6,cue:'Wide stance, toes flared, grip inside legs. Shorter back path — biases inner hamstrings and adductors.'},
  {name:'Leg Curl',group:'legs',region:'hamstrings',type:'isolation',eq:'full',lo:10,hi:15,cue:'Full squeeze, slow negative, don\'t let hips rise.'},
  {name:'Nordic Curl',group:'legs',region:'hamstrings',type:'compound',eq:'home',lo:3,hi:8,cue:'Knees on pad, feet anchored under something heavy. Lower slowly with full control. Elite eccentric hamstring exercise.'},
  {name:'Glute Bridge',group:'legs',region:'glutes',type:'compound',eq:'home',lo:10,hi:20,cue:'Drive through heels, squeeze glutes hard at the top.'},
  {name:'Hip Thrust',group:'legs',region:'glutes',type:'compound',eq:'full',lo:8,hi:12,cue:'Back on bench, chin tucked, full glute lockout at top.'},
  {name:'Cable Pull-Through',group:'legs',region:'glutes',type:'compound',eq:'full',lo:12,hi:20,cue:'Stand facing away from cable, hinge and drive hips forward. Excellent posterior chain and glute activation.'},
  {name:'Sissy Squat',group:'legs',region:'quads',type:'isolation',eq:'home',lo:8,hi:15,cue:'Hold support, lean back, drop knees down and forward. Extreme quad stretch — advanced movement.'},
  {name:'Standing Calf Raise',group:'legs',region:'calves-gastro',type:'isolation',eq:'full',lo:10,hi:15,cue:'Full stretch at bottom, explosive up, pause at the top.'},
  {name:'Seated Calf Raise',group:'legs',region:'calves-soleus',type:'isolation',eq:'full',lo:12,hi:20,cue:'Bent knee targets the soleus. Slow, full ROM.'},
  // ===== SHOULDERS =====
  {name:'Overhead Press',group:'shoulders',region:'front-delt',type:'compound',eq:'full',lo:5,hi:8,cue:'Brace, press in a straight line, head through at lockout.'},
  {name:'Seated Dumbbell Press',group:'shoulders',region:'front-delt',type:'compound',eq:'dumbbells',lo:8,hi:12,cue:'Back supported or unsupported, full ROM from ear level to lockout. Controlled throughout.'},
  {name:'Machine Shoulder Press',group:'shoulders',region:'front-delt',type:'compound',eq:'full',lo:8,hi:15,cue:'Guided path reduces stabiliser demand — great for high reps and safe drop sets.'},
  {name:'Arnold Press',group:'shoulders',region:'front-delt',type:'compound',eq:'dumbbells',lo:8,hi:12,cue:'Rotate palms through the press, full ROM.'},
  {name:'Lateral Raise',group:'shoulders',region:'side-delt',type:'isolation',eq:'dumbbells',lo:12,hi:20,cue:'Lead with elbows, slight forward lean, no swinging.'},
  {name:'Cable Lateral Raise',group:'shoulders',region:'side-delt',type:'isolation',eq:'full',lo:12,hi:20,cue:'Constant tension, control the negative, cable behind the body.'},
  {name:'Leaning Lateral Raise',group:'shoulders',region:'side-delt',type:'isolation',eq:'full',lo:12,hi:20,cue:'Hold a rack and lean away — creates a better bottom stretch than flat lateral raises.'},
  {name:'Lu Raise',group:'shoulders',region:'side-delt',type:'isolation',eq:'dumbbells',lo:12,hi:20,cue:'Scoop forward at the bottom, raise laterally. Developed by Chinese weightlifters for massive side-delt volume.'},
  {name:'Front Raise',group:'shoulders',region:'front-delt',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Raise to eye level, no momentum.'},
  {name:'Rear Delt Fly',group:'shoulders',region:'rear-delt',type:'isolation',eq:'dumbbells',lo:12,hi:20,cue:'Hinge over, pinkies up, squeeze rear delts, not traps.'},
  {name:'Cable Rear Delt Fly',group:'shoulders',region:'rear-delt',type:'isolation',eq:'full',lo:12,hi:20,cue:'Cross-cable or single pulley, slight forward lean, pull back and out. Pure rear delt isolation.'},
  {name:'Reverse Pec Dec',group:'shoulders',region:'rear-delt',type:'isolation',eq:'full',lo:12,hi:20,cue:'Constant tension on the rear delts, squeeze and control.'},
  {name:'Band Pull-Apart',group:'shoulders',region:'rear-delt',type:'isolation',eq:'home',lo:15,hi:30,cue:'Hold band at shoulder width, pull apart to full arm extension. Rear delt and mid-trap health. Daily practice.'},
  {name:'Upright Row',group:'shoulders',region:'side-delt',type:'compound',eq:'full',lo:8,hi:12,cue:'Pull to chest height, elbows lead, not too narrow on the grip.'},
  // ===== ARMS — BICEPS =====
  {name:'Barbell Curl',group:'arms',region:'bicep-short',type:'isolation',eq:'full',lo:8,hi:12,cue:'Elbows pinned, no swing, full squeeze at top.'},
  {name:'Incline Dumbbell Curl',group:'arms',region:'bicep-long',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Arms behind the body stretches the long (outer) head. Full stretch at the bottom every rep.'},
  {name:'Preacher Curl',group:'arms',region:'bicep-short',type:'isolation',eq:'full',lo:10,hi:15,cue:'Arms in front targets the short (inner) head. No bouncing off the bottom.'},
  {name:'Spider Curl',group:'arms',region:'bicep-short',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Chest face-down on incline bench, arms hang free. Short head isolation — extreme peak contraction.'},
  {name:'Concentration Curl',group:'arms',region:'bicep-short',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Elbow on inner thigh, peak squeeze every rep.'},
  {name:'Hammer Curl',group:'arms',region:'brachialis',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Neutral grip hits brachialis and forearm. Controlled tempo.'},
  {name:'Cross-Body Hammer Curl',group:'arms',region:'brachialis',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Curl across the body rather than straight up — deep brachialis and brachioradialis hit.'},
  {name:'Cable Curl',group:'arms',region:'bicep-short',type:'isolation',eq:'full',lo:12,hi:20,cue:'Constant tension throughout, squeeze hard at the top.'},
  {name:'Cable Rope Curl',group:'arms',region:'bicep-short',type:'isolation',eq:'full',lo:12,hi:20,cue:'Rope allows wrist supination at the top — squeeze hard and control the descent.'},
  {name:'Drag Curl',group:'arms',region:'bicep-long',type:'isolation',eq:'full',lo:10,hi:15,cue:'Drag the bar up your torso as you curl — elbows travel back, long head stretch throughout.'},
  {name:'21s',group:'arms',region:'bicep-short',type:'isolation',eq:'full',lo:21,hi:21,cue:'7 reps bottom half, 7 reps top half, 7 full reps. Massive pump — constant tension across all ranges.'},
  // ===== ARMS — TRICEPS =====
  {name:'Close Grip Bench',group:'arms',region:'tricep-lateral',type:'compound',eq:'full',lo:6,hi:10,cue:'Shoulder-width grip, elbows tucked, drive with the triceps.'},
  {name:'Dips',group:'arms',region:'tricep-lateral',type:'compound',eq:'home',lo:8,hi:15,cue:'Stay upright to bias triceps, full lockout at top.'},
  {name:'Bench Dip',group:'arms',region:'tricep-lateral',type:'compound',eq:'home',lo:10,hi:20,cue:'Hands on bench, heels on floor. Drop hips down, press up through triceps. Add weight on lap to progress.'},
  {name:'JM Press',group:'arms',region:'tricep-long',type:'compound',eq:'full',lo:6,hi:10,cue:'Hybrid skull crusher and close-grip bench — lower bar toward chin, elbows tucked, press explosively.'},
  {name:'Overhead Extension',group:'arms',region:'tricep-long',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Overhead position stretches the long head. Keep elbows in.'},
  {name:'Skull Crushers',group:'arms',region:'tricep-long',type:'isolation',eq:'full',lo:8,hi:12,cue:'Lower to forehead/behind head, elbows still, stretch the long head.'},
  {name:'Tate Press',group:'arms',region:'tricep-lateral',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'Dumbbells vertical above chest, flare elbows out, lower to outer pec, press back up.'},
  {name:'Rolling Tricep Extension',group:'arms',region:'tricep-long',type:'isolation',eq:'dumbbells',lo:10,hi:15,cue:'From skull crusher position, roll the weight behind the head for a deeper long-head stretch.'},
  {name:'Tricep Pushdown',group:'arms',region:'tricep-lateral',type:'isolation',eq:'full',lo:12,hi:20,cue:'Elbows pinned, full lockout, squeeze at the bottom.'},
  {name:'Single Arm Pushdown',group:'arms',region:'tricep-lateral',type:'isolation',eq:'full',lo:12,hi:20,cue:'One arm at a time — spot and correct left-right tricep imbalances.'},
  {name:'Overhead Cable Extension',group:'arms',region:'tricep-long',type:'isolation',eq:'full',lo:12,hi:20,cue:'Face away, overhead path for the long head, constant tension.'},
  // ===== ARMS — FOREARMS =====
  {name:'Wrist Curl',group:'arms',region:'forearm-flexor',type:'isolation',eq:'dumbbells',lo:15,hi:25,cue:'Forearms on thighs, curl the wrists up, full flex.'},
  {name:'Reverse Wrist Curl',group:'arms',region:'forearm-extensor',type:'isolation',eq:'dumbbells',lo:15,hi:25,cue:'Palms down, extend the wrists up — trains the extensors.'},
  {name:'Reverse Curl',group:'arms',region:'forearm-extensor',type:'isolation',eq:'full',lo:12,hi:20,cue:'Overhand grip, hits brachioradialis and extensors.'},
  {name:'Farmers Walk',group:'arms',region:'forearm-flexor',type:'compound',eq:'dumbbells',lo:20,hi:60,cue:'Heavy dumbbells, walk 20-30m. Grip, forearms, traps, core — all hit simultaneously. Log in seconds.'},
  {name:'Dead Hang',group:'arms',region:'forearm-flexor',type:'isolation',eq:'home',lo:20,hi:90,cue:'Hang from a pull-up bar for time. Builds raw grip, decompresses the spine. Log in seconds.'},
  {name:'Plate Pinch',group:'arms',region:'forearm-flexor',type:'isolation',eq:'full',lo:20,hi:60,cue:'Pinch a plate between fingers and thumb, hold for time. Raw fingertip grip strength. Log in seconds.'},
  // ===== CORE =====
  {name:'Hanging Leg Raise',group:'core',region:'abs',type:'isolation',eq:'full',lo:10,hi:20,cue:'Posterior pelvic tilt, raise legs with control, no swinging.'},
  {name:'Hanging Knee Raise',group:'core',region:'abs',type:'isolation',eq:'full',lo:10,hi:20,cue:'Easier than leg raise — raise knees to chest. Posterior tilt at the top to hit lower abs.'},
  {name:'Cable Crunch',group:'core',region:'abs',type:'isolation',eq:'full',lo:12,hi:20,cue:'Crunch with the abs, round the spine, hips stay put.'},
  {name:'Ab Wheel',group:'core',region:'abs',type:'isolation',eq:'home',lo:8,hi:15,cue:'Brace hard, roll out only as far as you can keep a flat back.'},
  {name:'Weighted Crunch',group:'core',region:'abs',type:'isolation',eq:'full',lo:12,hi:20,cue:'Hold a plate or cable resistance. Crunch with the abs — not the neck. Progressively overload.'},
  {name:'Decline Crunch',group:'core',region:'abs',type:'isolation',eq:'full',lo:12,hi:20,cue:'Controlled, squeeze the abs, don\'t yank the neck.'},
  {name:'Dragon Flag',group:'core',region:'abs',type:'isolation',eq:'home',lo:5,hi:10,cue:'Hold a bench overhead, raise the whole body straight, lower under strict control. Advanced movement.'},
  {name:'Dead Bug',group:'core',region:'abs',type:'isolation',eq:'home',lo:8,hi:12,cue:'On back, arms up, lower opposite arm and leg while keeping lower back flat. Control is everything.'},
  {name:'V-Up',group:'core',region:'abs',type:'isolation',eq:'home',lo:10,hi:20,cue:'From flat, simultaneously raise arms and legs to meet in the middle. Full core contraction.'},
  {name:'Pallof Press',group:'core',region:'abs',type:'isolation',eq:'full',lo:10,hi:15,cue:'Anti-rotation exercise. Cable at chest height, press out and back. Core resists rotation.'},
  {name:'Landmine Rotation',group:'core',region:'obliques',type:'isolation',eq:'full',lo:10,hi:15,cue:'Hold one end of barbell, rotate side to side. Core power and anti-rotation — great for athletes.'},
  {name:'Russian Twist',group:'core',region:'obliques',type:'isolation',eq:'home',lo:15,hi:30,cue:'Rotate from the torso, control side to side.'},
  {name:'Side Plank',group:'core',region:'obliques',type:'isolation',eq:'home',lo:20,hi:60,cue:'Stiff straight line from the side, hip raised. Can add rotation under for oblique activation. Log in seconds.'},
  {name:'Plank',group:'core',region:'abs',type:'isolation',eq:'home',lo:30,hi:90,cue:'Straight line, brace abs and glutes. Log in seconds.'},
];

// Coach exercise preferences — weights by type/equipment + region priorities
const COACH_EX_PREF={
  aria:{compound:1,isolation:1,barbell:1,cable:1,machine:1,note:'balanced'},
  ivan:{compound:2.5,isolation:0.5,barbell:2,cable:0.7,machine:0.8,note:'compounds, intensity, hates fluff'},
  caesar:{compound:1,isolation:1.8,barbell:1,cable:2,machine:1.6,note:'cables, constant tension, the pump'},
  thor:{compound:2.5,isolation:0.6,barbell:2.5,cable:0.6,machine:0.8,note:'barbell big lifts'},
  ford:{compound:1.3,isolation:1.2,barbell:1.2,cable:1.2,machine:1.3,note:'evidence-based, balanced'},
  marcus:{compound:1.8,isolation:0.9,barbell:1.6,cable:0.9,machine:0.9,note:'no-frills barbell + bodyweight'},
  zen:{compound:0.9,isolation:1.6,barbell:0.8,cable:1.8,machine:1.6,note:'controlled cable/machine, mind-muscle'},
  rex:{compound:2.3,isolation:0.8,barbell:2.3,cable:0.8,machine:0.9,note:'powerbuilding, big 3 first'},
  blaze:{compound:1.2,isolation:2,barbell:1,cable:1.8,machine:1.7,note:'high volume, lots of isolation'}
};

// equipment classifier for an exercise (for coach weighting)
function exTool(ex){
  const n=ex.name;
  if(n.includes('Cable')||n.includes('Pulldown')||n.includes('Pushdown')||n.includes('Crossover')||['Face Pulls','Pec Dec','Reverse Pec Dec','Pallof Press','Cable Pull-Through'].some(k=>n===k))return 'cable';
  const barNames=['Barbell','Deadlift','Squat','Front Squat','Box Squat','Pause Squat','Bench Press','Overhead Press','Good Morning','Pendlay Row','T-Bar Row','Rack Pull','JM Press','Hip Thrust','Upright Row','Preacher Curl','Skull Crushers','Hyperextension','Landmine'];
  if(barNames.some(k=>n.includes(k)))return 'barbell';
  if(['Leg Press','Leg Extension','Leg Curl','Hack Squat','Seated Calf Raise','Standing Calf Raise','Machine Shoulder Press','Chest-Supported Row'].includes(n))return 'machine';
  return 'machine';
}

// Build grouped structure for the preference list (filtered by equipment)
function exercisesForGroup(group){
  return EX_DB.filter(e=>e.group===group);
}

// LEGACY shape kept for picker compatibility
const ALL_EXERCISES={
  chest:exercisesForGroup('chest'),back:exercisesForGroup('back'),legs:exercisesForGroup('legs'),
  shoulders:exercisesForGroup('shoulders'),arms:exercisesForGroup('arms'),core:exercisesForGroup('core')
};
