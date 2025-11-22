import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar, Stack, Tooltip, Typography } from "@mui/material";
import Layout from "../../../components/Layout";
import { useNavigate} from "react-router-dom";
import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import api from "../../../app/api";
import { Department } from "../../../types/Department";
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DeleteDialog from "../../../components/DeleteDialog";
import { dataGridStyles } from "../../../styles/gridStyle"; 
import useLoading from "../../../hooks/LoadingData";
import { useSnackbar } from "../../../hooks/SnackBarContext";

const ManageDivisions: React.FC = () => {
    const [departmentRows, setDepartmentRows] = useState<Department[]>([]);
    const [loaded,setLoaded] = useState<boolean>(false);
    const nav = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSnackbarOpen, setSnackbarOpen] = useState(false);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
    const [refresh, setRefresh] = useState(false);
    const { openSnackbar } = useSnackbar();

    useEffect(() => {
        api.get("/Department/Departments")
            .then((res) => {
                const rows: Department[] = res.data;
                console.log("Response: ", res.data);
                setDepartmentRows(rows);
            })
            .catch((err) => {
                setDepartmentRows([]);
                console.error(err);
            }).finally(() =>
                setLoaded(true));
    }, [refresh]);

    const archiveOrganization = async (id: string, archive : boolean) => {
        await api.put("/Department/Archive", {
            Id : id,
            Archive : archive 
        })
        .then((res) => {
            setRefresh((prev) => !prev);
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        })
    };

    const handleEdit = (params: any) => {
        const departmentId = params.row.id;
        setSelectedDepartmentId(departmentId);
        nav('/editDivision', { state: { departmentId } });
    };

    const handleDeleteClick = (id: string) => {
        setSelectedDepartmentId(id);      
        setDialogOpen(true);
    }

    

    const confirmDelete = async () => {
        if (selectedDepartmentId) {
            try {
                await api.delete(`/Department/Delete`, {
                    params: {
                        selectedDepartmentId,
                    },
                });
                setDepartmentRows((prevRows) =>
                    prevRows.filter((department) => department.id !== selectedDepartmentId)
                );
                openSnackbar("Oddelnie bola úspešne zmazané.", "success");
            } catch (err: any) {
                if (err.response && err.response.status === 400) {
                    //setErrorMessage(err.response.data.message);
                    openSnackbar("Nastala chyba pri mazaní oddelenia.", "error");
                } else {
                    console.error("Error deleting department:", err);
                }
            } finally {
                setDialogOpen(false);
                setSelectedDepartmentId(null);
            }
        }
    };

    const getDate = (date: any) => {
        if (!date) return "-";

        const createdDate = new Date(date);
        return createdDate.toLocaleDateString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Názov oddelenia",
            headerClassName: 'header',
            width: 200,
            resizable: false,
        },
        {
            field: "code",
            headerName: "Kód oddelenia",
            headerClassName: 'header',
            width: 250,
            resizable: false,
        },
        {
            field: "organizationName",
            headerName: "Príslušná organizácia",
            headerClassName: 'header',
            width: 250,
            resizable: false,
        },
        {
            field: "created",
            headerName: "Dátum vytvorenia oddelenia",
            headerClassName: 'header',
            width: 250,
            flex: 1,
            resizable: false,
            renderCell: (params) => (
                <Typography variant="body2">
                    {getDate(params.row.created)}
                </Typography>
            ),
        },
        {
            field: "actions",
            headerName: "Akcie",
            headerClassName: 'header',
            width: 200,
            resizable: false,
            renderCell: (params) => (
                
                <Stack direction="row" alignItems="flex-end" width="100%">
                    <Tooltip title="Archivovať" arrow>
                        <IconButton
                            aria-label="archive"
                            size="large"
                            onClick={() => archiveOrganization(params.row.id, true)}
                        >
                            <ArchiveIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Odarchivovať" arrow>
                        <IconButton
                            aria-label="unarchive"
                            size="large"
                            onClick={() => archiveOrganization(params.row.id, false)}
                        >
                            <UnarchiveIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Zmazať" arrow>
                        <IconButton
                            aria-label="delete"
                            size="large"
                            onClick={() => {console.log("Archive action for:", params.row.id);
                                handleDeleteClick(params.row.id);} }
                            sx={{ color: 'red' }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        }
    ];

    return (
        <Layout>
            <Box sx={{ padding: 3, flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Správa oddelení
                </Typography>
                <Button variant="contained" color="primary"
                    sx={{ marginBottom: 2 }} onClick={() => { nav("/newDivision");}}
                >
                    Pridať nové oddelenie
                </Button>

                <Box sx={{ width: "100%" }}>
                    <DataGrid
                        loading={!loaded}
                        columns={columns}
                        rows={departmentRows}
                        isRowSelectable={(params) => params.id === "name"} // Allow only the first column to be selectable
                        getRowClassName={(params) => 
                            params.row.archived ? 'archived-row' : ''
                        }
                        sx={dataGridStyles}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            }
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        pagination
                        onRowDoubleClick={handleEdit}
                    />
                    <DeleteDialog
                        open={isDialogOpen}
                        onClose={() => setDialogOpen(false)}
                        onConfirm={confirmDelete}
                    />

                    <Snackbar
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
                    </Snackbar>
                </Box>
            </Box>
        </Layout>
    );
};

export default ManageDivisions;