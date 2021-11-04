import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import { getGatsbyImageData } from "gatsby-source-sanity";
import clientConfig from "../../client-config";

const Figure = ({ node }) => {
  if (!node || !node.asset || !node.asset._id) {
    return null;
  }
  const imageDate = getGatsbyImageData(
    node,
    { maxWidth: 675 },
    clientConfig.sanity
  );

  return (
    <figure className="relative max-w-5xl my-4 mx-auto">
      <GatsbyImage
        className="object-cover mx-auto"
        image={imageDate}
        alt={node?.alt ?? "figure"}
      />
      <figcaption className="pt-2 text-center">{node?.caption}</figcaption>
    </figure>
  );
};

export default Figure;
