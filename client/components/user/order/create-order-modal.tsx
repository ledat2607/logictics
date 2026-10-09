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
} from "lucide-react";
import { useOrderPricing } from "@/hooks/caculate";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateOrderModalProps) {
  const [loading, setLoading] = useState(false);
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

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          weight_kg: parseFloat(formData.weight_kg),
          length_cm: parseFloat(formData.length_cm),
          width_cm: parseFloat(formData.width_cm),
          height_cm: parseFloat(formData.height_cm),
          totalFee: calculatedFee,
          distance_km: distance,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessData({
          trackingCode: data.trackingCode || data.order?.tracking_number,
        });
        if (onSuccess) onSuccess();
      } else {
        alert(data.message || "Tạo đơn thất bại, vui lòng thử lại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối tới Server!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    onClose();
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

                  {/* Dropdown Gói dịch vụ */}
                  <div className="w-full sm:w-48">
                    <Label className="text-[11px] text-slate-500 font-medium mb-1 block">
                      Gói dịch vụ
                    </Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          serviceType: val ? val : formData.serviceType,
                        })
                      }
                    >
                      <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                        <SelectValue placeholder="Chọn gói cước" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 text-slate-800 w-48">
                        <SelectItem value="STANDARD">
                          Chuyển phát Tiết kiệm
                        </SelectItem>
                        <SelectItem value="FAST">
                          Chuyển phát Hỏa tốc
                        </SelectItem>
                        <SelectItem value="AI_EXPRESS">
                          <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />{" "}
                            AI Route Express
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
            <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-xl shadow-md shadow-blue-500/20"
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
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
