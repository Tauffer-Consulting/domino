import React, { useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";

interface Props {
  contentId: string;
}

export const DownloadAsPDF: React.FC<Props> = ({ contentId }) => {
  const [content, setContent] = useState<HTMLElement | null>(null);
  const handlePrint = useReactToPrint({
    content: () => content,
  });

  useEffect(() => {
    const content = document.getElementById(contentId);
    console.log("content", content);
    if (content) {
      setContent(content);
    }
  }, [contentId]);

  const handlePrintWithTimeout = () => {
    // Add a short timeout to ensure styles are applied before printing
    setTimeout(() => {
      handlePrint();
    }, 2000); // Adjust the timeout duration as needed
  };

  return (
    <div>
      <button onClick={handlePrintWithTimeout}>Generate PDF</button>
    </div>
  );
};
