export type WordItem = {
  word: string;
  maskedWord: string;
  definition: string;
  image: string;
  feedback: string;
};

export type FindTheWordSettings = {
  fps: number;
  logoSrc: string;
  hookSeconds: number;
  guessSeconds: number;
  revealSeconds: number;
  outroSeconds: number;
  hookLine1: string;
  hookLine2: string;
  hookSubtitle: string[];
  outroTitle: string;
  outroSubtitle: string;
  outroTagline: string;
  primaryColor: string;
  primaryDarkColor: string;
  primarySoftColor: string;
  successColor: string;
  successSoftColor: string;
  backgroundColor: string;
  blurAmount: number;
  imageHeight: number;
  titleFontSize: number;
  wordFontSize: number;
  definitionFontSize: number;
  words: WordItem[];
};

export const defaultFindTheWordSettings: FindTheWordSettings = {
  fps: 30,
  logoSrc: "logo-nhoemigo.svg",
  hookSeconds: 1.5,
  guessSeconds: 3,
  revealSeconds: 1.8,
  outroSeconds: 2,
  hookLine1: "FIND",
  hookLine2: "THE WORD",
  hookSubtitle: ["A definition.", "A few letters.", "You can do it!"],
  outroTitle: "Follow NhoemiGo",
  outroSubtitle: "More word challenges every week!",
  outroTagline: "Learn one word at a time.",
  primaryColor: "#0667D8",
  primaryDarkColor: "#064A9C",
  primarySoftColor: "#DCEEFF",
  successColor: "#17A746",
  successSoftColor: "#E6F8EA",
  backgroundColor: "#FFFFFF",
  blurAmount: 18,
  imageHeight: 650,
  titleFontSize: 110,
  wordFontSize: 94,
  definitionFontSize: 48,
  words: [
    {word: "PRUNING", maskedWord: "P___IN_", definition: "Trimming plants to promote healthy growth.", image: "images/pruning.svg", feedback: "Excellent!"},
    {word: "WATERING", maskedWord: "WAT_R_NG", definition: "Giving plants water to help them grow.", image: "images/watering.svg", feedback: "Great!"},
    {word: "HARVEST", maskedWord: "H_RV_S_", definition: "Collecting crops when they are ready.", image: "images/harvest.svg", feedback: "Nice!"},
  ],
};

export const findTheWordDuration = (settings: FindTheWordSettings) =>
  Math.round(settings.hookSeconds * settings.fps) +
  settings.words.length * Math.round((settings.guessSeconds + settings.revealSeconds) * settings.fps) +
  Math.round(settings.outroSeconds * settings.fps);
