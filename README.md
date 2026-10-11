# Farmer Mate: Phase 1

Expo (SDK 54) + Expo Router + TypeScript + Zustand. Runs on Android, iOS and web.

## Run

    npm install
    npx expo install --fix     # aligns package versions with your installed Expo
    npx expo start             # press a / i / w for Android / iOS / web

Demo login: any 10-digit mobile starting 6-9, OTP `1234`.

## What Phase 1 covers

Splash and auth guard, Welcome (language pick), Login, OTP, five onboarding steps
(you, farm, location, land, crops), Home, five-tab navigation, My Farm profile and dashboard.
State persists across restarts (auth, farmer, language). Market, Services and Orders are placeholders for Phases 2 to 4.

## Structure

    app/          Expo Router routes: (auth), (onboarding), (tabs)
    src/components  Button, Input, Chip, SearchBar, ActionCard, EmptyState, OnboardingShell, ScreenContainer
    src/services    authService, farmerService, locationService (mock; swap bodies for REST later)
    src/store       authStore, farmerStore (persisted). Screens never call services directly for data
    src/i18n        en / hi / kn dictionaries; missing keys fall back to English
    src/constants   theme tokens, crops
    src/types       Farmer, Farm, Location, ...

## Known gaps

- Profile photo picker, error/loading states beyond onboarding, and Hindi/Kannada text for onboarding form labels are not done yet.
- Location "current position" snaps to the nearest mock town; replace with a real geocoder.
- Not compiled or run in the environment this was generated in; expect to fix small type or version issues on first run.
