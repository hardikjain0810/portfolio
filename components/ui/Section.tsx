import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

type SectionProps = {
  id: string;
  /** Small mono label above the title, e.g. "02 — Skills" */
  eyebrow?: string;
  title: string;
  /** Optional sentence under the title. */
  lead?: string;
  children: ReactNode;
  className?: string;
};

/** Consistent page section: padding, max width, and an animated heading block. */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      // section-anchor (globals.css) sets the top padding and makes nav jumps
      // land the title just under the navbar instead of below that padding.
      className={`section-anchor px-5 pb-20 sm:px-8 md:pb-28 ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="mb-10 md:mb-14">
          {eyebrow && (
            <p className="mb-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-semibold tracking-tight text-mist-100 sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {lead && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-mist-400 sm:text-lg">
              {lead}
            </p>
          )}
          <div className="mt-7 h-px w-full bg-gradient-to-r from-accent/50 via-ink-700 to-transparent" />
        </Reveal>

        {children}
      </div>
    </section>
  );
}
