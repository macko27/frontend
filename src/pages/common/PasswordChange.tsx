import { Box, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";
import Layout from "../../components/Layout";
import api from "../../app/api";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../hooks/SnackBarContext"; // tvoje existujúce hook

const PasswordChange: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();

    const autofillSx = {
        width: "100%",
        "& .MuiOutlinedInput-root": {
            "& input:-webkit-autofill": {
                WebkitBoxShadow: (theme: any) =>
                    theme.palette.mode === "dark"
                        ? "0 0 0 1000px #333 inset"
                        : "0 0 0 1000px #fff inset",
                WebkitTextFillColor: (theme: any) => theme.palette.text.primary,
            },
        },
    };

    // Funkcia na validáciu hesla
    const validatePassword = (password: string) => {
        if (password.length < 13) return "Heslo musí mať minimálne 13 znakov!";
        if (!/[A-Z]/.test(password)) return "Heslo musí obsahovať aspoň jedno veľké písmeno!";
        if (!/[a-z]/.test(password)) return "Heslo musí obsahovať aspoň jedno malé písmeno!";
        if (!/[0-9]/.test(password)) return "Heslo musí obsahovať aspoň jednu číslicu!";
        if (!/[!@#$%^&*]/.test(password)) return "Heslo musí obsahovať aspoň jeden špeciálny znak (napr. !@#$%^&*)!";
        return "";
    };

    const handleSubmit = async () => {
        setPasswordError("");

        // Validácia hesla
        const error = validatePassword(newPassword);
        if (error) {
            setPasswordError(error);
            return;
        }

        // Kontrola zhody nového a potvrdeného hesla
        if (newPassword !== confirmPassword) {
            setPasswordError("Nové heslá sa nezhodujú!");
            return;
        }

        try {
            await api.post("/User/ChangePassword", {
                currentPassword,
                newPassword,
                confirmNewPassword: confirmPassword
            });

            openSnackbar("Heslo úspešne zmenené", "success");

            // Vyčisti formulár
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Presmerovanie na /home po 1s
            setTimeout(() => navigate("/home"), 1000);
        } catch (err: any) {
            openSnackbar(err.response?.data || "Chyba pri zmene hesla", "error");
        }
    };

    return (
        <Layout fullWidth={true}>
            <Box
                sx={{
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        width: 350
                    }}
                >
                    <Typography variant="h5" textAlign="center">
                        Zmena hesla
                    </Typography>

                    <TextField
                        label="Aktuálne heslo"
                        type="password"
                        value={currentPassword}
                        sx={autofillSx} 
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />

                    <TextField
                        label="Nové heslo"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        error={!!passwordError}
                        sx={autofillSx} 
                        helperText={passwordError}
                    />

                    <TextField
                        label="Potvrdiť nové heslo"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={!!passwordError}
                        sx={autofillSx} 
                        helperText={passwordError && "Nové heslá sa musia zhodovať s vyššie uvedenými pravidlami"}
                    />

                    <Button variant="contained" onClick={handleSubmit}>
                        Zmeniť heslo
                    </Button>
                </Box>
            </Box>
        </Layout>
    );
};

export default PasswordChange;