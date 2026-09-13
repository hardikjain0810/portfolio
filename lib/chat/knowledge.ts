/* ============================================================================
 * The chatbot's knowledge base: labelled chunks built from lib/content.ts.
 *
 * Imports use explicit .ts extensions so the same files run under Node's
 * built-in TypeScript support in scripts/chat.test.mts.
 *
 * site.phone is deliberately never read here, so no answer can contain it.
 * ==========================================================================*/

import {
  about,
  certifications,
  contact,
  education,
  experience,
  hero,
  marqueeItems,
  projects,
  site,
  skillGroups,
} from "../content.ts";

/** Page sections a source chip can scroll to. Must match the section ids. */
export type SectionId = "home" | "about" | "skills" | "experience" | "projects" | "contact";

export type Source = { section: SectionId; label: string };

export type Chunk = {
  id: string;
  section: SectionId;
  title: string;
  text: string;
};

export const SECTION_LABELS: Record<SectionId, string> = {
  home: "Highlights",
  about: "About",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  contact: "Contact",
};

export function sourceFor(section: SectionId): Source {
  return { section, label: SECTION_LABELS[section] };
}

const openTo = about.facts.find((fact) => /open to/i.test(fact.k))?.v ?? "";

function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [
    {
      id: "profile",
      section: "about",
      title: "Profile",
      text: [
        `Name: ${site.name}. Role: ${site.role}. Based in: ${site.location}.`,
        site.tagline,
        hero.blurb,
        ...about.paragraphs,
        about.facts.map((fact) => `${fact.k}: ${fact.v}.`).join(" "),
      ].join(" "),
    },
    {
      id: "highlights",
      section: "home",
      title: "Highlights",
      text: hero.stats.map((stat) => `${stat.value} ${stat.label}.`).join(" "),
    },
    {
      id: "focus",
      section: "skills",
      title: "Focus areas",
      text: `Focus areas: ${[...site.roles, ...marqueeItems].join(", ")}.`,
    },
    {
      id: "contact",
      section: "contact",
      title: "Contact and availability",
      text: [
        `Email: ${site.email}.`,
        `LinkedIn: ${site.socials.linkedin}.`,
        `GitHub: ${site.socials.github}.`,
        openTo ? `Open to: ${openTo}.` : "",
        contact.blurb,
        "There is a contact form at the bottom of the page.",
      ]
        .filter(Boolean)
        .join(" "),
    },
    {
      id: "education",
      section: "about",
      title: "Education",
      text: education
        .map(
          (item) =>
            `Education: ${item.degree}, ${item.school}, ${item.location}, ${item.period}.${
              item.note ? ` ${item.note}.` : ""
            }`,
        )
        .join(" "),
    },
    {
      id: "certifications",
      section: "about",
      title: "Certifications",
      text: `Certifications: ${certifications
        .map((cert) => `${cert.name} (${[cert.issuer, cert.year].filter(Boolean).join(", ")})`)
        .join("; ")}.`,
    },
  ];

  experience.forEach((job, i) => {
    chunks.push({
      id: `experience-${i}`,
      section: "experience",
      title: `${job.role} at ${job.company}`,
      text: [
        `Job: ${job.role} at ${job.company}, ${job.location}, ${job.period}${
          job.current ? " (current role)" : ""
        }.`,
        ...job.bullets,
        `Tech used: ${job.tech.join(", ")}.`,
      ].join(" "),
    });
  });

  skillGroups.forEach((group, i) => {
    chunks.push({
      id: `skills-${i}`,
      section: "skills",
      title: `Skills: ${group.title}`,
      text: `Skills, ${group.title}: ${group.items.join(", ")}.`,
    });
  });

  projects.forEach((project, i) => {
    chunks.push({
      id: `project-${i}`,
      section: "projects",
      title: `Project: ${project.title}`,
      text: [
        `Project: ${project.title} (${project.tagline})${project.year ? `, ${project.year}` : ""}.`,
        project.description,
        `Built with ${project.tech.join(", ")}.`,
        project.repo ? `Code: ${project.repo}.` : "",
        project.demo ? `Live demo: ${project.demo}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    });
  });

  return chunks;
}

export const CHUNKS: Chunk[] = buildChunks();

/* FNV-1a hash of the knowledge base. Cached answers are keyed on it, so
   editing content.ts automatically invalidates stale cached replies. */
function fnv1a(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export const CONTENT_HASH = fnv1a(JSON.stringify(CHUNKS));

export const PROFILE = { openTo };
