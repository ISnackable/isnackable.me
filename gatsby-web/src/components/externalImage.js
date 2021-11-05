import React from "react";

const Figure = ({ node }) => {
  if (!node || !node._key || !node.url) {
    return null;
  }

  return (
    <div className="flex items-center justify-center my-4">
      <figure className="relative cursor-pointer">
        <img
          className="object-cover mx-auto"
          src={node?.url}
          alt={node?.alt ?? ""}
        />
        {node?.caption && (
          <figcaption className="pt-2 text-center">{node?.caption}</figcaption>
        )}
      </figure>
    </div>
  );
};

export default Figure;
