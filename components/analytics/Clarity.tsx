import Script from "next/script";

/**
 * Microsoft Clarity: heatmaps, scroll depth, and session recordings.
 *
 * Loads only when NEXT_PUBLIC_CLARITY_ID is set AND the app is running in
 * production, so local development never pollutes your real visitor data.
 * Set the variable in Vercel under Settings -> Environment Variables.
 */
export function Clarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_ID;

  if (!projectId) return null;
  if (process.env.NODE_ENV !== "production") return null;

  // The id goes straight into an inline script, so allow only the character
  // set Clarity actually issues. A malformed value is ignored rather than
  // injected into the page.
  if (!/^[a-z0-9]{6,20}$/i.test(projectId)) {
    console.warn(
      `[Clarity] NEXT_PUBLIC_CLARITY_ID "${projectId}" is not a valid project id; skipping.`,
    );
    return null;
  }

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${projectId}");`}
    </Script>
  );
}
