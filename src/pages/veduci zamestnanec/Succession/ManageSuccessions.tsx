import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Button, Typography, Snackbar, Stack, Tooltip } from "@mui/material";
import api from "../../../app/api";
import { useNavigate } from "react-router-dom";
import { Alert, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Divider, Tabs, Tab  } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from "@mui/system";
import SuccessionPlan from "../../../types/SuccessionPlan";
import DeleteDialog from "../../../components/DeleteDialog";
import PersonalizedPlan from "../../../types/PersonalizedPlan";
import { EmployeeCard } from "../../../types/EmployeeCard";
import { z } from "zod";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import GoalEditDialog from "../../../components/GoalEditDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import dayjs, { Dayjs } from "dayjs";
import { useSnackbar } from "../../../hooks/SnackBarContext";
import AddSuccessionGoalDialog from "../../../components/AddSuccessionGoalDialog";
import { useAuth } from "../../../hooks/AuthProvider";
import Roles from "../../../types/Roles";
import useLoading from "../../../hooks/LoadingData";
const schema = z.object({
    status: z.string().min(1, "Stav cieľa je povinný!"),
    finishedDate: z.string().nullable().optional(),
    fullfilmentRate: z.number().min(0, "Miera splnenia musí byť medzi 0 a 100").max(100, "Miera splnenia musí byť medzi 0 a 100").nullable().optional(), // Optional completion rate
    description: z.string().min(0, "Popis cieľa je povinný!")
});

type FormData = z.infer<typeof schema>;

type GroupedSuccessionPlans = {
    leaveTypeName: string;
    successionPlans: SuccessionPlan[];
};

const colorMap: Record<string, string> = {
    "Kritický odchod": "#EC6602",
    "Plánovaný odchod": "#009999",
    "Redundancia tímu": "#616366",
    "Personalizovaný plán": "#EC6602",
  };


const columnConfig: Record<string, string[]> = {
    "Kritický odchod": [
    "Meno a priezvisko", "Súčasná pozícia", "Oddelenie", "Dôvod odchodu", "Dátum odchodu",
    "Nástupca", "Pozícia nástupcu", "Oddelenie nástupcu", "Pripravenosť", "Zručnosti", "Akcia"
    ],
    "Plánovaný odchod": [
    "Meno a priezvisko", "Súčasná pozícia", "Oddelenie", "Dôvod odchodu", "Dátum odchodu",
    "Nástupca", "Pozícia nástupcu", "Oddelenie nástupcu", "Pripravenosť", "Zručnosti", "Akcia"
    ],
    "Redundancia tímu": [
    "Meno a priezvisko", "Súčasná pozícia", "Oddelenie", "Dôvod odchodu", "Dátum odchodu"
    ],
    "Personalizovaný plán": [
    "Meno a priezvisko", "Názov cieľa", "Kategória cieľa", "Stav cieľa", "Akcia"
    ]
};

