# Chatbot

A messenger-style chat app with a kind, polite AI. Chat, ask about photos, or generate images from text.

**Developer:** Raminder Jangao — Fullstack Developer (Web, App, Game, AI Chatbot Developer). In the app, tap **Info** in the header for 2026 Comms details, commission, portfolio links, and tech stack.

## Chatbot profile image

The app shows a profile image for the chatbot in the header and next to each reply. To use your own image (e.g. your `chatbot3` image from Downloads):

1. Copy your image into the project and name it `chatbot-profile.png`:
   ```bash
   cp ~/Downloads/chatbot3.png public/chatbot-profile.png
   ```
   (If your file is named differently or is a .jpg, copy it to `public/chatbot-profile.png` or rename after copying.)
2. Add and commit it with git:
   ```bash
   git add public/chatbot-profile.png
   git commit -m "Add chatbot profile image"
   ```

If `public/chatbot-profile.png` is missing, the app falls back to the built-in placeholder (`public/chatbot-profile.svg`).

## Setup

1. Copy `.env.example` to `.env` and set your API key:
   ```bash
   cp .env.example .env
   # Edit .env: VITE_GEMINI_API_KEY=your_key
   ```
2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open the URL shown (e.g. http://localhost:5173).

## Build

```bash
npm run build
npm run preview   # serve production build
```

## Deploy (Vercel)

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).
2. Add the environment variable `VITE_GEMINI_API_KEY` in the project settings.
3. Deploy. The included `vercel.json` configures the SPA rewrite and asset caching.

The app is responsive and uses safe-area insets for notched devices.

## Tech

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS**
- Backend API with automatic model fallback; optional image generation (Gemini image models).
