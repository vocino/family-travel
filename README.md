# Travel Windows

Single-page app for planning family travel around **school breaks** and **PTO**: pick travel windows, extend dates with sliders, see **destination seasonality** scores, and track total PTO. Deployed to **GitHub Pages** (no backend).

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (with this repo’s Vite `base`, it is typically **`http://localhost:5173/family-travel/`**). Editing the UI updates live.

## Shareable state

The address bar can include a query parameter **`?s=`** (base64url-encoded JSON). That encodes your tab, selected windows, slider extensions, destination chip, and open drawer. Copy or use **Share** / **Copy link** in the header to send the current plan. Opening the link restores the same state.

If a link is corrupted or from an older app version, you’ll see a short notice with options to **Use clean link** or **Dismiss**.

## Calendar export

On the **Plan** tab, **Add plan to calendar (.ics)** downloads selected windows as all-day events for Apple Calendar, Google Calendar, etc.

## Build and preview

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test
```

## Deploy

Pushing to **`main`** runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and publishes the `dist` folder to the **`gh-pages`** branch. The site is served from the **`/family-travel/`** path (see [`vite.config.js`](vite.config.js)).

Pull requests run **`npm test`** and **`npm run build`** via [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
