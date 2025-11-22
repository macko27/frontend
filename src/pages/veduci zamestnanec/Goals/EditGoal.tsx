import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Autocomplete, Box, Stack, TextField, Typography, Button, Alert, TextareaAutosize, MenuItem, Select, InputLabel, FormControl, IconButton } from "@mui/material";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../../app/api";
import { GoalCategoryResponse } from "../../../types/responses/GoalCategoryResponse";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { EmployeeCard } from "../../../types/EmployeeCard";
import CircleIcon from "@mui/icons-material/Circle";
import { useSnackbar } from '../../../hooks/SnackBarContext';
import UserProfile from "../../../types/UserProfile";
import EmployeeCardDialog from "../../spravca/Users/EmployeCardDialog";
import useLoading from "../../../hooks/LoadingData";

const schema = z.object({
    name: z.string().min(1, "Názov cieľa je povinný!"),
    description: z.string().min(1, "Popis cieľa je povinný!"),
    goalCategoryId: z.string().min(1, "Kategória cieľa je povinná!").default(""), 
    goalCategoryName: z.string().min(1, "Kategória cieľa je povinná!").default(""), 
    statusId: z.string().min(1, "Stav cieľa je povinný!"),
    statusName: z.string().min(1, "Stav cieľa je povinný!"),
    dueDate: z.string().min(1, "Termín je povinný!"),
    finishedDate: z.string().nullable().optional(),
    fullfilmentRate: z.number().min(0, "Miera splnenia musí byť medzi 0 a 100").max(100, "Miera splnenia musí byť medzi 0 a 100").nullable().optional(), // Optional completion rate
    employeeIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const EditGoal: React.FC = () => {
    const nav = useNavigate();
    //const { id } = useParams<{ id: string }>();
    const { state } = useLocation();
    const { id } = state || {};
    const [error, setError] = useState<string>();
    const [dueDate, setDueDate] = React.useState<Dayjs | null>(dayjs('2024-11-09'));
    const [finishedDate, setFinishedDate] = React.useState<Dayjs | null>(dayjs('2024-11-09'));
    const [categoryOption, setCategoryOptions] = useState<{ id: string; label: string }[]>([]);
    const [goalStatuses, setGoalStatuses] = useState<{ id: string; label: string , color:any }[]>([]); 
    const [showCompletionFields, setShowCompletionFields] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [employeeData, setEmployeeData] = useState<EmployeeCard[]>([]);
    const [employeeIds, setEmployeeIds] = useState<string[]>([]);
    const [assignedEmployees, setAssignedEmployees] = useState<EmployeeCard[]>([]);
    const [openCardDialog, setOpenCardDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null); 
    const { openSnackbar } = useSnackbar();

    const [loaded,setLoaded] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            description: "",
            goalCategoryId: "",
            statusId: "",
            dueDate: "",
            finishedDate: null,
            fullfilmentRate: undefined,
            employeeIds: [],
        }
    });

    useEffect(() => {
        api.get(`/Goal/${id}`)
            .then((res) => {
                console.log("prijate data:", res.data);
                const goalData = res.data;

                setValue("name", goalData.name);
                setValue("description", goalData.description);
                setValue("goalCategoryId", goalData.goalCategoryId);
                setValue("goalCategoryName", goalData.goalCategoryName);
                setValue("statusId", goalData.statusId || "");
                setValue("statusName", goalData.statusName || "");                
                setValue("dueDate", goalData.dueDate || "");
                setValue("finishedDate", goalData.finishedDate || null);
                setValue("fullfilmentRate", goalData.fullfilmentRate);
                setDueDate(dayjs(goalData.dueDate));
                setFinishedDate(dayjs(goalData.finishedDate));

            const defaultStatus = goalStatuses.find(status => status.label === goalData.statusName);
            if (defaultStatus) {
                setValue("statusId", defaultStatus.id); 
                if (defaultStatus.label === "Dokončený") {
                    setShowCompletionFields(true);
                } else {
                    setShowCompletionFields(false);
                }
            }
            })
            .catch((err) => {
                console.error("Error loading department:", err);
            });


            
    }, [id, setValue]);

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

            api.get("/GoalStatus/Statuses")
            .then((res) => {
                const statuses = res.data.map((status: { id: string; description: string }) => {
                    let color = "gray"; // Default color
                    if (status.description === "Dokončený") color = "green";
                    else if (status.description === "Prebiehajúci") color = "yellow";
                    else if (status.description === "Nezačatý") color = "gray";
                    else if (status.description === "Zrušený") color = "red";
                    return {
                        id: status.id,
                        label: status.description,
                        color,
                    };
                });
                setGoalStatuses(statuses);
            })
            .catch((err) => console.error("Error fetching goal statuses:", err));
    }, []);

    useEffect(() => {
        if (id) {
            api.get(`/Goal/GoalEmployees/${id}`)
                .then((res) => {
                    setAssignedEmployees(res.data);
                    console.log("Assigned employees:", res.data);
                })
                .catch((err) => console.error("Error fetching assigned employees:", err)).finally(() => setLoaded(true));
        }
    }, [id]); 

    const columnsUser: GridColDef<EmployeeCard>[] = [
        { field: "name", headerName: "Meno", width: 150 },
        { field: "surname", headerName: "Priezvisko", width: 150 },
        {
            field: "actions",
            headerName: "Akcie",
            width: 200,
            renderCell: (params: any) => (
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "turquoise", color: "black", fontSize: "12px", textWrap: "wrap" }}
                        disabled={employeeIds.includes(params.row.employeeId) || assignedEmployees.some(emp => emp.id === params.row.employeeId)}
                        onClick={() => handleAddEmployee(params.row.employeeId)} 
          
                    >
                        Pridať
                    </Button>

                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "orange", color: "black", fontSize: "12px", textWrap: "wrap" }}
                        disabled={!employeeIds.includes(params.row.employeeId) && !assignedEmployees.some(emp => emp.id === params.row.employeeId)}
                        onClick={() => handleRemoveEmployee(params.row.employeeId)} 
          
                    >
                        Odobrať
                    </Button>
                    
                </Stack>
            ),
        },
    ];

    const columnsAssigned: GridColDef<EmployeeCard>[] = [
        { field: "name", headerName: "Meno", width: 150 },
        { field: "surname", headerName: "Priezvisko", width: 150 },
    ];

    const handleDateChange = (newValue: Dayjs | null, context: any) => {
        setDueDate(newValue);
        if (newValue) {
            const adjustedDate = newValue.startOf('day'); 
            const localDate = adjustedDate.toDate();
            const timezoneOffset = localDate.getTimezoneOffset();
            localDate.setMinutes(localDate.getMinutes() - timezoneOffset);
            const isoString = localDate.toISOString();
            setValue("dueDate", isoString);
        }
    };

    const handleDateChangeFinished = (newValue: Dayjs | null, context: any) => {
        setFinishedDate(newValue);
        if (newValue) {
            const adjustedDate = newValue.startOf('day'); 
            const localDate = adjustedDate.toDate();
            const timezoneOffset = localDate.getTimezoneOffset();
            localDate.setMinutes(localDate.getMinutes() - timezoneOffset);
            const isoString = localDate.toISOString();
            setValue("finishedDate", isoString);
        }
        /* else {
            setValue("finishedDate", undefined); 
        }*/
    };

    const handleStatusChange = (value: { id: string, label: string } | null) => {
        const newStatus = value ? value.id : "";
        const newStatusLabel = value ? value.label : "";
        setValue("statusId", newStatus);
        setValue("statusName", newStatusLabel);
    
        if (newStatusLabel === "Dokončený") {
            setShowCompletionFields(true);
        } else {
            setShowCompletionFields(false);
            setValue("fullfilmentRate", undefined); 
            setValue("finishedDate", null);   
        }
    };


      const handleAddEmployee = (employeeId: string) => {
        setEmployeeIds((prevEmployeeIds) => {
            const updatedEmployeeIds = [...prevEmployeeIds, employeeId];
            console.log("pridavani edit3: ", updatedEmployeeIds);
            return updatedEmployeeIds;
        });
    };
    
    const handleRemoveEmployee = (employeeId: string) => {
        setEmployeeIds((prev) => prev.filter(id => id !== employeeId));
        setAssignedEmployees((prev) => prev.filter(emp => emp.id !== employeeId));
    };

      const handleEmployeeCardClick = async (employeeCardId: string) => {
        const response = await api.get(`/EmployeeCard/GetUserByEmployeeCard?employeeCardId=${employeeCardId}`);
        const userProfile: UserProfile = response.data; 

        setSelectedEmployee(userProfile);
        //setSelectedEmployee(employee);
        setOpenCardDialog(true); // Show employee card dialog
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const assignedEmployeeIds = assignedEmployees.map(emp => emp.id);
        const allEmployeeIds = [...employeeIds, ...assignedEmployeeIds]; 
        const dataToSend = {
            ...data,
            employeeIds: allEmployeeIds,
        };

        try {

    
            const completedStatus = goalStatuses.find((status) => status.label === "Dokončený")?.id;

            if (dataToSend.statusId === completedStatus) {
                if (dataToSend.fullfilmentRate === undefined || dataToSend.fullfilmentRate === null) {
                    setError("Miera splnenia je povinná pre dokončené ciele.");
                    return;
                }
            }
    
            console.log("Submitting form data:", dataToSend);
            await api.put(`/Goal/Edit/${id}`, dataToSend);
            openSnackbar("Zmeny sa uložili", "success");
            nav('/employeeGoals');
        } catch (err: any) {
            setError(err.response?.dataToSend?.title || "Došlo k chybe pri ukladaní zmien.");
            console.error(err);
        }
    };

    const loadingIndicator = useLoading(!loaded);

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                 
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Editácia cieľa 
                </Typography>
                { loadingIndicator ? loadingIndicator : (
                <Box sx={{ height: 400, width: "100%", marginBottom: 3 }}>
                    <Button variant="contained" color="primary"
                        sx={{ marginBottom: 2 }} onClick={() => setShowTable((prev) => !prev)}>
                        Pridať zamestnanca
                    </Button>
                    {showTable && (
                        <Box sx={{width: "100%", marginBottom: 3 }}>
                            <DataGrid
                            columns={columnsUser}
                            rows={employeeData}
                            
                            /*rows={employeeData.filter(
                                (employee) => !assignedEmployees.some((assigned) => assigned.id === employee.employeeId)
                            )}*/
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                    },
                                },
                            }}
                            pageSizeOptions={[5, 10, 25]}
                            pagination
                            getRowId={(row) => row.employeeId}
                            onCellClick={(params) => {
                                if (params.field === "name" || params.field === "surname") {
                                    handleEmployeeCardClick(params.row.employeeId);
                                }
                            }}
                        />
                        </Box>
                    )}
                    <Typography variant="h6"  gutterBottom>
                        Priradení zamestnanci 
                    </Typography>

                    <Box sx={{ height: 400, width: "100%", marginBottom: 4 }}>
                        <DataGrid
                            columns={columnsAssigned}
                            rows={assignedEmployees}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 5,
                                    },
                                },
                            }}
                            pageSizeOptions={[5, 10, 25]}
                            pagination
                            getRowId={(row) => row.id}
                            onRowClick={(params) => handleEmployeeCardClick(params.row.id)}
                        />
                    </Box>
                <EmployeeCardDialog
                    open={openCardDialog}
                    handleClose={() => setOpenCardDialog(false)}  userId={selectedEmployee?.id}  
                    user={selectedEmployee}                />
                <Stack direction="column" gap={3} sx={{ width: "100%" }} component="form" onSubmit={handleSubmit(onSubmit)}>

                    <TextField label="Názov cieľa" required fullWidth {...register("name")} error={!!errors.name} helperText={errors.name?.message} slotProps={{ inputLabel: { shrink: true } }}/>
                    <TextareaAutosize aria-label="Popis cieľa" required minRows="10" {...register("description")}
                        style={{ resize: "vertical", height: "150px", maxHeight: "300px", overflowY: "auto" }} />
                    <Autocomplete fullWidth options={categoryOption}
                        value={categoryOption.find((opt) => opt.label === watch("goalCategoryName")) || null}
                        onChange={(e, value) => {
                            if (value) {
                                setValue("goalCategoryId", value.id);
                                setValue("goalCategoryName", value.label);
                            } else {
                                setValue("goalCategoryId", "");
                            } 
                        }}           
                        renderInput={(params) => <TextField {...params} required label="Kategória cieľa " error={!!errors.goalCategoryId} helperText={errors.goalCategoryId?.message ?? ""}/>}
                    
                    />

                <Autocomplete fullWidth options={goalStatuses}
                        value={goalStatuses.find((opt) => opt.label === watch("statusName")) || null}
                        onChange={(e, value) => handleStatusChange(value)}
                        renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                            {option.label}
                            <CircleIcon sx={{ color: option.color, marginLeft: 1 }} />
                            
                        </li>
                    )}
                    getOptionLabel={(option) => option.label} 
                        renderInput={(params) => <TextField {...params} label="Status cieľa *" />
                        }
                    />

                    

                    {showCompletionFields && (
                        <>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker label="Dátum dokončenia *"  value={finishedDate} onChange={handleDateChangeFinished}/>
                            </LocalizationProvider>
                            <TextField
                                    label="Miera splnenia *"
                                    {...register("fullfilmentRate", {
                                        setValueAs: (value) => (value === "" ? null : Number(value)),
                                    })}
                                    //required
                                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                        const value = e.target.value;
                                        const id = value ? parseInt(value, 10) || null : null;
                                        setValue("fullfilmentRate",  id ); 
  
                                      }}type="number"
                                    inputProps={{ min: 0, max: 100 }}
                                    helperText={errors.fullfilmentRate ? errors.fullfilmentRate.message : "Zadajte číslo medzi 0 a 100."}
                                    sx={{ marginTop: 2 }}
                                />
                        </>
                    )}

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker label="Termín dokončenia *" value={dueDate} onChange={handleDateChange} 
                        />
                    </LocalizationProvider>

                    <Stack direction="row" gap={3}>
                        <Button type="submit" variant="contained" color="primary">
                            Uložiť
                        </Button>
                        <Button type="button" variant="contained" color="secondary" onClick={() => nav('/manageGoals')}>
                            Zrušiť
                        </Button>
                    </Stack>
                </Stack>
                </Box>
                )}
            </Box>
        </Layout>
    );
}

export default EditGoal;
