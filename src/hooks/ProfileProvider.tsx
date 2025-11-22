import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AxiosError } from "axios";
import api from "../app/api";
import { EmployeeCard} from "../types/EmployeeCard";
import { useAuth } from "./AuthProvider";

type IProfileContext = {
    employeeCard: EmployeeCard | null;
    setEmployeeCard: React.Dispatch<React.SetStateAction<EmployeeCard | null>>;

};

const init: IProfileContext = {
    employeeCard: null,
    setEmployeeCard: () => {},
};

const ProfileContext = createContext<IProfileContext>(init);

export const ProfileProvider = ({ children }: { children: any }) => {
    const [employeeCard, setEmployeeCard] = useState<EmployeeCard | null>(null);
    const { userProfile } = useAuth();

    const fetchEmployeeCard = (userId: string) => {
        api
            .get(`/Profile/ByUserId/${userId}`)
            .then((res) => {
                var data: EmployeeCard = res.data;  
                console.log("recieved:", res.data)       
                setEmployeeCard(data);            
                    
            })
            .catch((err: AxiosError) => {
                console.error("Error fetching employee card:", err);
            })
    };

    useEffect(() => {
        if (userProfile) {
            fetchEmployeeCard(userProfile.id);
        }
    }, [userProfile]); 

    

    return (
        <ProfileContext.Provider value={{ employeeCard, setEmployeeCard}}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    return useContext(ProfileContext);
};