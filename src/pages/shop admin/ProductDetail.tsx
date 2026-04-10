import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Paper,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import api from "../../app/api";
import ShopHeaderRight from "./ShopHeaderRight";
import { useCart } from "./Cart/CartContext";
import { useSnackbar } from "../../hooks/SnackBarContext";

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const { addToCart, pointsBalance } = useCart();
  const { openSnackbar } = useSnackbar();

  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      const res = await api.get(`/Shop/Get/${id}`);
      setProduct(res.data);
    };

    loadProduct();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  const handleAddToCart = () => {
    const success = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.productAttachment?.fileUrl,
      quantity: quantity,
    });

    if (success) {
      openSnackbar(`Produkt "${product.name}" pridaný do košíka`, 'success');
    } else {
      openSnackbar("Nemáš dostatok bodov", "error");
    }
  };

  return (
    <Layout fullWidth>
      <Box sx={{ p: 4, maxWidth: 1800, mx: "auto"  }}>
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
            }}
        >
        <Button variant="contained" href="/shop">
            Späť do e-shopu
        </Button>

        <ShopHeaderRight
            points={pointsBalance}
        />
        </Box>

        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            backgroundImage: "none",
            backgroundColor: "transparent",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "center",
          }}
        >
          {/* IMAGE */}
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <img
              src={product.productAttachment?.fileUrl}
              alt={product.name}
              style={{ maxWidth: "100%", borderRadius: 12 }}
            />
          </Box>

          {/* INFO */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {product.shopCategory?.name}
            </Typography>

            <Typography variant="h4" fontWeight="bold" mb={2}>
              {product.name}
            </Typography>

            <Typography variant="h6" fontWeight="bold" mb={2}>
              {product.price} bodov
            </Typography>

            <Typography color="text.secondary" mb={3}>
              {product.info}
            </Typography>

            {/* QUANTITY */}
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Paper
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                }}
              >
                <IconButton
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Remove />
                </IconButton>

                <Typography sx={{ mx: 2 }}>{quantity}</Typography>

                <IconButton onClick={() => setQuantity((q) => q + 1)}>
                  <Add />
                </IconButton>
              </Paper>

              <Button
                variant="contained"
                size="large"
                color="info"
                onClick={handleAddToCart}
                sx={{
                  borderRadius: 5,
                  px: 4,
                }}
              >
                Vložiť do košíka
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default ProductDetail;
