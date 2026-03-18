import React from "react";
import type { VideoProps } from "../config";
import { PROJECTS_DURATION } from "../config";
import { getVideoCopy } from "../copy";
import { Stage } from "../primitives";
import { ProjectAtlasBoard } from "../project-atlas-board";

export const ProjectsScene: React.FC<VideoProps> = ({ data }) => {
  const copy = getVideoCopy(data.locale);

  return (
    <Stage
      current="projects"
      durationInFrames={PROJECTS_DURATION}
      section={copy.projects.section}
      locale={data.locale}
    >
      <ProjectAtlasBoard data={data} />
    </Stage>
  );
};
