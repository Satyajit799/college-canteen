import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

interface Admin {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AdminAuthContextType {
    admin: Admin | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (
        token: string,
        admin: Admin,
    ) => void;
    logout: () => void;
}

const AdminAuthContext =
    createContext<AdminAuthContextType | undefined>(
        undefined,
    );

export function AdminAuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("adminToken"),
    );

    const [admin, setAdmin] = useState<Admin | null>(() => {
        const storedAdmin =
            localStorage.getItem("adminData");

        return storedAdmin
            ? JSON.parse(storedAdmin)
            : null;
    });

    useEffect(() => {
        if (token) {
            localStorage.setItem("adminToken", token);
        } else {
            localStorage.removeItem("adminToken");
        }
    }, [token]);

    useEffect(() => {
        if (admin) {
            localStorage.setItem(
                "adminData",
                JSON.stringify(admin),
            );
        } else {
            localStorage.removeItem("adminData");
        }
    }, [admin]);

    const login = (
        newToken: string,
        newAdmin: Admin,
    ) => {
        setToken(newToken);
        setAdmin(newAdmin);
    };

    const logout = () => {
        setToken(null);
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                token,
                isAuthenticated: Boolean(token && admin),
                login,
                logout,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);

    if (!context) {
        throw new Error(
            "useAdminAuth must be used inside AdminAuthProvider",
        );
    }

    return context;
}