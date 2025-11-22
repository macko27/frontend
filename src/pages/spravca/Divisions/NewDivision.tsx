import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import {
    Autocomplete,
    Box,
    Stack,
    TextField,
    Typography,
    Button,
    Alert,
    AutocompleteChangeReason,
} from "@mui/material";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import api from "../../../app/api";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import OrganizationResponse from "../../../types/responses/OrganizationResponse";
import dayjs, { Dayjs } from "dayjs";
import { Department } from "../../../types/Department";
import UserProfile from "../../../types/UserProfile";
import { useSnackbar } from "../../../hooks/SnackBarContext";

const schema = z.object({
    name: z.string().min(1, "Názov oddelenia je povinný!"),
    code: z.string().min(1, "Kód oddelenia je povinný!"),
    superior: z.string().min(1, "Vedúci oddelenia je povinný!"),
    organization: z.string().min(1, "Príslušná organizácia je povinná!").default(""),
    parentDepartmentId: z.string().optional(),
    childDepartments: z.array(z.string()).optional(),
    created: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const NewDivision: React.FC = () => {
    const nav = useNavigate();
    const [userOptions, setUserOptions] = useState<{ id: string; label: string }[]>([]);
    const [organizationOptions, setOrganizationOptions] = useState<{ id: string; label: string }[]>([]);
    const [departmentOptions, setDepartmentOptions] = useState<{ id: string; label: string }[]>([]);
    const [error, setError] = useState<string>();
    const [selectedOrganization, setSelectedOrganization] = useState<string>();
    const [createdDate, setCreatedDate] = React.useState<Dayjs | null>(dayjs("2024-11-09"));
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

        //TODO: change api to call every nonsuperior user
        //api.get("/User/Users")
        api.get(`/Department/GetUsers?departmentId=${""}`)
            .then((res) => {
                const options = res.data.map((user: UserProfile) => ({
                    id: user.id,
                    label: user.firstName + " " + user.lastName + ", " + user.role,
                }));
                console.log("Options:", options);
                setUserOptions(options);
            })
            .catch((err) => {
                setUserOptions([]);
                console.error(err);
            });
    }, []);

    const fetchDepartmentsForOrganization = (organizationId: string) => {
        api.get(`/Department/DepartmentsByOrganization/${organizationId}`)
            .then((res) => {
                const options = res.data.map((dept: Department) => ({
                    id: dept.id,
                    label: dept.name,
                }));
                setDepartmentOptions(options);
            })
            .catch((err) => console.error(err));
    };

    const handleOrganizationChange = (
        event: React.SyntheticEvent,
        value: { id: string; label: string } | null
    ) => {
        const organizationId = value?.id || "";
        setSelectedOrganization(organizationId);
        setValue("organization", organizationId);
        if (organizationId) {
            fetchDepartmentsForOrganization(organizationId);
        } else {
            setDepartmentOptions([]);
        }
    };

    const handleDateChange = (newValue: Dayjs | null) => {
        setCreatedDate(newValue);
        console.log(newValue);
        const adjustedDate = newValue ? newValue.startOf("day") : null;
        console.log("tostring", adjustedDate?.toISOString());
        //setValue("created", adjustedDate ? adjustedDate.toISOString() : undefined);
        if (newValue) {
            const adjustedDate = newValue.startOf("day");
            const localDate = adjustedDate.toDate();
            const timezoneOffset = localDate.getTimezoneOffset();
            localDate.setMinutes(localDate.getMinutes() - timezoneOffset);
            const isoString = localDate.toISOString();
            setValue("created", isoString);
            console.log("Adjusted Date:", adjustedDate.format("YYYY-MM-DD"));
            console.log("Local Adjusted ISO String:", isoString);
        }
    };

    const onSubmit: SubmitHandler<FormData> = (data) => {
        api.post("/Department/Create", {
            ...data,
            childDepartments: data.childDepartments || [],
        })
            .then(() => {
                console.log("Data successfully sent:", data);
                openSnackbar("Oddelenie bola úspešne vytvorené", "success");
                nav("/manageDivisions");
            })
            .catch((err) => {
                //setError(err.response?.data);
                openSnackbar("Nastala chyba pri vytváraní oddelenia", "error");
                console.error(err);
            });
    };

    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Vytvoriť nové oddelenie
                </Typography>
                <Stack
                    direction="column"
                    gap={3}
                    sx={{ width: "100%" }}
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <TextField
                        label="Názov oddelenia"
                        required
                        fullWidth
                        {...create("name")}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                    <TextField
                        label="Kód oddelenia"
                        required
                        fullWidth
                        {...create("code")}
                        error={!!errors.code}
                        helperText={errors.code?.message}
                    />

                    <Autocomplete
                        fullWidth
                        options={userOptions}
                        onChange={(e, value) => setValue("superior", value?.id || "")}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                required
                                label="Vedúci oddelenia "
                                error={!!errors.superior}
                                helperText={errors.superior?.message ?? ""}
                            />
                        )}
                    />

                    <Autocomplete
                        fullWidth
                        options={organizationOptions}
                        onChange={handleOrganizationChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                required
                                label="Príslušná organizácia "
                                error={!!errors.organization}
                                helperText={errors.organization?.message ?? ""}
                            />
                        )}
                    />

                    <Autocomplete
                        fullWidth
                        options={departmentOptions}
                        onChange={(e, value) => setValue("parentDepartmentId", value?.id)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Nadradené oddelenie"
                                error={!!errors.parentDepartmentId}
                                helperText={errors.parentDepartmentId?.message ?? ""}
                            />
                        )}
                    />

                    <Autocomplete
                        fullWidth
                        multiple
                        options={departmentOptions}
                        onChange={(e, value) =>
                            setValue(
                                "childDepartments",
                                value.map((v) => v.id)
                            )
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Podradené oddelenia"
                                error={!!errors.childDepartments}
                                helperText={errors.childDepartments?.message ?? ""}
                            />
                        )}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Dátum vytvorenia oddelenia"
                            value={createdDate}
                            onChange={(newValue) => handleDateChange(newValue)}
                        />
                    </LocalizationProvider>
                    <Stack direction="row" gap={3}>
                        <Button type="submit" variant="contained" color="primary">
                            Pridať oddelenie
                        </Button>
                        <Button
                            type="button"
                            variant="contained"
                            color="secondary"
                            onClick={() => nav("/manageDivisions")}
                        >
                            Zrušiť
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Layout>
    );
};

export default NewDivision;
