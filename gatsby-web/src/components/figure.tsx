import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import { getGatsbyImageData } from "gatsby-source-sanity";
import { SRLWrapper } from "simple-react-lightbox";
import clientConfig from "../../client-config";

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
  if (!node || !node.asset || !node.asset._id) {
    return null;
  }

  const imageData = getGatsbyImageData(
    node,
    { width: 675 },
    clientConfig.sanity
  );

  return (
    <div className="flex items-center justify-center my-4">
      <figure className="relative cursor-pointer">
        <SRLWrapper options={options}>
          <GatsbyImage
            className="object-cover mx-auto"
            image={imageData}
            alt={node?.alt ?? "figure"}
          />
        </SRLWrapper>
        <figcaption className="pt-2 text-center">{node?.caption}</figcaption>
      </figure>
    </div>
  );
};

export default Figure;
