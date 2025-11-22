import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from '../../../hooks/SnackBarContext';
import api from "../../../app/api";
import { EmployeeCard } from "../../../types/EmployeeCard";

type Answer = {
  id: string;
  text: string;
};

const CreateSurvey: React.FC = () => {
  const [surveyName, setSurveyName] = useState('');
  const [surveyInfo, setSurveyInfo] = useState('');
  const [question, setQuestion] = useState('');
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
  const [creator, setCreator] = useState<EmployeeCard | null>(null);
  const { openSnackbar } = useSnackbar();
  const nav = useNavigate();

  useEffect(() => {
    api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
        .then(res => setCreator(res.data))
        .catch(err => console.error(err));
    }, []);


  const addAnswer = () => {
    const newId = (Math.max(...answers.map(a => parseInt(a.id))) + 1).toString();
    setAnswers([...answers, { id: newId, text: '' }]);
  };

  const removeAnswer = (id: string) => {
    if (answers.length > 1) {
      setAnswers(answers.filter(a => a.id !== id));
    }
  };

  const updateAnswer = (id: string, text: string) => {
    setAnswers(answers.map(a => a.id === id ? { ...a, text } : a));
  };

  const handleSubmit = async () => {
    console.log(creator)
    // Validácia
    if (!creator) {
        openSnackbar("Nepodarilo sa získať prihláseného používateľa", "error");
        return;
    }

    if (!surveyName.trim() || !question.trim() || !surveyInfo.trim()) {
      openSnackbar("Vyplňte všetky povinné polia", "error");
      return;
    }


    const surveyRequest = {
      name: surveyName,
      question,
      info: surveyInfo,
      status: 0,
      createdById: creator.employeeId,
      end: endDate,
      options: answers.map(a => ({ answer: a.text })),
    };

    console.log(JSON.stringify(surveyRequest))

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
    // Návrat späť na zoznam ankiet
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

            {/* Otázka ankety */}
            <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 500 }}>
                Otázka ankety <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
                placeholder="textový Text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
                style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
                }}
            />
            </div>

            {/* Odpovede - len ak je výber z odpovedí */}
            <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 500 }}>
                Odpovede v ankete (max 6 odpovedi) <span style={{ color: 'red' }}>*</span>
                </label>
                
                {answers.map((answer, index) => (
                <div 
                    key={answer.id} 
                    style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}
                >
                    <span style={{ minWidth: '90px', fontSize: '14px' }}>
                    Odpoveď č. {index + 1}
                    </span>
                    <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => updateAnswer(answer.id, e.target.value)}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                    }}
                    />
                    <button
                    onClick={() => removeAnswer(answer.id)}
                    disabled={answers.length <= 1}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: answers.length <= 1 ? '#ccc' : '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: answers.length <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                    }}
                    >
                    🗑️
                    </button>
                </div>
                ))}

                {answers.length < 6 && (
                <button 
                    onClick={addAnswer}
                    style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    color: '#1976d2',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                    }}
                >
                    + Pridať odpoveď
                </button>
                )}
            </div>


            {/* Dátum ukončenia ankety */}
            <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 500 }}>
                Dátum ukončenia ankety
            </label>
            <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                width: '200px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
                }}
            />
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