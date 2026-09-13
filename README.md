# Hardik Jain — Portfolio

A dark-themed, single-page portfolio built with Next.js 16, Tailwind CSS v4, and Motion.
Fully responsive, animated, and wired to a working contact form.

---

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

---

## Edit your content

**Everything you need to change lives in one file: [`lib/content.ts`](lib/content.ts).**
You do not need to touch any component to update your name, bio, skills, jobs, or projects.

Open it and search for `TODO`. Each one marks something I could not fill in for you,
such as your real start date, how many languages your backend supports, or what Clio
actually does. Replace them all before you publish.

Other things to add:

| What | Where |
| --- | --- |
| Your phone number | `site.phone` in `lib/content.ts` (leave `""` to hide it) |
| Your final domain | `site.url` in `lib/content.ts` |

---

## Turn on the contact form

The form posts to `app/api/contact/route.ts`, which sends the message to your inbox
through [Resend](https://resend.com). The free plan covers 3,000 emails a month,
far more than a portfolio needs. Until you configure it, the form politely tells
visitors to email you directly.

1. Sign up at [resend.com](https://resend.com) **using the address you want messages delivered to**.
2. Go to **API Keys → Create API Key** and copy the key.
3. Copy `.env.example` to `.env.local` and paste your key in:

   ```bash
   cp .env.example .env.local
   ```

4. Restart `npm run dev`.

> **Important:** on Resend's free sandbox you can only send *to* the address you
> signed up with, and the `from` must stay `onboarding@resend.dev`. That is exactly
> what a contact form needs. If you later buy a domain, verify it in Resend and
> change `CONTACT_FROM_EMAIL` to your own address.

### What the endpoint already does for you

- Rejects empty names, malformed emails, and messages under 10 characters.
- Carries a hidden honeypot field that silently absorbs bot submissions.
- Limits each IP address to 5 messages per hour.
- Escapes all user text before it reaches the HTML email, so nobody can inject markup into your inbox.
- Sets `replyTo` to the sender, so hitting Reply in your inbox answers them directly.

---

## Turn on visitor analytics (optional)

[Microsoft Clarity](https://clarity.microsoft.com) is free and unlimited. It gives you
heatmaps of where people click, how far down they scroll, and replays of real sessions,
which is genuinely useful for seeing whether recruiters reach your projects section.

1. Sign in at [clarity.microsoft.com](https://clarity.microsoft.com) with a Microsoft account.
2. Create a project, set the URL to your live site, and choose **Install manually**.
3. Copy the project ID out of the snippet it shows you. It is the short string
   at the end of `clarity.ms/tag/XXXXXXXXXX`, not the whole script.
4. Add it to `.env.local`, and to Vercel under **Settings → Environment Variables**:

   ```
   NEXT_PUBLIC_CLARITY_ID=your_project_id
   ```

5. Redeploy.

Data starts arriving within a couple of hours.

> **Two things to know.** `NEXT_PUBLIC_` variables are baked in when the site is
> **built**, not read at runtime, so adding the variable does nothing until you
> trigger a fresh deploy. And the tag only loads in production, so your own
> `npm run dev` browsing never shows up in the numbers.

### Only real visitors are recorded

Vercel serves every deploy at your public URL and at a private per-deploy address,
and its screenshot bot opens those private addresses after each push. Without a
guard, those bot visits show up in Clarity as HeadlessChrome sessions from the US.

The tag therefore checks, in the visitor's browser, that:

- the page is on the domain set in `site.url` in `lib/content.ts`, or its `www.` variant;
- the browser is not being controlled by an automation tool;
- the user agent is not headless Chrome or Lighthouse.

If any check fails, Clarity never loads. **If you move to a custom domain, update
`site.url`**, otherwise analytics will silently stop recording.

Clarity masks text content in recordings by default, so what visitors type into
your contact form is not captured. If you expect traffic from the EU or UK, add a
short privacy note to the page saying you use Clarity for analytics.

---

## Turn on the chatbot

The "AI version of Hardik" chat in the bottom-right corner answers visitors'
questions **only from `lib/content.ts`**. It runs on free AI APIs.

### Get the keys (free, no card)

1. **Groq:** sign in at [console.groq.com](https://console.groq.com), open **API Keys**,
   create one, and add it as `GROQ_API_KEY`.
2. **Gemini (optional backup):** create a key at [aistudio.google.com](https://aistudio.google.com)
   in a Google Cloud project **with billing disabled**, and add it as `GEMINI_API_KEY`.
   Google may use free-tier prompts to improve its products; leave it blank to skip Gemini.
3. Put both in `.env.local` for local runs, and in Vercel under
   **Settings → Environment Variables**. Then redeploy.

> **Never attach a payment method to these accounts.** On free plans, heavy traffic
> can only use up the free allowance, after which the bot falls back to plain text
> from your site. It can never create a bill.

### How it keeps token use low

Every message stops at the first step that can answer it:

| Step | Handles | AI call |
| --- | --- | --- |
| Small talk | hi, thanks, ok, bye, lol, emoji, "who are you" | none, answered in the browser |
| Instant answers | email, current role, skills, projects, education, "do you know X?" | none |
| Privacy | phone number, salary, visa, résumé | none, always a fixed reply |
| Off-topic | "capital of France", "write me a poem" | none |
| Cache | the same first question asked again within 6 hours | none |
| AI answer | everything else, with only the relevant parts of your content | about 900 input tokens |
| Fallback | every provider busy or down | none, plain text from your site |

The AI providers are tried in order: Groq `openai/gpt-oss-120b`, then Groq
`openai/gpt-oss-20b`, then Gemini `gemini-3.5-flash-lite`. A provider that is rate
limited, erroring, or silent for 6 seconds is skipped.

### Editing what it says

- **Facts** come from the rest of `lib/content.ts`, so fixing your content fixes the bot.
- **Wording** (welcome line, suggestion chips, small-talk replies, privacy replies) lives
  in the `chat` block at the bottom of `lib/content.ts`.
- Your **phone number is never given to the bot**, and any phone number or unknown email
  address in an AI reply is removed before it reaches the visitor.

### Testing it

```bash
npm run test:chat
```

That runs the no-AI layers: small talk, instant answers, privacy, retrieval, and redaction.

To check the AI answers for accuracy, build and start the site with your real keys in
`.env.local` and a relaxed limit, then run the grounding eval in a second terminal.
In PowerShell:

```powershell
$env:CHAT_RATE_LIMIT_PER_10MIN=1000; $env:CHAT_RATE_LIMIT_PER_DAY=5000; npm run build; npm start
```

```bash
npm run eval:chat
```

It asks about 40 questions (facts, unknowns, off-topic, prompt injection, phone-number
extraction) and fails if any privacy or injection check fails or fewer than 90% pass.

---

## Deploy to Vercel

1. Push this folder to a **public** GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and import the repo.
3. Under **Environment Variables**, add the same three keys from your `.env.local`.
4. Click **Deploy**.

Every later `git push` redeploys automatically. Free HTTPS and a `*.vercel.app`
subdomain are included; you can attach a custom domain later at no extra cost
beyond the domain itself.

---

## Project layout

```
app/
  layout.tsx           SEO metadata, fonts, structured data
  page.tsx             composes the sections in order
  globals.css          design tokens — change colours here
  api/contact/route.ts contact form handler
  api/chat/route.ts    chatbot handler (streams answers)
components/
  Nav, Hero, About, Skills, Experience, Projects, Contact, Footer
  chat/                ChatWidget (launcher), ChatPanel (chat window), useChat
  ui/                  Section, Reveal, Icons
  effects/             CursorGlow, ScrollProgress, BackToTop
lib/
  content.ts           ← all your text and data, including chatbot wording
  chat/                small talk, instant answers, retrieval, prompt, providers, guards
  rate-limit.ts        shared per-visitor limits
scripts/
  chat.test.mts        unit tests for the no-AI layers
  chat-eval.mjs        accuracy eval against a running site
```

## Changing the colours

Every colour is a token at the top of `app/globals.css`. The accent is `--color-accent`
(currently a teal, `#5eead4`). Change that one value and the buttons, links, headings,
timeline, and glow all follow.

## Accessibility and motion

Animations are disabled automatically for visitors whose system asks for reduced
motion. The page has a skip link, visible keyboard focus rings, labelled form fields,
and live-region announcements on form results.
