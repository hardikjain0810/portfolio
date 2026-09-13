import { Resend } from "resend";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

/* This route reads the request, so it must never be prerendered. */
export const dynamic = "force-dynamic";

const MAX = { name: 100, email: 200, subject: 150, message: 4000 };

/* Five messages per visitor per hour. See lib/rate-limit.ts for the caveats. */
const contactLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });

/** Escapes user text before it goes into the HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Deliberately permissive: just enough to catch typos, not to police addresses. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  try {
    if (contactLimiter.limited(clientIp(request))) {
      return Response.json(
        { error: "Too many messages sent. Please try again later." },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const {
      name = "",
      email = "",
      subject = "",
      message = "",
      company = "", // honeypot
    } = (body ?? {}) as Record<string, string>;

    // A real person never sees or fills the honeypot field. Bots do.
    // Answer 200 so the bot believes it succeeded and doesn't retry.
    if (company.trim() !== "") {
      return Response.json({ ok: true });
    }

    const clean = {
      name: String(name).trim().slice(0, MAX.name),
      email: String(email).trim().slice(0, MAX.email),
      subject: String(subject).trim().slice(0, MAX.subject),
      message: String(message).trim().slice(0, MAX.message),
    };

    if (clean.name.length < 2) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!EMAIL_RE.test(clean.email)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    if (clean.message.length < 10) {
      return Response.json(
        { error: "Please write a message of at least 10 characters." },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    // Must stay onboarding@resend.dev until you verify your own domain in Resend.
    const from = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

    if (!apiKey || !to) {
      console.error(
        "Contact form is not configured: set RESEND_API_KEY and CONTACT_TO_EMAIL.",
      );
      return Response.json(
        { error: "The contact form isn't configured yet. Please email me directly." },
        { status: 503 },
      );
    }

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: clean.email, // hitting Reply in your inbox answers the sender
      subject: clean.subject
        ? `Portfolio: ${clean.subject}`
        : `Portfolio message from ${clean.name}`,
      text: [
        `From: ${clean.name} <${clean.email}>`,
        clean.subject ? `Subject: ${clean.subject}` : "",
        "",
        clean.message,
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280">
            New portfolio message
          </p>
          <h2 style="margin:0 0 20px;font-size:20px">${escapeHtml(
            clean.subject || "No subject",
          )}</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
            <tr>
              <td style="padding:8px 0;color:#6b7280;width:80px">Name</td>
              <td style="padding:8px 0"><strong>${escapeHtml(clean.name)}</strong></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#6b7280">Email</td>
              <td style="padding:8px 0">
                <a href="mailto:${escapeHtml(clean.email)}">${escapeHtml(clean.email)}</a>
              </td>
            </tr>
          </table>
          <div style="border-left:3px solid #2dd4bf;padding:4px 0 4px 16px;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(
            clean.message,
          )}</div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend rejected the message:", error);
      return Response.json(
        { error: "Could not send the message. Please email me directly." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Unexpected contact form error:", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
