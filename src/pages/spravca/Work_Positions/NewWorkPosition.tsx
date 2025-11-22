import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, MenuItem, Select, FormControl, InputLabel, Chip, Snackbar, Stack, Alert } from "@mui/material";
import api from "../../../app/api";
import { useNavigate } from "react-router-dom";
import Autocomplete from '@mui/material/Autocomplete';
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Layout from "../../../components/Layout";
import { useSnackbar } from "../../../hooks/SnackBarContext";

type Organization = { id: string; name: string };
type Level = string;
// Define validation schema
const schema = z
    .object({
        name: z.string().min(1, "Názov je poivnný!"),
        code:  z.string().min(1, "Kód je povinný!"),
        levels: z.array(z.string()),//.nonempty("Pracovná pozícia musí mať aspoň jedne level!"),
        organizationsID: z.array(z.string()).nonempty("Pracovná pozícia musí mať aspoň jednu organizáciu!")
    })
type FormData = z.infer<typeof schema>;

const NewWorkPosition: React.FC = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [error, setError] = useState<string>();
    const nav = useNavigate();
    const { openSnackbar } = useSnackbar();

    useEffect(() => {
        // Fetch organizations for the dropdown list
        api.get("/Organization/GetUnarchaved")
            .then((res) => setOrganizations(res.data))
            .catch((err) => console.error("Failed to load organizations", err));
    }, []);
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormData>({

        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            code: "",
            levels: [],
            organizationsID: []
        },
    });
    const onSubmit: SubmitHandler<FormData> = (data) => {
        console.log(data);
        api.post("/JobPosition/Create", data)
            .then((res) => {
                openSnackbar("Pozícia bola úspešne vytvorená", "success");
                nav(-1);
            })
            .catch((err) => {
                //setError(err.response?.data);
                openSnackbar("Nastala chyba pri vytváraní pozície", "error");
                console.error(err);
            });
    };

    const handleCancel = () => {
        nav(-1); // Navigate back to manage page on cancel
    };

    return (
        <Layout>
            <Box sx={{ padding: 3, maxWidth: 600, margin: "0 auto" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Vytvoriť novú pracovnú pozíciu
                </Typography>
                    <Stack direction="column" gap={3} sx={{ width: "100%" }} component="form" onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        label="Názov pozície"
                        required
                        fullWidth
                        {...register("name")}
                        error={!!errors.name} helperText={errors.name?.message ?? ""}
                        margin="normal"
                    />

                    <TextField
                        label="Kód pozície"
                        {...register("code")}
                        error={!!errors.code} helperText={errors.code?.message ?? ""}
                        required
                        fullWidth
                        margin="normal"
                    />

                    <InputLabel>Príslušnosť k organizácii</InputLabel>
                    <Controller
                        name="organizationsID"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                {...field}
                                multiple
                                id="organization-select"
                                options={organizations}
                                getOptionLabel={(option) => option.name}
                                value={organizations.filter((org) => field.value.includes(org.id))} // Filter by IDs to get the selected organizations
                                onChange={(event, newValue) => {
                                    // Update with an array of organization objects (not just IDs)
                                    field.onChange(newValue.map((org) => org.id)); // Sending just the IDs to the field
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={errors.organizationsID ? "Chyba: Vyberte organizáciu" : "Príslušnosť k organizácii"}
                                        error={!!errors.organizationsID}
                                        helperText={errors.organizationsID?.message ?? ""}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option.name} // Access name directly as it’s an Organization object now
                                            {...getTagProps({ index })}
                                        />
                                    ))
                                }
                            />
                        )}
                    />


                    <Controller
                        name="levels"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                {...field}
                                multiple
                                id="tags-filled"
                                options={levels}
                                freeSolo
                                onChange={(event, newValue) => field.onChange(newValue)}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option}
                                            {...getTagProps({ index })}
                                        />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        label="Level"
                                        placeholder="Add Level"
                                        error={!!errors.levels}
                                        helperText={errors.levels?.message ?? ""}
                                    />
                                )}
                            />
                        )}
                    />

                    <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                        <Button type="submit" variant="contained" color="primary">
                            Uložiť
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={handleCancel}>
                            Zrušiť
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Layout>
    );
};

export default NewWorkPosition;
