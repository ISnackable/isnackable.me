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
    block: (props) => {
      const style = props.node.style || "normal";
      if (style === "h1") {
        return (
          <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4">
            {props.children}
          </h1>
        );
      }
      if (style === "h2") {
        return (
          <h2 className="text-2xl font-medium  title-font mb-2">
            {props.children}
          </h2>
        );
      }
      if (style === "h3") {
        return <h3 className="title-font font-medium ">{props.children}</h3>;
      }

      if (/^h\d/.test(style)) {
        const level = style.replace(/[^\d]/g, "");
        return React.createElement(`h${level}`, {}, props.children);
      }

      if (style === "blockquote") {
        return <blockquote>– {props.children}</blockquote>;
      }

      return style === "blockquote" ? (
        <blockquote>– {props.children}</blockquote>
      ) : (
        <p className="leading-relaxed">{props.children}</p>
      );
    },
  },
};

export default serializers;
