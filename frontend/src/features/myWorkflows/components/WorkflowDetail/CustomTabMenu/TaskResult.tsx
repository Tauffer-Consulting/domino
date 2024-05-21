import { DownloadB64Button } from "@components/DownloadB64Button";
import Loading from "@components/Loading";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { lazyImport } from "@utils/lazyImports";
import { Suspense, type CSSProperties } from "react";
import "./styles.css";

const { RenderB64 } = lazyImport(
  async () => await import("@components/RenderB64"),
  "RenderB64",
);

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
    width: "100%",
    overflowY: "auto",
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
        <Suspense
          fallback={
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Loading />
            </Box>
          }
        >
          <RenderB64
            base64_content={base64_content}
            file_type={file_type}
            style={style}
          />
        </Suspense>
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
