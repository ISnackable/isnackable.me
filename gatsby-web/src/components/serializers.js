import React from "react";
import CodeBlock from "./codeBlock";
// import InlineCode from "./inlineCode";

const AuthorReference = ({ node }) => {
  if (node && node.author && node.author.name) {
    return <span>{node.author.name}</span>;
  }
  return <></>;
};

const serializers = {
  types: {
    authorReference: AuthorReference,
    code: CodeBlock,
  },
};

export default serializers;
