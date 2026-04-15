import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import {
  Box,
  Button,
  Typography,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from '../../../hooks/SnackBarContext';
import api from '../../../app/api';
import AddProductDialog, { ProductFormData } from './AddProductDialog';
import { Product } from '../../../types/Shop/Product';
import { ShopCategory } from '../../../types/Shop/ShopCategory';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';



const ManageProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { openSnackbar } = useSnackbar();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);


  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setOpenAddDialog(true);
  };

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

      console.log(products);

      setLoaded(true);
    } catch (err) {
      console.error(err);
      openSnackbar('Nepodarilo sa načítať produkty', 'error');
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/Shop/GetAllCategories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      openSnackbar('Nepodarilo sa načítať kategórie', 'error');
    }
  };

  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await api.delete(`/Shop/Delete/${productToDelete.id}`);

      openSnackbar('Produkt bol zmazaný', 'success');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (err) {
      console.error(err);
      openSnackbar('Nepodarilo sa zmazať produkt', 'error');
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const handleSaveProduct = async (formData: ProductFormData) => {
    try {
        if (!formData.name || !formData.name.trim()) {
            openSnackbar('Názov produktu je povinný', 'error');
            return;
        }

        if (!formData.info || !formData.info.trim()) {
            openSnackbar('Popis produktu je povinný', 'error');
            return;
        }

        if (!formData.price || formData.price <= 0) {
            openSnackbar('Cena musí byť väčšia ako 0', 'error');
            return;
        }

        if (!formData.categoryId) {
            openSnackbar('Vyber kategóriu', 'error');
            return;
        }

        if (!formData.image && !formData.id) {
            openSnackbar('Obrázok je povinný', 'error');
            return;
        }

        if (formData.image && !formData.image.type.startsWith('image/')) {
            openSnackbar('Súbor musí byť obrázok', 'error');
            return;
        }

        //FORM DATA
        const data = new FormData();
        data.append('name', formData.name.trim());
        data.append('info', formData.info.trim());
        data.append('price', String(formData.price));
        data.append('shopCategoryId', formData.categoryId);
        if (formData.image) {
            data.append('file', formData.image);
        }

        if (formData.id) {
            data.append('id', formData.id); // pridaj ID pre editáciu
        }

        await api.post('/Shop/Save', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        openSnackbar('Produkt bol uložený', 'success');
        setOpenAddDialog(false);
        loadProducts();

    } catch (err: any) {
        console.error(err);

        const message =
        err?.response?.data ||
        'Nepodarilo sa uložiť produkt';

        openSnackbar(message, 'error');
    }
};

  return (
    <Layout fullWidth={isMobile}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Správa produktov
          </Typography>
          <Button variant="contained" onClick={() => { setOpenAddDialog(true); setEditingProduct(null); }}>
            + Pridať produkt
          </Button>
        </Box>

        <Stack spacing={3}>
          {loaded ? (
            products.map((product) => (
              <Card 
                key={product.id} 
                sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    position: 'relative',
                    '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={() => handleOpenEdit(product)}>
                {product.imageUrl && (
                  <CardMedia
                    component="img"
                    sx={{ width: isMobile ? '100%' : 200, height: 150, objectFit: 'cover' }}
                    image={product.imageUrl}
                    alt={product.name}
                  />
                )}
                <CardContent sx={{ flex: 1 }}>

                  <Typography variant="h6" fontWeight="bold">
                    {product.name}
                  </Typography>

                  <Chip label={product.shopCategory?.name} size="small" variant="outlined" sx={{ my: 1 }} />

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, pr: 10 }}>
                    {product.info}
                  </Typography>

                  <Typography fontWeight="bold">{product.price} bodov</Typography>

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDelete(product);
                    }}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      right: 8,
                      transform: 'translateY(-50%)', // 👈 toto ju vycentruje vertikálne
                      bgcolor: 'rgba(255,255,255,0.8)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                    }}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>

                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>Načítavam produkty...</Typography>
          )}
        </Stack>
      </Box>

      <AddProductDialog
        open={openAddDialog}
        onClose={() => {
            setOpenAddDialog(false);
            setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        categories={categories}
        editingProduct={editingProduct}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Potvrdenie mazania</DialogTitle>

        <DialogContent>
          <Typography>
            Naozaj chceš zmazať produkt{' '}
            <strong>{productToDelete?.name}</strong>?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Zrušiť
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Zmazať
          </Button>
        </DialogActions>
      </Dialog>

    </Layout>
  );
};

export default ManageProductList;