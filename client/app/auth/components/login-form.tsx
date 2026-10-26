"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Phone, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/user-auth";

export default function LoginForm() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {loginSession} = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const payload =
      loginMethod === "email"
        ? { email: formData.email, password: formData.password }
        : { account_identifier: formData.phone, password: formData.password };

    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại!");

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Đăng nhập thành công!");
      loginSession(data.token, data.user);
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Kết nối thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 🌟 SUB-TAB SWITCHER: Chọn giữa Email & Số điện thoại 🌟 */}
      <div className="flex border-b border-slate-200 text-xs font-medium text-slate-500">
        <button
          type="button"
          onClick={() => setLoginMethod("email")}
          className={`flex-1 pb-2.5 text-center transition-colors relative flex items-center justify-center gap-1.5 ${
            loginMethod === "email"
              ? "text-blue-600 font-semibold border-b-2 border-blue-600"
              : "hover:text-slate-800"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Qua Email</span>
        </button>

        <button
          type="button"
          onClick={() => setLoginMethod("phone")}
          className={`flex-1 pb-2.5 text-center transition-colors relative flex items-center justify-center gap-1.5 ${
            loginMethod === "phone"
              ? "text-blue-600 font-semibold border-b-2 border-blue-600"
              : "hover:text-slate-800"
          }`}
        >
          <Phone className="h-3.5 w-3.5" />
          <span>Qua Số điện thoại</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Ô Nhập tương ứng theo Tab */}
        {loginMethod === "email" ? (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="example@domain.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="0987654321"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {/* Ô Mật khẩu */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium text-slate-700">
              Mật khẩu
            </label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Tính năng Quên mật khẩu đang phát triển!");
              }}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
            >
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 pl-9 pr-10 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? (
            "Đang xử lý..."
          ) : (
            <>
              <LogIn className="h-4 w-4" /> Đăng nhập
            </>
          )}
        </button>
      </form>
    </div>
  );
}
