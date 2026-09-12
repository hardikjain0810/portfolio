import { skillGroups } from "@/lib/content";
import { Section } from "./ui/Section";
import { Stagger, StaggerItem } from "./ui/Reveal";

export function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="02 — Skills"
      title="What I work with"
      lead="The tools I reach for day to day, grouped by where they sit in the stack."
    >
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
        {skillGroups.map((group) => (
          <StaggerItem key={group.title} className="h-full">
            <div className="group card-surface h-full rounded-2xl p-5 transition-colors duration-300 hover:border-accent/45">
              <h3 className="flex items-center gap-2.5 text-sm font-semibold text-mist-100">
                <span className="h-1.5 w-1.5 rounded-full bg-accent transition-transform duration-300 group-hover:scale-150" />
                {group.title}
              </h3>

              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-ink-800 bg-ink-950/50 px-2.5 py-1.5 font-mono text-xs text-mist-300 transition-colors duration-200 hover:border-accent/50 hover:text-accent"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
