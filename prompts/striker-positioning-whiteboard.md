# Striker Positioning — Tactics-Board Explainer (2:00)

*Original request written for this repo's format (not a catalog entry). Built for Claude Opus 5.5 in Claude Code or any agent that can write and render a single HTML file.*

**Category:** Explainers · **Suggested stack:** SVG + Canvas + Web Audio (GSAP optional) · **Target runtime:** 2:00 (120.0s)

**Reference image:** [`assets/striker-positioning-reference.png`](../assets/striker-positioning-reference.png) — attach it to the prompt if your agent accepts images.

Copy everything inside the block below into your agent.

## Prompt

```text
You are a senior motion designer, football (soccer) analyst and front-end engineer.
Your job: build a 2-minute (exactly 120.0 seconds) animated explainer video about how to
position as a striker, drawn on a coaching tactics whiteboard where every player is a
coloured circle and the ball is a small circle — in the visual style of a real coaching
board standing on grass in front of a goal net.

Deliver it as a single self-contained HTML file. Every frame must be code.

────────────────────────────────────
1. DELIVERABLE
────────────────────────────────────

1. Build ONE self-contained file: `striker-positioning.html`
   - No external CDNs, no remote fonts, no remote images, no video files, no audio files.
   - Pitch, board, grass, net, players, ball, arrows, text: all drawn with SVG / Canvas / CSS.
   - Fonts: system stack only (e.g. "Inter", "Helvetica Neue", Arial) with condensed/uppercase
     styling achieved via letter-spacing and font-stretch fallbacks.
   - Size: fixed 1920 × 1080 stage, letterboxed to fit any window (scale, don't reflow).
   - Deterministic: a single function render(t) where t is seconds (0 → 120). No randomness at
     runtime (seed any procedural texture), no Date.now(), no reliance on rAF timing for content.
     Scrub to t = 43.2 and you must always get the identical frame.
   - Controls: Space = play/pause, ← / → = ±1s, R = restart, F = fullscreen, H = hide UI chrome.
     A slim progress bar and timecode (mm:ss:ff) that are hidden by default in recording mode
     (`?record=1` hides all chrome).
   - Add `window.__renderFrame(t)` and `window.__DURATION = 120` so an external recorder can step
     frames.
   - Include a short comment block at the top of the file explaining how to record it.

2. Also produce the export:
   - A 1920×1080, 30 fps, H.264 (yuv420p) MP4 named `striker-positioning.mp4`, exactly 120.0s.
   - Preferred: headless Chrome/Puppeteer stepping `__renderFrame(f/30)` for f = 0…3599 and piping
     PNGs into ffmpeg. Fallback: in-page capture via MediaRecorder at 30 fps.
   - Verify with `ffprobe`: duration 120.00 ±0.05s, 3600 frames, audio present if narrated.
   - Export a poster frame (`poster.png`, the frame at t = 104s, the recap card) and a 9:16
     vertical cut-down is a nice-to-have, not required.
   - Do not commit large build artifacts into git; keep the HTML in the repo and write the MP4
     to a build/ output folder.

────────────────────────────────────
2. THE SCENE (art direction)
────────────────────────────────────

Reference: a FORZA-style folding coaching tactics board, roughly 90 × 60 cm, standing upright on
a real grass pitch in front of a goal net, shot at a slight angle in daylight.

- Board: white lacquered face, thin aluminium frame with soft highlights, tiny corner radius,
  faint sheen (a subtle diagonal light sweep, very low opacity), realistic drop shadow on grass.
- Pitch markings on the board: full pitch, correct proportions 105 × 68 m, white/light-grey lines
  (touchlines, goal lines, halfway line, centre circle, centre spot, both penalty areas, 6-yard
  boxes, penalty spots, penalty arcs, corner arcs).
- Camera: starts slightly above and to the side, looking down at maybe 18–22°, on a blurred grass
  foreground and an out-of-focus goal net + crossbar behind. Over the first 3 seconds the camera
  eases to a near top-down broadcast view of the board (a settle, not a snap) and stays there for
  the whole explainer, with only very slow, subtle drift (≤2% scale) so it never feels frozen or
  seasick. At the end, ease back out to the 3/4 hero angle for the outro.
- Grass: procedural, mown stripes, slight vignette and warm daylight; gentle depth of field on the
  net so the board reads as the subject. Do not let background detail compete with the dots.
- The board should always be fully visible with margin; never crop the pitch markings at 16:9.

────────────────────────────────────
3. VISUAL LANGUAGE — the dots
────────────────────────────────────

- Your team (the striker's team), 4-3-3: blue circles (#2E6BE6) with a subtle darker rim and a
  soft contact shadow. 1 GK + 4 defenders + 3 midfielders + 3 forwards.
- Opponents, 4-4-2 / back four: red circles (#E2453C), same treatment.
- The striker (#9): blue circle with a persistent pulsing gold ring (#F2C230) and a small "9"
  label. Everything in the video is about him; he is always instantly findable.
- Ball: small white circle (~40% of a player's diameter) with a crisp dark outline and a tiny
  motion shadow; moves on the grass plane, never floats.
- Optional third element: a small yellow or black marker for the coach's pointer/cone if useful.
- Accessibility: do not rely on colour alone. Blue team = solid fill; red team = solid fill with
  a thin white inner ring; striker = double ring; ball = smallest object. Shapes/diameter/outline
  must let a colour-blind viewer follow the story.
- Labels: short, uppercase, 2–4 words max ("BLIND SIDE", "CHECK AWAY", "POCKET", "NEAR POST").
  Place them so they never overlap a dot; back them with a 90%-white rounded plate at 0.9 opacity.

────────────────────────────────────
4. STORYBOARD — 10 beats, exact timecodes (total 120.0s)
────────────────────────────────────

Each beat gets a top-left chapter card (big condensed numeral + title), a step counter
("STEP 03 / 10"), and a bottom caption bar that repeats the narration line verbatim.
Pace: 1–3 distinct movements per beat, then ~1.5s of stillness before the next cut.
Animate player movement with believable easing (ease-in-out), never linear, never teleporting.
Show where a player is going before he goes: translucent "ghost" outline at the destination.

── BEAT 1 · 00:00–00:08 · TITLE ──
Board hero shot on grass, 3/4 angle. Camera settles top-down. Title card:
"STRIKER POSITIONING" / "The complete guide · 9 in a 4-3-3". Legend slides in:
blue = your team, red = opponents, gold ring = you, small white = ball.
VO: "Every striker wants the ball. The best ones already know where to stand before it arrives.
Here's how to position yourself, movement by movement."

── BEAT 2 · 00:08–00:20 · THE FIVE KEYS ──
Full 4-3-3 vs 4-4-2 laid out. Five short labels appear in sequence around the striker:
reference point, separation, timing, body shape, box movement.
VO: "You're the number nine in a 4-3-3, alone against a back four. Five things decide whether
you get the ball: your reference point, your separation, your timing, your body shape, and your
movement in the box."

── BEAT 3 · 00:20–00:34 · REFERENCE POINT & ONSIDE ──
Dim everything except the striker and the last defender. Draw a dashed offside line across the
pitch at the second-last defender, with an "ONSIDE / OFFSIDE" tint strip (green/red, low opacity).
Striker steps up level with the line, holds the shoulder of the centre-back, sits in his blind
spot. Ball moves along the back line to show the line moving up. Repeat once, faster.
VO: "Start with your reference point. Find the last defender and play off his shoulder — in his
blind spot, where he can't see both you and the ball. Stay level with him. Step up with the line,
never drift beyond it."

── BEAT 4 · 00:34–00:48 · SEPARATION ──
Close push-in on the striker + one centre-back. Striker checks away 3 m (ghost trail, dashed
arrow), the CB follows; striker then attacks the space he just created with a blind-side run off
the CB's back shoulder. Show the through-ball path opening up as a bright line, and a 0.5×
slow-motion replay of the same movement with "GO ON THE PASS — NOT BEFORE" on screen.
VO: "Now create separation. Check away two or three yards to drag the centre-back with you, then
attack the space you just made. Go blind side, off his back shoulder, and accelerate as the pass
is played — not before."

── BEAT 5 · 00:48–01:02 · OCCUPY & PIN ──
Wide view. Striker pins one CB; highlight the pocket between the lines with a soft glowing band;
a blue #10 appears in it. Then ball goes wide: striker drags his marker toward the channel,
opening the channel for a blue winger (ghosted arrow, then the winger's run into the vacated
space). Label "PIN ONE — FREE THE OTHER".
VO: "Occupy both centre-backs. Pin one, so the other can't step out. That gap between the lines
is the pocket your number ten wants. And when the ball goes wide, drag your marker into the
channel to open it for the winger."

── BEAT 6 · 01:02–01:16 · BACK TO GOAL ──
Side-on inset view of the striker receiving with his back to goal: body between ball and defender,
shield arc drawn, half-turn. Then lay-off to the #10 and an immediate spin in behind — the
lay-off pass and the spin drawn as a single continuous curve.
VO: "With your back to goal, get your body between the ball and the defender. Half-turn, shield,
and wait for the third man. Lay it off and spin into the space behind — the pass you just made is
your best run."

── BEAT 7 · 01:16–01:30 · PRESSING AS THE FIRST DEFENDER ──
Switch to out-of-possession: the whole board tints slightly cooler, opponents now build out from
the back. Striker's curved press run blocks the pass into the pivot — show the blocked passing
lane as a red X. Then a "trigger" flash sequence: bad touch, backwards pass, pass to the wrong
foot — striker sprints on each cue.
VO: "Out of possession, you're the first defender. Curve your press to block the pass into
midfield, and go on the trigger: a bad touch, a backwards pass, a pass to the full-back's wrong
foot. Sprint on the cue, not on the guess."

── BEAT 8 · 01:30–01:44 · MOVEMENT IN THE BOX ──
Zoom to the attacking penalty area. A cross is whipped in from the right; striker starts far
post, two-movement run: first move loses the marker, second move arrives near post. Then a second
variant: cutback — striker holds, then steps onto the ball at the edge of the six-yard box.
Draw a movement trace that ends in a finishing dot at the exact contact point.
VO: "In the box, don't wait for the cross — attack the space in front of goal. Start far post,
arrive near post. Two movements: one to lose him, one to finish. If the ball is cut back, hold,
then step onto it."

── BEAT 9 · 01:44–01:52 · VS A BACK THREE ──
Morph the red back four into a back three. Highlight the outside centre-back's shoulder and the
half-space. Striker shifts to that shoulder, stays onside, then breaks for the counter.
VO: "Against a back three, target the outside centre-back's shoulder, and stay onside for the
counter."

── BEAT 10 · 01:52–02:00 · RECAP + OUTRO ──
Five-rule recap card over the board: reference · separation · timing · body shape · movement.
Board tilts back out to the 3/4 hero angle on grass. Title returns, then a clean freeze for the
last 1.5s so the video loops gracefully back to Beat 1.
VO: "Five rules: reference, separation, timing, body shape, movement. Get them right, and the
ball finds you."

────────────────────────────────────
5. FULL NARRATION SCRIPT (read verbatim, ~150 wpm)
────────────────────────────────────

[00:00] Every striker wants the ball. The best ones already know where to stand before it
arrives. Here's how to position yourself, movement by movement.

[00:08] You're the number nine in a 4-3-3, alone against a back four. Five things decide whether
you get the ball: your reference point, your separation, your timing, your body shape, and your
movement in the box.

[00:20] Start with your reference point. Find the last defender and play off his shoulder — in
his blind spot, where he can't see both you and the ball. Stay level with him. Step up with the
line, never drift beyond it.

[00:34] Now create separation. Check away two or three yards to drag the centre-back with you,
then attack the space you just made. Go blind side, off his back shoulder, and accelerate as the
pass is played — not before.

[00:48] Occupy both centre-backs. Pin one, so the other can't step out. That gap between the
lines is the pocket your number ten wants. And when the ball goes wide, drag your marker into
the channel to open it for the winger.

[01:02] With your back to goal, get your body between the ball and the defender. Half-turn,
shield, and wait for the third man. Lay it off and spin into the space behind — the pass you just
made is your best run.

[01:16] Out of possession, you're the first defender. Curve your press to block the pass into
midfield, and go on the trigger: a bad touch, a backwards pass, a pass to the full-back's wrong
foot. Sprint on the cue, not on the guess.

[01:30] In the box, don't wait for the cross — attack the space in front of goal. Start far post,
arrive near post. Two movements: one to lose him, one to finish. If the ball is cut back, hold,
then step onto it.

[01:44] Against a back three, target the outside centre-back's shoulder, and stay onside for the
counter.

[01:52] Five rules: reference, separation, timing, body shape, movement. Get them right, and the
ball finds you.

────────────────────────────────────
6. AUDIO
────────────────────────────────────

- Voice: calm, precise, male or female coaching voice, neutral English, ~150 wpm, no hype.
  Generate the voiceover with a TTS tool available to you, or record it into `vo.mp3` next to the
  HTML and load it relatively (the HTML file itself must still work silently without it).
- Music: a minimal, low-key bed — soft pulse/pad, no melody fighting the voice, ducked ~14 dB
  under the narration, faded in over 2s and out over the final 2s. Synthesize it with Web Audio
  (oscillators + filtered noise) so no licensed asset is needed. No crowd noise.
- Sound design (optional but nice): a very soft "tick" when a new step card appears, a low
  whoosh on each cut, a click on ball contact. Keep everything under -18 LUFS except the voice.
- Burned-in captions are mandatory: the video must fully work muted, because most feeds autoplay
  silently. Caption text = the narration lines above, 1–2 lines max, max ~42 characters per line,
  high-contrast bar, safe margins (≥120 px from bottom).

────────────────────────────────────
7. TYPOGRAPHY & UI
────────────────────────────────────

- Palette: board white #FAFAF8, ink #111417, blue #2E6BE6, red #E2453C, gold #F2C230,
  grey #8A9099. Nothing else.
- Chapter card top-left: "03" in large condensed digits, title beneath in uppercase with wide
  letter-spacing; thin gold rule between them.
- Step counter top-right: "STEP 03 / 10" plus a 10-segment progress pips row.
- Legend bottom-left: four tokens (blue / red / gold-ringed blue / ball), always legible at 1080p
  on a phone screen (min 26 px type).
- Caption bar bottom-centre, above safe area, max width 60% of frame.
- Everything on the board must remain readable at 50% scale. No text smaller than 20 px at 1080p.
- Motion: cards slide+fade 220 ms ease-out, labels pop with a 6% overshoot, no bouncing, no
  spinning, no emoji, no drop-shadow soup.

────────────────────────────────────
8. FOOTBALL CORRECTNESS RULES (non-negotiable)
────────────────────────────────────

- Offside line is drawn at the second-last defender (or the ball, whichever is nearer the goal)
  and only in the attacking half when relevant. The striker must never be shown clearly beyond it
  at the moment the pass is played. Show him level, or level-and-behind.
- A striker standing in an offside position is not automatically offside; if you show the flag,
  make sure the pass is actually played to him.
- Correct pitch geometry and correct 4-3-3 / 4-4-2 / back-three shapes: 11 players per team,
  back four stays connected, distances realistic (defensive line ~10–15 m apart, compactness
  ~25–30 m between lines).
- A centre-back cannot "step out" through the striker's pinned position without leaving a gap —
  show that gap, don't just say it.
- Runs are curved, not straight lines. Players decelerate before changing direction.
- Ball speed should look plausible relative to player speed (a pass travels faster than a run).
- No player ever passes through another dot. No dot leaves the pitch.
- If you are unsure about a tactical detail, simplify it rather than animating something wrong.

────────────────────────────────────
9. PROCESS (do the work in this order)
────────────────────────────────────

1. Write a one-page beat sheet: beat, timecode, on-board action, VO line, on-screen text. Show it
   to me before building if I'm in the loop; otherwise continue.
2. Build the static board + scene first and screenshot it. Iterate on the look until it reads as a
   real coaching board on grass, not a flat diagram.
3. Add the timeline beat by beat, checking each beat in isolation (scrub to its start and end).
4. Add narration, captions, music, sound design.
5. Record the MP4 and verify duration/frame count.
6. Review your own output frame-by-frame at t = 3, 12, 24, 40, 56, 70, 84, 100, 116 s. Take
   screenshots, look at them critically, and fix anything that is small, cluttered, off-model,
   or tactically wrong. Iterate at least twice.
7. Report: file paths, runtime, resolution, fps, frame count, and a list of anything you could not
   do.

────────────────────────────────────
10. ACCEPTANCE CRITERIA
────────────────────────────────────

[ ] Exactly 120.0s (±0.05s), 30 fps, 1920×1080, H.264, plays in a browser and in QuickTime.
[ ] Single self-contained HTML with no network requests at all (verify in devtools Network tab).
[ ] Deterministic: the same t renders the same frame every time.
[ ] 2-minute story actually teaches: 10 beats, all five keys covered, all VO lines on screen.
[ ] Silent playback is fully understandable (captions + labels).
[ ] Nothing overlaps; no text under 20 px; legend and captions readable on a phone.
[ ] The scene reads as the reference: white board, grass, net, coloured circle players, small ball.
[ ] All 22 dots accounted for in every wide shot; striker always identifiable by the gold ring.
[ ] Offside line and pass timing are correct in every beat where they appear.
[ ] Smooth: no frame where a dot jumps position; no camera jitter; no layout shift.
[ ] Loops cleanly from the final frame back into 00:00.

────────────────────────────────────
11. TONE
────────────────────────────────────

This should feel like a premium coaching video: calm, precise, confident, zero hype, zero
"AI slop". Think a UEFA-licence coach explaining a concept with a magnet board — except the
board is beautifully lit, the motion is buttery, and every second earns its place.

If a choice is ambiguous, prefer clarity over decoration. Make no mistakes.
```

