# QRForge

A QR code generator and designer that runs entirely in the browser. Enter a URL, text, Wi-Fi network, email, phone number or contact card, style the code with presets or your own colours and shapes, add a logo, and export it as PNG or SVG.

Built with React 19, TypeScript and Vite. No backend, no tracking, nothing leaves the page.

## Features

- Six content types: URL, plain text, Wi-Fi (WPA/WEP/open, hidden networks), email (with subject and body), phone and vCard 3.0.
- Live preview that updates as you type, with empty, invalid and "too long" states instead of silently rendering garbage.
- Six presets (Minimal, Corporate, Event, Instagram, Café, Neon) plus full control over foreground/background colours, module style, eye frame and eye centre, export size, quiet zone and error-correction level.
- Optional logo (PNG, JPG, SVG, WebP) with size, padding and "clear space behind logo" controls.
- Scannability advice with one-click fixes: low contrast, light-on-dark colours, logo without level-H correction, missing quiet zone.
- Download as PNG or SVG, copy the PNG to the clipboard, copy the encoded text, reset with undo.
- Helpful validation per field (e.g. Wi-Fi password length, missing domain ending, phone digit count) and a live capacity counter against the QR spec limits.
- Session restore: the current design survives a page reload.
- Keyboard-accessible throughout (ARIA tabs with arrow keys, native radio groups, visible focus rings, live regions), zero axe-core violations at desktop and mobile sizes.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Script                 | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `npm run build`        | Type-checks and builds a static site into `dist/` |
| `npm run preview`      | Serves the production build locally               |
| `npm test`             | Runs the Vitest unit tests                        |
| `npm run lint`         | Lints with oxlint (React hooks rules included)    |
| `npm run typecheck`    | `tsc -b` without emitting                         |
| `npm run format`       | Formats `src/` with Prettier                      |

The output in `dist/` is plain static files and can be hosted on GitHub Pages, Netlify, Vercel or any web server.

## Architecture

```
src/
├── lib/
│   ├── qr/
│   │   ├── types.ts          Domain types, option lists and ranges
│   │   ├── payload.ts        Content → encoded string (WIFI:, mailto:, tel:, vCard …)
│   │   ├── validation.ts     Per-type validation with user-facing messages
│   │   ├── capacity.ts       Mode detection and version-40 capacity limits
│   │   ├── encode.ts         Studio style → renderer options (incl. UTF-8 handling)
│   │   ├── scannability.ts   Advisories with one-click fixes
│   │   ├── presets.ts        The six presets and active-preset detection
│   │   ├── seamless.ts       Removes anti-aliasing seams between modules
│   │   └── summary.ts        Human-readable descriptions for chips and file names
│   ├── color.ts              Hex parsing, WCAG contrast
│   ├── export.ts             PNG/SVG rendering, download, clipboard
│   └── logo.ts               Logo validation and decoding
├── state/
│   ├── defaults.ts           Initial state
│   ├── reducer.ts            All state transitions in one place
│   ├── storage.ts            sessionStorage persistence with sanitising
│   └── useStudio.ts          Reducer + derived data (payload, validation, options)
├── hooks/
│   ├── useQrCode.ts          Owns the imperative renderer instance
│   ├── useDebouncedValue.ts
│   └── useMediaQuery.ts
├── components/
│   ├── ui/                   Button, Field, inputs, ChoiceGroup, Slider, ColorField, Switch, Toast, Notice, Panel
│   └── studio/               TopBar, ContentPanel (+ forms), PreviewPanel, StylePanel, PresetPicker, LogoField, MiniPreview
└── styles/                   Design tokens and base styles
```

The domain layer under `lib/qr` is pure TypeScript with no React or DOM dependencies, which is what makes it unit-testable. Components only translate state into props and dispatch actions.

### Decisions worth knowing about

- **QR generation** uses [`qr-code-styling`](https://github.com/kozakdenys/qr-code-styling) for encoding and styled rendering. Its byte mode truncates characters to 8 bits, so `encode.ts` pre-encodes the payload as UTF-8 bytes; "नमस्ते" and "₹" round-trip correctly (covered by tests and by decoding exported PNGs with jsQR during development).
- **Exports use a throwaway renderer instance.** The library caches its export canvas, so reusing the on-screen instance can return a stale bitmap after the options change.
- **Seamless modules.** The renderer draws each module as its own shape; when scaled, anti-aliasing leaves hairline seams between neighbours. `seamless.ts` enlarges each module by a fraction of a unit so neighbours overlap. The change is invisible but the preview and SVG exports look solid at any zoom.
- **Validation only shouts after you leave a field.** Errors appear on blur, while the preview status reflects validity immediately and the download buttons stay disabled until the content is usable.
- **Presets only set identity** (colours and shapes). Size, margin, error correction and the logo are kept, so switching looks never throws away export settings. The active preset is derived from the current style rather than stored.
- **Logo size depends on error correction.** The library caps the logo by the amount of data the chosen level can recover; the UI shows the resulting width and suggests level H when a logo is present.

## Accessibility

- Semantic landmarks (`header`, `main`, labelled `section`s), a single `h1`, and a skip link.
- Content types are WAI-ARIA tabs with arrow/Home/End navigation; shape and correction choices are native radio groups; the logo toggle is a real `role="switch"`.
- Every control has a visible label or an accessible name; errors are linked with `aria-describedby` and announced via `role="alert"`; the preview status and toasts are live regions.
- Errors use an icon and text, never colour alone. Focus rings are visible on every interactive element, and `prefers-reduced-motion` disables transitions.
- Touch targets grow to 44 px on coarse pointers.

## Browser support

Current versions of Chrome, Edge, Firefox and Safari. Copying the image to the clipboard needs the asynchronous Clipboard API with `ClipboardItem` (all current browsers over HTTPS or localhost); when unavailable the Copy button is disabled with an explanation and downloads still work.

## Testing

`npm test` covers payload building, validation, capacity, encoding, presets, advisories and stored-state sanitising. During development the UI was also exercised end-to-end with Playwright at 1440 px and 360 px: every preset and module style, logo upload, downloads (decoded back with jsQR to confirm the content), clipboard copy, reset/undo, keyboard navigation and an axe-core audit.
