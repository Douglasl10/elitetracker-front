import { Navigate } from "react-router-dom";
import { userLocalStoreKey } from "../hooks/use-user";
import type { ReactNode } from "react";
import Sidebar from "../components/sidebar";
import { AppContainer } from "../components/app-container";

type PrivateRoutesProps = {
    component: ReactNode;
}

export function PrivateRoutes({ component }: PrivateRoutesProps) {
    const isBrowser = typeof window !== "undefined";
    const userData = isBrowser ? localStorage.getItem(userLocalStoreKey) : null;

    if (!userData) {
        return <Navigate to="/" />
    }

    return (
        <AppContainer>
            <Sidebar />
            {component}
        </AppContainer>
    );
}
