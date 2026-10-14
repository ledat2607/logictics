"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  Truck,
  User,
  MapPin,
  Sparkles,
  CheckCircle2,
  Loader2,
  Notebook,
  Eraser,
} from "lucide-react";
import { useOrderPricing } from "@/hooks/caculate";
import { Textarea } from "@/components/ui/textarea";
import { parseAddressComponents } from "@/hooks/custom";
import { toast } from "sonner";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialFormData = {
  senderName: "",
  senderPhone: "",
  senderAddress: "",
  senderProvince: "",
  senderDistrict: "",

  receiverName: "",
  receiverPhone: "",
  receiverAddress: "",
  receiverProvince: "",
  receiverDistrict: "",

  packageName: "",
  weight_kg: "1",
  length_cm: "10",
  width_cm: "10",
  height_cm: "10",
  distance_km: 0,

  serviceType: "STANDARD",
  payer: "sender",
  codAmount: "0",
  insuranceFee: "0",
  note: "",
};

export default function CreateOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    trackingCode: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    packageName: "",
    weight_kg: "1",
    length_cm: "10",
    width_cm: "10",
    height_cm: "10",
    serviceType: "STANDARD",
    note: "",
    payer: "sender",
    distance_km: 0,
  });

  const { distance, addressValid, isCalculating, calculatedFee, feeBreakdown } =
    useOrderPricing({
      ...formData,
      weight: formData.weight_kg,
      length: formData.length_cm,
      width: formData.width_cm,
      height: formData.height_cm,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const senderGeoInfo = parseAddressComponents(formData.senderAddress);
      const receiverGeoInfo = parseAddressComponents(formData.receiverAddress);
      const payload = {
        // Thông tin người gửi
        sender_name: formData.senderName,
        sender_phone: formData.senderPhone,
        sender_address_full: formData.senderAddress, // 👈 Đổi sender_address -> sender_address_full
        sender_province: senderGeoInfo.province, // 👈 Thêm sender_province nếu cầ
        sender_district: senderGeoInfo.district, // 👈 Thêm sender_district nếu cần

        // Thông tin người nhận
        receiver_name: formData.receiverName,
        receiver_phone: formData.receiverPhone,
        receiver_address_full: formData.receiverAddress, // 👈 Đổi receiver_address -> receiver_address_full
        receiver_province: receiverGeoInfo.province, // 👈 Thêm receiver_province nếu cần
        receiver_district: receiverGeoInfo.district, // 👈 Thêm receiver_district nếu cần

        // Thông tin hàng hóa & Kích thước
        package_name: formData.packageName || "Hàng hóa tiêu chuẩn", // 👈 Đổi item_name -> package_name
        weight_kg:
          Number(formData.weight_kg) || Number(formData.weight_kg) || 1,
        length_cm:
          Number(formData.length_cm) || Number(formData.length_cm) || 10,
        width_cm: Number(formData.width_cm) || Number(formData.width_cm) || 10,
        height_cm:
          Number(formData.height_cm) || Number(formData.height_cm) || 10,

        // Thông tin cước & Thanh toán
        service_type: formData.serviceType || "STANDARD",
        distance_km: distance || 0,
        shipping_fee: calculatedFee,
        payer: formData.payer || "sender",
        cod_amount: calculatedFee || 0,
        // insurance_fee: Number(formData.insuranceFee) || 0,
        note: formData.note || "", // 👈 Đổi notes -> note
      };
      const res = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok || data.order) {
        const trackingCode =
          data.order?.tracking_code ||
          data.order?.trackingCode ||
          data.order?.id ||
          "Mới";

        // 1. Hiển thị Toast của Sonner
        toast.success("🎉 Tạo đơn hàng thành công!", {
          description: `Mã vận đơn: ${trackingCode}`,
        });

        // 3. Đóng Modal
        if (onClose) onClose();

        setFormData(initialFormData);
        setErrorMessage(null);
      } else {
        // Trường hợp backend trả về lỗi 500/400
        const errorMsg = data.error || data.message || "Tạo đơn hàng thất bại!";
        toast.error("⚠️ Lỗi tạo đơn hàng", { description: errorMsg });
        setErrorMessage(errorMsg);
      }
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu tạo đơn:", err);
      setErrorMessage("Không thể kết nối tới máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    onClose();
  };
  const handleClearData = () => {
    setFormData(initialFormData);
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleResetAndClose}>
      <DialogContent className="sm:max-w-180 max-h-[85vh] p-0 gap-0 bg-white border border-slate-200 text-slate-800 overflow-hidden flex flex-col rounded-2xl shadow-2xl">
        {successData ? (
          /* Màn hình Thành công */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Tạo Đơn Hàng Thành Công!
            </h3>
            <p className="text-slate-500 text-sm">Mã vận đơn của bạn là:</p>
            <div className="p-4 bg-slate-50 border border-blue-200 rounded-2xl inline-block text-blue-600 font-mono text-2xl font-bold tracking-wider">
              {successData.trackingCode}
            </div>
            <p className="text-xs text-slate-400">
              Mã vận đơn đã được lưu vào hệ thống để tra cứu lộ trình real-time.
            </p>
            <DialogFooter className="pt-4 sm:justify-center">
              <Button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Hoàn tất
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Form Đơn hàng */
          <form
            onSubmit={handleSubmit}
            className="flex flex-col h-full max-h-[85vh]"
          >
            {/* HEADER CỐ ĐỊNH Ở ĐỈNH */}
            <DialogHeader className="p-6 pb-4 bg-white/95 backdrop-blur-md border-b border-slate-100 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    Tạo Đơn Hàng Mới
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Nhập chi tiết người gửi, người nhận và thông số kiện hàng.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* NỘI DUNG FORM CUỘN ĐƯỢC BÊN DƯỚI */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Grid Người Gửi & Người Nhận */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card Người Gửi */}
                <Card className="bg-slate-50/70 border-slate-200/80 shadow-none">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                      <User className="w-4 h-4" /> THÔNG TIN NGƯỜI GỬI
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="senderName"
                        className="text-xs text-slate-600 font-medium"
                      >
                        Họ và tên
                      </Label>
                      <Input
                        id="senderName"
                        required
                        placeholder="Nguyễn Văn A"
                        value={formData.senderName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            senderName: e.target.value,
                          })
                        }
                        className="bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="senderPhone"
                        className="text-xs text-slate-600 font-medium"
                      >
                        Số điện thoại
                      </Label>
                      <Input
                        id="senderPhone"
                        type="tel"
                        required
                        placeholder="0901234567"
                        value={formData.senderPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            senderPhone: e.target.value,
                          })
                        }
                        className="bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="senderAddress"
                        className="text-xs text-slate-600 font-medium"
                      >
                        Địa chỉ lấy hàng
                      </Label>
                      <Input
                        id="senderAddress"
                        required
                        placeholder="Số nhà, đường, Quận/Huyện..."
                        value={formData.senderAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            senderAddress: e.target.value,
                          })
                        }
                        className="bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Card Người Nhận */}
                <Card className="bg-slate-50/70 border-slate-200/80 shadow-none">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                      <MapPin className="w-4 h-4" /> THÔNG TIN NGƯỜI NHẬN
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="receiverName"
                        className="text-xs text-slate-600 font-medium"
                      >
                        Họ và tên
                      </Label>
                      <Input
                        id="receiverName"
                        required
                        placeholder="Trần Thị B"
                        value={formData.receiverName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            receiverName: e.target.value,
                          })
                        }
                        className="bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="receiverPhone"
                        className="text-xs text-slate-600 font-medium"
                      >
                        Số điện thoại
                      </Label>
                      <Input
                        id="receiverPhone"
                        type="tel"
                        required
                        placeholder="0987654321"
                        value={formData.receiverPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            receiverPhone: e.target.value,
                          })
                        }
                        className="bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="receiverAddress"
                        className="text-xs text-slate-600 font-medium"
                      >
                        Địa chỉ giao hàng
                      </Label>
                      <Input
                        id="receiverAddress"
                        required
                        placeholder="Số nhà, đường, Quận/Huyện..."
                        value={formData.receiverAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            receiverAddress: e.target.value,
                          })
                        }
                        className="bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Thông tin Hàng hóa */}
              <Card className="bg-slate-50/70 border-slate-200/80 shadow-none">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
                    <Package className="w-4 h-4" /> CHI TIẾT HÀNG HÓA & KHỐI
                    LƯỢNG
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="packageName"
                      className="text-xs text-slate-600 font-medium"
                    >
                      Tên sản phẩm/hàng hóa
                    </Label>
                    <Input
                      id="packageName"
                      required
                      placeholder="Ví dụ: Giày thể thao, Quần áo..."
                      value={formData.packageName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          packageName: e.target.value,
                        })
                      }
                      className="bg-white border-slate-200 focus-visible:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-500 font-medium">
                        Cân nặng (kg)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.weight_kg}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weight_kg: e.target.value,
                          })
                        }
                        className="bg-white border-slate-200 text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-500 font-medium">
                        Dài (cm)
                      </Label>
                      <Input
                        type="number"
                        value={formData.length_cm}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            length_cm: e.target.value,
                          })
                        }
                        className="bg-white border-slate-200 text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-500 font-medium">
                        Rộng (cm)
                      </Label>
                      <Input
                        type="number"
                        value={formData.width_cm}
                        onChange={(e) =>
                          setFormData({ ...formData, width_cm: e.target.value })
                        }
                        className="bg-white border-slate-200 text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-slate-500 font-medium">
                        Cao (cm)
                      </Label>
                      <Input
                        type="number"
                        value={formData.height_cm}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            height_cm: e.target.value,
                          })
                        }
                        className="bg-white border-slate-200 text-slate-800"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-50/70 border-slate-200/80 shadow-none">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Notebook className="w-4 h-4" />
                    GHI CHÚ & THÔNG TIN BỔ SUNG
                  </div>

                  {/* Ô Nhập Ghi Chú */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="note"
                      className="text-xs text-slate-600 font-medium"
                    >
                      Ghi chú
                    </Label>
                    <Textarea
                      placeholder="Nhập ghi chú hoặc thông tin bổ sung..."
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      className="bg-white border-slate-200 text-slate-800 text-xs"
                    />
                  </div>

                  {/* 💡 THÊM MỚI: TÙY CHỌN NGƯỜI THANH TOÁN (PAYER) */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <Label className="text-xs text-slate-600 font-medium mb-2 block">
                      Người thanh toán cước
                    </Label>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* Người gửi trả */}
                      <label
                        onClick={() =>
                          setFormData({ ...formData, payer: "sender" })
                        }
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                          formData.payer === "sender" || !formData.payer
                            ? "bg-blue-50/80 border-blue-500 text-blue-700 font-semibold"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payer"
                            checked={
                              formData.payer === "sender" || !formData.payer
                            }
                            onChange={() =>
                              setFormData({ ...formData, payer: "sender" })
                            }
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                          <span>Người gửi trả</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Thanh toán ngay
                        </span>
                      </label>

                      {/* Người nhận trả (COD) */}
                      <label
                        onClick={() =>
                          setFormData({ ...formData, payer: "receiver" })
                        }
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${
                          formData.payer === "receiver"
                            ? "bg-blue-50/80 border-blue-500 text-blue-700 font-semibold"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="payer"
                            checked={formData.payer === "receiver"}
                            onChange={() =>
                              setFormData({ ...formData, payer: "receiver" })
                            }
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                          <span>Người nhận trả</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Thu khi giao
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-slate-600 font-medium block">
                      Gói dịch vụ vận chuyển
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* 1. Gói Standard */}
                      <div
                        onClick={() =>
                          setFormData({ ...formData, serviceType: "STANDARD" })
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          formData.serviceType === "STANDARD" ||
                          !formData.serviceType
                            ? "bg-blue-50/80 border-blue-500 text-blue-800 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">
                            Chuyển phát Tiết kiệm
                          </span>
                          <input
                            type="radio"
                            name="serviceType"
                            checked={
                              formData.serviceType === "STANDARD" ||
                              !formData.serviceType
                            }
                            onChange={() =>
                              setFormData({
                                ...formData,
                                serviceType: "STANDARD",
                              })
                            }
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {" "}
                          STANDARD (Giá cơ bản)
                        </span>
                      </div>

                      {/* 2. Gói FAST */}
                      <div
                        onClick={() =>
                          setFormData({ ...formData, serviceType: "FAST" })
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          formData.serviceType === "FAST"
                            ? "bg-blue-50/80 border-blue-500 text-blue-800 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold flex items-center gap-1 text-amber-600">
                            ⚡ Chuyển phát Hỏa tốc
                          </span>
                          <input
                            type="radio"
                            name="serviceType"
                            checked={formData.serviceType === "FAST"}
                            onChange={() =>
                              setFormData({ ...formData, serviceType: "FAST" })
                            }
                            className="w-3.5 h-3.5 text-blue-600"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">
                          FAST (+30% cước phí)
                        </span>
                      </div>

                      {/* 3. Gói AI EXPRESS */}
                      <div
                        onClick={() =>
                          setFormData({
                            ...formData,
                            serviceType: "AI_EXPRESS",
                          })
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          formData.serviceType === "AI_EXPRESS"
                            ? "bg-amber-50/80 border-amber-500 text-amber-900 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold flex items-center gap-1 text-amber-600">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />{" "}
                            AI Route Express
                          </span>
                          <input
                            type="radio"
                            name="serviceType"
                            checked={formData.serviceType === "AI_EXPRESS"}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                serviceType: "AI_EXPRESS",
                              })
                            }
                            className="w-3.5 h-3.5 text-amber-600"
                          />
                        </div>
                        <span className="text-[10px] text-amber-700 font-medium">
                          Tối ưu AI (+80%)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dịch vụ & Cước phí */}
              <div className="flex flex-col gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500 font-medium">
                        Cước phí ước tính:
                      </span>
                      {distance !== null && (
                        <span className="text-[11px] px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                          📍 ~{distance} km
                        </span>
                      )}
                    </div>

                    <div className="text-2xl font-black text-blue-600 flex items-center gap-2">
                      {isCalculating ? (
                        <span className="text-xs font-normal text-slate-400">
                          Đang tính cước...
                        </span>
                      ) : (
                        <>
                          {calculatedFee.toLocaleString("vi-VN")}{" "}
                          <span className="text-sm font-normal">đ</span>
                        </>
                      )}
                    </div>

                    {/* Báo hiệu nhận diện địa chỉ */}
                    <div className="flex items-center gap-3 text-[11px] mt-1.5">
                      <span
                        className={
                          addressValid.sender
                            ? "text-emerald-600 font-medium"
                            : "text-slate-400"
                        }
                      >
                        {addressValid.sender
                          ? "✓ Địa chỉ gửi hợp lệ"
                          : "• Chưa nhận diện đủ địa chỉ gửi"}
                      </span>
                      <span
                        className={
                          addressValid.receiver
                            ? "text-emerald-600 font-medium"
                            : "text-slate-400"
                        }
                      >
                        {addressValid.receiver
                          ? "✓ Địa chỉ nhận hợp lệ"
                          : "• Chưa nhận diện đủ địa chỉ nhận"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 💡 CHI TIẾT DIỄN GIẢI CƯỚC PHÍ TỪNG CHỈ SỐ */}
                {feeBreakdown && !isCalculating && (
                  <div className="pt-3 mt-2 border-t border-blue-100 text-[12px] space-y-1.5">
                    {/* 1. Phí khối lượng */}
                    <div className="flex justify-between items-center text-slate-600">
                      <span>
                        • Phí khối lượng (
                        <strong className="text-slate-800 font-semibold">
                          {feeBreakdown.chargeableWeight} kg
                        </strong>
                        {feeBreakdown.volumetricWeight >
                          feeBreakdown.actualWeight && (
                          <span className="text-amber-600 font-normal">
                            {" "}
                            - Quy đổi thể tích
                          </span>
                        )}
                        ):
                      </span>
                      <span className="font-semibold text-slate-800">
                        {(feeBreakdown.weightFee || 22000).toLocaleString(
                          "vi-VN",
                        )}{" "}
                        đ
                      </span>
                    </div>

                    {/* 2. Phụ thu quãng đường */}
                    <div className="flex justify-between items-center text-slate-600">
                      <span>
                        • Phụ thu quãng đường (
                        <strong className="text-slate-800 font-semibold">
                          ~{distance || 0} km
                        </strong>
                        ):
                      </span>
                      <span className="font-semibold text-slate-800">
                        +
                        {(feeBreakdown.distanceFee || 0).toLocaleString(
                          "vi-VN",
                        )}{" "}
                        đ
                      </span>
                    </div>

                    {/* 3. Phụ phí cồng kềnh */}
                    {feeBreakdown.bulkySurcharge > 0 && (
                      <div className="flex justify-between items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                        <span>⚠️ Phụ phí cồng kềnh (&gt;50kg):</span>
                        <span className="font-bold">
                          +{feeBreakdown.bulkySurcharge.toLocaleString("vi-VN")}{" "}
                          đ
                        </span>
                      </div>
                    )}

                    {/* 4. Gói dịch vụ */}
                    {formData.serviceType !== "STANDARD" && (
                      <div className="flex justify-between items-center text-blue-600 bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100">
                        <span>
                          ⚡ Hệ số gói{" "}
                          {formData.serviceType === "FAST"
                            ? "FAST (+30%)"
                            : "AI EXPRESS (+80%)"}
                          :
                        </span>
                        <span className="font-semibold text-blue-700">
                          +
                          {(
                            calculatedFee -
                            (feeBreakdown.weightFee +
                              feeBreakdown.distanceFee +
                              feeBreakdown.bulkySurcharge)
                          ).toLocaleString("vi-VN")}{" "}
                          đ
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER CỐ ĐỊNH Ở ĐÁY */}
            <DialogFooter className="p-4 grid grid-cols-1 lg:grid-cols-12 items-center gap-3 bg-slate-50 border-t border-slate-100 shrink-0">
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-xl shadow-md shadow-blue-500/20 xl:col-span-8 "
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo
                    đơn...
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" /> Xác Nhận Tạo Đơn Hàng
                  </>
                )}
              </Button>
              <Button
                onClick={handleClearData}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold h-11 rounded-xl shadow-md shadow-red-500/20 xl:col-span-4"
              >
                <Eraser className="mr-2 h-4 w-4" />
                Xóa dữ liệu
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
