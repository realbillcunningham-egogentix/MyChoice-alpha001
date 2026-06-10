# Digital Landscape Preview (Story 002-002)

**Status:** Implemented as a **pure** model builder + framework-free static HTML renderer. No framework, mobile UI, auth, DB, or Edge.

## Input → Output

`LateNightStory` (from the pipeline composer) → `DigitalLandscapePreview` model → **static HTML string**.

```ts
const model = buildDigitalLandscapePreview(story);   // pure
const html  = renderDigitalLandscapePreviewHtml(model); // pure, returns a full HTML document
```

## What the page shows

- **One real insight** — `late-night-activity` — with its value (`%`), a friendly headline badge
  (On track / Worth a look / Needs attention, colored by tone), and **parent** + **child** copy.
- **A “How we got this”** section (collapsible) for auditability: source, what was measured, the
  night/total counts, the threshold guide, and the method (transform id + version).
- **“Coming next”** — other catalog signals as honest placeholders.

## Availability semantics (honesty rules)

Other signals are **never** shown with a value or status. Each carries one availability state, grounded
in `docs/reference/instagram-export-field-map.md`:

| State | Meaning | Examples |
|---|---|---|
| `available` | Real, analyzed from the export | late-night-activity (the only one today) |
| `coming_soon` | Data exists; not yet enabled | content-volume |
| `blocked` | Cannot be measured from the export today | feed-diversity, algorithmic-amplification (no creator field) |
| `not_yet_available` | Planned for a later release | marathon sessions, healthy breaks |

Every unavailable card is explicitly labeled **“Not analyzed yet.”** The page must never imply an
unsupported signal was analyzed — enforced by tests (others have no `value`/`status`).

## Readability & accessibility

- Plain language for a non-technical parent; no jargon, no percentages without context.
- Semantic HTML (`header`, `section`, `article`, `details`); badges/chips carry **text**, not color alone.
- Responsive single/two-column layout via CSS only; **no JavaScript**, **no `<script>`**.
- Dynamic text is HTML-escaped.

## Privacy

The renderer receives only the content-free `LateNightStory` (patterns + counts). A test asserts the
output contains no URLs, `instagram.com`, or `fbid`. The footer reinforces “patterns, not content.”

## Out of scope (deferred)

- Branding/visual design system, mobile-native rendering, interactivity.
- Serving the HTML (Edge/route), per-family theming, localization.
- Showing more than one real signal (blocked until those signals have data).
