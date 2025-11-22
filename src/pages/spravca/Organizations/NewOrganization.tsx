import { Message } from "@mui/icons-material";
import { z } from "zod";
import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Autocomplete, Box, Stack, TextField, Typography, Button, Alert } from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import api from "../../../app/api";
import LocationResponse from "../../../types/responses/LocationResponse";
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from "../../../hooks/SnackBarContext";

const schema = z
    .object({
        name: z.string().min(1, {message: "Názov musí byť vyplnený"}),
        code: z.string().min(1,{message: "Kód musí byť vyplnený"}),
        //location: z.string().min(1,{message: "Lokalizácia je povinná"})
    }
    )
type FormData = z.infer<typeof schema>;


const NewOrganization: React.FC = () => {

    const nav = useNavigate();
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState(false);
    const { openSnackbar } = useSnackbar();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            code: ""
        },
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setLoading(true);
        await api.post("/Organization/Register", data)
            .then((res) => {
                openSnackbar("Organizácia bola úspešne vytvorená", "success");
                nav(-1);
            })
            .catch((err) => {
                setError(err.response?.data);
                openSnackbar("Nastala chyba pri vytváraní organizácie", "error");
                console.error(err);
            })
            .finally(() => {
                setLoading(false);
        });
    };

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Vytvoriť novú organizáciu
                </Typography>
                <Stack direction="column" gap={3} sx={{ width: "100%" }} component="form" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <Alert severity="error" variant="filled">
                            {error}
                        </Alert>
                    )}
                    <TextField label="Názov" required fullWidth {...register("name")} error={!!errors.name} helperText={errors.name?.message ?? ""}></TextField>
                    <TextField label="Kód" required fullWidth {...register("code")} error={!!errors.code} helperText={errors.code?.message ?? ""}></TextField>
                    <Stack direction="row" gap={3}>
                        <LoadingButton 
                            type="submit" 
                            variant="contained"
                            color="primary"
                            loading={loading}  
                            loadingPosition="start"
                        >
                            Pridať organizáciu
                        </LoadingButton>
                        <Button type="button" variant="contained" color="secondary" onClick={() => nav(-1)}>
                            Zrušiť
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Layout>
        
    );
}

export default NewOrganization