# COMMUNICATE AI

### *Every voice deserves to be heard.*

An Assistive Technology Initiative by **SRI PRATIBHA HIGH SCHOOL**

---

## What it is

COMMUNICATE AI is an **AAC app** — Augmentative and Alternative Communication — for students who
cannot easily speak or hear. It turns an ordinary phone into:

- **a voice**, for a student who cannot speak — picture cards and typing become spoken words
- **ears**, for a student who cannot hear — nearby speech becomes large on-screen captions

It works in **English, తెలుగు and हिन्दी**, runs **completely offline** once installed, and keeps
**every piece of data on the device**. No account, no server, no internet, no cost.

## The five screens

| Screen | What it does |
|---|---|
| **Talk** | Picture cards that speak. Greetings, My Needs, Feelings, Classroom, and My Phrases. |
| **Type** | Type anything and hear it spoken, with word prediction that learns your words. |
| **Listen** | Live captions of the speech around you, in large text. |
| **Help** | One-tap emergency messages — spoken twice, loudly, with the phone vibrating and the words filling the screen. |
| **About** | Mission, features and install instructions. |

### Sentence Builder

Tap the **green builder button** in the message bar. Now every card you tap is both spoken *and*
added to a sentence strip, so a student can compose a full sentence — *"I want water" + "Please"* —
and speak it as one message. Tap any word to remove it, or save the whole sentence to My Phrases.

### Device check

**Settings → 🩺 Check this device.** Before demonstrating, open this on the phone you will
actually use. It reports in plain language whether that device can speak, has Telugu and Hindi
voices installed, can use the microphone, has saved itself for offline use, and whether it has been
installed to the home screen — with the fix written next to anything that is not ready. There is
also a **Test the voice** button that speaks a sentence in the current language.

### Photo cards

A custom phrase can carry a **real photograph** taken with the camera — your own teacher, your own
water bottle, your own mother — instead of a generic emoji. A familiar face is far easier to
recognise than a symbol, especially for younger or pre-literate users. Photos are cropped to 256 px
and stored on the device (~20 KB each).

Each custom phrase also records **which language it is in**, so a Telugu phrase is always spoken by
a Telugu voice even when the app is set to English.

### Design

The interface uses the school crest's own colours — its blue, gold, green, red and sky — as the
accent for each card category, so the app and the crest read as one identity. Typography is
**Plus Jakarta Sans** with **Noto Sans Telugu** and **Noto Sans Devanagari**, all self-hosted in
`fonts/` so the three scripts render correctly even with no internet.

---

## Running it

It is a plain static site — no build step, no dependencies.

```bash
# any static server works
python3 -m http.server 8000
# then open http://localhost:8000
```

> The microphone, installation and offline support need **HTTPS** (or `localhost`).
> Opening `index.html` as a `file://` URL will work for the cards, but not for captions or install.

## Deploying

### GitHub Pages

1. Push this folder to a GitHub repository.
2. **Settings → Pages → Source → GitHub Actions**.
3. Every push to `main` now deploys automatically via `.github/workflows/deploy.yml`.

Your link will be `https://<username>.github.io/<repo>/`. All paths in the app are relative, so it
works correctly from a subfolder.

### Vercel

Import the repository at [vercel.com/new](https://vercel.com/new). Framework preset: **Other**.
Leave the build command empty and the output directory as the repo root. `vercel.json` already sets
the correct caching headers.

---

## ⚠️ Before every deploy: bump the service worker version

Open `sw.js` and increase `VERSION`:

```js
const VERSION = "2.2.0";   // <- change this on EVERY deploy
```

Also bump `APP_VERSION` in `index.html` to the same number — **the deploy workflow fails the build
if the two do not match**, so this is hard to get wrong.

The service worker caches the app so it works offline. If you do not change this number, phones
that already installed the app may keep showing the **old** version. When you do change it, users
get a *"New version available — Update"* banner.

## Files

```
index.html             the whole app (markup, styles and logic in one file)
fonts/                 self-hosted typefaces (Latin, Telugu, Devanagari) - work offline
icons/school-logo.png  the school crest shown inside the app
sw.js                  offline service worker  ← bump VERSION before deploying
manifest.webmanifest   install name, icons, shortcuts
vercel.json            caching headers for Vercel
.github/workflows/     automatic GitHub Pages deploy
icons/                 app icons and install screenshot
```

## School logo

**The official SRI PRATIBHA HIGH SCHOOL crest ships with the app.** It appears on the splash
screen, header, About page, footer, install banner and update banner from the very first launch,
with nothing to set up, and it is also the installed app icon and the browser favicon.

A device may override it with its own image via **Settings (⚙) → Upload logo**; **Use school crest**
puts the official one back.

The icon set is generated from `icons/school-logo.png`. To regenerate it after changing the crest:

```bash
magick icons/school-logo.png -background none -gravity center -extent 512x512 /tmp/sq.png
gen(){ magick /tmp/sq.png -resize ${2}x${2} -background white -gravity center \
       -extent ${1}x${1} -alpha remove -alpha off -colors 256 -strip "$3"; }
gen 192 184 icons/icon-192.png
gen 512 491 icons/icon-512.png
gen 180 166 icons/apple-touch-icon.png
gen 512 317 icons/maskable-512.png     # smaller: launchers crop maskable icons
```

## Installing on a phone

- **Android (Chrome):** tap **Install** when prompted, or menu **⋮ → Install app**
- **iPhone / iPad (Safari):** **Share → Add to Home Screen**

## Browser support

| Feature | Chrome (Android/desktop) | Safari (iOS) | Firefox |
|---|---|---|---|
| Talk / Type / speech output | ✅ | ✅ | ✅ |
| Live captions | ✅ | ✅ | ❌ not supported |
| Install + offline | ✅ | ✅ | partial |

Telugu and Hindi speech depend on voices installed on the device. On Android, add them under
**Settings → Text-to-speech → Google Speech Services**. The app tells the user when a voice is
missing rather than failing silently.

## Privacy

Everything — saved phrases, photos, history, the school logo — is stored in the browser's
`localStorage` on that one device. Nothing is uploaded. There is no analytics and no network
request of any kind after the page loads.

---

© SRI PRATIBHA HIGH SCHOOL · Assistive Technology Initiative
