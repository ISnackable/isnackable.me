import React from "react";
import CodeBlock from "./codeBlock";
import InlineCode from "./inlineCode";
import Figure from "./figure";

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
    image: Figure,
    externalImage: ({ node }) => {
      if (!node || !node._key || !node.url) {
        return null;
      }

      return (
        <figure className="relative max-w-xs my-4 mx-auto">
          <img
            className="object-cover w-full h-full"
            src={node?.url}
            alt={node?.alt ?? ""}
          />
          {node?.caption && (
            <figcaption className="pt-2">{node?.caption}</figcaption>
          )}
        </figure>
      );
    },
    break: ({ node }) => {
      const { style } = node;
      if (style === "break") {
        return <br />;
      }

      return null;
    },
    block: (props) => {
      const style = props.node.style || "normal";
      switch (style) {
        case "h1":
          return (
            <h1 className="text-3xl font-medium title-font mt-4">
              {props.children}
            </h1>
          );

        case "h2":
          return (
            <h2 className="text-2xl font-medium title-font mt-2">
              {props.children}
            </h2>
          );

        case "h3":
          return (
            <h3 className="text-xl font-medium title-font mt-1">
              {props.children}
            </h3>
          );

        case "h4":
          return (
            <h4 className="text-lg font-medium title-font mt-0.5">
              {props.children}
            </h4>
          );

        case "blockquote":
          return <blockquote className="mt-4">– {props.children}</blockquote>;

        default:
          return (
            <p className="text-base leading-relaxed mt-4">{props.children}</p>
          );
      }
    },
  },
  list: (props) =>
    props.type === "bullet" ? (
      <ul className="list-disc my-4 pl-10">{props.children}</ul>
    ) : (
      <ol className="list-decimal">{props.children}</ol>
    ),
  listItem: (props) => {
    return <li>{props.children}</li>;
  },
  marks: {
    strong: (props) => <strong>{props.children}</strong>,
    em: (props) => <em>{props.children}</em>,
    code: InlineCode,
    internalLink: ({ mark, children }) => {
      const { slug = {} } = mark?.reference;
      const href = `/blog/${slug.current}`;
      return (
        <a className="text-green-500" href={href}>
          {children}
        </a>
      );
    },
    link: ({ mark, children }) => {
      const { blank, href } = mark;
      return blank ? (
        <a
          className="text-green-500"
          href={href}
          target="_blank"
          rel="noreferrer noopener"
        >
          {children}
        </a>
      ) : (
        <a className="text-green-500" href={href}>
          {children}
        </a>
      );
    },
  },
};

export default serializers;