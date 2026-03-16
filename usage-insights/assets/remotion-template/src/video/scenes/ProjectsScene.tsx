import React from "react";
import type { VideoProps } from "../config";
import { PROJECTS_DURATION } from "../config";
import { Stage } from "../primitives";
import { ProjectAtlasBoard } from "../project-atlas-board";

export const ProjectsScene: React.FC<VideoProps> = ({ data }) => (
  <Stage current="projects" durationInFrames={PROJECTS_DURATION} section="에너지가 들어간 곳">
    <ProjectAtlasBoard data={data} />
  </Stage>
);
