import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Stack,
    List,
    ListItem,
    ListItemText,
    IconButton,
    TextField,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import api from "../../../app/api";
import Layout from "../../../components/Layout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Feedback from "../../../types/Feedback/Feedback";
import FeedbackRecipient from "../../../types/Feedback/FeedbackRecipient";
import { useAuth } from "../../../hooks/AuthProvider";
import { dataGridStyles } from "../../../styles/gridStyle";
import useLoading from "../../../hooks/LoadingData";
import { useSnackbar } from "../../../hooks/SnackBarContext";

const ManageFeedback: React.FC = () => {
    const location = useLocation();
    const feedbackId  = location.state?.reviewId;
    const [hasOpened, setHasOpened] = useState(false);
    const [feedbackList, setFeedbackList] = useState<FeedbackRecipient[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecipient | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [notification, setNotification] = useState("");
    const nav = useNavigate();
    const { userProfile, setUserProfile, setRefresh, refresh } = useAuth();
    const [isSender, setIsSender] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const {openSnackbar} = useSnackbar();

    useEffect(() => {
        GetRequiredFeedback();
        if (!feedbackId || hasOpened) return;

        if (!feedbackId) {
            GetDeliveredFeedback();
            return;
        }
        
        if (feedbackList.length === 0) {
            console.log("Feedback list is empty, waiting for data...");
            return;
        }
        if (feedbackId) {
            const foundFeedback = feedbackList.find((f) => String(f.id) === String(feedbackId));
            console.log("found:", foundFeedback);
            if(foundFeedback) {
                const fetchFeedbackById = async () => {
                    try {
                        setHasOpened(true); 
                        handleOpenDialog(foundFeedback);
                    } catch (error) {
                        console.error("Error fetching feedback:", error);
                    }
                };
                fetchFeedbackById();
            }
        }
    }, []); 

    useEffect(() => {
        GetDeliveredFeedback();
    }, [refresh]);

    const GetDeliveredFeedback = async () => {
        setLoading(true);
        await api
            .get(`/Feedback/GetDeliveredFeedbacks?userId=${userProfile?.id}`)
            .then((response) => {
                setFeedbackList(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                console.error("Error fetching feedback:", error);
                setFeedbackList([]);
            });
        setIsSender(true);
        console.log(isSender);
        setLoading(false);
    };

    const GetRequiredFeedback = async () => {
        setLoading(true);
        await api
            .get(`/Feedback/GetRequiredFeedbacks?userId=${userProfile?.id}`)
            .then((response) => {
                setFeedbackList(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                console.error("Error fetching feedback:", error);
                setFeedbackList([]);
            });
        setIsSender(false);
        console.log(isSender);
        setLoading(false);
    };

    const handleOpenDialog = async (feedback: FeedbackRecipient) => {
        await api
            .get(`/Feedback/GetFeedback?id=${feedback.id}`)
            .then((response) => {
                console.log(response.data);
                setSelectedFeedback(response.data);
            })
            .catch((error) => {
                console.error("Error fetching feedback:", error);
            });
        await setRead(feedback);
        setOpenDialog(true);
    };

    const setRead = async (feedback: FeedbackRecipient) => {
        console.log("isSender");
        console.log(isSender);
        if (isSender) {
            await api
                .post(`/Feedback/ReadedSender?id=${feedback.id}`)
                .then(() => {})
                .catch((error) => {
                    console.error("Error fetching feedback:", error);
                });
        } else {
            await api
                .post(`/Feedback/ReadedRecipient?id=${feedback.id}`)
                .then(() => {})
                .catch((error) => {
                    console.error("Error fetching feedback:", error);
                });
        }
        feedback.isRead = true;
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedFeedback(null);
    };

    const handleDecline = async () => {
        await api
            .post(`/Feedback/DeclinedRecipient?id=${selectedFeedback?.id}`)
            .then(() => {})
            .catch((error) => {
                console.error("Error fetching feedback:", error);
            });
        handleCloseDialog();
        //setNotification("Požiadavka bola zamietnutá.");
        openSnackbar("Požiadavka bola zamietnutá!", "error");
    };

    const handleCloseNotification = () => {
        setNotification("");
    };

    const handleConfirm = async () => {
        console.log("Confirm");
        console.log(selectedFeedback);
        await api
            .post(`/Feedback/AnswerFeedback`, selectedFeedback)
            .then(() => {})
            //todo dorobiť zobrazenie inf.
            .catch((error) => {
                console.error("Error fetching feedback:", error);
            });
        handleCloseDialog();
        //setNotification("Spätná väzba bola odoslaná.");
        openSnackbar("Spätná väzba bola odoslaná!", "success");
    };

    const columns: GridColDef<FeedbackRecipient>[] = [
        { field: "title", headerName: "Názov", 
            headerClassName: 'header', width: 300 },
        { field: "status", headerName: "Stav",
            headerClassName: 'header', width: 150 },
        { field: "name", headerName: "Odosielateľ",
            headerClassName: 'header', width: 200 },
        {
            field: "createDate",
            headerClassName: 'header',
            headerName: "Čas vytvorenia",
            width: 150,
            resizable: false,
            valueGetter: (value, row) => getDate(row.createDate),
        },
        {
            field: "sentDate",
            headerName: "Čas odoslania odpovede",
            headerClassName: 'header',
            width: 200,
            flex: 1,
            resizable: false,
            valueGetter: (value, row) => getDate(row.sentDate),
        },
    ];
    const getDate = (date: any) => {
        if (!date) return "-";

        const createdDate = new Date(date);
        return createdDate.toLocaleDateString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };
    const handleAnswerChange = (index: number, newAnswer: string) => {
        setSelectedFeedback((prevFeedback) => {
            // Check if prevFeedback is null
            if (prevFeedback === null) {
                return null; // or handle it in a way that makes sense for your application
            }

            // Create a copy of the feedbackQuestions array
            const updatedQuestions = [...prevFeedback.feedbackQuestions];

            // Update the answer for the specific question
            updatedQuestions[index] = {
                ...updatedQuestions[index],
                answer: newAnswer,
            };

            // Return the updated feedback ensuring it matches FeedbackRecipient type
            return {
                ...prevFeedback,
                feedbackQuestions: updatedQuestions,
            };
        });
    };

    const loadingIndicator = useLoading(loading);

    return (
        <Layout>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Spätná väzba
            </Typography>
            <Button
                variant="contained"
                color="primary"
                sx={{ marginBottom: 2, }}
                onClick={() => nav("/newFeedback")}
            >
                Vytvoriť požiadavku spätnej väzby
            </Button>
            <Stack direction="row" spacing={2} marginBottom={3} marginTop={5}>
                <Button
                    color="primary"
                    sx={{ marginBottom: 2 }}
                    onClick={() => GetDeliveredFeedback()}
                    variant={isSender ? "outlined" : "text"}
                >
                    Doručená spätná väzba
                </Button>
                <Button
                    color="primary"
                    sx={{ marginBottom: 2 }}
                    onClick={() => GetRequiredFeedback()}
                    variant={isSender ? "text" : "outlined"}
                >
                    Požiadavky spätnej väzby
                </Button>
            </Stack>
            <Box>
                
                <DataGrid
                    loading ={loading}
                    rows={feedbackList}
                    columns={columns}
                    getRowClassName={(params) => (params.row.isRead ? "" : "notReaded-row")}
                    sx={dataGridStyles}
                    onRowClick={(params) => handleOpenDialog(params.row)}
                    pagination
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                />
                
                {/* Feedback Details Dialog */}
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    PaperProps={{ sx: { width: "100%", maxWidth: "1200px" } }}
                >
                    <DialogTitle>
                        <Typography variant="h6" fontWeight="bold">
                            Odpoveď na požiadavku č. {selectedFeedback?.title}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        {selectedFeedback && (
                            <div>
                                <Typography padding={1}>Stav: {selectedFeedback.status}</Typography>
                                <Typography padding={1}>Odosielateľ: {selectedFeedback.name}</Typography>
                                <Typography padding={1}>
                                    Čas vytvorenia požiadavky: {getDate(selectedFeedback.createDate)}
                                </Typography>
                                <Typography padding={1}>
                                    Čas odoslania požiadavky: {getDate(selectedFeedback.sentDate)}
                                </Typography>
                                <List>
                                    {selectedFeedback.feedbackQuestions.map((q, index) => (
                                        <ListItem key={index}>
                                            <Stack direction="column" spacing={1} sx={{ width: "100%" }}>
                                                <ListItemText
                                                    primary={"Otázka č." + (index + 1)}
                                                    sx={{ padding: 0, color: "grey" }}
                                                />
                                                <ListItemText primary={q.text} />
                                                <TextField
                                                    label="Odpoveď"
                                                    multiline
                                                    rows={3}
                                                    variant="outlined"
                                                    value={q.answer || ""}
                                                    fullWidth
                                                    disabled={
                                                        isSender || selectedFeedback.status !== "Nevyplnený"
                                                    }
                                                    onChange={(e) =>
                                                        handleAnswerChange(index, e.target.value)
                                                    }
                                                />
                                            </Stack>
                                        </ListItem>
                                    ))}
                                </List>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        {!isSender && selectedFeedback?.status === "Nevyplnený" && (
                            <Stack direction="row" spacing={2} sx={{ padding: 0 }}>
                                <Button onClick={handleConfirm} color="info" variant="contained">
                                    Odoslať
                                </Button>
                                <Button onClick={handleDecline} color="primary" variant="contained">
                                    Zamietnuť
                                </Button>
                            </Stack>
                        )}
                        <Button onClick={handleCloseDialog} color="primary">
                            Zrušiť
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Notification Snackbar */}
                <Snackbar
                    open={!!notification}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    message={notification}
                />
            </Box>
        </Layout>
    );
};

export default ManageFeedback;
