import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Box, Button, Typography, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Stack, Tooltip, IconButton } from "@mui/material";
import { DataGrid,GridColDef } from "@mui/x-data-grid";
import JobPosition from "../../../types/JobPosition"; // Use JobPosition type
import api from "../../../app/api";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { dataGridStyles } from "../../../styles/gridStyle"; 
import useLoading from "../../../hooks/LoadingData";

const ManageJobPositions: React.FC = () => {
    const [jobRows, setJobRows] = useState<JobPosition[] | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [text, setText] = useState<string>("");
    const nav = useNavigate();
    
    useEffect(() => {
        api.get("/JobPosition/GetAll") // Adjust endpoint to fetch job positions
            .then((res) => {
                const rows: JobPosition[] = res.data;
                console.log(rows);
                setJobRows(rows);
            })
            .catch((err) => {
                setJobRows([]);
                console.error(err);
            });
    }, []);

    const handleOpenDialog = (job: JobPosition) => {
        setSelectedJob(job);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedJob(null);
    };
    const handleDelete = () => {
        if (selectedJob) {
            console.log(selectedJob);
            api.delete(`/JobPosition/Delete?id=${(selectedJob.id)}`)
                .then(() => {
                    setJobRows((prevRows) => {
                        if (!prevRows) return prevRows; // do nothing if rows are not loaded yet
                        return prevRows.filter((job) => job.id !== selectedJob.id);
                    });
                    setText("Položka vymazaná");
                    setOpenSnackbar(true); // Show success message
                })
                .catch((err) => console.error("Position was not deleted:", err))
                .finally(() => handleCloseDialog());
        }
    };
    const handleArchive = (job: JobPosition) => {
        if (job) {
            console.log(job);
            api.post(`/JobPosition/Archived?jobPostionID=${(job.id)}`)
                .then(() => {
                    setText("Položka archivovaná");
                    setOpenSnackbar(true); // Show success message
                })
                .catch((err) => console.error("Pozícia nebola archivovaná:", err))
                .finally(() => handleCloseDialog());
        }
    };
    const handleUnarchive = (job: JobPosition) => {
        if (job) {
            console.log(job);
            api.post(`/JobPosition/UnArchived?jobPostionID=${(job.id)}`)
                .then(() => {
                    setText("Položka odarchivovaná");
                    setOpenSnackbar(true); // Show success message
                })
                .catch((err) => console.error("Pozícia nebola odarchivovaná", err))
                .finally(() => handleCloseDialog());
        }
    };

    const columns: GridColDef[] = [
        { 
            field: "name", 
            headerClassName: 'header', 
            headerName: "Názov", 
            width: 200, 
            resizable: false },
        { 
            field: "code",
            headerClassName: 'header', 
            headerName: "Kód", 
            width: 150, 
            resizable: false },
        {
            field: "organizationsID",
            headerName: "Organizácia",
            headerClassName: 'header',
            width: 250,
            resizable: true,
            renderCell: (params) => {
                const organizations = params.row.organizations || [];
                return organizations.length > 0
                    ? organizations.map((x:any) => x.name).join(", ")
                    : "..."; 
            }
        },
        {
            field: "levels",
            headerName: "Level",
            headerClassName: 'header',
            width: 250,
            resizable: true,
            renderCell: (params) => {
                const levels = params.row.levels || [];
                return levels.length > 0
                    ? levels.map((x:any) => x.name).join(", ")
                    : "..."; 
            }
        },
        {   field: "created", 
            headerName: "Dátum pridania", 
            headerClassName: 'header',
            width: 150, 
            flex: 1,
            resizable: false, 
            valueGetter: (value, row) => {
                if (!row.created) return "Neplatný dátum";
                
                const createdDate = new Date(row.created);
                return createdDate.toLocaleDateString("sk-SK", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            },
        },
        {
            field: "actions",
            headerName: "Akcia",
            headerClassName: 'header',
            width: 150,
            resizable: false,
            renderCell: (params) => (
                <Stack direction="row" alignItems="flex-end" width="100%">
                    <Tooltip title="Archivovať" arrow>
                        <IconButton
                            aria-label="archive"
                            size="large"
                            onClick={() => handleArchive(params.row)}
                        >
                            <ArchiveIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Odarchivovať" arrow>
                        <IconButton
                            aria-label="unarchive"
                            size="large"
                            onClick={() => handleUnarchive(params.row)}
                        >
                            <UnarchiveIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Zmazať" arrow>
                        <IconButton
                            aria-label="delete"
                            size="large"
                            onClick={() => handleOpenDialog(params.row)} 
                            sx={{ color: 'red' }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        }
    ];

    const handleEdit = (params: any) => {
        if (params.field !== "actions") 
        {
            nav('/editWorkPosition', { state: { id: params.row.id } });
        }
    };


    return (
        <Layout>
            <Box sx={{ padding: 3, flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Správa pracovných pozícií
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginBottom: 2 }}
                    onClick={() => nav("/newWorkPosition")}
                >
                    Nová pracovná pozícia
                </Button>
                <Box sx={{ width: "100%" }}>
                    <DataGrid
                        loading= {jobRows === null}
                        columns={columns}
                        rows={jobRows ?? []} 
                        onCellClick={(params) => handleEdit(params)}
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
                    />
                </Box>
                {/* Delete Confirmation Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Potvrdenie vymazania</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Naozaj chcete vymazať pracovnú pozíciu? Táto udalosť je nenávratná
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
                    message={text}
                />
            </Box>
        </Layout>
    );
};

export default ManageJobPositions;
