import React from "react";
import { AbsoluteFill } from "remotion";
import { springTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  CLOSING_DURATION,
  OPENING_DURATION,
  PERSONA_DURATION,
  PROJECTS_DURATION,
  RHYTHM_DURATION,
  SCENE_TRANSITION_DURATION,
  SYSTEM_DURATION,
  type VideoProps,
} from "./config";
import { Backdrop } from "./primitives";
import { ClosingScene } from "./scenes/ClosingScene";
import { OpeningScene } from "./scenes/OpeningScene";
import { PersonaScene } from "./scenes/PersonaScene";
import { ProjectsScene } from "./scenes/ProjectsScene";
import { RhythmScene } from "./scenes/RhythmScene";
import { SystemScene } from "./scenes/SystemScene";

export { USAGE_PROFILE_DURATION } from "./config";

export const UsageInsightsVideo: React.FC<VideoProps> = ({ data }) => {
  const sceneTiming = springTiming({
    config: { damping: 200 },
    durationInFrames: SCENE_TRANSITION_DURATION,
  });

  return (
    <AbsoluteFill>
      <Backdrop />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={OPENING_DURATION}>
          <OpeningScene data={data} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={sceneTiming} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={SYSTEM_DURATION}>
          <SystemScene data={data} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={sceneTiming} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={RHYTHM_DURATION}>
          <RhythmScene data={data} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={sceneTiming} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={PROJECTS_DURATION}>
          <ProjectsScene data={data} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={sceneTiming} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={PERSONA_DURATION}>
          <PersonaScene data={data} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={sceneTiming} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={CLOSING_DURATION}>
          <ClosingScene data={data} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
