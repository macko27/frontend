import React, { useState, useEffect } from "react";
import { TextField, Chip, Box } from "@mui/material";
import api from "../../../../app/api";
import { RecognitionRecipient } from "../../../../types/Recognition/RecognitionRecipient";
import { useAuth } from "../../../../hooks/AuthProvider";
import { DarkModeOutlined } from "@mui/icons-material";

interface Props {
  selected: RecognitionRecipient[];
  setSelected: (recipients: RecognitionRecipient[]) => void;
}

const RecognitionRecipientsSelector: React.FC<Props> = ({ selected, setSelected }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecognitionRecipient[]>([]);
  const profile = useAuth();
  const role = profile.userProfile?.role;
  const isVeducko = role === "Vedúci zamestnanec";

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get(`/Recognition/SearchRecipients?query=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const addRecipient = (rec: RecognitionRecipient) => {
    if (!selected.some(s => s.id === rec.id)) {
      setSelected([...selected, rec]);
    }
    setQuery("");
    setResults([]);
  };

  const removeRecipient = (rec: RecognitionRecipient) => {
    setSelected(selected.filter(s => !(s.id === rec.id)));
  };



  return (
    <Box>
      <label style={{ fontSize: 14, fontWeight: 500 }}>Zvoľte príjemcov <span style={{ color: 'red' }}>*</span></label>

      <TextField
        fullWidth
        placeholder="Hľadať zamestnancov..."
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
            position: "relative",
            zIndex: 2,
            width: "100%"
            }}
        >
            {results.length > 0 ? (
            results.map(r => (
                <Box
                key={`${r.id}`}
                onClick={() => addRecipient(r)}
                sx={{
                    p: 1,
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    color: "black"
                }}
                >
                  {r.fullName}
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
            key={`${rec.id}`}
            label={`${rec.fullName}`}
            onDelete={() => removeRecipient(rec)}
            sx={{
              backgroundColor: "#ffe5d0",
              color: "black",
              borderRadius: "16px",
              "& .MuiChip-deleteIcon": { color: "black" },
              "&:hover": { // farba pozadia pri hover
                color: "black",              // text čierny aj pri hover
                "& .MuiChip-deleteIcon": { color: "#d84315" } // icon čierny aj pri hover
              }
              
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default RecognitionRecipientsSelector;
