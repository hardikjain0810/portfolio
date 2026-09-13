/* ============================================================================
 * Small-talk detection. Runs in the browser (so "hi" never touches the
 * network), again on the server (so nobody can bypass it), and in tests.
 *
 * No imports on purpose: this file must run anywhere.
 *
 * A message counts as small talk only when the WHOLE message is made of
 * small-talk phrases, optionally padded with filler words ("thanks a lot
 * man"). "hi, what's your stack?" is not small talk: the greeting is peeled
 * off and "what's your stack" continues as a real question.
 * ==========================================================================*/

export type SmallTalkIntent =
  | "greeting"
  | "howareyou"
  | "thanks"
  | "bye"
  | "ack"
  | "laugh"
  | "compliment"
  | "identity"
  | "help"
  | "empty";

export type Classification =
  | { kind: "smalltalk"; intent: SmallTalkIntent }
  | {
      kind: "question";
      /** Normalised question with any leading small talk removed. */
      normalized: string;
      /** The small talk that preceded the question, if any. */
      lead: SmallTalkIntent | null;
    };

/* When a message mixes intents ("ok thanks bye"), the strongest one wins. */
const PRIORITY: SmallTalkIntent[] = [
  "bye",
  "thanks",
  "howareyou",
  "identity",
  "help",
  "compliment",
  "greeting",
  "laugh",
  "ack",
  "empty",
];

const PHRASES: Record<Exclude<SmallTalkIntent, "empty">, string[]> = {
  greeting: [
    "hi", "hey", "hello", "hlo", "hiya", "heya", "hola", "howdy", "yo", "sup",
    "namaste", "namaskar", "salaam", "greetings", "hey hi", "hi hello",
    "good morning", "good afternoon", "good evening", "morning", "evening",
    "nice to meet you", "pleased to meet you", "glad to meet you",
  ],
  howareyou: [
    "how are you", "how r u", "how are u", "how r you", "how are you doing",
    "how you doing", "how is it going", "hows it going", "how are things",
    "how do you do", "whats up", "what up", "wassup", "whatsup",
  ],
  thanks: [
    "thanks", "thank you", "thankyou", "thank u", "thanku", "thx", "thnx",
    "tnx", "ty", "tysm", "tyvm", "many thanks", "appreciate it", "appreciated",
    "much appreciated", "cheers", "thanks for the info", "thanks for your help",
    "thank you for your help", "thanks for the help",
  ],
  bye: [
    "bye", "bye bye", "goodbye", "good bye", "see you", "see ya", "see you later",
    "see you soon", "cya", "later", "take care", "good night", "gn", "ttyl",
    "talk later", "talk to you later", "catch you later", "farewell",
    "have a good day", "have a nice day", "have a great day",
  ],
  ack: [
    "ok", "okay", "okey", "k", "cool", "nice", "great", "awesome", "amazing",
    "perfect", "got it", "gotcha", "alright", "all right", "alrighty", "sure",
    "fine", "hm", "noted", "understood", "i see", "makes sense", "sounds good",
    "fair enough", "yes", "yeah", "yep", "yup", "no", "nope", "nah", "right",
    "good", "wow", "oh", "ah", "oh ok", "oh okay", "oic", "np", "no problem",
    "no worries", "done", "interesting",
  ],
  laugh: ["lol", "lmao", "rofl"],
  compliment: [
    "impressive", "very impressive", "well done", "great work", "nice work",
    "good work", "love it", "love this", "love your portfolio", "nice portfolio",
    "great portfolio", "cool portfolio", "awesome portfolio", "amazing portfolio",
    "beautiful portfolio", "nice site", "cool site", "great site", "nice website",
    "great website", "cool website", "awesome website", "nice design",
    "great design", "love the design",
  ],
  identity: [
    "who are you", "what are you", "who is this", "what is this", "whats this",
    "are you real", "are you a bot", "are you bot", "is this a bot",
    "are you ai", "are you an ai", "are you human", "are you a human",
    "are you hardik", "is this hardik", "is this really you", "are you chatgpt",
    "are you gpt", "who am i talking to", "who am i chatting with",
    "am i talking to a bot",
  ],
  help: [
    "help", "help me", "what can you do", "what can i ask", "what should i ask",
    "what can i ask you", "how does this work", "how do i use this", "options",
    "menu", "start", "get started",
  ],
};

/* Words that may pad small talk without changing its meaning. */
const FILLERS = [
  "there", "so", "much", "a", "lot", "ton", "man", "bro", "buddy", "dude",
  "mate", "sir", "maam", "mam", "hardik", "jain", "again", "very", "all",
  "everyone", "guys", "friend", "dear", "then", "just", "really", "and",
];

