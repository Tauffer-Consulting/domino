import * as html2pdf from "html2pdf.js";
import React, { useRef } from "react";

import { PaperA42 } from "./PaperA42";

interface Props {
  jsxContent: JSX.Element[];
}

const DynamicContent: React.FC<Props> = ({ jsxContent }) => {
  const contentRef = useRef(null);

  const _downloadPDF = () => {
    const content = contentRef.current;
    const pdfOptions = {
      margin: 10,
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(content)
      .set(pdfOptions)
      .outputPdf((pdf: BlobPart) => {
        const blob = new Blob([pdf], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = pdfOptions.filename;
        link.click();
      });
  };

  return (
    <PaperA42>
      {jsxContent.map((element, index) => (
        <div key={index} style={{ marginBottom: "10mm" }}>
          {element}
        </div>
      ))}
    </PaperA42>
  );
};

export default DynamicContent;
