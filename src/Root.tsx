import React from "react";
import {Composition} from "remotion";
import {durationInFrames, platformSpecs, platforms, type Platform, type ReelConfig} from "./config.ts";
import {Reel} from "./Reel.tsx";
import example from "../examples/reel.json";

const defaultConfig = example as ReelConfig;

export const RemotionRoot: React.FC = () => (
  <>
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
