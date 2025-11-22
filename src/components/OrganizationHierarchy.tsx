import React, { useEffect } from "react";
import { useState } from "react";
import { OrganizationChart } from "primereact/organizationchart";
import OrgNode from "../types/OrgHierarchy/OrgNode";
import OrgTree from "../types/OrgHierarchy/OrgTree";
import api from "../app/api";
import { useAuth } from "../hooks/AuthProvider";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    Stack,
    styled,
    Typography,
} from "@mui/material";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Person4Icon from "@mui/icons-material/Person4";
import "primereact/resources/themes/lara-light-cyan/theme.css";
const OrganizationHierarchy: React.FC = () => {
    const { userProfile, setUserProfile, setRefresh, refresh } = useAuth();
    const [userId, setUserId] = useState(userProfile?.id);
    const [hierarchy, setHierarchy] = useState<OrgTree | null>(null);
    const fetchData = async () => {
        console.log("User id:", userId);
        if (userId != "") {
            await api
                .get(`/OrgHierarchyShow/GetLevelByID?userId=${userId}`)
                .then((res) => {
                    console.log("API Response:", res.data); // Log the API response
                    const fetchedData: OrgTree = res.data;
                    setHierarchy(fetchedData);
                    console.log(fetchedData); // Log the fetched data
                })
                .catch((err) => {
                    console.error("API call failed:", err); // Log the error
                });
        } else {
            await api
                .get(`/OrgHierarchyShow/Get0LevelOrganization?userId=${userProfile?.id}`)
                .then((res) => {
                    console.log("API Response:", res.data); // Log the API response
                    const fetchedData: OrgTree = res.data;
                    setHierarchy(fetchedData);
                    console.log(fetchedData); // Log the fetched data
                })
                .catch((err) => {
                    console.error("API call failed:", err); // Log the error
                });
        }
    };

    const moveUp = async () => {
        console.log("UserID:", userId);
        await api
            .get(`/OrgHierarchyShow/MoveUp?userId=${userId}`)
            .then((res) => {
                console.log("API Response:", res.data); // Log the API response
                setUserId(res.data);
            })
            .catch((err) => {
                console.error("API call failed:", err); // Log the error
                setUserId("");
            });
    };

    useEffect(() => {
        fetchData();
    }, [refresh, userId]);

    useEffect(() => {
        console.log("Hierarchy use state: ", hierarchy);
        console.log("Hierarchy use state: ", hierarchy?.orgTree);
        const show = hierarchy !== null;
        console.log(show);
    }, [hierarchy]);

    const nodeTemplate = (node: OrgNode) => {
        return (
            <Box
                onClick={node.isSuperior ? () => setUserId(node.userId) : undefined}
                sx={{
                    minWidth: 100,
                    textAlign: "center",
                    border: "2px solid #000",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 3,
                    bgcolor: "white", // Change background color based on userId
                    position: "relative",
                    paddingBottom: 1,
                    paddingTop: 1,
                    cursor: node.isSuperior ? "pointer" : "default", // Pointer cursor only if clickable
                    "&:hover": node.isSuperior ? { bgcolor: "lightgray" } : {}, // Hover effect only if clickable
                }}
            >
                {(userId || (!userId && node.level == 1)) && (
                    <div>
                        {/* Profile Image */}
                        <Avatar
                            src={node.image}
                            alt="https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"
                            sx={{
                                width: 60,
                                height: 60,
                                margin: "0 auto",
                                marginTop: "0 auto",
                                marginBottom: 2,
                                border: "3px solid white",
                                boxShadow: 2,
                            }}
                        />
                    </div>
                )}

                {/* Name with Icon */}
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                    sx={{
                        bgcolor: node.level == 0 ? "primary.main" : "cyan", // Change background color based on userId
                        paddingY: 1,
                        fontWeight: "bold",
                        borderBottom: "1px solid #ddd",
                        paddingInline: 1,
                    }}
                >
                    {node.userId === userProfile?.id ? (
                        <Person4Icon fontSize="small" />
                    ) : node.isSuperior ? (
                        <ThumbUpIcon fontSize="small" />
                    ) : null}
                    <Typography fontWeight="bold">{node.name}</Typography>
                </Box>

                {/* Job Title */}
                <Typography variant="body2" sx={{ paddingX: 1, paddingTop: 1 }}>
                    {node.position}
                </Typography>

                {/* Location */}
                <Typography
                    variant="body2"
                    fontStyle="italic"
                    color="gray"
                    sx={{ paddingX: 1, paddingBottom: 1 }}
                >
                    {node.location}
                </Typography>
            </Box>
        );
    };

    return (
        <div>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom={9}>
                {/* Left-aligned Typography */}
                <Typography variant="h6" gutterBottom>
                    Názov oddelenia: {hierarchy?.name}({hierarchy?.code})
                </Typography>

                {/* Right-aligned Buttons */}
                <Box display="flex" alignItems="center" gap={1}>
                    {/* Show Level Button */}
                    <Button variant="contained" color="primary" component="div" onClick={() => setUserId("")}>
                        Zobraziť 1. úroveň
                    </Button>

                    {/* Search Icon Button */}
                    <IconButton color="primary" component="div" onClick={() => moveUp()}>
                        <ZoomOutIcon />
                    </IconButton>
                </Box>
            </Box>
            <div className="card">
                {hierarchy?.orgTree && (
                    <div>
                        <OrganizationChart value={hierarchy?.orgTree} nodeTemplate={nodeTemplate} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrganizationHierarchy;
