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

// Local mock type for survey (since backend isn't ready yet)
type Survey = {
  id: string;
  name: string;
  question: string;
  status: 'Aktívna' | 'Uzavretá';
  ownerId?: string; // for "Moje ankety" filtering
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
        url = `/Survey/GetByEmployee/${employeeId}`;
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


  const handleVote = (id: string) => {
    // no backend yet — show snackbar and pretend navigation to voting page
    setSelectedId(id);
    setOpenConfirm(true);
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

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Názov ankety',
      headerClassName: 'header',
      width: 350,
      flex: 1,
      resizable: false,
    },
    {
      field: 'question',
      headerName: 'Otázka',
      headerClassName: 'header',
      width: 600,
      flex: 2,
      resizable: false,
    },
    {
      field: 'status',
      headerName: 'Stav ankety',
      headerClassName: 'header',
      width: 150,
      resizable: false,
    },
    {
      field: 'actions',
      headerName: 'Akcia',
      headerClassName: 'header',
      width: 160,
      resizable: false,
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
                //onClick={() => handleVote(params.row.id)}
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

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
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
            <DataGrid
              columns={columns}
              loading={!loaded}
              rows={surveys.filter(s => s.status === 'Uzavretá')}
              sx={dataGridStyles}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[5, 10, 25]}
              pagination
              getRowId={(row) => row.id}
              autoHeight
            />
          )}



          <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
            <DialogTitle>Hlasovať</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Chcete odoslať svoj hlas pre túto anketu?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenConfirm(false)}>Zrušiť</Button>
              <Button variant="contained" onClick={confirmVote}>
                Hlasovať
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={localSnackOpen}
            autoHideDuration={3000}
            onClose={() => setLocalSnackOpen(false)}
          >
            <Alert severity="success">{localSnackMsg}</Alert>
          </Snackbar>
        </Box>

      </Box>
    </Layout>
  );
};

export default ManageSurveys;
