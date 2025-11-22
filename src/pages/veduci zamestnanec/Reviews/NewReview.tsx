import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import {Autocomplete, Box, Stack, TextField, Typography, Button, Alert, TextareaAutosize, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { z } from "zod";
import {useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../app/api";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { EmployeeCard } from "../../../types/EmployeeCard";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSnackbar } from '../../../hooks/SnackBarContext';
import UserProfile from "../../../types/UserProfile";
import EmployeeCardDialog from "../../spravca/Users/EmployeCardDialog";
import { Department } from "../../../types/Department";
import { useAuth } from "../../../hooks/AuthProvider";
import { dataGridStyles } from "../../../styles/gridStyle";

const schema = z.object({
    employeeDeadline: z.string(),
    superiorDeadline: z.string(), 
    employeeIds: z.array(z.string()),

});

type FormData = z.infer<typeof schema>;

const NewReview: React.FC = () => {
    const nav = useNavigate();
    const { userProfile } = useAuth();
    const [error, setError] = useState<string>();
    const [reviewNumber, setReviewNumber] = useState<number | null>(null);
    const [dueDate, setDueDate] = React.useState<Dayjs | null>(dayjs('2024-11-09'));
    const [departmentsData, setDepartmentsData] = useState<Department[]>([]);
    const [employeeData, setEmployeeData] = useState<EmployeeCard[]>([]);
    const [employeeIds, setEmployeeIds] = useState<string[]>([]);
    const [departmentIds, setDepartmentIds] = useState<string[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [employeeDeadline, setEmployeeDeadline] = useState<Dayjs | null>(dayjs());
    const [managerDeadline, setManagerDeadline] = useState<Dayjs | null>(dayjs());
    const [openCardDialog, setOpenCardDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedTab, setSelectedTab] = useState<"employees" | "departments">("employees");

    const { openSnackbar } = useSnackbar();
    const {
            register,
            handleSubmit,
            setValue,
            formState: { errors },
        } = useForm<FormData>({
            resolver: zodResolver(schema),
            defaultValues: {
                employeeDeadline: "",
                superiorDeadline: "",
                employeeIds: [],
    
            }
        });


    useEffect(() => {
        api.get("/EmployeeCard/EmployeeCards")
            .then((res) => setEmployeeData(res.data))
            .catch((err) => console.error("Error fetching employee cards:", err));
        api.get("/Department/DepartmentsWithEmployeeCount")
            .then((res) => setDepartmentsData(res.data))
            .catch((err) => console.error("Error fetching employee cards:", err));
    
        const fetchReviewNumber = async () => {
                try {
                    const response = await api.get("/Review/Count"); 
                    const nextReviewNumber = (response.data + 1).toString().padStart(10, "0");
                    setReviewNumber(nextReviewNumber);
                } catch (err) {
                    console.error("Chyba pri získavaní čísla posudku:", err);
                }
            };
            fetchReviewNumber();
    }, []);

    

    const handleEmployeeSelection = (employees: string[]) => {
        setSelectedEmployees(employees);
    };

    const handleEmployeeCardClick = async (employeeCardId: string) => {
        try {
            const response = await api.get(`/EmployeeCard/GetUserByEmployeeCard?employeeCardId=${employeeCardId}`);
            setSelectedEmployee(response.data);
            setOpenCardDialog(true);
        } catch (error) {
            console.error("Chyba pri načítaní zamestnanca:", error);
        }
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const senderId = userProfile?.id;
        const dataToSend = {
            senderId,
            employeeIds,
            employeeDeadline: employeeDeadline?.toISOString(), 
            superiorDeadline: managerDeadline?.toISOString(), 
        };

        await api.post("/Review/CreateReview", dataToSend)
            .then((res) => {
                console.log(" created:", res.data);
                openSnackbar("Posudok bol úspešne vytvorený", "success");
                nav('/manageReviews');
            })
            .catch((err) => {
                setError(err.response.data.title);
                console.error("Error creating:", err);
            });
    };
    

    const handleAddEmployee = (employeeId: string) => {
            const employee = employeeData.find(emp => emp.employeeId === employeeId);
            if (employee && !employeeIds.includes(employeeId)) {
                setEmployeeIds([...employeeIds, employeeId]);
                setSelectedEmployees((prev) => [...prev, `${employee.name} ${employee.surname}`]);
                console.log("sel emp ", selectedEmployees);
            }
    };
    
    const handleRemoveEmployee = (employeeId: string) => {
        const employee = employeeData.find(emp => emp.employeeId === employeeId);
    if (employee) {
        setEmployeeIds(employeeIds.filter(id => id !== employeeId));
        setSelectedEmployees(selectedEmployees.filter(name => name !== `${employee.name} ${employee.surname}`));
    }
    };

    const handleAddDepartment = (departmentCode: string) => {
        const departmentEmployees = employeeData.filter(
            (employee) => employee.departmentId === departmentCode
        );
        
        const newEmployeeIds = [
            ...employeeIds,
            ...departmentEmployees.map((employee) => employee.employeeId),
        ];
    
        setEmployeeIds(newEmployeeIds);

        if (!departmentIds.includes(departmentCode)) {
            setDepartmentIds([...departmentIds, departmentCode]);
        }
    };
    
    const handleRemoveDepartment = (departmentCode: string) => {
        const departmentEmployees = employeeData.filter(
            (employee) => employee.department === departmentCode
        );
    
        const newEmployeeIds = employeeIds.filter(
            (id) => !departmentEmployees.some((employee) => employee.employeeId === id)
        );
    
        setEmployeeIds(newEmployeeIds);

        const newDepartmentIds = departmentIds.filter((id) => id !== departmentCode);
        setDepartmentIds(newDepartmentIds);
    };

    const handleSaveEmployees = () => {
        const employeeNames = employeeIds.map((id) => {
            const employee = employeeData.find((emp) => emp.employeeId === id);
            return employee ? `${employee.name} ${employee.surname}` : '';
        });
    
        setSelectedEmployees(employeeNames); 
        setOpenModal(false);
      };

    
    const columnsEmployee: GridColDef<EmployeeCard>[] = [
            { field: "employeeId", headerName: "Id", headerClassName: "header", width: 150 },
            { field: "name", headerName: "Meno zamestnanca", headerClassName: "header", width: 150 },
            { field: "surname", headerName: "Priezvisko", headerClassName: "header", width: 150 },
            { field: "department", headerName: "Oddelenie", headerClassName: "header", width: 200 },  
            
            {
                field: "actions",
                headerName: "Akcie",
                headerClassName: "header",
                width: 200,
                flex: 1,
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

        const columnsDepartment: GridColDef<Department>[] = [
            { field: "code", headerName: "Kód oddelenia",headerClassName: "header", width: 150 },
            { field: "name", headerName: "Názov",headerClassName: "header", width: 150 },
            { field: "employeeCount", headerName: "Počet zamestnancov",headerClassName: "header", flex:1, width: 150 }, 
            
            {
                field: "actions",
                headerName: "Akcie",
                headerClassName: "header",
                width: 200,
                renderCell: (params: any ) => (
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: "turquoise", color: "black", fontSize: "12px", textWrap: "wrap" }}
                            disabled={departmentIds.includes(params.row.id)}
                            onClick={() => handleAddDepartment(params.row.id)} 
            
                        >
                            Pridať
                        </Button>

                        <Button
                            variant="contained"
                            sx={{ backgroundColor: "orange", color: "black", fontSize: "12px", textWrap: "wrap" }}
                            disabled={!departmentIds.includes(params.row.id)}
                            onClick={() => handleRemoveDepartment(params.row.id)} 
            
                        >
                            Odobrať
                        </Button>
                        
                    </Stack>
                ),
            },
        ];
        return (
            <Layout>
                <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Vytvoriť nový cieľ
                    </Typography>
                    <Typography>Názov: Posudok č. PC{reviewNumber ?? "..."}</Typography>

    
                    <Button variant="contained" color="primary" sx={{ marginY: 2 }} onClick={() => setOpenModal(true)}>
                    Pridať zamestnanca
                </Button>

                <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                    <DialogTitle>
                        Pridať zamestnanca k posudku č. PC{reviewNumber ?? "..."}
                        <Stack direction="row" spacing={2} sx={{ float: "right" }}>
                            <Button 
                                variant={selectedTab === "employees" ? "contained" : "outlined"} 
                                color="primary" 
                                onClick={() => setSelectedTab("employees")}
                            >
                                Zoznam zamestnancov
                            </Button>
                            <Button 
                                variant={selectedTab === "departments" ? "contained" : "outlined"} 
                                color="primary" 
                                onClick={() => setSelectedTab("departments")}
                            >
                                Zoznam oddelení
                            </Button>
                        </Stack>
                    </DialogTitle>

                    <DialogContent>
                    <Box sx={{ height: 400, width: "100%" }}>
                            {selectedTab === "employees" ? (
                                <DataGrid
                                sx={dataGridStyles}
                                    columns={columnsEmployee}
                                    rows={employeeData}
                                    pageSizeOptions={[5, 10, 25]}
                                    pagination
                                    onCellClick={(params) => {
                                        if (selectedTab === "employees" && (params.field === "name" || params.field === "surname")) {
                                            handleEmployeeCardClick(params.row.employeeId);
                                        }
                                    }}
                                    getRowId={(row) => row.employeeId}
                                />
                            ) : (
                                <DataGrid
                                sx={dataGridStyles}
                                    columns={columnsDepartment}
                                    rows={departmentsData}
                                    pageSizeOptions={[5, 10, 25]}
                                    pagination
                                    getRowId={(row) => row.code}
                                />
                            )}
                        </Box>
                        
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleSaveEmployees} color="primary">Uložiť</Button>
                    </DialogActions>
                    <DialogActions>
                        <Button onClick={() => setOpenModal(false)} color="primary">Zavrieť</Button>
                    </DialogActions>
                </Dialog>

                {selectedEmployees.length > 0 && (
                    <Typography>
                        Pridaní zamestnanci: {selectedEmployees.join(", ")}
                    </Typography>
                )}


                
                    <Stack direction="column" gap={3} sx={{ width: "100%" }} component="form" onSubmit={handleSubmit(onSubmit)}>
                    
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                            label="Termín dopytovaného zamestnanca *"
                            value={employeeDeadline}
                            {...register('employeeDeadline', { required: 'Termín je povinný.' })}
                            onChange={setEmployeeDeadline}
                            //renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                        <DateTimePicker
                            label="Termín vedúceho zamestnanca *"
                            value={managerDeadline}
                            {...register('superiorDeadline', { required: 'Termín je povinný.' })}
                            onChange={setManagerDeadline}
                            //renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                                    
                        </LocalizationProvider>
                        <Stack direction="row" gap={3}>
                            <Button type="submit" variant="contained" color="primary">
                                Vytvoriť
                            </Button>
                            <Button type="button" variant="contained" color="secondary" onClick={() => nav('/manageReviews')}>
                                Zrušiť
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Layout>
        );
    
};

export default NewReview;