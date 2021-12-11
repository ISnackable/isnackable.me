import React from "react";
import CodeBlock from "./codeBlock";
import InlineCode from "./inlineCode";
import Figure from "./figure";
import ExternalImage from "./externalImage";

const AuthorReference = ({ node }: any) => {
  if (node && node.author && node.author.name) {
    return <span>{node.author.name}</span>;
  }
  return <></>;
};

const serializers = {
  types: {
    authorReference: AuthorReference,
    code: CodeBlock,
    figure: Figure,
    externalImage: ExternalImage,
    break: ({ node }: any) => {
      const { style } = node;
      if (style === "break") {
        return <br />;
      }

      return null;
    },
    block: (props: any) => {
      const style = props.node.style || "normal";
      switch (style) {
        case "h1":
          return (
            <h1 className="text-3xl md:text-4xl font-medium title-font mt-5">
              {props.children}
            </h1>
          );

        case "h2":
          return (
            <h2 className="text-2xl md:text-3xl font-medium title-font mt-12">
              {props.children}
            </h2>
          );

        case "h3":
          return (
            <h3 className="text-xl md:text-2xl font-medium title-font mt-10">
              {props.children}
            </h3>
          );

        case "h4":
          return (
            <h4 className="text-lg md:text-xl font-medium title-font mt-5">
              {props.children}
            </h4>
          );

        case "blockquote":
          return (
            <blockquote className="text-base md:text-lg mt-4">
              – {props.children}
            </blockquote>
          );

        default:
          return (
            <p className="text-base md:text-lg leading-relaxed mt-4 mb-6">
              {props.children}
            </p>
          );
      }
    },
  },
  list: (props: any) =>
    props.type === "bullet" ? (
      <ul className="list-disc my-4 pl-10">{props.children}</ul>
    ) : (
      <ol className="list-decimal">{props.children}</ol>
    ),
  listItem: (props: any) => {
    return <li>{props.children}</li>;
  },
  marks: {
    strong: (props: any) => <strong>{props.children}</strong>,
    em: (props: any) => <em>{props.children}</em>,
    code: InlineCode,
    internalLink: ({ mark, children }: any) => {
      const { slug = {} } = mark?.reference;
      const href = `/blog/${slug.current}`;
      return (
        <a className="text-green-500" href={href}>
          {children}
        </a>
      );
    },
    link: ({ mark, children }: any) => {
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
