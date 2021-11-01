import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const highlightLine = (lineNumber, linesToHighlight, color = "#455770") => {
  const style = { display: "block", width: "auto" };

  if (linesToHighlight.includes(lineNumber)) {
    style.backgroundColor = color;
  }
  return { style };
};

const CodeBlock = ({ node }) => {
  if (!node || !node.code) {
    return null;
  }

  const {
    language,
    code,
    startingLineNumber = 1,
    highlightedLines = [],
  } = node;
  return (
    <SyntaxHighlighter
      language={language || "text"}
      style={dracula}
      showLineNumbers={true}
      startingLineNumber={startingLineNumber}
      wrapLines={true}
      lineProps={(line) => highlightLine(line, highlightedLines)}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
