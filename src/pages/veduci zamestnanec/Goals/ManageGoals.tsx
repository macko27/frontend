import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Button, Typography, Snackbar, Stack, Tooltip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import UserProfile from "../../../types/UserProfile";
import api from "../../../app/api";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import EmployeeCardDialog from "../../spravca/Users/EmployeCardDialog";
import Goal from "../../../types/Goal";
import { EmployeeCard } from "../../../types/EmployeeCard";
import { dataGridStyles } from "../../../styles/gridStyle";

const ManageGoals: React.FC = () => {
    const [goalRows, setGoalRows] = useState<Goal[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openCardDialog, setOpenCardDialog] = useState(false);
    const [openGoalDetailsDialog, setOpenGoalDetailsDialog] = useState(false); // Modal state
    const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null); // For showing employee card dialog
    const [selectedEmployees, setSelectedEmployees] = useState<SimplifiedEmployeeCard[]>([]); // Vybraní zamestnanci

    const [openEmployeesModal, setOpenEmployeesModal] = useState(false); 
    const [loaded,setLoaded] = useState(false);

    const nav = useNavigate();

    useEffect(() => {
        api.get("/Goal/Goals")
            .then((res) => {
                console.log("prijate:", res.data);
                const rows: Goal[] = res.data;
                setGoalRows(rows);
            })
            .catch((err) => {
                setGoalRows([]);
                console.error(err);
            }).finally(() => setLoaded(true));
    }, []);


    const handleOpenDialog = (goal: Goal) => {
        setSelectedGoal(goal);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedGoal(null);
    };

    const handleDelete = () => {
        if (selectedGoal) {
            api.delete(`/Goal/Delete/${selectedGoal.id}`)
                .then(() => {
                    setGoalRows((prevRows) => prevRows.filter((goal) => goal.id !== selectedGoal.id));
                    setOpenSnackbar(true); // Show success message
                })
                .catch((err) => console.error("Cieľ sa nevymazal:", err))
                .finally(() => handleCloseDialog()); // Close dialog
        }
    };

    const handleEdit = (id: string, field: string) => {
        if (field === "actions") { 
            if (id) {
                //nav(`/editGoal/${id}`); 
                nav('/editGoal', { state: { id} });
            } else {
                console.error("Goal ID is missing or invalid");
            }
        } else {
            console.log("Click event did not originate from the actions column");
        }
    };
    const handleRowClick = (params: any) => {
        const goal = goalRows.find(goal => goal.id === params.row.id);       
        setSelectedGoal(goal || null);
        setOpenGoalDetailsDialog(true);
    };

    const handleCloseGoalDetailsDialog = () => {
        setOpenGoalDetailsDialog(false);
    };
    

    const handleEmployeeCardClick = async (employeeCardId: string) => {
        const response = await api.get(`/EmployeeCard/GetUserByEmployeeCard?employeeCardId=${employeeCardId}`);
        const userProfile: UserProfile = response.data; 

        setSelectedEmployee(userProfile);
        //setSelectedEmployee(employee);
        setOpenCardDialog(true); // Show employee card dialog
    };
    type SimplifiedEmployeeCard = {
        id: string;
        name: string;
        surname: string;
    };
    const handleEmployeeClick = (employees: SimplifiedEmployeeCard[]) => {
        setSelectedEmployees(employees);
        setOpenEmployeesModal(true); // Otvorenie modálneho okna
    };

    const generateRows = (goals: Goal[]) => {
        if (!Array.isArray(goals) || goals.length === 0) {

            return [];
        }
    
        const rows: any[] = [];
        
        goals.forEach(goal => {
            const assignedEmployees = goal.assignedEmployees;
            if (assignedEmployees && assignedEmployees.length > 0) {
                rows.push({
                    id: goal.id,
                    name: goal.name,
                    categoryDescription: goal.categoryDescription,
                    statusDescription: goal.statusDescription,
                    assignedEmployees: assignedEmployees,
                    goalId: goal.id
                });
            }
        });
        return rows;
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
    
    const columnsUser: GridColDef[] = [
        { field: "name", headerName: "Meno", width: 150 },
        { field: "surname", headerName: "Priezvisko", width: 150 },
    ];
    

    const columns: GridColDef<Goal>[] = [
        {
            field: "assignedEmployees", 
            headerName: "Priradený zamestnanec", 
            headerClassName: "header",
            width: 350,
            renderCell: (params) => {
                const assignedEmployees = params.row.assignedEmployees || [];
                const employeeNames = assignedEmployees.map(emp => `${emp.name} ${emp.surname}`);
    
                return (
                    <Tooltip title={employeeNames.join(', ')}>
                    <Typography 
                        variant="body2" 
                        noWrap 
                        sx={{ 
                            cursor: 'pointer', 
                            textDecoration: 'underline',
                            '&:hover': {
                                color: 'gray',
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEmployeeClick(assignedEmployees);
                        }}
                    >
                        {employeeNames.length > 3 ? `${employeeNames.slice(0, 3).join(', ')}...` : employeeNames.join(', ')}
                    </Typography>
                </Tooltip>
                );
            }
        },
        { field: "name", headerName: "Názov cieľa", headerClassName: "header", width: 150 },
        { field: "categoryDescription", headerName: "Kategória cieľa",headerClassName: "header", width: 150 },
        { field: "statusDescription", headerName: "Stav cieľa",headerClassName: "header", width: 150 },
        {
            field: "actions",
            headerName: "Akcie",
            headerClassName: "header",
            minWidth: 200,
            flex: 1,
            renderCell: (params) => (
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        color= "primary"
                        size="small"
                        onClick={() => handleEdit(params.row.id, params.field)}
                    >   
                        Editovať
                    </Button>
                    <IconButton
                        aria-label="delete"
                        size="large"
                        onClick={() => handleOpenDialog(params.row)}
                        sx={{ color: 'red' }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            ),
        }
    ];

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Ciele a rozvoj môjho tímu
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginBottom: 2 }}
                    onClick={() => nav("/newGoal")}
                >
                    Vytvoriť nový cieľ
                </Button>
                <Box>
                    <DataGrid
                        loading={!loaded}
                        columns={columns}
                        rows={generateRows(goalRows)}
                        onRowClick={handleRowClick}
                        pageSizeOptions={[5, 10, 25]}
                        pagination
                        sx={dataGridStyles}
                    />
                </Box>

                {/* Delete Confirmation Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Potvrdiť vymazanie</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Naozaj chcete vymazať túto položku? Operácia je nenávratná.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                            Zrušiť
                        </Button>
                        <Button onClick={handleDelete} color="primary">
                            Vymazať
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Success Snackbar */}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={3000}
                    onClose={() => setOpenSnackbar(false)}
                    message="Položka bola úspešne vymazaná"
                />
                {/* Modálne okno na zobrazenie zamestnancov */}
                <Dialog open={openEmployeesModal} onClose={() => setOpenEmployeesModal(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Priradení zamestnanci</DialogTitle>
                    <DialogContent>
                        <Box sx={{ height: 300 }}>
                            <DataGrid
                                columns={columnsUser}
                                rows={selectedEmployees.map((emp) => ({
                                    id: emp.id,
                                    name: emp.name,
                                    surname: emp.surname,
                                }))}
                                pageSizeOptions={[5, 10, 25]} 
                                pagination
                                onRowClick={(params) => handleEmployeeCardClick(params.row.id)}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEmployeesModal(false)} color="primary">
                            Zatvoriť
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Employee Card Dialog */}
                <EmployeeCardDialog
                    open={openCardDialog}
                    handleClose={() => setOpenCardDialog(false)}  userId={selectedEmployee?.id}  
                    user={selectedEmployee}                />

                {/* Goal Details Modal */}
                <Dialog open={openGoalDetailsDialog} onClose={handleCloseGoalDetailsDialog}>
                    <DialogTitle>Detail cieľa</DialogTitle>
                    <DialogContent>
                        <Typography variant="h6">Názov cieľa: {selectedGoal?.name}</Typography>
                        <Typography variant="body1">Kategória cieľa: {selectedGoal?.categoryDescription}</Typography>
                        <Typography variant="body1">Stav cieľa: {selectedGoal?.statusDescription}</Typography>
                        <Typography variant="body1">
                        Priradení zamestnanci:{" "}
                        {selectedGoal?.assignedEmployees && selectedGoal.assignedEmployees.length > 0
                        ? selectedGoal.assignedEmployees.map(emp => `${emp.name} ${emp.surname}`).join(', ')
                        : 'Žiadny zamestnanec'}
                        </Typography>
                        {selectedGoal?.fullfilmentRate && (
                            <Typography variant="body1">Miera splnenia: {selectedGoal.fullfilmentRate}%</Typography>
                        )}

                        {/* Conditionally display finishedDate */}
                        {selectedGoal?.finishedDate && (
                            <Typography variant="body1">Dátum dokončenia: {getDate(selectedGoal.finishedDate)}</Typography>
                        )}
                        <Typography variant="body1">Termín dokončenia: {getDate(selectedGoal?.dueDate)}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseGoalDetailsDialog} color="primary">
                            Zatvoriť
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Layout>
    );
};

export default ManageGoals;
