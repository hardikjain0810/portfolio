/* Ready-made replies. Shared by the browser (small talk) and the API route. */

import { about, chat, site } from "../content.ts";
import type { SmallTalkIntent } from "./smalltalk.ts";

const SMALLTALK_REPLIES: Record<SmallTalkIntent, readonly string[]> = chat.smalltalk;

const openTo = about.facts.find((fact) => /open to/i.test(fact.k))?.v ?? "new roles";

const VARIABLES: Record<string, string> = {
  email: site.email,
  linkedin: site.socials.linkedin,
  github: site.socials.github,
  location: site.location,
  openTo,
};

/** Replaces {email}, {linkedin}, … in a reply template. Unknown keys are kept. */
export function fill(template: string): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => VARIABLES[key] ?? match);
}

export function smallTalkReply(intent: SmallTalkIntent, random: () => number = Math.random): string {
  const options = SMALLTALK_REPLIES[intent];
  return fill(options[Math.floor(random() * options.length)] ?? chat.smalltalk.empty[0]);
}
