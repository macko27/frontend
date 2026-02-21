import { DialogContent, Divider } from "@mui/material";
import QuestionResult from "./QuestionResult";

interface SurveyResultProps {
  survey: any;
}

const SurveyResultNeanonymGraphs: React.FC<SurveyResultProps> = ({ survey }) => {
  const totalQuestions = survey?.questions?.length || 0;

  return (
    <DialogContent sx={{ pt: 2 }}>
      {survey?.questions?.map((q: any, index: number) => (
        <div key={q.id}>
          <QuestionResult question={q} index={index} />

          {/* Divider cez celý DialogContent, okrem poslednej otázky */}
          {index < totalQuestions - 1 && (
            <Divider
              sx={{
                width: "calc(100% + 32px)", // presah paddingu DialogContent
                marginLeft: "-16px",
                marginRight: "-16px",
                mt: 3,
                mb: 3,
                borderColor: "grey.400",
              }}
            />
          )}
        </div>
      ))}
    </DialogContent>
  );
};

export default SurveyResultNeanonymGraphs;