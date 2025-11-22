import React, { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import axios from "axios";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import Layout from "../../../components/Layout";
import { Delete, Edit } from "@mui/icons-material";
import { PieChart } from "@mui/x-charts/PieChart";
import api from "../../../app/api";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../../hooks/ProfileProvider";
import { useAuth } from "../../../hooks/AuthProvider";
import { useSnackbar } from "../../../hooks/SnackBarContext";
import InfoIcon from '@mui/icons-material/Info';

const ManageCourses: React.FC = () => {
  const [courseEmployees, setCourseEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const profile = useAuth();
  const role = profile.userProfile?.role;
  const isVeducko = role === "Vedúci zamestnanec"; 
  const [openSearchModal, setOpenSearchModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedEmployeeCourse, setSelectedEmployeeCourse] = useState<any | null>(null);
  const [openCourseDetailModal, setOpenCourseDetailModal] = useState<boolean>(false);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string | null>(null);

  const [employees, setEmployees] = useState<any[]>([]);
  const {openSnackbar} = useSnackbar();

  useEffect(() => {
    setLoading(true);
    api.post('/Courses/SetCoursesAfterDate');
    api.get('/employeeCard/GetCurrentSuperiorDepartmentTeam')
      .then((response) => {
        setEmployees(response.data);
        console.log(response.data);
        if (profile.userProfile?.id) {
          handleEmployeeSelect(profile.userProfile.id);
        }
      })
      .catch((error) => {
        console.error('Error fetching employees:', error);
      });
  }, []);

  const deleteCourse = (courseEmployeeId: string) => {
    if (!window.confirm("Naozaj chcete vymazať toto školenie?")) return;
  
    api.delete(`/courses/DeleteCourseEmployee/${courseEmployeeId}`)
      .then(() => {
        setCourseEmployees(prev => prev.filter(ce => ce.id !== courseEmployeeId));
      })
      .catch((err) => {
        console.error("Chyba pri mazaní školenia:", err);
      });
  };

  const setCourses = (userId: string) => {
    if (!userId) {
      console.log("User ID is missing");
      return;
    }
    setLoading(true);
    api.get(`/courses/Get/${userId}`)
      .then((res) => {
        setCourseEmployees(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  const stateColors: any = {
    Splnený: "success",
    Nesplnený: "error",
    Prebiehajúci: "warning",
  };
  const handleCloseCourse = async (courseEmployeeId: string) => {
      console.log(courseEmployeeId);
      api.post(`/courses/CloseCourseEmployee/${courseEmployeeId}`).then(() => {
        openSnackbar("Kurz bol úspešne uzavretý.","success");
        setOpenCourseDetailModal(false);
        // Refresh courses if needed
        if (selectedUserId) setCourses(selectedUserId);
      }).catch((error) => {
        console.error("Chyba pri uzatváraní kurzu:", error);
        openSnackbar("Nepodarilo sa uzavrieť kurz.","error");
    });
  };

  const parseDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("sk-SK", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  const handleDownloadFile = async (courseId: string, employeeId: string) => {
    console.log("Downloading file for course ID:", courseId);
    console.log("Downloading file for employee ID:", employeeId);
    try {
      const response = await api.get(`/Courses/GetCourseFiles?CourseID=${courseId}`);
      console.log("Response data:", response.data);
      for (const file of response.data ) {
        //const blob = new Blob([file.FilePath]);
        console.log("Blob link:",file);
        //const url = window.URL.createObjectURL(file.FilePath);
        const link = document.createElement('a');
        link.href = file.filePath;
    
        link.download = file.description || 'downloaded_file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        //window.URL.revokeObjectURL(url);
      }
      await api.post(`/Courses/StartCourseEmployee/${courseId}`);
      openSnackbar("Súbor bol úspešne stiahnutý.","success");
    } catch (err) {
      console.error("Chyba pri sťahovaní súboru:", err);
    }
  };

  const stateCount = courseEmployees.reduce(
    (acc, ce) => {
      const state = ce.courseState || "Neznámy";
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = Object.keys(stateCount).map((label, i) => ({
    id: i,
    label,
    value: stateCount[label],
  }));

  const handleEmployeeSelect = (userId: string) => {
    console.log("Selected User ID:", userId); 
    setSelectedUserId(userId);  // Set the selected user ID
    setOpenSearchModal(false);   // Close the modal
    setCourses(userId);                // Fetch courses for the selected user
  };

  return (
    <Layout>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          Zoznam školení môjho tímu
        </Typography>

        <Stack direction="row" spacing={2} mb={2}>
          {["Splnený", "Prebiehajúci", "Nezačatý"].map((state) => (
            <Button
              key={state}
              variant={selectedStateFilter === state ? "contained" : "text"}
              color="inherit"
              onClick={() =>
                setSelectedStateFilter(selectedStateFilter === state ? null : state)
              }
            >
              {state}
            </Button>
          ))}
          {isVeducko && (
            <>
              <Button
                variant="contained"
                color="warning"
                onClick={() => {
                  navigate("/createCourse");
                }}
              >
                Pridať školenie
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() => setOpenSearchModal(true)} // Open modal to search employee
              >
                Hľadať zamestnanca
              </Button>
            </>
          )}
        </Stack>

        {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : selectedUserId == null ? (
            <Typography variant="body1" color="text.secondary">
              Prosím, vyberte zamestnanca na zobrazenie školení.
            </Typography>
          ) : courseEmployees.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              Zatiaľ neexistujú žiadne školenia.
            </Typography>
          ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" color="orange">Školenia a kurzy</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Názov kurzu</TableCell>
                      <TableCell>Zdroj kurzu</TableCell>
                      <TableCell>Dátum expirácie</TableCell>
                      <TableCell>Stav kurzu</TableCell>
                      <TableCell>Dátum splnenia</TableCell>
                      <TableCell>Akcia</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courseEmployees
                    .filter(item => !selectedStateFilter || item.courseState === selectedStateFilter)
                    .map((item) => {
                      const expires = item.expirationDate;
                      const remainingDays = expires
                        ? Math.ceil((new Date(expires).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                        : null;

                      return (
                        <TableRow
                          key={item.id}
                          onDoubleClick={() => {
                            if (item.employeeId === profile.userProfile?.id) {
                              setSelectedEmployeeCourse(item);
                              setOpenCourseDetailModal(true);
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <TableCell>{item.courseName || "Neznámy kurz"}</TableCell>
                          <TableCell>
                            {item.createdBy || "-"}<br />
                            <em>{item.department || "-"}</em>
                          </TableCell>
                          <TableCell>
                            {parseDate(expires) || "-"}<br />
                            {remainingDays !== null && !item.completedDate && (
                              <small style={{ color: "gray" }}>ostáva {remainingDays} dní</small>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.courseState || "Neznámy"}
                              color={stateColors[item.courseState] || "default"}
                            />
                          </TableCell>
                          <TableCell>{parseDate(item.completedDate) || "-"}</TableCell>
                          <TableCell>
                          <IconButton color="warning" onClick={() => {
                              setSelectedEmployeeCourse(item);
                              setOpenCourseDetailModal(true);
                              console.log("Item:", item); 
                            }}>
                          {isVeducko ? <InfoIcon /> : <Edit />}</IconButton>
                             {isVeducko &&
                              <IconButton color="error" onClick={() => deleteCourse(item.id)}>
                                <Delete />
                              </IconButton>
                              }
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <PieChart
                  series={[{ data: pieData }]}
                  width={300}
                  height={300}
                  legend={{
                    direction: "row",
                    position: { vertical: "bottom", horizontal: "middle" },
                    padding: 10,
                  }}
                />
                <Stack spacing={1} mt={2}>
                  {pieData.map((item) => (
                    <Typography key={item.label}>
                      {item.label}: {item.value}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Search Employee Modal */}
      <Dialog open={openSearchModal} onClose={() => setOpenSearchModal(false)}>
        <DialogTitle>Hľadať zamestnanca</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Zamestnanca</TableCell>
                <TableCell>Meno Zamestnanca</TableCell>
                <TableCell>Oddelenie</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.userId}>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => handleEmployeeSelect(employee.userId)} // Select employee and fetch courses
                    >
                      Vybrať
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSearchModal(false)} color="primary">
            Zatvoriť
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCourseDetailModal} onClose={() => setOpenCourseDetailModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detail kurzu</DialogTitle>
        <DialogContent>
          {selectedEmployeeCourse && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1"><strong>Typ:</strong> {selectedEmployeeCourse.courseType}</Typography>
                  <Typography variant="body1"><strong>Dátum expirácie:</strong> {parseDate(selectedEmployeeCourse.expirationDate)} 
                          {!selectedEmployeeCourse.completedDate && ( <small>ostáva {Math.ceil((new Date(selectedEmployeeCourse.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dní </small> )}
                  </Typography>
                  <Typography variant="body1"><strong>Autor kurzu:</strong> {selectedEmployeeCourse.createdBy}</Typography>
                  <Typography variant="body1"><strong>Verzia:</strong> {selectedEmployeeCourse.version}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1"><strong>Status:</strong></Typography>
                    <Button
                      variant="contained"
                      color={
                        selectedEmployeeCourse.courseState === "Splnený"
                          ? "success"
                          : selectedEmployeeCourse.courseState === "Prebiehajúci"
                          ? "warning"
                          : selectedEmployeeCourse.courseState === "Nesplnený"
                          ? "error"
                          : "inherit"
                      }
                      size="small"
                    >
                      {selectedEmployeeCourse.courseState || "Neznámy"}
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">{selectedEmployeeCourse.courseName}</Typography>
                </Grid>
              </Grid>
              <Paper elevation={1} sx={{  p: 2 }}>
                <Typography>{selectedEmployeeCourse.detailDescription}</Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button onClick={() => setOpenCourseDetailModal(false)} color="inherit">
            Zavrieť
          </Button>

          <Box display="flex" gap={2}>
          {( !isVeducko && !selectedEmployeeCourse?.completedDate && selectedEmployeeCourse?.courseState !== "Nesplnený" )   && (
            <>  
              <Button
                variant="contained"
                color="info"
                onClick={() => handleCloseCourse(selectedEmployeeCourse.id)}
              >
                Uzavrieť kurz
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleDownloadFile(selectedEmployeeCourse.id, profile.userProfile?.id || '')}
              >
                Spustiť
              </Button>
            </>
          )}
          </Box>
        </DialogActions>
      </Dialog>

    </Layout>
  );
};

export default ManageCourses;
