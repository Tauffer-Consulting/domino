// import { createTheme } from '@material-ui/core'
import { createTheme } from "@mui/material/styles";

// Theme creation: https://bareynol.github.io/mui-theme-creator/
// TODO - make this styles work
export const theme = createTheme({
  palette: {
    primary: {
      main: "#101820",
      light: "#223344",
      dark: "#070A0E",
    },
    secondary: {
      main: "#FFFFFF",
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
});

export default theme;
