import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./hooks/AuthProvider";
import { ThemeProvider } from "@emotion/react";
import { themeOptions } from "./theme/theme";
import { createTheme } from "@mui/material";
import App from "./app/App";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

const theme = createTheme(themeOptions);

root.render(
    <ThemeProvider theme={theme}>
      <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
      </React.StrictMode>
    </ThemeProvider>
);
