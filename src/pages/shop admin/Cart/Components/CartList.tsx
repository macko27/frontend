import { Box, Paper, Typography, Stack } from "@mui/material";


import CartItemCard from "./CartItemCard";
import { CartItem } from "../../../../types/Shop/CartItem";

interface CartListProps {
  items: CartItem[];
}

const CartList = ({ items }: CartListProps) => {
  return (
    <Box sx={{ flex: 2 }}>

      {/* HEADER */}
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
        <Typography sx={{ width: 120 }}>Produkt</Typography>

        <Stack direction="row" spacing={8}>
          <Typography>Počet</Typography>
          <Typography>Cena</Typography>
          <Typography>Akcia</Typography>
        </Stack>
      </Paper>

      {/* ITEMS */}
      {items.map((item) => (
        <CartItemCard key={item.id} item={item} />
      ))}
    </Box>
  );
};

export default CartList;