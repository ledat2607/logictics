"use client";

import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, User, Mail, Phone, LocateIcon } from "lucide-react";
import { cn } from "cn";

export function ProfileGeneralForm({
  user,
  onSubmit,
  loading,
}: {
  user: any;
  onSubmit: (values: any) => void;
  loading: boolean;
}) {
  // Khởi tạo form với react-hook-form
  const form = useForm({
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Thông tin cá nhân
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cập nhật thông tin định danh và phương thức liên lạc của tài khoản.
          </p>
        </div>
        <span
          className={cn(
            "px-3 py-1 bg-blue-50 rounded-full text-[11px] font-bold tracking-wide uppercase border border-blue-100",
            user?.identity_verified ? "text-blue-600" : "text-red-500",
          )}
        >
          {user?.identity_verified ? "Đã xác thực" : "Chưa xác thực"}
        </span>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Họ và tên (Full width) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Họ và tên</label>
          <Controller
            name="full_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                  <Input
                    {...field}
                    placeholder="Nhập họ tên đầy đủ"
                    className={`w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-50/50 transition-all outline-none
                  ${
                    fieldState.invalid
                      ? "border-red-300 focus-visible:ring-red-500/20"
                      : "border-slate-200 hover:border-slate-300 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-600"
                  }`}
                  />
                </div>
                {fieldState.error && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Email & Số điện thoại (Grid 2 cột cân đối) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Địa chỉ Email
            </label>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@domain.com"
                      className={`w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-50/50 transition-all outline-none
                    ${
                      fieldState.invalid
                        ? "border-red-300 focus-visible:ring-red-500/20"
                        : "border-slate-200 hover:border-slate-300 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-600"
                    }`}
                    />
                  </div>
                  {fieldState.error && (
                    <p className="text-[11px] text-red-500 mt-1 font-medium">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Số điện thoại liên lạc
            </label>
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                    <Input
                      {...field}
                      placeholder="0901234567"
                      className={`w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-50/50 transition-all outline-none
                    ${
                      fieldState.invalid
                        ? "border-red-300 focus-visible:ring-red-500/20"
                        : "border-slate-200 hover:border-slate-300 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10 focus-visible:border-blue-600"
                    }`}
                    />
                  </div>
                  {fieldState.error && (
                    <p className="text-[11px] text-red-500 mt-1 font-medium">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
}
