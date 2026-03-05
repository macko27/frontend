import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from '../../../hooks/SnackBarContext';
import api from "../../../app/api";
import { EmployeeCard } from "../../../types/EmployeeCard";
import RecipientsSelector from "../../veduci zamestnanec/Survey/RecipientsSelector";
import { Recipient } from "../../../types/Survey/Recipient";
import { Answer } from "../../../types/Survey/Answer";
import { QuestionProps } from "../../../types/Survey/QuestionProps";
import SurveyQuestion from "./SurveyQuestion";
import SurveyTypeSelector from "./SurveyTypeSelector";
import { useAuth } from "../../../hooks/AuthProvider";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

type Question = {
  id: string;
  text: string;
  answers: Answer[];
  answerType: 'single' | 'multiple';
};


const CreateSurvey: React.FC = () => {
  const profile = useAuth();
  const role = profile.userProfile?.role;
  const isVeducko = role === "Vedúci zamestnanec";
  const [surveyName, setSurveyName] = useState('');
  const [surveyInfo, setSurveyInfo] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: '', answers: [{ id: '1', text: '' }], answerType: 'single' }
  ]);
  const [answers, setAnswers] = useState<Answer[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
    { id: '3', text: '' },
  ]);
  const [answerFormat, setAnswerFormat] = useState('1_of_5');
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [creator, setCreator] = useState<EmployeeCard | null>(null);
  const { openSnackbar } = useSnackbar();
  const nav = useNavigate();

  const [recipients, setRecipients] = useState<Recipient[]>([]);

  const [surveyType, setSurveyType] = useState<'anonymous' | 'non-anonymous'>('anonymous');


  useEffect(() => {
    api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
        .then(res => setCreator(res.data))
        .catch(err => console.error(err));
    }, []);


  
    const addQuestion = () => {
      const newId = (Math.max(...questions.map(q => parseInt(q.id))) + 1).toString();
      setQuestions([...questions, { id: newId, text: '', answers: [{ id: '1', text: '' }], answerType: 'single' }]);
    };

    const removeQuestion = (questionId: string) => {
      if (questions.length > 1) setQuestions(questions.filter(q => q.id !== questionId));
    };

    const changeQuestionText = (questionId: string, text: string) => {
      setQuestions(questions.map(q => q.id === questionId ? { ...q, text } : q));
    };

    const addAnswer = (questionId: string) => {
      if (questions.length >= 10) return;

      setQuestions(questions.map(q => {
        if (q.id === questionId && q.answers.length < 6) {
          const newId = (Math.max(...q.answers.map(a => parseInt(a.id))) + 1).toString();
          return { ...q, answers: [...q.answers, { id: newId, text: '' }] };
        }
        return q;
      }));
    };

    const removeAnswer = (questionId: string, answerId: string) => {
      setQuestions(questions.map(q => {
        if (q.id === questionId && q.answers.length > 1) {
          return { ...q, answers: q.answers.filter(a => a.id !== answerId) };
        }
        return q;
      }));
    };

    const changeAnswerText = (questionId: string, answerId: string, text: string) => {
      setQuestions(questions.map(q => {
        if (q.id === questionId) {
          return { ...q, answers: q.answers.map(a => a.id === answerId ? { ...a, text } : a) };
        }
        return q;
      }));
    };

    const changeAnswerType = (questionId: string, type: 'single' | 'multiple') => {
      setQuestions(questions.map(q => q.id === questionId ? { ...q, answerType: type } : q));
    };


  const handleSubmit = async () => {
    // Validácia
    if (!creator) {
        openSnackbar("Nepodarilo sa získať prihláseného používateľa", "error");
        return;
    }

    if (!surveyName.trim()) {
      openSnackbar("Názov ankety je povinný", "error");
      return;
    }
    if (!surveyInfo.trim()) {
      openSnackbar("Popis ankety je povinný", "error");
      return;
    }

    if (!startDate || !endDate) {
      openSnackbar("Nesprávne alebo zle vyplnené dátumy", "error");
      return;
    }

    if (!startDate?.isValid() || !endDate?.isValid()) {
      openSnackbar("Neplatný formát dátumov", "error");
      return;
    }

    if (startDate.isBefore(dayjs(), 'minute')) {
      openSnackbar("Dátum začiatku ankety nemôže byť v minulosti", "error");
      return;
    }

    if (endDate.isBefore(startDate)) {
      openSnackbar("Dátum ukončenia musí byť po dátume začiatku", "error");
      return;
    }

    if (!recipients || recipients.length === 0) {
      openSnackbar("Musíte vybrať aspoň jedného príjemcu", "error");
      return;
    }

    const validQuestions = questions
      .filter(q => q.text.trim() !== '')
      .map(q => ({
        question: q.text.trim(),
        options: q.answers.filter(a => a.text.trim() !== '')
                          .map(a => ({ answer: a.text.trim() })),
                          answerType: q.answerType
      }));

    if (validQuestions.length === 0) {
      openSnackbar("Musíte pridať aspoň jednu otázku s odpoveďou", "error");
      return;
    }

    for (let i = 0; i < validQuestions.length; i++) {
      const optionsCount = validQuestions[i].options.length;
      if (optionsCount < 2) {
        openSnackbar(`Otázka "${validQuestions[i].question}" musí mať aspoň 2 odpovede`, "error");
        return;
      }
      if (optionsCount > 6) {
        openSnackbar(`Otázka "${validQuestions[i].question}" môže mať maximálne 6 odpovedí`, "error");
        return;
      }
    }

    if (validQuestions.length > 10) {
      openSnackbar("Anketa môže obsahovať maximálne 10 otázok", "error");
      return;
    }

    const surveyRequest = {
      name: surveyName.trim(),
      info: surveyInfo.trim(),
      status: 0,
      createdById: creator.employeeId,
      start: startDate?.toDate().toISOString(),
      end: endDate?.toDate().toISOString(),
      surveyType,
      recipients,
      questions: validQuestions,
    };

    //console.log(JSON.stringify(surveyRequest))

    try {
      const response = await api.post("/Survey/Create", surveyRequest);
      openSnackbar("Anketa bola úspešne vytvorená", "success");
      nav('/manageSurveys');
    } catch (err) {
      console.error(err);
      openSnackbar("Chyba pri ukladaní ankety", "error");
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <Layout fullWidth>
        <div style={{ padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Notification */}
        {notification.show && (
            <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1000,
            }}>
            {notification.message}
            <button 
                onClick={() => setNotification({...notification, show: false})}
                style={{
                marginLeft: '16px',
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px'
                }}
            >×</button>
            </div>
        )}

        <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            Nová anketa
            </h1>
        </div>

        <div style={{ maxWidth: '800px' }}>
            {/* Názov ankety */}
            <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 500 }}>
                Názov ankety <span style={{ color: 'red' }}>*</span>
            </label>
            <TextField
                placeholder="Anketa na zistenie spokojnosti"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
                fullWidth
                required
                variant="outlined"
            />
            </div>

            {/* info ankety */}
            <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 500 }}>
                Popis ankety <span style={{ color: 'red' }}>*</span>
            </label>
            <TextField
                label="Popis ankety"
                placeholder="textový input (dôvod ankety)"
                value={surveyInfo}
                onChange={(e) => setSurveyInfo(e.target.value)}
                fullWidth
                required
                variant="outlined"
            />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <RecipientsSelector selected={recipients} setSelected={setRecipients} />
            </div>


            {/* Otázka ankety */}
            <div>
              {questions.map(q => (
                <SurveyQuestion
                  key={q.id}
                  id={q.id}
                  text={q.text}
                  answers={q.answers}
                  answerType={q.answerType}
                  onChangeQuestion={changeQuestionText}
                  onAddAnswer={addAnswer}
                  onRemoveAnswer={removeAnswer}
                  onChangeAnswer={changeAnswerText}
                  onRemoveQuestion={removeQuestion}
                  onChangeAnswerType={changeAnswerType}
                />
              ))}


              <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '22px' }}>
                <Button
                  onClick={addQuestion}
                  variant="contained"
                  color="info" // využíva MUI tému
                  sx={{
                    padding: '5px 15px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    boxShadow: 2,
                    textTransform: 'none', // zruší veľké písmená
                    transition: 'transform 0.1s',
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  + Pridať otázku
                </Button>
              </div>


            </div>

            <SurveyTypeSelector onChange={(type) => setSurveyType(type)} />


            {/* Dátumy ankety vedľa seba */}
            <Box
              sx={{
                display: 'flex',
                gap: 2, // medzera medzi dátumami
                mb: 3,  // margin-bottom
                flexDirection: { xs: 'column', sm: 'row' }, // xs = mobil → pod sebou, sm+ → vedľa seba
              }}
            >
              {/* Dátum začatia ankety */}
              <Box sx={{ flex: 1 }}>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Dátum začatia ankety"
                    value={dayjs(startDate)}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: { fullWidth: true }
                    }}
                  />
                </LocalizationProvider>

              </Box>

              {/* Dátum ukončenia ankety */}
              <Box sx={{ flex: 1 }}>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Dátum ukončenia ankety"
                    value={dayjs(endDate)}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: { fullWidth: true }
                    }}
                  />
                </LocalizationProvider>

              </Box>
            </Box>



             {/* Zhrnutie ankety */}
              <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, mb: 3, bgcolor: 'background.paper', boxShadow: 1 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Zhrnutie ankety</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Celkový počet príjemcov:</Typography>
                  <Typography>{recipients.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Počet otázok:</Typography>
                  <Typography>{questions.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Trvanie ankety:</Typography>
                  <Typography>
                    {startDate && endDate ? Math.max(0, endDate.startOf('day').diff(startDate.startOf('day'), 'day') + 1) : 0} dni
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Typ ankety:</Typography>
                  <Typography>{surveyType === 'anonymous' ? 'Anonymná' : 'Neanonymná'}</Typography>
                </Box>
              </Box>

            
            {/* Tlačidlá */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ marginTop: '32px' }}>
              <Button
                onClick={handleCancel}
                variant="outlined"
                color="info"
                sx={{
                  padding: '5px 20px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'none', // zruší veľké písmená
                }}
              >
                Zrušiť
              </Button>

              <Button
                onClick={handleSubmit}
                variant="contained"
                color="info"
                sx={{
                  padding: '8px 24px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                Uložiť
              </Button>
            </Stack>
        </div>
        </div>
    </Layout>
  );
};

export default CreateSurvey;