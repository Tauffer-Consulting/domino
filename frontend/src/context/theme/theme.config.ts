import { createTheme } from "@mui/material/styles";

// Theme creation: https://zenoo.github.io/mui-theme-creator/
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#101820",
      light: "#223344",
      dark: "#070A0E",
    },
    secondary: {
      main: "#00B140",
      light: "#00E052",
      dark: "#008F34",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F1F5F8",
    },
    success: {
      main: "#00B140",
      light: "#00E052",
      dark: "#008F34",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#E71D1D",
      light: "#C03335",
      dark: "#7B0002",
    },
    warning: {
      main: "#F90",
      light: "#FFAD33",
      dark: "#B26B00",
    },
  },
  typography: {
    fontFamily: "Rethink-Sans",
    h1: {
      fontSize: 30,
      marginLeft: 30,
    },
    h2: {
      fontSize: 25,
    },
    h3: {
      fontSize: 20,
    },
    button: {
      textTransform: "capitalize",
    },
  },
  components: {
    MuiCheckbox: {
      defaultProps: {
        color: "secondary",
      },
    },
    MuiTextField: {
      defaultProps: {
        color: "secondary",
      },
    },
    MuiSelect: {
      defaultProps: {
        color: "secondary",
      },
      styleOverrides: {
        root: {
          "&.MuiDisabled": "secondary.dark",
        },
      },
    },
    MuiInputLabel: {
      defaultProps: {
        color: "secondary",
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    secondary: {
      main: "#283D52",
      light: "#6088B0",
      dark: "#1B2937",
      contrastText: "#FFFFFF",
    },
    primary: {
      main: "#00B140",
      light: "#00E052",
      dark: "#008F34",
      contrastText: "#070A0E",
    },
    background: {
      default: "#070A0E",
      paper: "#101820",
    },
    success: {
      main: "#00B140",
      light: "#00E052",
      dark: "#008F34",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#E71D1D",
      light: "#C03335",
      dark: "#7B0002",
    },
    warning: {
      main: "#F90",
      light: "#FFAD33",
      dark: "#B26B00",
    },
  },
  typography: {
    fontFamily: "Rethink-Sans",
    h1: {
      fontSize: 30,
      marginLeft: 30,
    },
    h2: {
      fontSize: 25,
    },
    h3: {
      fontSize: 20,
    },
    button: {
      textTransform: "capitalize",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        color: "secondary",
      },
    },
  },
});
