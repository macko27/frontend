import React, { useState } from "react";

const SurveyTypeSelector: React.FC<{ onChange: (type: 'anonymous' | 'non-anonymous') => void }> = ({ onChange }) => {
  const [selectedType, setSelectedType] = useState<'anonymous' | 'non-anonymous'>('anonymous');

  const handleSelect = (type: 'anonymous' | 'non-anonymous') => {
    setSelectedType(type);
    onChange(type);
  };

  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
      <button
        onClick={() => handleSelect('anonymous')}
        style={{
          flex: 1,
          padding: '10px 20px',
          borderRadius: '8px',
          border: selectedType === 'anonymous' ? '2px solid #ff9800' : '1px solid #ccc',
          backgroundColor: selectedType === 'anonymous' ? '#fff3e0' : 'white',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '14px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ffe0b2')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = selectedType === 'anonymous' ? '#fff3e0' : 'white')}
      >
        Anonymná
      </button>

      <button
        onClick={() => handleSelect('non-anonymous')}
        style={{
          flex: 1,
          padding: '10px 20px',
          borderRadius: '8px',
          border: selectedType === 'non-anonymous' ? '2px solid #ff9800' : '1px solid #ccc',
          backgroundColor: selectedType === 'non-anonymous' ? '#fff3e0' : 'white',
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '14px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#ffe0b2')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = selectedType === 'non-anonymous' ? '#fff3e0' : 'white')}
      >
        Neanonymná
      </button>
    </div>
  );
};

export default SurveyTypeSelector;
