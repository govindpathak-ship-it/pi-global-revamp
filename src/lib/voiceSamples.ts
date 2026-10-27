// "Hear Pi talk" sample calls. Lines reuse the hero scenarios (src/lib/scenarios.ts).
// English clips were synthesised offline with Piper TTS (VCTK voices, CC BY 4.0) — see README "Voice samples".
// Timings come from the generator (per-line start/end in seconds). The Hindi sample has no audio file:
// it is spoken by the visitor's browser (speechSynthesis), so its timings are estimates refined live.
import { scenarios } from "./scenarios";

export type Cue = { from: "agent" | "user"; text: string; start: number; end: number; tts?: string };
export type VoiceSample = {
  id: string;
  title: string;
  blurb: string;
  agent: "sales" | "service" | "operations";
  agentName: string;
  direction: "Outbound" | "Inbound";
  lang: "en" | "hi";
  langLabel: string;
  src?: string; // mp3 in /public/audio (English); absent => browser speech
  duration: number;
  cues: Cue[];
};

const timed = (scen: number, t: [number, number][], tts?: string[]): Cue[] =>
  scenarios[scen].msgs.map((m, i) => ({ from: m.from, text: m.text, start: t[i][0], end: t[i][1], tts: tts?.[i] }));

// Estimated timeline for browser speech (≈ 0.075 s per character, 0.5 s turn gaps).
const estimate = (scen: number): [number, number][] => {
  let t = 0.3;
  return scenarios[scen].msgs.map((m) => {
    const d = Math.max(1.2, m.text.length * 0.075);
    const r: [number, number] = [t, t + d];
    t += d + 0.5;
    return r;
  });
};
const hiTimes = estimate(4);

export const voiceSamples: VoiceSample[] = [
  {
    id: "sales-test-drive",
    title: "Book a test drive",
    blurb: "Outbound lead follow-up that ends with a confirmed slot on WhatsApp.",
    agent: "sales", agentName: "Pi Sales & Marketing Agent", direction: "Outbound", lang: "en", langLabel: "English",
    src: "/audio/sales-test-drive.mp3", duration: 14.76,
    cues: timed(0, [[0.35, 4.22], [4.72, 6.48], [6.98, 9.94], [10.44, 11.36], [11.86, 14.3]]),
  },
  {
    id: "service-refund",
    title: "Refund for a damaged item",
    blurb: "Inbound support call: identify the order, start the refund, confirm by SMS.",
    agent: "service", agentName: "Pi Service Agent", direction: "Inbound", lang: "en", langLabel: "English",
    src: "/audio/service-refund.mp3", duration: 19.46,
    cues: timed(2, [[0.35, 4.25], [4.75, 8.84], [9.34, 10.31], [10.81, 14.96], [15.46, 16.68], [17.18, 19.0]]),
  },
  {
    id: "emi-reminder-hi",
    title: "EMI reminder, promise to pay",
    blurb: "Hinglish collections call that captures a promise-to-pay date and sends a link.",
    agent: "operations", agentName: "Pi Operations Agent", direction: "Outbound", lang: "hi", langLabel: "हिन्दी · Hinglish",
    duration: hiTimes[hiTimes.length - 1][1] + 0.3,
    cues: timed(4, hiTimes, [
      "नमस्ते! आपकी ई एम आई पाँच तारीख को ड्यू है। क्या आप तब तक पेमेंट कर पाएंगे?",
      "हाँ, मैं चार तारीख तक कर दूँगा।",
      "ठीक है, चार तारीख नोट कर ली है। पेमेंट लिंक व्हाट्सऐप पर भेज दिया है।",
      "थैंक यू।",
      "धन्यवाद! आपको एक रिमाइंडर भी मिल जाएगा।",
    ]),
  },
];
