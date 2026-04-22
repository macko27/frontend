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
import { useNavigate } from "react-router-dom";

import CartList from "./Components/CartList";
import CartSummary from "./Components/CartSummary";
import AddressForm from "./Components/AddressForm";


const ManageCart: React.FC = () => {
  const { items, pointsBalance } = useCart();

  const navigate = useNavigate();

  const [step, setStep] = useState<"cart" | "address">("cart");

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPoints = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const remaining = pointsBalance - totalPoints;

  const isCartEmpty = items.length === 0;

  return (
    <Layout fullWidth>
      <Box sx={{ p: 4 }}>

        <Typography variant="h4" mb={4}>
          Košík
        </Typography>

        {step === "cart" && (
          <>
            <Box display="flex" gap={4} flexDirection={{ xs: "column", md: "row" }}>
              <CartList items={items} />

              <CartSummary
                totalItems={totalItems}
                totalPoints={totalPoints}
                availablePoints={pointsBalance}
                remaining={remaining}
                buttonLabel="Pokračovať na adresu"
                onAction={() => setStep("address")}
                disabled={isCartEmpty}
              />

            </Box>

            <Button variant="contained"  
              onClick={() => navigate("/shop")}>
                Späť do e-shopu
            </Button>

          </>
        )}


        {step === "address" && (
          <AddressForm
            totalItems={totalItems}
            totalPoints={totalPoints}
            availablePoints={pointsBalance}
            remaining={remaining}
            onBack={() => setStep("cart")}
          />
        )}

        
      </Box>
    </Layout>
  );
};

export default ManageCart;
