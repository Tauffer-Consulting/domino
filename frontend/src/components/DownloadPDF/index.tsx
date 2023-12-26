import { Button } from "@mui/material";
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
    <Button variant="outlined" onClick={handlePrintWithTimeout}>
      Generate PDF
    </Button>
  );
};
