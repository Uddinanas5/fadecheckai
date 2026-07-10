# The FadeCheck Quality Loop

A repeatable engineering loop that drives the product to zero-defect rounds.
Anyone (human or agent) can run it; nothing here depends on session memory.

## The loop

```
        ┌─────────────────────────────────────────────┐
        │  1. BUILD    npx tsc --noEmit               │
        │              npx expo export --platform web │
        ├─────────────────────────────────────────────┤
        │  2. DRIVE    node e2e/drive.mjs             │
        │     67 behavioural checks: every tab,       │
        │     button, filter, upload, edge case.      │
        │     Exit ≠ 0 → fix → back to 1.             │
        ├─────────────────────────────────────────────┤
        │  3. SEE      node e2e/gallery.mjs           │
        │     ~28 screenshots of every screen/state   │
        │     + automated overflow / broken-image /   │
        │     console-error heuristics.               │
        ├─────────────────────────────────────────────┤
        │  4. REVIEW   Look at every screenshot in    │
        │     e2e/artifacts/gallery/. Log each defect │
        │     (visual mismatch, stale copy, dead UI,  │
        │     contrast, clipping) — however small.    │
        ├─────────────────────────────────────────────┤
        │  5. FIX      Patch every logged defect.     │
        │     Prefer root causes (design tokens, kit  │
        │     components) over per-screen bandaids.   │
        ├─────────────────────────────────────────────┤
        │  6. GATE     Round clean? =                 │
        │     drive 100% ∧ gallery findings = 0 ∧     │
        │     review found nothing new.               │
        │     Not clean → back to 1.                  │
        │     Clean → run ONE more full round to      │
        │     confirm (two consecutive clean rounds   │
        │     required before declaring done).        │
        └─────────────────────────────────────────────┘
```

## Rules that keep the loop honest

1. **The screenshot is the truth.** Code that "should" look right doesn't count
   until a fresh capture shows it right. Always rebuild (`expo export`) before
   re-capturing — stale `dist/` has burned us before.
2. **Every fix gets a regression guard.** When review finds a defect class the
   heuristics missed (clipped tab labels, `ImageBackground` on web, unguarded
   `JSON.parse`), add a check to `drive.mjs` or `gallery.mjs` so it can never
   silently return.
3. **Tests assert product truths, not implementation details** — user-visible
   strings and behaviours. That's why a from-scratch UI rewrite passed the
   whole suite unchanged.
4. **Two consecutive clean rounds** before "done". One clean round can be luck.
5. **Known-benign console noise** (native-only SDKs on web: RevenueCat
   singleton, camera jsQR CDN) is filtered in one place (`isAppError`). Add to
   that list deliberately, never ad-hoc.
6. **Commit at every green gate** so `git bisect` stays useful and no round's
   work is ever at risk.

## Artifacts

| Path | What |
|---|---|
| `e2e/drive.mjs` | Behavioural driver (clicks the real app) |
| `e2e/gallery.mjs` | Full-app screenshot capturer + heuristics |
| `e2e/server.mjs` | SPA static server for `dist/` |
| `e2e/artifacts/` | Driver screenshots + `report.json` |
| `e2e/artifacts/gallery/` | Gallery screenshots + `findings.json` |

## Round log

| Round | Drive | Gallery auto | Manual review defects | Fixes |
|---|---|---|---|---|
| R1 | 62/62 | 1 (BeginScan overflow) | 6 (dark results hero, ink-on-purple labels ×3, stale consent copy, dead Upgrade row, black switch thumb) | all 6 + overflow |
| R2 | 62/62 | (ran on stale build — discounted) | — | results.tsx unguarded JSON.parse; +5 edge-case checks |
| R3+ | see git log / CI output | | | |
