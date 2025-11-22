import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Select,
    MenuItem,
    Typography,
    Autocomplete,
    Stack
} from "@mui/material";
import LocationResponse from "../../../types/responses/LocationResponse";
import api from "../../../app/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSnackbar } from "../../../hooks/SnackBarContext";
import { LocalizationProvider,  DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { Department } from "../../../types/Department";
import JobPosition from "../../../types/JobPosition";
import ContractType from "../../../types/ContractType";
import LoadingButton from '@mui/lab/LoadingButton';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import UserProfile from "../../../types/UserProfile";
import { EmployeeCard } from "../../../types/EmployeeCard";
import useLoadingModal from "../../../hooks/LoadingDataModal";
import Snackbar, { SnackbarOrigin } from '@mui/material/Snackbar';
import Level from "../../../types/Level";
import {CircularProgress} from "@mui/material";
import { Height } from "@mui/icons-material";
interface EmployeeCardDialogProps {
    userId: string | null | undefined; 
    user: UserProfile | null;
    open: boolean;
    handleClose: () => void;
}

const EmployeeCardDialog: React.FC<EmployeeCardDialogProps> = ({userId, user, open, handleClose }) => {
    const [locationOptions, setLocationOptions] = useState<{ id: string; label: string }[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{ id: string; label: string } | null>(null);

    const [departmentOptions, setDepartmentOptions] = useState<{ id: string; label: string }[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<{ id: string; label: string } | null>(null);

    const [JobPositionOptions, setJobPositionOptions] = useState<{ id: string; label: string }[]>([]);
    const [selectedJobPosition, setSelectedJobPosition] = useState<{ id: string; label: string } | null>(null);
    
    const [levelOptions, setLevelOptions] = useState<{ id: string; label: string, jobId: string }[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<{ id: string; label: string, jobId: string } | null>(null);

    const [filteredLevelOptions, setFilteredLevelOptions] = useState<{ id: string; label: string; jobId: string }[]>([]);

    
    const [contractTypeOptions, setConstractTypeOptions] = useState<{ id: string; label: string }[]>([]);
    const [selectedConstractType, setSelectedConstractType] = useState<{ id: string; label: string } | null>(null);

    const [loading, setLoading] = useState(true);
    const [birth, setBirth] = useState<Dayjs | null>();
    const [startWorkDate, setStartWorkDate] = useState<Dayjs | null>(null);
    const [level, setLevel] = useState<String | null>();
    const [workTime, setWorkTime] = useState<number>(0);
    const [employee, setEmployee] = useState<EmployeeCard|null>();
    const { openSnackbar } = useSnackbar();

    // Schema with Dayjs handling
    const schema = z.object({
        id: z.string(),
        birth: z.string().min(1, { message: "Datum je povinný"}),
        location: z.string().min(1, { message: "Lokalizácia je povinná" }),
        department: z.string().min(1, { message: "Oddelenie je povinné" }),
        jobPosition: z.string().min(1, { message: "Pracovná pozícia je povinná" }),
        contractType: z.string().min(1, { message: "Typ zmluvy je povinný" }),
        level: z.string().min(1, {message: "Pracovný úvätok je povinný"}),
        userId: z.string(),
        workTime: z.number(),
        startWorkDate: z.string().min(1, { message: "Dátum nástupu je povinný" }),
    });

    const updateFilteredLevels = (searchTerm: string) => {
        // Filter levelOptions based on the searchTerm
        const filtered = levelOptions.filter((level) => 
            level.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Update filteredLevelOptions with the filtered result
        setFilteredLevelOptions(filtered);
    };

    useEffect(() => {
        console.log("changing levels");
        console.log(selectedJobPosition);
    
        const filteredLevels = levelOptions.filter(level => level.jobId === selectedJobPosition?.id);
    
        setFilteredLevelOptions(filteredLevels);
    
        if (selectedLevel && !filteredLevels.some(level => level.id === selectedLevel.id)) {
            setSelectedLevel(null);
        }
    
        console.log(filteredLevels);
        console.log(filteredLevelOptions);
    
    }, [selectedJobPosition, levelOptions, selectedLevel]);

    const { handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            birth: "",
            location: "",
            department: "",
            jobPosition: "",
            contractType: "",
            level: "",
            workTime: 0,
            userId: "",
            startWorkDate: "",
            id: "",
        },
    });

    const handleDialogClose = () => {
        setEmployee(null);
        handleClose();
    };

    type FormData = z.infer<typeof schema>;

    // Fetch options for select fields
    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            if (!open) return;
            setEmployee(null);
            setLoading(true);
    
            try {
                // Fetching all the data simultaneously using Promise.all
                const [locationsRes, departmentsRes, jobPositionsRes, levelsRes, contractTypesRes] = await Promise.all([
                    
                    api.get("/Location/GetAllUnarchived"),
                    api.get("/Department/GetAllUnarchived"),
                    api.get("/JobPosition/GetAllUnarchived"),

                    api.get("/Level/GetAll"),
                    api.get("/ContractType/GetAll")
                ]);
    
                console.log("Fetching Locations", locationsRes.data);
                const locations = locationsRes.data.map((location: LocationResponse) => ({
                    id: location.id,
                    label: location.name,
                }));
                setLocationOptions(locations);
    
                console.log("Fetching Departments", departmentsRes.data);
                const departments = departmentsRes.data.map((dept: Department) => ({
                    id: dept.id,
                    label: dept.name,
                }));
                setDepartmentOptions(departments);
    
                console.log("Fetching Job Positions", jobPositionsRes.data);
                const jobPositions = jobPositionsRes.data.map((item: JobPosition) => ({
                    id: item.id,
                    label: item.name,
                }));
                setJobPositionOptions(jobPositions);
    
                console.log("Fetching Levels", levelsRes.data);
                const levels = levelsRes.data.map((item: { id: string; name: string; jobPosition: { id: string } }) => ({
                    id: item.id,
                    label: item.name,
                    jobId: item.jobPosition
                }));
                setLevelOptions(levels);
    
                console.log("Fetching Contract Types", contractTypesRes.data);
                const contractTypes = contractTypesRes.data.map((item: ContractType) => ({
                    id: item.id,
                    label: item.name,
                }));
                setConstractTypeOptions(contractTypes);
            } catch (err) {
                console.error("Error fetching data:", err);
                setLocationOptions([]);
                setDepartmentOptions([]);
                setJobPositionOptions([]);
                setLevelOptions([]);
                setConstractTypeOptions([]);
            } finally {
            }
        };
    
        fetchData();
    }, [open]);
    
    useEffect(() => {
        if (!userId) return;
        if (!open) return;
        const fetchEmployeeData = async () => {
            try {
                const res = await api.get(`/Profile/ByUserId/${userId}`, {
                    params: {
                        userId: userId,
                        getIds: true
                    }
                });
    
                if (!open) return;
                console.log("Fetching Employee Data", res.data);
                setEmployee(res.data as EmployeeCard);

                setValue('birth', res.data.birthdate || "");
                setValue('location', res.data.location || "");
                setValue('department', res.data.department || "");
                setValue('jobPosition', res.data.jobPosition || "");
                setValue('contractType', res.data.contractType || "");
                setValue('level', res.data.position || "");
                setValue('userId', res.data.userId || "");
                setValue('workTime', res.data.workPercentage || 0);
                setValue('startWorkDate', res.data.startWorkDate || "");
                
                const birthdate = res.data.birthdate;
                if (birthdate) {
                    const dateObj = new Date(birthdate); // Convert to Date object if needed
                    setBirth(dayjs(dateObj)); // Convert Date to Dayjs
                    handleDateChange(dayjs(dateObj)); // Also handle with Dayjs
                } else {
                    setBirth(null); // Handle null case
                    handleDateChange(null);
                }

                const startWorkDate = res.data.startWorkDate;
                if (startWorkDate) {
                    const startDateObj = new Date(startWorkDate);
                    setStartWorkDate(dayjs(startDateObj));  // Set start work date as Dayjs
                } else {
                    setStartWorkDate(null);  // Handle null case
                }
                setWorkTime(res.data.workPercentage);

                const selectedLoc = res.data.location;
                const foundLocation = locationOptions.find(option => option.id === selectedLoc);
                setSelectedLocation(foundLocation || null);
    
                const selectedDept = res.data.department;
                const foundDepartment = departmentOptions.find(option => option.id === selectedDept);
                setSelectedDepartment(foundDepartment || null);
    
                const selectedContract = res.data.contractType;
                const foundContractType = contractTypeOptions.find(option => option.id === selectedContract);
                setSelectedConstractType(foundContractType || null);
    
                const selectedJobPosition = JobPositionOptions.find(x => res.data.jobPosition === x.id);
                setSelectedJobPosition(selectedJobPosition || null);
    
                const selectLevel = res.data.position;
                const foundLevel = levelOptions.find(option => option.id === selectLevel);
                setSelectedLevel(foundLevel || null);
            } catch (err) {
                console.error("Error fetching employee data:", err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchEmployeeData();
    }, [open, userId, locationOptions, departmentOptions, contractTypeOptions, JobPositionOptions, levelOptions]);

    // Handle form submission
    const onSubmit: SubmitHandler<FormData> = async (data) => {
        console.log(employee?.employeeId);
        const requestData = {
            ...data,
            id: employee?.employeeId,
            userId: userId, 
        };

        await api.post("/EmployeeCard/Update", requestData) 
            .then((res) => {
                openSnackbar("Karta bola úspešne aktualizovaná", "success");
                setEmployee(null);
                handleClose();
            }).catch((err) => {
                openSnackbar("Nastala chyba pri aktualizácii karty", "error");
            }).finally(() => {
                setLoading(false);
        });
    };

    const handleStartWorkDateChange = (newValue: Dayjs | null) => {
        setStartWorkDate(newValue);
        const adjustedDate = newValue ? newValue.startOf('day') : null;
        if (newValue) {
            const localDate = adjustedDate?.toDate();
            const timezoneOffset = localDate?.getTimezoneOffset();
            localDate?.setMinutes(localDate.getMinutes() - timezoneOffset!);
            const isoString = localDate?.toISOString();
            setValue("startWorkDate", isoString || "");  // Set value for form submission
        }
    };

    const handleDateChange = (newValue: Dayjs | null) => {
        setBirth(newValue);
        console.log(newValue)  ; 
        const adjustedDate = newValue ? newValue.startOf('day') : null;
        console.log("tostring", adjustedDate?.toISOString());
        if (newValue) {
            const adjustedDate = newValue.startOf('day'); 
            const localDate = adjustedDate.toDate();
            const timezoneOffset = localDate.getTimezoneOffset();
            localDate.setMinutes(localDate.getMinutes() - timezoneOffset);
            const isoString = localDate.toISOString();
            setValue("birth", isoString);
            console.log("Adjusted Date:", adjustedDate.format('YYYY-MM-DD'));
            console.log("Local Adjusted ISO String:", isoString);
        }
    };

    return (
        <>
        <Dialog open={open && loading} onClose={handleDialogClose} maxWidth="xl" fullWidth>
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={200}
        width="100%"
    >
        <CircularProgress size={60} />
    </Box>
</Dialog>
        <Snackbar
            anchorOrigin={{
                vertical: 'top', 
                horizontal: 'center', 
              }}
            open={loading}
            message="Loading..."
            autoHideDuration={null}
        />
        <Dialog open={open && !loading} onClose={handleDialogClose} maxWidth="xl" fullWidth>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>Zamestnanecká karta</DialogTitle>
                <DialogContent>
                    <Box>
                        <Typography variant="body1" fontWeight="bold">ID zamestnanca: {employee?.employeeId} </Typography> {/* Displaying userId here */}
                        <Typography variant="body1" fontWeight="bold">Používateľské meno: {user?.email}</Typography>
                        <Typography variant="body1" fontWeight="bold">Meno: {user?.firstName}</Typography>
                        <Typography variant="body1" fontWeight="bold">Priezvisko: {user?.lastName}</Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ marginTop: 2 }}>
                        <Grid item xs={12} sm={6}>
                            <Stack direction="column" gap={3}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Dátum narodenia"
                                        value={birth}
                                        onChange={(newValue) => handleDateChange(newValue)}
                                        slotProps={{
                                            textField: {
                                                error: !!errors.birth,
                                                helperText: errors.birth?.message ?? "",
                                                required: true
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                                <Autocomplete
                                    fullWidth
                                    options={locationOptions}
                                    value={selectedLocation}
                                    onChange={(_, value) => {
                                        setValue("location", value ? value.id : "");
                                        setSelectedLocation(value);
                                    }}
                                    getOptionLabel={(option) => option.label}  // This will display the label
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Lokalita"
                                            error={!!errors.location}
                                            helperText={errors.location?.message ?? ""}
                                        />
                                    )}
                                />
                                <Autocomplete
                                    fullWidth
                                    options={departmentOptions}
                                    value={selectedDepartment || null}
                                    onChange={(_, value) => {
                                        setValue("department", value ? value.id : "");
                                        setSelectedDepartment(value);
                                    }}
                                    getOptionLabel={(option) => option.label}  // Display the label of department
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Oddelenie"
                                            error={!!errors.department}
                                            helperText={errors.department?.message ?? ""}
                                        />
                                    )}
                                />
                            </Stack>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Stack direction="column" gap={3}>
                                <Autocomplete
                                        fullWidth
                                        options={JobPositionOptions}
                                        value={selectedJobPosition || null}
                                        onChange={(_, value) => {
                                            setValue("jobPosition", value ? value.id : "");
                                            setSelectedJobPosition(value);
                                        }}
                                        getOptionLabel={(option) => option.label}  // Display the label of job position
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                required
                                                label="Pracovná pozícia"
                                                error={!!errors.jobPosition}
                                                helperText={errors.jobPosition?.message ?? ""}
                                            />
                                        )}
                                />
                                <Autocomplete
                                    fullWidth
                                    options={filteredLevelOptions}
                                    value={selectedLevel || null}
                                    onChange={(_, value) => {
                                        setValue("level", value ? value.id : "");
                                        setSelectedLevel(value);
                                    }}
                                    getOptionLabel={(option) => option.label}  // Display the label of level
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Úroveň pozície"
                                            error={!!errors.level}
                                            helperText={errors.level?.message ?? ""}
                                        />
                                    )}
                                />
                                <Autocomplete
                                    fullWidth
                                    options={contractTypeOptions}
                                    value={selectedConstractType || null}
                                    onChange={(_, value) => {
                                        setValue("contractType", value ? value.id : "");
                                        setSelectedConstractType(value);
                                    }}
                                    getOptionLabel={(option) => option.label}  // Display the label of contract type
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            required
                                            label="Typ zmluvy"
                                            error={!!errors.contractType}
                                            helperText={errors.contractType?.message ?? ""}
                                        />
                                    )}
                                />
                                <TextField
                                    required
                                    label="Úväzok (percentá)"
                                    value={workTime}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d*$/.test(value)) {  // Ensure only numeric input
                                            const parsedValue = value === "" ? 0 : parseInt(value);  // Default to 0 if empty
                                            if (parsedValue >= 0 && parsedValue <= 100) {  // Ensure the value is within the range
                                                setValue("workTime", parsedValue);  // Update form state
                                                setWorkTime(parsedValue);  // Update local state
                                            }
                                        }
                                    }}
                                    error={!!errors.workTime || workTime < 0 || workTime > 100}  // Display error if value is out of range
                                    helperText={errors.workTime?.message ?? (workTime < 0 || workTime > 100 ? "Value must be between 0 and 100" : "")}  // Show range error if value is out of range
                                    inputProps={{
                                        inputMode: "numeric",  // Shows numeric keyboard on mobile
                                        pattern: "[0-9]*",  // Restrict input to digits
                                    }}
                                />
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Dátum nástupu"
                                        value={startWorkDate}
                                        onChange={(newValue) => handleStartWorkDateChange(newValue)}
                                        slotProps={{
                                            textField: {
                                                error: !!errors.startWorkDate,
                                                helperText: errors.startWorkDate?.message ?? "",
                                                required: true
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        loading={loading}
                        loadingPosition="start"
                    >
                        Uložiť
                    </LoadingButton>
                    <Button variant="outlined" color="secondary" onClick={handleDialogClose}>
                        Zrušiť
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
        </>
    );
};

export default EmployeeCardDialog;