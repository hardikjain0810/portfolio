/* ============================================================================
 * ALL SITE CONTENT LIVES HERE.
 * Edit this one file to update the whole portfolio. You never need to touch
 * the components.
 *
 * Anything marked  // TODO  is a guess or a blank I could not fill for you.
 * Search this file for "TODO" to find every one of them.
 * ==========================================================================*/

export const site = {
  name: "Hardik Jain",
  role: "AI Engineer",
  // Shown one after another in the hero, typed out character by character.
  roles: [
    "AI Engineer",
    "LLM & RAG Systems",
    "ML Pipelines, End to End",
    "Python · PyTorch · FastAPI",
  ],
  location: "Hyderabad, India",
  email: "hj791983@outlook.com",
  // TODO: add your phone if you want recruiters to call. Leave "" to hide it.
  phone: "+91 939 299 6731",
  resumeUrl: "/Hardik_Jain_Resume.pdf", // put the PDF in /public with this name
  socials: {
    github: "https://github.com/hardikjain0810",
    linkedin: "https://linkedin.com/in/hardikjain0810",
  },
  // Used for SEO, link previews, and the sitemap. Must match the live URL
  // exactly, or search engines are told to index a page that doesn't exist.
  url: "https://hardik-jain-ai-engineer.vercel.app",
  tagline:
    "I build AI systems that reach production, not prototypes that stall in a notebook.",
};

export const hero = {
  greeting: "Hello, I'm Hardik",
  headline: "I turn models into products people actually use.",
  blurb:
    "AI Engineer at Wisdom Square Technologies. I work across the full stack of an AI product: data pipelines, fine-tuning, multilingual backends, and GPU deployment. My last model went from experiment to production at 85% accuracy.",
  // Small proof points under the hero. Numbers beat adjectives, so fill these in.
  stats: [
    { value: "90%", label: "model accuracy in production" },
    { value: "3+", label: "AI & ML systems shipped" }, // TODO: your real count
    { value: "4+", label: "languages supported" }, // TODO: from your multilingual backend
  ],
};

export const about = {
  heading: "About",
  // Two or three short paragraphs. Recruiters skim, so lead with the strongest line.
  paragraphs: [
    "I'm an AI Engineer based in Hyderabad, working at Wisdom Square Technologies. I build end-to-end machine learning systems: raw data in one end, a running service at the other.",
    "My work spans fine-tuning deep learning models, designing multilingual NLP backends in FastAPI, wiring up generative AI features, and deploying to GPUs on Runpod. I care about systems that are measurable and explainable, because a model nobody trusts never ships.",
    "Before Wisdom Square I trained as a Programmer Trainee at Cognizant and earned a B.Sc. in Computer Science from Loyola Academy. Outside of work I'm usually taking apart a new model release to see what makes it tick.",
  ],
  // Right-hand facts panel
  facts: [
    { k: "Currently", v: "AI Engineer @ Wisdom Square Technologies" },
    { k: "Based in", v: "Hyderabad, India" },
    { k: "Focus", v: "LLM systems, RAG, ML pipelines" },
    { k: "Open to", v: "AI / ML Engineering roles" },
  ],
};

/* ---------------------------------------------------------------------------
 * SKILLS — grouped. Keep only what you can defend in an interview.
 * -------------------------------------------------------------------------*/
export const skillGroups = [
  {
    title: "Languages",
    items: ["Python", "SQL", "JavaScript"], // TODO: drop any you don't use
  },
  {
    title: "ML & Deep Learning",
    items: [
      "scikit-learn",
      "Hugging Face Transformers",
      "Fine-tuning",
      "Model Evaluation",
      "NumPy",
      "Pandas",
    ],
  },
  {
    title: "LLM & Generative AI",
    items: [
      "RAG",
      "Prompt Engineering",
      "Embeddings",
      "Vector Search",
      "LangChain", // TODO: keep only if you've used it
      "OpenAI API", // TODO: swap for whichever provider you actually use
    ],
  },
  {
    title: "Backend & APIs",
    items: ["FastAPI", "Flask", "REST API Design", "Async Python", "Pydantic"],
  },
  {
    title: "Data & Storage",
    items: ["MongoDB", "PostgreSQL", "ETL Pipelines", "Data Modelling"], // TODO
  },
  {
    title: "Infra & Tooling",
    items: ["Runpod GPU", "Docker", "Git", "GitHub Actions", "Postman", "Linux"], // TODO
  },
];

/* Scrolling ticker under the hero. Short, punchy, keyword-rich. */
export const marqueeItems = [
  "Large Language Models",
  "Retrieval-Augmented Generation",
  "PyTorch",
  "Fine-Tuning",
  "FastAPI",
  "Vector Databases",
  "MLOps",
  "Multilingual NLP",
  "GPU Inference",
  "Data Pipelines",
];

/* ---------------------------------------------------------------------------
 * EXPERIENCE — newest first.
 * Every bullet: what you built, the tech, and a number wherever you have one.
 * -------------------------------------------------------------------------*/
