
import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Potvrdenie vymazania</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Naozaj chcete vymazať túto položku? Operácia je nenávratná.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Zrušiť
                </Button>
                <Button onClick={onConfirm} color="error">
                    Vymazať
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;

