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
    <figure className="relative max-w-xs my-4 mx-auto">
      <GatsbyImage
        className="object-cover w-full h-full"
        image={imageDate}
        alt={node?.asset?.altText ?? ""}
      />
      <figcaption className="pt-2">{node?.asset?.description}</figcaption>
    </figure>
  );
};

export default Figure;
