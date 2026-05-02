import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import { Product } from '../../../types/Shop/Product';
import { ShopCategory } from '../../../types/Shop/ShopCategory';
import { useSnackbar } from '../../../hooks/SnackBarContext';


interface AddProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData) => void;
  categories: ShopCategory[];
  editingProduct?: Product | null;
}

export interface ProductFormData {
  id?: string; // přidáno pro editaci
  name: string;
  categoryId: string;
  image: File | null;
  info: string;
  size?: number;
  price: number | '';
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ open, onClose, onSave, categories, editingProduct }) => {

    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const { openSnackbar } = useSnackbar();

    const [form, setForm] = useState<ProductFormData>({
        name: '',
        categoryId: '',
        image: null,
        info: '',
        size: undefined,
        price: '',
    });
    const [imageFileName, setImageFileName] = useState<string>('');

    useEffect(() => {
        if (editingProduct) {
            setForm({
                name: editingProduct.name || '',
                info: editingProduct.info || '',
                size: editingProduct.size ?? undefined,
                price: editingProduct.price ?? 0,
                categoryId: editingProduct.shopCategory?.id || '',
                image: null, // input file ostáva prázdny
            });
            setExistingImageUrl(editingProduct.imageUrl || null);
            setImageFileName(editingProduct.imageUrl ? 'Zmena obrázku' : '');
        } else {
            setForm({ name: '', info: '', price: '', categoryId: '', image: null, size: undefined });
            setExistingImageUrl(null);
            setImageFileName('');
        }
    }, [editingProduct, open]);

    const handleReset = () => {
        setForm({ name: '', categoryId: '', image: null, info: '', price: '', size: undefined });
        setImageFileName('');
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setForm((prev) => ({ ...prev, image: file }));
        setImageFileName(file?.name ?? '');
    };

    const handleSave = () => {
        if (!form.image && !editingProduct) {
            // nový produkt musí mať obrázok
            openSnackbar('Obrázok je povinný', 'error');
            return;
        }

        onSave({
            ...form,
            id: editingProduct?.id, // pridáme ID pre edit
        });

        if (!editingProduct) handleReset(); // reset iba pri novom produkte
    };

    const isValid =
        form.name.trim() !== '' &&
        form.categoryId !== '' &&
        form.info.trim() !== '' &&
        form.price !== '' &&
        Number(form.price) > 0 &&
        form.size !== undefined &&
        Number(form.size) > 0;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
            Pridanie produktu
            <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
            ✕
            </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2.5}>

            {/* Názov */}
            <TextField
                label="Názov produktu *"
                placeholder="Uveďte názov produktu."
                fullWidth
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />

            {/* Kategória */}
            <FormControl fullWidth>
                <InputLabel>Kategória *</InputLabel>
                <Select
                value={form.categoryId}
                label="Kategória *"
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                >
                {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>

            {/* Obrázok */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Obrázok *</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {existingImageUrl && !imageFileName && (
                        <img src={existingImageUrl} style={{ width: 80, height: 80, objectFit: 'cover' }} />
                    )}
                    {imageFileName && (
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {imageFileName}
                        </Typography>
                    )}
                    <Button variant="outlined" component="label">
                        Nahrať
                        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </Button>
                </Box>
            </Box>

            {/* Popis */}
            <TextField
                label="Popis produktu *"
                placeholder="Uveďte popis produktu."
                fullWidth
                multiline
                rows={3}
                value={form.info}
                onChange={(e) => setForm((p) => ({ ...p, info: e.target.value }))}
            />

            {/* Počet kusov */}
            <TextField
                label="Počet kusov *"
                placeholder="Uveďte počet kusov produktu."
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                value={form.size ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, size: e.target.value === '' ? undefined : Number(e.target.value) }))}
            />

            {/* Cena */}
            <TextField
                label="Cena produktu *"
                placeholder="Uveďte cenu produktu v bodoch."
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                value={form.price ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value === '' ? '' : Number(e.target.value) }))}
            />

            </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button variant="outlined" color="warning" onClick={handleClose} sx={{ textTransform: 'none' }}>
            Zrušiť
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={!isValid} sx={{ textTransform: 'none' }}>
            Uložiť
            </Button>
        </DialogActions>
        </Dialog>
    );
};

export default AddProductDialog;