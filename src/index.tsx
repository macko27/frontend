import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./hooks/AuthProvider";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./app/App";
import { themeOptions } from "./theme/theme";
import { CartProvider } from "./pages/shop admin/Cart/CartContext";

const AppWithTheme: React.FC = () => {
  const [mode, setMode] = React.useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" || saved === "dark" ? saved : "light";
  });

  React.useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = React.useMemo(() => createTheme(themeOptions(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <App toggleTheme={toggleTheme} mode={mode}/>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppWithTheme />
  </React.StrictMode>
);