const ManageSuccessions: React.FC = () => {
    const { openSnackbar } = useSnackbar();
    const nav = useNavigate();
    const { userProfile} = useAuth();
    const [error, setError] = useState<string>();
    const [successionPlans, setSuccessionPlans] = useState<GroupedSuccessionPlans[]>([]);
    const [personalizedPlans, setPersonalizedPlans] = useState<PersonalizedPlan[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSnackbarOpen, setSnackbarOpen] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<SuccessionPlan | null>(null);
    const [selectedPersonalizedPlanId, setSelectedPersonalizedPlanId] = useState<PersonalizedPlan | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [employeesInTeam, setEmployeesInTeam] = useState<EmployeeCard[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeCard | null>(null);
    const [goalStatuses, setGoalStatuses] = useState<{ id: string; label: string , color:any }[]>([]); 
    const [showCompletionFields, setShowCompletionFields] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [finishedDate, setFinishedDate] = React.useState<Dayjs | null>(dayjs('2024-11-09'));
    const [openGoalDetailsDialog, setOpenGoalDetailsDialog] = useState(false);
    const [openSuccessionGoalModal, setOpenSuccessionGoalModal] = useState(false);
    const [loaded, setLoaded] = useState(false);

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
            api.get("/Succession/GetSuccessionPlans")
            .then((res) => {
                console.log("Received plans:", res.data);
                setSuccessionPlans(res.data);
            })
            .catch((err) => {
                
                console.error(err);
            }).finally(() => setLoaded(true));
  
            
            api.get(`/EmployeeCard/GetEmployeesInTeam/`)
                        .then((res) => {
                            setEmployeesInTeam(res.data); 
                            console.log("employeeCards", res.data); 
                        })
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
                        .catch((err) => console.error("Error fetching goal statuses:", err)); 
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            console.log("Fetching personalized plans for employee:", selectedEmployee.employeeId);
            api.get(`/Succession/GetPersonalizedPlans/${selectedEmployee.employeeId}`)
                .then((res) => {
                    console.log("Received personalized plans:", res.data);
                    setPersonalizedPlans(res.data);
                    setSelectedGoalId(null);
                })
                .catch((err) => {
                    console.error("Error fetching personalized plans:", err);
                });
        } else {
            setPersonalizedPlans([]); 
        }    
    }, [selectedEmployee]);

    useEffect(() => {
        if (selectedGoalId) {
            api.get(`/Goal/${selectedGoalId}`)
                        .then((res) => {
                            console.log("Received personalized goals:", res.data);
                            setSelectedGoal(res.data);
                            setSelectedGoalId(res.data.id);
                        })
                        .catch((err) => {
                            console.error("Error fetching personalized plans:", err);
                        }); 
        }
    }, [selectedGoalId]);

    
    
    const getDate = (date: any) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleEdit = (plan: SuccessionPlan) => {
        const id = plan.id;
        nav('/editSuccession', { state: { id } });
    };
    
    const handleDelete = (plan: SuccessionPlan) => {
        console.log("Delete plan", plan);
        setSelectedPlanId(plan);
        setDialogOpen(true);
    };

    
    const handleDeletePersonalized = (plan: PersonalizedPlan) => {
        console.log("Delete plan", plan);
        setSelectedPersonalizedPlanId(plan);
        setSelectedGoal(plan.goalId);
        setDialogOpen(true);
    };

    const openEmployeeModal = () => {
        setOpenModal(true);
    };

    const handleClose = () => {
        reset();
        setOpenSuccessionGoalModal(false)

      };

    const handleSelectEmployee = (employeeId: string) => {
        console.log ("chosen: ", employeeId);
        const employee = employeesInTeam.find(emp => emp.employeeId === employeeId);
        if (employee) {
            setSelectedEmployee(employee);
        }
        console.log ("chosen: ", employee?.fullName);
        setOpenModal(false);
    };  

    const handleRowClick = (params: PersonalizedPlan) => {
        //const goal = personalizedPlans.find(goal => goal.id === params.goalId);
        setSelectedGoalId(params.goalId);
        setOpenGoalDetailsDialog(true);
        console.log("clicked: ", params);

        
    };

    const handleCloseGoalDetailsDialog = () => {
        setOpenGoalDetailsDialog(false);
    };

    const handleDescpritionChange = (value: string) => {
        setValue("description", value);
    };

    const handleStatusChange = (value: { id: string, label: string } | null) => {
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

    const fetchPlansForEmployee = () => {
        if (selectedEmployee) {
          api.get(`/Succession/GetPersonalizedPlans/${selectedEmployee.employeeId}`)
            .then((res) => {
              setPersonalizedPlans(res.data);
              console.log ("changes fetched")
            })
            .catch((err) => {
              console.error("Error fetching personalized plans:", err);
            });
        }
    };

    const CustomTabs = styled(Tabs)({
        borderBottom: "1px solid #e0e0e0", 
        minHeight: "auto",
        "& .MuiTabs-indicator": {
            backgroundColor: "#008080", 
            height: "3px",
        },
    });
    
    const CustomTab = styled(Tab)({
        textTransform: "none", // Keep original casing
        minWidth: 0,
        minHeight: "auto",
        fontWeight: 500,
        fontSize: "14px",
        "&.Mui-selected": {
            color: "#000000", // Selected tab text color
        },
        "&:not(.Mui-selected)": {
            color: "#555555", // Unselected tab text color (grayish)
        },
        "&:not(:last-of-type)": {
            borderRight: "1px solid #e0e0e0", // Light gray line
        },
    });

    const columnsUser: GridColDef<EmployeeCard>[] = [
        { field: "employeeId", headerName: "ID zamestnanca", width: 300 },
        { field: "fullName", headerName: "Meno zamestnanca", width: 150 },
        { field: "department", headerName: "Oddelenie", width: 150 },
        {
            field: "actions",
            headerName: "Akcie",
            width: 200,
            renderCell: (params: any) => (
                <Button
                    variant="contained"
                    color="info"
                    disabled={selectedEmployee?.employeeId === params.row.employeeId}
                    onClick={() => handleSelectEmployee(params.row.employeeId)}
                >
                    Vybrať
                </Button>
            ),
        },
    ];
    

    const renderCell = (col: string, plan: SuccessionPlan) => {
        switch (col) {
          case "Meno a priezvisko":
            return plan.leavingFullName;
          case "Súčasná pozícia":
            return plan.leavingJobPosition;
          case "Oddelenie":
            return plan.leavingDepartment;
          case "Dôvod odchodu":
            return plan.reason;
          case "Dátum odchodu":
            return getDate(plan.leaveDate);
          case "Nástupca":
            return plan.successorFullName;
          case "Pozícia nástupcu":
            return plan.successorJobPosition;
          case "Oddelenie nástupcu":
            return plan.successorDepartment;
          case "Pripravenosť":
            return plan.readyStatus;

          case "Zručnosti":
            return plan.readyState;
          case "Akcia":
            return (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleEdit(plan)}
                  sx={{
                    backgroundColor: '#BA4400',
                    textTransform: 'none', 
                    '&:hover': {
                      backgroundColor: '#A53D00', 
                    },
                  }}
                >
                  Editovať
                  
                </Button>
                <Box
                    sx={{
                        height: 24, 
                        width: '1px',
                        backgroundColor: 'black',
                        alignSelf: 'center'
                    }}
                />
                <Tooltip title="Odstrániť">
                  <IconButton color="error" onClick={() => handleDelete(plan)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            );
          default:
            return null;
        }
      };
      

    
    const SuccessionTable: React.FC<{ leaveType: string; plans: SuccessionPlan[] }> = ({ leaveType, plans }) => {
        const color = colorMap[leaveType] || "#000";
        const columns = columnConfig[leaveType];


        return (
            <Box sx={{width: leaveType === "Redundancia tímu" ? "50%" : "100%", marginBottom: 4 }}>
                <Typography variant="h6" sx={{ color }}>
                    {leaveType}
                </Typography>
                <Table  sx={{ borderCollapse: "separate", borderSpacing: "0 4px" }}>
                    <TableHead>
                        <TableRow>{columns.map((col) => (
                            <TableCell key={col} 
                            sx={{
                                width: `${100 / columns.length}%`,
                                maxWidth: "200px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontStyle: "italic"
                              }}
                            >{col}</TableCell>))}
                        </TableRow>
                    </TableHead>
                    
                    <TableBody>
                        {plans.length > 0 ? (
                        plans.map((plan, index) => (
                            <TableRow 
                                key={index} 
                                sx={{ backgroundColor: "#fff", 
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                }}>
                
                            {columns.map((col, idx) => (
                                <TableCell key={idx} sx={{
                                    borderLeft: col === "Meno a priezvisko" ? "6px solid  " + color: undefined,
                                    borderRight: col === "Dátum odchodu" ? "6px solid  " + color: undefined,
                                  }}>
                                    {renderCell(col, plan)}
                                </TableCell>
                            ))}
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} align="center" sx={{ fontStyle: "italic", color: "#999" }}>
                                Žiadne dáta
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Box>
        );
    };

    const PersonalizedPlanTable: React.FC<{ plans: PersonalizedPlan[] }> = ({ plans }) => {
        const color = colorMap["Personalizovaný plán"];
        const columns = columnConfig["Personalizovaný plán"];
    
        return (
            <Box sx={{ width: "100%", marginBottom: 4 }}>
                <Typography variant="h6" sx={{ color: "#005A5A" }}>
                    Personalizovaný plán
                </Typography>
                <Table sx={{ borderCollapse: "separate", borderSpacing: "0 4px" }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((col) => (
                                <TableCell key={col}
                                    sx={{
                                        width: `${100 / columns.length}%`,
                                        maxWidth: "200px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        fontStyle: "italic"
                                    }}
                                >
                                    {col}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.length > 0 ? (
                            plans.map((plan, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        backgroundColor: "#fff",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <TableCell sx={{ borderLeft: `6px solid ${color}` }}>
                                    {plan.employeeFullName}
                                    </TableCell>

                                    <TableCell>{plan.goalName || "-"}</TableCell>
                                    <TableCell>{plan.goalCategory || "-"}</TableCell>
                                    <TableCell>{plan.goalStatus || "-"}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleRowClick(plan)}
                                                sx={{
                                                    backgroundColor: '#BA4400',
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        backgroundColor: '#A53D00',
                                                    },
                                                }}
                                            >
                                                Editovať
                                            </Button>
                                            <Box
                                                sx={{
                                                    height: 24,
                                                    width: '1px',
                                                    backgroundColor: 'black',
                                                    alignSelf: 'center'
                                                }}
                                            />
                                            <Tooltip title="Odstrániť">
                                                <IconButton color="error" onClick={() => handleDeletePersonalized(plan)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ fontStyle: "italic", color: "#999" }}>
                                    Žiadne dáta
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Box>
        );
    };
    
    
          

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {   
            const completedStatus = goalStatuses.find((status) => status.label === "Dokončený")?.id;
            if (data.status === completedStatus) {
                if (data.fullfilmentRate === undefined || data.fullfilmentRate === null) {
                    setError("Miera splnenia je povinná pre dokončené ciele.");
                    return;
                }
            }
            console.log("edited: ", data);
            await api.put(`/Goal/EditPersonalized/${selectedGoalId}`, data);
            openSnackbar("Zmeny sa uložili", "success");
            setOpenGoalDetailsDialog(false);
            setSelectedGoalId(null);
            fetchPlansForEmployee();
            nav('/manageSuccessions');
        } catch (err: any) {
            setError(err.response?.data?.title || "Došlo k chybe pri ukladaní zmien.");
            console.error(err);
        }
    
    };  
    
    const confirmDelete = async () => {
        if (selectedPlanId) {
            try {
                await api.delete(`/Succession/Delete/${selectedPlanId.id}`);
                setSuccessionPlans((prevGroups) =>
                    prevGroups.map((group) => ({
                        ...group,
                        successionPlans: group.successionPlans.filter(
                            (plan) => plan.id !== selectedPlanId.id
                        ),
                    }))
                );
                openSnackbar("Nástupníctvo bolo úspešne vymazané.", "success");
                //setSnackbarOpen(true);
            } catch (err: any) {
                if (err.response && err.response.status === 400) {
                    setErrorMessage(err.response.data.message);
                    //setSnackbarOpen(true);
                    openSnackbar("Nastal problém s vymazaním nástupníctva.", "error");
                } else {
                    console.error("Error deleting plan:", err);
                }
            } finally {
                setDialogOpen(false);
                setSelectedPlanId(null);
            }
        }
    };

    const confirmDeletePersonalized = async () => {
        if (selectedPersonalizedPlanId) {
            try {
                await api.delete(`/Goal/Delete/${selectedPersonalizedPlanId.goalId}`);
                setPersonalizedPlans((prevPlans) =>
                    prevPlans.filter((plan) => plan.goalId !== selectedPersonalizedPlanId.goalId)
                );
                openSnackbar("Personalizovaný plán bol úspešne vymazaný.", "success");
                //setSnackbarOpen(true);
        } catch (err: any) {
            if (err.response && err.response.status === 400) {
                setErrorMessage(err.response.data.message);
                //setSnackbarOpen(true);
                openSnackbar("Nastal problém s vymazaním personalizovaného plánu.", "error");
            } else {
                console.error("Error deleting plan:", err);
            }
        } finally {
            setDialogOpen(false);
            setSelectedPersonalizedPlanId(null);
        }
        }
    };

    const loadingIndicator = useLoading(!loaded);

    return (
        
        <Layout >
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Zoznam nastupníckych zamestnancov 
                </Typography>
                { loadingIndicator ? loadingIndicator : (
                <Box>
                <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                    <DialogTitle>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Hľadať zamestnanca</Typography>
                        <Button
                            variant="outlined"
                            onClick={() => {
                            setSelectedEmployee(null);
                            setOpenModal(false);
                            }}
                        >
                            Zrušiť výber
                        </Button>
                        </Stack>
                    </DialogTitle>

                    <Box sx={{ height: 400, width: "100%", px: 3, pb: 3 }}>
                        <DataGrid
                        columns={columnsUser}
                        rows={employeesInTeam}
                        initialState={{
                            pagination: {
                            paginationModel: {
                                pageSize: 6,
                            },
                            }
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        pagination
                        getRowId={(row: any) => row.employeeId}
                        />
                    </Box>
                    </Dialog>

                <CustomTabs value={activeTab} onChange={handleTabChange} sx={{ marginBottom: 3 }}>
                    <CustomTab label="Hlavný zoznam" />
                    <CustomTab label="Personalizovaný plán" />
                </CustomTabs>

                {activeTab === 0 && (
                    <>
                        {/*  Hlavný zoznam */}
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ marginBottom: 2 }}
                            onClick={() => nav("/newSuccession")}
                        >
                            Pridať
                        </Button>
                    
                        {["Kritický odchod", "Plánovaný odchod", "Redundancia tímu"].map((type) => (
                            <SuccessionTable key={type} leaveType={type} plans={successionPlans.find(g => g.leaveTypeName === type)?.successionPlans || []} />
                        ))}

                    <DeleteDialog
                        open={isDialogOpen}
                        onClose={() => setDialogOpen(false)}
                        onConfirm={confirmDelete}
                    />
                    </>
                )}

                {activeTab === 1 && (
                    <>
                        {/* Personalizovaný plán */}
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ marginBottom: 2 }}
                            onClick={() => openEmployeeModal()}
                        >
                            Hľadať zamestnanca
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ marginBottom: 2 }}
                            onClick={() => setOpenSuccessionGoalModal(true)}
                        >
                            Vytvoriť nástupnícky cieľ
                        </Button>

                        
                        <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
                            Personalizovaný plán zamestnanca: <strong>{selectedEmployee?.fullName}</strong>
                        </Typography>

                        {/* Personalizovaný plán tabuľka */}
                        <PersonalizedPlanTable plans={personalizedPlans} />
                    
                        <GoalEditDialog
                            open={openGoalDetailsDialog}
                            onClose ={handleCloseGoalDetailsDialog}
                            onSubmit={onSubmit}
                            selectedGoal = {selectedGoal}
                            goalStatuses = {goalStatuses}
                            showCompletionFields = {showCompletionFields}
                            finishedDate = {finishedDate}
                            handleDateChangeFinished = {handleDateChangeFinished}
                            handleStatusChange = {handleStatusChange}
                            handleSubmit = {handleSubmit}
                            register = {register}
                            setValue = {setValue}
                            getValues = {getValues}
                            errors = {errors}
                            reset={reset}
                            isSuperior={userProfile?.role == Roles.Veduci}
                            setError={ setError}
                        />                   
                        
                    <DeleteDialog
                        open={isDialogOpen}
                        onClose={() => setDialogOpen(false)}
                        onConfirm={confirmDeletePersonalized}
                    />    

                    <AddSuccessionGoalDialog
                    open={openSuccessionGoalModal}
                    onClose={() => setOpenSuccessionGoalModal(false)}
                    selectedPerson={selectedEmployee}
                    onGoalCreated={fetchPlansForEmployee} 
                    />
                    </>
                )}

                {/*<Snackbar
                    open={isSnackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => setSnackbarOpen(false)}
                        severity={errorMessage ? "error" : "success"}
                        sx={{ width: "100%" }}
                    >
                        {errorMessage || "Položka bola úspešne vymazaná."}
                    </Alert>
                </Snackbar>*/}
                </Box>
                )}
            </Box>
        </Layout>
        
    );
};


export default ManageSuccessions;
