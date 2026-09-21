# Remotion Reel Pipeline

Una pipeline **JSON → video verticale** per creare in un solo comando Reel Instagram, Reel Facebook e YouTube Short con [Remotion](https://www.remotion.dev/).

## Anteprima online

Il progetto include una web app responsive con player Remotion e pannelli di configurazione live:

La overview include anche il template **Find The Word**: puoi modificare hook, logo, parole, definizioni, immagini, feedback, outro, durata delle scene, colori, dimensioni e sfocatura dai pannelli **Contenuti**, **Tempi** e **Stile**, senza modificare il codice.

```bash
npm install
npm run dev
```

Apri l'indirizzo mostrato da Vite (normalmente `http://localhost:5173`). Per pubblicarla online, fai il push su GitHub e abilita **Settings → Pages → Source: GitHub Actions**: il workflow incluso compilerà e pubblicherà automaticamente il sito. Puoi anche avviare manualmente il workflow **Deploy online preview** dalla sezione Actions.

### Se il workflow non compare in Actions

GitHub mostra un workflow solo dopo che il file `.github/workflows/pages.yml` è stato effettivamente caricato nel repository. Controlla nella scheda **Code** che il file sia presente sul branch visualizzato; se stai lavorando tramite Pull Request, esegui prima il merge. Al push del file il primo deploy parte automaticamente su qualunque branch. Dopo il primo avvio, apri **Actions → Deploy online preview** e attendi la spunta verde; il link pubblico compare nel job `deploy` e nella pagina **Settings → Pages**.

## Avvio rapido

Richiede Node.js 20 o successivo.

```bash
npm install
npm run validate -- --input examples/reel.json
npm run studio
```

Lo Studio mostra tre composition, una per ogni canale. Per renderizzare tutti i file MP4:

```bash
npm run render:all -- --input examples/reel.json --output out
```

Oppure una singola destinazione:

```bash
npm run render -- --input examples/reel.json --platform instagram
```

I valori accettati da `--platform` sono `instagram`, `facebook`, `youtube` e `all` (default). Il renderer crea `out/instagram.mp4`, `out/facebook.mp4` e `out/youtube.mp4` in H.264, formato verticale 1080×1920.

## Formato JSON

```json
{
  "brand": "Studio Nova",
  "handle": "@studionova",
  "fps": 30,
  "music": "audio/traccia.mp3",
  "callToAction": "Scopri di più",
  "scenes": [
    {
      "durationInSeconds": 2.5,
      "eyebrow": "Una nuova idea",
      "title": "Il titolo della scena",
      "body": "Un testo breve facoltativo.",
      "accent": "#f97316",
      "background": "linear-gradient(145deg, #090b18, #42168a)"
    }
  ]
}
```

| Campo | Obbligatorio | Descrizione |
| --- | --- | --- |
| `brand`, `handle`, `callToAction` | sì | Identità e CTA persistenti in sovrimpressione. |
| `fps` | sì | Intero compreso tra 24 e 60. |
| `music` | no | URL remoto oppure percorso relativo alla cartella `public/`. |
| `scenes` | sì | Una o più scene, nell'ordine di riproduzione. |
| `durationInSeconds` | sì | Durata scena, maggiore di 0 e non superiore a 30 secondi. |
| `title` | sì | Titolo principale della scena. |
| `eyebrow`, `body`, `accent`, `background` | no | Testi e personalizzazione visuale della scena. |

> Per audio locali, copia il file dentro `public/` (per esempio `public/audio/traccia.mp3`) e usa `"music": "audio/traccia.mp3"`.

## Comandi

| Comando | Funzione |
| --- | --- |
| `npm run studio` | Apre la preview interattiva di Remotion. |
| `npm run validate -- --input file.json` | Valida input, scene, durata e fps senza renderizzare. |
| `npm run render -- --input file.json --platform youtube` | Renderizza una piattaforma. |
| `npm run render:all -- --input file.json` | Renderizza tutte le piattaforme. |
| `npm test` | Esegue i test del validatore. |
| `npm run typecheck` | Controlla i tipi TypeScript. |

## Struttura

- `src/Reel.tsx`: template animato e safe area verticale.
- `src/Root.tsx`: composition per ciascuna piattaforma.
- `src/config.ts`: tipi, specifiche e validazione del JSON.
- `scripts/render.ts`: orchestrazione bundle/render multipiattaforma.
- `examples/reel.json`: input pronto da personalizzare.
