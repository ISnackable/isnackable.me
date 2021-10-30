import React from "react";
import PropTypes from "prop-types";

const codeStyles = {
  border: "1px solid #404040",
  padding: "1px 5px",
  background: "#212121",
  textShadow: "none",
  borderRadius: "3px",
};

const InlineCode = React.memo(() => {
  const { value } = this.props;
  return <code style={codeStyles}>{value}</code>;
});

InlineCode.propTypes = {
  value: PropTypes.string.isRequired,
};

export default InlineCode;