export const experience = [
  {
    role: "AI Engineer",
    company: "Wisdom Square Technologies",
    location: "New York, USA",
    period: "Mar 2026 — Present", // TODO: your real start month
    current: true,
    bullets: [
      "Fine-tuned a deep learning model to 90% accuracy and shipped it to production, replacing the previous rule-based approach.", // TODO: name the model and the task
      "Designed and built a multilingual backend in FastAPI, serving several languages behind one API.", // TODO: how many languages, how many requests/day
      "Built generative AI features on top of large language models, including retrieval over the company's own documents from pinecone.", // TODO: which models, which vector DB
      "Automated manual internal workflows with Python pipelines, cutting 40 hours of repetitive work each week.", // TODO: how many hours
      "Owned the pipeline end to end: data ingestion, cleaning, training, evaluation, and GPU deployment on Runpod.",
    ],
    tech: ["Python", "PyTorch", "FastAPI", "Runpod", "MongoDB"],
  },
  {
    role: "Programmer Trainee",
    company: "Cognizant",
    location: "Hyderabad, India",
    period: "Jun 2025 — Oct 2025",
    current: false,
    bullets: [
      "Completed Cognizant's engineering programme covering software development practice, data structures, algorithms, and the enterprise SDLC.",
      "Worked in Agile sprints with Git version control and peer code review across cross-functional teams.",
    ],
    tech: ["Python", "SQL", "Git", "Agile"],
  },
];

export const education = [
  {
    degree: "B.Sc. Computer Science",
    school: "Loyola Academy",
    location: "Hyderabad, India",
    period: "Jun 2022 — Apr 2025",
    note: "CGPA 9.0 / 10", // TODO: add "CGPA 8.4 / 10" only if it's 8.0 or above
  },
];

export const certifications = [
  { name: "Data Science & Machine Learning A-Z (Theory + Projects)", issuer: "Udemy", year: "2023" },
  { name: "Artificial Intelligence Fundamentals", issuer: "IBM", year: "2024" },
];

/* ---------------------------------------------------------------------------
 * PROJECTS — pulled from your public GitHub repos.
 * `featured: true` gives a project the large card. Aim for 2 or 3 featured.
 * Delete any project that doesn't help the AI-engineer story.
 * -------------------------------------------------------------------------*/
export type Project = {
  title: string;
  tagline: string;
  description: string;
  tech: string[];
  repo?: string;
  demo?: string;
  featured?: boolean;
  year?: string;
};

export const projects: Project[] = [
  {
    title: "Network Security ML",
    tagline: "Intrusion detection pipeline",
    description:
      "An end-to-end ML pipeline that classifies malicious network traffic, covering ingestion, validation, transformation, training, and a deployable inference service.",
    tech: ["Python", "scikit-learn", "MLOps", "MongoDB"],
    repo: "https://github.com/hardikjain0810/Network-Security",
    featured: true,
    year: "2026",
  },
  {
    title: "Konnected",
    tagline: "KonnecteD - A Language learning platform for students and teachers",
    // TODO: what is Konnected? One clear sentence.
    description:
      "A Python backend exposing REST endpoints, with data modelling and authentication for a connected-services application.",
    tech: ["Python", "FastAPI", "REST"],
    repo: "https://github.com/hardikjain0810/Konnected-backend",
    year: "2026",
  },
  {
    title: "FinPlanX",
    tagline: "Financial planning web app",
    description:
      "A full-stack app that builds personalised investment strategies from a user's goals and risk profile, with secured REST APIs and MongoDB portfolio storage.",
    tech: ["Flask", "MongoDB", "JavaScript"],
    repo: "https://github.com/hardikjain0810/FinPlanX",
    year: "2025",
  },
  {
    title: "Car Price Prediction",
    tagline: "Regression & feature engineering",
    description:
      "A regression pipeline predicting used-car prices, with exploratory analysis, feature engineering, and model comparison across several algorithms.",
    tech: ["Python", "scikit-learn", "Pandas"],
    repo: "https://github.com/hardikjain0810/Car_price_prediction",
    year: "2026",
  },
  {
    title: "Flight Price EDA",
    tagline: "Exploratory analysis at scale",
    description:
      "Deep exploratory data analysis and feature engineering on a flight-pricing dataset, surfacing the drivers behind fare variation.",
    tech: ["Python", "Pandas", "Matplotlib", "Seaborn"],
    repo: "https://github.com/hardikjain0810/EDA-FE-FLIGHT-PRICE-DATASET",
    year: "2026",
  },
];

/* ---------------------------------------------------------------------------
 * NAVIGATION — ids must match the <Section id="..."> in app/page.tsx
 * -------------------------------------------------------------------------*/
export const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

export const contact = {
  heading: "Let's build something",
  blurb:
    "I'm open to AI and ML engineering roles, and always happy to talk about interesting problems. Send a message and I'll reply within a day.",
};
