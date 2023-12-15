import type { PDFDocumentProxy } from "pdfjs-dist";
import { useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

type Props =
  | {
      base64Content: string;
    }
  | { file: string };

export const RenderPDF: React.FC<Props> = (props) => {
  const [numPages, setNumPages] = useState<number>(0);

  const file =
    "file" in props
      ? props.file
      : `data:application/pdf;base64,${props.base64Content}`;

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }

  return (
    <Document
      file={file}
      onLoadSuccess={onDocumentLoadSuccess}
      options={options}
    >
      {Array.from(new Array(numPages), (el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={650} />
      ))}
    </Document>
  );
};
