"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { hero, marqueeItems, site } from "@/lib/content";
import { GithubIcon, LinkedinIcon, MailIcon, ArrowDownIcon } from "./ui/Icons";

/* Types each role out, pauses, deletes it, moves to the next. */
function Typewriter({ words }: { words: string[] }) {
  const reduceMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;

    const word = words[wordIndex];

    // Work out the next step, then schedule it. Every state change happens
    // inside the timeout rather than in the effect body, which keeps React
    // from cascading an extra render on each keystroke.
    let delay: number;
    let step: () => void;

    if (!deleting && text === word) {
      // Whole word shown: hold it, then start deleting.
      delay = 1800;
      step = () => setDeleting(true);
    } else if (!deleting) {
      delay = 62;
      step = () => setText(word.slice(0, text.length + 1));
    } else if (text === "") {
      // Fully deleted: move to the next word.
      delay = 140;
      step = () => {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      };
    } else {
      delay = 34;
      step = () => setText(word.slice(0, text.length - 1));
    }

    const timer = setTimeout(step, delay);
    return () => clearTimeout(timer);
  }, [text, deleting, wordIndex, words, reduceMotion]);

  if (reduceMotion) return <span className="text-accent">{words[0]}</span>;

  return (
    <span className="text-accent">
      {text}
      <span className="ml-0.5 inline-block animate-caret font-light">|</span>
    </span>
  );
}

export function Hero() {
  const reduceMotion = useReducedMotion();

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pt-28 pb-16 sm:px-8"
    >
      {/* ---- Background layers ---- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-backdrop opacity-40" />
        {/* Fades the grid out toward the bottom so it doesn't fight the content */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-950/60 to-ink-950" />
        <div className="absolute -top-32 -left-24 h-[30rem] w-[30rem] animate-float rounded-full bg-accent/10 blur-[120px]" />
        <div
          className="absolute -right-24 bottom-0 h-[26rem] w-[26rem] animate-float rounded-full bg-violet-soft/10 blur-[120px]"
          style={{ animationDelay: "-3.5s" }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        {/* Availability badge */}
        <motion.div {...rise(0)}>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-ink-700 bg-ink-900/60 px-3.5 py-1.5 font-mono text-xs text-mist-300 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Open to AI / ML engineering roles
          </span>
        </motion.div>

        <motion.p
          {...rise(0.08)}
          className="mt-8 font-mono text-sm text-mist-400 sm:text-base"
        >
          {hero.greeting}
        </motion.p>

        <motion.h1
          {...rise(0.16)}
          className="mt-3 max-w-4xl text-4xl leading-[1.08] font-semibold tracking-tight text-mist-100 sm:text-6xl lg:text-7xl"
        >
          {hero.headline}
        </motion.h1>

        <motion.p
          {...rise(0.24)}
          className="mt-6 font-mono text-lg sm:text-2xl"
          aria-label={site.role}
        >
          <span className="text-mist-400">&gt; </span>
          <Typewriter words={[...site.roles]} />
        </motion.p>

        <motion.p
          {...rise(0.32)}
          className="mt-7 max-w-2xl text-base leading-relaxed text-mist-400 sm:text-lg"
        >
          {hero.blurb}
        </motion.p>

        {/* ---- Calls to action ---- */}
        <motion.div {...rise(0.4)} className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#projects"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-accent px-6 py-3 font-medium text-ink-950 transition-transform duration-200 hover:scale-[1.03] active:scale-95"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            See my work
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-ink-700 px-6 py-3 font-medium text-mist-200 transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            Get in touch
          </a>

          <div className="ml-1 flex items-center gap-1">
            {[
              { href: site.socials.github, label: "GitHub", Icon: GithubIcon },
              { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
              { href: `mailto:${site.email}`, label: "Email", Icon: MailIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-11 w-11 place-items-center rounded-full text-mist-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink-850 hover:text-accent"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* ---- Proof points ---- */}
        <motion.dl
          {...rise(0.48)}
          className="mt-14 grid max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink-800 bg-ink-800 sm:grid-cols-3"
        >
          {hero.stats.map((stat) => (
            // flex-col lets the `order` classes show the value above the label,
            // while the markup keeps the semantic dt-then-dd order.
            <div
              key={stat.label}
              className="flex flex-col bg-ink-900/80 px-5 py-5 backdrop-blur"
            >
              <dt className="order-2 mt-1 text-sm text-mist-400">{stat.label}</dt>
              <dd className="order-1 text-3xl font-semibold text-gradient">
                {stat.value}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* ---- Keyword ticker ---- */}
      <div className="mask-edges mt-16 w-full overflow-hidden">
        <div className="flex w-max animate-marquee gap-3">
          {/* Rendered twice so the loop has no visible seam */}
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 gap-3" aria-hidden={copy === 1}>
              {marqueeItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-ink-800 bg-ink-900/50 px-4 py-2 font-mono text-xs whitespace-nowrap text-mist-400"
                >
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---- Scroll cue ---- */}
      <motion.a
        href="#about"
        aria-label="Scroll to about"
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="mx-auto mt-12 hidden w-max flex-col items-center gap-2 text-mist-400 transition-colors hover:text-accent md:flex"
      >
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase">Scroll</span>
        <motion.span
          animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
        >
          <ArrowDownIcon className="h-4 w-4" />
        </motion.span>
      </motion.a>
    </section>
  );
}
