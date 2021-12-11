import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useMediaQuery } from "react-responsive";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import * as style from "./codeBlock.module.css";

const highlightLine = (
  lineNumber: number,
  linesToHighlight: Array<number>,
  color = "#455770"
) => {
  const style = { display: "block", width: "auto", backgroundColor: "" };

  if (linesToHighlight.includes(lineNumber)) {
    style.backgroundColor = color;
  }
  return { style };
};

const CodeBlock = ({ node }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 900px)" });

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  if (!node || !node.code) {
    return null;
  }

  const {
    language,
    code,
    startingLineNumber = 1,
    highlightedLines = [],
    filename,
  } = node;
  return (
    <div className="codeblock relative mt-2">
      {filename && <span className={style.filename}>{filename}</span>}
      <div className={style.copyButton}>
        <CopyToClipboard onCopy={handleCopy} text={code}>
          <button type="button" aria-label="Copy to Clipboard Button">
            {isCopied ? (
              <>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#ffffff"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="2" />
                </svg>
                <div>Copied</div>
              </>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="#ffffff"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
              </svg>
            )}
          </button>
        </CopyToClipboard>
      </div>
      <SyntaxHighlighter
        customStyle={{
          marginTop: 0,
          borderTopLeftRadius: !filename ? "0.3em" : 0,
          borderTopRightRadius: !filename ? "0.3em" : 0,
          lineHeight: !isMobile ? "1.5rem" : "1.75rem",
          fontSize: !isMobile ? "1.125rem" : "1rem",
        }}
        codeTagProps={{
          style: {
            lineHeight: "inherit",
            fontSize: "inherit",
          },
        }}
        language={language || "text"}
        style={dracula}
        showLineNumbers={true}
        startingLineNumber={startingLineNumber}
        wrapLines={true}
        lineProps={(line) => highlightLine(line, highlightedLines)}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
