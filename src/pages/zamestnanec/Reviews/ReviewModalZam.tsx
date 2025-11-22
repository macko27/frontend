import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box, TextField, Button, Stack } from "@mui/material";
import { Goal } from "./UpdateReviewZam";
import api from "../../../app/api";
import { useAuth } from "../../../hooks/AuthProvider";
import { useSnackbar } from "../../../hooks/SnackBarContext";

type ReviewModalProps = {
  open: boolean;
  onClose: () => void;
  employeeGoals: Goal[];
  selectedGoal: Goal | null;
  selectedEmployee: any | null;
  setSelectedGoal: React.Dispatch<React.SetStateAction<Goal | null>>;
  reviewData: any;
  onSave: (employeeRecDescription: string) => void;
  onSaveQuestion: (employeeQuestionDescription: string) => void;
};

const ReviewModalZam: React.FC<ReviewModalProps> = ({ open, onClose, employeeGoals, selectedGoal, selectedEmployee, setSelectedGoal, reviewData, onSave, onSaveQuestion }) => {

  const { userProfile, setUserProfile, setRefresh, refresh } = useAuth();
  const [showQuestions, setShowQuestions] = useState(false);
  const {openSnackbar} = useSnackbar();

  const handleToggleQuestions = () => {
    setShowQuestions(!showQuestions);
  };
  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
  };

  const handleEmployeeDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedGoal) {
      setSelectedGoal({
        ...selectedGoal,
        employeeRecDescription: e.target.value,
      });
    }
  };

  const handleEmployeeQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedGoal) {
        setSelectedGoal({
          ...selectedGoal,
          employeeQuestionDescription: e.target.value,
        });
      }
    };

  const handleSend = async () => {
    if (!selectedGoal || !selectedGoal.goalId || !selectedEmployee) {
      console.error("Missing required data");
      return;
    }
  
    try {
      const response = await api.put(`/Review/SendDescription/${userProfile?.id}/${reviewData.id}/${selectedGoal.goalId}/${selectedEmployee.id}`, {
        employeeDescription: selectedGoal?.employeeRecDescription || "",
        superiorDescription: selectedGoal?.superiorRecDescription || "",
        employeeQuestion: selectedGoal?.employeeQuestionDescription || "",
        superiorQuestion: selectedGoal?.superiorQuestionDescription || ""
      });
  
      console.log("Description sent successfully:", response.data);
      openSnackbar("Posudok úspešne odoslaný!", "success");
      onClose();
      setRefresh(!refresh);
    } catch (error) {
      console.error("Error sending description:", error);
    }
  };
  

  const handleSave = async () => {
    if (!selectedGoal || !selectedGoal.goalId) {
      console.error("No goal selected");
      return;
    }
  
    try {
      const response = await api.put(`/Review/UpdateDescription/${userProfile?.id}/${reviewData.id}/${selectedGoal.goalId}/${selectedEmployee.id}`, {
          employeeDescription: selectedGoal?.employeeRecDescription || "",
          superiorDescription: selectedGoal?.superiorRecDescription || "",
          employeeQuestion: selectedGoal?.employeeQuestionDescription || "",
          superiorQuestion: selectedGoal?.superiorQuestionDescription || "",
      });
  
      console.log("Description updated successfully:", response.data);
      openSnackbar("Posudok úspešne uložený!", "success");
      onClose();
      setRefresh(!refresh);
    } catch (error) {
      console.error("Error updating description:", error);
    }
  };
  

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {reviewData?.reviewName} - {selectedEmployee?.name || "Vybraný zamestnanec"}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1"  sx={{ mb: 2 }}>
          Zadávateľ: {reviewData?.superiorName}
        </Typography>

        <Typography variant="body1"  sx={{ display: 'inline' }}>
          Posudzovaný cieľ: 
        </Typography>

        {employeeGoals.length ? (
          <Typography variant="body1" sx={{ display: 'inline', ml: 1 }}>
            {employeeGoals.map((goal, index) => (
              <span
                key={goal.goalId}
                onClick={() => handleGoalClick(goal)}
                style={{
                  cursor: 'pointer',
                  color: selectedGoal === goal ? '#000000' : '#B0BEC5',
                  textDecoration: 'underline',
                  marginRight: index < employeeGoals.length - 1 ? 8 : 0,
                }}
              >
                {goal.goalName}, 
              </span>
            ))}
          </Typography>
        ) : (
          <Typography variant="body1" sx={{ display: 'inline', ml: 1 }}>
            Žiadne ciele nie sú priradené tomuto zamestnancovi.
          </Typography>
        )}

        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#ffffff',
              color: '#000000',
              '&:hover': { backgroundColor: '#0097A7' },
              '&:active': { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', transform: 'translateY(2px)' },
              marginRight: 2,
            }}
            onClick={() => setShowQuestions(false)}
          >
            Posudzovany Ciel
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#ffffff',
              color: '#000000',
              '&:hover': { backgroundColor: '#0097A7' },
              '&:active': { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', transform: 'translateY(2px)' },
            }}
            onClick={handleToggleQuestions}
          >
            Dodatocne Otazky
          </Button>
        </Box>
        {!showQuestions ? (<Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
          Poprosím o vyjadrenie k položke: {reviewData?.goals?.[0]}
        </Typography>) : (<Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
          Dodatočné otázky k položke: {reviewData?.goals?.[0]}
        </Typography>)}

        {!showQuestions ? (
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Vyjadrenie zamestnanca"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              placeholder="Tu môžeš zadať text"
              value={selectedGoal?.employeeRecDescription || ""}
              sx={{ mb: 2 }}
              onChange={handleEmployeeDescriptionChange}
            />
            <TextField
              label="Vyjadrenie vedúceho zamestnanca"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              placeholder="Nemožné vyplniť, len pre vedúceho zamestnanca"
              value={selectedGoal?.superiorRecDescription || ""}
              sx={{ mb: 2 }}
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Otázky vedúceho zamestnanca"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              placeholder="Nemožné vyplniť, len pre vedúceho zamestnanca"
              value={selectedGoal?.superiorQuestionDescription || ""}
              sx={{ mb: 2 }}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Odpovede zamestnanca"
              variant="outlined"
              fullWidth
              multiline
              rows={4} 
              placeholder="Tu môžeš zadať text"
              value={selectedGoal?.employeeQuestionDescription || ""}
              sx={{ mb: 2 }}
              onChange={handleEmployeeQuestionChange}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "auto" }}>
        <Stack direction="row" gap={3}>
        <Button
          variant="contained"
          type="submit"
          sx={{
            backgroundColor: '#D2691E',
            '&:hover': { backgroundColor: '#FB8C00' },
            color: 'white',
            padding: '8px 16px',
          }}
          onClick={handleSend}
        >
          Odoslať
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ backgroundColor: '#008B8B', '&:hover': { backgroundColor: '#0097A7' }, color: 'white', padding: '8px 16px' }}
        >
          Uložiť
        </Button>                                                
        
          <Button variant="contained" onClick={onClose}
              sx={{ backgroundColor: '#B0BEC5', '&:hover': { backgroundColor: '#90A4AE' }, color: 'white', padding: '8px 16px',}}
            >
              Zrušiť
          </Button>            
          </Stack>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModalZam;
