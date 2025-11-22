import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

type TaskType = {
  description: string;
  finishDate: string;
  isDone?: boolean;
};

type TaskModalProps = {
  open: boolean;
  onSave: (task: TaskType) => void;
  onClose: () => void;
  initialData?: TaskType;
};

const TaskModal: React.FC<TaskModalProps> = ({ open, onSave, onClose, initialData }) => {
  const [description, setDescription] = useState('');
  const [finishDate, setFinishDate] = useState('');

  useEffect(() => {
    if (open) {
      setDescription(initialData?.description || '');
      setFinishDate(initialData?.finishDate || '');
    }
  }, [initialData, open]);

  const handleSave = () => {
    if (!description || !finishDate) return;
    onSave({ description, finishDate, isDone: initialData?.isDone ?? false });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{initialData ? 'Upraviť úlohu' : 'Pridať úlohu'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Názov úlohy"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Termín splnenia úlohy"
          type="date"
          fullWidth
          margin="normal"
          value={finishDate}
          InputLabelProps={{ shrink: true }}
          onChange={(e) => setFinishDate(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Zrušiť</Button>
        <Button onClick={handleSave} variant="contained" color="primary">Uložiť</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal;