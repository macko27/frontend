import React, { useEffect, useState } from 'react';
import Layout from "../../../components/Layout";
import { Box, Stack, TextField, Typography, Button, Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../app/api";
import { useSnackbar } from '../../../hooks/SnackBarContext';
import useLoading from '../../../hooks/LoadingData';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import ReviewModal from './ReviewModal';
import { useAuth } from '../../../hooks/AuthProvider';

export type Goal = {
    goalId: string;
    goalName: string;
    employeeRecDescription?: string;
    superiorRecDescription?: string;
    employeeQuestionDescription?: string;
    superiorQuestionDescription?: string;
};

const schema = z.object({
    employeeEndDate: z.string().optional(),
    superiorEndDate: z.string().optional(),
});


type FormData = z.infer<typeof schema>;

const UpdateReview: React.FC = () => {

    const { userProfile, setUserProfile, setRefresh, refresh } = useAuth();
    const { state } = useLocation();
    const { id } = state || {};
    const nav = useNavigate();
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [reviewData, setReviewData] = useState<any | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
    const [employeeGoals, setEmployeeGoals] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const { openSnackbar } = useSnackbar();

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const formattedCreateDate = formatDate(reviewData?.createdAt);
    const formattedCompletedDate = reviewData?.completedAt ? formatDate(reviewData.completedAt) : "-";

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const navigateBack = () => {
        console.log("Navigating back");
        nav("/manageReviews");
    };

    useEffect(() => {
        if (id) {
            api.get(`/Review/${id}`)
                .then((res) => {
                    const reviewData = res.data;
                    console.log("prijate: ", reviewData);
                    setReviewData(reviewData);
                    setValue("employeeEndDate", reviewData.employeeEndDate || "");
                    setValue("superiorEndDate", reviewData.superiorEndDate || "");
                })
                .catch((err) => {
                    console.log("Nastala chyba pri načítaní údajov o organizácií.");
                    navigateBack();
                });
        }
    }, [id, setValue]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        
        console.log("data:", data);
        const updateData = {
            employeeEndDate: data.employeeEndDate,
            superiorEndDate: data.superiorEndDate,
        };

        console.log("to update:", updateData);
        setLoading(true);
        await api.put(`/Review/Update/${id}`, updateData)
            .then((res) => {
                openSnackbar("Posudok bol úspešne upravený.", "success");
                nav("/manageReviews");
            })
            .catch((err) => {
                openSnackbar("Nastala chyba pri aktualizácii.", "error");
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };
    
    const handleSave = async (action: string) => {
        console.log("Action:", action);
        const updateData = {
            employeeEndDate: reviewData?.employeeEndDate,
            superiorEndDate: reviewData?.superiorEndDate,
            action: action
        };

        console.log("to update:", updateData);
        setLoading(true);

        await api.put(`/Review/Update/${id}`, updateData)
            .then((res) => {
                if (action === "finish") {
                    openSnackbar("Posudok bol úspešne ukončený.", "success");
                } else {
                    openSnackbar("Posudok bol úspešne upravený.", "success");
                }
                nav("/manageReviews");
            })
            .catch((err) => {
                openSnackbar("Nastala chyba pri aktualizácii.", "error");
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    

    const loadingIndicator = useLoading(reviewData === null);
    if (loadingIndicator) return loadingIndicator;

    
    const handleEmployeeClick = (employee: any) => {
        setSelectedEmployee(employee);
        //setOpenModal(true);
        api.get(`/Review/GetReviewText/${userProfile?.id}/${id}/${employee.id}`)
            .then((response) => {
                setEmployeeGoals(response.data);
                console.log("goals info ", response.data);
                console.log("selected e ", employee);
            })
            .catch((error) => {
                console.error("Error fetching employee goals:", error);
                openSnackbar("Chyba pri načítaní cieľov zamestnanca.", "error");
            });
            setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedEmployee(null);
    };

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    {reviewData?.reviewName || "Loading..."}
                </Typography>
                <Typography sx={{ mb: 2 }}>Zadávateľ: {reviewData?.superiorName} (vedúci zamestnanec)</Typography>
                <Typography sx={{ mb: 2 }}>Dátum a čas vytvorenia posudku: {formattedCreateDate}</Typography>
                <Typography sx={{ mb: 2 }}>Dátum a čas dokončenia posudku: {formattedCompletedDate}</Typography>
                <Typography sx={{ mb: 3 }}>
                    Priradení zamestnanci:
                    {reviewData?.assignedEmployees?.length ? (
                        reviewData.assignedEmployees.map((emp: { id: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: number) => (
                            <span key={emp.id} onClick={() => handleEmployeeClick(emp)}
                                    style={{ cursor: 'pointer',color: '#757575', textDecoration: 'underline', }}
                                    >
                                    {emp.name}
                                    {index < reviewData.assignedEmployees.length - 1 ? ", " : ""}
                            </span>

                        ))
                    ) : (
                        " Žiadni zamestnanci nie sú priradení"
                    )}
                </Typography>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        label="Termín zamestnanca"
                        value={reviewData?.employeeEndDate ? dayjs(reviewData?.employeeEndDate) : null}
                        onChange={(newValue) => {
                            const updatedDate = newValue ? newValue.toISOString() : "";
                            setValue("employeeEndDate", updatedDate);
                            setReviewData((prev: any) => ({ ...prev, employeeEndDate: updatedDate })); }}
                        sx={{ mb: 2 }}
                    />
                    <DateTimePicker
                        label="Termín vedúceho zamestnanca"
                        value={reviewData?.superiorEndDate ? dayjs(reviewData?.superiorEndDate) : null}
                        onChange={(newValue) => {
                            const updatedDate = newValue ? newValue.toISOString() : "";
                            setValue("superiorEndDate", updatedDate); 
                            setReviewData((prev: any) => ({ ...prev, superiorEndDate: updatedDate })); 
                        }}
                        sx={{ mb: 2 }}
                    />
                </LocalizationProvider>

                <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                    {errors && Object.keys(errors).length > 0 && (
                        <Alert severity="error">There are errors in the form, please fix them.</Alert>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "auto" }}>
                        <Stack direction="row" gap={3}>
                            <Button variant="contained" type="button" onClick={() => handleSave("finish")}
                                sx={{ backgroundColor: '#D2691E', '&:hover': { backgroundColor: '#FB8C00' },color: 'white',padding: '8px 16px',}}
                            >
                                Ukončiť posudzovanie
                            </Button>
                            <Button variant="contained" type="button" onClick={() => handleSave("save")}
                                sx={{ backgroundColor: '#008B8B','&:hover': { backgroundColor: '#0097A7' }, color: 'white', padding: '8px 16px',}}
                            >
                                Uložiť
                            </Button>
                            <Button variant="contained" type="button" 
                                sx={{ backgroundColor: '#B0BEC5', '&:hover': { backgroundColor: '#90A4AE' }, color: 'white', padding: '8px 16px', }}
                                onClick={() => nav("/manageReviews")}
                            >
                                Zrušiť
                            </Button>
                        </Stack>
                    </Box>
                </form>
            </Box>

            {/* Modal */}
            <ReviewModal
                open={openModal}
                onClose={handleCloseModal}
                employeeGoals={employeeGoals}
                selectedGoal={selectedGoal}
                selectedEmployee={selectedEmployee} 
                setSelectedGoal={setSelectedGoal}
                reviewData={reviewData}
                onSave={(superiorRecDescription) => {
                    if (selectedGoal) {
                    setSelectedGoal({
                        ...selectedGoal,
                        superiorRecDescription,
                    });
                    }
                }}
                onSaveQuestion={(superiorQuestionDescription) => {
                    if (selectedGoal) {
                    setSelectedGoal({
                        ...selectedGoal,
                        superiorQuestionDescription,
                    });
                    }
                }}
            />
            
        </Layout>
    );
};

export default UpdateReview;
