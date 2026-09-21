import React, {useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {Player} from "@remotion/player";
import {Reel} from "./Reel.tsx";
import {durationInFrames, parseReelConfig, platformSpecs, platforms, type Platform, type ReelConfig} from "./config.ts";
import initialConfig from "../examples/reel.json";
import "./web.css";

const initialJson = JSON.stringify(initialConfig, null, 2);

const App: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [source, setSource] = useState(initialJson);
  const parsed = useMemo((): {config?: ReelConfig; error?: string} => {
    try {
      return {config: parseReelConfig(JSON.parse(source))};
    } catch (error) {
      return {error: (error as Error).message};
    }
  }, [source]);
  const spec = platformSpecs[platform];

  return (
    <main>
      <header className="topbar">
        <a className="logo" href="./" aria-label="Reel JSON Studio home"><span>R</span> Reel JSON Studio</a>
        <div className="status"><i /> Preview live</div>
      </header>

      <section className="hero">
        <div>
          <p className="kicker">JSON → REMOTION → SOCIAL</p>
          <h1>Il tuo reel,<br/><em>in tempo reale.</em></h1>
          <p className="intro">Modifica il JSON, scegli il canale e guarda subito il risultato. Premi play per vedere le animazioni.</p>
        </div>
        <div className="platforms" aria-label="Seleziona piattaforma">
          {platforms.map((item) => <button className={item === platform ? "active" : ""} key={item} onClick={() => setPlatform(item)}>
            {platformSpecs[item].label}
          </button>)}
        </div>
      </section>

      <section className="workspace">
        <article className="editor-panel">
          <div className="panel-title"><span>reel.json</span><button onClick={() => setSource(initialJson)}>Ripristina</button></div>
          <textarea aria-label="Configurazione JSON del reel" spellCheck={false} value={source} onChange={(event) => setSource(event.target.value)} />
          <div className={parsed.error ? "validation error" : "validation"}>
            <span>{parsed.error ? "!" : "✓"}</span>{parsed.error ?? "JSON valido · anteprima aggiornata"}
          </div>
        </article>

        <article className="preview-panel">
          <div className="phone">
            {parsed.config ? <Player
              key={`${platform}-${source}`}
              component={Reel}
              inputProps={{...parsed.config, platform}}
              durationInFrames={durationInFrames(parsed.config)}
              compositionWidth={spec.width}
              compositionHeight={spec.height}
              fps={parsed.config.fps}
              controls
              loop
              style={{width: "100%", height: "100%"}}
            /> : <div className="empty">Correggi il JSON per aggiornare l’anteprima.</div>}
          </div>
          <div className="meta"><b>{spec.label}</b><span>{spec.width} × {spec.height} · H.264</span></div>
        </article>
      </section>
    </main>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
