import { CircularProgress, Container, Typography } from "@mui/material";
import { DownloadB64Button } from "components/DownloadB64Button";
import { RenderB64 } from "components/RenderB64";
import { type CSSProperties } from "react";
import "./styles.css";

interface ITaskResultProps {
  isLoading: boolean;
  base64_content?: string;
  file_type?: string;
}

export const TaskResult = ({
  base64_content,
  file_type,
  isLoading,
}: ITaskResultProps) => {
  const style: CSSProperties = {
    height: "100%",
    width: "100%",
    overflowY: "scroll",
    overflowX: "hidden",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    display: "inline-block",
  };

  if (isLoading) {
    return (
      <Container
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container
      sx={{
        paddingX: "24px",
        paddingY: "12px",
        height: "100%",
        width: "100%",
        display: "block",
        textAlign: "center",
        overflowY: "scroll",
        overflowX: "hidden",
      }}
    >
      {!!base64_content && !!file_type ? (
        <RenderB64
          base64_content={base64_content}
          file_type={file_type}
          style={style}
        />
      ) : (
        <Typography variant="h2">No content</Typography>
      )}
      {!!base64_content && !!file_type && (
        <DownloadB64Button
          base64_content={base64_content}
          file_type={file_type}
        />
      )}
    </Container>
  );
};
