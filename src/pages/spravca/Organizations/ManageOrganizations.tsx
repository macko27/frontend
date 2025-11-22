import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Box, Stack, Snackbar, Alert, Button, Tooltip, IconButton, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Organization from "../../../types/Organization";
import api from "../../../app/api";
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import moment from "moment";
import LoadingButton from '@mui/lab/LoadingButton';
import { dataGridStyles } from "../../../styles/gridStyle"; 
import { useSnackbar } from '../../../hooks/SnackBarContext'; 
import useLoading from "../../../hooks/LoadingData";

const ManageOrganizations: React.FC = () => {
    const [organizationRows, setOrganizationRows] = useState<Organization[]>([]);
    const [organizations, setOrganizations] = useState<Organization[] | null>(null);
    const nav = useNavigate();
    const [refresh, setRefresh] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { openSnackbar } = useSnackbar();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        api.get("/Organization/Organizations")
            .then((res) => {
                const rows: Organization[] = res.data;
                setOrganizationRows(rows);
                setOrganizations(rows);
            })
            .catch((err) => {
                setOrganizationRows([]);
                console.log(err.id);
                console.error(err);
            }).finally(() =>
                setLoaded(true));
    }, [refresh]);

    const handleRowDoubleClick = (params: any) => {
        const id = params.row.id;
        console.log("Double-clicked location ID:", id); // Skontrolujte, či sa správne získava ID
        if (!id) {
            console.warn("No ID found for this row:", params.row); // Log row data to confirm structure
            return;
        }
        if (id) {
            nav('/updateOrganization', { state: { id } });    // Presmerovanie na stránku úpravy s ID
        }
    };

    const handleDeleteConfirm = (id : string) => {
        setSelectedId(id);
        setOpenConfirm(true);
    };

    const handleDelete = async () => {
    if (!selectedId) {
        console.log("selected id is null");
        return;
    }
    setLoading(true);
    api.post("/Organization/Delete", selectedId)
        .then((res) => {
            setRefresh((prev) => !prev);
            setOpenConfirm(false);
            setErrorMessage(null); 
            openSnackbar("Organizácia bola úspešne zmazaná.", "success");
        })
        .catch((err) => {
            console.error("Error deleting organization:", err);
            openSnackbar("Nastala chyba pri mazaní organizácie.", "error");
        })
        .finally(() => {
            setLoading(false);
        });
};

    const archiveOrganization = async (id: string, archive : boolean) => {
        await api.put("/Organization/Archive", {
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

    const columns: GridColDef[] = [
        {
            field: "name",
            headerName: "Názov",
            headerClassName: 'header',
            width: 250,
            resizable: false,
        },
        {
            field: "code",
            headerName: "Kód",
            headerClassName: 'header',
            width: 250,
            resizable: false,
        },
        {
            field: "createDate",
            headerName: "Dátum vytvorenia",
            headerClassName: 'header',
            width: 300,
            flex: 1,
            resizable: false,
            valueGetter: (value, row) => row.created ? moment(row.created).format('DD.MM.YYYY HH:mm') : "Neplatný dátum",
        },
        {
            field: "actions",
            headerName: "Akcie",
            headerClassName: 'header',
            width: 150,
            resizable: false,
            sortable: false,
            editable: false,
            disableColumnMenu: true,
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
                            onClick={() => handleDeleteConfirm(params.row.id)} 
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
            <Box sx={{ padding: 3,  flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Správa organizácií
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginBottom: 2 }}
                    onClick={() => {
                        nav("/newOrganization");
                    }}
                >
                    Pridať novu organizáciu
                </Button>

                <Box sx={{ width: "100%" }}>
                <DataGrid
                    columns={columns}
                    loading={!loaded}
                    rows={organizationRows}
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
                        },
                        
                       
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    pagination
                    onRowDoubleClick={handleRowDoubleClick}
                    getRowId={(row) => row.id}
                />
                    <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                        <DialogTitle>Potvrdenie zmazania</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Ste si istý, že chcete zmazať túto organizáciu?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpenConfirm(false)} color="primary">
                                Zrušiť
                            </Button>
                            <LoadingButton
                                onClick={handleDelete}
                                color="error"
                                loading={loading}
                                loadingPosition="start" 
                            >
                                Zmazať
                            </LoadingButton>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>
        </Layout>
    );
}

export default ManageOrganizations