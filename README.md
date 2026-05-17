# 🌧️ Is it going to rain?

**Just tell me if it's going to rain. Yes, no, or maybe.**

One question. One answer. Zero bullshit.

Live: https://isitgoingtorain.app

## Features

- 🎯 **Single purpose** - Answers one question perfectly
- 📍 **Actual location first** - Uses browser geolocation when you allow it
- 🏙️ **Manual city fallback** - Type a city if you do not want to share location
- 🌈 **Expressive answers** - YES / MAYBE / NO with color-shifting result states
- ⏱️ **Near-term forecast strip** - Shows the next few forecast windows so the answer has receipts
- 📱 **Mobile-first** - Clean one-thumb flow at phone sizes
- 🏠 **Installable PWA** - Manifest, app icons, service worker, and cached app shell
- 🛜 **Offline-aware shell** - Opens offline and says plainly when live weather needs internet
- ⚡ **Zero dependencies** - Pure HTML/CSS/JS
- 🔒 **Privacy-first** - No tracking, no cookies, no backend; the last typed city is remembered on-device only
- 🆓 **Free weather data** - Powered by wttr.in

## Tech Stack

- **Zero frameworks** - Just one HTML file
- **Service worker** - Caches the static app shell without caching live weather responses
- **wttr.in API** - Free weather data, no API key needed
- **Browser Geolocation API** - Native location lookup with a manual fallback

## Deploy

Production is served from the Raspberry Pi static checkout at
`/home/pibulus/apps/isitgoingtorain`.

```bash
ssh pibulus@pibulus.local
cd /home/pibulus/apps/isitgoingtorain
git pull --ff-only origin main
sudo systemctl restart isitgoingtorain.service
```

Cloudflare Tunnel routes `isitgoingtorain.app` and `www.isitgoingtorain.app` to
`localhost:9007` on the Pi. The app can still be hosted by any static host, but
the live production path is the Pi service.

## Local Development

```bash
# Option 1: Python
python3 -m http.server 8080

# Option 2: Deno
deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts

# Option 3: Any static server
```

Open http://localhost:8080

## PWA Checklist

- `site.webmanifest` defines the app ID, scope, standalone display, icons, screenshots, and a manual-city shortcut.
- `sw.js` caches the app shell and first-party assets so the app opens from the home screen even when the network is patchy.
- Weather data stays network-only, so a stale cached forecast cannot pretend to be live rain advice.
- `icon-maskable-512.png` is the padded maskable launcher icon; `icon-512.png` stays the regular full-size icon.
- iOS install support is covered with the Apple web app title, touch icon, status bar setting, and safe-area-aware layout.

## Launch Hygiene

- `robots.txt` points crawlers at `sitemap.xml`.
- `sitemap.xml` lists the canonical production URL.
- `CNAME` keeps a GitHub Pages/static-host fallback aligned with `isitgoingtorain.app`, but production currently runs through the Pi and Cloudflare Tunnel.
- The IndexNow key file lives at the repo root and should be deployed before rerunning the announce pass.
- GitHub Actions runs a static health check for required files, metadata, manifest wiring, image dimensions, sitemap, and IndexNow key shape.
- Dependabot checks GitHub Actions monthly. There are no npm dependencies to monitor.
- `README.md`, `LICENSE`, `SECURITY.md`, `CODEOWNERS`, and `.gitignore` are present for normal GitHub browsing.

## Behavior

- Tap `Check my sky` to ask the browser for your location.
- If location is blocked or you just do not feel like it, tap `Type a city instead`.
- The last city you successfully checked is saved in local browser storage so the manual shortcut can prefill it next time.
- The app uses wttr.in's structured forecast data to answer based on the next few forecast windows, not a fake humidity guess.
- Forecast windows are selected against wttr.in's observation clock, so typed cities do not drift just because your browser is in another timezone.

## Philosophy

Every weather app makes you:
- Scroll through graphs
- Parse percentages
- Check hourly breakdowns
- Understand weather terminology

But you just want to know: **Should I bring an umbrella?**

This app answers that question. Nothing more, nothing less.

## License

MIT. Do whatever you want with it.
