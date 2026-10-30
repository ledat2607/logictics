"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import CryptoJS from "crypto-js";

// 🔑 Khóa bí mật dùng để mã hóa/giải mã (Cậu có thể đổi chuỗi này thành bất kỳ ký tự nào khó đoán)
const SECRET_KEY =
  process.env.NEXT_PUBLIC_SECRET_KEY || "logistics-secure-secret-key-2026";

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
}

// Hàm hỗ trợ mã hóa dữ liệu
const encryptData = (data: any) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

// Hàm hỗ trợ giải mã dữ liệu
const decryptData = (ciphertext: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedString ? JSON.parse(decryptedString) : null;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const encryptedToken = localStorage.getItem("token");
    const encryptedUser = localStorage.getItem("user");

    if (encryptedToken) {
      const decryptedToken = decryptData(encryptedToken);
      if (decryptedToken) setToken(decryptedToken);
    }

    if (encryptedUser) {
      const decryptedUser = decryptData(encryptedUser);
      if (decryptedUser) {
        setUser(decryptedUser);
      } else {
        // Nếu giải mã thất bại (dữ liệu bị lỗi/chỉnh sửa bừa), xóa sạch
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const loginSession = useCallback((newToken: string, userData: User) => {
    // 🔒 Mã hóa trước khi lưu vào localStorage
    const encryptedToken = encryptData(newToken);
    const encryptedUser = encryptData(userData);

    if (encryptedToken && encryptedUser) {
      localStorage.setItem("token", encryptedToken);
      localStorage.setItem("user", encryptedUser);
    }

    setToken(newToken);
    setUser(userData);
  }, []);

  const logoutSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    toast.success("Đăng xuất thành công !!!");
    setTimeout(() => {
      router.push("/auth");
    }, 1000);
  }, [router]);

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    loginSession,
    logoutSession,
  };
}
