import React, { createContext, useContext, ReactNode } from "react";
import { SnackbarProvider as NotistackSnackbarProvider, useSnackbar as useNotistackSnackbar, VariantType } from "notistack";

// Define the context type for your custom SnackbarProvider
interface SnackbarContextType {
    openSnackbar: (message: string, severity: 'success' | 'error') => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const CustomSnackbarProvider = ({ children }: { children: ReactNode }) => {
    const { enqueueSnackbar } = useNotistackSnackbar();

    const openSnackbar = (message: string, severity: 'success' | 'error') => {
        const variant: VariantType = severity === 'success' ? 'success' : 'error';
        enqueueSnackbar(message, { variant });

    };

    return (
        <SnackbarContext.Provider value={{ openSnackbar }}>
            {children}
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackbar must be used within a CustomSnackbarProvider");
    }
    return context;
};
