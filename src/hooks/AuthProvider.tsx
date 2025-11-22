import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import StatusResponse from "../types/responses/StatusResponse";
import { AxiosError } from "axios";
import UserProfile from "../types/UserProfile";
import api from "../app/api";

type IAuthContext = {
    userProfile: UserProfile | undefined;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | undefined>>;
    setRefresh: React.Dispatch<boolean>;
    refresh: boolean
};

const init: IAuthContext = {
    userProfile: undefined,
    setUserProfile: () => {},
    setRefresh: () => {},
    refresh: false
};

const AuthContext = createContext<IAuthContext>(init);

export const AuthProvider = ({ children }: any) => {
    const [userProfile, setUserProfile] = useState<UserProfile>();
    const [refresh, setRefresh] = useState<boolean>(false);

    useEffect(() => {
        if (localStorage.getItem("accessToken")) {
            api.get("User/Me")
                .then((res) => {
                    var data: UserProfile = res.data;

                    setUserProfile(data);
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, [refresh]);

    return (
        <AuthContext.Provider value={{ userProfile, setUserProfile, setRefresh, refresh }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
