import React, { useState, useEffect } from "react";
import { TextField, Chip, Box } from "@mui/material";
import api from "../../../app/api";
import { Recipient } from "../../../types/Survey/Recipient";

interface Props {
  selected: Recipient[];
  setSelected: (recipients: Recipient[]) => void;
}

const RecipientsSelector: React.FC<Props> = ({ selected, setSelected }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipient[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get(`/Survey/SearchRecipients?query=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const addRecipient = (rec: Recipient) => {
    if (!selected.some(s => s.id === rec.id && s.type === rec.type)) {
      setSelected([...selected, rec]);
    }
    setQuery("");
    setResults([]);
  };

  const removeRecipient = (rec: Recipient) => {
    setSelected(selected.filter(s => !(s.id === rec.id && s.type === rec.type)));
  };

  return (
    <Box>
      <label style={{ fontSize: 14, fontWeight: 500 }}>Zvoľte príjemcov *</label>

      <TextField
        fullWidth
        placeholder="Hľadať zamestnancov alebo oddelenia..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mt: 1 }}
      />

      {/* Výsledky vyhľadávania */}
      {results.length > 0 || query.length >= 2 ? (
        <Box
            sx={{
            border: "1px solid #ddd",
            borderRadius: 1,
            mt: 1,
            maxHeight: 180,
            overflowY: "auto",
            background: "white",
            position: "absolute",
            zIndex: 2,
            width: "100%"
            }}
        >
            {results.length > 0 ? (
            results.map(r => (
                <Box
                key={`${r.type}-${r.id}`}
                onClick={() => addRecipient(r)}
                sx={{
                    p: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f5f5f5" }
                }}
                >
                </Box>
            ))
            ) : (
            <Box sx={{ p: 1, color: "#999" }}>Nič sa nenašlo</Box>
            )}
        </Box>
        ) : null}

      {/* Vybrané tagy */}
      <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        {selected.map(rec => (
          <Chip
            key={`${rec.type}-${rec.id}`}
            label={`${rec.name}`}
            onDelete={() => removeRecipient(rec)}
            sx={{
              backgroundColor: "#ffe5d0",
              borderRadius: "16px"
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default RecipientsSelector;
