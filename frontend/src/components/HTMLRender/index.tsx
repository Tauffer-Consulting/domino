import React, { useRef, useState } from "react";

interface Props {
  html: string;
}

const HtmlRenderer: React.FC<Props> = ({ html }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [minHeight, setMinHeight] = useState<number>(0);

  const handleLoad = () => {
    const iframe = iframeRef.current;
    if (iframe) {
      const newMinHeight =
        iframe.contentWindow?.document.body.scrollHeight ?? 0;
      setMinHeight(newMinHeight);
      iframe.style.height = `${newMinHeight}px`;
    }
  };

  return (
    <div
      style={{
        minHeight: `${minHeight}px`,
        height: "100%",
        width: "100%",
        overflowY: "hidden",
        overflowX: "auto",
      }}
    >
      <iframe
        ref={iframeRef}
        title="html-renderer"
        srcDoc={html}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        scrolling="no"
        onLoad={handleLoad}
      ></iframe>
    </div>
  );
};

export default HtmlRenderer;
