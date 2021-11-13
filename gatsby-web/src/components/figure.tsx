import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import { getGatsbyImageData } from "gatsby-source-sanity";
import clientConfig from "../../client-config";

const Figure = ({ node }) => {
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
        <GatsbyImage
          className="object-cover mx-auto"
          image={imageData}
          alt={node?.alt ?? "figure"}
        />
        <figcaption className="pt-2 text-center">{node?.caption}</figcaption>
      </figure>
    </div>
  );
};

export default Figure;
