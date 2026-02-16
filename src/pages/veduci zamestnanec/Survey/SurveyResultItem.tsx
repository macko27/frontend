import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";


type Props = {
  name: string;
  question: string;
  status: string;
  onEvaluate: () => void;
};

const SurveyResultItem: React.FC<Props> = ({
  name,
  question,
  status,
  onEvaluate,
}) => {

    const theme = useTheme();
    
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #ddd",
        borderLeft: `6px solid ${theme.palette.primary.main}`,
        borderRadius: 2,
        padding: 2,
        mb: 2,
        backgroundColor: "#fff",
        boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      {/* Názov ankety */}
      <Box sx={{ flex: 2 }}>
        <Typography fontWeight="bold">{name}</Typography>
      </Box>

      {/* Otázka */}
      <Box sx={{ flex: 3 }}>
        <Typography>{question}</Typography>
      </Box>

      {/* Stav */}
      <Box sx={{ flex: 1 }}>
        <Typography>{status}</Typography>
      </Box>

      {/* Akcia */}
      <Box sx={{ flex: 1, textAlign: "right" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onEvaluate}
        >
          Evaluácia
        </Button>
      </Box>
    </Box>
  );
};

export default SurveyResultItem;
