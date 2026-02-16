import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import {
  Box,
  Stack,
  Button,
  Tooltip,
  IconButton,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
  Tabs,
  Snackbar,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { dataGridStyles } from '../../../styles/gridStyle';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../../hooks/SnackBarContext';
import { useAuth } from "../../../hooks/AuthProvider";
import { EmployeeCard } from "../../../types/EmployeeCard";
import api from "../../../app/api";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Collapse from "@mui/material/Collapse";
import SurveyResultItem from "./SurveyResultItem";


// Local mock type for survey (since backend isn't ready yet)
type Survey = {
  id: string;
  name: string;
  question: string;
  status: 'Aktívna' | 'Uzavretá';
  ownerId?: string; // for "Moje ankety" filtering
};


type ShowSurvey = {
  id: string;
  name: string;
  info: string | null;
  type: string;
  status: string;
  start: string;
  end: string;
  createdBy: string;
  totalRecipients: number;
  totalVotes: number;
  questions: {
    id: string;
    question: string;
    options: { id: string; answer: string }[];
    answerType: string;
  }[];
};



const ManageSurveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [tab, setTab] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const nav = useNavigate();
  const { openSnackbar } = useSnackbar();
  const [localSnackOpen, setLocalSnackOpen] = useState(false);
  const [localSnackMsg, setLocalSnackMsg] = useState('');
  const profile = useAuth();
  const role = profile.userProfile?.role;
  const isVeducko = role === "Vedúci zamestnanec"; 
  const [creator, setCreator] = useState<EmployeeCard | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailSurvey, setDetailSurvey] = useState<ShowSurvey | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [openVoteDialog, setOpenVoteDialog] = useState(false);
  const [voteSurvey, setVoteSurvey] = useState<ShowSurvey | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [questionId: string]: string[] }>({});
  const [openVoteConfirm, setOpenVoteConfirm] = useState(false);
  const [voteDialogReadOnly, setVoteDialogReadOnly] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showInfo, setShowInfo] = useState(false);


  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteClick = (id: string) => {
    setSurveyToDelete(id);
    setOpenDeleteConfirm(true);
  };


  const confirmDelete = async () => {
    if (!surveyToDelete) return;

    try {
      await api.delete(`/Survey/${surveyToDelete}`);
      openSnackbar("Anketa bola úspešne vymazaná", "success");

      // Zatvor detail, ak je otvorený
      setOpenDetail(false);
      setDetailSurvey(null);

      // Aktualizujeme zoznam ankiet
      if (creator?.employeeId) loadSurveys(creator.employeeId, tab);
    } catch (err) {
      console.error(err);
      openSnackbar("Chyba pri vymazaní ankety", "error");
    } finally {
      setOpenDeleteConfirm(false);
      setSurveyToDelete(null);
    }
  };


  const loadSurveys = async (employeeId: string, selectedTab: number) => {
    setSurveys([]);
    try {
      let url = "";

      if (selectedTab === 0) {
        // všetky relevantné ankety
        url = `/Survey/GetByEmployee/${employeeId}`;
      } else if (selectedTab === 1) {
        // moje ankety
        url = `/Survey/GetMySurveys/${employeeId}`;
      } else if (selectedTab === 2) {
        // výsledky – tiež GetByEmployee, ale neskôr ich prefiltrujeme
        url = `/Survey/GetMyEndedSurveys/${employeeId}`;
      }

      const res = await api.get(url);

      const mapped: Survey[] = res.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        question: s.questions?.[0]?.question ?? "",
        status: s.status,
        ownerId: s.createdById === employeeId ? "me" : "other",
      }));

      setSurveys(mapped);
      setLoaded(true);

    } catch (err) {
      console.error("Chyba pri načítaní ankiet:", err);
    }
  };

  useEffect(() => {
    api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
      .then(res => setCreator(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!creator?.employeeId) return;

    loadSurveys(creator.employeeId, tab);

  }, [creator, tab]);


  const handleVote = async (surveyId: string) => {
    try {
      // Načítanie detailov ankety
      const resDetail = await api.get(`/Survey/GetDetail/${surveyId}`);
      const surveyData: ShowSurvey = resDetail.data;

      setVoteSurvey(surveyData);

      // Skontrolujeme, či už používateľ hlasoval
      try {
        const resVotes = await api.post(`/Survey/GetVotes/${surveyId}`);
        const userVotes: { [questionId: string]: string[] } = resVotes.data;

        setSelectedOptions(userVotes);

        // Ak už hlasoval, zakážeme úpravy
        setVoteDialogReadOnly(true);

      } catch (err) {
        // Ak ešte nehlasoval, povolíme hlasovanie
        setSelectedOptions({});
        setVoteDialogReadOnly(false);
      }

      setOpenVoteDialog(true);

    } catch (err) {
      console.error(err);
      openSnackbar("Nepodarilo sa načítať anketu", "error");
    }
  };


  const confirmVote = () => {
    setOpenConfirm(false);
    // pretend vote success
    const msg = 'Ďakujeme za hlasovanie!';
    // prefer global snackbar if exists
    if (openSnackbar) openSnackbar(msg, 'success');
    else {
      setLocalSnackMsg(msg);
      setLocalSnackOpen(true);
    }
  };

  const handleShowDetail = async (survey: Survey) => {
    try {
      const res = await api.get(`/Survey/GetDetail/${survey.id}`);
      setDetailSurvey(res.data);
      setOpenDetail(true);
    } catch (err) {
      console.error(err);
    }
  };


  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Názov ankety',
      headerClassName: 'header',
      minWidth: 200,
      flex: 2
    },
    {
      field: 'question',
      headerName: 'Otázka',
      headerClassName: 'header',
      minWidth: 400,
      flex: 3
    },
    {
      field: 'status',
      headerName: 'Stav ankety',
      headerClassName: 'header',
      minWidth: 120,
      flex: 1
    },
    {
      field: 'actions',
      headerName: 'Akcia',
      headerClassName: 'header',
      minWidth: 160,
      flex: 1,
      sortable: false,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        if (tab === 0) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
              <Button
                variant="contained"
                onClick={() => handleVote(params.row.id)}
                endIcon={<PlayArrowIcon />}
                size="small"
                disabled={params.row.status !== 'Aktívna'}
              >
                Hlasovať
              </Button>
            </Box>
          );
        } else if (tab === 1) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleShowDetail(params.row)}
              >
                Zobraziť
              </Button>
            </Box>
          );
        }
        return null;
      }


    },
  ];

  return (
    <Layout>
      <Box sx={{ padding: 3, flexDirection: 'column', alignItems: 'flex-start' }}>
        <Stack direction="row" spacing={2} alignItems="left" mb={2}>
          <Typography variant="h4" fontWeight="bold">
            Ankety
          </Typography>
        </Stack>

        <Button
                variant="contained"
                color="primary"
                sx={{ marginLeft: 'auto' }}
                onClick={() => nav('/createSurvey')}
            >
                Vytvoriť anketu
            </Button>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant='scrollable'>
          <Tab label="Zoznam ankiet" />
          <Tab label="Moje ankety" />
          <Tab label="Výsledky ankety" />
        </Tabs>

        <Box sx={{ width: '100%' }}>
          
          {/* -------- ZÁLOŽKA 0: Zoznam ankiet -------- */}
          {/* TAB 0 – Zoznam ankiet */}
          {tab === 0 && (
            <DataGrid
              columns={columns}
              loading={!loaded}
              rows={surveys}
              sx={dataGridStyles}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[5, 10, 25]}
              pagination
              getRowId={(row) => row.id}
              autoHeight
            />
          )}

          {/* TAB 1 – Moje ankety */}
          {tab === 1 && (
            <DataGrid
              columns={columns}
              loading={!loaded}
              rows={surveys}
              sx={dataGridStyles}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[5, 10, 25]}
              pagination
              getRowId={(row) => row.id}
              autoHeight
            />
          )}

          {/* TAB 2 – Výsledky ankety */}
          {tab === 2 && (
            <Box>
              {surveys
                .filter((s) => s.status === "Uzavretá")
                .map((survey) => (
                  <SurveyResultItem
                    key={survey.id}
                    name={survey.name}
                    question={survey.question}
                    status={survey.status}
                    onEvaluate={() => {
                      nav(`/surveyResults/${survey.id}`);
                    }}
                  />
                ))}
            </Box>
          )}



          <Snackbar
            open={localSnackOpen}
            autoHideDuration={3000}
            onClose={() => setLocalSnackOpen(false)}
          >
            <Alert severity="success">{localSnackMsg}</Alert>
          </Snackbar>

          <Dialog
            open={openDetail}
            onClose={() => setOpenDetail(false)}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
          >
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              {detailSurvey?.name}
              <IconButton
                onClick={() => setOpenDetail(false)}
                sx={{ position: 'absolute', right: 16, top: 16 }}
              >
                ✕
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={2}>

                <Box>
                  <Typography fontWeight="bold">Popis ankety</Typography>
                  <Typography>
                    {detailSurvey?.info ?? "Bez popisu"}
                  </Typography>
                </Box>

                <Box>
                  {detailSurvey?.questions?.map((q, index) => (
                    <Box key={q.id} sx={{ mt: 1 }}>
                      <Typography fontWeight="bold">Otázka {index + 1}</Typography>
                      <Typography>{q.question}</Typography>

                      <Typography fontWeight="bold" sx={{ mt: 1 }}>Možnosti</Typography>
                      <ul>
                        {q.options.map((o) => (
                          <li key={o.id}>{o.answer}</li>
                        ))}
                      </ul>
                    </Box>
                  ))}
                </Box>


                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="bold">Typ ankety</Typography>
                  <Typography>{detailSurvey?.type === "anonymous" ? "anonymná" : "neanonymná"}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="bold">Celkový počet príjemcov</Typography>
                  <Typography>{detailSurvey?.totalRecipients}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="bold">Celkový počet doteraz hlasujúcich</Typography>
                  <Typography>{detailSurvey?.totalVotes}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="bold">Dátum a čas začiatku ankety</Typography>
                  <Typography>{formatDateTime(detailSurvey?.start)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography fontWeight="bold">Dátum a čas ukončenia ankety</Typography>
                  <Typography>{formatDateTime(detailSurvey?.end)}</Typography>
                </Box>

              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button variant="contained" color="info" onClick={() => handleDeleteClick(detailSurvey?.id!)}>
                Vymazať
              </Button>

            </DialogActions>

          </Dialog>

          <Dialog
            open={openDeleteConfirm}
            onClose={() => setOpenDeleteConfirm(false)}
          >
            <DialogTitle>Vymazať anketu?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Ste si istý, že chcete vymazať túto anketu? Táto akcia je nevratná.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteConfirm(false)}>Zrušiť</Button>
              <Button variant="contained" color="error" onClick={confirmDelete}>
                Vymazať
              </Button>
            </DialogActions>
          </Dialog>


          <Dialog
            open={openVoteDialog}
            onClose={() => setOpenVoteDialog(false)}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
          >
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              {voteSurvey?.name}
              <IconButton
                onClick={() => setOpenVoteDialog(false)}
                sx={{ position: 'absolute', right: 16, top: 16 }}
              >
                ✕
              </IconButton>
            </DialogTitle>

            {/* --- Popis a typ ankety pod nadpis --- */}
            <Box sx={{ px: 3, mb: 2 }}>
              {/* POPIS ANKETY */}
              {isMobile ? (
                // ✅ MOBILE: collapse
                <Box sx={{ mb: 1 }}>
                  <Button
                    size="small"
                    onClick={() => setShowInfo(!showInfo)}
                    sx={{ textTransform: "none", padding: 0 }}
                  >
                    {showInfo ? "Skryť popis" : "Zobraziť popis ankety"}
                  </Button>

                  <Collapse in={showInfo}>
                    <Typography sx={{ mt: 1, color: "#444" }}>
                      {voteSurvey?.info ?? "Bez popisu"}
                    </Typography>
                  </Collapse>
                </Box>
              ) : (
                // ✅ DESKTOP: vždy viditeľné
                <Box sx={{ mb: 1 }}>
                  <Typography fontWeight="light" sx={{ color: "#888" }}>
                    Popis ankety
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    {voteSurvey?.info ?? "Bez popisu"}
                  </Typography>
                </Box>
              )}

              {/* TYP ANKETY */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography fontWeight="light" sx={{ color: "#888" }}>
                  Typ ankety
                </Typography>
                <Typography>
                  {voteSurvey?.type === "anonymous" ? "anonymná" : "neanonymná"}
                </Typography>
              </Box>
          </Box>


            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={2}>
                {voteSurvey?.questions?.map((q, index) => (
                  <Box key={q.id}>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography fontWeight="bold">Otázka {index + 1}</Typography>
                      <Typography>{q.question}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography fontWeight="light" sx={{ color: '#888' }}>Typ odpovede</Typography>
                      <Typography>{q.answerType === "multiple" ? "multi-select" : "single-select"}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                      {q.options.map((o) => {
                        const isSelected = selectedOptions[q.id]?.includes(o.id) ?? false;
                        return (
                          <Button
                            key={o.id}
                            disabled={voteDialogReadOnly}
                            variant={isSelected ? 'contained' : 'outlined'}
                            sx={{
                              mt: 0.5,
                              textTransform: 'none',
                              justifyContent: 'flex-start',           // text nalavo
                              paddingLeft: 2,                          // odsadenie textu
                              color: 'black', 
                              borderStyle: 'solid',
                              borderColor: isSelected ? '#FFA500' : '#ccc',
                              borderWidth: isSelected ? 2 : 0,
                              backgroundColor: isSelected ? 'rgba(255, 165, 0, 0.15)' : 'transparent',
                              '&:hover': {
                                backgroundColor: isSelected ? 'rgba(255, 165, 0, 0.25)' : 'rgba(0,0,0,0.04)',
                                borderColor: isSelected ? '#FFA500' : '#888',
                              },
                            }}
                            onClick={() => {
                              if (voteDialogReadOnly) return;
                              const current = selectedOptions[q.id] || [];
                              if (voteSurvey.questions[index].answerType === 'single') {
                                setSelectedOptions({ ...selectedOptions, [q.id]: [o.id] });
                              } else {
                                // multiple choice toggle
                                const updated = current.includes(o.id)
                                  ? current.filter(id => id !== o.id)
                                  : [...current, o.id];
                                setSelectedOptions({ ...selectedOptions, [q.id]: updated });
                              }
                            }}
                          >
                            {o.answer}
                          </Button>
                        );
                      })}
                    </Box>

                  </Box>

                ))}
              </Stack>
            </DialogContent>

            <Box sx={{ px: 3, my: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography fontWeight="light" sx={{ color: '#888' }}>Dátum začiatku ankety</Typography>
                <Typography>{formatDateTime(voteSurvey?.start)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography fontWeight="light" sx={{ color: '#888' }}>Dátum ukončenia ankety</Typography>
                <Typography>{formatDateTime(voteSurvey?.end)}</Typography>
              </Box>
            </Box>

            <DialogActions sx={{ p: 3 }}>
              <Button
                color="info"
                variant="contained"
                disabled={voteDialogReadOnly}
                onClick={() => {
                  if (!voteSurvey) return;

                  // VALIDÁCIA – každá otázka musí mať aspoň 1 odpoveď
                  const allAnswered = voteSurvey.questions.every(q => 
                    selectedOptions[q.id] && selectedOptions[q.id].length > 0
                  );

                  if (!allAnswered) {
                    openSnackbar("Musíte odpovedať na všetky otázky.", "error");
                    return;
                  }

                  // Otvoriť potvrdzovacie okno
                  setOpenVoteConfirm(true);
                }}
              >
                Uložiť
              </Button>

              <Button
                onClick={() => setOpenVoteDialog(false)}
                sx={{
                  backgroundColor: '#888',  // tmavšie/sivé pozadie
                  color: '#fff',            // biely text
                  border: 'none',           // žiaden okraj
                  '&:hover': {
                    backgroundColor: '#777', // tmavší odtieň pri hover
                  },
                }}
              >
                Zrušiť
              </Button>
            </DialogActions>
          </Dialog>


          <Dialog
            open={openVoteConfirm}
            onClose={() => setOpenVoteConfirm(false)}
          >
            <DialogTitle>Odoslať hlas?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Ste si istý, že chcete odoslať svoj hlas? Po odoslaní už nebude možné hlas upraviť.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenVoteConfirm(false)}>Zrušiť</Button>
              <Button
                variant="contained"
                onClick={async () => {
                  if (!voteSurvey) return;

                  try {
                    await api.post(`/Survey/SubmitVote/${voteSurvey.id}`, {
                      answers: selectedOptions
                    });

                    openSnackbar("Váš hlas bol úspešne odoslaný", "success");
                    setOpenVoteConfirm(false);
                    setOpenVoteDialog(false);

                  } catch (err) {
                    console.error(err);
                    openSnackbar("Chyba pri odosielaní hlasu", "error");
                  }
                }}
              >
                Odoslať
              </Button>
            </DialogActions>
          </Dialog>

        </Box>

      </Box>
    </Layout>

  );
};

export default ManageSurveys;
