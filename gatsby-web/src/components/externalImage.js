import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import { getGatsbyImageData } from "gatsby-source-sanity";
import clientConfig from "../../client-config";

const Figure = ({ node }) => {
  if (!node || !node._key || !node.url) {
    return null;
  }

  return (
    <figure className="relative max-w-5xl my-4 mx-auto">
      <img
        className="object-cover mx-auto"
        src={node?.url}
        alt={node?.alt ?? ""}
      />
      {node?.caption && (
        <figcaption className="pt-2 text-center">{node?.caption}</figcaption>
      )}
    </figure>
  );
};

export default Figure;
