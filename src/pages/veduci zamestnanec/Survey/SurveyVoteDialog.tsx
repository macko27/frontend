import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Box,
  Collapse,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

type Props = {
  open: boolean;
  onClose: () => void;
  survey: any; // zatiaľ any, neskôr dáme ShowSurvey
};

const SurveyVoteDialog: React.FC<Props> = ({ open, onClose, survey }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showInfo, setShowInfo] = useState(false);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("sk-SK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      {/* Nadpis */}
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {survey?.name}

        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          ✕
        </IconButton>
      </DialogTitle>

      {/* Popis + typ ankety */}
      <Box sx={{ px: 3, mb: 2 }}>
        {/* Popis ankety */}
        {isMobile ? (
          <Box sx={{ mb: 1 }}>
            <Button
              size="small"
              onClick={() => setShowInfo(!showInfo)}
              sx={{ textTransform: "none", padding: 0 }}
            >
              {showInfo ? "Skryť popis" : "Zobraziť popis ankety"}
            </Button>

            <Collapse in={showInfo}>
              <Typography sx={{ mt: 1, color: "#444" }}>
                {survey?.info ?? "Bez popisu"}
              </Typography>
            </Collapse>
          </Box>
        ) : (
          <Box sx={{ mb: 1 }}>
            <Typography fontWeight="light" sx={{ color: "#888" }}>
              Popis ankety
            </Typography>

            <Typography sx={{ mt: 0.5 }}>
              {survey?.info ?? "Bez popisu"}
            </Typography>
          </Box>
        )}

        {/* Typ ankety */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontWeight="light" sx={{ color: "#888" }}>
            Typ ankety
          </Typography>

          <Typography>
            {survey?.type === "anonymous" ? "anonymná" : "neanonymná"}
          </Typography>
        </Box>
      </Box>

      {/* Obsah dialógu – zatiaľ prázdny */}
      <DialogContent sx={{ pt: 2 }}>
        <Typography sx={{ color: "#888", textAlign: "center", mt: 3 }}>
          Otázky a odpovede budú doplnené neskôr...
        </Typography>
      </DialogContent>

      {/* Dátumy */}
      <Box sx={{ px: 3, my: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography fontWeight="light" sx={{ color: "#888" }}>
            Dátum začiatku ankety
          </Typography>
          <Typography>{formatDateTime(survey?.start)}</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontWeight="light" sx={{ color: "#888" }}>
            Dátum ukončenia ankety
          </Typography>
          <Typography>{formatDateTime(survey?.end)}</Typography>
        </Box>
      </Box>

      {/* Akcie */}
      <DialogActions sx={{ p: 3 }}>
        <Button variant="contained" disabled>
          Uložiť
        </Button>

        <Button
          onClick={onClose}
          sx={{
            backgroundColor: "#888",
            color: "#fff",
            "&:hover": { backgroundColor: "#777" },
          }}
        >
          Zrušiť
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyVoteDialog;
