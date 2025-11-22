import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/common/LoginPage";
import { useAuth } from "../hooks/AuthProvider";
import ProtectedRoute from "../auth/ProtectedRoute";
import RequiresAuth from "../auth/RequiresAuth";
import HomePage from "../pages/common/HomePage";
import "./App.css";
import Roles from "../types/Roles";
import RegisterUser from "../pages/spravca/Users/RegisterUser";
import ManageUsers from "../pages/spravca/Users/ManageUsers";
import ChangeUser from "../pages/spravca/Users/ChangeUser";
import ManageOrganizations from "../pages/spravca/Organizations/ManageOrganizations";
import NewOrganization from "../pages/spravca/Organizations/NewOrganization";
import ManageDivisions from "../pages/spravca/Divisions/ManageDivisions";
import NewDivision from "../pages/spravca/Divisions/NewDivision";
import EditDivision from "../pages/spravca/Divisions/EditDivision";
import ManageLocations from "../pages/spravca/Locations/ManageLocations";
import NewLocation from "../pages/spravca/Locations/NewLocation";
import ManageWorkPositions from "../pages/spravca/Work_Positions/ManageWorkPositions";
import NewWorkPosition from "../pages/spravca/Work_Positions/NewWorkPosition";
import Profile from "../pages/common/Profile";
import Settings from "../pages/common/Settings";
import PasswordChange from "../pages/common/PasswordChange";
import EditWorkPosition from "../pages/spravca/Work_Positions/EditWorkPosition";
import UpdateOrganization from "../pages/spravca/Organizations/UpdateOrganization";
import { CustomSnackbarProvider } from "../hooks/SnackBarContext";
import UpdateLocation from "../pages/spravca/Locations/UpdateLocation";
import ManageFeedback from "../pages/zamestnanec/Feedback/ManageFeedback";
import NewFeedback from "../pages/zamestnanec/Feedback/NewFeedback";
import ManageGoals from "../pages/veduci zamestnanec/Goals/ManageGoals";
import NewGoal from "../pages/veduci zamestnanec/Goals/NewGoal";
import EditGoal from "../pages/veduci zamestnanec/Goals/EditGoal";
import { SnackbarProvider } from "notistack";
import EmployeeGoals from "../pages/zamestnanec/EmployeeGoals";
import ManageReviews from "../pages/veduci zamestnanec/Reviews/ManageReviews";
import NewReview from "../pages/veduci zamestnanec/Reviews/NewReview";
import { SignalRProvider } from "../hooks/signalRConnection";
import { NotificationProvider } from "../hooks/NotificationContext";
import ManageReviewsZam from "../pages/zamestnanec/Reviews/ManageReviewsZam";
import UpdateReview from "../pages/veduci zamestnanec/Reviews/UpdateReview";
import UpdateReviewZam from "../pages/zamestnanec/Reviews/UpdateReviewZam";
import ManageSuccessions from "../pages/veduci zamestnanec/Succession/ManageSuccessions";
import NewSuccession from "../pages/veduci zamestnanec/Succession/NewSuccession";
import NotificationsPage from "../pages/common/NotificationsPage";
import EditSuccession from "../pages/veduci zamestnanec/Succession/EditSuccession";
import ManageAdaptations from "../pages/veduci zamestnanec/Adaptation/ManageAdaptations";
import ManageCourses from "../pages/veduci zamestnanec/Courses/ManageCourses";
import CreateCourse from "../pages/veduci zamestnanec/Courses/CreateCourse";
import DetailCourse from "../pages/veduci zamestnanec/Courses/DetailCourse";
import NewAdaptation from "../pages/veduci zamestnanec/Adaptation/NewAdaptation";
import UpdateAdaptation from "../pages/veduci zamestnanec/Adaptation/UpdateAdaptation";
import MyAdaptation from "../pages/zamestnanec/MyAdaptation";

