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
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        border: "1px solid #ddd",
        borderLeft: `6px solid ${theme.palette.primary.main}`,
        borderRadius: 2,
        padding: 2,
        mb: 2,
        paddingY: 1.5,
        backgroundColor: "#fff",
        boxShadow: "0px 2px 6px rgba(0,0,0,0.05)",
      }}
    >
      {/* Názov ankety */}
      <Box sx={{ flex: 2 }}>
        <Typography 
            fontWeight="bold" 
            fontSize="0.87rem"
        > {name}</Typography>
      </Box>

      {/* Otázka */}
      <Box sx={{ flex: 3 }}>
        <Typography 
            fontSize="0.87rem"
            > {question.length > 100 ? `${question.slice(0, 100)}…` : question}
        </Typography>
      </Box>

      {/* Stav */}
      <Box sx={{ flex: 1 }}>
        <Typography fontSize="0.87rem">{status}</Typography>
      </Box>

      {/* Akcia */}
      <Box sx={{ flex: 1, textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={onEvaluate}
        >
          Evaluácia
        </Button>
      </Box>
    </Box>
  );
};

export default SurveyResultItem;
