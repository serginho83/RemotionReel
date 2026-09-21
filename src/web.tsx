import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {Player} from "@remotion/player";
import {FindTheWordReel} from "./FindTheWordReel.tsx";
import {defaultFindTheWordSettings, findTheWordDuration, type FindTheWordSettings, type WordItem} from "./findTheWordConfig.ts";
import {effectById, effectPresets} from "./effects.ts";
import "./web.css";

type Panel = "content" | "timing" | "style" | "audio" | "effects";
type EffectKey = "hookEffect" | "imageEffect" | "revealEffect" | "feedbackEffect" | "outroEffect";
const cloneDefaults = (): FindTheWordSettings => JSON.parse(JSON.stringify(defaultFindTheWordSettings));
const loadSettings = (): FindTheWordSettings => {
  try {
    const saved = localStorage.getItem("word-reel-settings");
    return saved ? {...cloneDefaults(), ...JSON.parse(saved)} : cloneDefaults();
  } catch { return cloneDefaults(); }
};

const NumberField: React.FC<{label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void}> =
  ({label, value, min, max, step = 1, onChange}) => <label className="field"><span>{label}<output>{value}</output></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))}/>
  </label>;

const TextField: React.FC<{label: string; value: string; onChange: (value: string) => void}> = ({label, value, onChange}) =>
  <label className="field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)}/></label>;

