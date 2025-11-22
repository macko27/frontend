import React, { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import { Box, Stack, TextField, Typography, Button, Alert, Autocomplete  } from "@mui/material";
import { z } from "zod";
import { useForm, SubmitHandler, Controller  } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import OrganizationResponse from "../../../types/responses/OrganizationResponse";
import api from "../../../app/api";
import useLoading from "../../../hooks/LoadingData";
import Organization from "../../../types/Organization";
import { useSnackbar } from "../../../hooks/SnackBarContext";

const schema = z.object({
    name: z.string().min(1, "Názov lokality je povinný!"),
    code: z.string().min(1, "Kód lokality je povinný!"),
    city: z.string().min(1, "Mesto je povinné!"),
    adress: z.string().min(1, "Adresa je povinná!"),
    zipCode: z.string().regex(/^\d+$/, "PSČ musí byť číselné!").min(1, "PSČ je povinné!"),
    organizations: z.array(z.string()).optional(),
    organizationsID: z.array(z.string()).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

// interface LocationResponse extends FormData {
//     organizations: string[]; // Add organizations field
// }

const UpdateLocation: React.FC = () => {
    const { state } = useLocation();
    const { locationId } = state || {};
    //const { id } = useParams<{ id: string }>();  // Získanie ID lokality z URL
    const nav = useNavigate();
    const [error, setError] = useState<string | null>(null);
    //const [loading, setLoading] = useState(true);
    const [locationData, setLocationData] = useState<FormData | null>(null);
    const [organizationOptions, setOrganizationOptions] = useState<{ id: string; label: string }[]>([]);
    const [ordanization, setOrganization] = useState<Organization | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { openSnackbar } = useSnackbar();
    const validOrganizations = Array.isArray(organizationOptions) ? organizationOptions : [];
    const [loaded, setLoaded] = useState(false);

    const { register: create,
        handleSubmit, 
        watch, 
        formState: { errors }, 
        setValue 
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });


    // Načítanie dát existujúcej lokality podľa ID
    useEffect(() => {
        if (locationId) {
          api.get(`/Location/${locationId}`)
            .then((res) => {
                const locationData = res.data;
                const organizationIDs = locationData.organizations || []; // Fallback to empty array
                setValue("organizationsID", organizationIDs);
                
                
                setValue("organizations", organizationIDs.map((id: string) => {
                    const matchedOrg = organizationOptions.find((opt) => opt.id === id);
                    return matchedOrg ? matchedOrg.label : id;
                })); // Map labels to IDs
                
                console.log("Loaded Organizations:", organizationIDs);
                
                setLocationData(locationData);
                // Nastavenie hodnôt do formulára
                setValue("name", locationData.name);
                setValue("code", locationData.code);
                setValue("city", locationData.city);
                setValue("adress", locationData.adress);
                setValue("zipCode", locationData.zipCode);
                setValue("latitude", locationData.latitude);
                setValue("longitude", locationData.longitude);
                //setValue("organizations", organizationss);
                
                //console.log(organizationss);
                console.log("Selected IDs:", watch("organizationsID"));
                console.log("Filtered Options:", organizationOptions.filter((option) =>
                    (watch("organizationsID") || []).includes(option.id)));
                setLoaded(true);
            })
            .catch((err) => {
              setError("Nastala chyba pri načítaní údajov o lokalite.");
              console.error("Error loading location data:", err);
            });
        }
      }, [locationId, setValue]);

     
     useEffect(() => {
        api.get("/Organization/UnarchivedOrganizations")
            .then((res) => {
                console.log("Organizations fetched:", res.data); 
                const formattedOptions = res.data.map((org: OrganizationResponse) => ({
                    id: org.id, 
                    label: org.name,
                }));
                setOrganizationOptions(formattedOptions);
            })
            .catch((err) => {
                setOrganizationOptions([]);
                console.error("Error loading organizations:", err);
            });
    }, []);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        await api.put(`/Location/Update/${locationId}`, {
            ...data, 
            orgazations: data.organizations || [],
        })
        .then(() => {
            console.log("Data successfully sent:", data);
            openSnackbar("Lokalita boli úspešne upravená", "success");
            nav("/manageLocations");
        })
        .catch((err) => {
            openSnackbar("Nastala chyba pri úprave lokality.", "error");
            //setError("Nastala chyba pri aktualizácii ltyokali.");
            console.error(err);
        });
    };

    const loadingIndicator = useLoading(!loaded);
    
    return (
        <Layout>
            <Box sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Aktualizovať lokalitu
                </Typography>
                { loadingIndicator ? loadingIndicator : (
                <Stack direction="column" gap={3} sx={{ width: "100%" }} component="form" onSubmit={handleSubmit(onSubmit)}>
                    <TextField label="Názov lokality" required fullWidth {...create("name")} error={!!errors.name} helperText={errors.name?.message}  slotProps={{ inputLabel: { shrink: true } }}/>
                    <TextField label="Kód lokality" required fullWidth {...create("code")} error={!!errors.code} helperText={errors.code?.message}  slotProps={{ inputLabel: { shrink: true } }}/>
                    <TextField label="Mesto" required fullWidth {...create("city")} error={!!errors.city} helperText={errors.city?.message} slotProps={{ inputLabel: { shrink: true } }}/>
                    <TextField label="Adresa" required fullWidth {...create("adress")} error={!!errors.adress} helperText={errors.adress?.message} />
                    <TextField label="PSČ" required fullWidth {...create("zipCode")} InputLabelProps={{ shrink: true }} error={!!errors.zipCode} helperText={errors.zipCode?.message}  slotProps={{ inputLabel: { shrink: true } }}/>
                    <TextField label="Zemepisná šírka" fullWidth type="number" {...create("latitude", { valueAsNumber: true })} error={!!errors.latitude} helperText={errors.latitude?.message}  slotProps={{ inputLabel: { shrink: true } }}/>
                    <TextField label="Zemepisná dĺžka" fullWidth type="number" {...create("longitude", { valueAsNumber: true })} error={!!errors.longitude} helperText={errors.longitude?.message}  slotProps={{ inputLabel: { shrink: true } }}/>
                    <Autocomplete
                        fullWidth
                        multiple
                        options={organizationOptions}
                        value={
                            (watch("organizationsID") || [])
                                .map((id) => organizationOptions.find((option) => option.id === id))
                                .filter((option): option is { id: string; label: string } => !!option) 
                        }
                        onChange={(e, value) => {
                            setValue("organizationsID", value.map((v) => v.id));
                            setValue("organizations", value.map((v) => v.label))

                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id} 
                        renderInput={(params) => <TextField {...params} label="Príslušnosť lokality k organizáciam" error={!!errors.organizations} helperText={errors.organizations?.message ?? ""} />}
                    />
                </Stack>
                )}
                <Stack direction="row" gap={3} sx={{margin: "10px 0 0 0"}}>
                        <Button type="submit" variant="contained" color="primary" disabled={!loaded}>
                            Uložiť
                        </Button>
                        <Button type="button" variant="contained" color="secondary" onClick={() => nav("/manageLocations")}>
                            Zrušiť
                        </Button>
                    </Stack>
            </Box>
        </Layout>
    );
};

export default UpdateLocation;

