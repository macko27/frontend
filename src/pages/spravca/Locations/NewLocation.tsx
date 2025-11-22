import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Autocomplete, Box, Stack, TextField, Typography, Button, Alert } from "@mui/material";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import api from "../../../app/api";
import OrganizationResponse from "../../../types/responses/OrganizationResponse";
import { Message } from "@mui/icons-material";
import { useSnackbar } from "../../../hooks/SnackBarContext";

const schema = z.object({
    name: z.string().min(1, "Názov lokality je povinný!"),
    code: z.string().min(1, "Kód lokality je povinný!"),
    organizations: z.array(z.string()).optional(),
    adress: z.string().min(1, "Adresa je povinná!"),
    city: z.string().min(1, "Mesto je povinné!"),
    zipCode: z.string().regex(/^\d+$/, "PSČ musí byť číselné!").min(1, "PSČ je povinné!"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

type FormData = z.infer<typeof schema>;


const NewLocation: React.FC = () => {
    const nav = useNavigate();
    const [organizationOptions, setOrganizationOptions] = useState<{ id: string; label: string }[]>([]);
    const [error, setError] = useState<string>();
    const { openSnackbar } = useSnackbar();
    const {
        register: create,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });


    useEffect(() => {
        api.get("/Organization/UnarchivedOrganizations")
            .then((res) => {
                const options = res.data.map((org: OrganizationResponse) => ({
                    id: org.id,
                    label: org.name,
                }));
                setOrganizationOptions(options);
            })
            .catch((err) => {
                setOrganizationOptions([]);
                console.error(err);
            });

    }, []);

    

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        
       await api.post("/Location/Create", {...data,
        organizations: data.organizations || [],
       })
            .then((res) => {
                openSnackbar("Lokalita bola úspešne vytvorená", "success");
                console.log("res:", res)
                nav('/manageLocations');
            })
            .catch((err) => {
                openSnackbar("Nastala chyba pri vytváraní lokality", "error");
                //setError(err.response.data.title);
                console.error(err);
            });
    };

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Vytvoriť novú lokalitu
                </Typography>
                <Stack direction="column" gap={3} sx={{ width: "100%" }} component="form" onSubmit={handleSubmit(onSubmit)}>
                    
                    <TextField label="Názov lokality" required fullWidth {...create("name")} error={!!errors.name} helperText={errors.name?.message} />
                    <TextField label="Kód lokality" required fullWidth {...create("code")} error={!!errors.code} helperText={errors.code?.message} />
                    <TextField label="Mesto" required fullWidth {...create("city")} error={!!errors.city} helperText={errors.city?.message} />
                    <TextField label="Adresa" required fullWidth {...create("adress")} error={!!errors.adress} helperText={errors.adress?.message} />
                    <TextField label="PSČ" required fullWidth {...create("zipCode")} error={!!errors.zipCode} helperText={errors.zipCode?.message} />
                    <Autocomplete
                        fullWidth
                        multiple
                        options={organizationOptions}
                        onChange={(e, value) => setValue("organizations", value.map((v) => v.id))}
                        renderInput={(params) => <TextField {...params} label="Príslušnosť lokality k organizácii" error={!!errors.organizations} helperText={errors.organizations?.message ?? ""} />}
                    
                    />
                    <TextField label="Zemepisná šírka" fullWidth type="number" {...create("latitude", { valueAsNumber: true })} error={!!errors.latitude} helperText={errors.latitude?.message}  />
                    <TextField label="Zemepisná dĺžka" fullWidth type="number"{...create("longitude", { valueAsNumber: true })} error={!!errors.longitude} helperText={errors.longitude?.message} />
                    <Stack direction="row" gap={3}>
                        <Button type="submit" variant="contained" color="primary">
                            Uložiť
                        </Button>
                        <Button type="button" variant="contained" color="secondary" onClick={() => nav('/manageLocations')}>
                            Zrušiť
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Layout>
    );
}

export default NewLocation