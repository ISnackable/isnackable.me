import React from "react";
import { SRLWrapper } from "simple-react-lightbox";

const options = {
  settings: {
    autoplaySpeed: 0,
    disableKeyboardControls: true,
    disableWheelControls: true,
    usingPreact: true,
  },
  caption: {},
  buttons: {
    showAutoplayButton: false,
    showDownloadButton: false,
    showNextButton: false,
    showPrevButton: false,
    showThumbnailsButton: false,
  },
  thumbnails: { showThumbnails: false },
  progressBar: {},
};

const Figure = ({ node }: any) => {
  if (!node || !node._key || !node.url) {
    return null;
  }

  return (
    <div className="flex items-center justify-center my-4">
      <figure className="relative cursor-pointer">
        <SRLWrapper options={options}>
          <img
            className="object-cover mx-auto"
            src={node?.url}
            alt={node?.alt ?? ""}
          />
        </SRLWrapper>
        {node?.caption && (
          <figcaption className="pt-2 text-center">{node?.caption}</figcaption>
        )}
      </figure>
    </div>
  );
};

export default Figure;
