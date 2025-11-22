import React from "react";
import { Dialog, Box, CircularProgress } from "@mui/material";
import Layout from "../components/Layout";


function useLoadingModal(isLoading: boolean) {
    return (
        <Dialog open={isLoading} PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none' } }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress />
            </Box>
        </Dialog>
    );
}

export default useLoadingModal;