const App: React.FC = () => {
    const auth = useAuth();

    return (
        <>
            <SnackbarProvider maxSnack={3}>
                <CustomSnackbarProvider>
                <SignalRProvider>
                    <NotificationProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={localStorage.getItem("accessToken") ? <Navigate to={"/home"} /> : <LoginPage />} />

                            {/* Requires auth */}
                            <Route element={<RequiresAuth />}>
                                <Route path="/home" element={<HomePage />} />
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/passwordChange" element={<PasswordChange />} />
                                <Route path="/notifications" element={<NotificationsPage />} />
                                {/* Role protected routes */}
                                {/* Spravca */}
                                <Route element={<ProtectedRoute allowedRoles={[Roles.Spravca]} />}>
                                    <Route path="/manageUsers" element={<ManageUsers />} />
                                    <Route path="/registerUser" element={<RegisterUser />} />
                                    <Route path="/changeUser" element={<ChangeUser />} />

                                    <Route path="/manageOrganizations" element={<ManageOrganizations />} />
                                    <Route path="/newOrganization" element={<NewOrganization />} />
                                    <Route path="/updateOrganization" element={<UpdateOrganization />} />

                                    <Route path="/manageDivisions" element={<ManageDivisions />} />
                                    <Route path="/newDivision" element={<NewDivision />} />
                                    <Route path="/editDivision" element={<EditDivision />} />

                                    <Route path="/manageLocations" element={<ManageLocations />} />
                                    <Route path="/newLocation" element={<NewLocation />} />
                                    <Route path="/updateLocation" element={<UpdateLocation/>}/>

                                    <Route path="/manageWorkPositions" element={<ManageWorkPositions />} />
                                    <Route path="/newWorkPosition" element={<NewWorkPosition />} />
                                    <Route path="/editWorkPosition" element={<EditWorkPosition />} />
                                </Route>

                                <Route element={<ProtectedRoute allowedRoles={[Roles.Veduci, Roles.Zamestnanec]} />}>
                                    <Route path="/manageFeedback" element={<ManageFeedback />} />
                                    <Route path="/newFeedback" element={<NewFeedback />} />
                                    <Route path="/manageCourses" element={<ManageCourses/>} />
                                    <Route path="/detailCourse" element={<DetailCourse/>} />
                                </Route>

                                <Route element={<ProtectedRoute allowedRoles={[Roles.Veduci]}/>}>
                                    <Route path="/manageGoals" element={<ManageGoals />} />
                                    <Route path="/newGoal" element={<NewGoal />} />
                                    <Route path="/editGoal" element={<EditGoal />} />                       
                                    <Route path="/manageReviews" element={<ManageReviews/>} />
                                    <Route path="/newReview" element={<NewReview/>} />
                                    <Route path="/updateReview" element={<UpdateReview/>} />
                                    <Route path="/manageSuccessions" element={<ManageSuccessions/>} />
                                    <Route path="/newSuccession" element={<NewSuccession/>} />
                                    <Route path="/editSuccession" element={<EditSuccession/>} />
                                    <Route path="/createCourse" element={<CreateCourse/>} />
                                    <Route path="/manageAdaptations" element={<ManageAdaptations/>} />
                                    <Route path="/newAdaptation" element={<NewAdaptation/>} />
                                    <Route path="/updateAdaptation" element={<UpdateAdaptation/>} />
                                </Route>

                                <Route element={<ProtectedRoute allowedRoles={[Roles.Zamestnanec]}/>}>
                                    <Route path="/employeeGoals" element={<EmployeeGoals />} />    
                                    <Route path="/myReviews" element={<ManageReviewsZam/>}/>     
                                    <Route path="/updateReviewZam" element={<UpdateReviewZam/>} />
                                    <Route path="/adaptation" element={<MyAdaptation/>} />
                                </Route>
                            
                            </Route>

                            

                            {/* Default route */}
                            <Route path="*" element={<Navigate to={localStorage.getItem("accessToken") ? "/home" : "/login"} />} />
                        </Routes>
                    </BrowserRouter>
                    </NotificationProvider>
                    </SignalRProvider>
                </CustomSnackbarProvider>
            </SnackbarProvider>
        </> 
    );
};

export default App;
