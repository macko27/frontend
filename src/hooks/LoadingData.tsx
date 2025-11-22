import React from "react";
import { Box, CircularProgress } from "@mui/material";
import Layout from "../components/Layout";

function useLoading(isLoading: boolean) {
    if (isLoading) {
        return (
            <Box  sx={{ display: "flex", maxHeight: 400, justifyContent: "center", alignItems: "center"}}>
                <CircularProgress size={60}/>
            </Box>
        );
    }
    return null;
}

export default useLoading;