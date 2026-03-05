import OrganizationHierarchy from "./OrganizationHierarchy";
import {
    AppBar,
    Avatar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    Toolbar,
    Tooltip,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { ReactNode, useState, useEffect, useContext } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../hooks/AuthProvider";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import HttpsIcon from "@mui/icons-material/Https";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import Roles from "../types/Roles";
import NotificationMenu from "./NotificationMenu";
import api from "../app/api";
import NotificationResponse from "../types/responses/NotificationResponse";
import { useNotifications } from "../hooks/NotificationContext";
import { SignalRContext } from "../hooks/signalRConnection";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 240;

interface LayoutProps {
    children?: ReactNode;
    fullWidth?: boolean;
}


const Layout: React.FC<LayoutProps> = ({ children, fullWidth = false }) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalComponent, setModalComponent] = useState<ReactNode>(null);
    const [modalLabel, setmodalLabel] = useState<string>("");

    const { userProfile } = useAuth();
    const nav = useNavigate();
    const { notifications, addNotification, setNotifications } = useNotifications();
    const { connection } = useContext(SignalRContext);
    const theme = useTheme()

    const toggleDrawer = () => {
        if (!isClosing) {
            setMobileOpen((prev) => !prev);
        }
    };

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    const handleOpenModal = (component: ReactNode, label: string) => {
        setModalComponent(component);
        setmodalLabel(label);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalComponent(null);
    };
    useEffect(() => {
        console.log("Fetching notifications");

        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("JWT token is missing!");
            return;
        }

        api.get<NotificationResponse[]>("Notification/Notifications")
            .then((response) => {
                console.log("📩 Fetched notifications:", response.data);
                setNotifications(response.data.slice(0, 10));
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const menuItems: { role: string; label: string; path: string | null; component: ReactNode | null }[] = [
        {
            role: Roles.Spravca,
            label: "Správa používateľov",
            path: "/manageUsers",
            component: null,
        },
        {
            role: Roles.Spravca,
            label: "Správa organizácie",
            path: "/manageOrganizations",
            component: null,
        },
        {
            role: Roles.Spravca,
            label: "Správa oddelení",
            path: "/manageDivisions",
            component: null,
        },
        {
            role: Roles.Spravca,
            label: "Správa lokalít",
            path: "/manageLocations",
            component: null,
        },
        {
            role: Roles.Spravca,
            label: "Správa pracovných pozícií",
            path: "/manageWorkPositions",
            component: null,
        },
        {
            role: Roles.Zamestnanec,
            label: "Spätná vázba",
            path: "/manageFeedback",
            component: null,
        },
        {
            role: Roles.Veduci,
            label: "Spätná vázba",
            path: "/manageFeedback",
            component: null,
        },
        {
            role: Roles.Veduci,
            label: "Ciele a rozvoj môjho tímu",
            path: "/manageGoals",
            component: null,
        },
        {
            role: Roles.Veduci,
            label: "Organizačná hierarchia",
            path: null,
            component: <OrganizationHierarchy />,
        },
        {
            role: Roles.PowerUser,
            label: "Organizačná hierarchia",
            path: null,
            component: <OrganizationHierarchy />,
        },
        {
            role: Roles.Spravca,
            label: "Organizačná hierarchia",
            path: null,
            component: <OrganizationHierarchy />,
        },
        {
            role: Roles.Zamestnanec,
            label: "Organizačná hierarchia",
            path: null,
            component: <OrganizationHierarchy />,
        },

        {
            role: Roles.Veduci,
            label: "Posudzovanie cieľov",
            path: "/manageReviews",
            component: null,
        },
        {
            role: Roles.Zamestnanec,
            label: "Moje ciele a rozvoj",
            path: "/employeeGoals",
            component: null,
        },
        {
            role: Roles.Zamestnanec,
            label: "Posudzovanie cieľov",
            path: "/myReviews",
            component: null,
        },
        {
            role: Roles.Zamestnanec,
            label: "Adaptácia zamestnancov",
            path: "/adaptation",
            component: null,
        },
        {
            role: Roles.Veduci,
            label: "Nástupníctvo zamestnancov",
            path: "/manageSuccessions",
            component: null,
        },

        {
            role: Roles.Veduci,
            label: "Adaptácia zamestnancov",
            path: "/manageAdaptations",
            component: null,
        },
        {
            role: Roles.Veduci,
            label: "Moje kurzy",
            path: "/manageCourses",
            component: null,
        },
        {
            role: Roles.Zamestnanec,
            label: "Moje kurzy",
            path: "/manageCourses",
            component: null,
        },
        {
            role: Roles.Zamestnanec,
            label: "Ankety",
            path: "/surveys",
            component: null,
        },
        {
            role: Roles.Veduci,
            label: "Ankety",
            path: "/surveys",
            component: null,
        }
    ];

    return (
        <Box sx={{ display: "flex" }}>
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: "#FFD6B8",
                    color: "black",
                }}
            >
                <Toolbar sx={{ display: "flex" }}>
                    <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <img
                        src="logoSiemensFull.png"
                        onClick={() => {
                            nav("/home");
                        }}
                        width="160px"
                        style={{ cursor: "pointer" }}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ flexGrow: 0 }} paddingRight={5}>
                        <NotificationMenu notificationList={notifications} />
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar
                                    src={
                                        userProfile?.profilePicLink ||
                                        "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"
                                    }
                                    sx={{ backgroundColor: "black" }}
                                />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                            keepMounted
                            transformOrigin={{ vertical: "top", horizontal: "left" }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                            slotProps={{
                                paper: {
                                    style: {
                                        backgroundColor: "#FFD6B8",
                                        color: "black",
                                    },
                                },
                            }}
                        >
                            <MenuList>
                                <ListItemText>{userProfile?.role}</ListItemText>
                                <ListItemText>
                                    {userProfile?.titleBefore} {userProfile?.firstName}{" "}
                                    {userProfile?.lastName} {userProfile?.titleAfter}
                                </ListItemText>

                                <MenuItem onClick={() => nav("/profile")}>
                                    <ListItemIcon sx={{ color: "black" }}>
                                        <PersonIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Profil</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => nav("/settings")}>
                                    <ListItemIcon sx={{ color: "black" }}>
                                        <SettingsIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Nastavenia</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => nav("/passwordChange")}>
                                    <ListItemIcon sx={{ color: "black" }}>
                                        <HttpsIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Zmena hesla</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon sx={{ color: "black" }}>
                                        <LogoutIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Odhlásiť</ListItemText>
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerClose}
                onTransitionEnd={handleDrawerTransitionEnd}
                ModalProps={{ keepMounted: true }}
                PaperProps={{
                    sx: {
                        backgroundColor: theme.palette.drawerBg,
                        //backgroundColor: "#FFD6B8",
                    },
                }}
                sx={{
                    "& .MuiDrawer-paper": {
                        boxSizing: "border-box",
                        width: drawerWidth,
                    },
                }}
            >
                <Toolbar />
                <List>
                    {menuItems.map(
                        (item) =>
                            (item.role ? userProfile?.role === item.role : true) && (
                                <ListItem
                                    key={item.label}
                                    disablePadding
                                    onClick={() =>
                                        item.path
                                            ? nav(item.path)
                                            : handleOpenModal(item.component, item.label)
                                    }
                                >
                                    <ListItemButton sx={{ color: "black" }}>
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                </ListItem>
                            )
                    )}
                </List>
            </Drawer>

            <Box
                component="main"
                sx={{
                    maxWidth: fullWidth ? "100%" : "80%",
                    flexGrow: 1,
                    p: 3,
                }}
            >
                <Toolbar />
                {children}
            </Box>

            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                PaperProps={{
                    sx: {
                        width: "90%", // Set width to 90% of the viewport
                        height: "90%", // Set height to 90% of the viewport
                        maxWidth: "none", // Remove max width restriction
                        maxHeight: "none", // Remove max height restriction
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: "bold" }}>{modalLabel}</DialogTitle>

                <DialogContent>{modalComponent}</DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Layout;
