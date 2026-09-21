export const platforms = ["instagram", "facebook", "youtube"] as const;
export type Platform = (typeof platforms)[number];

export type Scene = {
  durationInSeconds: number;
  eyebrow?: string;
  title: string;
  body?: string;
  accent?: string;
  background?: string;
};

export type ReelConfig = {
  brand: string;
  handle: string;
  fps: number;
  music?: string;
  callToAction: string;
  scenes: Scene[];
};

export const platformSpecs: Record<Platform, {width: number; height: number; label: string}> = {
  instagram: {width: 1080, height: 1920, label: "Instagram Reel"},
  facebook: {width: 1080, height: 1920, label: "Facebook Reel"},
  youtube: {width: 1080, height: 1920, label: "YouTube Short"},
};

export const durationInFrames = (config: ReelConfig) =>
  Math.round(config.scenes.reduce((sum, scene) => sum + scene.durationInSeconds, 0) * config.fps);

const isString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

export const parseReelConfig = (value: unknown): ReelConfig => {
  if (!value || typeof value !== "object") throw new Error("Il JSON deve essere un oggetto.");
  const input = value as Record<string, unknown>;
  if (!isString(input.brand)) throw new Error('Il campo "brand" è obbligatorio.');
  if (!isString(input.handle)) throw new Error('Il campo "handle" è obbligatorio.');
  if (!isString(input.callToAction)) throw new Error('Il campo "callToAction" è obbligatorio.');
  if (!Number.isInteger(input.fps) || Number(input.fps) < 24 || Number(input.fps) > 60) {
    throw new Error('Il campo "fps" deve essere un intero tra 24 e 60.');
  }
  if (!Array.isArray(input.scenes) || input.scenes.length === 0) {
    throw new Error('Il campo "scenes" deve contenere almeno una scena.');
  }

  const scenes = input.scenes.map((raw, index): Scene => {
    if (!raw || typeof raw !== "object") throw new Error(`La scena ${index + 1} non è valida.`);
    const scene = raw as Record<string, unknown>;
    if (!isString(scene.title)) throw new Error(`La scena ${index + 1} deve avere un titolo.`);
    if (typeof scene.durationInSeconds !== "number" || scene.durationInSeconds <= 0 || scene.durationInSeconds > 30) {
      throw new Error(`La durata della scena ${index + 1} deve essere tra 0 e 30 secondi.`);
    }
    for (const field of ["eyebrow", "body", "accent", "background"] as const) {
      if (scene[field] !== undefined && typeof scene[field] !== "string") {
        throw new Error(`Il campo "${field}" della scena ${index + 1} deve essere una stringa.`);
      }
    }
    return scene as Scene;
  });

  if (input.music !== undefined && typeof input.music !== "string") {
    throw new Error('Il campo "music" deve essere una stringa.');
  }
  return {...(input as ReelConfig), scenes, fps: Number(input.fps)};
};
