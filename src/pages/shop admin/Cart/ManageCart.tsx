import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import Layout from "../../../components/Layout";
import { CartItem } from "../../../types/Shop/CartItem";
import { useCart } from "./CartContext";
import { useSnackbar } from "../../../hooks/SnackBarContext";


const ManageCart: React.FC = () => {
  const { openSnackbar } = useSnackbar();
  const { items, updateQuantity, removeFromCart, pointsBalance, setUserId } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPoints = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const availablePoints = pointsBalance;
  const remaining = availablePoints - totalPoints;


  return (
    <Layout fullWidth>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" mb={4}>
          Košík
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 4,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* LEFT - ITEMS */}
          <Box sx={{ flex: 2 }}>

            <Paper
              sx={{
                p: 2,
                mb: 2,
                display: { xs: "none", md: "flex" },
                justifyContent: "space-between",
                backgroundImage: "none",
                backgroundColor: "transparent",
                fontWeight: "bold",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography sx={{ width: 120 }}>Produkt</Typography>
              </Box>

              <Stack direction="row" alignItems="center" spacing={10}>
                <Typography>Počet</Typography>
                <Typography>Cena</Typography>
                <Typography>Akcia</Typography>
              </Stack>
            </Paper>

            {items.map((item) => (
              <Paper
                key={item.id}
                sx={{
                  p: 2,
                  mb: 2,
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "flex-start", md: "center" },
                  justifyContent: "space-between",
                  gap: 2,
                  minHeight: 150
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ 
                      width: 120,
                      height: 100,
                      borderRadius: 8 
                    }}
                  />

                  <Typography fontWeight="bold">{item.name}</Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={{ xs: 2, md: 5 }}>
                  <Paper
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 1,
                      borderRadius: 3,
                    }}
                  >
                    <IconButton onClick={() => {
                       const success = updateQuantity(item.id, -1);

                       if (!success) {
                          openSnackbar("Nemáš dostatok bodov", "error");
                        }
                      
                      }}
                    >
                      <Remove />
                    </IconButton>

                    <Typography>{item.quantity}</Typography>

                   <IconButton
                      onClick={() => {
                        const success = updateQuantity(item.id, 1);

                        if (!success) {
                          openSnackbar("Nemáš dostatok bodov", "error");
                        }
                      }}
                    >
                      <Add />
                  </IconButton>
                  </Paper>

                  <Typography fontWeight="bold">
                    {item.price * item.quantity} bodov
                  </Typography>

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.id);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              </Paper>
            ))}

            <Button variant="contained" href="/shop" sx={{ mt: 4 }}>
                Späť do e-shopu
            </Button>
          </Box>

          {/* RIGHT - SUMMARY */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography fontWeight="bold" mb={2}>
                Zhrnutie objednávky
              </Typography>

              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Počet položiek</Typography>
                  <Typography>{totalItems}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography>Celkom</Typography>
                  <Typography>{totalPoints} bodov</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography>Dostupné body</Typography>
                  <Typography>{availablePoints}</Typography>
                </Box>

                <Divider />

                <Box display="flex" justifyContent="space-between">
                  <Typography>Zostatok po nákupe</Typography>
                  <Typography>{remaining}</Typography>
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                color="info"
                sx={{ mt: 3, borderRadius: 5 }}
              >
                Pokračovať na adresu
              </Button>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default ManageCart;
