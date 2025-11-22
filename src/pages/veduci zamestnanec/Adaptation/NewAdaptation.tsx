import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../../components/Layout";
import { Box, Button, Typography, Tabs, Tab, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, IconButton, InputLabel, styled, TableRow, TableCell, Table, TableBody, TableHead, Tooltip, FormControl, FormHelperText, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { format, parseISO } from "date-fns";
import api from "../../../app/api";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from '../../../hooks/SnackBarContext';
import {useForm, SubmitHandler } from "react-hook-form";
import { EmployeeCard } from "../../../types/EmployeeCard";
import TaskModal from './TaskModal';
import DocumentModal from './DocumentModal';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { format as formatDate } from 'date-fns';


type Task = {
    id: string;
    description: string;
    finishDate: string;
    isDone: boolean;
  };
  
type Document = {
    id: string;
    description: string;
    file: File | null;
};


const schema = z.object({
    employeeId: z.preprocess(
        (val) => val ?? "", 
        z.string().min(1, "Musíte vybrať zamestnanca.")
      ),
    createdEmployeeId: z.string(), 
});

type FormData = z.infer<typeof schema>;


const NewAdaptation: React.FC = () => {
    const [creator, setCreator] = useState<EmployeeCard | null>(null); 
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeCard | null>(null); 
    const [error, setError] = useState<string | null>(null);
    const nav = useNavigate();  
    const [fieldsTask, setFieldsTask] = useState<{ text: string, date: Date, checked: boolean }[]>([]);
    const [fieldsDocs, setFieldsDocs] = useState<{ text: string, filePath: string }[]>([]);
    
    const [employeeOptions, setEmployeeOptions] = useState<EmployeeCard[]>([]);
    
    const { openSnackbar } = useSnackbar();
  
    const [openModal, setOpenModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showDocModal, setShowDocModal] = useState(false);

    const [activeTab, setActiveTab] = useState(0);
    const [editTaskIndex, setEditTaskIndex] = useState<number | null>(null);
    const [editDocIndex, setEditDocIndex] = useState<number | null>(null);
    const [loadedUsers,setLoadedUsers] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });


    useEffect(() => {
        api.get(`/EmployeeCard/GetEmployeesInTeam/`)
        .then((res) => {
            setEmployeeOptions(res.data); 
        }).finally(() => setLoadedUsers(true))
        
        api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
        .then((res) => {
            setCreator(res.data); 
        })

        .catch((err) => console.error(err));
        }, []);


    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const tasksData = fieldsTask.map(field => ({
            description: field.text,
            finishDate: formatDate(field.date, 'yyyy-MM-dd'),
            isDone: field.checked
        }));

        const documentsData = fieldsDocs.map(field => ({
            description: field.text,
            filePath: field.filePath
        }));

        const dataToSend = {
            ...data,
            tasks: tasksData,
            documents: documentsData
        };

        await api.post("/Adaptation/Create", dataToSend)
            .then((res) => {
                openSnackbar("Adaptacia bola úspešne vytvorena", "success");
                nav('/manageAdaptations');
            })
            .catch((err) => {
                setError(err.response.data.title);
                console.error("Error creating:", err);
            });
    };

    const handleDocUpload = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
    
        const res = await api.post("/adaptation/UploadAdaptationDoc", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    
        return res.data.filePath; 
    };
    

    useEffect(() => {
        console.log("form errors", errors);
    }, [errors]);


    const readyDate = useMemo(() => {
        if (!fieldsTask.length) return "-";
        const maxDate = Math.max(...fieldsTask.map(t => t.date.getTime()));
        return format(new Date(maxDate), "d.M.yyyy");
    }, [fieldsTask]);
    
    const completedDate = useMemo(() => {
        if (!fieldsTask.length) return "-";
        const allChecked = fieldsTask.every(t => t.checked);
        return allChecked ? format(new Date(), "d.M.yyyy") : "-";
    }, [fieldsTask]);

    
    const openEmployeeModal = () => {
        setOpenModal(true);
    };

    const CustomTabs = styled(Tabs)({
         
        minHeight: "auto",
        "& .MuiTabs-indicator": {
            backgroundColor: "#008080", 
            height: "3px",
        },
    });

    const CustomTab = styled(Tab)({
        borderBottom: "1px solid #e0e0e0",
        textTransform: "none", 
        minWidth: 0,
        minHeight: "auto",
        fontWeight: 500,
        fontSize: "16px",
        "&.Mui-selected": {
            color: "#000000", 
        },
        "&:not(.Mui-selected)": {
            color: "#555555", 
        },

    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleSelectEmployee = (employee: EmployeeCard) => {
        setSelectedEmployee(employee);
        setValue('employeeId', employee.employeeId ?? "" , { shouldValidate: true });
        setOpenModal(false);
    };

    const columnsUser: GridColDef<EmployeeCard>[] = [
        { field: "employeeId", headerName: "ID zamestnanca",
            headerClassName: "header", width: 150 },
        { field: "surname", headerName: "Meno zamestnanca",
            headerClassName: "header", width: 150, renderCell: (params: any) => (<span>{params.row.name} {params.row.surname}</span>)},
        {
            field: "actions",
            headerName: "Akcie",
            headerClassName: "header",
            width: 200,
            renderCell: (params: any ) => (
                <Button
                    variant="contained"
                    sx={{ backgroundColor: "turquoise", color: "black", fontSize: "12px", textWrap: "wrap" }}
                    disabled={selectedEmployee == params.row.employeeId }
                    onClick={() => {
                        handleSelectEmployee(params.row)
                        setValue('createdEmployeeId', creator?.employeeId ?? "")
                    }} >
                    Vybrať
                </Button>
        ),}          
    ];

    type DocumentItem = {
        text: string;
        filePath: string;
        file?: File;
      };

    const handleDownload = (doc: { filePath: string; text?: string }) => {
        const link = document.createElement('a');
        link.href = doc.filePath;
        link.download = doc.text || 'subor';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    
    return (
        <Layout>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ padding: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Vytvoriť novú adaptáciu
                    </Typography>

                    <Button variant="contained" color="primary" onClick={() => openEmployeeModal()} sx={{  marginTop:2 }}>
                        Pridať zamestnanca
                    </Button>

                    <Box sx={{ width: "100%"}}>    
                        <FormControl error={!!errors.employeeId} sx={{ mt: 1 }}>
                            <FormHelperText  sx={{ fontWeight: 'bold' }}>{errors.employeeId?.message}</FormHelperText>
                        </FormControl>
                    </Box>

                    <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                        <DialogTitle>
                            Pridať zamestnanca
                            <Box sx={{ height: 400, width: "100%", marginBottom: 3 }}>
                                <DataGrid
                                    loading={!loadedUsers}
                                    columns={columnsUser}
                                    rows={employeeOptions}
                                    initialState={{
                                    pagination: {
                                        paginationModel: {
                                            pageSize: 6,
                                        },
                                    },
                                    
                                    }}
                                    pageSizeOptions={[5, 10, 25]}
                                    pagination
                                    getRowId={(row) => row.employeeId}     

                                    />
                                    </Box>
                        </DialogTitle>
                        <DialogActions>
                            <Button variant="outlined" color="secondary" onClick={() => setOpenModal(false)}>
                                Zrušiť
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Box sx={{ marginTop: 2, paddingTop: 1, paddingBottom: 2 , width: "100%", fontStyle: "italic"}}>    

                        <Typography sx={{ marginTop: 1 }}>
                            Meno zamestnanca: {selectedEmployee ? `${selectedEmployee.name} ${selectedEmployee.surname}` : "-"}
                        </Typography>
                        <Typography sx={{ marginTop: 1 }}>
                            Zodpovedný zamestnanec: {creator ? `${creator.name} ${creator.surname}`: <CircularProgress size={10}></CircularProgress>}
                        </Typography>
                        <Typography sx={{ marginTop: 1 }}>Termín pripravenosti: {readyDate}</Typography>
                        <Typography sx={{ marginTop: 1 }}>Dátum dokončenia: {completedDate}</Typography>
                    </Box>

                  
                    {/* Tabs */}
                    <CustomTabs value={activeTab} onChange={handleTabChange} sx={{ marginBottom: 1 }}>
                        <CustomTab label="Zoznam úloh" />
                        <CustomTab label="Dokumenty" />
                    </CustomTabs>

                    {activeTab === 0 && (
                        <>
                            {/*  Zoznam pridanych uloh */}
                            <Table  size="small" sx={{ borderCollapse: "separate", borderSpacing: "0 4px" }}>
                                <TableHead>
                                    <TableRow sx={{ fontStyle: "italic"}}>
                                    <TableCell></TableCell>
                                    <TableCell>Názov úlohy</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>Termín splnenia úlohy</TableCell>
                                    <TableCell align="right">Akcie</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fieldsTask.length > 0 ? (
                                    fieldsTask.map((task, index) => (
                                        <TableRow key={index} sx={{ backgroundColor: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}>
                                        <TableCell sx={{borderLeft: ' 6px solid #EC6602'}}>
                                            <Checkbox
                                                checked={task.checked}
                                                onChange={(e) => {
                                                const updated = [...fieldsTask];
                                                updated[index].checked = e.target.checked;
                                                setFieldsTask(updated);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{task.text}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell>{format(task.date, "d.M.yyyy")}</TableCell>
                                        
                                        <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => {
                                                        setEditTaskIndex(index);
                                                        setShowTaskModal(true);
                                                    }}
                                                    sx={{ backgroundColor: '#BA4400', textTransform: 'none', '&:hover': { backgroundColor: '#A53D00', },}}
                                                > Editovať
                                                </Button>
                                                <Box sx={{ height: 24, width: '1px', alignSelf: 'center', backgroundColor: 'black',}}/>
                                                <Tooltip title="Odstrániť">
                                                    <IconButton color="error" onClick={() => {
                                                            const updated = [...fieldsTask];
                                                                updated.splice(index, 1);
                                                                setFieldsTask(updated);}}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Box>
                                        </TableCell>
                                        </TableRow>
                                    ))
                                    ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ fontStyle: "italic", color: "#999" }}>
                                        Žiadne úlohy
                                        </TableCell>
                                    </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => {
                                setEditTaskIndex(null);
                                setShowTaskModal(false);
                                setTimeout(() => setShowTaskModal(true), 0); 
                            }}>
                                + Pridať úlohu
                            </Button>

                            <TaskModal
                                open={showTaskModal}
                                initialData={editTaskIndex !== null ? {
                                description: fieldsTask[editTaskIndex].text,
                                finishDate: format(fieldsTask[editTaskIndex].date, 'yyyy-MM-dd'),
                                isDone: fieldsTask[editTaskIndex].checked
                                } : undefined}
                                onClose={() => {
                                    setShowTaskModal(false);
                                    setEditTaskIndex(null);
                                }}
                                onSave={(task) => {
                                const updated = [...fieldsTask];
                                const newTask = {
                                    text: task.description,
                                    date: new Date(task.finishDate),
                                    checked: task.isDone || false
                                };
                                if (editTaskIndex !== null) {
                                    updated[editTaskIndex] = newTask;
                                } else {
                                    updated.push(newTask);
                                }
                                setFieldsTask(updated);
                                setShowTaskModal(false);
                                }}
                            />
                        </>
                    )}

                    {activeTab === 1 && (
                        <>
                            {/* Pridane dokumenty */}
                            <Table size="small" sx={{ borderCollapse: "separate", borderSpacing: "0 6px", mt: 2 }}>
                                <TableHead>
                                    <TableRow sx={{ fontStyle: "italic"}}>
                                    <TableCell >Popis</TableCell>
                                    <TableCell align="right" >Akcie</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fieldsDocs.length > 0 ? (
                                    fieldsDocs.map((doc, index) => (
                                    <TableRow key={index} sx={{ backgroundColor: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}>
                                        <TableCell>{doc.text}</TableCell>
                                        <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Stack direction="row" spacing={1}>
                                                <Button 
                                                    variant="contained"
                                                    size="small"
                                                    color="info"
                                                    onClick={() => handleDownload(doc)}
                                                    sx={{ textTransform: 'none' }}
                                                > Stiahnuť
                                                </Button>
                                                <Box sx={{ height: 24, width: '1px', alignSelf: 'center', backgroundColor: 'black',}}/>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => {
                                                    setEditDocIndex(index);
                                                    setShowDocModal(true);
                                                    }}
                                                    sx={{
                                                    backgroundColor: '#BA4400',
                                                    textTransform: 'none',
                                                    '&:hover': { backgroundColor: '#A53D00' },
                                                    }}
                                                > Editovať
                                                </Button>
                                                <Box sx={{ height: 24, width: '1px', alignSelf: 'center', backgroundColor: 'black',}}/>
                                                <Tooltip title="Odstrániť">
                                                    <IconButton
                                                    color="error"
                                                    onClick={() => {
                                                        const updated = [...fieldsDocs];
                                                        updated.splice(index, 1);
                                                        setFieldsDocs(updated);
                                                    }}
                                                    >
                                                    <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>

                                            </Stack>
                                        </Box>
                                        </TableCell>
                                    </TableRow>
                                    ))
                                    ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ fontStyle: "italic", color: "#999" }}>
                                        Žiadne dokumenty
                                        </TableCell>
                                    </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => {
                                setEditDocIndex(null);
                                setShowDocModal(false);
                                setTimeout(() => setShowDocModal(true), 0); 
                            }}>
                                + Pridať dokument
                            </Button>

                            <DocumentModal
                                open={showDocModal}
                                initialData={editDocIndex !== null ? {
                                description: fieldsDocs[editDocIndex].text,
                                file: undefined // no re-upload for existing files
                                } : undefined}
                                onClose={() => {
                                    setShowDocModal(false);
                                    setEditDocIndex(null);
                                }}
                                onSave={async (doc) => {
                                    if (!doc.file) return;

                                    const uploadedFilePath = await handleDocUpload(doc.file);

                                    const newDoc = {
                                        text: doc.description,
                                        filePath: uploadedFilePath 
                                    };

                                    const updated = [...fieldsDocs];
                                    if (editDocIndex !== null) {
                                        updated[editDocIndex] = newDoc;
                                    } else {
                                        updated.push(newDoc);
                                    }
                                    setFieldsDocs(updated);
                                    setShowDocModal(false);
                                }}
                            />   
                        </>
                    )}
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 4, paddingRight: 3, paddingBottom: 3 }}>           
                    <Stack direction="row" gap={3} margin={3} >
                        <Button type="submit" variant="contained" color="info" >
                            Vytvoriť
                        </Button>
                        <Button type="button" variant="contained" color="secondary" onClick={() => nav('/manageAdaptations')}>
                            Zrušiť
                        </Button>
                    </Stack>
                </Box>  
            </form>
        </Layout>
    );
}

export default NewAdaptation;