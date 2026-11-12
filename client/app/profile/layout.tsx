"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  MapPin,
  Truck,
  CreditCard,
  Award,
  Loader2,
  Cpu,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/user-auth";

const MENU_GROUPS = [
  {
    title: "TÀI KHOẢN HỆ THỐNG",
    items: [
      { label: "Thông tin chung", href: "/profile", icon: User },
      {
        label: "Định danh tài khoản (KYC)",
        href: "/profile/kyc",
        icon: ShieldCheck,
      },
      { label: "Sổ địa chỉ", href: "/profile/addresses", icon: MapPin },
    ],
  },
  {
    title: "VẬN CHUYỂN & GIAO DỊCH",
    items: [
      { label: "Các đơn vận chuyển", href: "/profile/orders", icon: Truck },
    ],
  },
  {
    title: "HỆ THỐNG & TÀI CHÍNH",
    items: [
      {
        label: "Thẻ ngân hàng & COD",
        href: "/profile/payment",
        icon: CreditCard,
      },
      {
        label: "Bậc thành viên & Ưu đãi",
        href: "/profile/membership",
        icon: Award,
      },
    ],
  },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();

  useEffect(() => {
    const handleStorageChange = () => {
      router.refresh();
    };
    window.addEventListener("auth-user-updated", handleStorageChange);
    return () => {
      window.removeEventListener("auth-user-updated", handleStorageChange);
    };
  }, [router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#bdc3d1]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin absolute" />
          <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#fbfbfc] overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[48px_48px] opacity-[0.25]"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 20%, #8989da 70%, transparent 100%)",
        }}
      />

      {/* 2. CÁC QUẦNG SÁNG NEON AMBIENT GLOW CHUYỂN ĐỘNG */}
      <div className="pointer-events-none absolute -top-32 left-1/3 h-112.5 w-112.5 rounded-full bg-blue-600/75 blur-[130px] animate-pulse" />
      <div className="pointer-events-none absolute top-1/4 right-10 h-100 w-100 rounded-full bg-indigo-600/55 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-90 w-90 rounded-full bg-cyan-500/80 blur-[120px]" />

      {/* 3. HIỆU ỨNG QUÉT LASER DỌC MÀN HÌNH (SCANLINE) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        <div className="w-full h-0.5 bg-linear-to-r from-transparent via-cyan-400 to-transparent animate-[scan_6s_linear_infinite]" />
      </div>

      {/* CONTAINER CHÍNH */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-all bg-slate-900/80 backdrop-blur-xl border border-slate-800 hover:border-blue-500/50 px-4 py-2 rounded-xl shadow-lg hover:shadow-blue-500/20"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Quay lại trang chủ</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-900/60 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-slate-800/80 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Hệ thống quản lý Logistics</span>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-semibold tracking-wide">
              Tài khoản cá nhân
            </span>
          </div>
        </div>

        {/* GRID LAYOUT: TRÁI & PHẢI */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* CỘT TRÁI: Profile Card & Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-5">
            {/* Thẻ User Holographic Card */}
            <div className="group relative bg-slate-900/80 backdrop-blur-2xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10">
              {/* Hiệu ứng đường viền sáng chạy qua khi hover */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Banner Gradient Futuristic */}
              <div className="h-24 bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent)]" />
                {/* Lưới nhỏ trên banner */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[12px_12px]" />
              </div>

              <div className="px-5 pb-5 text-center relative">
                {/* Avatar có vòng sáng viền neon */}
                <div className="w-20 h-20 mx-auto -mt-10 rounded-2xl p-0.5 bg-linear-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-blue-500/30">
                  <img
                    src={
                      user?.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
                    }
                    alt={user?.full_name || "User"}
                    className="w-full h-full object-cover rounded-[14px] bg-slate-950"
                  />
                </div>

                <h2 className="mt-3 font-bold text-slate-100 text-base tracking-wide">
                  {user?.full_name || "Lê Lưu Quốc Đạt 2"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {user?.email || "ledat260701@gmail.com"}
                </p>

                {/* Badge Hạng */}
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-[11px] font-bold tracking-wider shadow-inner">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  {user?.tier || "HẠNG BRONZE"}
                </div>

                {/* Điểm thưởng & Xác thực */}
                <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-slate-800/80 text-left">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Điểm thưởng
                    </p>
                    <p className="text-xs font-bold text-cyan-400 mt-0.5">
                      {user?.loyalty_points ?? 0} điểm
                    </p>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      Xác thực
                    </p>
                    <p
                      className={`text-xs font-bold mt-0.5 ${
                        user?.identity_verified
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {user?.identity_verified
                        ? "Đã xác thực"
                        : "Chưa xác thực"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Sidebar Navigation */}
            <nav className="bg-slate-900/80 backdrop-blur-2xl p-3.5 rounded-2xl border border-slate-800 shadow-2xl space-y-5">
              {MENU_GROUPS.map((group) => (
                <div key={group.title} className="space-y-1.5">
                  <p className="px-3 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group/item flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                            isActive
                              ? "bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400/30"
                              : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 transition-transform group-hover/item:scale-110 ${
                              isActive
                                ? "text-white"
                                : "text-slate-400 group-hover/item:text-cyan-400"
                            }`}
                          />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* CỘT PHẢI: Dynamic Content Card (Nội dung từng tab) */}
          <main className="lg:col-span-3 bg-slate-100/80 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-2xl min-h-130 relative overflow-hidden shadow-blue-800/50">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
