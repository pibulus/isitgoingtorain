# 🌧️ Is it going to rain?

**Just tell me if it's going to rain. Yes, no, or maybe.**

One question. One answer. Zero bullshit.

## Features

- 🎯 **Single purpose** - Answers one question perfectly
- 📍 **Actual location first** - Uses browser geolocation when you allow it
- 🏙️ **Manual city fallback** - Type a city if you do not want to share location
- 🌈 **Expressive answers** - YES / MAYBE / NO with color-shifting result states
- ⏱️ **Near-term forecast strip** - Shows the next few forecast windows so the answer has receipts
- 📱 **Mobile-first** - Clean one-thumb flow at phone sizes
- ⚡ **Zero dependencies** - Pure HTML/CSS/JS
- 🔒 **Privacy-first** - No tracking, no cookies, no backend
- 🆓 **Free weather data** - Powered by wttr.in

## Tech Stack

- **Zero frameworks** - Just one HTML file
- **wttr.in API** - Free weather data, no API key needed
- **Browser Geolocation API** - Native location lookup with a manual fallback

## Deploy

**Netlify/Vercel/Cloudflare Pages:**
- Drag and drop the folder
- Done

**GitHub Pages:**
```bash
git remote add origin https://github.com/pibulus/isitgoingtorain.git
git add .
git commit -m "feat: ✨ Initial commit - one file weather app"
git push -u origin main
# Enable GitHub Pages in repo settings
```

## Local Development

```bash
# Option 1: Python
python3 -m http.server 8080

# Option 2: Deno
deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts

# Option 3: Any static server
```

Open http://localhost:8080

## Behavior

- Tap `Check my sky` to ask the browser for your location.
- If location is blocked or you just do not feel like it, tap `Type a city instead`.
- The app uses wttr.in's structured forecast data to answer based on the next few forecast windows, not a fake humidity guess.

## Philosophy

Every weather app makes you:
- Scroll through graphs
- Parse percentages
- Check hourly breakdowns
- Understand weather terminology

But you just want to know: **Should I bring an umbrella?**

This app answers that question. Nothing more, nothing less.

## License

Do whatever you want with it. 🤷‍♂️
