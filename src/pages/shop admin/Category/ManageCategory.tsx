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
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';


const ManageCategory: React.FC = () => {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ShopCategory | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<ShopCategory | null>(null);
  const [editName, setEditName] = useState('');

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

  const handleOpenEdit = (category: ShopCategory) => {
    setCategoryToEdit(category);
    setEditName(category.name);
    setEditDialogOpen(true);
  };


  const handleUpdateCategory = async () => {
    if (!categoryToEdit) return;

    try {
      await api.post(`/Shop/UpdateCategory/${categoryToEdit.id}`, {
        name: editName,
      });

      openSnackbar('Kategória bola upravená', 'success');

      setEditDialogOpen(false);
      setCategoryToEdit(null);
      setEditName('');

      loadCategories();
    } catch (err) {
      console.error(err);
      openSnackbar('Nepodarilo sa upraviť kategóriu', 'error');
    }
  };


  const handleOpenDelete = (category: ShopCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`/Shop/DeleteCategory/${categoryToDelete.id}`);

      openSnackbar('Kategória bola odstránená', 'success');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      loadCategories();
    } catch (err: any) {
      console.error(err);

      const message = err?.response?.data || 'Nepodarilo sa odstrániť kategóriu';

      openSnackbar(message, 'error');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
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
          <Button variant="contained" onClick={() => setOpenAddDialog(true)}>
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

                    <Box>
                      <IconButton onClick={() => handleOpenEdit(cat)}>
                        ✏️
                      </IconButton>

                      <IconButton onClick={() => handleOpenDelete(cat)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Box>

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


      {/* Dialog na odstranenie kategórie */}  
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Potvrdenie mazania</DialogTitle>

        <DialogContent>
          <Typography>
            Naozaj chceš zmazať kategóriu{' '}
            <strong>{categoryToDelete?.name}</strong>?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Zrušiť
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Zmazať
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog na úpravu kategórie */}  
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Upraviť kategóriu</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Názov kategórie"
            fullWidth
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Zrušiť
          </Button>

          <Button 
            variant="contained" 
            onClick={handleUpdateCategory}
            disabled={editName.trim() === categoryToEdit?.name.trim()}
          >
            Uložiť
          </Button>
        </DialogActions>
      </Dialog>

    </Layout>
  );
};

export default ManageCategory;