import { experience } from "@/lib/content";
import { Section } from "./ui/Section";
import { Reveal } from "./ui/Reveal";

export function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="03 — Experience"
      title="Where I've worked"
      lead="Roles in reverse order, and what I actually built in each."
    >
      <div className="relative">
        {/* Timeline rail, hidden on small screens where it would crowd the text */}
        <div
          aria-hidden
          className="absolute top-2 bottom-2 left-[7px] hidden w-px bg-gradient-to-b from-accent/60 via-ink-700 to-transparent sm:block"
        />

        <ol className="space-y-10">
          {experience.map((job, i) => (
            <li key={`${job.company}-${job.role}`} className="relative sm:pl-12">
              {/* Node on the rail */}
              <span
                aria-hidden
                className="absolute top-2 left-0 hidden h-[15px] w-[15px] items-center justify-center sm:flex"
              >
                <span
                  className={`h-[15px] w-[15px] rounded-full border-2 ${
                    job.current
                      ? "border-accent bg-accent/25"
                      : "border-ink-600 bg-ink-900"
                  }`}
                />
                {job.current && (
                  <span className="absolute h-[15px] w-[15px] animate-ping rounded-full bg-accent/40" />
                )}
              </span>

              <Reveal delay={i * 0.1}>
                <article className="card-surface rounded-2xl p-5 transition-colors duration-300 hover:border-accent/40 sm:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-lg font-semibold text-mist-100 sm:text-xl">
                      {job.role}
                    </h3>
                    <span className="font-mono text-xs text-mist-400">
                      {job.period}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-accent">
                    {job.company}
                    <span className="text-mist-400"> · {job.location}</span>
                  </p>

                  <ul className="mt-4 space-y-2.5">
                    {job.bullets.map((bullet, b) => (
                      <li
                        key={b}
                        className="flex gap-3 text-sm leading-relaxed text-mist-300"
                      >
                        <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent/70" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {job.tech.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-md bg-ink-800/70 px-2 py-1 font-mono text-[11px] text-mist-300"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
