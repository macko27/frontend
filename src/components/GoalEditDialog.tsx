import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  TextField,
  Autocomplete,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { UseFormReturn, UseFormSetValue} from "react-hook-form";
import { Dayjs } from "dayjs";
import { opendir } from "node:fs";
import { z } from "zod";

const schema = z.object({
  status: z.string().min(1, "Stav cieľa je povinný!"),
  finishedDate: z.string().nullable().optional(),
  fullfilmentRate: z
    .number()
    .min(0, "Miera splnenia musí byť medzi 0 a 100")
    .max(100, "Miera splnenia musí byť medzi 0 a 100")
    .nullable()
    .optional(),
  description: z.string().min(1, "Popis cieľa je povinný!"),
});

type FormData = z.infer<typeof schema>;




interface GoalDetailsModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    handleSubmit: UseFormReturn<any>["handleSubmit"];
    register: UseFormReturn<any>["register"];
    errors: any;
    getValues: UseFormReturn<any>["getValues"];
    setValue: UseFormSetValue<FormData>;
    goalStatuses: { id: string; label: string; color: any }[];
    selectedGoal: any;
    showCompletionFields: boolean;
    finishedDate: Dayjs | null;
    handleDateChangeFinished: (newValue: Dayjs | null, context: any) => void;
    handleStatusChange: (value: { id: string, label: string } | null) => void;
    reset: UseFormReturn<any>["reset"];
    isSuperior: boolean;
    setError: UseFormReturn<FormData>["setError"];

  }
  
  const GoalEditDialog: React.FC<GoalDetailsModalProps> = ({
    open,
    onClose,
    onSubmit,
    selectedGoal,
    goalStatuses,
    showCompletionFields,
    finishedDate,
    handleDateChangeFinished,
    handleStatusChange,
    handleSubmit,
    register,
    setValue,
    getValues,
    errors,
    reset,
    isSuperior,
    setError,
  }) => {

    const [showCompletionFieldsLocal, setShowCompletionFieldsLocal] = useState(false);
    const [localStatus, setLocalStatus] = useState<{ id: string; label: string } | null>(null);

  
      
    useEffect(() => {
      if (selectedGoal) {
        console.log("Selected goal:", selectedGoal); 
        setValue("status", selectedGoal.statusId);
        setValue("fullfilmentRate", selectedGoal.fullfilmentRate); 
        setValue("finishedDate", selectedGoal.finishedDate); 

        if (selectedGoal.finishedDate || selectedGoal.fullfilmentRate !== null) {
            setShowCompletionFieldsLocal(true);
          } else {
            setShowCompletionFieldsLocal(false);
          }
      }
    }, [selectedGoal, setValue]); 

    useEffect(() => {
      if (open) {
        console.log("Opätovne resetujem formulár", selectedGoal);        
          reset({
            status: selectedGoal?.statusId ?? "",
            fullfilmentRate: selectedGoal?.fullfilmentRate ?? "",
            finishedDate: selectedGoal?.finishedDate ?? "",
            description: selectedGoal?.description ?? "",
          });
        
      }
    }, [open, selectedGoal, reset]);

    useEffect(() => {
      if (selectedGoal) {
        const statusObj = goalStatuses.find(status => status.id === selectedGoal.statusId) || null;
        setLocalStatus(statusObj);
      }
    }, [selectedGoal, goalStatuses]);
    
    
    const handleStatusChangeLocal = (value: { id: string; label: string } | null) => {
      setLocalStatus(value); // aktualizuj lokálny stav
      const newStatus = value ? value.id : "";
      const newStatusLabel = value ? value.label : "";
      setValue("status", newStatus);
    
      if (newStatusLabel === "Dokončený") {
        setShowCompletionFieldsLocal(true);
      } else {
        setShowCompletionFieldsLocal(false);
        setValue("fullfilmentRate", undefined);
        setValue("finishedDate", undefined);
      }
    };
  
    const onSubmitLocal = (data: FormData) => {
      console.log("aubmit");
      const statusLabel = goalStatuses.find((s) => s.id === data.status)?.label;

      if (statusLabel === "Dokončený" && (data.fullfilmentRate === null || data.fullfilmentRate === undefined)) {
        console.log(statusLabel);
        setError("fullfilmentRate", {
           type: "manual",
          message: "Miera splnenia je povinná pri dokončenom cieli!",
        });
        return;
      }
      console.log(statusLabel);
      console.log(errors.fullfilmentRate?.message);  
      onSubmit(data); // zavolaj pôvodný handler
    };
    
  
  return (
    <Dialog open={open} onClose={onClose} sx={{ maxWidth: "md", width: "80%" }}>
      <form onSubmit={handleSubmit(onSubmitLocal)}>
        <DialogTitle><b>Detail cieľa</b></DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ width: "50%" }}>
            <Typography variant="h6">{selectedGoal?.name}</Typography>
            {isSuperior ? (
              <TextField
                multiline
                minRows={6}
                fullWidth
                defaultValue={selectedGoal?.description}
                {...register("description")}
                sx={{
                  backgroundColor: "#fff",
                  marginBottom: 2,
                }}
              />
            ) : (
              <Box
                sx={{
                  border: "1px solid #ccc",
                  padding: 2,
                  height: "200px",
                  overflowY: "auto",
                  marginBottom: 2,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="body2">{selectedGoal?.description}</Typography>
              </Box>
            )}

          </Box>

          <Box sx={{ marginTop: 2, width: "45%" }}>
          <Autocomplete
                fullWidth
                options={goalStatuses}
                value={localStatus}
                onChange={(e, value) => handleStatusChangeLocal(value)}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.label}
                  
                  </li>
                )}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => <TextField {...params} label="Stav cieľa *" />}


          />                   
            <Box
              sx={{
                marginTop: 2,
                visibility: showCompletionFieldsLocal ? "visible" : "hidden",
                opacity: showCompletionFieldsLocal ? 1 : 0,

                transition: "visibility 0s, opacity 0.3s linear",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Dátum dokončenia *"
                  value={finishedDate}
                  onChange={handleDateChangeFinished}
                  sx={{ marginBottom: 2 }}
                />
              </LocalizationProvider>

              <TextField
                //label={getValues("fullfilmentRate") ? "" : "Miera splnenia"}
                label="Miera splnenia *"
                
                {...register("fullfilmentRate", {
                  setValueAs: (value: string) => (value === "" ? null : Number(value)),
                })}
                onChange={(e) => {
                  const value = e.target.value;
                  const id = value ? parseInt(value, 10) || null : null;
                  setValue("fullfilmentRate", id);
                }}
                type="number"
                inputProps={{ min: 0, max: 100 }}
                helperText={
                  // Podmienka na kontrolu, či je fullfilmentRate null
                  getValues("fullfilmentRate") === null || getValues("fullfilmentRate") === undefined
                    ? "Miera splnenia je povinná pri dokončenom cieli!"
                    : "Zadajte číslo medzi 0 a 100."
                }
                error={ getValues("fullfilmentRate") === null || getValues("fullfilmentRate") === undefined}
                sx={{ marginTop: 2 }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button type="submit" variant="contained" color="info">
            Uložiť
          </Button>
          <Button onClick={onClose} color="primary">
            Zrušiť
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GoalEditDialog;
