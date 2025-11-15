# 🌧️ Is it going to rain?

**Just tell me if it's going to rain. Yes, no, or maybe.**

One question. One answer. Zero bullshit.

## Features

- 🎯 **Single purpose** - Answers one question perfectly
- 📍 **Auto-location** - Uses your IP to detect city
- 🌈 **Gradient answers** - YES (purple), NO (pink), MAYBE (blue)
- 📱 **Mobile-first** - Works everywhere
- ⚡ **Zero dependencies** - Pure HTML/CSS/JS
- 🔒 **Privacy-first** - No tracking, no cookies, no BS
- 🆓 **Free APIs** - wttr.in (weather) + ipinfo.io (location)

## Tech Stack

- **Zero frameworks** - Just one HTML file
- **wttr.in API** - Free weather data, no API key needed
- **ipinfo.io** - Free IP geolocation

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
