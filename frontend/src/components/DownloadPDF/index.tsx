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

    if (content) {
      setContent(content);
    }
  }, [contentId]);

  return (
    <div>
      <button onClick={handlePrint}>Generate PDF</button>
    </div>
  );
};
