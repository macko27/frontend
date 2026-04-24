import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Divider,
  Button,
  FormControl,
  Select,
  MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useEffect } from "react";
import api from "../../../app/api";
import { useSnackbar } from "../../../hooks/SnackBarContext";
import { Order } from "../../../types/Shop/Order";

interface Props {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  isAdmin?: boolean;
  onStatusUpdated?: (orderId: string, newStatus: number) => void;
}

const statusColors: Record<number, { bg: string; color: string }> = {
  0: { bg: "#ededed", color: "#3c3c3c" },
  1: { bg: "#bfeeff", color: "#1b5f78" },
  2: { bg: "#ffe57a", color: "#5f4d00" },
  3: { bg: "#a9efb9", color: "#17653a" },
  4: { bg: "#ffc9c4", color: "#8f2b23" },
};

const statusLabels: Record<number, string> = {
  0: "Vytvorená",
  1: "Potvrdená",
  2: "Odoslaná",
  3: "Doručená",
  4: "Zrušená",
};

const allowedTransitions: Record<number, number[]> = {
  0: [1, 4],
  1: [2, 4],
  2: [3, 4],
  3: [4],
  4: [],
};

const getAvailableStatuses = (currentStatus: number) => {
  const next = allowedTransitions[currentStatus] ?? [];
  return Array.from(new Set([currentStatus, ...next]));
};

const formatPrice = (price: number) => {
  if (price == null) return "-";

  return `${price.toLocaleString("sk-SK")} bodov`;
};

const OrderDetailDialog = ({
  open,
  onClose,
  order,
  isAdmin = false,
  onStatusUpdated,
}: Props) => {
  const { openSnackbar } = useSnackbar();

  const [draftStatus, setDraftStatus] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (order) {
      setDraftStatus(order.stav);
    }
  }, [order]);

  const isChanged = draftStatus !== order?.stav;

  const handleSaveStatus = async () => {
    if (!order || draftStatus == null) return;

    try {
      setUpdatingStatus(true);

      await api.put(`/Shop/UpdateOrderStatus/${order.id}`, {
        stav: draftStatus,
      });

      openSnackbar("Stav objednávky bol aktualizovaný", "success");

      onStatusUpdated?.(order.id, draftStatus);

      onClose();
    } catch {
      openSnackbar("Nepodarilo sa zmeniť stav", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Objednávka {order.cisloObjednavky}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* INFO */}
        <Box sx={{ display: "flex", gap: 2, py: 1.5, flexWrap: "wrap" }}>

          {isAdmin && (
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Typography variant="body2" color="text.secondary">
                Používateľ
              </Typography>
              <Typography variant="body2">
                {order.pouzivatel}
              </Typography>
            </Box>
          )}

          {/* STATUS */}
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Typography variant="body2" color="text.secondary">
              Stav
            </Typography>

            {isAdmin ? (
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={draftStatus ?? order.stav}
                  onChange={(e) => setDraftStatus(Number(e.target.value))}
                  disabled={updatingStatus}
                >
                  {getAvailableStatuses(order.stav).map((key) => (
                    <MenuItem key={key} value={key}>
                      {statusLabels[key]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Chip
                label={statusLabels[order.stav]}
                sx={{
                  backgroundColor: statusColors[order.stav]?.bg,
                  color: statusColors[order.stav]?.color,
                }}
              />
            )}
          </Box>

          {/* DATE */}
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Typography variant="body2" color="text.secondary">
              Dátum a čas
            </Typography>

            <Typography variant="body2">
              {new Date(order.dateIn).toLocaleString("sk-SK")}
            </Typography>
          </Box>
        </Box>

        {/* PRODUKTY */}
        <Typography variant="body2" color="text.secondary">
          Položky objednávky
        </Typography>

        <Divider sx={{ mt: 1 }} />

        {order.produkty?.map((p, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, py: 1.5 }}>
            <Box
              component="img"
              src={p.imageUrl}
              alt={p.name}
              sx={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
              }}
            />

            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={500}>
                {p.name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {p.quantity}x
              </Typography>
            </Box>

            <Typography fontWeight={500}>
              {formatPrice(p.price)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ mb: 2 }} />

        {/* CELKOM */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Typography fontWeight={600}>Celkom</Typography>
          <Typography fontWeight={600}>
            {formatPrice(order.cena)}
          </Typography>
        </Box>

        {/* ACTIONS */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
          <Button onClick={onClose}>
            Zavrieť
          </Button>

          {isAdmin && (
            <Button
              variant="contained"
              color="info"
              onClick={handleSaveStatus}
              disabled={!isChanged || updatingStatus}
            >
              Uložiť
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailDialog;