import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {Platform, ReelConfig, Scene} from "./config.ts";

const SceneCard: React.FC<{scene: Scene; index: number; total: number}> = ({scene, index, total}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 18, stiffness: 120}});
  const exit = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift = interpolate(enter, [0, 1], [90, 0]);

  return (
    <AbsoluteFill
      style={{
        background: scene.background ?? "linear-gradient(145deg, #090b18 0%, #15134a 55%, #42168a 100%)",
        color: "white",
        fontFamily: "Inter, Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <div style={{position: "absolute", width: 900, height: 900, borderRadius: "50%", top: -390, right: -390,
        background: scene.accent ?? "#8b5cf6", filter: "blur(12px)", opacity: 0.35}} />
      <div style={{position: "absolute", inset: 72, border: "2px solid rgba(255,255,255,.16)", borderRadius: 52}} />
      <div style={{position: "absolute", top: 110, left: 110, right: 110, display: "flex", justifyContent: "space-between",
        fontSize: 27, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: 0.8}}>
        <span>{scene.eyebrow ?? "In evidenza"}</span><span>{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>
      <div style={{position: "absolute", left: 110, right: 110, top: "32%", opacity: exit,
        transform: `translateY(${lift}px)`}}>
        <div style={{height: 13, width: 130, borderRadius: 8, marginBottom: 46, background: scene.accent ?? "#a78bfa"}} />
        <h1 style={{fontSize: 104, lineHeight: 0.98, letterSpacing: -5, margin: 0, maxWidth: 850}}>{scene.title}</h1>
        {scene.body ? <p style={{fontSize: 38, lineHeight: 1.35, opacity: 0.76, marginTop: 40, maxWidth: 780}}>{scene.body}</p> : null}
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelConfig & {platform: Platform}> = (props) => {
  let offset = 0;
  return (
    <AbsoluteFill>
      {props.scenes.map((scene, index) => {
        const duration = Math.round(scene.durationInSeconds * props.fps);
        const from = offset;
        offset += duration;
        return <Sequence key={`${index}-${scene.title}`} from={from} durationInFrames={duration} premountFor={props.fps}>
          <SceneCard scene={scene} index={index} total={props.scenes.length} />
        </Sequence>;
      })}
      {props.music ? <Audio src={props.music.startsWith("http") ? props.music : staticFile(props.music)} volume={0.28} /> : null}
      <div style={{position: "absolute", bottom: 108, left: 110, right: 110, color: "white", display: "flex",
        alignItems: "center", justifyContent: "space-between", fontFamily: "Inter, Arial, sans-serif", fontSize: 28,
        fontWeight: 700, letterSpacing: 1.2}}>
        <span>{props.brand} · {props.handle}</span>
        <span style={{padding: "18px 28px", borderRadius: 999, background: "white", color: "#121225"}}>{props.callToAction} →</span>
      </div>
    </AbsoluteFill>
  );
};
