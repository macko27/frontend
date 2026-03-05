import { ThemeOptions } from '@mui/material/styles';

//export const themeOptions: ThemeOptions = {
//  palette: {
//    mode: 'light',
//    primary: {
//      main: '#ba4400',
//    },
//    secondary: {
//      main: '#dedede',
//    },
//    info: {
//      main: '#008B8B',
//    },
//  },
//};

declare module "@mui/material/styles" {
  interface Palette {
    drawerBg: string;
  }
  interface PaletteOptions {
    drawerBg?: string;
  }
}


export const themeOptions = (mode: "light" | "dark"): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: "#ba4400",
    },
    secondary: {
      main: mode === "light" ? "#dedede" : "#444444",
    },
    info: {
      main: "#008B8B",
    },
    background: {
      default: mode === "light" ? "#f4f6f8" : "#121212",
      paper: mode === "light" ? "#ffffff" : "#1e1e1e",
    },
    drawerBg: mode === "light" ? "#FFD6B8" : "#FFD6B8",
  }
});

