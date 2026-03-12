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
  FormControlLabel, 
  Checkbox,
  Popover
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
dayjs.extend(utc);

const ManageRecognitions: React.FC = () => {
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);

  const sortedRecognitions = [...recognitions].sort(
    (a, b) => new Date(b.DateIn).getTime() - new Date(a.DateIn).getTime()
  );

  const [loaded, setLoaded] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [creator, setCreator] = useState<EmployeeCard | null>(null);
  const [openRecognitionDetail, setOpenRecognitionDetail] = useState(false);
  const [detailRecognition, setDetailRecognition] = useState<Recognition | null>(null);

  const nav = useNavigate();
  const { openSnackbar } = useSnackbar();
  const profile = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return dayjs.utc(dateStr).local().format('DD.MM.YYYY HH:mm');
  };

  const loadRecognitions = async (employeeId: string, selectedTab: number) => {
    try {
        if (selectedTab === 0) {
            const res = await api.get(`/Recognition/GetRecieved/${employeeId}`); // endpoint pre všetky recognitions
            setRecognitions(res.data);
            setLoaded(true);
        } else {
            const res = await api.get(`/Recognition/GetSent/${employeeId}`); // endpoint pre všetky recognitions
            setRecognitions(res.data);
            setLoaded(true);
        }
    } catch (err) {
      console.error('Chyba pri načítaní rozpoznaní:', err);
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


  const handleShowRecognitionDetail = (recognition: Recognition) => {
    console.log("Selected recognition:", recognition);
    setDetailRecognition(recognition);
    setOpenRecognitionDetail(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'person',
      headerName: tab === 0 ? 'Odosielateľ' : 'Príjemca',
      flex: 2,
      minWidth: 200,
      headerClassName: 'header',
      renderCell: (params) => {
        if (tab === 0) {
          // Doručené – zobraziť kto poslal uznanie
          return <span>{params.row.createdByName}</span>;
        } else {
          // Odoslané – zobraziť príjemcov
          return (
            <span>
              {params.row.recipients?.[0]?.fullName}
            </span>
          );
        }
      },
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

        </Box>


      </Box>


      <Dialog
        open={openRecognitionDetail}
        onClose={() => setOpenRecognitionDetail(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {detailRecognition?.Predmet}
          <IconButton
            onClick={() => setOpenRecognitionDetail(false)}
            sx={{ position: 'absolute', right: 16, top: 16 }}
          >
            ✕
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography fontWeight="bold">Text uznania</Typography>
              <Typography>{detailRecognition?.Text}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight="bold">{tab === 0 ? "Odosielateľ" : "Príjemca"}</Typography>
              <Typography>
                {tab === 0
                  ? detailRecognition?.CreatedBy
                  : detailRecognition?.CreatedBy || "-"}
              </Typography>
            </Box>

            {detailRecognition?.DateIn && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight="bold">Dátum vytvorenia</Typography>
                <Typography>{formatDateTime(detailRecognition.DateIn)}</Typography>
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
    </Layout>
  );
};

export default ManageRecognitions;