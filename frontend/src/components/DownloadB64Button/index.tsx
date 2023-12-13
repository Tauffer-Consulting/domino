import { Tooltip, type ButtonProps, Button } from "@mui/material";
import React, { useCallback } from "react";

interface Props extends ButtonProps {
  base64_content: string;
  file_type: string;
}

export const DownloadB64Button: React.FC<Props> = ({
  base64_content,
  file_type,
  ...props
}) => {
  const downloadContent = useCallback(() => {
    let href = "";
    switch (file_type) {
      case "txt":
        href = `data:text/plain;base64,${base64_content}`;
        break;
      case "plotly_json":
      case "json":
        href = `data:application/json;base64,${base64_content}`;
        break;
      case "jpeg":
      case "jpg":
      case "png":
      case "bmp":
      case "gif":
      case "tiff":
        href = `data:image/${file_type};base64,${base64_content}`;
        break;
      case "svg":
        href = `data:image/svg+xml;base64,${base64_content}`;
        break;
      case "md":
        href = `data:text/markdown;base64,${base64_content}`;
        break;
      case "pdf":
        href = `data:application/pdf;base64,${base64_content}`;
        break;
      case "html":
        href = `data:text/html;base64,${base64_content}`;
        break;
      default:
        href = `data:text/plain;base64,${base64_content}`;
        break;
    }

    const a = document.createElement("a"); // Create <a>
    a.href = href; // Image Base64 Goes here
    a.download = `download.${file_type}`; // File name Here
    a.click(); // Downloaded file
  }, [base64_content, file_type]);

  return (
    <Tooltip
      title={
        !base64_content || !file_type
          ? "Missing base64_content of file_type"
          : "Will download the raw result content "
      }
    >
      <Button
        variant="contained"
        onClick={downloadContent}
        disabled={!base64_content || !file_type}
        {...props}
      >
        Download content
      </Button>
    </Tooltip>
  );
};
