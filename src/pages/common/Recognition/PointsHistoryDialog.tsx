import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import api from '../../../app/api';
import { useSnackbar } from '../../../hooks/SnackBarContext';
import dayjs from "dayjs";
import { useTheme } from '@mui/material/styles';
import { dataGridStyles } from '../../../styles/gridStyle';

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string | null;
}

const PointsHistoryDialog = ({ open, onClose, employeeId }: Props) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { openSnackbar } = useSnackbar();

  const theme = useTheme();

  const formatDateTime = (date?: string) => {
    if (!date) return "-";
    return dayjs(date).format("DD.MM.YYYY HH:mm");
  };

  useEffect(() => {
    if (!open || !employeeId) return;

    const load = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/Recognition/GetPointsHistory/${employeeId}`);

        setRows(res.data);
      } catch (err) {
        openSnackbar("Nepodarilo sa načítať históriu bodov", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, employeeId]);

  const columns: GridColDef[] = [
    {
      field: "date",
      headerName: "Dátum",
      headerClassName: 'header',
      flex: 1,
      renderCell: (params) => formatDateTime(params.row.date),
    },
    {
      field: "type",
      headerName: "Typ",
      headerClassName: 'header',
      flex: 1,
    },
    {
      field: "description",
      headerName: "Popis",
      headerClassName: 'header',
      flex: 4,
    },
    {
      field: "points",
      headerName: "Body",
      headerClassName: 'header',
      flex: 1,
      renderCell: (params) => {
        let value = params.row.points;
        const isPositive = params.row.isPositive;

        if (!isPositive) {
            if (value > 0) {
                value = `-${value}`;
            }
        }

        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Typography color={isPositive ? "success.main" : "error.main"}>
              {value}
            </Typography>
          </Box>
        );
      },
    },
    {
        field: 'actions',
        headerName: 'Akcia',
        headerClassName: 'header',
        renderCell: (params) => (
        <Button
            size="small"
            variant="contained"
        >
            Zobraziť
        </Button>
        )
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        História bodov
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          autoHeight
          pageSizeOptions={[5, 10, 25]}
          sx={dataGridStyles(theme)} 
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Zavrieť</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PointsHistoryDialog;