const FileField: React.FC<{label: string; accept: string; value?: string; onChange: (value: string) => void}> = ({label, accept, value, onChange}) => {
  const upload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };
  return <div className="upload-field"><span>{label}</span><label><input type="file" accept={accept} onChange={(event) => upload(event.target.files?.[0])}/><b>{value ? "Sostituisci file" : "Carica file"}</b></label>
    {value ? <button onClick={() => onChange("")}>Rimuovi</button> : null}</div>;
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<FindTheWordSettings>(loadSettings);
  const [panel, setPanel] = useState<Panel>("content");
  const [effectTarget, setEffectTarget] = useState<EffectKey>("revealEffect");
  const [effectSearch, setEffectSearch] = useState("");
  const [renderStatus, setRenderStatus] = useState("");
  const set = <K extends keyof FindTheWordSettings>(key: K, value: FindTheWordSettings[K]) => setSettings((current) => ({...current, [key]: value}));
  const updateWord = (index: number, patch: Partial<WordItem>) => set("words", settings.words.map((word, i) => i === index ? {...word, ...patch} : word));
  const duration = findTheWordDuration(settings);
  useEffect(() => {
    try { localStorage.setItem("word-reel-settings", JSON.stringify(settings)); }
    catch { setRenderStatus("File troppo grandi per il salvataggio automatico: esporta il JSON prima di uscire."); }
  }, [settings]);
  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement("a"), {href: url, download: "find-the-word.json"});
    link.click();
    URL.revokeObjectURL(url);
  };
  const downloadMp4 = async () => {
    setRenderStatus("Render MP4 in corso…");
    try {
      const response = await fetch("./api/render", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(settings)});
      if (!response.ok || !response.headers.get("content-type")?.includes("video/mp4")) {
        const payload = await response.text();
        throw new Error(payload.startsWith("{") ? JSON.parse(payload).error : "Il render MP4 richiede il server Node: avvia l'app con npm run dev.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = Object.assign(document.createElement("a"), {href: url, download: "find-the-word.mp4"});
      link.click(); URL.revokeObjectURL(url); setRenderStatus("MP4 scaricato ✓");
    } catch (error) { setRenderStatus((error as Error).message); }
  };

  return <main>
    <header className="topbar">
      <a className="logo" href="./"><span>W</span> Word Reel Studio</a>
      <div className="header-actions"><div className="status"><i/> Salvato</div><button className="download" onClick={downloadMp4}>Scarica MP4</button><button className="reset" onClick={exportSettings}>Esporta JSON</button><button className="reset" onClick={() => setSettings(cloneDefaults())}>Ripristina</button></div>
    </header>
    <section className="hero compact">
      <div><p className="kicker">OVERVIEW · FIND THE WORD</p><h1>Crea il tuo <em>word challenge.</em></h1>
        <p className="intro">Personalizza contenuti, tempi e stile. Ogni modifica viene applicata subito al player Remotion.</p></div>
      <div className="summary"><b>{settings.words.length}</b><span>parole</span><b>{(duration / settings.fps).toFixed(1)}s</b><span>durata</span><b>9:16</b><span>formato</span></div>
    </section>

    <section className="overview">
      <aside className="settings-panel">
        <nav className="tabs">
          {(["content", "timing", "style", "audio", "effects"] as Panel[]).map((item) => <button key={item} className={panel === item ? "active" : ""} onClick={() => setPanel(item)}>
            {{content: "Contenuti", timing: "Tempi", style: "Stile", audio: "Audio", effects: "Effetti"}[item]}
          </button>)}
        </nav>
        <div className="settings-scroll">
          {panel === "content" && <>
            <div className="section-title"><div><b>Hook iniziale</b><small>Titolo e messaggio introduttivo</small></div></div>
            <div className="two-cols"><TextField label="Riga 1" value={settings.hookLine1} onChange={(v) => set("hookLine1", v)}/><TextField label="Riga 2" value={settings.hookLine2} onChange={(v) => set("hookLine2", v)}/></div>
            <TextField label="Sottotitolo (separa le righe con |)" value={settings.hookSubtitle.join(" | ")} onChange={(v) => set("hookSubtitle", v.split("|").map((x) => x.trim()).filter(Boolean))}/>
            <TextField label="Logo (URL o file in public/)" value={settings.logoSrc} onChange={(v) => set("logoSrc", v)}/>
            <FileField label="Carica un logo al volo" accept="image/*" value={settings.logoSrc.startsWith("data:") ? settings.logoSrc : ""} onChange={(v) => v ? set("logoSrc", v) : set("logoSrc", defaultFindTheWordSettings.logoSrc)}/>
            <div className="section-title"><div><b>Parole ({settings.words.length})</b><small>Aggiungine quante vuoi</small></div><button onClick={() => set("words", [...settings.words, {word: "NEW WORD", maskedWord: "N__ W___", definition: "Write the definition here.", image: "images/pruning.svg", feedback: "Great!"}])}>+ Aggiungi</button></div>
            {settings.words.map((word, index) => <details className="word-card" key={index} open={index === 0}>
              <summary><span>{index + 1}</span><b>{word.word || "Nuova parola"}</b><i>⌄</i></summary>
              <div className="word-fields">
                <div className="two-cols"><TextField label="Parola" value={word.word} onChange={(v) => updateWord(index, {word: v.toUpperCase()})}/><TextField label="Parola mascherata" value={word.maskedWord} onChange={(v) => updateWord(index, {maskedWord: v.toUpperCase()})}/></div>
                <TextField label="Definizione" value={word.definition} onChange={(v) => updateWord(index, {definition: v})}/>
                <TextField label="Immagine (URL o public/)" value={word.image} onChange={(v) => updateWord(index, {image: v})}/>
                <FileField label="Oppure carica un'immagine" accept="image/*" value={word.image.startsWith("data:") ? word.image : ""} onChange={(v) => updateWord(index, {image: v || "images/pruning.svg"})}/>
                <TextField label="Feedback" value={word.feedback} onChange={(v) => updateWord(index, {feedback: v})}/>
                <FileField label="Audio della pronuncia" accept="audio/*" value={word.pronunciationAudio} onChange={(v) => updateWord(index, {pronunciationAudio: v})}/>
                <button className="speak" onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance(word.word))}>▶ Prova pronuncia</button>
                {settings.words.length > 1 && <button className="danger" onClick={() => set("words", settings.words.filter((_, i) => i !== index))}>Rimuovi parola</button>}
              </div>
            </details>)}
            <div className="section-title"><div><b>Outro</b><small>Invito finale</small></div></div>
            <TextField label="Saluto finale" value={settings.outroGreeting} onChange={(v) => set("outroGreeting", v)}/>
            <TextField label="Titolo" value={settings.outroTitle} onChange={(v) => set("outroTitle", v)}/>
            <TextField label="Sottotitolo" value={settings.outroSubtitle} onChange={(v) => set("outroSubtitle", v)}/>
            <TextField label="Tagline" value={settings.outroTagline} onChange={(v) => set("outroTagline", v)}/>
          </>}
          {panel === "timing" && <>
            <div className="section-title"><div><b>Durata delle scene</b><small>Valori espressi in secondi</small></div></div>
            <NumberField label="Hook" value={settings.hookSeconds} min={.5} max={5} step={.1} onChange={(v) => set("hookSeconds", v)}/>
            <NumberField label="Tempo per indovinare" value={settings.guessSeconds} min={1} max={10} step={.1} onChange={(v) => set("guessSeconds", v)}/>
            <NumberField label="Risposta" value={settings.revealSeconds} min={.5} max={5} step={.1} onChange={(v) => set("revealSeconds", v)}/>
            <NumberField label="Outro" value={settings.outroSeconds} min={.5} max={6} step={.1} onChange={(v) => set("outroSeconds", v)}/>
            <NumberField label="Frame al secondo" value={settings.fps} min={24} max={60} onChange={(v) => set("fps", v)}/>
          </>}
          {panel === "style" && <>
            <div className="section-title"><div><b>Palette</b><small>Colori del template</small></div></div>
            <div className="color-grid">
              {([['primaryColor', 'Primario'], ['primaryDarkColor', 'Primario scuro'], ['primarySoftColor', 'Primario tenue'], ['successColor', 'Successo'], ['successSoftColor', 'Successo tenue'], ['backgroundColor', 'Sfondo']] as [keyof FindTheWordSettings, string][]).map(([key, label]) =>
                <label className="color-field" key={key}><input type="color" value={settings[key] as string} onChange={(e) => setSettings((current) => ({...current, [key]: e.target.value}))}/><span>{label}<small>{settings[key] as string}</small></span></label>)}
            </div>
            <div className="section-title"><div><b>Dimensioni</b><small>Tipografia e immagine</small></div></div>
            <NumberField label="Titolo hook" value={settings.titleFontSize} min={70} max={150} onChange={(v) => set("titleFontSize", v)}/>
            <NumberField label="Parola" value={settings.wordFontSize} min={60} max={120} onChange={(v) => set("wordFontSize", v)}/>
            <NumberField label="Definizione" value={settings.definitionFontSize} min={30} max={64} onChange={(v) => set("definitionFontSize", v)}/>
            <NumberField label="Altezza immagine" value={settings.imageHeight} min={400} max={800} step={10} onChange={(v) => set("imageHeight", v)}/>
            <NumberField label="Sfocatura" value={settings.blurAmount} min={0} max={30} onChange={(v) => set("blurAmount", v)}/>
          </>}
          {panel === "audio" && <>
            <div className="section-title"><div><b>Colonna sonora</b><small>MP3, WAV, M4A o un URL pubblico</small></div></div>
            <TextField label="URL o file in public/" value={settings.backgroundAudio.startsWith("data:") ? "" : settings.backgroundAudio} onChange={(v) => set("backgroundAudio", v)}/>
            <FileField label="Carica audio al volo" accept="audio/*" value={settings.backgroundAudio} onChange={(v) => set("backgroundAudio", v)}/>
            {settings.backgroundAudio ? <audio className="audio-preview" controls src={settings.backgroundAudio.startsWith("http") || settings.backgroundAudio.startsWith("data:") ? settings.backgroundAudio : settings.backgroundAudio}/> : null}
            <NumberField label="Volume musica" value={settings.backgroundVolume} min={0} max={1} step={.05} onChange={(v) => set("backgroundVolume", v)}/>
            <NumberField label="Volume pronuncia" value={settings.pronunciationVolume} min={0} max={1} step={.05} onChange={(v) => set("pronunciationVolume", v)}/>
            <div className="audio-note"><b>Pronuncia delle parole</b><p>Apri una parola in Contenuti, carica il suo audio e usa “Prova pronuncia”. Nel video l'audio partirà quando viene rivelata la risposta.</p></div>
          </>}
          {panel === "effects" && <>
            <div className="section-title"><div><b>Libreria effetti</b><small>{effectPresets.length} animazioni disponibili</small></div></div>
            <div className="effect-targets">
              {([['hookEffect', 'Hook'], ['imageEffect', 'Immagine'], ['revealEffect', 'Risposta'], ['feedbackEffect', 'Feedback'], ['outroEffect', 'Saluto']] as [EffectKey, string][]).map(([key, label]) =>
                <button key={key} className={effectTarget === key ? "active" : ""} onClick={() => setEffectTarget(key)}>{label}<small>{effectById(settings[key]).name}</small></button>)}
            </div>
            <label className="field"><span>Cerca tra gli effetti</span><input placeholder="Zoom, ruota, sfocatura…" value={effectSearch} onChange={(event) => setEffectSearch(event.target.value)}/></label>
            <div className="effect-library">
              {effectPresets.filter((effect) => effect.name.toLowerCase().includes(effectSearch.toLowerCase())).map((effect) =>
                <button key={effect.id} className={settings[effectTarget] === effect.id ? "active" : ""} onClick={() => set(effectTarget, effect.id)}>
                  <span className={`effect-glyph family-${effect.family}`}>Aa</span><b>{effect.name}</b><small>{effect.durationInFrames} frame</small>
                </button>)}
            </div>
          </>}
        </div>
      </aside>
      <article className="preview-panel sticky-preview">
        <div className="phone"><Player key={`${settings.fps}-${duration}`} component={FindTheWordReel} inputProps={settings} durationInFrames={duration}
          compositionWidth={1080} compositionHeight={1920} fps={settings.fps} controls loop style={{width: "100%", height: "100%"}}/></div>
        <div className="meta"><b>Find The Word Reel</b><span>1080 × 1920 · {settings.fps} fps</span></div>
        <p className="preview-hint">Premi play per vedere countdown, blur e reveal.</p>
        {renderStatus ? <p className="render-status">{renderStatus}</p> : null}
      </article>
    </section>
  </main>;
};

createRoot(document.getElementById("root")!).render(<App/>);
