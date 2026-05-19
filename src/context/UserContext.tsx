"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

type User = {
    id: string;
    name: string;
    username: string;
    email?: string;
    avatar?: string;
    bio?: string;
    followers?: number;
    following?: number;
};

type UserContextType = {
    user: User | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    refreshUser: async () => {},
});

export function UserProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);

    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await fetch("/api/auth/me", {
                credentials: "include",
            });

            if (!response.ok) {
                setUser(null);
                return;
            }

            const data = await response.json();

            setUser(data.user);
        } catch (error) {
            console.log(error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <UserContext.Provider
            value={{
                user,
                loading,
                refreshUser: fetchUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);