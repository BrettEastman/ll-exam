# LydianLab Music Theory Exam

LydianLab is a two-page interactive music theory placement exam built with Next.js, TypeScript, and VexFlow. It is designed for educational programs that need a clean, web-based notation assessment experience with persistent progress and automatic scoring.

## What This App Does

- Presents a timed, two-part entrance exam:
  - **Page 1:** D major scale notation
  - **Page 2:** D major key signature notation
- Uses native VexFlow rendering and interaction for click/keyboard note entry.
- Supports treble and bass clef notation.
- Grades each section and shows a completion summary with overall score.
- Includes a 60-minute timer with auto-submit when time expires.
- Saves progress locally and syncs attempts to Firestore for authenticated users.

## Stack

- Next.js 15 + React 19 + TypeScript
- VexFlow 5 (native API, SVG backend)
- Firebase Authentication (email/password + verification)
- Firestore persistence (`examAttempts/{uid}`)
- Vanilla CSS (light mode only)
- Bun for dependency management and test execution

## Architecture Overview

- `features/notation/model` - notation types and constants
- `features/notation/render` - VexFlow draw pipeline
- `features/notation/interaction` - click/keyboard mapping logic
- `features/notation/grading` - pure grading functions
- `features/exam/model` - exam domain models and flow helpers
- `features/exam/state` - draft/timer/access hooks
- `features/exam/persistence` - local draft + Firestore sync
- `features/auth` - auth API, provider, and auth error handling

## Local Setup

1. Install dependencies:

```bash
bun install
```

2. Create `.env.local` with Firebase web config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
```

3. Run the app:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Firebase Requirements

- Enable **Email/Password** in Firebase Auth.
- Enable **Email Verification** template.
- Create Firestore in Native mode.
- Apply rules so each user can only access their own attempt document:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /examAttempts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Scripts

- `bun run dev` - start development server
- `bun run lint` - run ESLint
- `bun run test` - run Bun tests
- `bun run build` - production build
- `bun run start` - serve production build

## Notes

- This project intentionally uses a light-only visual system.
- Styling is semantic HTML + vanilla CSS (no other UI frameworks).
- The notation interaction model is tested with Bun-based unit tests.
