import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Box, Stack, TextField, Typography, Button, Alert } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../app/api";
import RoleResponse from "../../../types/responses/RoleResponse";
import useLoading from "../../../hooks/LoadingData";

const schema = z
    .object({
        email: z.string().email("Neplatný formát emailu!").min(1, "Email je povinný!"),
        password: z
            .string()
            .min(13, { message: "Heslo musí mať minimálne 13 znakov!" })
            .regex(/[A-Z]/, { message: "Heslo musí obsahovať aspoň jedno veľké písmeno (A-Z)!" })
            .regex(/[a-z]/, { message: "Heslo musí obsahovať aspoň jedno malé písmeno (a-z)!" })
            .regex(/[0-9]/, { message: "Heslo musí obsahovať aspoň jednu číslicu (0-9)!" })
            .regex(/[!@#$%^&*]/, { message: "Heslo musí obsahovať aspoň jeden špeciálny znak (napr. !@#$%^&*)!" }),
        confirmPassword: z.string().min(1, "Potvrdenie hesla je povinné!"),
        role: z.string().min(1, "Rola je povinná!"),
        name: z.string().min(1, "Meno je povinné!"),
        surname: z.string().min(1, "Priezvisko je povinné!"),
        titleBefore: z.string().optional(),
        titleAfter: z.string().optional(),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
            ctx.addIssue({
                code: "custom",
                message: "Heslá sa musia zhodovať!",
                path: ["confirmPassword"],
            });
        }
    });
type FormData = z.infer<typeof schema>;

const ChangeUser: React.FC = () => {
    const { state } = useLocation();
    const email = state.id;
    const nav = useNavigate();
    const [roleOptions, setRoleOptions] = useState<{ id: string; label: string }[]>([]);
    const [error, setError] = useState<string>();
    const [userData, setUserData] = useState<string | null>(null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const [loaded,setLoaded] = useState(false);

    useEffect(() => {
        // Fetch roles for the role dropdown
        console.log(state);
        console.log(email);
        api.get("/Role/Roles")
            .then((res) => {
                const options = res.data.map((role: RoleResponse) => ({
                    id: role.id,
                    label: role.name,
                }));
                setRoleOptions(options);
            })
            .catch((err) => {
                setRoleOptions([]);
                console.error(err);
            });
        
        // Fetch user data to prefill the form
        console.log("Email: " + email);
        if (email) {
            api.get(`/User/GetUser?email=${email}`)
                .then((res) => {
                    const userData = res.data;
                    console.log(userData);
                    // Prefill form fields with user data
                    setValue("email", userData.email);
                    setValue("role", userData.role);
                    setValue("name", userData.name);
                    setValue("surname", userData.surname);
                    setValue("titleBefore", userData.titleBefore);
                    setValue("titleAfter", userData.titleAfter);
                    setUserData(userData);
                    setLoaded(true);
                })
                .catch((err) => {
                    console.error("Failed to fetch user data:", err);
                    setError("Nepodarilo sa načítať údaje používateľa.");
                });
        }
    }, []);

    const password = watch("password");

    const getPasswordStrength = (password: string) => {
        if (password.length < 13) return "Slabá";
        let strength = 0;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength === 4 ? "Silná" : strength === 3 ? "Stredná" : "Slabá";
    };

    const passwordStrength = getPasswordStrength(password || "");

    const onSubmit: SubmitHandler<FormData> = (data) => {
        console.log(data);
        api.post("/User/Update", data)
            .then(() => {
                nav(-1);
            })
            .catch((err) => {
                setError(err.response?.data);
                console.error(err);
            });
    };


    const loadingIndicator = useLoading(!loaded);

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Editácia používateľa
                </Typography>
                { loadingIndicator ?  loadingIndicator : (
                <Stack direction="column" gap={3} sx={{ width: "100%" }} component="form" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <Alert severity="error" variant="filled">
                            {error}
                        </Alert>
                    )}
                    <TextField label="Používateľské meno (e-mail)" required fullWidth slotProps={{ inputLabel: { shrink: true } }}
                         {...register("email")} error={!!errors.email} helperText={errors.email?.message ?? ""} />
                    <TextField label="Heslo" type="password" required fullWidth {...register("password")} error={!!errors.password} helperText={errors.password?.message ?? ""} />
                    <Typography variant="body2" color={passwordStrength === "Silná" ? "green" : passwordStrength === "Stredná" ? "orange" : "red"}>
                        {`Sila hesla je: ${passwordStrength}`}
                    </Typography>
                    <TextField
                        label="Potvrdenie hesla"
                        type="password"
                        required
                        fullWidth
                        {...register("confirmPassword")}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message ?? ""}
                    />
                    <Autocomplete
                        fullWidth
                        disablePortal
                        options={roleOptions}
                        value={roleOptions.find(option => option.label === watch("role")) || null}
                        onChange={(e, value) => setValue("role", value?.label || "" )}
                        renderInput={(params) => <TextField {...params} required label="Používateľská rola" {...register("role")}  error={!!errors.role} helperText={errors.role?.message ?? ""} />}
                    />
                    <TextField label="Meno" required fullWidth slotProps={{ inputLabel: { shrink: true } }}
                        {...register("name")} value={watch("name")} error={!!errors.name} helperText={errors.name?.message ?? ""} />
                    <TextField label="Priezvisko" required fullWidth slotProps={{ inputLabel: { shrink: true } }}
                        {...register("surname")} value={watch("surname")} error={!!errors.surname} helperText={errors.surname?.message ?? ""} />
                    <TextField label="Tituly pred menom" fullWidth slotProps={{ inputLabel: { shrink: true } }}
                        {...register("titleBefore")} value={watch("titleBefore")}/>
                    <TextField label="Tituly za menom" fullWidth slotProps={{ inputLabel: { shrink: true } }}
                        {...register("titleAfter")} value={watch("titleAfter")}/>
                    
                </Stack>
                )}
                <Stack direction="row" gap={3} sx={{margin:"10px 0 0 0"}}>
                        <Button type="submit" variant="contained" color="primary" disabled={!loaded}>
                            Uložiť
                        </Button>
                        <Button type="button" variant="contained" color="secondary" onClick={() => nav(-1)}>
                            Zrušiť
                        </Button>
                    </Stack>
            </Box>
        </Layout>
    );
};

export default ChangeUser;
