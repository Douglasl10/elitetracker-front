import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useState } from "react";
import api from "../services/api";

export type UserData = {
    id: string;
    name: string;
    avatarUrl: string;
    token: string;
}

type UserContextProps = {
    userData: UserData;
    getUserInfo: (githubCode: string) => Promise<void>;
    logout: () => Promise<void>;
}

type UserProviderProps = {
    children: ReactNode;
}


export const userLocalStoreKey = `${import.meta.env.VITE_LOCALSTORAGE_KEY}: userData`;

const UserContext = createContext({} as UserContextProps);

export function UserProvider({ children }: UserProviderProps) {
    const [userData, setUserData] = useState<UserData>({} as UserData);

    function putUserData(data: UserData) {
        setUserData(data)

        localStorage.setItem(userLocalStoreKey, JSON.stringify(data))
    }


    async function getUserInfo(githubCode: string) {

        const { data } = await api.get<UserData>('/auth/callback', {
            params: {
                code: githubCode
            }
        })
        putUserData(data)
    }

    async function loadUserData() {
        const localData = localStorage.getItem(userLocalStoreKey)
        if (localData) {
            putUserData(JSON.parse(localData) as UserData);
        }
    }

    async function logout() {
        setUserData({} as UserData);
        localStorage.removeItem(userLocalStoreKey);
    }

    useEffect(() => {
        loadUserData()
    }, [])

    return (
        <UserContext.Provider value={{ userData, getUserInfo, logout }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used with UserProvider')
    }
    return context;
}
