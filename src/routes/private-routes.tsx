import { Navigate } from "react-router-dom";
import { userLocalStoreKey } from "../hooks/use-user";
import type { ReactNode } from "react";
import Sidebar from "../components/sidebar";
import { AppContainer } from "../components/app-container";

type PrivateRoutesProps = {
    component: ReactNode;
}

export function PrivateRoutes({ component }: PrivateRoutesProps) {
    const userData = localStorage.getItem(userLocalStoreKey)

    if (!userData) {
        return <Navigate to="/" />
    }
    return (
        <>

            <AppContainer>
                <Sidebar />
                {component}
            </AppContainer>
        </>
    )
}
