import React from "react";
import { Box, IconButton } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { useNavigate } from "react-router-dom";
import { useCart } from "./Cart/CartContext";
import { Badge } from "@mui/material";


interface Props {
  points: number;
  onCartClick?: () => void;
  onInventoryClick?: () => void;
}

const ShopHeaderRight: React.FC<Props> = ({
  points,
}) => {  
  
  const nav = useNavigate();

  const { items } = useCart();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: { xs: "space-between", md: "flex-end" },
        alignItems: "center",
        gap: 1,
        width: { xs: "100%", md: "auto" },
      }}
    >
      <IconButton onClick={() => nav("/shop/cart")}>
      <Badge 
        badgeContent={cartCount} 
        color="error"
        invisible={cartCount === 0}
      >
        <ShoppingCartIcon />
      </Badge>
    </IconButton>

      <IconButton onClick={() => nav("/shop/inventory")}>
        <Inventory2Icon />
      </IconButton>

      {/* Body */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 999,
          boxShadow: 1,
        }}
      >
        <MonetizationOnIcon color="warning" />
        <span>{points}</span>
      </Box>
    </Box>
  );
};

export default ShopHeaderRight;