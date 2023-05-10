//import { createTheme } from '@material-ui/core'
import { createTheme } from '@mui/material/styles';

// Theme creation: https://bareynol.github.io/mui-theme-creator/
// TODO - make this styles work
export const theme = createTheme({
  palette: {
    //type: 'light',
    primary: {
      main: '#323c3d'
    },
    secondary: {
      main: '#f50057'
    },
    background: {
      default: '#f1f3f3'
    }
  },
  typography: {
    h1: {
      fontSize: 30,
      marginLeft: 30
    },
    h2: {
      fontSize: 25
    },
    h3: {
      fontSize: 20
    },
    // h4: {
    //   fontSize: 15
    // },
    // h5: {
    //   fontSize: 10
    // }
  }
})

export default theme
