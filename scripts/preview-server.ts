import {createReadStream} from "node:fs";
import {mkdir, rm} from "node:fs/promises";
import {createServer as createHttpServer, type IncomingMessage, type ServerResponse} from "node:http";
import {tmpdir} from "node:os";
import {resolve} from "node:path";
import {randomUUID} from "node:crypto";
import {bundle} from "@remotion/bundler";
import {renderMedia, selectComposition} from "@remotion/renderer";
import {createServer as createViteServer} from "vite";
import {findTheWordDuration, type FindTheWordSettings} from "../src/findTheWordConfig.ts";

const port = Number(process.env.PORT ?? 5173);
const maxBodyBytes = 100 * 1024 * 1024;
let bundlePromise: Promise<string> | undefined;

const readJson = (request: IncomingMessage) => new Promise<unknown>((resolveBody, reject) => {
  const chunks: Buffer[] = [];
  let size = 0;
  request.on("data", (chunk: Buffer) => {
    size += chunk.length;
    if (size > maxBodyBytes) request.destroy(new Error("Il progetto supera il limite di 100 MB."));
    else chunks.push(chunk);
  });
  request.on("end", () => {
    try { resolveBody(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
    catch { reject(new Error("Configurazione JSON non valida.")); }
  });
  request.on("error", reject);
});

const sendError = (response: ServerResponse, error: unknown) => {
  response.writeHead(500, {"Content-Type": "application/json"});
  response.end(JSON.stringify({error: (error as Error).message}));
};

const render = async (request: IncomingMessage, response: ServerResponse) => {
  try {
    const settings = await readJson(request) as FindTheWordSettings;
    if (!Array.isArray(settings.words) || settings.words.length === 0 || !Number.isFinite(findTheWordDuration(settings))) {
      throw new Error("Aggiungi almeno una parola e controlla le durate.");
    }
    bundlePromise ??= bundle({entryPoint: resolve("src/index.ts")});
    const serveUrl = await bundlePromise;
    const composition = await selectComposition({serveUrl, id: "FindTheWordReel", inputProps: settings});
    const directory = resolve(tmpdir(), "remotion-reel-renders");
    await mkdir(directory, {recursive: true});
    const output = resolve(directory, `${randomUUID()}.mp4`);
    await renderMedia({serveUrl, composition, inputProps: settings, codec: "h264", outputLocation: output});
    response.writeHead(200, {
      "Content-Type": "video/mp4",
      "Content-Disposition": 'attachment; filename="find-the-word.mp4"',
    });
    const stream = createReadStream(output);
    stream.pipe(response);
    stream.on("close", () => void rm(output, {force: true}));
  } catch (error) { sendError(response, error); }
};

const vite = await createViteServer({server: {middlewareMode: true}, appType: "spa"});
const server = createHttpServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/render") void render(request, response);
  else vite.middlewares(request, response, () => { response.writeHead(404); response.end("Not found"); });
});
server.listen(port, () => console.log(`Reel Studio: http://localhost:${port}`));
