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

type Question = {
  id: string;
  text: string;
  answers: Answer[];
};


const CreateSurvey: React.FC = () => {
  const profile = useAuth();
  const role = profile.userProfile?.role;
  const isVeducko = role === "Vedúci zamestnanec";
  const [surveyName, setSurveyName] = useState('');
  const [surveyInfo, setSurveyInfo] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: '', answers: [{ id: '1', text: '' }] }
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
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
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
      setQuestions([...questions, { id: newId, text: '', answers: [{ id: '1', text: '' }] }]);
    };

    const removeQuestion = (questionId: string) => {
      if (questions.length > 1) setQuestions(questions.filter(q => q.id !== questionId));
    };

    const changeQuestionText = (questionId: string, text: string) => {
      setQuestions(questions.map(q => q.id === questionId ? { ...q, text } : q));
    };

    const addAnswer = (questionId: string) => {
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

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      openSnackbar("Neplatný formát dátumov", "error");
      return;
    }

    if (end < start) {
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
                          .map(a => ({ answer: a.text.trim() }))
      }));

    if (validQuestions.length === 0) {
      openSnackbar("Musíte pridať aspoň jednu otázku s odpoveďou", "error");
      return;
    }

    for (let i = 0; i < validQuestions.length; i++) {
      if (validQuestions[i].options.length === 0) {
        openSnackbar(`Otázka "${validQuestions[i].question}" musí mať aspoň jednu odpoveď`, "error");
        return;
      }
    }

    const surveyRequest = {
      name: surveyName.trim(),
      info: surveyInfo.trim(),
      status: 0,
      createdById: creator.employeeId,
      start: startDate,
      end: endDate,
      surveyType,
      recipients,
      questions: validQuestions
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
    <Layout>
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
            <input
                type="text"
                placeholder="Anketa na zistenie spokojnosti"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
                style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
                }}
            />
            </div>

            {/* info ankety */}
            <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 500 }}>
                Popis ankety <span style={{ color: 'red' }}>*</span>
            </label>
            <input
                type="text"
                placeholder="textový input (dôvod ankety)"
                value={surveyInfo}
                onChange={(e) => setSurveyInfo(e.target.value)}
                style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
                }}
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
                  onChangeQuestion={changeQuestionText}
                  onAddAnswer={addAnswer}
                  onRemoveAnswer={removeAnswer}
                  onChangeAnswer={changeAnswerText}
                  onRemoveQuestion={removeQuestion}
                />
              ))}

              <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>
                <button
                  onClick={addQuestion}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'background-color 0.2s, transform 0.1s',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#115293')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1976d2')}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  + Pridať otázku
                </button>
              </div>

            </div>

            <SurveyTypeSelector onChange={(type) => setSurveyType(type)} />


            {/* Dátumy ankety vedľa seba */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              {/* Dátum začatia ankety */}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 500 }}>
                  Dátum začatia ankety
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Dátum ukončenia ankety */}
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 500 }}>
                  Dátum ukončenia ankety
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>


            {/* Zhrnutie ankety */}
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0' }}>Zhrnutie ankety</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Celkový počet príjemcov:</span>
                <span>{recipients.length}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Počet otázok:</span>
                <span>{questions.length}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Trvanie ankety:</span>
                <span>
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
                    )
                  )} dni
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Typ ankety:</span>
                <span>{surveyType === 'anonymous' ? 'Anonymná' : 'Neanonymná'}</span>
              </div>
            </div>



            
            {/* Tlačidlá */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button
                onClick={handleCancel}
                style={{
                padding: '8px 24px',
                backgroundColor: 'white',
                color: '#1976d2',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
                }}
            >
                Zrušiť
            </button>
            <button
                onClick={handleSubmit}
                style={{
                padding: '8px 24px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
                }}
            >
                Uložiť
            </button>
            </div>
        </div>
        </div>
    </Layout>
  );
};

export default CreateSurvey;