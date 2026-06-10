import type { LateNightStory } from "../compose";

export type SignalAvailability = "available" | "coming_soon" | "blocked" | "not_yet_available";
export type Tone = "good" | "watch" | "alert" | "neutral";

export interface StateBadge { state: string; label: string; tone: Tone }

export interface PreviewSignalCard {
  id: string;
  display_name: string;
  availability: SignalAvailability;
  value?: number;
  unit?: string | null;
  note?: string;
}

export interface DigitalLandscapePreview {
  title: string;
  period_label: string;
  available: boolean;                  // whether the primary signal has real data
  primary: PreviewSignalCard;
  signal_status: StateBadge | null;    // layer 1 (measurement)
  agreement: StateBadge | null;        // layer 2 (family agreement)
  others: PreviewSignalCard[];
  explanation: { parent: string; child: string };
  audit: {
    source_label: string;
    timezone: string;
    total_items: number | null;
    night_items: number | null;
    green_cut: number | null;
    yellow_cut: number | null;
    transform_id: string | null;
    transform_version: string | null;
  } | null;
}

const ALPHA_TIMEZONE = "America/New_York";

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

const fmtDate = (iso: string): string =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

/** Layer 1: the measured signal reading. */
function signalBadge(state: string): StateBadge {
  switch (state) {
    case "aligned": return { state, label: "On track", tone: "good" };
    case "attention": return { state, label: "Worth a look", tone: "watch" };
    case "crossed": return { state, label: "Needs attention", tone: "alert" };
    default: return { state, label: "Not enough data", tone: "neutral" };
  }
}
/** Layer 2: how the family's agreement reads it. */
function agreementBadge(state: string): StateBadge {
  switch (state) {
    case "aligned": return { state, label: "Within your agreement", tone: "good" };
    case "at_risk": return { state, label: "Drifting from your agreement", tone: "watch" };
    case "breached": return { state, label: "Past your agreement", tone: "alert" };
    default: return { state, label: "Not enough data", tone: "neutral" };
  }
}

// Honest status of other catalog signals (grounded in docs/reference/instagram-export-field-map.md).
const OTHER_SIGNALS: PreviewSignalCard[] = [
  { id: "content-volume", display_name: "Content volume", availability: "coming_soon", note: "We can see this from your export — turning it on soon." },
  { id: "feed-diversity", display_name: "Feed concentration", availability: "blocked", note: "Your export doesn’t include who made each post, so we can’t measure this yet." },
  { id: "algorithmic-amplification", display_name: "Algorithm influence", availability: "blocked", note: "Needs creator details your export doesn’t include." },
  { id: "binge-sessions", display_name: "Marathon sessions", availability: "not_yet_available", note: "Planned for a later release." },
  { id: "pause-ratio", display_name: "Healthy breaks", availability: "not_yet_available", note: "Planned for a later release." },
];
const others = (): PreviewSignalCard[] => OTHER_SIGNALS.map((o) => ({ ...o }));

