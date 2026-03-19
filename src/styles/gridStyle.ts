import { Theme, SxProps } from "@mui/material/styles";

export const dataGridStyles = (theme: Theme): SxProps<Theme> => ({
  "& .archived-row": {
    backgroundColor: theme.palette.mode === "light" ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 0, 0, 0.3)",
    "&:hover": {
      backgroundColor: theme.palette.mode === "light" ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 0, 0, 0.5)",
    },
  },

  "& .notReaded-row": {
    backgroundColor: theme.palette.mode === "light" ? "rgba(169, 169, 169, 0.5)" : "rgba(100, 100, 100, 0.5)",
    "&:hover": {
      backgroundColor: theme.palette.mode === "light" ? "rgba(169, 169, 169, 0.7)" : "rgba(100, 100, 100, 0.7)",
    },
  },

  "& .MuiDataGrid-cell": {
    borderRight: `2px solid ${theme.palette.divider}`,  
    color: theme.palette.text.primary,
  },

  "& .header": {
    fontWeight: "bold",
    fontSize: 18,
    backgroundColor: theme.palette.mode === "light" ? "#FFD6B8" : "#FFD6B8",
    color: theme.palette.mode === "light" ? theme.palette.text.primary : "black",
  },

  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontWeight: "bold",
  },

  "& .MuiDataGrid-footerContainer": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
});