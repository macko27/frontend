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

interface CartSummaryProps {
  totalItems: number;
  totalPoints: number;
  availablePoints: number;
  remaining: number;
  buttonLabel: string;
  onAction: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  totalItems,
  totalPoints,
  availablePoints,
  remaining,
  buttonLabel,
  onAction,
}) => {
  return (
    <Box sx={{ flex: 1 }}>
      <Paper sx={{ p: 3 }}>
        <Typography fontWeight="bold">Zhrnutie objednávky</Typography>

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

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between">
          <Typography>Zostatok</Typography>
          <Typography>{remaining}</Typography>
        </Box>

        <Button
            fullWidth
            variant="contained"
            color="info"
            sx={{ mt: 3, borderRadius: 5 }}
            onClick={onAction}
            >
            {buttonLabel}
            </Button>
      </Paper>
    </Box>
  );
};

export default CartSummary;