"use client";

import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, User, Mail, Phone, LocateIcon } from "lucide-react";

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
      address: user?.address || "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      {/* 1. Trường Họ và tên dùng Controller */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">
          Họ và tên
        </label>
        <Controller
          name="full_name"
          control={form.control}
          rules={{ required: "Họ tên không được để trống" }}
          render={({ field, fieldState }) => (
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Nhập họ tên"
                  aria-invalid={fieldState.invalid}
                  className="pl-9 text-xs bg-slate-50/50"
                />
              </div>
              {fieldState.error && (
                <p className="text-[11px] text-red-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* 2. Trường Email dùng Controller (Y hệt mẫu trong ảnh của cậu) */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">
          Địa chỉ Email
        </label>
        <Controller
          name="email"
          control={form.control}
          rules={{
            required: "Email không được để trống",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Email không hợp lệ",
            },
          }}
          render={({ field, fieldState }) => (
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="example@gmail.com"
                  aria-invalid={fieldState.invalid}
                  className="pl-9 text-xs bg-slate-50/50"
                />
              </div>
              {fieldState.error && (
                <p className="text-[11px] text-red-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* 3. Trường Số điện thoại dùng Controller */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">
          Số điện thoại
        </label>
        <Controller
          name="phone"
          control={form.control}
          rules={{ required: "Số điện thoại không được để trống" }}
          render={({ field, fieldState }) => (
            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  {...field}
                  id={field.name}
                  placeholder="0901234567"
                  aria-invalid={fieldState.invalid}
                  className="pl-9 text-xs bg-slate-50/50"
                />
              </div>
              {fieldState.error && (
                <p className="text-[11px] text-red-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">Địa chỉ</label>
        <Controller
          name="address"
          control={form.control}
          rules={{ required: "Địa chỉ không được để trống" }}
          render={({ field, fieldState }) => (
            <div>
              <div className="relative">
                <LocateIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  {...field}
                  id={field.name}
                  placeholder="phường A, thành phố B,....."
                  aria-invalid={fieldState.invalid}
                  className="pl-9 text-xs bg-slate-50/50"
                />
              </div>
              {fieldState.error && (
                <p className="text-[11px] text-red-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-xs gap-2"
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
  );
}
