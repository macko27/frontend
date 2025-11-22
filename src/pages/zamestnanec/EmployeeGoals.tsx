import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Autocomplete, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import api from "../../app/api";
import Goal from "../../types/Goal";
import CircleIcon from "@mui/icons-material/Circle";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useSnackbar } from "../../hooks/SnackBarContext";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/AuthProvider";
import GoalEditDialog from "../../components/GoalEditDialog";
import { dataGridStyles } from "../../styles/gridStyle";

const schema = z.object({
    status: z.string().min(1, "Stav cieľa je povinný!"),
    finishedDate: z.string().nullable().optional(),
    fullfilmentRate: z.number().min(0, "Miera splnenia musí byť medzi 0 a 100").max(100, "Miera splnenia musí byť medzi 0 a 100").nullable().optional(), // Optional completion rate
});

type FormData = z.infer<typeof schema>;

const EmployeeGoals: React.FC = () => {
    const nav = useNavigate();
    const { openSnackbar } = useSnackbar();
    const { id } = useParams<{ id: string }>();
    const [error, setError] = useState<string>();
    const [goalRows, setGoalRows] = useState<Goal[]>([]);
    const [goalStatuses, setGoalStatuses] = useState<{ id: string; label: string , color:any }[]>([]); 
    const [showCompletionFields, setShowCompletionFields] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [finishedDate, setFinishedDate] = React.useState<Dayjs | null>(dayjs('2024-11-09'));
    const [openGoalDetailsDialog, setOpenGoalDetailsDialog] = useState(false);
    const [filter, setFilter] = useState<string>("all");
    const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
    const { userProfile, setUserProfile, setRefresh, refresh } = useAuth();
    const [selectedStatus, setSelectedStatus] = useState<{ id: string; label: string } | null>(null);
    const [loadedStatuses, setLoadedStatuses] = useState(false);
    const [loadedGoals, setLoadedGoals] = useState(false);
    const [filtered, setFiltered] = useState(false);

    const statusMap: Record<string, string> = {
        "not-started": "Nezačatý",
        "in-progress": "Prebiehajúci",
        "completed": "Dokončený",
        "canceled": "Zrušený",
    };
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            status: "",
            finishedDate: "",
            fullfilmentRate: undefined,
        }
    });

    useEffect(() => {
        if (!selectedGoal || goalStatuses.length === 0) return;
        const defaultStatus = goalStatuses.find(status => status.label === selectedGoal.statusDescription);
            if (defaultStatus) {
                setValue("status", defaultStatus.id); 
                setSelectedStatus(defaultStatus); 
                if (defaultStatus.label === "Dokončený") {
                    setShowCompletionFields(true);
                } else {
                    setShowCompletionFields(false);
                }
            }
            
            setValue("finishedDate", selectedGoal.finishedDate || "");
            setValue("fullfilmentRate", selectedGoal.fullfilmentRate);
            setFinishedDate(dayjs(selectedGoal.finishedDate));    
        
    }, [selectedGoal, goalStatuses, setValue]);


    useEffect(() => {
        setLoadedStatuses(false);
        setLoadedGoals(false);
        api.get("/Goal/MyGoals")
            .then((res) => {
                console.log("Fetched goals:", res.data);
                const rows: Goal[] = res.data;
                setGoalRows(rows);
                setFilteredGoals(rows);
            })
            .catch((err) => {
                setGoalRows([]);
                setFilteredGoals([]);
                console.error(err);
            }).then(() => setLoadedGoals(true));
        api.get("/GoalStatus/Statuses")
            .then((res) => {
                console.log("Fetched goal statuses:", res.data);
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
            .catch((err) => console.error("Error fetching goal statuses:", err)).then(() => setLoadedStatuses(true)); 
    }, []);

    const handleRowClick = (params: any) => {
        const goal = goalRows.find(goal => goal.id === params.row.id);
        if (!goal) return;
    
        setSelectedGoal(goal);
        
        const statusFromList = goalStatuses.find(status => status.label === goal.statusDescription);
        if (statusFromList) {
            setValue("status", statusFromList.id);
            setShowCompletionFields(statusFromList.label === "Dokončený");
        } else {
            setValue("status", "");
            setShowCompletionFields(false);
        }
    
        setValue("finishedDate", goal.finishedDate || "");
        setValue("fullfilmentRate", goal.fullfilmentRate);
        setFinishedDate(dayjs(goal.finishedDate));
    
        setOpenGoalDetailsDialog(true);
    };
    

    const handleCloseGoalDetailsDialog = () => {
        setOpenGoalDetailsDialog(false);
    };

    const handleStatusChange = (value: { id: string, label: string } | null) => {
        setSelectedStatus(value);
        const newStatus = value ? value.id : "";
        const newStatusLabel = value ? value.label : "";
        setValue("status", newStatus);
    
        if (newStatusLabel === "Dokončený") {
            setShowCompletionFields(true);
        } else {
            setShowCompletionFields(false);
            setValue("fullfilmentRate", undefined);
            setValue("finishedDate", undefined);  
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
         else {
            setValue("finishedDate", null); 
        }
    };

    const filterGoals = (status: string) => {
        setFilter(status);
        setFiltered(false);
        if (status === "all") {
            setFilteredGoals(goalRows);
        } else {
            const mappedStatus = statusMap[status];
            setFilteredGoals(goalRows.filter((goal) => goal.statusDescription === mappedStatus));
            console.log("filtered:", filteredGoals);
        }
        setFiltered(true);
    };

    const getDate = (date: any) => {
        if (!date) return "-";

        const createdDate = new Date(date);
        return createdDate.toLocaleDateString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const columns: GridColDef<Goal>[] = [
        { field: "name", headerName: "Názov cieľa",
            headerClassName: 'header', width: 300 },
        { field: "statusDescription", headerName: "Stav cieľa",
            headerClassName: 'header', width: 200 },
        { field: "finishedDate", headerName: "Dátum dokončenia",
            headerClassName: 'header', width: 200, 
            valueFormatter: (params: any) => {
            if (params != null) {
                const value = params != null ? params : 0;
                return `${getDate(value)}`;
            }
            return `-`;
        }, },
        {
            field: "fullfilmentRate",
            headerName: "Miera splnenia",
            headerClassName: 'header',
            width: 150,
            flex:1,
            valueFormatter: (params: any) => {
                if (params != null) {
                    const value = params != null ? params : 0;
                    return `${value}%`;
                }
                return `-`;
            },
        },
    ];

    const onSubmit: SubmitHandler<FormData> = async (data) => {
            try {   
                const completedStatus = goalStatuses.find((status) => status.label === "Dokončený")?.id;
                if (data.status === completedStatus) {
                    if (data.fullfilmentRate === undefined || data.fullfilmentRate === null) {
                        setError("Miera splnenia je povinná pre dokončené ciele.");
                        return;
                    }
                }
                await api.put(`/Goal/EditEmployee/${selectedGoal?.id}`, data);
                openSnackbar("Zmeny sa uložili", "success");
                setOpenGoalDetailsDialog(false);
                nav('/home');
            } catch (err: any) {
                //setError(err.response?.data?.title || "Došlo k chybe pri ukladaní zmien.");
                openSnackbar("Došlo k chybe pri ukladaní zmien.", "error");
                console.error(err);
            }
        
    };

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Moje ciele a rozvoj
                </Typography>
                 {/* Filter Buttons */}
                 <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
                    <Button
                        variant={filter === "all" ? "contained" : "outlined"}
                        color="primary"
                        onClick={() => filterGoals("all")}
                    >
                        Všetky
                    </Button>
                    <Button
                        variant={filter === "completed" ? "contained" : "outlined"}
                        color="success"
                        onClick={() => filterGoals("completed")}
                    >
                        Dokončené
                    </Button>
                    <Button
                        variant={filter === "in-progress" ? "contained" : "outlined"}
                        color="warning"
                        onClick={() => filterGoals("in-progress")}
                    >
                        Prebiehajúce
                    </Button>

                    <Button
                    variant={filter === "canceled" ? "contained" : "outlined"}
                    color="error" 
                    onClick={() => filterGoals("canceled")}
                >
                    Zrušené
                </Button>

                <Button
                    variant={filter === "not-started" ? "contained" : "outlined"}
                    onClick={() => filterGoals("not-started")}
                    sx={{
                        color: filter === "not-started" ? "white" : "gray", 
                        backgroundColor: filter === "not-started" ? "gray" : "transparent", 
                        borderColor: "gray", 
                        "&:hover": {
                            backgroundColor: "lightgray", 
                        },
                    }}
                >
                    Nezačaté
                </Button>
                </Box>
                <Typography variant="subtitle1" color="text.secondary">
                {(userProfile?.firstName && userProfile?.lastName ? `${userProfile.firstName}  ${userProfile.lastName}` : "Názov používateľa")}
                </Typography>
                <Box>
                    <DataGrid
                        loading={!loadedGoals}
                        columns={columns}
                        rows={filteredGoals}
                        onRowClick={handleRowClick}
                        pageSizeOptions={[5, 10, 25]}
                        sx={dataGridStyles}
                        pagination
                    />
                </Box>

                {/* Goal Details Modal */}
                    <Dialog open={openGoalDetailsDialog} onClose={handleCloseGoalDetailsDialog} sx={{  maxWidth: "md", width: "80%"}}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogTitle>Detail cieľa</DialogTitle>
                        <DialogContent sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Box sx={{ width: "50%" }}>
                                <Typography variant="h6">{selectedGoal?.name}</Typography>
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
                                    <Typography variant="body2">
                                        {selectedGoal?.description}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{  marginTop: 2, width: "45%" }}>
                                <Autocomplete
                                    fullWidth
                                    options={goalStatuses}
                                    onChange={(e, value) => handleStatusChange(value)}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.id}>
                                            {option.label}
                                            <CircleIcon sx={{ color: option.color, marginLeft: 1 }} />
                                        </li>
                                    )}
                                    getOptionLabel={(option) => option.label}
                                    renderInput={(params) => <TextField {...params} label="Status cieľa *" />}
                                    value={goalStatuses.find(status => status.id === getValues("status"))}
                                />

                                <Box sx={{ 
                                    marginTop: 2,
                                    visibility: showCompletionFields ? 'visible' : 'hidden',
                                    opacity: showCompletionFields ? 1 : 0,
                                    transition: "visibility 0s, opacity 0.3s linear" 
                                }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            label="Dátum dokončenia *"
                                            value={finishedDate}
                                            onChange={handleDateChangeFinished}
                                            sx={{ marginBottom: 2 }}
                                        />
                                    </LocalizationProvider>

                                    <TextField
                                        label="Miera splnenia"
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
                                </Box>
                            </Box>
                        </DialogContent>

                        <DialogActions>
                            <Button type="submit" variant="contained" color="primary">
                                Uložiť
                            </Button>
                            <Button onClick={handleCloseGoalDetailsDialog} color="primary">
                                Zatvoriť
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
                
            </Box>
        </Layout>
    );
};

export default EmployeeGoals;
