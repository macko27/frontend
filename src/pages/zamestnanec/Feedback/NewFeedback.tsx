import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    Stack,
    Tooltip,
    IconButton,
    TextField,
    Modal,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import { Label } from "@mui/icons-material";
import Layout from "../../../components/Layout";
import UserProfile from "../../../types/UserProfile";
import EmployeeCardDialog from "../../spravca/Users/EmployeCardDialog";
import { EmployeeCard } from "../../../types/EmployeeCard";
import api from "../../../app/api";
import { useAuth } from "../../../hooks/AuthProvider";
import { useProfile } from "../../../hooks/ProfileProvider";
import { useSnackbar } from "../../../hooks/SnackBarContext";

const NewFeedback: React.FC = () => {
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeCard[]>([]);
    const [question, setQuestion] = useState<string>("");
    const [questions, setQuestions] = useState<string[]>([]);
    const [notification, setNotification] = useState(false);
    const [showInput, setShowInput] = useState(false); // State to control visibility of the input field
    const [openCardDialog, setOpenCardDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null); // For showing employee card dialog
    const [openEmployeesModal, setOpenEmployeesModal] = useState(false);
    const [employeeIds, setEmployeeIds] = useState<string[]>([]);
    const [employeeData, setEmployeeData] = useState<EmployeeCard[]>([]);
    const nav = useNavigate();
    const { userProfile, setUserProfile, setRefresh, refresh } = useAuth();
    const {openSnackbar} = useSnackbar();

    const columnsUser: GridColDef[] = [
        { field: "name", headerName: "Meno", width: 150 },
        { field: "surname", headerName: "Priezvisko", width: 150 },
        {
            field: "actions",
            headerName: "Akcie",
            width: 200,
            renderCell: (params: { row: any }) => (
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "turquoise",
                            color: "black",
                            fontSize: "12px",
                            textWrap: "wrap",
                        }}
                        disabled={employeeIds.includes(params.row.employeeId)}
                        onClick={() => handleAddEmployee(params.row)}
                    >
                        Pridať
                    </Button>

                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "orange", color: "black", fontSize: "12px", textWrap: "wrap" }}
                        disabled={!employeeIds.includes(params.row.employeeId)}
                        onClick={() => handleRemoveEmployee(params.row)}
                    >
                        Odobrať
                    </Button>
                </Stack>
            ),
        },
    ];
    const columnsSelectedUser: GridColDef[] = [
        { field: "name", headerName: "Meno", width: 150 },
        { field: "surname", headerName: "Priezvisko", width: 150 },
        {
            field: "actions",
            headerName: "Akcie",
            width: 100,
            renderCell: (params: { row: any }) => (
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "orange", color: "black", fontSize: "12px", textWrap: "wrap" }}
                        disabled={!employeeIds.includes(params.row.employeeId)}
                        onClick={() => handleRemoveEmployee(params.row)}
                    >
                        Odobrať
                    </Button>
                </Stack>
            ),
        },
    ];

    useEffect(() => {
        api.get("/EmployeeCard/GetAllEmployees")
            .then((res) => {
                setEmployeeData(res.data);
                console.log("employeeCards", res.data);
            })
            .catch((err) => console.error("Error fetching employee cards:", err));
    }, []);
    const handleAddEmployee = (employee: EmployeeCard) => {
        setEmployeeIds((prev) => [...prev, employee.employeeId]);
        setSelectedEmployees((prev) => [...prev, employee]);
    };

    const handleRemoveEmployee = (employee: EmployeeCard) => {
        setEmployeeIds((prev) => prev.filter((id) => id !== employee.employeeId));
        setSelectedEmployees((prev) => prev.filter((id) => id !== employee));
    };

    const handleEmployeeCardClick = async (params: any) => {
        return; //TODO dorobiť zobrazenie zamestnaneckej karty
        if (params.field !== "actions") {
            const employeeCardId = params.row.employeeId;
            const response = await api.get(
                `/EmployeeCard/GetUserByEmployeeCard?employeeCardId=${employeeCardId}`
            );
            const userProfile: UserProfile = response.data;

            setSelectedEmployee(userProfile);
            //setSelectedEmployee(employee);
            setOpenCardDialog(true); // Show employee card dialog
        }
    };

    const handleAddQuestion = () => {
        if (question) {
            setQuestions([...questions, question]);
            setQuestion("");
            setShowInput(false);
        }
    };

    const handleDeleteQuestion = (index: Number) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSubmit = () => {
        if (questions.length > 0) {
            // Prepare the data to send
            const feedbackData = {
                employees: employeeIds,
                questions: questions,
                sender: userProfile?.id,
            };
            console.log(feedbackData);
            api.post("/Feedback/CreateFeedback", feedbackData)
                .then((res) => {
                    console.log("Feedback created successfully:", res.data);
                    // Handle success response if necessary
                })
                .catch((err) => {
                    console.error("Error creating feedback:", err);
                });
            console.log("Otazky");
            console.log(questions);
            console.log("Zamestnanci");
            console.log(selectedEmployees);
            // Logic to send feedback request
            //setNotification(true);
            openSnackbar("Požiadavka spätnej väzby bola vytvorená!", "success");
            // Reset form
            setEmployeeIds([]);
            setSelectedEmployees([]);
            setQuestions([]);
        }
    };

    /*const handleCloseNotification = () => {
        setNotification(false);
    };*/

    return (
        <Layout>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Vytvoriť požiadavku spätnej väzby
            </Typography>
            <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
                <Button onClick={() => setOpenEmployeesModal(true)} variant="contained" color="primary">
                    Pridať zamestnanca
                </Button>
            </Stack>
            {/* Render DataGrid only if selectedEmployees is not empty */}
            {selectedEmployees.length > 0 && (
                <Box sx={{ height: 400, width: "100%", marginTop: 2 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Priradený zamestnanci
                    </Typography>
                    <DataGrid
                        rows={selectedEmployees}
                        columns={columnsSelectedUser}
                        getRowId={(row) => row.employeeId}
                    />
                </Box>
            )}
            {showInput ? (
                <TextField
                    label={"Otázka"}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    fullWidth={true}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            handleAddQuestion();
                        }
                    }}
                />
            ) : (
                <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
                    <Button onClick={() => setShowInput(true)} variant="contained" color="primary">
                        Pridať otázku
                    </Button>
                </Stack>
            )}
            <List>
                {questions.map((q, index) => (
                    <ListItem key={index}>
                        <Stack direction="row" justifyContent="space-between" width="100%">
                            <Stack direction="column" spacing={0} sx={{ padding: 0 }}>
                                <ListItemText primary={"Otázka č." + (index + 1)} />
                                <ListItemText primary={q} />
                            </Stack>
                            <IconButton onClick={() => handleDeleteQuestion(index)}>
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                    </ListItem>
                ))}
            </List>
            <Stack direction="row" justifyContent="right" width="100%">
                <Button
                    onClick={handleSubmit}
                    disabled={questions.length === 0 || selectedEmployees.length === 0}
                    color="primary"
                    variant="contained"
                >
                    Odoslať
                </Button>
                <Button onClick={() => nav(-1)}>Zrušiť</Button>
            </Stack>
            {/* Modálne okno na zobrazenie zamestnancov */}
            <Dialog
                open={openEmployeesModal}
                onClose={() => setOpenEmployeesModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Priradení zamestnanci</DialogTitle>
                <DialogContent>
                    <Box sx={{ height: 300 }}>
                        <DataGrid
                            columns={columnsUser}
                            rows={employeeData}
                            initialState={{
                                pagination: {
                                    paginationModel: {
                                        pageSize: 10,
                                    },
                                }
                            }}
                            pageSizeOptions={[5, 10, 25]}
                            pagination
                            getRowId={(row) => row.employeeId}
                            //onRowClick={(params) => handleEmployeeCardClick(params.row.employeeId)}
                            onCellClick={(params) => handleEmployeeCardClick(params)}
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
                handleClose={() => setOpenCardDialog(false)}
                userId={selectedEmployee?.id}
                user={selectedEmployee}
            />
        </Layout>
    );
};

export default NewFeedback;
