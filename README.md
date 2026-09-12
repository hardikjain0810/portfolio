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
| Your résumé PDF | Save it as `public/Hardik_Jain_Resume.pdf` |
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
components/
  Nav, Hero, About, Skills, Experience, Projects, Contact, Footer
  ui/                  Section, Reveal, Icons
  effects/             CursorGlow, ScrollProgress, BackToTop
lib/
  content.ts           ← all your text and data
```

## Changing the colours

Every colour is a token at the top of `app/globals.css`. The accent is `--color-accent`
(currently a teal, `#5eead4`). Change that one value and the buttons, links, headings,
timeline, and glow all follow.

## Accessibility and motion

Animations are disabled automatically for visitors whose system asks for reduced
motion. The page has a skip link, visible keyboard focus rings, labelled form fields,
and live-region announcements on form results.
