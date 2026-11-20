"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import CryptoJS from "crypto-js";

const SECRET_KEY =
  process.env.NEXT_PUBLIC_SECRET_KEY || "logistics-secure-secret-key-2026";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface User {
  id: string | number;
  full_name: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;

  tier?: string;
  loyalty_points?: number;
  identity_verified?: boolean;
  identity_number?: string;
  identity_front_url?: string;
  identity_back_url?: string;
}

export interface DecodedTokenPayload {
  userId?: string | number;
  role?: string;
  email?: string;
  exp?: number; // Unix timestamp (giây)
  iat?: number;
}

// Hàm giải mã payload của JWT token (không verify chữ ký ở client)
export const decodeJwtPayload = (
  token: string | null,
): DecodedTokenPayload | null => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload) as DecodedTokenPayload;
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
};

// Hàm hỗ trợ mã hóa dữ liệu
export const encryptData = (data: any) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

// Hàm hỗ trợ giải mã dữ liệu
export const decryptData = (ciphertext: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedString ? JSON.parse(decryptedString) : null;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

// Giữ promise chung để nhiều request gọi cùng lúc chỉ refresh 1 lần
let ongoingRefreshPromise: Promise<string | null> | null = null;

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<DecodedTokenPayload | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);

  const saveToken = useCallback((newToken: string | null) => {
    if (newToken) {
      const encryptedToken = encryptData(newToken);
      if (encryptedToken) {
        localStorage.setItem("token", encryptedToken);
      }
      setToken(newToken);
      setDecodedToken(decodeJwtPayload(newToken));
    } else {
      localStorage.removeItem("token");
      setToken(null);
      setDecodedToken(null);
    }
  }, []);

  const clearLocalSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setDecodedToken(null);
    setUser(null);
  }, []);

  // Làm mới Access Token thông qua HttpOnly Refresh Token cookie
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (ongoingRefreshPromise) {
      return ongoingRefreshPromise;
    }

    ongoingRefreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        const freshToken = data?.accessToken || data?.token;

        if (!res.ok || !freshToken) {
          clearLocalSession();
          return null;
        }

        saveToken(freshToken);
        return freshToken;
      } catch (error) {
        console.error("Refresh token failed:", error);
        clearLocalSession();
        return null;
      } finally {
        ongoingRefreshPromise = null;
      }
    })();

    return ongoingRefreshPromise;
  }, [clearLocalSession, saveToken]);

  useEffect(() => {
    const initAuth = async () => {
      const encryptedToken = localStorage.getItem("token");
      const encryptedUser = localStorage.getItem("user");

      let decryptedUser: User | null = null;
      if (encryptedUser) {
        decryptedUser = decryptData(encryptedUser);
        if (decryptedUser) {
          setUser(decryptedUser);
        } else {
          localStorage.removeItem("user");
        }
      }

      let decryptedToken: string | null = null;
      if (encryptedToken) {
        decryptedToken = decryptData(encryptedToken);
      }

      if (decryptedToken) {
        const payload = decodeJwtPayload(decryptedToken);
        const nowInSec = Math.floor(Date.now() / 1000);
        const isExpired = !payload?.exp || payload.exp <= nowInSec;

        if (isExpired) {
          // Access token hết hạn -> thử âm thầm xin lại qua refresh cookie
          await refreshAccessToken();
        } else {
          setToken(decryptedToken);
          setDecodedToken(payload);
        }
      } else if (decryptedUser) {
        // Có user nhưng mất access token -> thử khôi phục phiên từ refresh cookie
        await refreshAccessToken();
      }

      setLoading(false);
    };

    initAuth();
  }, [refreshAccessToken]);

  const loginSession = useCallback(
    (newToken: string, userData: User) => {
      const encryptedUser = encryptData(userData);
      if (encryptedUser) {
        localStorage.setItem("user", encryptedUser);
      }

      saveToken(newToken);
      setUser(userData);
    },
    [saveToken],
  );

  const logoutSession = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      clearLocalSession();
      toast.success("Đăng xuất thành công !!!");
      setTimeout(() => {
        router.push("/auth");
      }, 1000);
    }
  }, [clearLocalSession, router]);

  const updateUser = useCallback((userData: User) => {
    const encryptedUser = encryptData(userData);
    if (encryptedUser) {
      localStorage.setItem("user", encryptedUser);
    }
    setUser(userData);
  }, []);

  return {
    user,
    token,
    decodedToken,
    isAuthenticated: !!token && !!user,
    loading,
    loginSession,
    logoutSession,
    updateUser,
    refreshAccessToken,
  };
}
