import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
    Typography,
    Snackbar,
    Stack,
} from "@mui/material";
import UserProfile from "../../../types/UserProfile";
import api from "../../../app/api";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import EmployeeCardDialog from "./EmployeCardDialog";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridStyles } from "../../../styles/gridStyle";
import { useSnackbar } from "../../../hooks/SnackBarContext";
import useLoading from "../../../hooks/LoadingData";

const ManageUsers: React.FC = () => {
    const [userRows, setUserRows] = useState<UserProfile[] | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    //const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openCardDialog, setOpenCardDialog] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const nav = useNavigate();
    const { openSnackbar } = useSnackbar();

    useEffect(() => {
        api.get<UserProfile[]>("/User/Users")
            .then((userRes) => {
                const users = userRes.data;
    
                api.get("/EmployeeCard/GetAll/")
                    .then((employeeCardRes) => {
                        const employeeCards = employeeCardRes.data;
                        console.log(employeeCards);
                        console.log(users);
    
                        const updatedRows = users.map((user) => {
                            const matchingCard = employeeCards.find((card: any) => {
                                return String(card.user.id).trim() === String(user.id).trim();
                            });
                            return {
                                ...user,
                                deactivated: matchingCard ? matchingCard.archived : false,
                            };
                        });
    
                        setUserRows(updatedRows);
                        console.log(updatedRows);
                    })
                    .catch((error) => {
                        console.error("Error fetching employee cards:", error);
                        setUserRows([]);
                    });
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
                setUserRows([]);
            });
    }, []);

    const handleCardOpen = (user: UserProfile) => {
        console.log("Selected User: ", user);
        setSelectedUser(user);
        setOpenCardDialog(true);
    };

    const handleOpenDialog = (user: UserProfile) => {
        console.log(user);
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
    };

    const handleDeactivate = (user: UserProfile) => {
        if (!user.deactivated) {
            openSnackbar("Deaktivujem kartu.", "success");
        } else {
            openSnackbar("Aktivujem kartu.", "success");
        }
        api.post(`/EmployeeCard/Deactivate/${user.id}`)
            .then(() => {
                setUserRows((prev) => {
                    if (!prev) return prev;
                    return prev.map((row) =>
                        row.id === user.id ? { ...row, deactivated: !user.deactivated } : row
                    );
                });

                const result = user.deactivated ? "Karta aktivovaná" : "Karta deaktivovaná";
                openSnackbar(result, "success");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleDelete = () => {
        if (selectedUser) {
            api.delete(`/User/Delete?email=${encodeURIComponent(selectedUser.email)}`)
            .then(() => {
                setUserRows((prev) => prev?.filter((user) => user.email !== selectedUser.email) ?? []);
                openSnackbar("Profil úspešne zmazaný", "success");
            })
                .catch((err) => console.error("Používateľ sa nevymazal:", err))
                .finally(() => handleCloseDialog()); // Close dialog
        }
    };

    const columns: GridColDef<UserProfile>[] = [
        { field: "email", headerName: "Používateľské meno", 
            headerClassName: 'header', width: 200 },
        { field: "firstName", headerName: "Meno",
            headerClassName: 'header', width: 150 },
        { field: "lastName", headerName: "Priezvisko",
            headerClassName: 'header', width: 150 },
        { field: "role", headerName: "Rola používateľa",
            headerClassName: 'header', width: 150 },
        { field: "", headerName: "",
            headerClassName: 'header', flex: 1 },
        {
            field: "actions",
            headerName: "Akcie",
            headerClassName: 'header',
            width: 300,
            renderCell: (params) => (
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: "orange", color: "black", fontSize: "12px", textWrap: "wrap" }}
                        onClick={() => handleCardOpen(params.row)}
                    >
                        Zamestnanecka karta
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: "lightgray",
                            color: "black",
                            fontSize: "12px",
                            textWrap: "wrap",
                        }}
                        onClick={() => handleDeactivate(params.row)}
                    >
                        {params.row.deactivated ? "Aktivovať" : "Deaktivovať"}
                    </Button>
                    <IconButton
                        aria-label="delete"
                        size="large"
                        onClick={() => handleOpenDialog(params.row)}
                        sx={{ color: "red" }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            ),
        },
    ];

    const handleEdit = (params: any) => {
        if (params.field !== "actions") {
            nav('/changeUser' , { state: {id: params.row.email} });
        }
    };

    return (
        <Layout>
            <Box sx={{ padding: 3, flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Správa používateľov
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginBottom: 2 }}
                    onClick={() => nav("/registerUser")}
                >
                    Pridať nového používateľa
                </Button>
                <Box sx={{ width: "100%" }}>
                    <DataGrid
                        loading={userRows === null}
                        columns={columns}
                        rows={userRows ?? []}
                        onRowDoubleClick={(params) => handleEdit(params)}
                        isRowSelectable={(params) => params.id === "name"} // Allow only the first column to be selectable
                        getRowClassName={(params) => (params.row.deactivated ? "archived-row" : "")}
                        sx={dataGridStyles}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        pagination
                        getRowId={(row) => row.id}
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

                {/* Employee Card Dialog */}
                <EmployeeCardDialog
                    userId={selectedUser?.id ?? null}
                    user={selectedUser}
                    open={openCardDialog}
                    handleClose={() => setOpenCardDialog(false)}
                />
            </Box>
        </Layout>
    );
};

export default ManageUsers;
