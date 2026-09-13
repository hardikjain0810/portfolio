/* ============================================================================
 * Tiny keyword retrieval (BM25) over the knowledge chunks.
 *
 * The whole site is ~3K tokens, so there is no need for embeddings or a
 * vector database. Picking the top few chunks keeps each AI call around
 * 1.3K tokens, which is what lets the free API tiers stretch.
 * ==========================================================================*/

import { CHUNKS, type Chunk } from "./knowledge.ts";
import { normalize } from "./smalltalk.ts";

const STOPWORDS = new Set(
  (
    "a an the and or but if of to in on at by for with from as is are was were be been being am do does did " +
    "have has had having i me my mine we our you your yours u ur he him his she her it its they them their " +
    "this that these those there here what which who whom whose when where why how can could would should will " +
    "shall may might must about into over under again further then once all any both each few more most other " +
    "some such no nor not only own same so than too very s t just dont tell show give please want know like get " +
    "hardik jain"
  ).split(" "),
);

/* Words that mean "this question is about Hardik", even with no keyword hit. */
const ABOUT_HIM = new Set(["you", "your", "yours", "u", "ur", "he", "him", "his", "hardik", "jain", "yourself"]);

/* Query expansion so recruiter phrasing finds the right chunk. */
const SYNONYMS: Record<string, string> = {
  job: "experience role company",
  work: "experience role company",
  role: "experience job",
  company: "experience job",
  employer: "experience job",
  career: "experience job",
  worked: "experience job",
  working: "experience job",
  current: "current role",
  built: "project built",
  build: "project built",
  made: "project built",
  repo: "project code github",
  github: "project code github",
  app: "project",
  stack: "skills tech",
  tool: "skills tech",
  tech: "skills tech",
  technology: "skills tech",
  framework: "skills",
  degree: "education",
  college: "education",
  university: "education",
  study: "education",
  studied: "education",
  cgpa: "education",
  gpa: "education",
  graduate: "education",
  course: "certifications",
  certificate: "certifications",
  certification: "certifications",
  reach: "contact email linkedin",
  hire: "contact open roles",
  email: "contact email",
  linkedin: "contact linkedin",
  available: "open roles contact",
  based: "based location",
  city: "based location",
  live: "based location",
  accuracy: "accuracy model production",
  metric: "accuracy highlights",
  impact: "highlights accuracy hours",
  achievement: "highlights accuracy",
  llm: "llm language models generative rag",
  genai: "generative llm",
  generative: "generative llm",
  chatbot: "generative llm rag",
  rag: "rag retrieval generative",
  retrieval: "rag retrieval",
  vector: "vector search pinecone embeddings",
  pinecone: "pinecone retrieval",
  ml: "machine learning model",
  model: "model fine tuned",
  train: "training model fine tuned",
  finetune: "fine tuned model",
  backend: "backend fastapi api",
  api: "api fastapi rest",
  deploy: "deployment gpu runpod",
  deployment: "deployment gpu runpod",
  gpu: "gpu runpod",
  cloud: "deployment runpod docker",
  security: "security network intrusion",
  intrusion: "security intrusion",
  finance: "financial investment finplanx",
  investment: "investment finplanx",
  multilingual: "multilingual languages backend",
  language: "languages multilingual",
  automation: "automated workflows hours",
  automate: "automated workflows hours",
  pipeline: "pipeline data ingestion",
};

function stem(token: string): string {
  if (token.length > 5 && token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.length > 5 && token.endsWith("ing")) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

function terms(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t && !STOPWORDS.has(t))
    .map(stem);
}

/* ---------- index ---------- */

type Doc = { chunk: Chunk; tf: Map<string, number>; length: number };

const DOCS: Doc[] = CHUNKS.map((chunk) => {
  const words = terms(`${chunk.title} ${chunk.text}`);
  const tf = new Map<string, number>();
  for (const w of words) tf.set(w, (tf.get(w) ?? 0) + 1);
  return { chunk, tf, length: words.length };
});

const AVG_LENGTH = DOCS.reduce((sum, d) => sum + d.length, 0) / DOCS.length;

const DF = new Map<string, number>();
for (const doc of DOCS) for (const term of doc.tf.keys()) DF.set(term, (DF.get(term) ?? 0) + 1);

function idf(term: string): number {
  const df = DF.get(term) ?? 0;
  return Math.log(1 + (DOCS.length - df + 0.5) / (df + 0.5));
}

/* ---------- query ---------- */

export type Retrieval = {
  /** Profile chunk first, then the best matches. Duplicates removed. */
  chunks: Chunk[];
  /** Best-matching chunk (not forced), for the degraded fallback. */
  best: Chunk | null;
  topScore: number;
  /** Whether the question plausibly concerns Hardik at all. */
  onTopic: boolean;
};

export function retrieve(question: string, k = 4): Retrieval {
  const raw = normalize(question).split(" ").filter(Boolean);
  const base = terms(question);
  const expanded = [...base];
  for (const term of base) {
    const extra = SYNONYMS[term];
    if (extra) expanded.push(...extra.split(" ").map(stem));
  }

  const K1 = 1.2;
  // Chunks vary a lot in length (a skills list vs a job), so length is only
  // lightly normalised; otherwise long, evidence-rich chunks get buried.
  const B = 0.4;
  const scored = DOCS.map((doc) => {
    let score = 0;
    // The focus list is only keywords, so real evidence (jobs, projects) should outrank it.
    const chunkWeight = doc.chunk.id === "focus" ? 0.5 : 1;
    for (const term of new Set(expanded)) {
      const f = doc.tf.get(term);
      if (!f) continue;
      // Terms the visitor actually typed count double versus synonyms.
      const weight = base.includes(term) ? 1 : 0.5;
      score += chunkWeight * weight * idf(term) * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * doc.length) / AVG_LENGTH)));
    }
    return { doc, score };
  }).sort((a, b) => b.score - a.score);

  // The profile is always sent, so it doesn't use up one of the k slots.
  const hits = scored
    .filter((s) => s.score > 0 && s.doc.chunk.id !== "profile")
    .slice(0, k)
    .map((s) => s.doc.chunk);
  const profile = CHUNKS.find((c) => c.id === "profile");
  const chunks = [...new Map([profile, ...hits].filter(Boolean).map((c) => [c!.id, c!])).values()];

  const knownTerm = base.some((term) => DF.has(term));
  const onTopic = knownTerm || raw.some((word) => ABOUT_HIM.has(word));

  // For the no-AI fallback, a specific chunk (a job, a project) beats the generic profile.
  const bestSpecific = scored.find((s) => s.score > 0 && s.doc.chunk.id !== "profile");
  const bestAny = scored[0] && scored[0].score > 0 ? scored[0] : undefined;

  return {
    chunks,
    best: (bestSpecific ?? bestAny)?.doc.chunk ?? null,
    topScore: scored[0]?.score ?? 0,
    onTopic,
  };
}
