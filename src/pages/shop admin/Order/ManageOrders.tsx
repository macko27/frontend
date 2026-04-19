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
import Layout from "../../../components/Layout";
import api from "../../../app/api";
import { useSnackbar } from "../../../hooks/SnackBarContext";
import { EmployeeCard } from "../../../types/EmployeeCard";
import { Order } from "../../../types/Shop/Order";

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

  useEffect(() => {
    setLoaded(false);

    api
      .get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
      .then((res) => setCreator(res.data))
      .catch(() => {
        openSnackbar("Nepodarilo sa nacitat udaje pouzivatela", "error");
        setLoaded(true);
      });
  }, [openSnackbar]);

  useEffect(() => {
    if (!creator?.employeeId) return;

    setLoaded(false);
    api
      .get(`/Shop/GetMyOrders/${creator.employeeId}`)
      .then((res) => {
        setOrders(res.data);
        setLoaded(true);
      })
      .catch(() => {
        openSnackbar("Nepodarilo sa nacitat objednavky", "error");
        setLoaded(true);
      });
  }, [creator, openSnackbar]);

  return (
    <Layout fullWidth={true}>
      <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
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
                  {["Číslo objednávky", "Cena", "Stav", "Dátum", ""].map((header) => (
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
                      <TableCell >{formatPrice(order.cena)}</TableCell>
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
                          //onClick={() => navigate(`/shop/orders/${order.id}`)}
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
    </Layout>
  );
};

export default ManageOrders;
