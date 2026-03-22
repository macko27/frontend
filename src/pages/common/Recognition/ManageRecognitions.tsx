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
  DialogTitle,
  Tab,
  Tabs,
  Alert,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../../hooks/SnackBarContext';
import { dataGridStyles } from '../../../styles/gridStyle';
import { useAuth } from '../../../hooks/AuthProvider';
import { Recognition as Recognition } from '../../../types/Recognition/Recognition';
import api from '../../../app/api';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { EmployeeCard } from "../../../types/EmployeeCard";
import { RecognitionToApprove } from '../../../types/Recognition/RecognitionToApprove';
import { RecognitionState } from '../../../types/Recognition/RecognitionState';
dayjs.extend(utc);

const ManageRecognitions: React.FC = () => {
  const [receivedRecognitions, setReceivedRecognitions] = useState<Recognition[]>([]);
  const [sentRecognitions, setSentRecognitions] = useState<Recognition[]>([]);
  const [toApproveRecognitions, setToApproveRecognitions] = useState<RecognitionToApprove[]>([]);

  const [tab, setTab] = useState(0);

  const sortedRecognitions =
  tab === 0
    ? [...receivedRecognitions].sort((a, b) => new Date(b.dateIn).getTime() - new Date(a.dateIn).getTime())
    : tab === 1
    ? [...sentRecognitions].sort((a, b) => new Date(b.dateIn).getTime() - new Date(a.dateIn).getTime())
    : [...toApproveRecognitions].sort((a, b) => new Date(b.dateIn).getTime() - new Date(a.dateIn).getTime());

  const [loaded, setLoaded] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creator, setCreator] = useState<EmployeeCard | null>(null);
  const [openRecognitionDetail, setOpenRecognitionDetail] = useState(false);
  const [detailRecognition, setDetailRecognition] = useState<Recognition | null>(null);
  const [openPendingDialog, setOpenPendingDialog] = useState(false);
  const [pendingRecognition, setPendingRecognition] = useState<RecognitionToApprove | null>(null);

  const [decision, setDecision] = useState<'approve' | 'modify' | 'reject' | ''>('');
  const [modifiedReward, setModifiedReward] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [state, setState] = useState<RecognitionState>(RecognitionState.Cakajuca);

  const nav = useNavigate();
  const { openSnackbar } = useSnackbar();
  const profile = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const role = profile.userProfile?.role;
  const isVeducko = role === "Vedúci zamestnanec"; 

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return dayjs.utc(dateStr).local().format('DD.MM.YYYY HH:mm');
  };

  const loadRecognitions = async (employeeId: string, selectedTab: number) => {
    try {
      if (selectedTab === 0) {
        const res = await api.get(`/Recognition/GetRecieved/${employeeId}`);
        setReceivedRecognitions(res.data);
      } 
      else if (selectedTab === 1) {
        const res = await api.get(`/Recognition/GetSent/${employeeId}`);
        setSentRecognitions(res.data);
      } 
      else if (selectedTab === 2 && isVeducko) {
        const res = await api.get(`/Recognition/GetToBeApproved/${employeeId}`);
        setToApproveRecognitions(res.data);
      }

      setLoaded(true);
    } catch (err) {
      console.error(err);
      openSnackbar('Nepodarilo sa načítať rozpoznania', 'error');
    }
  };


  useEffect(() => {
    api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
      .then(res => setCreator(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!creator?.employeeId) return;

    loadRecognitions(creator.employeeId, tab);

  }, [creator, tab]);


  const handleShowRecognitionDetail = (recognition: any) => {
    if (tab === 2) {
      setPendingRecognition(recognition as RecognitionToApprove);
      setOpenPendingDialog(true);
    } else {
      setDetailRecognition(recognition as Recognition);
      setOpenRecognitionDetail(true);
    }
  };


  const handleSubmitDecision = async () => {
    try {
      if (!decision) {
        openSnackbar('Vyber rozhodnutie', 'error');
        return;
      }

      if (decision === 'modify' && modifiedReward === null) {
        openSnackbar('Vyber upravenú odmenu', 'error');
        return;
      }

      if (decision === 'reject' && !rejectReason.trim()) {
        openSnackbar('Zadaj dôvod zamietnutia', 'error');
        return;
      }

      // mapovanie decision → enum
      let newState: RecognitionState = null as any;
      if (decision === 'approve') newState = RecognitionState.Schvalena;
      if (decision === 'modify') newState = RecognitionState.SchvalenaSUpravou;
      if (decision === 'reject') newState = RecognitionState.Zamietnuta;

      await api.post('/Recognition/Approve', {
        recipientRecordId: pendingRecognition?.recipientRecordId,
        recognitionId: pendingRecognition?.recognitionId,
        state: newState,
        odmena: decision === 'modify' ? modifiedReward : pendingRecognition?.recipient?.odmena,
        dovod: decision === 'reject' ? rejectReason : null
      });

      openSnackbar('Rozhodnutie uložené', 'success');
      setOpenPendingDialog(false);
      loadRecognitions(creator!.employeeId, tab);

    } catch (err) {
      console.error(err);
      openSnackbar('Chyba pri spracovaní', 'error');
    }
  };
  

  const columns: GridColDef[] = [
    {
      field: 'person',
      headerName: tab === 0 ? 'Odosielateľ' : tab === 1 ? 'Príjemca' : 'Príjemca',
      headerClassName: 'header',
      flex: 2,
      renderCell: (params) => {
        if (tab === 0) {
          return <span>{params.row.createdBy.fullName}</span>;
        }

        if (tab === 1) {
          return <span>{params.row.recipients?.[0]?.fullName}</span>;
        }

        return <span>{params.row.recipient.fullName}</span>;
      }
    },
    { field: 'predmet', headerName: 'Predmet', flex: 2, minWidth: 200, headerClassName: 'header' },
    { field: 'text', headerName: 'Text', flex: 3, minWidth: 300, headerClassName: 'header',
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    {
      field: 'actions',
      headerName: 'Akcia',
      flex: 1,
      minWidth: 160,
      sortable: false,
      headerClassName: 'header',
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button size="small" variant="contained" onClick={() => handleShowRecognitionDetail(params.row)}>Zobraziť</Button>
      )
    }
  ];

  return (
    <Layout fullWidth={isMobile}>
      <Box sx={{ padding: 3, flexDirection: 'column', alignItems: 'flex-start' }}>
        <Stack direction="row" spacing={2} alignItems="left" mb={2}>
            <Typography variant="h4" fontWeight="bold">
                Uznania a odmeny
            </Typography>
        </Stack>

        <Button
            variant="contained"
            color="primary"
            sx={{ marginLeft: 'auto' }}
            onClick={() => nav('/createRecognition')}
        >
            Vytvoriť uznanie
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            >
            <Tab label="Doručené" />
            <Tab label="Odoslané" />
            {isVeducko &&<Tab label="Na schválenie" />}
            </Tabs>

        </Box>

        <Box sx={{ width: '100%' }}>
            
            {/* -------- ZÁLOŽKA 0: Zoznam ankiet -------- */}
            {/* TAB 0 – Zoznam ankiet */}
            {tab === 0 && (
            <DataGrid
                columns={columns}
                loading={!loaded}
                rows={sortedRecognitions}
                sx={dataGridStyles(theme)}
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
                rows={sortedRecognitions}
                sx={dataGridStyles(theme)}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                pageSizeOptions={[5, 10, 25]}
                pagination
                getRowId={(row) => row.id}
                autoHeight
              />
            )}

            {tab === 2 && isVeducko && (
              <DataGrid
                columns={columns}
                loading={!loaded}
                rows={sortedRecognitions}
                sx={dataGridStyles(theme)}
                getRowId={(row) => row.recipientRecordId}
                autoHeight
              />
            )}

        </Box>


      </Box>


      <Dialog
        open={openRecognitionDetail}
        onClose={() => setOpenRecognitionDetail(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {detailRecognition?.predmet}
          <IconButton
            onClick={() => setOpenRecognitionDetail(false)}
            sx={{ position: "absolute", right: 16, top: 16 }}
          >
            ✕
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>

            {/* Príjemca / Odosielateľ */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">
                {tab === 0 ? "Odosielateľ" : "Príjemca"}
              </Typography>

              <Box textAlign="right">
                {tab === 0 ? (
                  <Typography>{detailRecognition?.createdBy?.fullName}</Typography>
                ) : (
                  detailRecognition?.recipients?.map((r: any) => (
                    <Typography key={r.id}>{r.fullName}</Typography>
                  ))
                )}
              </Box>
            </Box>

            {/* Text uznania */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">
                Text uznania
              </Typography>

              <Typography sx={{ maxWidth: 350, textAlign: "right" }}>
                {detailRecognition?.text}
              </Typography>
            </Box>

            {/* Odmena */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">
                Odmena
              </Typography>

              <Typography sx={{ maxWidth: 350, textAlign: "right" }}>
                {detailRecognition?.odmena}
              </Typography>
            </Box>

            {/* Dátum */}
            {detailRecognition?.dateIn && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">
                  Dátum odoslania
                </Typography>

                <Typography>
                  {formatDateTime(detailRecognition.dateIn)}
                </Typography>
              </Box>
            )}

          </Stack>
        </DialogContent>


        <DialogActions sx={{ p: 3 }}>
          <Button variant="contained" onClick={() => setOpenRecognitionDetail(false)}>
            Zatvoriť
          </Button>
        </DialogActions>
      </Dialog>



      <Dialog
        open={openPendingDialog}
        onClose={() => setOpenPendingDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Schválenie uznania
          <IconButton
            onClick={() => setOpenPendingDialog(false)}
            sx={{ position: "absolute", right: 16, top: 16 }}
          >
            ✕
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>

            {/* Odosielateľ */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">
                Odosielateľ
              </Typography>
              <Typography>
                {pendingRecognition?.createdBy?.fullName}
              </Typography>
            </Box>

            {/* Príjemcovia */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>
                {pendingRecognition?.recipient?.fullName}
              </Typography>
            </Box>

            {/* Text */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">
                Text uznania
              </Typography>
              <Typography sx={{ maxWidth: 350, textAlign: "right" }}>
                {pendingRecognition?.text}
              </Typography>
            </Box>

            {/* Dátum */}
            {pendingRecognition?.dateIn && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">
                  Dátum odoslania
                </Typography>
                <Typography>
                  {formatDateTime(pendingRecognition.dateIn)}
                </Typography>
              </Box>
            )}


            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">
                Navrhnutá odmena
              </Typography>
              <Typography>
                {pendingRecognition?.recipient?.odmena}
              </Typography>
            </Box>


            {/* ← NOVÝ VÝBEROVNÍK */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography color="text.secondary">
                Rozhodnutie
              </Typography>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <Select
                  value={decision}
                  onChange={(e) => {
                    setDecision(e.target.value as 'approve' | 'modify' | 'reject' | '');
                    setModifiedReward(null);
                    setRejectReason('');
                  }}
                  displayEmpty
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& .MuiSvgIcon-root': { color: 'white' },
                  }}
                >
                  <MenuItem value="" disabled>Vyberte rozhodnutie</MenuItem>
                  <MenuItem value="approve">Schváliť</MenuItem>
                  <MenuItem value="modify">Schváliť s úpravou</MenuItem>
                  <MenuItem value="reject">Odmietnuť</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {decision === 'modify' && (
              <Box>
                <Typography color="text.secondary" mb={1}>
                  Upraviť odmenu
                </Typography>
                <Stack direction="row" spacing={2}>
                  {[0, 50, 100, 200].map((value) => (
                    <Button
                      key={value}
                      variant={modifiedReward === value ? 'contained' : 'outlined'}
                      onClick={() => setModifiedReward(value)}
                    >
                      {value} €
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}

            {decision === 'reject' && (
              <Box>
                <Typography color="text.secondary" mb={1}>
                  Dôvod zamietnutia
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </Box>
            )}



            <DialogActions>
              <Box sx={{ display: 'flex', gap: 2 }}>
                
                <Button
                  variant="outlined"
                  color="warning"
                  sx={{
                    padding: '5px 20px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textTransform: 'none', // zruší veľké písmená
                  }}
                  onClick={() => setOpenPendingDialog(false)}
                >
                  Zrušiť
                </Button>

                <Button
                  variant="contained"
                  color="info"
                  sx={{
                    padding: '8px 24px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                  onClick={handleSubmitDecision}
                >
                  Uložiť
                </Button>

              </Box>
            </DialogActions>


          </Stack>
        </DialogContent>

        
      </Dialog>


    </Layout>
  );
};

export default ManageRecognitions;