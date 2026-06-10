import type { LateNightStory } from "../compose";

export type SignalAvailability = "available" | "coming_soon" | "blocked" | "not_yet_available";

export interface PreviewSignalCard {
  id: string;
  display_name: string;
  availability: SignalAvailability;
  value?: number;        // only for available
  unit?: string | null;  // only for available
  note?: string;         // for unavailable
}

export interface DigitalLandscapePreview {
  title: string;
  period_label: string;
  headline: { state: string; label: string; tone: "good" | "watch" | "alert" | "neutral" };
  primary: PreviewSignalCard;
  others: PreviewSignalCard[];
  explanation: { parent: string; child: string };
  audit: {
    source_label: string;
    total_items: number | null;
    night_items: number | null;
    green_cut: number | null;
    yellow_cut: number | null;
    transform_id: string | null;
    transform_version: string | null;
  };
}

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

const fmtDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

function headlineFor(story: LateNightStory): DigitalLandscapePreview["headline"] {
  const s = story.agreement_interpretation ?? story.signal_status;
  switch (s) {
    case "aligned": return { state: s, label: "On track", tone: "good" };
    case "attention":
    case "at_risk": return { state: s, label: "Worth a look", tone: "watch" };
    case "crossed":
    case "breached": return { state: s, label: "Needs attention", tone: "alert" };
    default: return { state: "insufficient_data", label: "Not enough data", tone: "neutral" };
  }
}

// Honest status of other catalog signals (grounded in docs/reference/instagram-export-field-map.md).
// These are NOT analyzed; they carry no value/status.
const OTHER_SIGNALS: PreviewSignalCard[] = [
  { id: "content-volume", display_name: "Content volume", availability: "coming_soon", note: "We can see this from your export — turning it on soon." },
  { id: "feed-diversity", display_name: "Feed concentration", availability: "blocked", note: "Your export doesn’t include who made each post, so we can’t measure this yet." },
  { id: "algorithmic-amplification", display_name: "Algorithm influence", availability: "blocked", note: "Needs creator details your export doesn’t include." },
  { id: "binge-sessions", display_name: "Marathon sessions", availability: "not_yet_available", note: "Planned for a later release." },
  { id: "pause-ratio", display_name: "Healthy breaks", availability: "not_yet_available", note: "Planned for a later release." },
];

/** PURE. Build the view model from a real LateNightStory. Other signals are honest placeholders. */
export function buildDigitalLandscapePreview(story: LateNightStory): DigitalLandscapePreview {
  return {
    title: "Your family's digital landscape",
    period_label: `${fmtDate(story.observation.window_start)} – ${fmtDate(story.observation.window_end)}`,
    headline: headlineFor(story),
    primary: {
      id: story.observation.signal_type,
      display_name: "Late-night activity",
      availability: "available",
      value: story.observation.value,
      unit: story.observation.unit,
    },
    others: OTHER_SIGNALS.map((o) => ({ ...o })),
    explanation: { parent: story.explanation.parent, child: story.explanation.child },
    audit: {
      source_label: "Instagram export",
      total_items: story.audit.total_items,
      night_items: story.audit.night_items,
      green_cut: story.audit.thresholds_applied?.green_cut ?? null,
      yellow_cut: story.audit.thresholds_applied?.yellow_cut ?? null,
      transform_id: story.audit.transform_id,
      transform_version: story.audit.transform_version,
    },
  };
}

const availLabel: Record<SignalAvailability, string> = {
  available: "Available",
  coming_soon: "Coming soon",
  blocked: "Blocked",
  not_yet_available: "Not yet available",
};

