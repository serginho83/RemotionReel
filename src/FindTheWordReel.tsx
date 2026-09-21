import React from "react";
import {AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import type {FindTheWordSettings, WordItem} from "./findTheWordConfig.ts";

type Theme = Pick<FindTheWordSettings, "primaryColor" | "primaryDarkColor" | "primarySoftColor" | "successColor" | "successSoftColor" | "backgroundColor">;
const fontFamily = "Arial, Helvetica, sans-serif";

const asset = (source: string) => source.startsWith("http") || source.startsWith("data:") ? source : staticFile(source);

export const BrandLogo: React.FC<{src: string; width?: number}> = ({src, width = 240}) => (
  <Img src={asset(src)} style={{width, height: "auto", objectFit: "contain"}} />
);

export const HookTitle: React.FC<{line1: string; line2: string; fontSize: number; theme: Theme}> = ({line1, line2, fontSize, theme}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, from: 0.82, to: 1, config: {damping: 16}});
  return <div style={{fontFamily, fontWeight: 900, textAlign: "center", lineHeight: .88, color: theme.primaryDarkColor, transform: `scale(${scale})`}}>
    <div style={{fontSize}}>{line1}</div>
    <div style={{fontSize, padding: "14px 28px 20px", marginTop: 12, borderRadius: 30, backgroundColor: theme.primarySoftColor}}>{line2}</div>
  </div>;
};

export const HookSubtitle: React.FC<{lines: string[]; theme: Theme}> = ({lines, theme}) => {
  const frame = useCurrentFrame();
  return <div style={{display: "flex", flexDirection: "column", gap: 8, fontFamily, fontSize: 44, lineHeight: 1.05, fontWeight: 800,
    textAlign: "center", color: theme.primaryDarkColor, opacity: interpolate(frame, [10, 20], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>
    {lines.map((line, index) => <div key={`${line}-${index}`}>{line}</div>)}
  </div>;
};

export const WordImage: React.FC<{src: string; revealAt: number; height: number; blur: number}> = ({src, revealAt, height, blur}) => {
  const frame = useCurrentFrame();
  const amount = interpolate(frame, [revealAt, revealAt + 12], [blur, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  return <div style={{width: "100%", height, overflow: "hidden", borderRadius: 28, boxShadow: "0 18px 45px rgba(0,0,0,.12)", background: "#eaf3fb"}}>
    <Img src={asset(src)} style={{width: "100%", height: "100%", objectFit: "cover", filter: `blur(${amount}px)`, transform: `scale(${amount > 0 ? 1.06 : 1})`}} />
  </div>;
};

export const Countdown: React.FC<{duration: number; theme: Theme}> = ({duration, theme}) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, frame / duration);
  const number = Math.max(1, Math.ceil(3 - progress * 3));
  const ring = interpolate(progress, [0, 1], [0, 360]);
  return <div style={{width: 190, height: 190, borderRadius: "50%", display: "grid", placeItems: "center", padding: 14,
    background: `conic-gradient(${theme.primaryColor} ${ring}deg, #e6ebf1 ${ring}deg)`}}>
    <div style={{width: "100%", height: "100%", borderRadius: "50%", display: "grid", placeItems: "center", background: theme.backgroundColor,
      color: theme.primaryColor, fontFamily, fontSize: 82, fontWeight: 900}}>{number}</div>
  </div>;
};

export const FeedbackBadge: React.FC<{text: string; theme: Theme}> = ({text, theme}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scale = spring({frame, fps, from: .85, to: 1, delay: 4, config: {damping: 16}});
  return <div style={{display: "inline-flex", alignItems: "center", gap: 18, padding: "20px 34px", borderRadius: 999, fontFamily,
    fontSize: 42, fontWeight: 900, color: theme.successColor, background: theme.successSoftColor,
    opacity: interpolate(frame, [4, 12], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"}), transform: `scale(${scale})`}}>
    <span style={{width: 56, height: 56, borderRadius: "50%", display: "grid", placeItems: "center", color: "white", background: theme.successColor}}>✓</span>{text}
  </div>;
};

const NextIndicator: React.FC<{theme: Theme; start?: number}> = ({theme, start = 0}) => {
  const frame = useCurrentFrame();
  return <div style={{fontFamily, fontSize: 64, fontWeight: 900, color: theme.primaryColor,
    opacity: interpolate(frame, [start, start + 6], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})}}>»»»</div>;
};

const HookScene: React.FC<{settings: FindTheWordSettings; theme: Theme}> = ({settings, theme}) => <AbsoluteFill style={{background: theme.backgroundColor, padding: "90px 70px 80px"}}>
  <BrandLogo src={settings.logoSrc} />
  <div style={{flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 48}}>
    <HookTitle line1={settings.hookLine1} line2={settings.hookLine2} fontSize={settings.titleFontSize} theme={theme}/>
    <HookSubtitle lines={settings.hookSubtitle} theme={theme}/>
  </div>
  <div style={{display: "flex", justifyContent: "flex-end"}}><NextIndicator theme={theme} start={22}/></div>
</AbsoluteFill>;

const WordScene: React.FC<{item: WordItem; settings: FindTheWordSettings; theme: Theme}> = ({item, settings, theme}) => {
  const {fps} = useVideoConfig();
  const guessFrames = Math.round(settings.guessSeconds * fps);
  const revealFrames = Math.round(settings.revealSeconds * fps);
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: theme.backgroundColor, padding: "72px 70px 80px"}}>
    <BrandLogo src={settings.logoSrc} width={220}/>
    <div style={{marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 38}}>
      <WordImage src={item.image} revealAt={guessFrames} height={settings.imageHeight} blur={settings.blurAmount}/>
      {frame < guessFrames ? <>
        <div style={{fontFamily, fontSize: settings.wordFontSize, fontWeight: 900, letterSpacing: 8, color: theme.primaryColor}}>{item.maskedWord}</div>
        <div style={{fontFamily, fontSize: settings.definitionFontSize, fontWeight: 800, textAlign: "center", color: theme.primaryDarkColor}}>{item.definition}</div>
        <Countdown duration={guessFrames} theme={theme}/>
      </> : <Sequence from={guessFrames} durationInFrames={revealFrames} layout="none">
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 30,
          opacity: interpolate(frame, [guessFrames, guessFrames + 8], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(.16, 1, .3, 1)})}}>
          <div style={{fontFamily, fontSize: settings.wordFontSize, fontWeight: 900, letterSpacing: 12, color: theme.primaryColor}}>{item.word}</div>
          <div style={{fontFamily, fontSize: settings.definitionFontSize, fontWeight: 800, textAlign: "center", color: theme.primaryDarkColor}}>{item.definition}</div>
          <FeedbackBadge text={item.feedback} theme={theme}/>
        </div>
      </Sequence>}
    </div>
    <div style={{position: "absolute", right: 70, bottom: 60}}><NextIndicator theme={theme} start={guessFrames + 10}/></div>
  </AbsoluteFill>;
};

