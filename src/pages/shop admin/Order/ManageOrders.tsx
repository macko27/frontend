import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/Layout";
import api from "../../../app/api";
import { useSnackbar } from "../../../hooks/SnackBarContext";
import { EmployeeCard } from "../../../types/EmployeeCard";
import { Order } from "../../../types/Shop/Order";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthProvider";
import OrderDetailDialog from "./OrderDetailDialog";

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
  0: [1, 4], // Vytvorená → Potvrdená / Zrušená
  1: [2, 4], // Potvrdená → Odoslaná / Zrušená
  2: [3, 4], // Odoslaná → Doručená / Zrušená
  3: [4],    // Doručená → Zrušená (len fallback)
  4: [],     // Zrušená → nič
};


const getAvailableStatuses = (currentStatus: number) => {
  const next = allowedTransitions[currentStatus] ?? [];

  const safe = Array.from(new Set([currentStatus, ...next]));

  return safe;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
};

const formatPrice = (price: number) => `${price.toLocaleString("sk-SK")} bodov`;

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [creator, setCreator] = useState<EmployeeCard | null>(null);
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [open, setOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [draftStatus, setDraftStatus] = useState<number | null>(null);
  const isChanged = draftStatus !== selectedOrder?.stav;

  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode"); // "my" | "all"
  const profile = useAuth();
  const role = profile.userProfile?.role;
  const isAdmin = role === "Shop Admin";  

  useEffect(() => {
    setLoaded(false);

    const load = async () => {
      try {
        const userRes = await api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`);
        const creatorData = userRes.data;
        setCreator(creatorData);

        const rolee = profile.userProfile?.role;
        const isAdminn = rolee === "Shop Admin";

        const shouldLoadAll = mode === "all" && isAdminn;

        if (shouldLoadAll) {
          // SHOP ADMIN VIEW
          const res = await api.get(`/Shop/GetAllOrders`);
          setOrders(res.data);
        } else {
          // DEFAULT = moje objednavky
          const res = await api.get(`/Shop/GetMyOrders/${creatorData.employeeId}`);
          setOrders(res.data);
        }

        setLoaded(true);
      } catch (e) {
        openSnackbar("Nepodarilo sa nacitat objednavky", "error");
        setLoaded(true);
      }
    };

    load();
  }, [mode, profile.userProfile?.role]);


  return (
    <Layout fullWidth={true}>
      <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h5" fontWeight="700">
            {mode === "all" && isAdmin ? "Objednávky" : "Moje objednávky"}
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/shop")}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.9rem",
              backgroundColor: "#6b6b6b",
              color: "white",
              px: 2,
              py: 0.5,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#4f4f4f" },
            }}
          >
            Späť do e-shopu
          </Button>

        </Box>

        {!loaded ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Typography color="text.secondary">Nemáte žiadne objednávky.</Typography>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "16px",
              px: 2,
              py: 1.5,
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      borderBottom: "none",
                      py: 1.6,
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    },
                    "& th:first-of-type": {
                      borderTopLeftRadius: "999px",
                      borderBottomLeftRadius: "999px",
                      pl: 3,
                    },
                    "& th:last-of-type": {
                      borderTopRightRadius: "999px",
                      borderBottomRightRadius: "999px",
                      pr: 3,
                    },
                  }}
                >
                  {[
                    "Číslo objednávky", 
                    mode === "all" && isAdmin ? "Používateľ" : "Cena",
                    "Stav", 
                    "Dátum", ""
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.95rem",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.map((order) => {
                  const statusStyle = statusColors[order.stav] ?? { bg: "#eee", color: "#333" };
                  const statusLabel = statusLabels[order.stav] ?? order.stav;
                  return (
                    <TableRow
                      key={order.id}
                      sx={{
                        "& td": {
                          borderBottom: "1px solid #e5e5e5",
                          py: 2,
                          fontSize: "0.95rem",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{order.cisloObjednavky}</TableCell>

                      <TableCell >
                        {mode === "all" && isAdmin
                          ? order.pouzivatel
                          : formatPrice(order.cena)}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={statusLabel}
                          size="small"
                          sx={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 500,
                            fontSize: "0.8rem",
                            borderRadius: "999px",
                            height: 26,
                            "& .MuiChip-label": {
                              px: 1.2,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(order.dateIn)}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setDraftStatus(order.stav);
                            setOpen(true);
                          }}
                          sx={{
                            borderRadius: 999,
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: "0.85rem",
                            color: "#555",
                            borderColor: "#d0d0d0",
                            minWidth: 110,
                            px: 2,
                            py: 0.5,
                            backgroundColor: "#fff",
                            "&:hover": {
                              borderColor: "#aaa",
                              backgroundColor: "#f3f3f3",
                            },
                          }}
                        >
                          Zobraziť
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>


      {/* Detail objednavky - dialog */}
      <OrderDetailDialog
        open={open}
        onClose={() => setOpen(false)}
        order={selectedOrder}
        isAdmin={isAdmin}
        onStatusUpdated={(id, status) => {
          setOrders(prev =>
            prev.map(o =>
              o.id === id ? { ...o, stav: status } : o
            )
          );
        }}
      />

    </Layout>
  );
};

export default ManageOrders;
