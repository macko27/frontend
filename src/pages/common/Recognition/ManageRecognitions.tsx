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
  const [loaded, setLoaded] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailRecognition, setDetailRecognition] = useState<Recognition | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [creator, setCreator] = useState<EmployeeCard | null>(null);

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

  const handleShowDetail = (row: Recognition) => {
    setDetailRecognition(row);
    setOpenDetail(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setOpenDeleteConfirm(true);
  };


  const columns: GridColDef[] = [
    { field: 'predmet', headerName: 'Predmet', flex: 2, minWidth: 200 },
    { field: 'text', headerName: 'Text', flex: 3, minWidth: 300 },
    { field: 'odmena', headerName: 'Odmena', flex: 1, minWidth: 100 },
    {
      field: 'actions',
      headerName: 'Akcia',
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="contained" onClick={() => handleShowDetail(params.row)}>
            Zobraziť
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteClick(params.row.id)}>
            Vymazať
          </Button>
        </Box>
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
            onClick={() => nav('/createSurvey')}
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
                rows={recognitions}
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
                rows={recognitions}
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
    </Layout>
  );
};

export default ManageRecognitions;