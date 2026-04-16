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
import { useCart } from "./../CartContext";
import { useSnackbar } from "../../../../hooks/SnackBarContext";
import { CartItem } from "../../../../types/Shop/CartItem";

interface CartItemCardProps {
  item: CartItem;
}

const CartItemCard = ({ item }: CartItemCardProps) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { openSnackbar } = useSnackbar();

  return (
    <Paper sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between" }}>
      <Box display="flex" gap={2} alignItems="center">
        <img src={item.image} style={{ width: 120 }} />
        <Typography fontWeight="bold">{item.name}</Typography>
      </Box>

      <Stack direction="row" spacing={3} alignItems="center">
        <IconButton onClick={() => {
          const ok = updateQuantity(item.id, -1);
          if (!ok) openSnackbar("Nemáš dostatok bodov", "error");
        }}>
          <Remove />
        </IconButton>

        <Typography>{item.quantity}</Typography>

        <IconButton onClick={() => {
          const ok = updateQuantity(item.id, 1);
          if (!ok) openSnackbar("Nemáš dostatok bodov", "error");
        }}>
          <Add />
        </IconButton>

        <Typography>{item.price * item.quantity} bodov</Typography>

        <IconButton onClick={() => removeFromCart(item.id)}>
          <Delete />
        </IconButton>
      </Stack>
    </Paper>
  );
};

export default CartItemCard;