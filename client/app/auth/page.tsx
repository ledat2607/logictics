"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Clock,
  PackageCheck,
} from "lucide-react";
import AuthTabSwitch from "./components/auth-tab-switch";
import LoginForm from "./components/login-form";
import RegisterForm from "./components/register-form";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-slate-100">
      {/* 🌟 CỘT TRÁI: BANNER THƯƠNG HIỆU & MÀU SẮC LOGISTICS 🌟 */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 p-12 text-white relative overflow-hidden">
        {/* Họa tiết trang trí chìm ở nền */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo / Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white">
            LOGISTICS<span className="text-blue-300">.EXPRESS</span>
          </span>
        </div>

        {/* Nội dung điểm nhấn (Hero Text) */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-blue-100 backdrop-blur-md border border-white/15">
            <PackageCheck className="h-4 w-4 text-blue-300" />
            <span>Giải pháp vận chuyển thông minh & bảo mật</span>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-white tracking-tight">
            Quản lý đơn hàng hiệu quả chỉ với một vài cú nhấp
          </h1>

          <p className="text-sm leading-relaxed text-blue-100/90">
            Theo dõi hành trình thời gian thực, tối ưu hóa cước phí vận chuyển
            và nhận tư vấn chuyên nghiệp từ mạng lưới Logistics hàng đầu Việt
            Nam.
          </p>

          {/* List tính năng nổi bật */}
          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-blue-50">
                Bảo mật dữ liệu 100%
              </span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-3 backdrop-blur-sm border border-white/10">
              <Clock className="h-5 w-5 text-amber-400 shrink-0" />
              <span className="text-xs font-medium text-blue-50">
                Cập nhật Real-time
              </span>
            </div>
          </div>
        </div>

        {/* Footer Cột Trái */}
        <div className="relative z-10 text-xs text-blue-200/70 border-t border-white/10 pt-4 flex justify-between">
          <span>© 2026 Logistics Express Inc.</span>
          <span>Hỗ trợ: 1900 xxxx</span>
        </div>
      </div>

      {/* 🌟 CỘT PHẢI: FORM ĐĂNG NHẬP / ĐĂNG KÝ 🌟 */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
          {/* Nút Quay lại Trang chủ */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Quay lại trang chủ</span>
          </Link>

          {/* Tiêu đề & Chuyển Tab */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isLogin ? "Chào mừng quay trở lại!" : "Tạo tài khoản khách hàng"}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isLogin
                ? "Nhập email và mật khẩu của bạn để truy cập hệ thống quản lý đơn"
                : "Điền thông tin bên dưới để trải nghiệm đầy đủ tính năng vận chuyển Pro"}
            </p>

            <AuthTabSwitch isLogin={isLogin} setIsLogin={setIsLogin} />
          </div>

          {/* Form nội dung */}
          <div className="pt-2">
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}
