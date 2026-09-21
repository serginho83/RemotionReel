import React from "react";
import {Composition} from "remotion";
import {durationInFrames, platformSpecs, platforms, type Platform, type ReelConfig} from "./config.ts";
import {Reel} from "./Reel.tsx";
import {FindTheWordReel} from "./FindTheWordReel.tsx";
import {defaultFindTheWordSettings, findTheWordDuration} from "./findTheWordConfig.ts";
import example from "../examples/reel.json";

const defaultConfig = example as ReelConfig;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FindTheWordReel"
      component={FindTheWordReel}
      width={1080}
      height={1920}
      fps={defaultFindTheWordSettings.fps}
      durationInFrames={findTheWordDuration(defaultFindTheWordSettings)}
      defaultProps={defaultFindTheWordSettings}
      calculateMetadata={({props}) => ({fps: props.fps, durationInFrames: findTheWordDuration(props)})}
    />
    {platforms.map((platform: Platform) => {
      const spec = platformSpecs[platform];
      return (
        <Composition
          key={platform}
          id={spec.label.replace(/\s/g, "")}
          component={Reel}
          width={spec.width}
          height={spec.height}
          fps={defaultConfig.fps}
          durationInFrames={durationInFrames(defaultConfig)}
          defaultProps={{...defaultConfig, platform}}
          calculateMetadata={({props}) => ({
            durationInFrames: durationInFrames(props),
            fps: props.fps,
          })}
        />
      );
    })}
  </>
);
