# LydianLab Music Theory Exam

## Project Overview

Interactive web-based music theory entrance exam for a music camp, replacing traditional paper-based assessments. The application evaluates students across key areas of music theory to determine appropriate class placement.

## Tech Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Chakra UI
- **Backend**: Firebase (Authentication, Firestore)
- **Music Notation**: VexFlow library for interactive staff notation
- **Styling**: Chakra UI component library

## Project Structure

```
/app                    # Next.js routing
/components             # Reusable UI components
  /exam                # Exam-specific components
  /notation           # VexFlow music notation components
  /ui                 # General UI components
/contexts              # React Context providers
/lib                   # Utility functions and Firebase config
/types                 # TypeScript type definitions
/styles                # Global styles and theme
```

## Key Features & Architecture

### Exam Flow

- **2 main sections, 2 pages total**
- Page 1: Key Signature Notation
- Page 2: Scale Notation (major/minor scales)
- State-driven progression with view state management
- 60-minute timer with automatic submission

## Key Libraries & Documentation

- **VexFlow**: https://0xfe.github.io/vexflow/api/index.html
  - Music notation rendering library
  - Key concepts: Renderer, Context, Stave, Voice, Formatter
  - Focus on StaveNote, Accidental, KeySignature classes

### Interactive Music Notation

- VexFlow integration for staff rendering
- Click-based note placement/erasure
- Sharp/flat accidentals with double-sharp/flat support
- Real-time visual feedback
- Clef preference selection (treble/bass)

### Authentication & Data

- Firebase Authentication with email verification
- Student registration/sign-in system
- Firestore for persistent data storage
- User preference management

### State Management

- React Context for global state (auth, timer, preferences)
- Local component state for notation interactions
- Firebase integration for data persistence

## Coding Conventions

- Use TypeScript for all components and utilities
- Functional components with hooks
- Chakra UI for consistent styling
- Context providers for shared state
- Custom hooks for Firebase operations

## Key Considerations

- **Music Theory Accuracy**: Ensure proper music notation standards
- **Accessibility**: Keyboard navigation for note placement
- **Performance**: Optimize VexFlow rendering for smooth interactions
- **Data Integrity**: Reliable Firebase integration for exam submissions
- **User Experience**: Clear tutorials and progress indicators

## Development Priorities

1. Core VexFlow notation system
2. Firebase authentication flow
3. Exam state management and timing
4. Automated grading logic
5. User interface polish and accessibility

## Notes

- Focus on music education UX - students may have varying tech comfort levels
- Make sure music notation size is about 1.5 times the size of VexFlow's default
- Ensure exam integrity with proper data validation
- Consider offline scenarios and connection issues
- Implement comprehensive error handling for Firebase operations
