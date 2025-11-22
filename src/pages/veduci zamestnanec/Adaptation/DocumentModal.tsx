import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box 
} from '@mui/material';

type DocumentType = {
  description: string;
  file: File;
};

type DocumentModalProps = {
  open: boolean;
  onSave: (doc: DocumentType) => void;
  onClose: () => void;
  initialData?: Partial<DocumentType>;
};

const DocumentModal: React.FC<DocumentModalProps> = ({ open, onSave, onClose, initialData }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

   useEffect(() => {
      if (open) {
        setDescription(initialData?.description || '');
        setFile(initialData?.file || null);
      }
    }, [initialData, open]);

  const handleSave = () => {
    if (!description || !file) return;
    onSave({ description, file });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialData ? 'Upraviť dokument' : 'Pridať dokument'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Názov dokumentu"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

<Box
  mt={2}
  p={3}
  border="2px dashed #ccc"
  borderRadius={2}
  textAlign="center"
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }}
>
  <Typography variant="body2" color="textSecondary">
    Pretiahnite súbor sem alebo kliknite na výber
  </Typography>
  <input
    type="file"
    accept=".pdf,.pptx,.docx,.xlsx"
    style={{ display: 'none' }}
    id="fileInput"
    onChange={(e) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) setFile(selectedFile);
    }}
  />
  <label htmlFor="fileInput">
    <Button variant="outlined" component="span" sx={{ mt: 1 }}>
      Vybrať súbor
    </Button>
  </label>
  {file && (
    <Typography variant="body2" mt={1}>
      {file.name}
    </Typography>
  )}
</Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Zrušiť</Button>
        <Button onClick={handleSave} variant="contained" color="primary">Uložiť</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentModal;