/** PURE. Build the view model from a real LateNightStory, or a no-data model when story is null. */
export function buildDigitalLandscapePreview(story: LateNightStory | null): DigitalLandscapePreview {
  if (!story) {
    return {
      title: "Your family's digital landscape",
      period_label: "No data yet",
      available: false,
      primary: { id: "late-night-activity", display_name: "Late-night activity", availability: "not_yet_available" },
      signal_status: null,
      agreement: null,
      others: others(),
      explanation: {
        parent: "We don’t have enough data yet to show late-night activity. Add an export to get started.",
        child: "Once your export is added, you’ll see your late-night activity here.",
      },
      audit: null,
    };
  }
  return {
    title: "Your family's digital landscape",
    period_label: `${fmtDate(story.observation.window_start)} – ${fmtDate(story.observation.window_end)}`,
    available: true,
    primary: {
      id: story.observation.signal_type,
      display_name: "Late-night activity",
      availability: "available",
      value: story.observation.value,
      unit: story.observation.unit,
    },
    signal_status: signalBadge(story.signal_status),
    agreement: story.agreement_interpretation ? agreementBadge(story.agreement_interpretation) : null,
    others: others(),
    explanation: { parent: story.explanation.parent, child: story.explanation.child },
    audit: {
      source_label: "Instagram export",
      timezone: story.observation.timezone ?? ALPHA_TIMEZONE,
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
  blocked: "Not in your export",
  not_yet_available: "Not yet available",
};

const STYLE = `
  :root { --good:#1a7f4b; --watch:#b26a00; --alert:#b3261e; --neutral:#5f6368; --ink:#1f2329; --muted:#5f6368; --line:#e3e6ea; --bg:#f7f8fa; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; }
  .wrap { max-width:760px; margin:0 auto; padding:28px 20px 56px; }
  .kicker { letter-spacing:.08em; text-transform:uppercase; font-size:12px; color:var(--muted); margin:0 0 4px; }
  h1 { font-size:26px; margin:0 0 2px; }
  .period { color:var(--muted); margin:0 0 18px; }
  .notice { background:#fff; border:1px solid var(--line); border-left:4px solid var(--neutral); border-radius:10px; padding:12px 14px; margin:0 0 20px; }
  .card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:18px; }
  .card-head { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
  .states { display:flex; gap:14px; flex-wrap:wrap; margin:12px 0 2px; }
  .state-k { display:block; font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin-bottom:3px; }
  .badge { display:inline-block; font-size:13px; font-weight:600; padding:4px 10px; border-radius:999px; color:#fff; }
  .badge-good { background:var(--good); } .badge-watch { background:var(--watch); }
  .badge-alert { background:var(--alert); } .badge-neutral { background:var(--neutral); }
  .primary { border-top:4px solid var(--neutral); }
  .primary.tone-good { border-top-color:var(--good); } .primary.tone-watch { border-top-color:var(--watch); } .primary.tone-alert { border-top-color:var(--alert); }
  .big { font-size:48px; font-weight:700; margin:12px 0 2px; }
  .sub { color:var(--muted); margin:0 0 14px; }
  .copy { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:6px; }
  .copy h3 { font-size:13px; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); margin:0 0 4px; }
  .copy p { margin:0; }
  @media (max-width:560px){ .copy{ grid-template-columns:1fr; } }
  details.how { background:#fff; border:1px solid var(--line); border-radius:12px; padding:6px 14px; margin:18px 0; }
  details.how summary { cursor:pointer; font-weight:600; padding:8px 0; }
  details.how ul { margin:6px 0 8px; padding-left:18px; } details.how li { margin:4px 0; }
  .muted { color:var(--muted); }
  h2.section { font-size:18px; margin:26px 0 4px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px; }
  @media (max-width:560px){ .grid{ grid-template-columns:1fr; } }
  .other { border-style:dashed; background:#fbfbfc; }
  .other h3 { margin:0; font-size:16px; }
  .other .note { color:var(--muted); margin:8px 0 6px; font-size:14px; }
  .other .na { margin:0; font-size:12px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); }
  .chip { font-size:12px; font-weight:600; padding:3px 9px; border-radius:999px; border:1px solid var(--line); color:var(--muted); background:#fff; }
  .chip-blocked { color:var(--alert); border-color:#f0c9c6; background:#fdf3f2; }
  .chip-coming_soon { color:var(--watch); border-color:#f0dcb6; background:#fdf7ec; }
  .empty { text-align:center; padding:22px; }
  .empty .big { font-size:22px; }
  footer { margin-top:30px; color:var(--muted); font-size:13px; text-align:center; }
`;

/** PURE. Render a static, framework-free HTML document for a non-technical parent. */
export function renderDigitalLandscapePreviewHtml(m: DigitalLandscapePreview): string {
  const otherCards = m.others
    .map(
      (o) => `\n        <article class="card other avail-${o.availability}">\n          <div class="card-head">\n            <h3>${escapeHtml(o.display_name)}</h3>\n            <span class="chip chip-${o.availability}">${availLabel[o.availability]}</span>\n          </div>\n          <p class="note">${escapeHtml(o.note ?? "")}</p>\n          <p class="na">Not analyzed yet</p>\n        </article>`,
    )
    .join("");

  const effectiveTone: Tone = m.agreement?.tone ?? m.signal_status?.tone ?? "neutral";

  const primarySection = m.available
    ? `\n  <section class="card primary tone-${effectiveTone}" aria-label="Late-night activity">\n    <div class="card-head"><h2>${escapeHtml(m.primary.display_name)}</h2></div>\n    <div class="states">\n      <span class="state"><span class="state-k">Reading</span><span class="badge badge-${m.signal_status!.tone}">${escapeHtml(m.signal_status!.label)}</span></span>\n      ${m.agreement ? `<span class="state"><span class="state-k">Your agreement</span><span class="badge badge-${m.agreement.tone}">${escapeHtml(m.agreement.label)}</span></span>` : ""}\n    </div>\n    <p class="big">${m.primary.value}${escapeHtml(m.primary.unit ?? "")}</p>\n    <p class="sub">of the posts and videos your child viewed were late at night (9pm–6am, your local time).</p>\n    <div class="copy">\n      <div><h3>For you</h3><p>${escapeHtml(m.explanation.parent)}</p></div>\n      <div><h3>For your child</h3><p>${escapeHtml(m.explanation.child)}</p></div>\n    </div>\n  </section>\n\n  <details class="how">\n    <summary>How we got this</summary>\n    <ul>\n      <li>Source: ${escapeHtml(m.audit!.source_label)} (the file you uploaded).</li>\n      <li>What we measured: the share of viewed posts and videos in the 9pm–6am window.</li>\n      <li>Time zone: ${escapeHtml(m.audit!.timezone)}.</li>\n      <li>Counts: ${m.audit!.night_items ?? "—"} late-night out of ${m.audit!.total_items ?? "—"} viewed items.</li>\n      <li>Guide: up to ${m.audit!.green_cut ?? "—"}% is on track; ${m.audit!.green_cut ?? "—"}–${m.audit!.yellow_cut ?? "—"}% is worth a look; above ${m.audit!.yellow_cut ?? "—"}% needs attention.</li>\n      <li>Method: ${escapeHtml(m.audit!.transform_id ?? "—")} ${escapeHtml(m.audit!.transform_version ?? "")}.</li>\n    </ul>\n    <p class="muted">We only ever see patterns and counts — never your child’s messages, posts, or who they talked to.</p>\n  </details>`
    : `\n  <section class="card primary empty" aria-label="Late-night activity">\n    <h2>${escapeHtml(m.primary.display_name)}</h2>\n    <p class="big">Not enough data yet</p>\n    <div class="copy">\n      <div><h3>For you</h3><p>${escapeHtml(m.explanation.parent)}</p></div>\n      <div><h3>For your child</h3><p>${escapeHtml(m.explanation.child)}</p></div>\n    </div>\n  </section>`;

  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n<title>${escapeHtml(m.title)} — Preview</title>\n<style>${STYLE}</style>\n</head>\n<body>\n<main class="wrap">\n  <header>\n    <p class="kicker">MyChoice · Preview</p>\n    <h1>${escapeHtml(m.title)}</h1>\n    <p class="period">${escapeHtml(m.period_label)}</p>\n  </header>\n\n  <p class="notice">This preview shows <strong>one</strong> insight we can measure today — late-night activity. Everything under “Coming next” is <strong>not yet available</strong>, and we have <strong>not</strong> looked at it.</p>\n${primarySection}\n\n  <h2 class="section">Coming next</h2>\n  <p class="muted">These are part of MyChoice but are <strong>not analyzed yet</strong>. We don’t show results we don’t have.</p>\n  <div class="grid">${otherCards}\n  </div>\n\n  <footer>MyChoice shows patterns, not content. This is a preview.</footer>\n</main>\n</body>\n</html>`;
}
