"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { contact, site } from "@/lib/content";
import { Section } from "./ui/Section";
import { Reveal } from "./ui/Reveal";
import {
  MailIcon,
  MapPinIcon,
  GithubIcon,
  LinkedinIcon,
  SendIcon,
  CheckIcon,
  AlertIcon,
  SpinnerIcon,
} from "./ui/Icons";

type Status = "idle" | "sending" | "sent" | "error";
type Fields = { name: string; email: string; subject: string; message: string };

const EMPTY: Fields = { name: "", email: "", subject: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function Contact() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    // Clear a field's error as soon as the visitor starts fixing it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  function validate(values: Fields): Partial<Fields> {
    const next: Partial<Fields> = {};
    if (values.name.trim().length < 2) next.name = "Please enter your name.";
    if (!EMAIL_RE.test(values.email.trim())) next.email = "That email doesn't look right.";
    if (values.message.trim().length < 10) next.message = "A little more detail, please.";
    return next;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    setServerError("");

    // Bots fill every field they find, including this hidden one.
    const honeypot = (e.currentTarget.elements.namedItem("company") as HTMLInputElement)?.value ?? "";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, company: honeypot }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(data?.error ?? "Could not send the message.");
        setStatus("error");
        return;
      }

      setStatus("sent");
      setFields(EMPTY);
    } catch {
      setServerError("Network problem. Check your connection and try again.");
      setStatus("error");
    }
  }

  const inputBase =
    "w-full rounded-xl border bg-ink-950/60 px-4 py-3 text-sm text-mist-100 placeholder:text-mist-400/70 transition-colors duration-200 outline-none focus:border-accent";

  return (
    <Section id="contact" eyebrow="05 — Contact" title={contact.heading} lead={contact.blurb}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
        {/* Direct details, so nobody is forced through the form */}
        <Reveal className="space-y-4">
          <a
            href={`mailto:${site.email}`}
            className="group card-surface flex items-center gap-4 rounded-2xl p-5 transition-colors hover:border-accent/45"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
              <MailIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[11px] tracking-[0.16em] text-mist-400 uppercase">
                Email
              </span>
              <span className="block truncate text-sm text-mist-100 group-hover:text-accent">
                {site.email}
              </span>
            </span>
          </a>

          <div className="card-surface flex items-center gap-4 rounded-2xl p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
              <MapPinIcon className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-mono text-[11px] tracking-[0.16em] text-mist-400 uppercase">
                Location
              </span>
              <span className="block text-sm text-mist-100">{site.location}</span>
            </span>
          </div>

          <div className="flex gap-3">
            {[
              { href: site.socials.github, label: "GitHub", Icon: GithubIcon },
              { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="card-surface flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-sm text-mist-300 transition-colors hover:border-accent/45 hover:text-accent"
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </a>
            ))}
          </div>
        </Reveal>

        {/* The form */}
        <Reveal delay={0.1}>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="card-surface relative rounded-2xl p-5 sm:p-7"
          >
            {/* Honeypot: off-screen and skipped by keyboard and screen readers. */}
            <div aria-hidden className="pointer-events-none absolute -left-[9999px] opacity-0">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-mist-200">
                  Name <span className="text-accent">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={fields.name}
                  onChange={set("name")}
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={`${inputBase} ${errors.name ? "border-red-400/70" : "border-ink-700"}`}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-xs text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-mist-200">
                  Email <span className="text-accent">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  value={fields.email}
                  onChange={set("email")}
                  autoComplete="email"
                  placeholder="you@company.com"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`${inputBase} ${errors.email ? "border-red-400/70" : "border-ink-700"}`}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="subject" className="mb-2 block text-sm font-medium text-mist-200">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                value={fields.subject}
                onChange={set("subject")}
                placeholder="AI Engineer role at …"
                className={`${inputBase} border-ink-700`}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-mist-200">
                Message <span className="text-accent">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={fields.message}
                onChange={set("message")}
                placeholder="Tell me a little about the role or the problem you're solving."
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "message-error" : undefined}
                className={`${inputBase} resize-y ${errors.message ? "border-red-400/70" : "border-ink-700"}`}
              />
              {errors.message && (
                <p id="message-error" className="mt-1.5 text-xs text-red-400">
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-medium text-ink-950 transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {status === "sending" ? (
                <>
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Send message
                  <SendIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </>
              )}
            </button>

            {/* Result banner. aria-live makes screen readers announce it. */}
            <div aria-live="polite" className="mt-4">
              <AnimatePresence mode="wait">
                {status === "sent" && (
                  <motion.p
                    key="sent"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent"
                  >
                    <CheckIcon className="h-4 w-4 shrink-0" />
                    Thanks. Your message is on its way, I&apos;ll reply soon.
                  </motion.p>
                )}
                {status === "error" && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                  >
                    <AlertIcon className="h-4 w-4 shrink-0" />
                    {serverError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}
