import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {parseReelConfig} from "../src/config.ts";

export const loadConfig = async (path: string) => {
  const absolutePath = resolve(path);
  let decoded: unknown;
  try {
    decoded = JSON.parse(await readFile(absolutePath, "utf8"));
  } catch (error) {
    throw new Error(`Impossibile leggere ${absolutePath}: ${(error as Error).message}`);
  }
  return {config: parseReelConfig(decoded), absolutePath};
};

export const valueAfter = (args: string[], name: string) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