/* Emoji that carry small-talk meaning become words; the rest are dropped. */
const EMOJI: Array<[RegExp, string]> = [
  [/\u{1F44B}/gu, " hi "], // 👋
  [/\u{1F64F}/gu, " thanks "], // 🙏
  [/[\u{1F44D}\u{1F44C}\u{2705}\u{2714}]/gu, " ok "], // 👍 👌 ✅ ✔
  [/[\u{1F602}\u{1F923}\u{1F606}\u{1F601}\u{1F604}\u{1F605}]/gu, " lol "], // 😂 🤣 😆 😁 😄 😅
  [/[\u{1F525}\u{1F4AF}\u{1F929}\u{1F60D}\u{1F44F}\u{2764}]/gu, " nice "], // 🔥 💯 🤩 😍 👏 ❤
];

const MAX_PHRASE_WORDS = 6;
const MAX_SMALLTALK_WORDS = 12;

/** Lowercase, emoji-to-words, punctuation stripped, spaces collapsed. */
export function normalize(input: string): string {
  let text = input.normalize("NFKC");
  for (const [pattern, word] of EMOJI) text = text.replace(pattern, word);
  return text
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/* Canonical form used only for matching: laughs unified, repeated letters
   squeezed so "hiiii", "okkk" and "thankss" match "hi", "ok", "thanks". */
function canon(token: string): string {
  if (/^(?:ha){2,}h?$|^(?:he){2,}h?$|^lo+l$|^lmf?a+o+$|^rofl$|^xd+$/.test(token)) {
    return "lol";
  }
  return token.replace(/([a-z])\1+/g, "$1");
}

const PHRASE_INDEX = new Map<string, SmallTalkIntent>();
for (const [intent, list] of Object.entries(PHRASES) as Array<[SmallTalkIntent, string[]]>) {
  for (const phrase of list) {
    PHRASE_INDEX.set(phrase.split(" ").map(canon).join(" "), intent);
  }
}
const FILLER_SET = new Set(FILLERS.map(canon));

function strongest(intents: SmallTalkIntent[]): SmallTalkIntent {
  return PRIORITY.find((p) => intents.includes(p)) ?? "empty";
}

/**
 * For every prefix length i, the small-talk intents that exactly cover
 * tokens[0..i), or null when that prefix can't be made of small talk.
 */
function coverage(tokens: string[]): Array<SmallTalkIntent[] | null> {
  const n = tokens.length;
  const best: Array<SmallTalkIntent[] | null> = new Array(n + 1).fill(null);
  best[0] = [];

  for (let i = 0; i < n; i++) {
    const current = best[i];
    if (!current) continue;

    if (FILLER_SET.has(tokens[i]) && !best[i + 1]) best[i + 1] = current;

    for (let len = 1; len <= Math.min(MAX_PHRASE_WORDS, n - i); len++) {
      const intent = PHRASE_INDEX.get(tokens.slice(i, i + len).join(" "));
      if (!intent) continue;
      const next = [...current, intent];
      const existing = best[i + len];
      if (!existing || next.length > existing.length) best[i + len] = next;
    }
  }
  return best;
}

export function classifySmallTalk(input: string): Classification {
  const normalized = normalize(input);

  if (!normalized) {
    // Non-Latin text (e.g. Hindi) normalises to nothing but is still a real
    // question, so let it through. Pure emoji or punctuation is small talk.
    return /\p{L}|\p{N}/u.test(input)
      ? { kind: "question", normalized: "", lead: null }
      : { kind: "smalltalk", intent: "empty" };
  }

  const words = normalized.split(" ");
  const tokens = words.map(canon);

  if (tokens.length <= MAX_SMALLTALK_WORDS) {
    const best = coverage(tokens);
    const whole = best[tokens.length];
    if (whole) {
      return { kind: "smalltalk", intent: whole.length ? strongest(whole) : "empty" };
    }

    // Peel off the longest leading run of small talk ("ok so ...", "hi, ...").
    for (let i = tokens.length - 1; i > 0; i--) {
      const prefix = best[i];
      if (prefix && prefix.length > 0) {
        return {
          kind: "question",
          normalized: words.slice(i).join(" "),
          lead: strongest(prefix),
        };
      }
    }
    return { kind: "question", normalized, lead: null };
  }

  // Long message: only look for a short greeting at the very start.
  const head = coverage(tokens.slice(0, MAX_SMALLTALK_WORDS));
  for (let i = MAX_SMALLTALK_WORDS - 1; i > 0; i--) {
    const prefix = head[i];
    if (prefix && prefix.length > 0) {
      return { kind: "question", normalized: words.slice(i).join(" "), lead: strongest(prefix) };
    }
  }
  return { kind: "question", normalized, lead: null };
}
