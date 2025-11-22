import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import UserProfile from "../../../types/UserProfile";
import api from "../../../app/api";
import { useNavigate } from "react-router-dom";
import { Review } from "../../../types/Review";
import { useAuth } from "../../../hooks/AuthProvider";
import { dataGridStyles } from "../../../styles/gridStyle";
import { useSnackbar } from "../../../hooks/SnackBarContext";

const ManageReviewsZam: React.FC = () => {
    const [reviewRows, setReviewRows] = useState<Review[]>([]);
    const [openReviewDetailsDialog, setOpenReviewDetailsDialog] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<SimplifiedEmployeeCard[]>([]);
    const [openEmployeesModal, setOpenEmployeesModal] = useState(false); 
    const { userProfile, setUserProfile, setRefresh, refresh } = useAuth();
    const [loading,setLoading] = useState(true);
    const {openSnackbar} = useSnackbar();

    const nav = useNavigate();

    useEffect(() => {
        setLoading(true);
        api.get("/Review/MyReviews")
            .then((res) => {
                console.log("API Response:", res.data);
                console.log("Received employee reviews:", res.data);
                setReviewRows(res.data);
            })
            .catch((err) => {
                setReviewRows([]);
                console.error(err);
            }).finally(() =>
                setLoading(false));
    }, []);


    const handleRowDoubleClick = (params: any) => {
        const id = params.row.id;
        console.log("Double-clicked ID:", id);
        if (!id) {
            console.warn("No ID found for this row:", params.row);
            return;
        }
        if (id) {
            nav('/updateReviewZam', { state: { id } });
        }
    };

    const handleRowClick = (params: any) => {
        const review = reviewRows.find(review => review.id === params.row.id);       
        setSelectedReview(review || null);
        setOpenReviewDetailsDialog(true);
    };


    type SimplifiedEmployeeCard = {
        id: string;
        name: string;
        surname: string;
    };
    
    const handleEmployeeClick = (employees: SimplifiedEmployeeCard[]) => {
        setSelectedEmployees(employees);
        setOpenEmployeesModal(true);
    };

    

    const getDate = (date: any) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };
    
    const columnsUser: GridColDef[] = [
        { field: "name", headerName: "Meno", width: 150 },
        { field: "surname", headerName: "Priezvisko", width: 150 },
    ];
    

    const columns: GridColDef<Review>[] = [
        { field: "reviewName", headerName: "Názov posudku",
            headerClassName: 'header', width: 250 },
        { field: "status", headerName: "Stav",
            headerClassName: 'header', width: 150 },
        {   
            field: "assignedEmployees", 
            headerName: "Priradený zamestnanec", 
            headerClassName: 'header',
            flex: 1,
            width: 200,
            renderCell: (params) => {
                const assignedEmployee : any= params.row.assignedEmployees || {}; 

                console.log("assignedEmployee:", assignedEmployee);

                if (!assignedEmployee || !assignedEmployee.name || !assignedEmployee.surname) {
                    return <Typography variant="body2">N/A</Typography>;
                }

                return (
                    <Typography variant="body2">
                        {`${assignedEmployee.name} ${assignedEmployee.surname}`}
                    </Typography>
                );
            }
        },
        { 
            field: "createdAt", 
            headerName: "Dátum a čas vytvorenia posudku", 
            headerClassName: 'header',
            width: 250, 
            //valueGetter: (params: { row: Review }) => getDate(params.row.createdAt) 
        },
        { 
            field: "completedAt", 
            headerName: "Dátum a čas dokončenia posudku", 
            headerClassName: 'header',
            width: 250, 
            //valueGetter: (params: { row: Review }) => getDate(params.row.completedAt) 
        },
    ];

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Zoznam posudkov
                </Typography>
                
                <Box sx={{ width: "100%" }}>
                    <DataGrid
                        loading={loading}
                        columns={columns}
                        rows={reviewRows}
                        onRowClick={handleRowClick}
                        onRowDoubleClick={handleRowDoubleClick}
                        pageSizeOptions={[5, 10, 25]}
                        pagination
                        getRowClassName={(params) => {
                            return params.row.completedAt === null ? "notReaded-row" : "";
                        }} 
                        sx={dataGridStyles}
                    />
                </Box>
            </Box>
        </Layout>
    );
};


export default ManageReviewsZam;
