import React, { useState, useEffect } from "react";
import Layout from "../../../../components/Layout";
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from '../../../../hooks/SnackBarContext';
import api from "../../../../app/api";
import { EmployeeCard } from "../../../../types/EmployeeCard";
import { useAuth } from "../../../../hooks/AuthProvider";
import { RecognitionRecipient } from "../../../../types/Recognition/RecognitionRecipient";
import RecognitionRecipientsSelector from "./RecognitionRecipientSelector";
import { useTheme } from "@mui/material/styles";


const CreateRecognition: React.FC = () => {
  const nav = useNavigate();
  const { openSnackbar } = useSnackbar();
  const profile = useAuth();
  const role = profile.userProfile?.role;
  const isVeducko = role === "Vedúci zamestnanec"; 
  const [creator, setCreator] = useState<EmployeeCard | null>(null);
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [reward, setReward] = useState("");
  const [recipients, setRecipients] = useState<RecognitionRecipient[]>([]);
  const theme = useTheme();
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
      .then(res => setCreator(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async () => {
    if (!creator) {
      openSnackbar("Nepodarilo sa získať prihláseného používateľa", "error");
      return;
    }

    if (!subject.trim()) {
      openSnackbar("Predmet je povinný", "error");
      return;
    }

    if (!text.trim()) {
      openSnackbar("Text uznania je povinný", "error");
      return;
    }

    if (recipients.length === 0) {
      openSnackbar("Musíte vybrať príjemcu", "error");
      return;
    }

    if (files.length > 3) {
      openSnackbar("Maximálne 3 prílohy", "error");
      return;
    }

    const formData = new FormData();

    formData.append("predmet", subject.trim());
    formData.append("text", text.trim());
    formData.append("odmena", reward ? reward : "0");
    formData.append("createdById", creator.employeeId);

    // recipients
    recipients.forEach((r, index) => {
      formData.append(`recipients[${index}]`, r.id);
    });

    // files
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        openSnackbar(`Súbor ${file.name} je väčší ako 10MB`, "error");
        return;
      }
      formData.append("files", file);
    });

    try {
      await api.post("/Recognition/CreateWithFiles", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      openSnackbar("Uznanie bolo úspešne vytvorené", "success");
      nav("/manageRecognitions");

    } catch (err) {
      console.error(err);
      openSnackbar("Chyba pri vytváraní uznania", "error");
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <Layout fullWidth>
      <Box sx={{ p: 3, maxWidth: 700 }}>

        <Typography variant="h4" fontWeight="bold" mb={3}>
          Nové uznanie
        </Typography>

        {/* Predmet */}
        <Box mb={3}>
          <Typography fontWeight={500} mb={1}>
            Predmet *
          </Typography>
          <TextField
            fullWidth
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Poďakovanie za výbornú prácu"
          />
        </Box>

        {/* Text */}
        <Box mb={3}>
          <Typography fontWeight={500} mb={1}>
            Text uznania *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ďakujeme za tvoju výbornú prácu na projekte..."
            inputProps={{ maxLength: 1000 }}
            helperText={`${text.length}/1000 znakov`}
          />
        </Box>

        {/* Výber príjemcu */}
        <Box mb={4}>
          <RecognitionRecipientsSelector
            selected={recipients}
            setSelected={setRecipients}
          />
        </Box>

        {/* Odmena */}
        <Box mb={4}>
            <Typography fontWeight={500} mb={1}>
            Odmena (nepovinné)
            </Typography>
            <Stack direction="row" spacing={1}>
            {[20, 50, 100, 200].map((amount) => {
                const isSelected = reward === String(amount);
                return (
                <Button
                    key={amount}
                    variant="outlined"
                    sx={{
                    flex: 1,
                    backgroundColor: isSelected
                        ? theme.palette.primary.main
                        : theme.palette.mode === 'dark'
                        ? '#000'
                        : '#fff',
                    color: isSelected
                        ? '#fff'
                        : theme.palette.mode === 'dark'
                        ? '#fff'
                        : '#000',
                    borderColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
                    '&:hover': {
                        backgroundColor: isSelected
                        ? theme.palette.primary.main
                        : theme.palette.mode === 'dark'
                        ? '#111'
                        : '#f5f5f5',
                    },
                    }}
                    onClick={() => {
                    if (isSelected) {
                        setReward('0'); // zrušenie výberu
                    } else {
                        setReward(String(amount));
                    }
                    }}
                >
                    {amount}
                </Button>
                );
            })}
            </Stack>
        </Box>

        {/* Prilohy */}
        <Box mb={4}>
          <Typography fontWeight={500} mb={1}>
            Prílohy
          </Typography>

          <Box
            component="label"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #ccc",
              borderRadius: 2,
              height: 50,
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <input
              type="file"
              hidden
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files || []);

                const newFiles = [...files, ...selectedFiles];

                if (newFiles.length > 3) {
                  openSnackbar("Maximálne 3 súbory", "error");
                  return;
                }

                setFiles(newFiles);

                e.target.value = "";
              }}
            />

            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.warning.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                +
              </Box>

              <Typography>
                Pridať obrázok alebo video
              </Typography>
            </Stack>
          </Box>

          {/* Zobrazenie vybraných súborov */}
          {files.map((file, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <Typography variant="body2">{file.name}</Typography>
              <Button
                size="small"
                color="error"
                onClick={() => {
                  setFiles(files.filter((_, i) => i !== index));
                }}
              >
                ✕
              </Button>
            </Stack>
          ))}
        </Box>

        {/* Tlačidlá */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={handleCancel}
          >
            Zrušiť
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
          >
            Uložiť
          </Button>
        </Stack>

      </Box>
    </Layout>
  );
};

export default CreateRecognition;