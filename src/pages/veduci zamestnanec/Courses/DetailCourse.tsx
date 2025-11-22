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

const DetailCourse: React.FC = () => {

    return (
        <Layout>
            <Box sx={{ padding: 2 }}>
                <Typography variant="h4">Detail Course</Typography>
                <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
                    <Stack spacing={2}>
                        <Typography variant="h6">Course Name</Typography>
                        <Typography variant="body1">Description of the course.</Typography>
                        <Stack direction="row" spacing={1}>
                            <Chip label="Category" color="primary" />
                            <Chip label="Level" color="secondary" />
                        </Stack>
                    </Stack>
                </Paper>
            </Box>
        </Layout>
      );
    };
    
    export default DetailCourse;
    