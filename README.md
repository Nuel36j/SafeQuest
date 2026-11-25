# SafeQuest frontend (Home screen)

Built for: Next.js (App Router), TypeScript, Tailwind CSS v4, zustand. No other dependencies.

## Setup

1. Create a Next.js app the same way you did for ITMS: TypeScript, Tailwind, App Router,
   no `src/` folder, import alias `@/*` (the default).
2. `npm install zustand`
3. Copy these folders into the project root: `components/`, `lib/`, `store/`, `types/`.
4. Replace `app/layout.tsx`, `app/page.tsx` and `app/globals.css` with the ones here.
5. `npm run dev`

## Notes

- All data comes from `lib/mockData.ts`. Nothing calls the backend yet.
- Dark mode: `store/themeStore.ts` (zustand) holds the theme and saves it to localStorage.
  `components/layout/ThemeProvider.tsx` puts the `dark` class on `<html>`.
  The toggle button is in the top bar.
- Only Home exists. Other sidebar links point to `#`.
- Tabs ("All, Reports, ...") and the "Latest" button are visual only for now.
