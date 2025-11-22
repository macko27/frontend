import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  TextareaAutosize,
  Alert,
} from "@mui/material";
import { Dayjs } from "dayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import dayjs from "dayjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "../hooks/SnackBarContext";
import api from "../app/api";
import {EmployeeCard} from "../types/EmployeeCard";

const schema = z.object({
    name: z.string().min(1, "Názov je povinný!"),
  dueDate: z.string().min(1, "Termín je povinný!"),
  description: z.string().min(1, "Popis je povinný!"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  selectedPerson: EmployeeCard | null;
  onGoalCreated?: () => void;
}

const AddSuccessionGoalDialog: React.FC<Props> = ({ open, onClose, selectedPerson, onGoalCreated}) => {
  const { openSnackbar } = useSnackbar();
  const [dueDate, setDueDate] = React.useState<Dayjs | null>(dayjs());
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dueDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        dueDate: "",
        description: "",
      });
      setDueDate(dayjs());
    }
  }, [open, reset]);
  

  const handleDateChange = (newValue: Dayjs | null) => {
    setDueDate(newValue);
    if (newValue) {
      const adjustedDate = newValue.startOf("day").toDate();
      const offset = adjustedDate.getTimezoneOffset();
      adjustedDate.setMinutes(adjustedDate.getMinutes() - offset);
      const isoString = adjustedDate.toISOString();
      setValue("dueDate", isoString);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!selectedPerson) return;

    const newGoal = {
    name: data.name,
      goalCategory: "Nástupnícky cieľ",
      description: data.description,
      //goalCategoryId: "",
      dueDate: data.dueDate,
      employeeIds: [selectedPerson.employeeId],
    };

    try {
        console.log("new goal:", newGoal);
      await api.post("/Goal/CreatePersonalized", newGoal);
      openSnackbar("Nástupnícky cieľ bol vytvorený", "success");
      onClose();
      reset();
      setDueDate(dayjs());
      onGoalCreated?.();
    } catch (err: any) {
      console.error(err);
      openSnackbar("Nepodarilo sa vytvoriť cieľ", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Pridať nástupnícky cieľ</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Zamestnanec:</strong> {selectedPerson?.fullName}
        </Typography>
        {!selectedPerson && (
            <Alert severity="warning" sx={{ mb: 2 }}>
            Nie je vybraný žiadny zamestnanec. Pred vytvorením nástupníckeho cieľa vyberte konkrétneho zamestnanca.
            </Alert>
        )}
        <form id="succession-goal-form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField label="Názov cieľa" required fullWidth {...register("name")} error={!!errors.name} helperText={errors.name?.message  ?? ""} />                            
            <TextField
              label="Kategória cieľa"
              value="Nástupnícky cieľ"
              InputProps={{ readOnly: true }}
              fullWidth
            />
            <TextareaAutosize aria-label="Popis cieľa" required minRows = "10" {...register("description")} 
                                style={{
                                    resize: "vertical",
                                    height: "150px",
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                }}  />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Termín dokončenia"
                value={dueDate}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
            {errors.dueDate && (
              <Typography color="error">{errors.dueDate.message}</Typography>
            )}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zrušiť</Button>
        <Button type="submit" form="succession-goal-form" variant="contained">
          Uložiť
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSuccessionGoalDialog;