/** PURE. Render a static, framework-free HTML document for a non-technical parent. */
export function renderDigitalLandscapePreviewHtml(model: DigitalLandscapePreview): string {
  const m = model;
  const others = m.others
    .map(
      (o) => `\n        <article class="card other avail-${o.availability}">\n          <div class="card-head">\n            <h3>${escapeHtml(o.display_name)}</h3>\n            <span class="chip chip-${o.availability}">${availLabel[o.availability]}</span>\n          </div>\n          <p class="note">${escapeHtml(o.note ?? "")}</p>\n          <p class="na">Not analyzed yet</p>\n        </article>`,
    )
    .join("");

  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n<title>${escapeHtml(m.title)} — Preview</title>\n<style>\n  :root { --good:#1a7f4b; --watch:#b26a00; --alert:#b3261e; --neutral:#5f6368; --ink:#1f2329; --muted:#5f6368; --line:#e3e6ea; --bg:#f7f8fa; }\n  * { box-sizing: border-box; }\n  body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; }\n  .wrap { max-width:760px; margin:0 auto; padding:28px 20px 56px; }\n  .kicker { letter-spacing:.08em; text-transform:uppercase; font-size:12px; color:var(--muted); margin:0 0 4px; }\n  h1 { font-size:26px; margin:0 0 2px; }\n  .period { color:var(--muted); margin:0 0 18px; }\n  .notice { background:#fff; border:1px solid var(--line); border-left:4px solid var(--neutral); border-radius:10px; padding:12px 14px; margin:0 0 20px; }\n  .card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:18px; }\n  .card-head { display:flex; align-items:center; justify-content:space-between; gap:10px; }\n  .badge { font-size:13px; font-weight:600; padding:4px 10px; border-radius:999px; color:#fff; }\n  .badge-good { background:var(--good); }\n  .badge-watch { background:var(--watch); }\n  .badge-alert { background:var(--alert); }\n  .badge-neutral { background:var(--neutral); }\n  .primary { border-top:4px solid var(--neutral); }\n  .primary.tone-good { border-top-color:var(--good); }\n  .primary.tone-watch { border-top-color:var(--watch); }\n  .primary.tone-alert { border-top-color:var(--alert); }\n  .big { font-size:48px; font-weight:700; margin:10px 0 2px; }\n  .sub { color:var(--muted); margin:0 0 14px; }\n  .copy { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:6px; }\n  .copy h3 { font-size:13px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); margin:0 0 4px; }\n  .copy p { margin:0; }\n  @media (max-width:560px){ .copy{ grid-template-columns:1fr; } }\n  details.how { background:#fff; border:1px solid var(--line); border-radius:12px; padding:6px 14px; margin:18px 0; }\n  details.how summary { cursor:pointer; font-weight:600; padding:8px 0; }\n  details.how ul { margin:6px 0 8px; padding-left:18px; }\n  details.how li { margin:4px 0; }\n  .muted { color:var(--muted); }\n  h2.section { font-size:18px; margin:26px 0 4px; }\n  .grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px; }\n  @media (max-width:560px){ .grid{ grid-template-columns:1fr; } }\n  .other { border-style:dashed; background:#fbfbfc; }\n  .other h3 { margin:0; font-size:16px; }\n  .other .note { color:var(--muted); margin:8px 0 6px; font-size:14px; }\n  .other .na { margin:0; font-size:12px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); }\n  .chip { font-size:12px; font-weight:600; padding:3px 9px; border-radius:999px; border:1px solid var(--line); color:var(--muted); background:#fff; }\n  .chip-blocked { color:var(--alert); border-color:#f0c9c6; background:#fdf3f2; }\n  .chip-coming_soon { color:var(--watch); border-color:#f0dcb6; background:#fdf7ec; }\n  footer { margin-top:30px; color:var(--muted); font-size:13px; text-align:center; }\n</style>\n</head>\n<body>\n<main class="wrap">\n  <header>\n    <p class="kicker">MyChoice · Preview</p>\n    <h1>${escapeHtml(m.title)}</h1>\n    <p class="period">${escapeHtml(m.period_label)}</p>\n  </header>\n\n  <p class="notice">This preview shows <strong>one</strong> insight we can measure today — late-night activity. Everything under “Coming next” is <strong>not yet available</strong>, and we have <strong>not</strong> looked at it.</p>\n\n  <section class="card primary tone-${m.headline.tone}" aria-label="Late-night activity">\n    <div class="card-head">\n      <h2>${escapeHtml(m.primary.display_name)}</h2>\n      <span class="badge badge-${m.headline.tone}">${escapeHtml(m.headline.label)}</span>\n    </div>\n    <p class="big">${m.primary.value}${escapeHtml(m.primary.unit ?? "")}</p>\n    <p class="sub">of the posts and videos your child viewed were late at night (9pm–6am, your local time).</p>\n    <div class="copy">\n      <div><h3>For you</h3><p>${escapeHtml(m.explanation.parent)}</p></div>\n      <div><h3>For your child</h3><p>${escapeHtml(m.explanation.child)}</p></div>\n    </div>\n  </section>\n\n  <details class="how">\n    <summary>How we got this</summary>\n    <ul>\n      <li>Source: ${escapeHtml(m.audit.source_label)} (the file you uploaded).</li>\n      <li>What we measured: the share of viewed posts and videos in the 9pm–6am window, in your local time.</li>\n      <li>Counts: ${m.audit.night_items ?? "—"} late-night out of ${m.audit.total_items ?? "—"} viewed items.</li>\n      <li>Guide: up to ${m.audit.green_cut ?? "—"}% is on track; ${m.audit.green_cut ?? "—"}–${m.audit.yellow_cut ?? "—"}% is worth a look; above ${m.audit.yellow_cut ?? "—"}% needs attention.</li>\n      <li>Method: ${escapeHtml(m.audit.transform_id ?? "—")} ${escapeHtml(m.audit.transform_version ?? "")}.</li>\n    </ul>\n    <p class="muted">We only ever see patterns and counts — never your child’s messages, posts, or who they talked to.</p>\n  </details>\n\n  <h2 class="section">Coming next</h2>\n  <p class="muted">These are part of MyChoice but are <strong>not analyzed yet</strong>. We don’t show results we don’t have.</p>\n  <div class="grid">${others}\n  </div>\n\n  <footer>MyChoice shows patterns, not content. This is a preview.</footer>\n</main>\n</body>\n</html>`;
}
