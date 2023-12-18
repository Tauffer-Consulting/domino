import React from "react";

interface Props {
  html: string;
}

const HtmlRenderer: React.FC<Props> = ({ html }) => {
  return (
    <iframe
      title="html-renderer"
      srcDoc={html}
      width="100%"
      height="100%"
      style={{ border: "none" }}
    ></iframe>
  );
};

export default HtmlRenderer;
