import React, { useEffect, useRef, useState } from "react";
import Layout from "../../../components/Layout";
import {Autocomplete, Box, Stack, TextField, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Checkbox, LinearProgress } from "@mui/material";
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
import { DataGrid, GridColDef} from "@mui/x-data-grid";
import { useSnackbar } from '../../../hooks/SnackBarContext';
import { useAuth } from "../../../hooks/AuthProvider";
import UserProfile from "../../../types/UserProfile";
import EmployeeCardDialog from "../../spravca/Users/EmployeCardDialog";


type LeaveType = {
  id: string,
  description: string;
};

type ReadyStatus = {
    id: string,
    description: string;
  };

const schema = z.object({
    leavingId: z.string(),
    leaveReason: z.string().min(1, "Dôvod odchodu je povinný."), 
    leaveType: z.string(), 
    leaveDate: z.string(),
    successorId: z.string().nullable(),
    readyStatus: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const NewSuccession: React.FC = () => {
    const nav = useNavigate();
    const { openSnackbar } = useSnackbar();
    const [error, setError] = useState<string>();
    const [openModal, setOpenModal] = useState(false);
    const [openCardDialog, setOpenCardDialog] = useState(false);
    const [leaveReason, setLeaveReason] = useState<string[]>([]);
    const [leaveType, setLeaveType] = useState<string[]>([]);
    const [leaveDate, setLeaveDate] = useState<Dayjs | null>(dayjs());
    const [leaveTypesOptions, setleaveTypesOptions] = useState<{ id: string; label: string }[]>([]);
    const [leaveTypeVyber, setLeaveTypeVyber] = useState<string | null>(null);
    const [readyStatusesOptions, setReadyStatusesOptions] = useState<{ id: string; label: string }[]>([]);
    const [leavingEmployeeOptions, setLeavingEmployeeOptions] = useState<EmployeeCard[]>([]);
    const [successorOptions, setSuccessorOptions] = useState<EmployeeCard[]>([]);
    const [selectedEmployeeCard, setSelectedEmployeeCard] = useState<UserProfile | null>(null); 
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null); 
    const [selectedSuccessor, setSelectedSuccessor] = useState<string | null>(null); 
    const [modalType, setModalType] = useState<'leaving' | 'successor' | null>(null);
    const [fields, setFields] = useState<{ text: string, checked: boolean }[]>([]);
    const [isNotified, setIsNotified] = useState(false);

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
        api.get(`/Succession/GetLeaveTypes/`)
            .then((res) => {
                const options = res.data.map((leaveType:LeaveType) => ({
                    id: leaveType.id,
                    label: leaveType.description,
                }));
                setleaveTypesOptions(options);
            })
            .catch((err) => console.error(err));


            api.get(`/Succession/GetReadyStatuses/`)
            .then((res) => {
                const options = res.data.map((leaveType:ReadyStatus) => ({
                    id: leaveType.id,
                    label: leaveType.description,
                }));
                setReadyStatusesOptions(options);
                console.log("statuses", res.data);
            })
            .catch((err) => console.error(err));

            api.get(`/EmployeeCard/GetEmployeesInTeam/`)
            .then((res) => {
                setLeavingEmployeeOptions(res.data); 
                console.log("employeeCards", res.data); 
            })
            .catch((err) => console.error(err));

            api.get(`/EmployeeCard/GetEmployeesWithouSuperiors/`)
            .then((res) => {
                setSuccessorOptions(res.data); 
                console.log("successors:", res.data); 
            })
            .catch((err) => console.error(err));
            }, []);
    
    useEffect(() => {
        console.log("Aktualizovaný successor:", selectedSuccessor);
            }, [selectedSuccessor]);
            const setExternist = () => {
                setSelectedSuccessor(null); 
                setSelectedSuccessor('externist');
                setValue('successorId', null);
    };        

    const onSubmit: SubmitHandler<FormData> = async (data) => {

        const skillsData = fields.map(field => ({
            description: field.text,
            isReady: field.checked
        }));

        const dataToSend = {
            ...data,
            skills: skillsData,
            isNotified: isNotified,
        };
        console.log(" created data:", dataToSend);
        await api.post("/Succession/Create", dataToSend)
            .then((res) => {
                console.log(" created:", res.data);
                openSnackbar("Nástupníctvo bolo úspešne vytvorené", "success");
                nav('/manageSuccessions');
            })
            .catch((err) => {
                setError(err.response.data.title);
                console.error("Error creating:", err);
            });
    };

    const openEmployeeModal = (type: 'leaving' | 'successor') => {
        setModalType(type);
        setOpenModal(true);
    };
    
    const handleSelectEmployee = (employeeId: string) => {
        if (modalType === 'leaving') {
            setSelectedEmployee(employeeId);
            setValue('leavingId', employeeId ?? "");
        } else if (modalType === 'successor') {
            setSelectedSuccessor(employeeId);
            setValue('successorId', employeeId ?? "");
            console.log("successor:", selectedSuccessor)
        }
        setOpenModal(false);
    };
    
    const handleAddField = () => {
        setFields([...fields, { text: "", checked: false }]);
    };

    const handleTextChange = (index: number, value: string) => {
        const newFields = [...fields];
        newFields[index].text = value;
        setFields(newFields);
    };

    const handleCheckboxChange = (index: number, checked: boolean) => {
        const newFields = [...fields];
        newFields[index].checked = checked;
        setFields(newFields);
    };

    const handleEmployeeCardClick = async (employeeCardId: string) => {
            const response = await api.get(`/EmployeeCard/GetUserByEmployeeCard?employeeCardId=${employeeCardId}`);
            const userProfile: UserProfile = response.data; 
    
            setSelectedEmployeeCard(userProfile);
            //setSelectedEmployee(employee);
            setOpenCardDialog(true);
        };

    const completedTasks = fields.filter(field => field.checked).length;
    const totalTasks = fields.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const selectedEmployeeObj = leavingEmployeeOptions.find(emp => emp.employeeId === selectedEmployee);
    const selectedSuccessorObj = successorOptions.find(emp => emp.employeeId === selectedSuccessor);
    const rows = modalType === 'successor' ? successorOptions : leavingEmployeeOptions;


    const columnsUser: GridColDef<EmployeeCard>[] = [
            { field: "employeeId", headerName: "ID zamestnanca", width: 300},
            { field: "fullName", headerName: "Meno zamestnanca", width: 150},
            { field: "department", headerName: "Oddelenie", width: 150 },
            {
                        field: "actions",
                        headerName: "Akcie",
                        width: 200,
                        renderCell: (params: any ) => (
                            <Button
                                variant="contained"
                                color="info"
                                disabled={selectedEmployee == params.row.employeeId || selectedSuccessor == params.row.employeeId}
                                onClick={() => handleSelectEmployee(params.row.employeeId)} >
                                Vybrať
                            </Button>
                            
                        ),}          
        ];
   

        useEffect(() => {
            console.log("leaveTypeVyber updated:", leaveTypeVyber);
          }, [leaveTypeVyber]);

        const leaveTypeVyberRef = useRef(leaveTypeVyber);

        useEffect(() => {
        leaveTypeVyberRef.current = leaveTypeVyber;
        }, [leaveTypeVyber]);

        useEffect(() => {
            reset(undefined, { keepValues: true });
        }, [leaveTypeVyber, reset]);

        return (
            <Layout>
                <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ padding: 3, display: "flex", gap: 20 }} >               
                {/* ĽAVÁ STRANA */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom> Odstupujúci zamestnanec </Typography>

                    <Button variant="contained" color="primary" onClick={() => openEmployeeModal('leaving')} sx={{ float: "right", marginTop:2 }}>
                        Pridať zamestnanca
                    </Button>

                    <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                        <DialogTitle>
                            {modalType === 'leaving' ? 'Pridať odstupujúceho zamestnanca' : 'Pridať nastupujúceho zamestnanca'}
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Button color="primary" variant="outlined">
                                    Zoznam zamestnancov
                                </Button>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ height: 400, width: "100%", marginBottom: 3 }}>
                                <DataGrid
                                    columns={columnsUser}
                                    rows={rows}
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
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="secondary" onClick={() => setOpenModal(false)}>
                                Zrušiť
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Typography variant="body1"  gutterBottom sx={{ marginBottom: 3, marginTop: 2}} onClick={() => {
                        if (selectedEmployeeObj) {
                            handleEmployeeCardClick(selectedEmployeeObj.employeeId);
                        }
                    }}>
                        Pridaný zamestnanec: 
                        {leavingEmployeeOptions.find(emp => emp.employeeId === selectedEmployee) 
                            ? `${leavingEmployeeOptions.find(emp => emp.employeeId === selectedEmployee)?.name} ${leavingEmployeeOptions.find(emp => emp.employeeId === selectedEmployee)?.surname}`
                            : ""}
                    </Typography>

                    <Stack direction="column"  gap={2} sx={{ width: "70%"  }} component="form">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                            label="Termín odchodu zamestnanca *"
                            value={leaveDate}
                            {...register('leaveDate', { required: 'Termín je povinný.' })}                           
                            onChange={(newDate) => {
                                const formattedDate = dayjs(newDate).format('YYYY-MM-DD');
                                setValue('leaveDate', formattedDate);
                                setLeaveDate(newDate); 
                            }}
                            format="YYYY-MM-DD"
                            
                            //renderInput={(params) => <TextField {...params} fullWidth />}
                            />                                  
                        </LocalizationProvider>
                        <TextField label="Dôvod odchodu" required fullWidth {...register("leaveReason")} error={!!errors.leaveReason} helperText={errors.leaveReason?.message ?? ""}></TextField>
                        <Autocomplete
                            fullWidth
                            options={leaveTypesOptions}
                            onChange={(e, value) => {
                                const selectedId = value?.id ?? "";
                                const selectedLabel = value?.label ?? null;
                                
                                setValue("leaveType", selectedId);
                                setLeaveTypeVyber(selectedLabel);
                                console.log("sl:", leaveTypeVyber);

                                if (selectedLabel === "Redundancia tímu") {
                                    setSelectedSuccessor(null);
                                    setValue("successorId", null);
                                    setValue("readyStatus", "08dd6326-5eb2-43e8-811e-3387aa0ea870")
                                  }
                                }}
                                
                            renderInput={(params) => <TextField {...params} label="Typ odchodu" 
                            //error={!!errors.leaveType} helperText={errors.leaveType?.message ?? ""} required
                            />}
                        />
                        
                        {selectedEmployeeObj && (
                            <Box sx={{ marginTop: 2, paddingTop: 2, color: '#A5A7A9', opacity: 0.8 , width: "100%", borderTop: "1px solid #e0e0e0", }}>
                                    {leavingEmployeeOptions.find(emp => emp.employeeId === selectedEmployee) ? (
                                    <> 
                                    <Typography variant="body1">Súčasná pozícia: {selectedEmployeeObj.jobPosition}</Typography>
                                    <Typography variant="body1">Dátum odchodu: {leaveDate?.toString()}</Typography>
                                    <Typography variant="body1">Oddelenie: {selectedEmployeeObj.department}</Typography>
                                    <Typography variant="body1">Organizácia: {selectedEmployeeObj.organization}</Typography>
                                    <Typography variant="body1">Dôvod odchodu: {leaveReason}</Typography>
                                    <Typography variant="body1">Typ odchodu: {leaveType}</Typography>
                                    </>
                                ) : (
                                    <Typography variant="body1">Nie sú dostupné žiadne informácie.</Typography>
                                )}
                            </Box>
                        )}
                    </Stack>
                </Box>

                    {/* PRAVÁ STRANA */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", borderLeft: "2px solid #ddd", paddingLeft: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom > Nastupujúci zamestnanec </Typography>

                    <Stack direction="row" spacing={2} sx={{ display: "flex", flexDirection: "row", marginY: 2 }}>
                        <Button variant="contained" color="info" onClick={() => openEmployeeModal('successor')}>
                            Interný zamestnanec
                        </Button>
                        <Button variant="contained" color="info" onClick={() => setExternist()}>
                            Externý zamestnanec
                        </Button>
                    </Stack>                   

                    <Typography variant="body1"  gutterBottom sx={{ marginBottom: 2 }} onClick={() => {
                        if (selectedSuccessorObj) {
                            handleEmployeeCardClick(selectedSuccessorObj.employeeId);
                        }
                    }}>
                        Pridaný zamestnanec: 
                        {selectedSuccessor === 'externist' 
                            ? "Externý zamestnanec"
                            : successorOptions.find(emp => emp.employeeId === selectedSuccessor)
                            ? `${successorOptions.find(emp => emp.employeeId === selectedSuccessor)?.name} ${successorOptions.find(emp => emp.employeeId === selectedSuccessor)?.surname}`
                            : ""}
                    </Typography>

                    <Autocomplete
                        fullWidth
                        options={readyStatusesOptions}
                        onChange={(e, value) => {
                            setValue("readyStatus", value?.id ?? "");
                            console.log("Leave type from ref:", leaveTypeVyberRef.current);}}
                        renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Pripravenosť zamestnanca"
                              error={!!errors.readyStatus}
                              helperText={errors.readyStatus?.message ?? ""}
                              required={leaveTypeVyber !== "Redundancia tímu"} 
                            />
                          )}                          
                    />

                    {selectedSuccessor && selectedSuccessor !== 'externist' && (
                        <Box sx={{ marginTop: 2, paddingTop: 2, color: '#A5A7A9', opacity: 0.8 , width: "100%", borderTop: "1px solid #e0e0e0", }}>
                            {successorOptions.find(emp => emp.employeeId === selectedSuccessor) ? (
                                <>
                                <Typography variant="body1">Súčasná pozícia: {selectedSuccessorObj?.jobPosition}</Typography>
                                <Typography variant="body1">Dátum odchodu: {leaveDate?.toString()}</Typography>
                                <Typography variant="body1">Oddelenie: {selectedSuccessorObj?.department}</Typography>
                                <Typography variant="body1">Organizácia: {selectedSuccessorObj?.organization}</Typography>
                                <Typography variant="body1">Pripravenosť : {leaveReason}</Typography>
                                </>
                            ) : (
                                <Typography variant="body1">Nie sú dostupné žiadne informácie.</Typography>
                            )}
                        </Box>
                    )}  
                    {/* externista */}
                    {selectedSuccessor === 'externist' && (
                        <Box sx={{ marginTop: 2, padding: 2, backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                            <Typography variant="body2"><b>Súčasná pozícia:</b> N/A</Typography>
                            <Typography variant="body2"><b>Oddelenie:</b> N/A</Typography>
                            <Typography variant="body2"><b>Organizácia:</b> N/A</Typography>
                            <Typography variant="body2"><b>Pripravenosť :</b> {leaveReason}</Typography>
                        </Box>
                    )}  
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 4, marginTop: 4 }}>
                    {/* Left Column: TextFields */}
                    <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ marginBottom: 2 }}><b>Požadované zručnosti: :</b></Typography>
                        {fields.map((field, index) => (
                            <TextField
                                key={index}
                                label={`Zručnosť č. ${index + 1}`}
                                value={field.text}
                                onChange={(e) => handleTextChange(index, e.target.value)}
                                fullWidth
                                sx={{ marginBottom: 2 }}
                            />
                        ))}
                    </Box>

                    {/* Right Column: Checkboxes */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="body2" sx={{ marginBottom: 3.5 }}><b>Súčasné zručnosti: :</b></Typography>
                        {fields.map((field, index) => (
                            <FormControlLabel
                                key={index}
                                control={
                                    <Checkbox
                                        checked={field.checked}
                                        onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                                    />
                                }
                                label={field.checked ? "Spĺňa" : "Nespĺňa"}
                                sx={{ marginBottom: 3.75 }}
                            />
                        ))}
                    </Box>
                </Box>

                <Stack direction="row" spacing={2} sx={{ display: "flex", flexDirection: "row", marginY: 2 }}>
                    <Button
                        variant="contained"
                        color="info" onClick={handleAddField}
                    >
                        +
                    </Button>
                </Stack>

                {fields.length > 0 && (
                            <Box sx={{ width: "100%", marginTop: 3 }}>
                                <Typography variant="body1" sx={{ marginBottom: 1 }}>
                                    Zručnosti: {completedTasks}/{totalTasks} dokončené
                                </Typography>
                                <LinearProgress variant="determinate" value={progress} />
                            </Box>
                        )}
                    </Box>
                
                    
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: 4, paddingRight: 3, paddingBottom: 3 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isNotified}
                                onChange={(e) => setIsNotified(e.target.checked)}
                            />
                        }
                        label="Želám si notifikovať priradeného nástupcu po uložení zmien"
                        sx={{ marginRight: 3 }}
                    />
                <Stack direction="row" gap={3} >
                    <Button type="submit" variant="contained" color="info" >
                        Uložiť
                    </Button>
                    <Button type="button" variant="contained" color="secondary" onClick={() => nav('/manageSuccessions')}>
                        Zrušiť
                    </Button>
                </Stack>
            </Box>

                <EmployeeCardDialog
                    userId={selectedEmployeeCard?.id ?? null}
                    user={selectedEmployeeCard}
                    open={openCardDialog}
                    handleClose={() => setOpenCardDialog(false)}
                />
                </form>
            </Layout>
        );
    
};

export default NewSuccession;
