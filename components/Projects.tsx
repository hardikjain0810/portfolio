"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";
import { projects, type Project } from "@/lib/content";
import { Section } from "./ui/Section";
import { Stagger, StaggerItem } from "./ui/Reveal";
import { GithubIcon, ArrowUpRightIcon } from "./ui/Icons";

function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Pointer position inside the card, used to place the spotlight.
  const pointerX = useMotionValue(-300);
  const pointerY = useMotionValue(-300);
  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${pointerX}px ${pointerY}px, rgba(94,234,212,0.11), transparent 72%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set(e.clientX - rect.left);
    pointerY.set(e.clientY - rect.top);
  };

  const primaryLink = project.demo ?? project.repo;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointerX.set(-300);
        pointerY.set(-300);
      }}
      className="group card-surface relative h-full overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/45"
    >
      {/* Spotlight that follows the cursor */}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />
      )}

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-mist-100 sm:text-xl">
              {project.title}
            </h3>
            <p className="mt-0.5 font-mono text-xs text-accent">{project.tagline}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {project.year && (
              <span className="mr-1 font-mono text-xs text-mist-400">
                {project.year}
              </span>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} source on GitHub`}
                className="grid h-9 w-9 place-items-center rounded-lg text-mist-400 transition-colors hover:bg-ink-800 hover:text-accent"
              >
                <GithubIcon className="h-[18px] w-[18px]" />
              </a>
            )}
          </div>
        </div>

        <p className="mt-4 flex-1 text-sm leading-relaxed text-mist-300">
          {project.description}
        </p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <li
              key={tech}
              className="rounded-md border border-ink-800 bg-ink-950/50 px-2 py-1 font-mono text-[11px] text-mist-400"
            >
              {tech}
            </li>
          ))}
        </ul>

        {primaryLink && (
          <a
            href={primaryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-max items-center gap-1.5 text-sm font-medium text-accent"
          >
            {project.demo ? "View live" : "View code"}
            <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="04 — Projects"
      title="Things I've built"
      lead="A mix of production work and personal builds. Source is on GitHub for all of them."
    >
      {/* 4-column grid: each featured card takes 2 columns, each regular one takes 1.
          With 2 featured and 4 regular that fills exactly two clean rows. */}
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" gap={0.08}>
        {projects.map((project) => (
          <StaggerItem
            key={project.title}
            className={`h-full ${project.featured ? "sm:col-span-2" : ""}`}
          >
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
      </Stagger>

      <p className="mt-8 text-center text-sm text-mist-400">
        More on{" "}
        <a
          href="https://github.com/hardikjain0810"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline-offset-4 hover:underline"
        >
          GitHub
        </a>
        .
      </p>
    </Section>
  );
}
