# Tally

A two-in-one productivity app combining a calculator and notes/checklist system. Built with Expo, fully offline with a polished dark UI.

## Features

### Calculator
- Standard arithmetic operations (add, subtract, multiply, divide)
- Expression display, backspace, toggle sign, and percentage
- Haptic feedback on every button press
- Comma-formatted numbers with scientific notation fallback
- Active operator highlighting with coin-style button design

### Notes
- Create, edit, and delete notes
- Rich text editor with bold, italic, strikethrough, and bullet formatting
- Checklist mode with task completion tracking
- Swipe-to-dismiss editor with auto-save
- Empty state UI and delete confirmation dialog

## Tech Stack

- Expo SDK 54 / React Native 0.81.5
- Expo Router (file-based routing)
- TypeScript (strict mode)
- Async Storage for local persistence
- React Native Reanimated & Gesture Handler
- Expo Haptics
- New Architecture & React Compiler enabled

## Getting Started

```bash
npm install
npx expo start
```

No environment variables or API keys required. The app runs entirely offline.

## Building

For a production APK:

```bash
eas build -p android --profile production
```
