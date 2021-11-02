import React from "react";

const imageStyle = {
  width: "auto",
  height: "auto",
  maxWidth: "100%",
  maxHeight: "90vh",
};

const ExternalImagePreview = ({ value }) => {
  const { url } = value;
  if (!url) {
    return <p>Missing URL for Image link</p>;
  }

  return <img src={url} alt="" style={imageStyle} />;
};

export default ExternalImagePreview;
