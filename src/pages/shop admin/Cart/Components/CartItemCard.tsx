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
  const { updateQuantity, removeFromCart, items } = useCart();
  const { openSnackbar } = useSnackbar();

  const cartItem = items.find(i => i.id === item.id);

  const remainingStock =
    (item.size ?? 0) - (cartItem?.quantity ?? 0);

  return (
    <Paper sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between" }}>
      <Box display="flex" gap={2} alignItems="center">
        <img src={item.image} style={{ width: 120 }} />
        <Typography fontWeight="bold">{item.name}</Typography>
      </Box>

      <Stack direction="row" spacing={3} alignItems="center">
        <IconButton onClick={() => {
          const result = updateQuantity(item.id, -1);
          if (result === "points") {
            openSnackbar("Nemáš dostatok bodov", "error");
          }
          if (result === "stock") {
            openSnackbar("Nie je dostatok kusov na sklade", "error");
          }
        }}>
          <Remove />
        </IconButton>

        <Typography>{item.quantity}</Typography>

        <IconButton 
          disabled={remainingStock <= 0}
          onClick={() => {
            const result = updateQuantity(item.id, 1);
            if (result === "points") {
              openSnackbar("Nemáš dostatok bodov", "error");
            }
            if (result === "stock") {
              openSnackbar("Nie je dostatok kusov na sklade", "error");
            }
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