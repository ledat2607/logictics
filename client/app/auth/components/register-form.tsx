"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Phone, User, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "CUSTOMER" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng ký thất bại!");

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Đăng ký tài khoản thành công!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Kết nối thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <div className="flex items-center gap-1 justify-between">
          <label className="block text-xs font-medium text-gray-700">
            Họ và tên
          </label>
          <span className="text-red-500">(*)</span>
        </div>
        <div className="relative mt-1">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            required
            placeholder="Nguyễn Văn A"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1 justify-between">
          <label className="block text-xs font-medium text-gray-700">
            Email
          </label>
          <span className="text-red-500">(*)</span>
        </div>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            required
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1 justify-between">
          <label className="block text-xs font-medium text-gray-700">
            Số điện thoại
          </label>
          <span className="text-red-500">(*)</span>
        </div>
        <div className="relative mt-1">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="tel"
            required
            placeholder="0987654321"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1 justify-between">
          <label className="block text-xs font-medium text-gray-700">
            Mật khẩu
          </label>
          <span className="text-red-500">(*)</span>
        </div>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 pl-9 pr-9 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (
          "Đang xử lý..."
        ) : (
          <>
            <UserPlus className="h-4 w-4" /> Tạo tài khoản
          </>
        )}
      </button>
    </form>
  );
}
