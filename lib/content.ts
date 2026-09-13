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
  socials: {
    github: "https://github.com/hardikjain0810",
    linkedin: "https://linkedin.com/in/hardikjain0810",
  },
  // Used for SEO, link previews, the sitemap, AND analytics. Must match the
  // live URL exactly: search engines index it, and Microsoft Clarity only
  // records visits on this domain. If you add a custom domain, change it here.
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

/* ---------------------------------------------------------------------------
 * CHATBOT — the "AI version of Hardik" chat in the bottom-right corner.
 *
 * The bot answers ONLY from the content above. Everything below is wording
 * you can edit freely. In the replies, {email}, {linkedin}, {github},
 * {location} and {openTo} are filled in from the content above.
 *
 * Your phone number (site.phone) is never given to the bot.
 * -------------------------------------------------------------------------*/
export const chat = {
  launcher: "Ask AI Hardik",
  name: "Hardik Jain",
  label: "AI version of Hardik",
  welcome:
    "Hi, I'm the AI version of Hardik. Ask me about my work, projects, skills, or how to reach me.",
  placeholder: "Ask about my work",
  peek: "Hi! I'm Hardik's AI version. Ask me anything about my work.",
  // Tapping these costs no AI tokens: each one has a ready-made answer.
  suggestions: [
    "What do you do currently?",
    "Show me your projects",
    "What's your tech stack?",
    "Are you open to new roles?",
  ],

  // Replies to small talk. Answered instantly, never sent to an AI model.
  // One is picked at random, so a visitor who says "hi" twice sees variety.
  smalltalk: {
    greeting: [
      "Hi! I'm the AI version of Hardik. Ask me about my projects, experience, or skills.",
      "Hey there. Happy to tell you about my work. What would you like to know?",
      "Hello! Want to hear what I'm working on right now, or see my projects?",
    ],
    howareyou: [
      "Doing well, thanks for asking! Want to hear about what I'm working on right now?",
      "All good here. Ask me anything about my work or projects.",
    ],
    thanks: [
      "You're welcome! Anything else you'd like to know?",
      "Happy to help. Ask away if something else comes up.",
      "Anytime. Want to see my projects next?",
    ],
    bye: [
      "Thanks for stopping by! If you'd like to talk, the contact form below reaches me directly.",
      "Bye for now. Hope to hear from you soon.",
    ],
    ack: [
      "Got it. Want to know about my current role or my projects?",
      "Sure. What else would you like to know?",
      "Okay! Ask me about my skills, experience, or how to reach me.",
    ],
    laugh: [
      "Glad that made you smile. Anything you'd like to know about my work?",
      "Ha. Ask me anything about my projects or experience.",
    ],
    compliment: [
      "Thank you, that means a lot! Want to see the project I'm proudest of?",
      "Really appreciate that. Ask me anything about my work.",
    ],
    identity: [
      "I'm an AI version of Hardik Jain, and I only know what's on this site. For anything beyond it, the contact form reaches the real me.",
      "I'm Hardik's AI version. I answer from the content on this site, so I won't guess beyond it.",
    ],
    help: [
      "You can ask me about my current role, projects, tech stack, education, certifications, or how to contact me. Try a suggestion below.",
    ],
    empty: ["Ask me anything about my work, projects, or skills."],
  },

  replies: {
    phone:
      "I don't share my phone number here. You can email me at {email} or message me on LinkedIn ({linkedin}), and I'll get back to you within a day.",
    personal:
      "I haven't put that on my site. The contact form below is the best way to ask me directly.",
    resume:
      "My résumé isn't published on this site. Email me at {email} and I'll send it over.",
    email:
      "You can email me at {email}. There's also a contact form at the bottom of this page.",
    linkedin: "Here's my LinkedIn: {linkedin}",
    github: "My code is on GitHub: {github}",
    contact:
      "The fastest ways to reach me are email ({email}) and LinkedIn ({linkedin}). You can also use the contact form at the bottom of this page.",
    location: "I'm based in {location}.",
    availability:
      "Yes! I'm open to {openTo}. The best way to start a conversation is the contact form below, or email me at {email}.",
    unknown:
      "I haven't put that on my site yet. The contact form below is the best way to ask me directly.",
    offTopic:
      "I'm only here to talk about my work. Try asking about my projects, experience, or skills.",
    rateLimited:
      "You're sending messages faster than I can keep up. Give it a few minutes, or reach me through the contact form.",
    degraded: "My AI side is taking a short break, but here's what my site says:",
    unavailable:
      "I can't answer that right now. Try again in a minute, or use the contact form to reach me directly.",
    error:
      "Something went wrong on my end. Try again, or use the contact form below.",
  },
};
