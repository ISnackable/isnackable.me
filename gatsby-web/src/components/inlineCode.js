import React from "react";

const codeStyles = {
  border: "1px solid #404040",
  padding: "1px 5px",
  background: "#212121",
  textShadow: "none",
  borderRadius: "3px",
};

const InlineCode = React.memo((props) => {
  return <code style={codeStyles}>{props.children}</code>;
});

export default InlineCode;
