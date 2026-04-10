import { Box, Typography, Card, CardContent, CardMedia, Chip, IconButton, Grid } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../app/api";
import { useSnackbar } from "../../hooks/SnackBarContext";
import ShopHeader from "./ShopHeader";
import { useNavigate } from "react-router-dom";
import { useCart } from "./Cart/CartContext";

type ShopCategory = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  info: string;
  price: number;
  shopCategory: ShopCategory;
  imageUrl?: string;
};

const ManageShop: React.FC = () => {
  const [creator, setCreator] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { openSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { addToCart, pointsBalance, setPointsBalance } = useCart();

  useEffect(() => {
    api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
      .then(res => setCreator(res.data))
      .catch(() => openSnackbar('Nepodarilo sa načítať údaje používateľa', 'error'));
  }, []);

  useEffect(() => {
    if (!creator?.employeeId) return;
    if (pointsBalance !== 0) return;

    api.get(`/Recognition/GetPointsBalance/${creator?.employeeId}`)
      .then(res => setPointsBalance(res.data))
      .catch(() => openSnackbar('Nepodarilo sa načítať body', 'error'));
  }, [creator]);

  const loadProducts = async () => {
    try {
      const res = await api.get('/Shop/GetAll');

      setProducts(
        res.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          info: p.info,
          price: p.price,
          imageUrl: p.productAttachment?.fileUrl,
          shopCategory: {
            id: p.shopCategory?.id,
            name: p.shopCategory?.name,
          },
        }))
      );

      setLoaded(true);
    } catch (err) {
      console.error(err);
      openSnackbar('Nepodarilo sa načítať produkty', 'error');
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const success = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity: 1,
    });

    if (!success) {
      openSnackbar("Nemáš dostatok bodov", "error");
      return;
    }

    openSnackbar(`Produkt "${product.name}" pridaný do košíka`, 'success');
  };

  const handleOpenDetail = (product: Product) => {
    navigate(`/shop/product/${product.id}`);
  };

  return (
    <Layout fullWidth={true}>
      <Box sx={{ p: 4, maxWidth: 1800, mx: "auto" }}>
        <ShopHeader points={pointsBalance} />

        <Box sx={{ p: 3, maxWidth: 1500, display: "flex", flexDirection: "column", gap: 3, mx: "auto" }}>
          

          <Typography variant="h4" mt={3} mb={2}>
            Správa obchodu
          </Typography>

          {loaded ? (
            <Grid container spacing={3}>
              {products.map(product => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card sx={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                  onClick={() => handleOpenDetail(product)}>
                    {product.imageUrl && (
                      <CardMedia
                        component="img"
                        height="150"
                        image={product.imageUrl}
                        alt={product.name}
                      />
                    )}
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {product.name}
                      </Typography>
                      <Chip label={product.shopCategory?.name} size="small" variant="outlined" sx={{ my: 1 }} />

                      <Typography fontWeight="bold">{product.price} bodov</Typography>
                    </CardContent>
                    <IconButton
                      color="primary"
                      sx={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'white', '&:hover': { backgroundColor: 'lightgray' } }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product)
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>Načítavam produkty...</Typography>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default ManageShop;