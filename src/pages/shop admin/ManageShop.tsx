import { Box, TextField, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../app/api";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../hooks/SnackBarContext";
import ShopHeader from "./ShopHeader";

const ManageShop: React.FC = () => {
    const [pointsBalance, setPointsBalance] = useState<number>(0);
    const [creator, setCreator] = useState<any>(null);
    const { openSnackbar } = useSnackbar();

    useEffect(() => {
    api.get(`/EmployeeCard/GetEmployeeCardLoggedIn/`)
        .then(res => setCreator(res.data));
    }, []);

    useEffect(() => {
        if (!creator?.employeeId) return;
        api.get(`/Recognition/GetPointsBalance/${creator?.employeeId}`)
            .then(res => setPointsBalance(res.data))
            .catch(() => openSnackbar('Nepodarilo sa načítať body', 'error'));
    }, [creator]);
    
    return (
        <Layout fullWidth={true}>
        <Box sx={{ p: 3 }}>
            
            <ShopHeader points={pointsBalance} />

            <Typography variant="h4" mt={3}>
                Správa obchodu
            </Typography>

        </Box>
        </Layout>
  );
};

export default ManageShop;