## Short version (paste this if you want one paragraph)

```text
Build a 2-minute (exactly 120s) code-generated explainer video about how to position as a
striker, drawn on a coaching tactics whiteboard standing on grass in front of a goal net — the
players are coloured circles (blue = your 4-3-3, red = the opponents, small white circle = ball)
and the striker is highlighted with a gold ring. Motion is top-down, calm and precise, with
chapter cards, drawn arrows, ghost runs, an offside line and burned-in captions. Cover, in ten
timed beats: the five keys; the reference point and staying onside off the last defender's
shoulder; checking away to create separation then attacking the space on the pass; pinning a
centre-back to open the pocket and the wide channel; back-to-goal hold-up play and the spin in
behind; pressing as the first defender with triggers; near-post / far-post / cutback movement in
the box; playing against a back three; and a five-rule recap. Write ~300 words of narration at
150 wpm, synthesize a quiet music bed, and deliver a single self-contained HTML file plus a
1920×1080 30fps H.264 MP4 of exactly 120.0s, deterministic so any timestamp renders identically.
```


## Built from this prompt

- `striker-positioning.html` — the self-contained animation (fonts embedded, no network calls, `?record=1` hides the chrome, `window.__renderFrame(t)` for capture)
- `renders/striker-positioning.mp4` — 2:00, 1920×1080, 30 fps, narrated (stereo AAC)
- `renders/striker-positioning-silent.mp4` — same cut without the voiceover
- `renders/striker-positioning-720p.mp4` — lighter cut for phones
- `download.html` — standalone download page (720p cut embedded, works with no server)
- `renders/poster.png`, `renders/contact-sheet.png` — stills
- `src/scene.js` (timeline + drawing), `src/render.mjs` (frames → MP4), `src/build.mjs` (bundles the HTML), `src/serve.mjs` (local preview)

Re-render after editing the scene:

```bash
node src/build.mjs && node src/render.mjs video   # HTML + silent MP4
node src/download-page.mjs                        # rebuild download.html

Hosted copy (GitHub raw, works in any browser):
https://raw.githubusercontent.com/michaelakoury24-gif/awesome-opus5-5-videos/arena/8f9001e0-awesome-opus5-5-videos/renders/striker-positioning.mp4
node src/serve.mjs                                # preview on :8000
```
