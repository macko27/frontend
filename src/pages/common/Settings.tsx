import { Box, Switch, Typography } from "@mui/material";
import Layout from "../../components/Layout";

type SettingsProps = {
  toggleTheme: () => void;
  mode: "light" | "dark";
};

const Settings: React.FC<SettingsProps> = ({ toggleTheme, mode }) => {

  return (
    <Layout>
      <Box
        sx={{
          padding: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 2
        }}
      >
        <Typography variant="h6">
          Nastavenia
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography>Dark mode</Typography>

          <Switch
            checked={mode === "dark"}
            onChange={toggleTheme}
          />
        </Box>

      </Box>
    </Layout>
  );
};

export default Settings;