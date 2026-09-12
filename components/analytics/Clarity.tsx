import Script from "next/script";
import { site } from "@/lib/content";

/**
 * Microsoft Clarity: heatmaps, scroll depth, and session recordings.
 *
 * Three layers keep the data limited to real visitors:
 *
 * 1. Build time: the tag is only emitted when NEXT_PUBLIC_CLARITY_ID is set
 *    and the app is a production build, so `npm run dev` never records.
 *
 * 2. Domain check (in the browser): Vercel serves every build at its public
 *    URL *and* at a private per-deploy address like
 *    portfolio-abc123-yourname-projects.vercel.app. Vercel's screenshot bot
 *    opens those per-deploy addresses after each push. Because the same HTML
 *    is served everywhere, only the browser knows which address it is on, so
 *    the check has to run there. Clarity starts only on the domain in
 *    `site.url` (lib/content.ts), plus its www. variant.
 *
 * 3. Automation check (in the browser): skips browsers driven by automation
 *    tools, and headless or Lighthouse user agents, which catches bots that
 *    do hit the public domain.
 */
export function Clarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_ID;

  if (!projectId) return null;
  if (process.env.NODE_ENV !== "production") return null;

  // The id is embedded in an inline script, so allow only the character set
  // Clarity actually issues. A malformed value is ignored, never injected.
  if (!/^[a-z0-9]{6,20}$/i.test(projectId)) {
    console.warn(
      `[Clarity] NEXT_PUBLIC_CLARITY_ID "${projectId}" is not a valid project id; skipping.`,
    );
    return null;
  }

  const host = new URL(site.url).hostname;
  const allowedHosts = host.startsWith("www.")
    ? [host, host.slice(4)]
    : [host, `www.${host}`];

  // JSON.stringify quotes and escapes both values safely for the script body.
  const config = JSON.stringify({ id: projectId, hosts: allowedHosts });

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function (cfg) {
  if (cfg.hosts.indexOf(location.hostname) === -1) return;
  if (navigator.webdriver) return;
  if (/HeadlessChrome|Lighthouse/i.test(navigator.userAgent)) return;
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", cfg.id);
})(${config});`}
    </Script>
  );
}
