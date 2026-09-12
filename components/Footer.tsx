import { site, navLinks } from "@/lib/content";
import { GithubIcon, LinkedinIcon, MailIcon } from "./ui/Icons";

export function Footer() {
  return (
    <footer className="border-t border-ink-800 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <a href="#home" className="flex items-center gap-2.5 font-mono text-sm text-mist-100">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-violet-soft text-[13px] font-bold text-ink-950">
              HJ
            </span>
            {site.name}
          </a>
          <p className="mt-3 max-w-xs text-sm text-mist-400">{site.tagline}</p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="text-sm text-mist-400 transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex gap-2">
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
              className="grid h-10 w-10 place-items-center rounded-lg border border-ink-800 text-mist-400 transition-colors hover:border-accent hover:text-accent"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-ink-800 pt-6">
        <p className="font-mono text-xs text-mist-400">
          © {new Date().getFullYear()} {site.name}. Built with Next.js and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
