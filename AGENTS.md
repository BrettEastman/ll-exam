# LydianLab Music Theory Exam - OpenCode Execution Guide

## Mission

Rebuild this app from the ground up with a VexFlow-first architecture, no Chakra UI, and a classy minimalist vanilla CSS design in light mode only.

## Rewrite Constraints

- Use Next.js 15, React 19, TypeScript, and VexFlow 5.
- Use native VexFlow API (`Renderer`, `Stave`, `StaveNote`, `Accidental`, `KeySignature`, `Formatter`) for interactive notation.
- Do not introduce new UI frameworks. Styling must be vanilla CSS.
- Light mode only. Do not add dark-mode media queries.
- Keep notation legible and music-theory accurate across treble and bass clefs.

## Architecture Targets

### Notation Engine Separation

- `features/notation/model`: serializable state and domain types.
- `features/notation/render`: pure draw pipeline from model -> SVG.
- `features/notation/interaction`: click/keyboard handlers producing model updates.
- `features/notation/grading`: pure grading functions with tests.

### App Features

- Exam page 1: key signature notation.
- Exam page 2: scale notation.
- 60-minute timer with auto-submit.
- Firebase auth and Firestore persistence.

## Actionable Implementation Checklist

### Phase 1 - Foundation Reset

- [x] Add `AGENTS.md` as the OpenCode source of truth.
- [x] Remove Chakra provider and Chakra dependencies from active app routes.
- [x] Replace Chakra UI layout/components with semantic HTML + CSS classes.
- [x] Create rewrite-oriented folder scaffolding under `features/` and `styles/`.
- [x] Ensure lint and typecheck run clean after shell migration.

### Phase 2 - Vanilla CSS Design System (Classy Minimalist, Light-Only)

- [x] Create `styles/tokens.css` with design tokens:
  - [x] paper/ink palette, muted text, borders, accent colors.
  - [x] spacing scale, radius scale, elevation scale.
  - [ ] typography scale and line-height rules.
- [x] Create `styles/base.css` for reset, typography, forms, buttons, focus styles.
- [x] Create page/component CSS modules or grouped stylesheet files.
- [x] Enforce `html { color-scheme: light; }` globally.

### Phase 3 - VexFlow Engine Rebuild

- [x] Implement render surface with SVG backend in a client component.
- [x] Move away from ad-hoc SVG text insertion for accidentals.
- [x] Implement deterministic click-to-position mapping per clef.
- [x] Support erase mode, accidental mode, and keyboard interaction.
- [x] Keep notation target size at ~1.5x VexFlow default.

### Phase 4 - Exam Flow Rebuild

- [x] Rebuild `/exam/[page]` state flow and route guards.
- [x] Add progress, navigation, and completion summary.
- [x] Add timer and auto-submit behavior.
- [x] Add save-and-resume support (local draft + Firestore sync). (local draft complete; Firestore sync pending Phase 5)

### Phase 5 - Auth + Persistence

- [x] Rebuild Firebase auth flow (register/login/verification).
- [x] Define exam attempt schema in Firestore.
- [x] Validate and persist answers robustly.
- [x] Add error handling for offline and transient failures.

### Phase 6 - Quality Gates

- [x] Unit tests for grading and notation model transforms.
- [x] Integration checks for full two-page exam flow.
- [x] Manual QA for treble/bass notation interactions.
- [x] Run `npm run lint` and `npm run build` before handoff.

## Execution Notes For OpenCode Agents

- Prefer small, focused commits and incremental verifiable changes.
- Do not regress notation correctness while refactoring UI.
- If a choice is unclear, preserve exam integrity over visual complexity.
- Keep accessibility first-class: keyboard paths and visible focus states.
