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
  const [rows, setRows] = useState<Survey[]>([]);
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

  // create some mock data for now
  useEffect(() => {
    const mock: Survey[] = Array.from({ length: 10 }).map((_, i) => ({
      id: `s-${i + 1}`,
      name: `Anketa na zistenie spokojnosti s kávovarom ${i + 1}`,
      question: 'Ako spokojný/á ste s kvalitou a dostupnosťou kávovaru v našich kanceláriách?',
      status: i % 3 === 0 ? 'Uzavretá' : 'Aktívna',
      ownerId: i % 2 === 0 ? 'me' : 'other',
    }));
    setSurveys(mock);
    setRows(mock);
    setLoaded(true);
  }, []);

  useEffect(() => {
    // apply tab filtering
    if (tab === 0) {
      setRows(surveys);
    } else if (tab === 1) {
      setRows(surveys.filter((s) => s.ownerId === 'me'));
    } else if (tab === 2) {
      // results - show closed only for preview
      setRows(surveys.filter((s) => s.status === 'Uzavretá'));
    }
  }, [tab, surveys]);

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
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" width="100%" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={() => handleVote(params.row.id)}
            endIcon={<PlayArrowIcon />}
            size="small"
            disabled={params.row.status !== 'Aktívna'}
          >
            Hlasovať
          </Button>
        </Stack>
      ),
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

        {isVeducko && (
            <Button
                variant="contained"
                color="primary"
                sx={{ marginLeft: 'auto' }}
                onClick={() => nav('/createSurvey')}
            >
                Vytvoriť anketu
            </Button>
          )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Zoznam ankiet" />
          <Tab label="Moje ankety" />
          <Tab label="Výsledky ankety" />
        </Tabs>

        <Box sx={{ width: '100%' }}>
          <DataGrid
            columns={columns}
            loading={!loaded}
            rows={rows}
            sx={dataGridStyles}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            pagination
            getRowId={(row) => row.id}
            autoHeight
          />

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
