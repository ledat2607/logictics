"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/user-auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Save,
  Loader2,
  Camera,
  CreditCard,
  Award,
  Plus,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Wallet,
  Shield,
  Ship,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { ProfileGeneralForm } from "@/components/user/profile/profile-form";

export default function ProfilePage() {
  const { user, token, loading: authLoading, loginSession } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "general" | "kyc" | "bank" | "membership"
  >("general");
  const [loading, setLoading] = useState(false);

  // States thông tin cá nhân
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  // States Định danh KYC
  const [identityNumber, setIdentityNumber] = useState("");

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const dataForm = new FormData();
      dataForm.append("full_name", formData.full_name);
      dataForm.append("email", formData.email);
      dataForm.append("phone", formData.phone);

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
        ...formData,
        avatar: data.avatar || user?.avatar,
      };

      //if (token) loginSession(token, updatedUser);
      toast.success("Cập nhật thông tin thành công!");
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
    <div className="min-h-screen bg-slate-900/5 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:bg-blue-700 hover:text-white transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />{" "}
            <p className="hidden xl:block">Quay lại trang chủ</p>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Hệ thống quản lý Logistics</span>
            <span>/</span>
            <span className="text-blue-600 font-semibold">
              Tài khoản cá nhân
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-r from-blue-600 to-indigo-600"></div>

              <div className="relative pt-4 flex flex-col items-center">
                <input
                  type="file"
                  id="avatar-upload"
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
                <label
                  htmlFor="avatar-upload"
                  className="relative flex cursor-pointer group h-20 w-20 items-center justify-center rounded-2xl bg-white font-bold text-blue-600 text-2xl shadow-md border-4 border-white overflow-hidden shrink-0"
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>
                      {user?.full_name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </label>

                <h2 className="text-sm font-extrabold text-slate-800 mt-3">
                  {user?.full_name}
                </h2>
                <p className="text-[11px] text-slate-400 truncate max-w-50">
                  {user?.email}
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 uppercase">
                  <Shield className="w-3 h-3" />
                  <span>Hạng {user?.tier || "BRONZE"}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Điểm thưởng
                  </span>
                  <span className="text-xs font-bold text-blue-600">
                    {user?.loyalty_points || 0} điểm
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Xác thực
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      user?.identity_verified
                        ? "text-emerald-600"
                        : "text-red-600",
                    )}
                  >
                    {user?.identity_verified ? "Đã xác thực" : "Chưa xác thực"}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Tab Navigation (Sidebar) */}
            <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
              {/* NHÓM 1: TÀI KHOẢN */}
              <div className="space-y-1">
                <span className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  Tài khoản
                </span>
                <div className="space-y-1 mt-1">
                  {[
                    { id: "general", label: "Thông tin chung", icon: User },
                    {
                      id: "kyc",
                      label: "Định danh tài khoản (KYC)",
                      icon: ShieldCheck,
                    },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`}
                        />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ĐƯỜNG KẺ PHÂN TÁCH HOẶC TIÊU ĐỀ NHÓM 2 */}
              <div className="border-t border-slate-100 pt-3 space-y-1">
                <span className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  Vận chuyển & Giao dịch
                </span>
                <div className="space-y-1 mt-1">
                  {[
                    { id: "order", label: "Các đơn vận chuyển", icon: Ship },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`}
                        />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* NHÓM 3: TÀI CHÍNH & HỘI VIÊN */}
              <div className="border-t border-slate-100 pt-3 space-y-1">
                <span className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  Hệ thống & Tài chính
                </span>
                <div className="space-y-1 mt-1">
                  {[
                    {
                      id: "bank",
                      label: "Thẻ ngân hàng & COD",
                      icon: CreditCard,
                    },
                    {
                      id: "membership",
                      label: "Bậc thành viên & Ưu đãi",
                      icon: Award,
                    },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`}
                        />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Nội dung chi tiết từng Tab (Dynamic Content Card) */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200/80 min-h-125">
              {/* TAB 1: THÔNG TIN CHUNG */}

              {activeTab === "general" && (
                <ProfileGeneralForm
                  user={user}
                  onSubmit={() => {}}
                  loading={loading}
                />
              )}

              {/* TAB 2: ĐỊNH DANH CÁ NHÂN (KYC) */}
              {activeTab === "kyc" && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800">
                      Xác thực định danh pháp lý (KYC)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Yêu cầu bắt buộc đối với chủ hàng để thực hiện đối soát và
                      bảo hiểm vận đơn cao cấp.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold">
                        Trạng thái:{" "}
                        {user?.identity_verified
                          ? "Đã xác thực"
                          : "Chưa xác thực"}
                        .
                      </span>{" "}
                      Vui lòng nhập số căn cước và tải lên hình ảnh hợp lệ để mở
                      khóa toàn bộ hạn mức vận chuyển.
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Số CCCD / CMND
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập 12 chữ số trên căn cước"
                        value={identityNumber}
                        onChange={(e) => setIdentityNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-blue-500 transition-all bg-slate-50/30 cursor-pointer group">
                        <Camera className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[11px] font-semibold text-slate-600 block">
                          Mặt trước CCCD
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5 block">
                          Định dạng PNG, JPG
                        </span>
                      </div>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-blue-500 transition-all bg-slate-50/30 cursor-pointer group">
                        <Camera className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                        <span className="text-[11px] font-semibold text-slate-600 block">
                          Mặt sau CCCD
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5 block">
                          Định dạng PNG, JPG
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer">
                        Gửi phê duyệt định danh
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: THẺ & NGÂN HÀNG (NHẬN TIỀN COD) */}
              {activeTab === "bank" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-800">
                        Tài khoản ngân hàng đối soát COD
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Danh sách các tài khoản ngân hàng nhận tiền thu hộ định
                        kỳ.
                      </p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-all cursor-pointer border border-blue-100">
                      <Plus className="w-4 h-4" /> Thêm ngân hàng
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Bank Card Mock */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white space-y-4 shadow-lg relative overflow-hidden">
                      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black tracking-widest text-slate-300">
                          VIETCOMBANK
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                          Mặc định
                        </span>
                      </div>
                      <div className="text-lg font-mono tracking-wider font-bold">
                        •••• •••• 1012 3456
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 pt-3 border-t border-slate-700/60">
                        <div>
                          <span className="text-[9px] text-slate-400 block">
                            CHỦ TÀI KHOẢN
                          </span>
                          <span className="font-bold uppercase tracking-wide">
                            {user?.full_name}
                          </span>
                        </div>
                        <Wallet className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BẬC THÀNH VIÊN */}
              {activeTab === "membership" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-800">
                      Chương trình Khách hàng thân thiết Logistics
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tích lũy số lượng đơn hàng và điểm thưởng để thăng hạng,
                      nhận chiết khấu trực tiếp phí vận chuyển.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-4">
                    {[
                      {
                        name: "BRONZE",
                        points: "0 - 500 điểm",
                        discount: "0%",
                        color: "border-slate-200 bg-slate-50",
                      },
                      {
                        name: "SILVER",
                        points: "500 - 2,000 điểm",
                        discount: "3% phí ship",
                        color: "border-blue-200 bg-blue-50/40",
                      },
                      {
                        name: "GOLD",
                        points: "2,000 - 5,000 điểm",
                        discount: "5% phí ship",
                        color: "border-amber-200 bg-amber-50/40",
                      },
                      {
                        name: "DIAMOND",
                        points: "5,000+ điểm",
                        discount: "10% phí ship",
                        color: "border-indigo-200 bg-indigo-50/40",
                      },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className={`p-4 rounded-2xl border ${item.color} space-y-2 flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-800">
                              {item.name}
                            </span>
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {item.points}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-400 block">
                            Đặc quyền
                          </span>
                          <span className="text-xs font-extrabold text-blue-600">
                            {item.discount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
