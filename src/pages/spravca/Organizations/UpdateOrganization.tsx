// UpdateOrganization.tsx
import React, { useEffect, useState } from 'react';
import Layout from "../../../components/Layout";
import { Autocomplete, Box, Stack, TextField, Typography, Button, Alert, CircularProgress } from "@mui/material";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../app/api";
import LoadingButton from '@mui/lab/LoadingButton';
import LocationResponse from "../../../types/responses/LocationResponse";
import { useSnackbar } from '../../../hooks/SnackBarContext';
import useLoading from '../../../hooks/LoadingData';
import { useLocation } from 'react-router-dom';

const schema = z.object({
    name: z.string().min(1, { message: "Názov musí byť vyplnený" }),
    code: z.string().min(1, { message: "Kód musí byť vyplnený" }),
    //location: z.string().min(1, { message: "Lokalizácia je povinná" }),
    created: z.string(),
});

type FormData = z.infer<typeof schema>;

const UpdateOrganization: React.FC = () => {
    const { state } = useLocation();
    const { id } = state || {};
    const nav = useNavigate();
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [organizationData, setOrganizationData] = useState<FormData | null>(null);
    //const [selectedLocation, setSelectedLocation] = useState<{ id: string; label: string } | null>(null);
    const { openSnackbar } = useSnackbar();
    
    const [loaded,setLoaded] = useState(false);

    const formattedCreateDate = organizationData
        ? new Date(organizationData.created).toLocaleString("sk-SK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false, // To use 24-hour format
        })
        : "";

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
    });
    
    const navigateBack = () => {
        console.log("Navigating back");
        nav("/manageOrganizations");
    };

    useEffect(() => {
        if (id) {
            api.get(`/Organization/${id}`)
                .then((res) => {
                    const organizationData = res.data;
                    setOrganizationData(organizationData);
                    setLoaded(true);
                    setValue("name", organizationData.name);
                    setValue("code", organizationData.code);
                    //setValue("location", organizationData.location.id);
                    setValue("created", organizationData.created);
                    //setSelectedLocation({ id: organizationData.location.id, label: organizationData.location.name });
                })
                .catch((err) => {
                    console.log("Nastala chyba pri načítaní údajov o organizácií.");
                    navigateBack()
                });
        }
    }, [id, setValue]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setLoading(true);
        await api.put(`/Organization/Update/${id}`, data)
            .then((res) => {
                openSnackbar("Organizácia bola úspešne upravená.", "success"); // Show success Snackbar
                nav("/manageOrganizations");
            })
            .catch((err) => {
                openSnackbar("Nastala chyba pri aktualizácii organizácie.", "error"); // Show error Snackbar
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const loadingIndicator = useLoading(!loaded);

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Upraviť organizáciu
                </Typography>
                { loadingIndicator ? loadingIndicator : (
                <Stack direction="column" gap={3} sx={{ width: "100%" }} component="form" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <Alert severity="error" variant="filled">
                            {error}
                        </Alert>
                    )}
                    <TextField label="Názov" required fullWidth {...register("name")} error={!!errors.name} helperText={errors.name?.message ?? ""} />
                    <TextField label="Kód" required fullWidth {...register("code")} error={!!errors.code} helperText={errors.code?.message ?? ""} />
                    <TextField
                        label="Dátum vytvorenia"
                        fullWidth
                        value={formattedCreateDate}
                        InputProps={{
                            readOnly: true,
                        }}
                    />
                </Stack>
                )}
                
                <Stack direction="row" sx={{margin: "10px 0 0 0" }} gap={3}>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            loading={loading}
                            loadingPosition="start"
                            disabled={!loaded}
                        >
                            Upraviť organizáciu
                        </LoadingButton>
                        <Button type="button" variant="contained" color="secondary" onClick={navigateBack}>
                            Zrušiť
                        </Button>
                    </Stack>
            </Box>
        </Layout>
    );
};

export default UpdateOrganization;
