/* ============================================================================
 * Instant answers: common recruiter questions answered straight from
 * content.ts, with no AI call.
 *
 * Rules that keep these accurate:
 *   - Privacy intents (phone, salary, résumé…) always win.
 *   - Otherwise exactly ONE topic must match. Two topics ("your education
 *     and your projects") go to the AI, which can combine them.
 *   - Nuanced questions ("why", "challenges", "compare", "best") go to the AI.
 * ==========================================================================*/

import {
  certifications,
  chat,
  education,
  experience,
  projects,
  site,
  skillGroups,
} from "../content.ts";
import { sourceFor, type Source } from "./knowledge.ts";
import { fill } from "./replies.ts";
import { normalize, type SmallTalkIntent } from "./smalltalk.ts";

export type InstantAnswer = { id: string; text: string; sources: Source[] };

/* ---------- helpers ---------- */

function article(word: string): "a" | "an" {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** ["a","b","c"] → "a, b, and c" */
function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function sinceFrom(period: string): string {
  const [start, end] = period.split(/\s*[—–-]\s*/);
  return end && /present/i.test(end) ? ` since ${start}` : ` (${period})`;
}

/** Word-boundary "contains", on normalised text. */
function has(q: string, phrase: string): boolean {
  return ` ${q} `.includes(` ${phrase} `);
}

const ME = "(?:you|u|he|him|hardik)";
const re = (source: string) => new RegExp(source.replaceAll("ME", ME));

/* Nuanced questions are better served by the AI. */
const NUANCED = re(
  "\\b(?:why|how come|how did|how does|how was|how were|challeng\\w*|learn\\w*|difficult\\w*|hardest|compar\\w*|differen\\w*|versus|vs|better|worse|improv\\w*|decid\\w*|decision\\w*|architect\\w*|trade ?offs?|explain\\w*|elaborate|in detail|details?|deep dive|more about|walk me through|biggest|proud\\w*|favou?rite|best|recommend\\w*|should i|years?|how long|months?)\\b",
);

/* ---------- privacy: these always answer, whatever else was asked ---------- */

const PHONE = re(
  "\\b(?:phone|mobile number|mobile no|cell number|cellphone|whatsapp|contact number|telephone|call ME|number to call|your number|his number|phone no)\\b",
);
const PERSONAL = re(
  "\\b(?:salary|salaries|ctc|compensation|expected pay|pay expectations?|stipend|visa|sponsorship|sponsor|work permit|how old|your age|his age|date of birth|dob|birthday|married|marital|religion|caste|girlfriend|boyfriend|wife|husband|home address|notice period|relocat\\w*|remote work|work remotely|hybrid)\\b",
);
const RESUME = re("\\b(?:resume|curriculum vitae|(?:your|his|the|a|download|share|send) cv|cv download)\\b");

/* ---------- topics ---------- */

const EMAIL = /\b(?:email|e mail|mail id|mail address|email address|gmail|outlook)\b/;
const LINKEDIN = /\blinked ?in\b/;
const GITHUB = /\b(?:github|git hub|repositories|your repos|his repos|source code)\b/;
const CONTACT = re(
  "\\b(?:contact ME|how (?:can|do|could) (?:i|we) (?:contact|reach|hire)|reach (?:ME|out)|get in touch|connect with ME|talk to ME|contact details|contact info\\w*|hire ME)\\b",
);

const LOCATION = re(
  "\\b(?:where (?:are|r) (?:you|u)(?! (?:working|employed|currently working))|where is (?:he|hardik)(?! working)|where do (?:you|u) live|where does (?:he|hardik) live|based (?:in|out of)|based where|your location|his location|current location|located|which city|what city|which country|what country|hometown)\\b",
);

const ROLE = re(
  "\\b(?:current(?:ly)? (?:role|job|position|company|employer|work|title)|what (?:do|does) ME do(?: now| currently| for (?:work|a living))?$|what (?:are|r) (?:you|u) doing (?:now|currently)|where (?:do|does) ME work|where (?:are|r) (?:you|u) (?:working|employed)|where is (?:he|hardik) working|who (?:do|does) ME work for|(?:your|his) (?:current )?(?:job|role|position|title|designation)|what is (?:your|his) (?:job|role|title|position|designation)|present (?:role|job|company)|working at)\\b",
);

const AVAILABILITY = re(
  "\\b(?:open to (?:work|roles?|new roles?|opportunit\\w*|jobs?|offers?|new (?:jobs?|opportunit\\w*))|open for (?:work|roles?|opportunit\\w*)|available (?:for|to) (?:work|hire|join|new)|availability|looking for (?:a )?(?:new )?(?:job|role|work|opportunit\\w*|position)|job hunting|actively looking|seeking (?:a )?(?:new )?(?:job|role|opportunit\\w*)|can (?:i|we) hire|interested in (?:a )?(?:new )?(?:role|job|opportunit\\w*))\\b",
);

const EDUCATION =
  /\b(?:education\w*|degree|studied|study|studies|college|university|graduat\w*|bachelor\w*|b ?sc|cgpa|gpa|grades?|qualification\w*|academic\w*|alma mater)\b/;

const CERTIFICATIONS = /\b(?:certif\w*|courses?|credentials?)\b/;

const PROJECT_LIST = re(
  "\\b(?:projects?|what (?:have|has) ME (?:built|made|worked on)|things (?:you|u) (?:built|made)|show me (?:your|ur|his) work|side projects?|personal projects?)\\b",
);

const LANGUAGES = re(
  "\\b(?:programming languages?|coding languages?|(?:which|what) languages|languages (?:do|does) ME (?:know|use|code))\\b",
);
const LANGUAGES_NOT = /\b(?:support\w*|serve\w*|backend|multilingual|translat\w*|speak\w*)\b/;

const SKILLS = re(
  "\\b(?:skills?|skill set|skillset|tech stack|stack|technolog\\w*|tools|frameworks?|what (?:do|can|does) ME (?:know|use)|expertise|proficien\\w*|good at|strengths?|toolkit)\\b",
);

const EXPERIENCE = re(
  "\\b(?:experience(?! (?:with|in|using|of))|work history|career|previous (?:jobs?|roles?|compan\\w*|employers?|work)|past (?:jobs?|roles?|work)|companies|where (?:have|has) ME worked|worked at|employment|internships?|job history)\\b",
);

const INTRO = re(
  "\\b(?:tell me about (?:yourself|urself|you|him|hardik)|introduce (?:yourself|urself)|who is hardik|about yourself|(?:your|his) background|quick intro)\\b",
);

/* ---------- tech names for "do you know X?" ---------- */

type TechInfo = { display: string; groups: Set<string>; jobs: Set<string>; projects: Set<string> };

const TECH_ALIASES: Record<string, string> = {
  sklearn: "scikit learn",
  "scikit": "scikit learn",
  huggingface: "hugging face transformers",
  "hugging face": "hugging face transformers",
  transformers: "hugging face transformers",
  postgres: "postgresql",
  mongo: "mongodb",
  js: "javascript",
  "vector db": "vector search",
  "vector database": "vector search",
  "vector databases": "vector search",
  "fine tune": "fine tuning",
  finetuning: "fine tuning",
  "github action": "github actions",
};

const TECH = new Map<string, TechInfo>();

function addTech(name: string, update: (info: TechInfo) => void) {
  const key = normalize(name);
  if (!key) return;
  const info = TECH.get(key) ?? { display: name, groups: new Set(), jobs: new Set(), projects: new Set() };
  update(info);
  TECH.set(key, info);
}

for (const group of skillGroups) {
  for (const item of group.items) addTech(item, (info) => info.groups.add(group.title));
}
for (const job of experience) {
  for (const tech of job.tech) addTech(tech, (info) => info.jobs.add(job.company));
}
for (const project of projects) {
  for (const tech of project.tech) addTech(tech, (info) => info.projects.add(project.title));
}

/** Tech names found in the question, as [matched phrase, info] pairs. */
function techMentioned(q: string): Array<[string, TechInfo]> {
  const found = new Map<string, string>(); // tech key -> phrase as typed
  for (const key of TECH.keys()) if (has(q, key)) found.set(key, key);
  for (const [alias, key] of Object.entries(TECH_ALIASES)) {
    if (has(q, alias) && TECH.has(key) && !found.has(key)) found.set(key, alias);
  }
  // Drop names contained in a longer match ("rest" inside "rest api design").
  const keys = [...found.keys()];
  return keys
    .filter((k) => !keys.some((other) => other !== k && ` ${other} `.includes(` ${k} `)))
    .map((k) => [found.get(k)!, TECH.get(k)!]);
}

/* "Do you know X?", "experience with X", "familiar with X"… */
const TECH_ASK = re(
  "\\b(?:(?:do|does|did|have|has|can) ME (?:know|use|used|work|worked|have|code)|familiar with|experience (?:with|in|using)|proficient|comfortable with|knowledge of|worked with|work with|used)\\b",
);

/* True when the message is only the tech name, maybe plus "experience". */
function onlyTech(q: string, phrase: string): boolean {
  const rest = ` ${q} `
    .replace(` ${phrase} `, " ")
    .replace(/\b(?:experience|skills?|knowledge|expertise|proficiency)\b/g, " ")
    .trim();
  return rest === "";
}

/* ---------- project names ---------- */

/* A named project gets the instant description only for generic questions
   ("tell me about FinPlanX", "what is Konnected?"). Anything more specific
   ("how many users does FinPlanX have") goes to the AI, which can say when
   the site doesn't have that detail. */
const GENERIC_PROJECT_WORDS = new Set(
  "tell me about what is whats the your ur his hardik project projects app does do it describe info information on show a an".split(" "),
);

function isGenericProjectQuestion(q: string, alias: string): boolean {
  const rest = ` ${q} `.replace(` ${alias} `, " ").trim();
  return rest === "" || rest.split(" ").every((word) => GENERIC_PROJECT_WORDS.has(word));
}

const PROJECT_ALIASES = projects.map((project) => {
  const full = normalize(project.title);
  const trimmed = full.replace(/\b(?:ml|eda|prediction|system|app|project)\b/g, " ").replace(/\s+/g, " ").trim();
  return { project, aliases: [...new Set([full, trimmed].filter((a) => a.length >= 4))] };
});

/* ---------- answers ---------- */

const current = experience.find((job) => job.current) ?? experience[0];

/* Company names of earlier jobs, plus their first word ("cognizant"). */
const PAST_COMPANIES = experience
  .filter((job) => job !== current)
  .flatMap((job) => {
    const name = normalize(job.company);
    return [name, name.split(" ")[0]].filter((n) => n.length >= 4);
  });

function roleAnswer(): InstantAnswer {
  const opener = current.current ? "I'm currently" : "Most recently, I was";
  const bullet = current.bullets[0] ? ` There, I ${lowerFirst(current.bullets[0])}` : "";
  return {
    id: "role",
    text: `${opener} ${article(current.role)} ${current.role} at ${current.company}${sinceFrom(current.period)}.${bullet}`,
    sources: [sourceFor("experience")],
  };
}

function experienceAnswer(): InstantAnswer {
  const jobs = experience.map((job) => `${article(job.role)} ${job.role} at ${job.company} (${job.period})`);
  return {
    id: "experience",
    text: `I've worked as ${list(jobs)}. Ask me about either role for details.`,
    sources: [sourceFor("experience")],
  };
}

function educationAnswer(): InstantAnswer {
  const parts = education.map(
    (item) =>
      `${article(item.degree)} ${item.degree} from ${item.school} in ${item.location} (${item.period})${
        item.note ? `, with ${item.note}` : ""
      }`,
  );
  return { id: "education", text: `I earned ${list(parts)}.`, sources: [sourceFor("about")] };
}

function certificationsAnswer(): InstantAnswer {
  const certs = certifications.map(
    (cert) => `${cert.name} (${[cert.issuer, cert.year].filter(Boolean).join(", ")})`,
  );
  return {
    id: "certifications",
    text: certs.length ? `My certifications are ${list(certs)}.` : fill(chat.replies.unknown),
    sources: [sourceFor("about")],
  };
}

function projectListAnswer(): InstantAnswer {
  const ordered = [...projects].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  const names = ordered.map((project) => `${project.title} (${project.tagline})`);
  return {
    id: "projects",
    text: `Here's what I've built: ${list(names)}. Ask me about any of them.`,
    sources: [sourceFor("projects")],
  };
}

function projectAnswer(project: (typeof projects)[number]): InstantAnswer {
  const code = project.repo ? ` The code is on GitHub: ${project.repo}` : "";
  const demo = project.demo ? ` Live demo: ${project.demo}` : "";
  return {
    id: `project:${project.title}`,
    text: `${project.title} (${project.tagline}). ${project.description} I built it with ${list(project.tech)}.${code}${demo}`,
    sources: [sourceFor("projects")],
  };
}

function skillsAnswer(): InstantAnswer {
  const groups = skillGroups.map((group) => `${group.title}: ${group.items.join(", ")}`);
  return { id: "skills", text: `My core skills. ${groups.join(". ")}.`, sources: [sourceFor("skills")] };
}

function languagesAnswer(): InstantAnswer | null {
  const group = skillGroups.find((g) => /language/i.test(g.title));
  if (!group) return null;
  return { id: "languages", text: `I code in ${list(group.items)}.`, sources: [sourceFor("skills")] };
}

function techAnswer(info: TechInfo): InstantAnswer {
  const where: string[] = [];
  if (info.jobs.size) where.push(`at ${list([...info.jobs])}`);
  if (info.projects.size) where.push(`in ${list([...info.projects])}`);
  const detail = where.length
    ? ` I've used it ${where.join(" and ")}.`
    : ` It's part of my ${list([...info.groups])} skills.`;
  const sources: Source[] = [];
  if (info.groups.size) sources.push(sourceFor("skills"));
  if (info.jobs.size) sources.push(sourceFor("experience"));
  if (info.projects.size) sources.push(sourceFor("projects"));
  return { id: `tech:${info.display}`, text: `Yes, I work with ${info.display}.${detail}`, sources };
}

function introAnswer(): InstantAnswer {
  return {
    id: "intro",
    text: `I'm ${site.name}, ${article(site.role)} ${site.role} at ${current.company}, based in ${site.location}. ${site.tagline}`,
    sources: [sourceFor("about")],
  };
}

const reply = (id: string, template: string, section: Source["section"]): InstantAnswer => ({
  id,
  text: fill(template),
  sources: [sourceFor(section)],
});

/* ---------- main entry ---------- */

type Topic = { topic: string; answer: () => InstantAnswer | null };

export function instantAnswer(normalizedQuestion: string, lead: SmallTalkIntent | null = null): InstantAnswer | null {
  const q = normalizedQuestion.trim();
  if (!q) return null;

  const withLead = (answer: InstantAnswer | null): InstantAnswer | null =>
    answer && (lead === "greeting" || lead === "howareyou") ? { ...answer, text: `Hi! ${answer.text}` } : answer;

  // Privacy first, regardless of anything else in the message.
  if (PHONE.test(q)) return withLead(reply("phone", chat.replies.phone, "contact"));
  if (PERSONAL.test(q)) return withLead(reply("personal", chat.replies.personal, "contact"));
  if (RESUME.test(q)) return withLead(reply("resume", chat.replies.resume, "contact"));

  const words = q.split(" ").length;
  if (words > 16 || NUANCED.test(q)) return null;

  const topics: Topic[] = [];

  if (EMAIL.test(q)) topics.push({ topic: "contact", answer: () => reply("email", chat.replies.email, "contact") });
  else if (LINKEDIN.test(q)) topics.push({ topic: "contact", answer: () => reply("linkedin", chat.replies.linkedin, "contact") });
  else if (GITHUB.test(q)) topics.push({ topic: "contact", answer: () => reply("github", chat.replies.github, "contact") });
  else if (CONTACT.test(q)) topics.push({ topic: "contact", answer: () => reply("contact", chat.replies.contact, "contact") });

  if (LOCATION.test(q)) topics.push({ topic: "location", answer: () => reply("location", chat.replies.location, "about") });
  // "your role at Cognizant" is about a past job, not the current one.
  const mentionsPastCompany = PAST_COMPANIES.some((name) => has(q, name));
  if (ROLE.test(q) && !mentionsPastCompany) topics.push({ topic: "role", answer: roleAnswer });
  if (AVAILABILITY.test(q)) {
    topics.push({ topic: "availability", answer: () => reply("availability", chat.replies.availability, "contact") });
  }
  if (EDUCATION.test(q)) topics.push({ topic: "education", answer: educationAnswer });
  if (CERTIFICATIONS.test(q) && !/\bof course\b/.test(q)) topics.push({ topic: "certifications", answer: certificationsAnswer });

  const namedProjects = PROJECT_ALIASES.filter(({ aliases }) => aliases.some((alias) => has(q, alias)));
  if (namedProjects.length === 1) {
    const { project, aliases } = namedProjects[0];
    const alias = aliases.find((a) => has(q, a))!;
    if (!isGenericProjectQuestion(q, alias)) return null;
    topics.push({ topic: "projects", answer: () => projectAnswer(project) });
  } else if (namedProjects.length > 1) {
    return null; // comparing projects: let the AI combine them
  } else if (PROJECT_LIST.test(q)) {
    topics.push({ topic: "projects", answer: projectListAnswer });
  }

  const tech = techMentioned(q);
  // "Do you know X?" is yes/no and answerable here. "Which X did you use?"
  // asks for a specific tool (e.g. Pinecone), so it goes to the AI.
  const asksWhichTool = /^(?:which|what|where|when|who|how)\b/.test(q);
  const asksAboutTech =
    tech.length === 1 &&
    words <= 9 &&
    ((TECH_ASK.test(q) && !asksWhichTool) || onlyTech(q, tech[0][0]));
  if (LANGUAGES.test(q) && !LANGUAGES_NOT.test(q)) {
    topics.push({ topic: "skills", answer: languagesAnswer });
  } else if (asksAboutTech) {
    topics.push({ topic: "skills", answer: () => techAnswer(tech[0][1]) });
  } else if (tech.length > 1 && TECH_ASK.test(q)) {
    return null;
  } else if (SKILLS.test(q)) {
    topics.push({ topic: "skills", answer: skillsAnswer });
  }

  if (EXPERIENCE.test(q) && namedProjects.length === 0) topics.push({ topic: "experience", answer: experienceAnswer });
  if (INTRO.test(q)) topics.push({ topic: "intro", answer: introAnswer });

  const distinct = new Set(topics.map((t) => t.topic));
  if (distinct.size !== 1) return null;

  return withLead(topics[0].answer());
}
