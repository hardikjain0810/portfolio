import { about, education, certifications } from "@/lib/content";
import { Section } from "./ui/Section";
import { Reveal } from "./ui/Reveal";

export function About() {
  return (
    <Section id="about" eyebrow="01 — About" title="Who I am">
      <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        {/* Narrative */}
        <div className="space-y-5">
          {about.paragraphs.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className="text-base leading-relaxed text-mist-300 sm:text-lg">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Facts, education, certifications */}
        <div className="space-y-6">
          <Reveal delay={0.12}>
            <dl className="card-surface divide-y divide-ink-800 rounded-2xl">
              {about.facts.map((fact) => (
                <div key={fact.k} className="flex flex-col gap-1 px-5 py-4">
                  <dt className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
                    {fact.k}
                  </dt>
                  <dd className="text-sm text-mist-200">{fact.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="card-surface rounded-2xl px-5 py-5">
              <h3 className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
                Education
              </h3>
              {education.map((item) => (
                <div key={item.degree} className="mt-3">
                  <p className="text-sm font-medium text-mist-100">{item.degree}</p>
                  <p className="text-sm text-mist-400">{item.school}</p>
                  <p className="mt-1 font-mono text-xs text-mist-400">
                    {item.period}
                    {item.note ? ` · ${item.note}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="card-surface rounded-2xl px-5 py-5">
              <h3 className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
                Certifications
              </h3>
              <ul className="mt-3 space-y-2.5">
                {certifications.map((cert) => (
                  <li key={cert.name} className="text-sm text-mist-300">
                    <span className="mr-2 text-accent">▹</span>
                    {cert.name}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
