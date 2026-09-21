import {mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {bundle} from "@remotion/bundler";
import {renderMedia, selectComposition} from "@remotion/renderer";
import {platformSpecs, platforms, type Platform} from "../src/config.ts";
import {loadConfig, valueAfter} from "./io.ts";

const args = process.argv.slice(2);
const input = valueAfter(args, "--input") ?? "examples/reel.json";
const selected = valueAfter(args, "--platform") ?? "all";
const outputDirectory = resolve(valueAfter(args, "--output") ?? "out");

if (selected !== "all" && !platforms.includes(selected as Platform)) {
  throw new Error(`Piattaforma "${selected}" non valida. Usa: ${platforms.join(", ")} o all.`);
}

const targets: Platform[] = selected === "all" ? [...platforms] : [selected as Platform];
const {config} = await loadConfig(input);
await mkdir(outputDirectory, {recursive: true});

console.log("Creo il bundle Remotion…");
const serveUrl = await bundle({entryPoint: resolve("src/index.ts")});

for (const platform of targets) {
  const compositionId = platformSpecs[platform].label.replace(/\s/g, "");
  const inputProps = {...config, platform};
  const composition = await selectComposition({serveUrl, id: compositionId, inputProps});
  const outputLocation = resolve(outputDirectory, `${platform}.mp4`);
  console.log(`Render ${platform} → ${outputLocation}`);
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    outputLocation,
    inputProps,
    chromiumOptions: {enableMultiProcessOnLinux: true},
  });
}

console.log(`✓ ${targets.length} video completati.`);
