import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Autocomplete, Box, Stack, TextField, Typography, Button, Alert, TextareaAutosize, IconButton } from "@mui/material";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import api from "../../../app/api";
import { Height, Message } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { EmployeeCard } from "../../../types/EmployeeCard";
import { GoalCategoryResponse } from "../../../types/responses/GoalCategoryResponse";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from '../../../hooks/SnackBarContext';
import UserProfile from "../../../types/UserProfile";
import EmployeeCardDialog from "../../spravca/Users/EmployeCardDialog";
import { dataGridStyles } from "../../../styles/gridStyle";

const schema = z.object({
    name: z.string().min(1, "Názov cieľa je povinný!"),
    description: z.string().min(1, "Popis cieľa je povinný!"),
    goalCategoryId: z.string().min(1, "Kategória cieľa je povinná!").default(""), 
    dueDate: z.string().min(1, "Termín je povinný!"),
    employeeIds: z.array(z.string()).min(1, "Musí byť pridelený aspoň jeden zamestnanec!"),

});

type FormData = z.infer<typeof schema>;


const NewGoal: React.FC = () => {
    const nav = useNavigate();
    const [error, setError] = useState<string>();
    const [dueDate, setDueDate] = React.useState<Dayjs | null>(dayjs('2024-11-09'));
    const [categoryOption, setCategoryOptions] = useState<{ id: string; label: string }[]>([]);
    const [showTable, setShowTable] = useState(false);
    const [employeeData, setEmployeeData] = useState<EmployeeCard[]>([]);
    const [employeeIds, setEmployeeIds] = useState<string[]>([]);
    const [openCardDialog, setOpenCardDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null); 
    const { openSnackbar } = useSnackbar();


    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            description: "",
            goalCategoryId: "",
            dueDate:"",
            employeeIds: [], // default empty list

        }
    });

    const columnsUser: GridColDef[] = [
        //{ field: "email", headerName: "Používateľské meno", width: 200 },
        { field: "name", headerName: "Meno", width: 150 },
        { field: "surname", headerName: "Priezvisko", width: 150 },
        {
            field: "actions",
            headerName: "Akcie",
            width: 200,
            renderCell: (params: any ) => (
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "turquoise", color: "black", fontSize: "12px", textWrap: "wrap" }}
                        disabled={employeeIds.includes(params.row.employeeId)}
                        onClick={() => handleAddEmployee(params.row.employeeId)} 
          
                    >
                        Pridať
                    </Button>

                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "orange", color: "black", fontSize: "12px", textWrap: "wrap" }}
                        disabled={!employeeIds.includes(params.row.employeeId)}
                        onClick={() => handleRemoveEmployee(params.row.employeeId)} 
          
                    >
                        Odobrať
                    </Button>
                    
                </Stack>
            ),
        },
    ];

    useEffect(() => {
        api.get("/GoalCategory/Categories")
            .then((res) => {
                const options = res.data.map((org: GoalCategoryResponse) => ({
                    id: org.id,
                    label: org.description,
                }));
                setCategoryOptions(options);
            })
            .catch((err) => {
                setCategoryOptions([]);
                console.error(err);
            });
            api.get("/EmployeeCard/EmployeeCards")
            .then((res) => {
                setEmployeeData(res.data); 
                console.log("employeeCards", res.data); 
            })
            .catch((err) => console.error("Error fetching employee cards:", err));
        
    }, []);

    /*
    const handleAddEmployee = (employeeId: string) => {
        if (!employeeIds.includes(employeeId)) {
          setEmployeeIds((prev) => [...prev, employeeId]); 
        }
      };
    
      const handleRemoveEmployee = (employeeId: string) => {
        setEmployeeIds((prev) => prev.filter(id => id !== employeeId)); 
      };
    */

      const handleEmployeeCardClick = async (employeeCardId: string) => {
        const response = await api.get(`/EmployeeCard/GetUserByEmployeeCard?employeeCardId=${employeeCardId}`);
        const userProfile: UserProfile = response.data; 

        setSelectedEmployee(userProfile);
        //setSelectedEmployee(employee);
        setOpenCardDialog(true); // Show employee card dialog
    };

    const handleDateChange = (newValue: Dayjs | null) => {
        setDueDate(newValue);
        const adjustedDate = newValue ? newValue.startOf('day') : null;
        if (newValue) {
            const adjustedDate = newValue.startOf('day'); 
            const localDate = adjustedDate.toDate();
            const timezoneOffset = localDate.getTimezoneOffset();
            localDate.setMinutes(localDate.getMinutes() - timezoneOffset);
            const isoString = localDate.toISOString();
            setValue("dueDate", isoString);
        }
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const dataToSend = {
            ...data,  
            employeeIds: employeeIds, 
        };
       await api.post("/Goal/Create", dataToSend)
            .then((res) => {
                console.log("Goal sending:",dataToSend);
                console.log("Goal created:", res.data);
                openSnackbar("Cieľ bol úspešne vytvorený.", "success");
                nav('/manageGoals');
            })
            .catch((err) => {
                setError(err.response.data.title);
                openSnackbar("Nastala chyba pri vytváraní cieľa.", "error");
                console.error(err);
            });
    };


    const handleAddEmployee = (employeeId: string) => {
        if (!employeeIds.includes(employeeId)) {
            const updated = [...employeeIds, employeeId];
            setEmployeeIds(updated);
            setValue("employeeIds", updated); // Aktualizácia pre validáciu
        }
    };
    
    const handleRemoveEmployee = (employeeId: string) => {
        const updated = employeeIds.filter((id) => id !== employeeId);
        setEmployeeIds(updated);
        setValue("employeeIds", updated); // Aktualizácia pre validáciu
    };
    

    return (
        <Layout>
            <Box sx={{ padding: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Vytvoriť nový cieľ
                </Typography>

                <Button variant="contained" color="primary"
                    sx={{ marginBottom: 2 }}
                    onClick={() => setShowTable((prev) => !prev)}
                
                >
                    Pridať zamestnanca
                    
                </Button>

                {errors.employeeIds && (
                    <Alert severity="error" sx={{ marginBottom: 2 }}>
                        {errors.employeeIds.message}
                    </Alert>
                )}

                {showTable && (
                    
                    <DataGrid
                      sx={{maxHeight:400}}
                      rows={employeeData}
                      columns={columnsUser}
                      getRowId={(row) => row.employeeId}
                      pageSizeOptions={[5, 10, 25]}
                      pagination
                      initialState={{
                        pagination: {
                          paginationModel: {
                            pageSize: 10,
                          },
                        },
                      }}
                      onCellClick={(params) => {
                        if (params.field === "name" || params.field === "surname") {
                          handleEmployeeCardClick(params.row.employeeId);
                        }
                      }}
                    />
                )}
                {/* Employee Card Dialog */}
                <EmployeeCardDialog
                    open={openCardDialog}
                    handleClose={() => setOpenCardDialog(false)}  userId={selectedEmployee?.id}  
                    user={selectedEmployee}                />
                <Stack direction="column" gap={3} component="form" onSubmit={handleSubmit(onSubmit)}>
                    
                    <TextField label="Názov cieľa" required fullWidth {...register("name")} error={!!errors.name} helperText={errors.name?.message  ?? ""} />
                    <TextareaAutosize aria-label="Popis cieľa" required minRows = "10" {...register("description")} 
                    style={{
                        resize: "vertical",
                        height: "150px",
                        maxHeight: "300px",
                        overflowY: "auto",
                    }}  />
                    <Autocomplete fullWidth options={categoryOption}  
                        onChange={(e, value) => {
                            if (value) {
                                setValue("goalCategoryId", value.id);
                            } else {
                                setValue("goalCategoryId", "");
                            }
                        }}             
                        renderInput={(params) => <TextField {...params} label="Kategória cieľa *" 
                        error={!!errors.goalCategoryId}
                        helperText={errors.goalCategoryId?.message  ?? ""} />}

                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Termín dokončenia"
                            value={dueDate}
                            onChange={(newValue) => handleDateChange(newValue)}
                        />
                                
                    </LocalizationProvider>
                    <Stack direction="row" gap={3}>
                        <Button type="submit" variant="contained" color="primary">
                            Vytvoriť nový cieľ
                        </Button>
                        <Button type="button" variant="contained" color="secondary" onClick={() => nav('/manageGoals')}>
                            Zrušiť
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Layout>
    );
}

export default NewGoal