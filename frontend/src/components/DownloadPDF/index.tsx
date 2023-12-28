import { Button, type ButtonProps } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";

interface Props extends ButtonProps {
  contentId: string;
}

export const DownloadAsPDF: React.FC<Props> = ({ contentId, ...props }) => {
  const [content, setContent] = useState<HTMLElement | null>(null);
  const handlePrint = useReactToPrint({
    content: () => content,
  });

  useEffect(() => {
    // Fetch the content element using the contentId
    const newContent = document.getElementById(contentId);
    setContent(newContent);
  }, [contentId]);

  const handlePrintWithTimeout = () => {
    // Add a short timeout to ensure styles are applied before printing
    setTimeout(() => {
      handlePrint();
    }, 2000); // Adjust the timeout duration as needed
  };

  return (
    <Button variant="outlined" onClick={handlePrintWithTimeout} {...props}>
      Generate PDF
    </Button>
  );
};
