"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Plus, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Zod Schema validate địa chỉ
const addressSchema = z.object({
  contact_name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  contact_phone: z
    .string()
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
  street_address: z.string().min(5, "Vui lòng nhập địa chỉ chi tiết"),
  ward: z.string().optional(),
  district: z.string().min(2, "Vui lòng nhập quận/huyện"),
  province: z.string().min(2, "Vui lòng nhập tỉnh/thành phố"),
  is_default: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressBookPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Danh sách địa chỉ mẫu (sau này cậu gọi API lấy từ bảng addresses trong DB lên nhé)
  const [addresses, setAddresses] = useState([
    {
      id: "1",
      contact_name: "Lê Lưu Quốc Đạt",
      contact_phone: "0901234567",
      street_address: "123 Nguyễn Huệ, Phường Bến Nghé",
      district: "Quận 1",
      province: "TP. Hồ Chí Minh",
      is_default: true,
    },
    {
      id: "2",
      contact_name: "Kho Tổng Tân Bình",
      contact_phone: "0988765432",
      street_address: "45 Trường Chinh",
      district: "Tân Bình",
      province: "TP. Hồ Chí Minh",
      is_default: false,
    },
  ]);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema as any),
    defaultValues: {
      contact_name: "",
      contact_phone: "",
      street_address: "",
      ward: "",
      district: "",
      province: "",
      is_default: false,
    },
  });

  const onSubmit = async (values: AddressFormValues) => {
    setLoading(true);
    // Giả lập gọi API lưu địa chỉ vào CSDL
    setTimeout(() => {
      const newAddress = { id: Date.now().toString(), ...values };
      if (values.is_default) {
        // Nếu chọn mặc định thì bỏ mặc định các địa chỉ cũ
        setAddresses(
          addresses
            .map((item) => ({ ...item, is_default: false }))
            .concat(newAddress),
        );
      } else {
        setAddresses([...addresses, newAddress]);
      }

      setLoading(false);
      setIsOpen(false);
      form.reset();
      toast.success("Thêm địa chỉ thành công!");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header của Tab Sổ địa chỉ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">
            Sổ địa chỉ giao / nhận hàng
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý các địa chỉ kho và điểm nhận hàng thường xuyên của bạn.
          </p>
        </div>

        {/* Nút mở Dialog Thêm mới */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-xs gap-2 shadow-sm shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" /> Thêm địa chỉ mới
              </Button>
            }
          ></DialogTrigger>

          {/* Nội dung Dialog Form */}
          <DialogContent className="sm:max-w-lg bg-white p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-extrabold text-slate-800">
                Thêm địa chỉ mới
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-2"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Tên người nhận
                  </label>
                  <Controller
                    name="contact_name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Input
                          {...field}
                          placeholder="VD: Nguyễn Văn A"
                          className="text-xs bg-slate-50/50"
                        />
                        {fieldState.error && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Số điện thoại
                  </label>
                  <Controller
                    name="contact_phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Input
                          {...field}
                          placeholder="0901234567"
                          className="text-xs bg-slate-50/50"
                        />
                        {fieldState.error && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Địa chỉ chi tiết (Số nhà, tên đường)
                </label>
                <Controller
                  name="street_address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <div>
                      <Input
                        {...field}
                        placeholder="VD: 123 Nguyễn Huệ"
                        className="text-xs bg-slate-50/50"
                      />
                      {fieldState.error && (
                        <p className="text-[10px] text-red-500 mt-0.5">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Phường/Xã
                  </label>
                  <Controller
                    name="ward"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Bến Nghé"
                        className="text-xs bg-slate-50/50"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Quận/Huyện
                  </label>
                  <Controller
                    name="district"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Input
                          {...field}
                          placeholder="Quận 1"
                          className="text-xs bg-slate-50/50"
                        />
                        {fieldState.error && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Tỉnh/Thành
                  </label>
                  <Controller
                    name="province"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Input
                          {...field}
                          placeholder="TP.HCM"
                          className="text-xs bg-slate-50/50"
                        />
                        {fieldState.error && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Controller
                  name="is_default"
                  control={form.control}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="is_default_dlg"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  )}
                />
                <label
                  htmlFor="is_default_dlg"
                  className="text-xs font-medium text-slate-700 cursor-pointer"
                >
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="submit"
                  disabled={loading}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-xs w-full gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Lưu địa chỉ
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Danh sách các địa chỉ hiện có dạng Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-4 rounded-2xl border border-slate-200/80 bg-white space-y-3 relative shadow-xs hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-800">
                  {addr.contact_name}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-500 font-medium">
                  {addr.contact_phone}
                </span>
              </div>
              {addr.is_default && (
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold rounded-full">
                  Mặc định
                </span>
              )}
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">
                  {addr.street_address}
                </p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {addr.district}, {addr.province}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 px-2 py-1 transition-colors">
                Chỉnh sửa
              </button>
              <button className="text-[11px] font-semibold text-red-500 hover:text-red-600 px-2 py-1 transition-colors">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
