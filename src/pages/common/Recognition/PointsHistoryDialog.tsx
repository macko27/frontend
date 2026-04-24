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
import { Order } from "../../../types/Shop/Order";
import OrderDetailDialog from "../../shop admin/Order/OrderDetailDialog";
import RecognitionDetailDialog from "./RecognitionDetailDialog";
import { Recognition } from "../../../types/Recognition/Recognition";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string | null;
}

const PointsHistoryDialog = ({ open, onClose, employeeId }: Props) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);

  const [openRecognitionDetail, setOpenRecognitionDetail] = useState(false);
  const [detailRecognition, setDetailRecognition] = useState<Recognition | null>(null);
  const [attachments, setAttachments] = useState([]);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);

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
              alignItems: 'center',
              height: '100%',
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
        renderCell: (params) => {
          const isOrder = (params.row.type === "Nákup" || params.row.type === "Refundácia");
          const isRecognition = params.row.type === "Uznanie";

          return (
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center", alignItems: 'center', width: '100%', height: '100%', }}>
      
              {/* OBJEDNÁVKA */}
              {isOrder && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={async () => {
                    try {
                      const res = await api.get(
                        `/Shop/GetOrder/${params.row.recognitionId}`
                      );
                      setSelectedOrder(res.data);
                      setOrderOpen(true);
                    } catch {
                      openSnackbar("Nepodarilo sa načítať objednávku", "error");
                    }
                  }}
                >
                  Zobraziť
                </Button>
              )}

              {/* UZNANIE */}
              {isRecognition && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={async () => {
                    try {
                      const res = await api.get(
                        `/Recognition/GetDetail/${params.row.recognitionId}`
                      );

                      setDetailRecognition(res.data);
                      setOpenRecognitionDetail(true);
                    } catch {
                      openSnackbar("Nepodarilo sa načítať uznanie", "error");
                    }
                  }}
                >
                  Zobraziť
                </Button>
              )}

            </Box>
          );
        }
    }
  ];

  return (
    <>
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

      <OrderDetailDialog
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        order={selectedOrder}
      />

      <RecognitionDetailDialog
        open={openRecognitionDetail}
        onClose={() => {
          setOpenRecognitionDetail(false);
          setAttachmentsOpen(false);
          setAttachments([]);
        }}
        recognition={detailRecognition}
        formatDateTime={formatDateTime}
        attachments={attachments}
        attachmentsOpen={attachmentsOpen}
        attachmentsLoading={attachmentsLoading}
        onToggleAttachments={() =>
          handleToggleAttachments(detailRecognition!.id)
        }
        onDownload={handleDownloadAttachment}
      />
    </>
  );
};

export default PointsHistoryDialog;