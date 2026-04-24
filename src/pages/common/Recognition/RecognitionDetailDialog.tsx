import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Stack
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  recognition: any;
  isMobile?: boolean;
  formatDateTime: (date?: string) => string;

  attachments: { id: string; fileName: string }[];
  attachmentsOpen: boolean;
  attachmentsLoading: boolean;
  onToggleAttachments: () => void;
  onDownload: (id: string, fileName: string) => void;

  tab?: number;
}

const RecognitionDetailDialog = ({
  open,
  onClose,
  recognition,
  isMobile,
  formatDateTime,
  attachments,
  attachmentsOpen,
  attachmentsLoading,
  onToggleAttachments,
  onDownload,
  tab
}: Props) => {

  if (!recognition) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {recognition?.predmet}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 16 }}
        >
          ✕
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>

          {/* Osoba */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary">
              {(tab === 0 || tab === 3) ? "Odosielateľ" : "Príjemca"}
            </Typography>

            <Box textAlign="right">
              {(tab === 0 || tab === 3) ? (
                <Typography>{recognition?.createdBy?.fullName}</Typography>
              ) : (
                recognition?.recipients?.map((r: any) => (
                  <Typography key={r.id}>{r.fullName}</Typography>
                ))
              )}
            </Box>
          </Box>

          {/* Text */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary">
              Text uznania
            </Typography>

            <Typography sx={{ maxWidth: 350, textAlign: "right" }}>
              {recognition?.text}
            </Typography>
          </Box>

          {/* Odmena */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary">
              Odmena
            </Typography>

            <Typography sx={{ textAlign: "right" }}>
              {recognition?.odmena}
            </Typography>
          </Box>

          {/* Prílohy */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Prílohy</Typography>
              <Button size="small" variant="outlined" onClick={onToggleAttachments}>
                {attachmentsLoading ? 'Načítavam...' : attachmentsOpen ? 'Skryť' : 'Zobraziť'}
              </Button>
            </Box>

            {attachmentsOpen && (
              <Box sx={{ mt: 1 }}>
                {attachments.length === 0 ? (
                  <Typography variant="body2">Žiadne prílohy</Typography>
                ) : (
                  attachments.map((file) => (
                    <Button
                      key={file.id}
                      onClick={() => onDownload(file.id, file.fileName)}
                    >
                      📎 {file.fileName}
                    </Button>
                  ))
                )}
              </Box>
            )}
          </Box>

          {/* Dátum */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary">
              Dátum odoslania
            </Typography>

            <Typography>
              {formatDateTime(recognition?.dateIn)}
            </Typography>
          </Box>

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Zavrieť</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecognitionDetailDialog;