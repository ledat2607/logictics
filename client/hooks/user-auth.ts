import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface User {
  id: string | number;
  full_name: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const saveToken = localStorage.getItem("token");
    const saveUser = localStorage.getItem("user");

    if (saveToken) {
      setToken(saveToken);
    }
    if (saveUser) {
      try {
        setUser(JSON.parse(saveUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const loginSession = useCallback(
    (newToken: string, userData: User) => {
      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
    },
    [setToken, setUser],
  );

  const logoutSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.success("Đăng xuất thành công !!!");
    setTimeout(() => {
      router.push("/auth");
    }, 1000);
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    loginSession,
    logoutSession,
  };
}
