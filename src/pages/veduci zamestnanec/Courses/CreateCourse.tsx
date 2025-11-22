import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Grid,
  Paper,
  InputLabel,
  FormControl,
  Select,
  Link,

} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Layout from "../../../components/Layout";
import dayjs from "dayjs";
import AddEmployeeModal from "./AddEmployees";
import { EmployeeCard } from "../../../types/EmployeeCard";
import api from "../../../app/api";
import { CourseResponse, FileRequest } from "../../../types/responses/CourseRespones";
import { useAuth } from "../../../hooks/AuthProvider";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useSnackbar } from "../../../hooks/SnackBarContext";
import { useNavigate } from "react-router-dom";

const CreateCourse: React.FC = () => {
    const { userProfile } = useAuth();
  const [courseType, setCourseType] = useState("Kurz");
  const [files, setFiles] = useState<File[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeCard[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<EmployeeCard[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [expirationDate, setExpirationDate] = useState<dayjs.Dayjs | null>(null);
  const [courseVersion, setCourseVersion] = useState<number>(1);
  const [courseNote, setCourseNote] = useState('');
  const {openSnackbar} = useSnackbar();
  const navigate = useNavigate();
    useEffect(() => {
    api.get(`/employeeCard/GetCurrentSuperiorDepartmentTeam`)    
        .then((res) => {
            setEmployeeOptions(res.data); 
            console.log(res.data);
        })
    }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const uniqueFiles = [...files, ...newFiles.filter(f => !files.some(existing => existing.name === f.name))];
      setFiles(uniqueFiles);
      console.log("Selected files:", files);
    }
  };
  const handleSave = (selected: string[]) => {
    const selectedEmps = employeeOptions.filter(emp => selected.includes(emp.employeeId));
    setSelectedEmployees(selectedEmps);  // Presunieme vybraných zamestnancov do state
  };

  const handleDocUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    console.log("handleDocUpload formData:", formData);
    const res = await api.post("/Courses/UploadFile", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).catch((error) => {
        console.error('Error uploading file:', error);
        openSnackbar("Chyba pri nahrávaní súboru","error");
        return null;
    });
    return res?.data.filePath; 
};
  const handleSubmit = async () => {
    const filePath: FileRequest[] = [];
    console.log("Files:", files);
    for (const file of files) {
      try {
          const uploadedFilePath = await handleDocUpload(file);
          console.log("uploadedFilePath", uploadedFilePath);
          filePath.push({
              Description: file.name,
              FilePath: uploadedFilePath,
          });
      } catch (error) {
          console.error('Failed to save course:', error);
      }
    }
    console.log("FilePath:", filePath);
    const employeeIds = selectedEmployees.map(emp => emp.employeeId);
    const newCourse: CourseResponse = {
        DetailDescription: courseNote,
        CreatedUserId: userProfile?.id || '', 
        Employees: employeeIds, 
        Type: courseType, 
        Files: filePath, 
        Version: courseVersion,
        Name: courseName,
        ExpirationDate: expirationDate?.toString() || '', 
    };
    console.log("NewCourse:", newCourse);
    try {
      const response: { data: any } = await api.post('/Courses/CreateCourse', newCourse);
      console.log('Course saved successfully', response.data);
      openSnackbar("Kurz bol úspešne vytvorený.","success");
      navigate(-1);
      // Optionally reset form or navigate away
    } catch (error:any) {
      console.error('Failed to save course:', error);
      openSnackbar(error?.response?.data?.message,"error")
    }
  };

  return (
    <Layout>
      <Box sx={{ padding: 4 }}>
        <Typography variant="h6" gutterBottom>
          Pridať kurz / školenie
        </Typography>

        <div>
      <Button variant="contained" onClick={() => setOpenDialog(true)}>
        Pridať zamestnanca
      </Button>
      {openDialog && (
      <AddEmployeeModal
            employees={employeeOptions}
            selectedEmployees={selectedEmployees.map(emp => emp.employeeId)}
            onClose={() => setOpenDialog(false)}
            onSave={handleSave}
                           />
                        )}
      <Typography variant="h6" gutterBottom>
        Vybraní zamestnanci:
      </Typography>
      {selectedEmployees.map((emp) => (
        <Typography key={emp.id}>{emp.name}</Typography>
      ))}
    </div>

        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Názov" sx={{ mb: 2 }} onChange={(e) => setCourseName(e.target.value)} />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Typ</InputLabel>
              <Select
                value={courseType}
                label="Typ"
                onChange={(e) => setCourseType(e.target.value)}
              >
                <MenuItem value="Kurz">Kurz</MenuItem>
                <MenuItem value="Školenie">Školenie</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Verzia" sx={{ mb: 2 }} onChange={(e) => setCourseVersion(Number(e.target.value))} type="number"/>
            <Box
              sx={{
                border: "1px dashed #ccc",
                borderRadius: "4px",
                padding: 2,
                textAlign: "center",
                mb: 3,
              }}
            >
              <Button
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                Priložiť súbor
                <input
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx,.pptx,.xlsx,.txt"
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            {/* File List */}
            {files.map((file) => (
              <Typography key={file.name}>
                <Link href="#" download>
                  {file.name}
                </Link>
              </Typography>
            ))}
            {files.length !== 0 && (
             <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Termín dokončenia"
                                        value={expirationDate}
                                        onChange={(newValue) => setExpirationDate(newValue)}
                                    />
                                            
            </LocalizationProvider>
            )}
          </Grid>

          {/* Right Column - Note */}
          <Grid item xs={12} md={6} >
            <TextField
              fullWidth
              label="Poznámka"
              value={courseNote}
              onChange={(e) => setCourseNote(e.target.value)}
              multiline
              rows={10}
              sx={{ height: "100%", padding: 1 }}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => handleSubmit()}>
            Uložiť
          </Button>
          <Button variant="contained" color="inherit" onClick={() => navigate(-1)}>
            Zrušiť
          </Button>
        </Box>
      </Box>

      
    </Layout>
  );
};

export default CreateCourse;
