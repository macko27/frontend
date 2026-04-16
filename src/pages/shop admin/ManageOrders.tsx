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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import api from "../../app/api";
import { useSnackbar } from "../../hooks/SnackBarContext";
import { OrderState } from "../../types/Shop/OrderState";

type Order = {
  id: string;
  totalPrice: number;
  status: OrderState;
  createdAt: string;
};

const statusColors: Record<OrderState, { bg: string; color: string }> = {
  Vytvorena: { bg: "#f0f0f0", color: "#555" },
  Potvrdena: { bg: "#cce8ff", color: "#0066cc" },
  Odoslana: { bg: "#fff3cc", color: "#996600" },
  Dorucena: { bg: "#ccf0d8", color: "#1a7a3a" },
  Zrusena: { bg: "#ffd6d6", color: "#cc2200" },
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
};

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [creator, setCreator] = useState<any>(null);
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();

  useEffect(() => {

    api.get(`/Shop/GetMyOrders/${creator?.employeeId}`)
      .then((res) => {
        setOrders(res.data);
        setLoaded(true);
      })
      .catch(() => {
        openSnackbar("Nepodarilo sa načítať objednávky", "error");
        setLoaded(true);
      });
  }, []);


  useEffect(() => {
      api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
        .then(res => setCreator(res.data))
        .catch(() => openSnackbar('Nepodarilo sa načítať údaje používateľa', 'error'));
    }, []);

  return (
    <Layout fullWidth={true}>
      <Box sx={{ p: 4, maxWidth: 1100, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h5" fontWeight="700">
            Moje objednávky
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/shop")}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              backgroundColor: "#333",
              px: 2.5,
              "&:hover": { backgroundColor: "#111" },
            }}
          >
            Späť do e-shopu
          </Button>
        </Box>

        {/* Table */}
        {!loaded ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : orders.length === 0 ? (
          <Typography color="text.secondary">Nemáte žiadne objednávky.</Typography>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  {["Číslo objednávky", "Cena", "Stav", "Dátum", ""].map((header) => (
                    <TableCell
                      key={header}
                      sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#444", borderBottom: "1px solid #e0e0e0" }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {orders.map((order) => {
                  const statusStyle = statusColors[order.status] ?? { bg: "#eee", color: "#333" };
                  return (
                    <TableRow
                      key={order.id}
                      sx={{
                        "&:not(:last-child) td": { borderBottom: "1px solid #efefef" },
                        "&:hover": { backgroundColor: "#fafafa" },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{order.id}</TableCell>
                      <TableCell>{order.totalPrice.toLocaleString("sk-SK")} bodov</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          sx={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            border: "none",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#555" }}>{formatDate(order.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/shop/orders/${order.id}`)}
                          sx={{
                            borderRadius: 999,
                            textTransform: "none",
                            fontWeight: 500,
                            fontSize: "0.8rem",
                            color: "#333",
                            borderColor: "#ccc",
                            px: 2,
                            "&:hover": { borderColor: "#999", backgroundColor: "#f5f5f5" },
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
    </Layout>
  );
};

export default ManageOrders;