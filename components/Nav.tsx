"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { navLinks, site } from "@/lib/content";

export function Nav() {
  const [active, setActive] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  /* Scroll spy: highlight whichever section is crossing the middle of the screen. */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    for (const link of navLinks) {
      const el = document.getElementById(link.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  /* Give the bar a solid background once the page has moved. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* While the mobile menu is open: lock the page and let Escape close it. */
  useEffect(() => {
    if (!menuOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      {/* Skip link: first thing a keyboard or screen-reader user reaches. */}
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-70 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-medium focus:text-ink-950"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "border-b border-ink-800 bg-ink-950/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
        style={{ height: "var(--nav-h)" }}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-8"
        >
          {/* Wordmark */}
          <a
            href="#home"
            className="group flex items-center gap-2.5 font-mono text-sm font-medium text-mist-100"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-violet-soft text-[13px] font-bold text-ink-950 transition-transform duration-300 group-hover:scale-110">
              HJ
            </span>
            <span className="hidden sm:inline">{site.name}</span>
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = active === link.id;
              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`relative block rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-ink-950"
                        : "text-mist-400 hover:text-mist-100"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        // Shared id makes the pill slide between links
                        layoutId={reduceMotion ? undefined : "nav-pill"}
                        className="absolute inset-0 -z-10 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={site.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full border border-ink-700 px-4 py-2 text-sm text-mist-200 transition-colors duration-200 hover:border-accent hover:text-accent sm:inline-block"
            >
              Résumé
            </a>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center rounded-lg border border-ink-700 text-mist-100 transition-colors hover:border-accent md:hidden"
            >
              <span className="relative block h-4 w-5">
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="absolute inset-x-0 top-0 h-0.5 rounded bg-current"
                />
                <motion.span
                  animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-x-0 top-[7px] h-0.5 rounded bg-current"
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="absolute inset-x-0 top-[14px] h-0.5 rounded bg-current"
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-ink-950/97 backdrop-blur-xl md:hidden"
          >
            <ul
              className="flex h-full flex-col items-start justify-center gap-2 px-8"
              style={{ paddingTop: "var(--nav-h)" }}
            >
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i + 0.08, duration: 0.4 }}
                  className="w-full"
                >
                  <a
                    href={`#${link.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-baseline gap-4 border-b border-ink-800 py-4 text-3xl font-semibold tracking-tight text-mist-100 transition-colors active:text-accent"
                  >
                    <span className="font-mono text-xs text-accent">
                      0{i + 1}
                    </span>
                    {link.label}
                  </a>
                </motion.li>
              ))}

              <motion.li
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46, duration: 0.4 }}
                className="mt-8 w-full"
              >
                <a
                  href={site.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full bg-accent px-6 py-3 font-medium text-ink-950"
                >
                  Download résumé
                </a>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
