import { createContext, useContext, useState, type ReactNode } from "react";

interface Student {
  id: number;
  registrationNo: string;
  name: string | null;
  course: unknown;
  academicYear: unknown;
}

interface AuthContextType {
  student: Student | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, student: Student) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  const [student, setStudent] = useState<Student | null>(() => {
    const storedStudent = localStorage.getItem("student");

    if (!storedStudent) {
      return null;
    }

    try {
      return JSON.parse(storedStudent);
    } catch {
      return null;
    }
  });

  const login = (newToken: string, newStudent: Student) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("student", JSON.stringify(newStudent));

    setToken(newToken);
    setStudent(newStudent);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("student");

    setToken(null);
    setStudent(null);
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
