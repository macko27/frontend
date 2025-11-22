import React, { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../../components/Layout";
import { Box, Button, Typography, Tabs, Tab, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Checkbox, IconButton, InputLabel, styled, TableRow, TableCell, Table, TableBody, TableHead, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { format, parseISO } from "date-fns";
import dayjs from "dayjs";
import api from "../../app/api";
import { z } from "zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from '../../hooks/SnackBarContext';
import {useForm, SubmitHandler } from "react-hook-form";
import { EmployeeCard } from "../../types/EmployeeCard";
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
    employeeId: z.string(),
    createdEmployeeId: z.string(), 
});

type FormData = z.infer<typeof schema>;


const MyAdaptation: React.FC = () => {
    //const [employee, setEmployee] = useState<{ id: string; name: string } | null>(null);
    const [id, setId] = useState<string | null>(null); 

    const [creator, setCreator] = useState<EmployeeCard | null>(null); 
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeCard | null>(null); 

    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState<string>();
    const nav = useNavigate();  
    const [fieldsTask, setFieldsTask] = useState<{ text: string, date: Date, checked: boolean }[]>([]);
    const [fieldsDocs, setFieldsDocs] = useState<{ text: string, filePath: string }[]>([]);
    
    const { openSnackbar } = useSnackbar();

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showDocModal, setShowDocModal] = useState(false);

    const [activeTab, setActiveTab] = useState(0);
    const [editTaskIndex, setEditTaskIndex] = useState<number | null>(null);
    const [editDocIndex, setEditDocIndex] = useState<number | null>(null);

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
        
        api.get(`/Adaptation/GetMyAdaptation`)
        .then((res) => {
            const data = res.data;
            setSelectedEmployee(data.employee); 
            setCreator(data.creator);

            setId(data.id)

            setValue("employeeId", data.employeeId);
            setValue("createdEmployeeId", data.createdEmployeeId)

            const loadedTasks = data.tasks.map((t: Task) => ({
                text: t.description,
                date: new Date(t.finishDate),
                checked: t.isDone
            }));
            const loadedDocs = data.documents.map((d: Document) => ({
                text: d.description,
                filePath: d.file
            }));

            setFieldsTask(loadedTasks);
            setFieldsDocs(loadedDocs);
            setValue('employeeId', data.employee.employeeId);
            setValue('createdEmployeeId', data.creator.employeeId);
            
        }).catch((err) => {
            console.error("Failed to load adaptation:", err);
            setError("Nepodarilo sa načítať údaje.");
        });
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

        await api.put(`/Adaptation/Update/${id}`, dataToSend)
            .then((res) => {
                openSnackbar("Adaptacia bola úspešne vytvorena", "success");
                nav('/manageAdaptations');
            })
            .catch((err) => {
                openSnackbar("Nastala chyba s vytváraním adaptácie", "error");
                //setError(err.response.data.title);
                console.error("Error creating:", err);
            });
    };

    const saveTaskUpdate = async (updatedTasks: typeof fieldsTask) => {
        const data = {
            employeeId: selectedEmployee?.employeeId || "",
            createdEmployeeId: creator?.employeeId || "",
            tasks: updatedTasks.map(task => ({
                description: task.text,
                finishDate: formatDate(task.date, 'yyyy-MM-dd'),
                isDone: task.checked
            })),
            documents: fieldsDocs.map(field => ({
                description: field.text,
                filePath: field.filePath
            }))
        };
    
        try {
            await api.put(`/Adaptation/Update/${id}`, data);
        } catch (err) {
            console.error("Auto-save error:", err);
            openSnackbar("Chyba pri ukladaní zmien", "error");
        }
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
                        Moja adaptácia
                    </Typography>

                    <Box sx={{ marginTop: 2, paddingTop: 1, paddingBottom: 2 , width: "100%", fontStyle: "italic"}}>
                        <Typography sx={{ marginTop: 1 }}>
                            Meno zamestnanca: {selectedEmployee ? `${selectedEmployee.name} ${selectedEmployee.surname}` : "-"}
                        </Typography>
                        <Typography sx={{ marginTop: 1 }}>
                            Zodpovedný zamestnanec: {creator ? `${creator.name} ${creator.surname}`: "-"}
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
                                    <TableCell align="right">Termín splnenia úlohy</TableCell>
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
                                                    saveTaskUpdate(updated);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{task.text}</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell align="right">{format(task.date, "d.M.yyyy")}</TableCell>
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
                        </>
                    )}
                </Box>
            </form>
        </Layout>
    );
}

export default MyAdaptation;