import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Autocomplete, Box, Stack, TextField, Typography, Button, Alert } from "@mui/material";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import api from "../../../app/api";
import RoleResponse from "../../../types/responses/RoleResponse";
import { useSnackbar } from "../../../hooks/SnackBarContext";

// Define validation schema
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
                path: ["confirmPassword"], // Attach the error to the confirmPassword field
            });
        }
    });

type FormData = z.infer<typeof schema>;

const RegisterUser: React.FC = () => {
    const nav = useNavigate();
    const [roleOptions, setRoleOptions] = useState<{ id: string; label: string }[]>([]);
    const [error, setError] = useState<string>();
    const { openSnackbar } = useSnackbar();

    useEffect(() => {
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
    }, []);

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            role: "",
            name: "",
            surname: "",
            titleBefore: "",
            titleAfter: "",
        },
    });

    const password = watch("password"); // Watch password input

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
        api.post("/User/Register", data)
            .then((res) => {
                openSnackbar("Používateľ bol úspešne vytvorený", "success");
                nav(-1);
            })
            .catch((err) => {
                //setError(err.response?.data);
                openSnackbar("Nastala chyba pri vytváraní používateľa", "error");
                console.error(err);
            });
    };

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Vytvoriť nového používateľa
                </Typography>
                <Stack direction="column" gap={3} sx={{ width: "100%" }} component="form" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <Alert severity="error" variant="filled">
                            {error}
                        </Alert>
                    )}
                    <TextField label="Používateľské meno (e-mail)" required fullWidth {...register("email")} error={!!errors.email} helperText={errors.email?.message ?? ""} />
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
                        options={roleOptions} // Replace with actual roles
                        renderInput={(params) => <TextField {...params} required label="Používateľská rola" {...register("role")} error={!!errors.role} helperText={errors.role?.message ?? ""} />}
                    />
                    <TextField label="Meno" required fullWidth {...register("name")} error={!!errors.name} helperText={errors.name?.message ?? ""} />
                    <TextField label="Priezvisko" required fullWidth {...register("surname")} error={!!errors.surname} helperText={errors.surname?.message ?? ""} />
                    <TextField label="Tituly pred menom" fullWidth {...register("titleBefore")} />
                    <TextField label="Tituly za menom" fullWidth {...register("titleAfter")} />
                    <Stack direction="row" gap={3}>
                        <Button type="submit" variant="contained" color="primary">
                            Registrovať
                        </Button>
                        <Button type="button" variant="contained" color="secondary" onClick={() => nav(-1)}>
                            Zrušiť
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Layout>
    );
};

export default RegisterUser;
