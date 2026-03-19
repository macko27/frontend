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
  LinearProgress,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import SurveyResultAnonymGraphs from "./SurveyResultAnonymGraphs";
import SurveyResultNeanonymGraphs from "./SurveyResultNeanonymGraphs";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

type SurveyResult = {
  id: string;
  name: string;
  info: string | null;
  surveyType: string;
  start: string;
  end: string;
  totalRecipientCount: number;
  recipeintsSubmittedVoteCount: number;

  questions: {
    id: string;
    question: string;
    options: {
      id: string;
      answer: string;
      answerType: string;
      votes: number; // 👈 backend musí poslať počet hlasov
      voters: {
        userId: string;
        fullName: string;
      }
    }[];
  }[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  survey: SurveyResult | null;
};

{/* Dialog pre zobrazenie vysledkov ankety*/}
{/* SurveyResultAnonymGraphs - komponent pre zobrazenie anonymnych vysledkov*/}
{/* SurveyResultNeanonymGraphs - komponent pre zobrazenie neanonymnych vysledkov*/}
const SurveyResultDialog: React.FC<Props> = ({ open, onClose, survey }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showInfo, setShowInfo] = useState(false);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";

    // dayjs interpretuje dátum ako UTC a potom ho konvertuje do lokálneho času používateľa
    return dayjs.utc(dateStr).local().format('DD.MM.YYYY HH:mm');
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
        Výsledky ankety: {survey?.name}

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
        <Box sx={{ mb: 1 }}>
            <Button
              size="small"
              onClick={() => setShowInfo(!showInfo)}
              sx={{ textTransform: "none", padding: 0 }}
            >
              {showInfo ? "Skryť popis" : "Zobraziť popis ankety"}
            </Button>

            <Collapse in={showInfo}>
              <Typography sx={{ mt: 1, color: theme.palette.text.primary }}>
                {survey?.info ?? "Bez popisu"}
              </Typography>
            </Collapse>
          </Box>

        {/* Typ ankety */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight="light" sx={{ color: (theme) => theme.palette.text.secondary }}>
            Typ ankety
            </Typography>

            <Typography>
            {survey?.surveyType === "anonymous" ? "anonymná" : "neanonymná"}
            </Typography>
        </Box>

        {/* Celkový počet príjemcov */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight="light" sx={{ color: (theme) => theme.palette.text.secondary }}>
            Celkový počet príjemcov
            </Typography>

            <Typography>
            {survey?.totalRecipientCount}
            </Typography>
        </Box>

        {/* Celkový počet hlasujúcich */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight="light" sx={{ color: (theme) => theme.palette.text.secondary }}>
            Celkový počet hlasujúcich
            </Typography>

            <Typography>
            {survey?.recipeintsSubmittedVoteCount}
            </Typography>
        </Box>

    </Box>


    {/* Výsledky */}
    <DialogContent sx={{ pt: 2 }}>
      {survey?.surveyType === "anonymous" ? (
        <SurveyResultAnonymGraphs survey={survey} />
      ) : (
        <SurveyResultNeanonymGraphs survey={survey} />
      )}
    </DialogContent>



      {/* Dátumy */}
      <Box sx={{ px: 3, my: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography fontWeight="light" sx={{ color: (theme) => theme.palette.text.secondary }}>
            Dátum začiatku ankety
          </Typography>
          <Typography>{formatDateTime(survey?.start)}</Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontWeight="light" sx={{ color: (theme) => theme.palette.text.secondary }}>
            Dátum ukončenia ankety
          </Typography>
          <Typography>{formatDateTime(survey?.end)}</Typography>
        </Box>
      </Box>

      {/* Akcie */}
      <DialogActions sx={{ p: 3 }}>
        <Button variant="contained" onClick={onClose}>
          Zavrieť
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SurveyResultDialog;
