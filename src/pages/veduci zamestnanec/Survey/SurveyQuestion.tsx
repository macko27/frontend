import React, { useState } from "react";

type Answer = {
  id: string;
  text: string;
};

export type QuestionProps = {
  id: string;
  text: string;
  answers: Answer[];
  onChangeQuestion: (id: string, text: string) => void;
  onAddAnswer: (questionId: string) => void;
  onRemoveAnswer: (questionId: string, answerId: string) => void;
  onChangeAnswer: (questionId: string, answerId: string, text: string) => void;
  onRemoveQuestion: (questionId: string) => void;
};

const SurveyQuestion: React.FC<QuestionProps> = ({
  id,
  text,
  answers,
  onChangeQuestion,
  onAddAnswer,
  onRemoveAnswer,
  onChangeAnswer,
  onRemoveQuestion
}) => {

  return (
    <div style={{ marginBottom: '24px', border: '1px solid #ddd', padding: '12px', borderRadius: '4px' }}>
      {/* Otázka */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <textarea
          placeholder="Zadajte otázku"
          value={text}
          onChange={(e) => onChangeQuestion(id, e.target.value)}
          rows={2}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
        <button
          onClick={() => onRemoveQuestion(id)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🗑️
        </button>
      </div>

      {/* Odpovede */}
      {answers.map((a, index) => (
        <div key={a.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
          <span style={{ minWidth: '90px', fontSize: '14px' }}>Odpoveď č. {index + 1}</span>
          <input
            type="text"
            value={a.text}
            onChange={(e) => onChangeAnswer(id, a.id, e.target.value)}
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
            onClick={() => onRemoveAnswer(id, a.id)}
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

      {/* Pridať odpoveď */}
      {answers.length < 6 && (
        <button
          onClick={() => onAddAnswer(id)}
          style={{
            marginTop: '4px',
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
  );
};

export default SurveyQuestion;
