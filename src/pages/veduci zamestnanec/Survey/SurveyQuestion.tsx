import React from "react";
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Typography } from "@mui/material";
import { Answer } from '../../../types/Survey/Answer';


export type QuestionProps = { 
  id: string; 
  text: string; 
  answers: Answer[]; 
  answerType: 'single' | 'multiple'; 
  onChangeQuestion: (id: string, text: string) => void; 
  onAddAnswer: (questionId: string) => void; 
  onRemoveAnswer: (questionId: string, answerId: string) => void; 
  onChangeAnswer: (questionId: string, answerId: string, text: string) => void; 
  onRemoveQuestion: (questionId: string) => void; 
  onChangeAnswerType: (questionId: string, type: 'single' | 'multiple') => void; 
};

const SurveyQuestion: React.FC<QuestionProps> = ({
  id,
  text,
  answers,
  answerType,
  onChangeQuestion,
  onAddAnswer,
  onRemoveAnswer,
  onChangeAnswer,
  onRemoveQuestion,
  onChangeAnswerType
}) => {

  return (
    <Box 
      sx={{
        display: 'flex', 
        flexDirection: 'column', 
        gap: 2, 
        mb: 3, 
        p: 2, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      {/* Hlavička otázky: label + select */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2">Otázka</Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id={`answer-type-label-${id}`}>Typ odpovede</InputLabel>
          <Select
            labelId={`answer-type-label-${id}`}
            value={answerType}
            label="Typ odpovede"
            onChange={(e) => onChangeAnswerType(id, e.target.value as 'single' | 'multiple')}
          >
            <MenuItem value="single">Iba jedna odpoveď</MenuItem>
            <MenuItem value="multiple">Viac odpovedí</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Otázka */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          label="Zadajte otázku"
          value={text}
          onChange={(e) => onChangeQuestion(id, e.target.value)}
          multiline
          minRows={3}
          fullWidth
          variant="outlined"
        />
        <Button
          onClick={() => onRemoveQuestion(id)}
          variant="contained"
          color="error"
          sx={{ height: 'fit-content' }}
        >
          🗑️
        </Button>
      </Box>

      {/* Odpovede */}
      {answers.map((a: Answer, index: number) => (
        <Box key={a.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography sx={{ minWidth: 100 }}>Odpoveď č. {index + 1}</Typography>
          <TextField
            value={a.text}
            onChange={(e) => onChangeAnswer(id, a.id, e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
          />
          <Button
            onClick={() => onRemoveAnswer(id, a.id)}
            disabled={answers.length <= 1}
            variant="contained"
            color="error"
            sx={{ height: 'fit-content' }}
          >
            🗑️
          </Button>
        </Box>
      ))}

      {/* Pridať odpoveď */}
      {answers.length < 6 && (
        <Button
          onClick={() => onAddAnswer(id)}
          variant="text"
          color="primary"
          sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
        >
          + Pridať odpoveď
        </Button>
      )}
    </Box>
  );
};

export default SurveyQuestion;