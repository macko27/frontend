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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../../../app/api";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import OrganizationResponse from "../../../types/responses/OrganizationResponse";
import dayjs, { Dayjs } from "dayjs";
import { Department } from "../../../types/Department";
import UserProfile from "../../../types/UserProfile";
import { useSnackbar } from "../../../hooks/SnackBarContext";
import useLoading from "../../../hooks/LoadingData";

const schema = z.object({
    name: z.string().min(1, "Názov oddelenia je povinný!"),
    code: z.string().min(1, "Kód oddelenia je povinný!"),
    superiorId: z.string().min(1, "Vedúci oddelenia je povinný!"),
    superiorName: z.string().min(1, "Vedúci oddelenia je povinný!"),
    organization: z.string().min(1, "Príslušná organizácia je povinná!").default(""),
    organizationName: z.string().min(1, "Príslušná organizácia je povinná!").default(""),
    parentDepartmentName: z.string().optional(),
    parentDepartmentId: z.string().optional(),
    childDepartmentsId: z.array(z.string()).optional(),
    childDepartments: z.array(z.string()).optional(),
    created: z.string(),
});

type FormData = z.infer<typeof schema>;

const EditDivision: React.FC = () => {
    const { state } = useLocation();
    const { departmentId } = state || {};
    //const { id } = useParams<{ id: string }>();
    const nav = useNavigate();
    const [userOptions, setUserOptions] = useState<{ id: string; label: string }[]>([]);
    const [organizationOptions, setOrganizationOptions] = useState<{ id: string; label: string }[]>([]);
    const [departmentOptions, setDepartmentOptions] = useState<{ id: string; label: string }[]>([]);
    const [error, setError] = useState<string>();
    const [selectedOrganization, setSelectedOrganization] = useState<string>();
    const [createdDate, setCreatedDate] = React.useState<Dayjs | null>(dayjs("2024-11-09"));
    const [department, setDepartment] = useState<Department | null>(null);
    const { openSnackbar } = useSnackbar();
    const {
        register: create,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const [loaded,setLoaded] = useState(false);

    useEffect(() => {
        api.get(`/Department/${departmentId}`)
            .then((res) => {
                console.log("prijate data:", res.data);
                const departmentData = res.data;
                const childDepartments = departmentData.childDepartments;
                setDepartment({
                    ...departmentData,
                    childDepartments,
                });

                setValue("name", departmentData.name);
                setValue("code", departmentData.code);
                setValue("superiorId", departmentData.superiorId);
                setValue("superiorName", departmentData.superiorName);
                setValue("organization", departmentData.organizationId || "");
                setValue("organizationName", departmentData.organizationName || "");

                if (departmentData.organizationId) {
                    fetchDepartmentsForOrganization(departmentData.organizationId);
                }

                setValue("parentDepartmentId", departmentData.parentDepartmentId || "");
                setValue("parentDepartmentName", departmentData.parentDepartmentName || "");
                setValue("childDepartments", childDepartments);
                setCreatedDate(dayjs(departmentData.created));
                setLoaded(true);
                if (dayjs(departmentData.created)) {
                    const adjustedDate = dayjs(departmentData.created).startOf("day").format("YYYY-MM-DDTHH:mm:ss");
                    setValue("created", adjustedDate);
                }
            })
            .catch((err) => {
                console.error("Error loading department:", err);
            });
    }, [departmentId, setValue]);

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
        //TODO: change api call
        //api.get("/User/Users")
        api.get(`/Department/GetUsers?departmentId=${departmentId}`)
            .then((res) => {
                const options = res.data.map((user: UserProfile) => ({
                    id: user.id,
                    label: user.firstName + " " + user.lastName + ", " + user.role,
                }));
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
                const options = res.data
                    .filter((dept: Department) => dept.id !== departmentId)
                    .map((dept: Department) => ({
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
        const organizationName = value?.label || "";
        const organizationId = value?.id || "";
        setSelectedOrganization(organizationName);
        setValue("organization", value?.id || "");
        setValue("organizationName", value?.label || "");
        if (organizationId) {
            fetchDepartmentsForOrganization(organizationId);
        } else {
            setDepartmentOptions([]);
        }
    };

    const handleDateChange = (newValue: Dayjs | null, context: any) => {
        setCreatedDate(newValue);
        if (newValue) {
            const adjustedDate = newValue.startOf("day");
            const localDate = adjustedDate.toDate();
            const timezoneOffset = localDate.getTimezoneOffset();
            localDate.setMinutes(localDate.getMinutes() - timezoneOffset);
            const isoString = localDate.toISOString();
            setValue("created", isoString);
        }
    };

    const onSubmit: SubmitHandler<FormData> = (data) => {
        api.put(`/Department/Edit/${departmentId}`, {
            ...data,
            created: data.created,
            childDepartments: data.childDepartments || [],
        })
            .then(() => {
                console.log("Data successfully sent:", data);
                openSnackbar("Oddelenie boli úspešne upravené", "success");
                nav("/manageDivisions");
            })
            .catch((err) => {
                console.log("Data successfully sent:", data);
                setError(err.response?.data);
                openSnackbar("Nastala chyba pri úprave oddelenia", "error");
                console.error(err);
            });
    };

    const loadingIndicator = useLoading(!loaded);

    return (
        <Layout>
            <Box sx={{ padding: 3, flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Upraviť oddelenie
                </Typography>

                {loadingIndicator ? loadingIndicator : (

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
                        value={watch("name")}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        label="Kód oddelenia"
                        required
                        fullWidth
                        {...create("code")}
                        value={watch("code")}
                        error={!!errors.code}
                        helperText={errors.code?.message}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Autocomplete
                        fullWidth
                        options={userOptions}
                        value={userOptions.find((opt) => opt.label === watch("superiorName")) || null}
                        onChange={(e, value) => {
                            setValue("superiorId", value?.id || "");
                            setValue("superiorName", value?.label || "");
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                required
                                label="Vedúci oddelenia "
                                error={!!errors.superiorId}
                                helperText={errors.superiorId?.message ?? ""}
                            />
                        )}
                    />

                    <Autocomplete
                        fullWidth
                        options={organizationOptions}
                        //
                        value={
                            organizationOptions.find((opt) => opt.label === watch("organizationName")) || null
                        }
                        onChange={handleOrganizationChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Príslušná organizácia *"
                                error={!!errors.organization}
                                helperText={errors.organization?.message ?? ""}
                            />
                        )}
                    />

                    <Autocomplete
                        fullWidth
                        options={departmentOptions}
                        value={
                            departmentOptions.find((opt) => opt.label === watch("parentDepartmentName")) ||
                            null
                        }
                        onChange={(e, value) => {
                            setValue("parentDepartmentId", value?.id);
                            setValue("parentDepartmentName", value?.label || "");
                        }}
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
                        value={
                            watch("childDepartments")?.map((id: string) => ({
                                id,
                                label: departmentOptions.find((option) => option.id === id)?.label || id,
                            })) || []
                        }
                        onChange={(e, value) => {
                            setValue(
                                "childDepartmentsId",
                                value.map((v) => v.id)
                            );
                            setValue(
                                "childDepartments",
                                value.map((v) => v.label)
                            );
                        }}
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
                            onChange={(newValue, context) => {
                                handleDateChange(newValue, context);
                            }}
                        />
                    </LocalizationProvider>
                </Stack>
            )}
            <Stack direction="row" sx={{ margin: "10px 0 0 0" }} gap={3}>
                        <Button type="submit" variant="contained" color="primary" disabled={!loaded}>
                            Uložiť oddelenie
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
            </Box>
        </Layout>
    );
};

export default EditDivision;
