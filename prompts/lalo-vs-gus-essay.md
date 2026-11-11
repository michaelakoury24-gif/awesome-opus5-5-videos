# Lalo vs Gus — "the better antagonist" (2:00 vertical video essay)

Style reference: [@ou_tiss on TikTok](https://www.tiktok.com/@ou_tiss/video/7700675385087839506) —
a 45s history/philosophy essay ("Revenge", Caesar) by the account *Outis*.
Translated to this repo: near-black frame, Cormorant Garamond statements, Bebas
labels, hairline rules, slow push-ins, hard cuts on beat, burned-in captions,
ten roman-numbered chapters, one narrator.

## Prompt

> Make a 2-minute vertical (1080×1920) video essay arguing that Lalo Salamanca is
> a better antagonist than Gustavo Fring — even though Gus is the better villain.
> Ten chapters of ~12 seconds, each with a single idea, a large serif statement,
> and a visual motif (chess king, clock, opening door, split camouflage, plan
> lattice, brick wall, ringing phone, verdict meter). Narrated, captioned for
> muted viewing, dark cinematic grade, film grain, slow push-in plus a snap on
> every cut. Everything drawn in code — no footage.

## Structure

| # | t | beat |
|---|---|---|
| I | 0–12 | Hook: Gus is the greatest villain, and the most predictable |
| II | 12–24 | The case for Gus: patient, surgical, five moves ahead |
| III | 24–36 | Procedural menace: a villain you can set your watch by |
| IV | 36–48 | Lalo's entrance: he eats your food, tells a story, and laughs |
| V | 48–60 | Camouflage: one is a costume, the other is a trap |
| VI | 60–72 | Improvisation: Gus builds a machine, Lalo kicks the door in |
| VII | 72–84 | The audience problem: you like him, you shouldn't |
| VIII | 84–96 | Wall & door: you break against a wall, a door closes behind you |
| IX | 96–108 | The threat: your plan vs you |
| X | 108–120 | Verdict: better villain, better antagonist |

## Build

```bash
node src/lalo/render.mjs stills 3,15,30,44,58,70,80,92,102,116   # QA frames
node src/lalo/render.mjs video                                  # silent MP4
# narration: renders/lalo/vo/01–10.mp3  (voice-00), placed at each chapter start
# mux + drone bed → renders/lalo/lalo-vs-gus.mp4
```

Output: `renders/lalo/lalo-vs-gus.mp4` — 120.00 s, 1080×1920, 30 fps, H.264 + AAC,
15 MB. Narration is voice id `00`; captions are burned in.
