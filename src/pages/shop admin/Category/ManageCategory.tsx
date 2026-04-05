import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import Layout from '../../../components/Layout';
import api from '../../../app/api';
import { ShopCategory } from '../../../types/Shop/ShopCategory';
import { useSnackbar } from '../../../hooks/SnackBarContext';

const ManageCategory: React.FC = () => {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const { openSnackbar } = useSnackbar();

  const loadCategories = async () => {
    try {
      const res = await api.get('/Shop/GetAllCategories');
      setCategories(res.data);
      setLoaded(true);
    } catch (err) {
      console.error(err);
      openSnackbar('Nepodarilo sa načítať kategórie', 'error');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await api.post('/Shop/CreateCategory', { name: newCategoryName });
      openSnackbar('Kategória bola pridaná', 'success');
      setNewCategoryName('');
      setOpenAddDialog(false);
      loadCategories();
    } catch (err) {
      console.error(err);
      openSnackbar('Nepodarilo sa pridať kategóriu', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.delete(`/Shop/DeleteCategory/${id}`);
      openSnackbar('Kategória bola odstránená', 'success');
      loadCategories();
    } catch (err) {
      console.error(err);
      openSnackbar('Nepodarilo sa odstrániť kategóriu', 'error');
    }
  };

  return (
    <Layout fullWidth={true}>
      <Box sx={{ p: 3 }}>
        {/* Hlavička */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Správa kategórií
          </Typography>
          <Button variant="contained" onClick={() => setOpenAddDialog(true)} disabled={true}>
            + Pridať kategóriu
          </Button>
        </Box>

        {/* Zoznam kategórií */}
        <Stack spacing={2}>
          {loaded
            ? categories.map((cat) => (
                <Card key={cat.id}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>{cat.name}</Typography>
                    <Button variant="outlined" color="error" onClick={() => handleDeleteCategory(cat.id)} disabled={true}>
                      Zmazať
                    </Button>
                  </CardContent>
                </Card>
              ))
            : <Typography>Načítavam kategórie...</Typography>
          }
        </Stack>
      </Box>

      {/* Dialog na pridanie kategórie */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Pridať kategóriu</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Názov kategórie"
            type="text"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} sx={{ textTransform: 'none' }}>
            Zrušiť
          </Button>
          <Button variant="contained" onClick={handleAddCategory} sx={{ textTransform: 'none' }}>
            Pridať
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ManageCategory;