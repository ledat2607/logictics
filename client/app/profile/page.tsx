"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/user-auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProfileGeneralForm } from "@/components/user/profile/profile-form";

export default function ProfilePage() {
  const { user, token, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "general" | "kyc" | "addresses" | "order" | "bank" | "membership"
  >("general");
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user?.avatar || "");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
    });

    if (user.avatar) setPreviewUrl(user.avatar);
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const dataForm = new FormData();
      dataForm.append("full_name", values.full_name);
      dataForm.append("email", values.email);
      dataForm.append("phone", values.phone);

      if (selectedFile) dataForm.append("avatar", selectedFile);

      const res = await fetch(`${baseUrl}/api/users/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: dataForm,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cập nhật thất bại!");

      const updatedUser = {
        ...user,
        ...data.user,
        avatar: data.user.avatar_url || data.user.avatar,
      };

      if (token) {
        updateUser(updatedUser);
        window.dispatchEvent(new Event("auth-user-updated"));
      }
      toast.success("Cập nhật thông tin thành công!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80 min-h-125">
      {/* --- PHẦN CUSTOM AVATAR UPLOAD --- */}
      <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
        <div className="relative group">
          {/* Input ẩn để chọn file ảnh */}
          <input
            type="file"
            id="profile-avatar-input"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file)); 
              }
            }}
          />

          {/* Khung hiển thị ảnh đại diện */}
          <label
            htmlFor="profile-avatar-input"
            className="relative flex cursor-pointer items-center justify-center w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-md group-hover:border-blue-600 transition-all"
          >
            <img
              src={
                previewUrl ||
                user?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
              }
              alt="Avatar"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Lớp phủ mờ và icon Camera khi hover */}
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                className="w-5 h-5 text-white animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </label>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Ảnh đại diện
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cho phép định dạng PNG, JPG hoặc WEBP. Kích thước tối đa 2MB.
          </p>
          <label
            htmlFor="profile-avatar-input"
            className="inline-block mt-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-semibold cursor-pointer transition-colors border border-slate-200/80"
          >
            Tải ảnh lên mới
          </label>
        </div>
      </div>
      {activeTab === "general" && (
        <ProfileGeneralForm
          user={user}
          onSubmit={handleUpdateProfile}
          loading={loading}
        />
      )}
    </div>
  );
}
