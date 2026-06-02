# TRAINE — AI Fitness Coaching App

> A mobile-first adaptive fitness coaching web app. No installs, no accounts required to start. Built as a single-file HTML application with localStorage persistence.

**Live demo:** https://andrei11022.github.io/Traine/

---

## What It Does

Traine is a personal fitness coaching app that builds a training plan around your goals, tracks your workouts, and gives you daily directives based on your actual performance data — not generic advice.

The core idea: your coach reads your recovery score, training volume, last session performance, and progression trend, then tells you exactly what to do today.

---

## Features

### Training
- **Smart plan generation** — pick your goal, training days, equipment, and exercise preferences. The coach builds a weekly split automatically (Full Body / Upper-Lower / PPL)
- **Exercise intelligence** — 74 exercises tagged by muscle head and region (e.g. bicep long head, bicep short head, brachialis, forearm flexors/extensors, upper/mid/lower chest, gastrocnemius vs soleus calves)
- **Progressive overload** — after each session, target weights update automatically. Hit 8+ reps → weight goes up 2.5kg next session
- **Rest timer** — starts automatically after each set, recommended duration based on exercise type and coach philosophy
- **Workout history** — every set logged and stored per exercise

### Coaching
- **9 original coach personas** — each with a distinct training philosophy, set/rep schemes, rest preferences, and exercise selection style
  - **ARIA** — Adaptive AI, data-driven default
  - **Ivan Volkov** — High Intensity Training (HIT), 1 working set to failure, Mentzer-inspired
  - **Caesar Roman** — Golden era, high volume, pump-focused
  - **Thor Brenden** — Mass and strength, heavy compounds
  - **Dr. Elias Ford** — Science-based, evidence-driven
  - **Marcus Steel** — Military discipline, consistency over intensity
  - **Zen** — Mind-muscle connection, controlled tempo
  - **Rex Hunter** — Powerbuilding, strength first
  - **Blaze** — Maximum volume, drop sets, high energy
- **Directive board** — reads your actual recovery score, weekly volume, last session data, and progression trend to give a daily action
- **Data-driven coach queries** — ask your coach about specific exercises, recovery, volume, or PRs and get answers from your real logged data

### Body Stats
- **Full measurement tracking** — neck, shoulders, chest, arms, forearms, wrists, waist, hips, quads, hamstrings, calves (left/right separately)
- **Body fat calculation** — Jackson-Pollock 3-point and 7-point caliper methods (gender-specific)
- **US Navy tape method** — body fat from tape measure only (neck + waist for men, neck + waist + hips for women)
- **FFMI calculation** — fat-free mass index
- **Body symmetry analysis** — left vs right measurement comparison with 1.5cm threshold and medical disclaimer

### Tracking & Analytics
- **Trend charts** — body weight, body fat %, recovery score, and measurements over time (SVG sparklines)
- **Strength dashboard** — estimated 1RM (Epley formula) per exercise, PR history, progression charts
- **1RM calculator** — enter weight and reps, get estimated max and full percentage table
- **Weak point detection** — flags undertrained muscles, lagging strength on key lifts, and left/right size differences
- **Deload recommendations** — automatically triggers when recovery is consistently low, performance is declining, or streak is too long

### Health & Recovery
- **Recovery score** — calculated from sleep, energy (1-10), and optionally RHR and HRV
- **Recovery-based training adjustments** — coach modifies today's directive based on recovery score

### Nutrition
- **Calorie and macro targets** — calculated from lean mass, goal, and training frequency (TDEE-based)
- **Adjustable macro split** — protein/carb/fat sliders with live visual bar
- **Daily calorie logging** — log intake vs target

### Other
- **14 achievements** — unlock badges for consistency, PRs, measurements, nutrition, and more
- **Progress comparison** — compare body stats, measurements, and strength between any two dates
- **Data export** — workout history (CSV), measurements (CSV), full backup (JSON)
- **Goals system** — daily/weekly/monthly/yearly goals with automatic reset after period ends

---

## Tech Stack

- **Pure HTML/CSS/JavaScript** — no frameworks, no dependencies, no build step
- **localStorage** — client-side data persistence (cross-device sync via Supabase coming in a future version)
- **Tabler Icons** — via CDN
- **Google Fonts** — Bebas Neue + DM Sans

---

## Running Locally

Just open the file:

```bash
# Clone the repo
git clone https://github.com/Andrei11022/Traine.git

# Open in browser
open index.html
```

Or use VS Code Live Server for full functionality (fonts and icons require a server or internet connection).

---

## Roadmap

- [ ] Supabase authentication (login/register)
- [ ] Cloud sync — data persists across devices
- [ ] Claude API integration — coaches respond to any question using real workout context
- [ ] Nutrition logging with food database
- [ ] Deploy to traine.cc

---

## Screenshots

> Coming soon

---

## Author

Built by **Andrei** — agricultural worker by day, learning web development by night.
Part of a 12-month self-directed roadmap from zero to junior developer.

---

## License

MIT — use it, fork it, learn from it.
