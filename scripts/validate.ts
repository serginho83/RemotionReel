import {loadConfig, valueAfter} from "./io.ts";
import {durationInFrames} from "../src/config.ts";

const input = valueAfter(process.argv.slice(2), "--input") ?? "examples/reel.json";

try {
  const {config, absolutePath} = await loadConfig(input);
  const seconds = durationInFrames(config) / config.fps;
  console.log(`✓ JSON valido: ${absolutePath}`);
  console.log(`  ${config.scenes.length} scene · ${seconds}s · ${config.fps} fps`);
} catch (error) {
  console.error(`✗ ${(error as Error).message}`);
  process.exitCode = 1;
}
