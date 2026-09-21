import type {CSSProperties} from "react";

const families = [
  "fade", "slide-left", "slide-right", "slide-up", "slide-down", "zoom-in",
  "zoom-out", "rotate-left", "rotate-right", "flip-x", "flip-y", "blur",
] as const;

const labels: Record<(typeof families)[number], string> = {
  fade: "Dissolvenza",
  "slide-left": "Scorri da sinistra",
  "slide-right": "Scorri da destra",
  "slide-up": "Sali dal basso",
  "slide-down": "Scendi dall'alto",
  "zoom-in": "Zoom avanti",
  "zoom-out": "Zoom indietro",
  "rotate-left": "Ruota a sinistra",
  "rotate-right": "Ruota a destra",
  "flip-x": "Ribalta orizzontale",
  "flip-y": "Ribalta verticale",
  blur: "Messa a fuoco",
};

export type EffectPreset = {
  id: string;
  name: string;
  family: (typeof families)[number];
  variant: number;
  durationInFrames: number;
};

// Twelve animation families × ten intensities = 120 selectable presets.
export const effectPresets: EffectPreset[] = families.flatMap((family) =>
  Array.from({length: 10}, (_, index) => ({
    id: `${family}-${index + 1}`,
    name: `${labels[family]} ${String(index + 1).padStart(2, "0")}`,
    family,
    variant: index + 1,
    durationInFrames: 8 + index * 2,
  })),
);

export const effectById = (id: string) => effectPresets.find((effect) => effect.id === id) ?? effectPresets[0];

export const effectStyle = (id: string, frame: number): CSSProperties => {
  const effect = effectById(id);
  const progress = Math.max(0, Math.min(1, frame / effect.durationInFrames));
  const eased = 1 - Math.pow(1 - progress, 2 + effect.variant / 5);
  const distance = 35 + effect.variant * 9;
  const angle = 7 + effect.variant * 2.5;
  const startScale = .55 + effect.variant * .025;
  let transform = "none";
  let filter = "none";

  switch (effect.family) {
    case "slide-left": transform = `translateX(${(-distance * (1 - eased)).toFixed(2)}px)`; break;
    case "slide-right": transform = `translateX(${(distance * (1 - eased)).toFixed(2)}px)`; break;
    case "slide-up": transform = `translateY(${(distance * (1 - eased)).toFixed(2)}px)`; break;
    case "slide-down": transform = `translateY(${(-distance * (1 - eased)).toFixed(2)}px)`; break;
    case "zoom-in": transform = `scale(${startScale + (1 - startScale) * eased})`; break;
    case "zoom-out": transform = `scale(${1 + (1 - eased) * (.15 + effect.variant * .035)})`; break;
    case "rotate-left": transform = `rotate(${(-angle * (1 - eased)).toFixed(2)}deg) scale(${.85 + eased * .15})`; break;
    case "rotate-right": transform = `rotate(${(angle * (1 - eased)).toFixed(2)}deg) scale(${.85 + eased * .15})`; break;
    case "flip-x": transform = `perspective(900px) rotateX(${(90 * (1 - eased)).toFixed(2)}deg)`; break;
    case "flip-y": transform = `perspective(900px) rotateY(${(90 * (1 - eased)).toFixed(2)}deg)`; break;
    case "blur": filter = `blur(${((1 - eased) * (4 + effect.variant * 1.8)).toFixed(2)}px)`; break;
  }

  return {opacity: eased, transform, filter, transformOrigin: "center"};
};
