import React from "react";

interface Props {
  html: string;
}

const HtmlRenderer: React.FC<Props> = ({ html }) => {
  return (
    <iframe
      title="html-renderer"
      srcDoc={html}
      style={{ border: "none", width: "auto", height: "auto" }}
    ></iframe>
  );
};

export default HtmlRenderer;
