import { useStorage } from "@context/storage/useStorage";
import {
  CssBaseline,
  type PaletteMode,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { createCustomContext } from "@utils/createCustomContext.function";
import React, { useCallback, useMemo, useState, type ReactNode } from "react";

import { darkTheme, lightTheme } from "./theme.config";

type ColorMode = PaletteMode | "auto";

interface IColorModeContext {
  toggleColorMode: () => void;
  mode: ColorMode;
}

export const [ColorModeContext, useColorMode] =
  createCustomContext<IColorModeContext>("Color Mode Context");

export const ColorModeProvider: React.FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const localStorage = useStorage();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<ColorMode>(
    localStorage.getItem("color-mode")
      ? (localStorage.getItem("color-mode")! as ColorMode)
      : "auto",
  );

  const toggleColorMode = useCallback(() => {
    setMode((prevMode: ColorMode) => {
      let newMode: ColorMode;
      switch (prevMode) {
        case "light":
          newMode = "dark";
          break;
        case "dark":
          newMode = "auto";
          break;
        default:
          newMode = "light";
      }
      localStorage.setItem("color-mode", newMode);
      return newMode;
    });
  }, [localStorage]);

  const theme = useMemo(() => {
    if (mode === "auto") {
      const autoTheme = prefersDarkMode ? "dark" : "light";
      localStorage.setItem("color-mode", "auto");

      return autoTheme === "dark" ? darkTheme : lightTheme;
    } else {
      const localMode = localStorage.getItem("color-mode");
      if (localMode && localMode !== "auto") {
        return localMode === "dark" ? darkTheme : lightTheme;
      } else {
        localStorage.setItem("color-mode", mode);
        return mode === "dark" ? darkTheme : lightTheme;
      }
    }
  }, [mode, prefersDarkMode]);

  return (
    <ColorModeContext.Provider
      value={{
        toggleColorMode,
        mode,
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
