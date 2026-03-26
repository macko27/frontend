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

  const [attachments, setAttachments] = useState<{ id: string; fileName: string; }[]>([]);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);

  const [pointsBalance, setPointsBalance] = useState<number>(0);

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


  const handleToggleAttachments = async (recognitionId: string) => {
    if (attachmentsOpen) {
      setAttachmentsOpen(false);
      return;
    }
    try {
      setAttachmentsLoading(true);
      const res = await api.get(`/Recognition/GetAttachments/${recognitionId}`);
      setAttachments(res.data);
      setAttachmentsOpen(true);
    } catch {
      openSnackbar('Nepodarilo sa načítať prílohy', 'error');
    } finally {
      setAttachmentsLoading(false);
    }
  };


   const handleDownloadAttachment = async (id: string, fileName: string) => {
    try {
      const res = await api.get(`/Recognition/DownloadAttachment/${id}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');

      a.href = url;
      a.download = fileName;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      openSnackbar('Chyba pri sťahovaní súboru', 'error');
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
    // Reset príloh pri každom otvorení
    setAttachmentsOpen(false);
    setAttachments([]);

    if (tab === 2) {
      setPendingRecognition(recognition as RecognitionToApprove);
      setOpenPendingDialog(true);
    } else {
      setDetailRecognition(recognition as Recognition);
      setOpenRecognitionDetail(true);
    }
  };


  useEffect(() => {
    if (openPendingDialog) {
      // reset vstupov pri otvorení modalu
      setDecision('');
      setModifiedReward(null);
      setRejectReason('');
    }
  }, [openPendingDialog]);


  useEffect(() => {
    if (!creator?.employeeId) return;

    loadRecognitions(creator.employeeId, tab);

    api.get(`/Recognition/GetPointsBalance/${creator.employeeId}`)
      .then(res => setPointsBalance(res.data))
      .catch(() => openSnackbar('Nepodarilo sa načítať body', 'error'));

  }, [creator, tab]);


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
  

  // Kontrola, či má byť tlačidlo Uložiť zakázané
  const isSubmitDisabled = (() => {
    if (!decision) return true;
    if (decision === 'modify' && (modifiedReward === null || modifiedReward === pendingRecognition?.recipient?.odmena)) return true;
    if (decision === 'reject' && !rejectReason.trim()) return true;
    return false;
  })();

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
    { field: 'odmena', headerName: 'Odmena', flex: 1, minWidth: 50, headerClassName: 'header',
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    {
      field: 'state',
      headerName: 'Stav',
      flex: 1.5,
      minWidth: 150,
      headerClassName: 'header',
      renderCell: (params) => {
        // pre doručené a odoslané berieme stav prvého recipienta
        const stateNumber: number = params.row.recipients?.[0]?.state ?? params.row.recipient?.state ?? 0;

        let stateText = '';
        switch (stateNumber) {
          case 0: stateText = 'Čakajúca'; break;
          case 1: stateText = 'Schválená'; break;
          case 2: stateText = 'Schválená s úpravou'; break;
          case 3: stateText = 'Zamietnutá'; break;
          default: stateText = '-'; break;
        }

        return (
          <Typography sx={{ textAlign: 'center', width: '100%' }}>
            {stateText}
          </Typography>
        );
      }
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

  // Stĺpce pre tab 2 – Na schválenie
  const columnsForApproval: GridColDef[] = [
    {
      field: 'person',
      headerName: 'Príjemca',
      headerClassName: 'header',
      flex: 2,
      renderCell: (params) => <span>{params.row.recipient.fullName}</span>,
    },
    {
      field: 'predmet',
      headerName: 'Predmet',
      flex: 2,
      minWidth: 200,
      headerClassName: 'header',
    },
    {
    field: 'state',
    headerName: 'Stav',
    flex: 1.5,
    minWidth: 150,
    headerClassName: 'header',
    renderCell: (params) => {
      const stateNumber: number = params.row.recipient.state;

      let stateText = '';
      let color = 'text.primary';

      switch (stateNumber) {
        case 0:
          stateText = 'Čakajúca';
          color = 'warning.main';
          break;
        case 1:
          stateText = 'Schválená';
          color = 'success.main';
          break;
        case 2:
          stateText = 'Schválená s úpravou';
          color = 'success.light';
          break;
        case 3:
          stateText = 'Zamietnutá';
          color = 'error.main';
          break;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'center',  
            width: '100%',
            height: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
            }}
          >
            {stateText}
          </Typography>
        </Box>
      );
    },
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
        <Button size="small" variant="contained" onClick={() => handleShowRecognitionDetail(params.row)}>
          Zobraziť
        </Button>
      ),
    },
  ];

  return (
    <Layout fullWidth={isMobile}>
      <Box sx={{ padding: 3, flexDirection: 'column', alignItems: 'flex-start' }}>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
  
          <Typography variant="h4" fontWeight="bold">
            Uznania a odmeny
          </Typography>

          <Box
            sx={{
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column', // 👈 toto je kľúčové
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 120
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Moje body
            </Typography>

            <Typography
              variant="h5"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 'bold'
              }}
            >
              🪙 {pointsBalance}
            </Typography>
          </Box>

        </Box>

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
                columns={columnsForApproval}
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
        onClose={() => { setOpenRecognitionDetail(false); setAttachmentsOpen(false); setAttachments([]); }}
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

            {/* Prílohy */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography color="text.secondary">Prílohy</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={attachmentsLoading}
                  onClick={() =>
                    handleToggleAttachments(
                      tab === 2
                        ? pendingRecognition!.recognitionId
                        : detailRecognition!.id
                    )
                  }
                >
                  {attachmentsLoading ? 'Načítavam...' : attachmentsOpen ? 'Skryť' : 'Zobraziť'}
                </Button>
              </Box>

              {attachmentsOpen && (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {attachments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Žiadne prílohy
                    </Typography>
                  ) : (
                    attachments.map((file, i) => (
                      <Button
                        key={i}
                        size="small"
                        variant="text"
                        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        onClick={() => handleDownloadAttachment(file.id, file.fileName)}
                      >
                        📎 {file.fileName}
                      </Button>
                    ))
                  )}
                </Box>
              )}
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
        onClose={() => { setOpenPendingDialog(false); setAttachmentsOpen(false); setAttachments([]); }}
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

            {/* Prílohy */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography color="text.secondary">Prílohy</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={attachmentsLoading}
                  onClick={() =>
                    handleToggleAttachments(
                      tab === 2
                        ? pendingRecognition!.recognitionId
                        : detailRecognition!.id
                    )
                  }
                >
                  {attachmentsLoading ? 'Načítavam...' : attachmentsOpen ? 'Skryť' : 'Zobraziť'}
                </Button>
              </Box>

              {attachmentsOpen && (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {attachments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Žiadne prílohy
                    </Typography>
                  ) : (
                    attachments.map((file, i) => (
                      <Button
                        key={i}
                        size="small"
                        variant="text"
                        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        onClick={() => handleDownloadAttachment(file.id, file.fileName)}
                      >
                        📎 {file.fileName}
                      </Button>
                    ))
                  )}
                </Box>
              )}
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
              <Stack direction="row" spacing={1}>
                {[20, 50, 100, 200].map((value) => {
                  const isSelected = modifiedReward === value;
                  return (
                    <Button
                      key={value}
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
                      onClick={() => setModifiedReward(isSelected ? null : value)}
                    >
                      {value}
                    </Button>
                  );
                })}
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
                  disabled={isSubmitDisabled}
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