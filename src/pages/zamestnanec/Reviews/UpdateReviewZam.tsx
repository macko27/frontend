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
import ReviewModalZam from './ReviewModalZam';
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

const UpdateReviewZam: React.FC = () => {

    const { userProfile } = useAuth();
    const { state } = useLocation();
    const { id } = state || {};
    const nav = useNavigate();
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
                    setReviewData(reviewData);
                    //setValue("employeeEndDate", reviewData.employeeEndDate || "");
                    //setValue("superiorEndDate", reviewData.superiorEndDate || "");
                })
                .catch((err) => {
                    console.log("Nastala chyba pri načítaní údajov o organizácií.");
                    navigateBack();
                });
        }
    }, [id, setValue]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setLoading(true);
        await api.put(`/Review/Update/${id}`)
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

  
    const loadingIndicator = useLoading(reviewData === null);
    
    const handleEmployeeClick = (employee: any) => {
        setSelectedEmployee(employee);
        
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
             { loadingIndicator ? loadingIndicator : (
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>              
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    {reviewData?.reviewName || "Loading..."}
                </Typography>
                <Typography sx={{ mb: 2 }}>Zadávateľ: {reviewData?.superiorName} (vedúci zamestnanec)</Typography>
                <Typography sx={{ mb: 2 }}>Dátum a čas vytvorenia posudku: {formattedCreateDate}</Typography>
                <Typography sx={{ mb: 2 }}>Dátum a čas dokončenia posudku: {formattedCompletedDate}</Typography>
                <Typography sx={{ mb: 3 }}>
                Priradený zamestnanec:
                {reviewData?.assignedEmployees?.length ? (
                    reviewData.assignedEmployees.map((emp: { id: string, name: string }, index: number) => {
                        // Log both emp.id and userProfile.id to the console
                        console.log("Employee ID:", emp, "Logged-in User ID:", userProfile?.id);
                        const fullName = `${userProfile?.firstName} ${userProfile?.lastName}`;

                        // Only display the logged-in user
                        return emp.name === fullName && (
                            <span 
                                key={emp.id} 
                                onClick={() => handleEmployeeClick(emp)}
                                style={{ cursor: 'pointer', color: '#757575', textDecoration: 'underline' }}
                            >
                                {emp.name}
                            </span>
                        );
                    })
                ) : (
                    " Žiadni zamestnanci nie sú priradení"
                )}
                </Typography>

                <TextField
                    label="Termín dopytovaného zamestnanca"
                    value={formatDate(reviewData?.employeeEndDate)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Termín vedúceho zamestnanca"
                    value={formatDate(reviewData?.superiorEndDate)}
                    sx={{ mb: 2 }}
                />

                 
                <Button variant="contained" type="button"
                    sx={{ backgroundColor: '#B0BEC5', '&:hover': { backgroundColor: '#90A4AE' }, color: 'white', padding: '8px 16px', }}
                    onClick={() => nav("/myReviews")}
                >
                    Zrušiť
                </Button>
            </Box>
        )}

            {/* Modal */}
            <ReviewModalZam
                open={openModal}
                onClose={handleCloseModal}
                employeeGoals={employeeGoals}
                selectedGoal={selectedGoal}
                selectedEmployee={selectedEmployee} 
                setSelectedGoal={setSelectedGoal}
                reviewData={reviewData}
                onSave={(employeeDescription) => {
                    if (selectedGoal) {
                    setSelectedGoal({
                        ...selectedGoal,
                        employeeRecDescription: employeeDescription,
                    });
                    }
                }}
                onSaveQuestion={(employeeQuestionDescription) => {
                    if (selectedGoal) {
                    setSelectedGoal({
                        ...selectedGoal,
                        employeeQuestionDescription,
                    });
                    }
                }}
            />
            
        </Layout>
    );
};

export default UpdateReviewZam;


/*
 <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                        label="Termín zamestnanca"
                        value={reviewData?.employeeEndDate ? dayjs(reviewData?.employeeEndDate) : null}
                        sx={{ mb: 2 }}
                    />
                    <DateTimePicker
                        label="Termín vedúceho zamestnanca"
                        value={reviewData?.superiorEndDate ? dayjs(reviewData?.superiorEndDate) : null}
                        sx={{ mb: 2 }}
                    />
                </LocalizationProvider>
 */
