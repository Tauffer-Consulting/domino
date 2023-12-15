import { Container, Paper } from "@mui/material";
import React, { useRef, useEffect, useState } from "react";

const A4_ASPECT_RATIO = 1.414;

export const PaperA42: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const paperRef = useRef<HTMLDivElement>(null);
  const [folders, setFolders] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (paperRef.current) {
        const paperRect = paperRef.current.getBoundingClientRect();

        const contentElement = paperRef.current
          .firstChild as HTMLElement | null;
        const contentRect = contentElement?.getBoundingClientRect();

        if (contentRect && contentRect.height > paperRect.height) {
          setFolders(Math.ceil(contentRect.height / paperRect.height));
        } else {
          setFolders(1);
        }
      }
    };

    // Initial check and listen for resize events
    handleResize();
    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Container
      style={{
        width: "100vw",
        height: `${(100 * folders) / A4_ASPECT_RATIO}vw`,
        padding: 0,
        display: "flex",
      }}
    >
      {Array.from({ length: folders }, (_, index) => (
        <Paper
          key={index}
          ref={index === 0 ? paperRef : undefined}
          sx={{
            width: "100%",
            height: `${100 / folders}%`,
            overflow: "hidden",
          }}
        >
          {children}
        </Paper>
      ))}
    </Container>
  );
};