const OutroScene: React.FC<{settings: FindTheWordSettings; theme: Theme}> = ({settings, theme}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: theme.backgroundColor, padding: "90px 70px", alignItems: "center"}}>
    <div style={{alignSelf: "flex-start"}}><BrandLogo src={settings.logoSrc}/></div>
    <div style={{flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 44, textAlign: "center",
      opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: "clamp"})}}>
      <div style={{fontFamily, fontSize: 108, fontWeight: 900, lineHeight: .95, color: theme.primaryDarkColor}}>{settings.outroTitle}</div>
      <div style={{width: 540, height: 12, borderRadius: 99, background: theme.primaryColor}}/>
      <div style={{fontFamily, fontSize: 46, fontWeight: 700, color: theme.primaryColor}}>{settings.outroSubtitle}</div>
      <div style={{display: "flex", gap: 26}}>{[["IG", "#d62976"], ["▶", "#f00"], ["♪", "#111"]].map(([label, color]) =>
        <div key={label} style={{width: 84, height: 84, borderRadius: 22, display: "grid", placeItems: "center", fontSize: 40, fontWeight: 900, color: "white", background: color}}>{label}</div>)}</div>
      <div style={{fontFamily, fontSize: 42, fontStyle: "italic", color: theme.primaryDarkColor}}>{settings.outroTagline}</div>
    </div>
  </AbsoluteFill>;
};

export const FindTheWordReel: React.FC<FindTheWordSettings> = (settings) => {
  const {fps} = useVideoConfig();
  const hook = Math.round(settings.hookSeconds * fps);
  const word = Math.round((settings.guessSeconds + settings.revealSeconds) * fps);
  const outro = Math.round(settings.outroSeconds * fps);
  const theme: Theme = settings;
  return <AbsoluteFill>
    <Sequence durationInFrames={hook}><HookScene settings={settings} theme={theme}/></Sequence>
    {settings.words.map((item, index) => <Sequence key={`${item.word}-${index}`} from={hook + index * word} durationInFrames={word}>
      <WordScene item={item} settings={settings} theme={theme}/>
    </Sequence>)}
    <Sequence from={hook + settings.words.length * word} durationInFrames={outro}><OutroScene settings={settings} theme={theme}/></Sequence>
  </AbsoluteFill>;
};
