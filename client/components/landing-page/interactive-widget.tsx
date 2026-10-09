"use client";

import { useState } from "react";
import {
  Search,
  Calculator,
  Building2,
  MapPin,
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
  Navigation,
  Phone,
  AlertCircle,
  Loader2,
  Truck,
  Box,
  XCircle,
  RotateCcw,
} from "lucide-react";

// 1. Map Enum Status từ DB Schema sang tiếng Việt & Styling trực quan
const STATUS_MAP: Record<
  string,
  { label: string; color: string; badgeBg: string; icon: any }
> = {
  draft: {
    label: "Mới tạo (Chờ xác nhận)",
    color: "text-slate-400",
    badgeBg: "bg-slate-500/10 border-slate-500/30 text-slate-400",
    icon: Box,
  },
  created: {
    label: "Đã tạo đơn - Chờ lấy hàng",
    color: "text-blue-400",
    badgeBg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    icon: Box,
  },
  picking_up: {
    label: "Tài xế đang đi lấy hàng",
    color: "text-amber-400",
    badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    icon: Truck,
  },
  picked_up: {
    label: "Đã lấy hàng - Đã nhập kho",
    color: "text-indigo-400",
    badgeBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
    icon: Package,
  },
  in_transit: {
    label: "Đang luôn chuyển / Đang giao",
    color: "text-cyan-400",
    badgeBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    icon: Truck,
  },
  delivered: {
    label: "Giao hàng thành công",
    color: "text-emerald-400",
    badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    icon: CheckCircle2,
  },
  failed_delivery: {
    label: "Giao hàng thất bại",
    color: "text-rose-400",
    badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    icon: AlertCircle,
  },
  cancelled: {
    label: "Đã hủy đơn hàng",
    color: "text-red-500",
    badgeBg: "bg-red-500/10 border-red-500/30 text-red-500",
    icon: XCircle,
  },
  returned: {
    label: "Đã trả hàng về",
    color: "text-orange-400",
    badgeBg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    icon: RotateCcw,
  },
};

// 2. Hàm định dạng thời gian ISO (2026-10-05T05:06:16.748Z) sang "12:06 - 05/10/2026"
const formatDate = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString; // fallback nếu ko phải ISO string

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

interface OrderData {
  tracking_code: string;
  package_name: string;
  weight_kg: number | string;
  sender_province: string;
  receiver_province: string;
  status?: string;
  [key: string]: any;
}

interface TimelineItem {
  id?: string | number;
  time?: string;
  created_at?: string;
  status?: string;
  title?: string;
  location?: string;
  description?: string;
  [key: string]: any;
}

export default function WidgetSection() {
  const [activeTab, setActiveTab] = useState<"tracking" | "quote" | "hubs">(
    "tracking",
  );

  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingResult, setTrackingResult] = useState<{
    order: OrderData;
    timeline: TimelineItem[];
  } | null>(null);

  const [quoteSender, setQuoteSender] = useState("Hồ Chí Minh");
  const [quoteReceiver, setQuoteReceiver] = useState("Hà Nội");
  const [quoteWeight, setQuoteWeight] = useState("1.7");
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);

  const [selectedCity, setSelectedCity] = useState("ALL");

  const hubsList = [
    {
      id: 1,
      name: "Hub Trung Tâm Hà Nội",
      city: "Hà Nội",
      address: "123 Đường Giải Phóng, Q. Hoàng Mai, Hà Nội",
      phone: "024.7777.8888",
      hours: "07:30 - 21:00",
    },
    {
      id: 2,
      name: "Hub Phía Nam - Tân Bình",
      city: "Hồ Chí Minh",
      address: "456 Cộng Hòa, P. 13, Q. Tân Bình, TP. HCM",
      phone: "028.7777.9999",
      hours: "07:00 - 22:00",
    },
    {
      id: 3,
      name: "Hub Trung Chuyển Đà Nẵng",
      city: "Đà Nẵng",
      address: "78 Nguyễn Hữu Thọ, Q. Cẩm Lệ, Đà Nẵng",
      phone: "0236.666.888",
      hours: "08:00 - 20:00",
    },
  ];

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setLoading(true);
    setError("");
    setTrackingResult(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/orders/tracking/${trackingCode.trim()}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Không tìm thấy thông tin đơn hàng với mã này.",
        );
      }

      setTrackingResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedWeight = quoteWeight.replace(",", ".");
    const w = parseFloat(normalizedWeight) || 1;

    let baseRate = 22000;
    if (quoteSender !== quoteReceiver) baseRate = 35000;

    const total = baseRate + Math.max(0, w - 1) * 10000;
    setEstimatedFee(total);
  };

  const filteredHubs =
    selectedCity === "ALL"
      ? hubsList
      : hubsList.filter((h) => h.city === selectedCity);

  return (
   <section className="w-full py-16 sm:py-24 px-4 sm:px-6 relative mx-auto max-w-7xl">
      <div className="max-w-4xl mx-auto w-full my-auto">
        {/* Header Widget */}
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" /> Tra cứu dữ liệu Real-time
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-blue-800 tracking-tight">
            Trung Tâm Dịch Vụ Khách Hàng
          </h2>
        </div>

        {/* Khung Bao Ngoài Widget */}
        <div className="bg-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl backdrop-blur-xl">
          {/* Tab Selector Responsive */}
          <div className="grid grid-cols-3 bg-slate-200 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl mb-6 gap-1">
            <button
              onClick={() => setActiveTab("tracking")}
              className={`py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "tracking"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-blue-800"
              }`}
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Tra Cứu</span>
            </button>

            <button
              onClick={() => setActiveTab("quote")}
              className={`py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "quote"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-blue-800"
              }`}
            >
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Cước Phí</span>
            </button>

            <button
              onClick={() => setActiveTab("hubs")}
              className={`py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                activeTab === "hubs"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-blue-800"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Bưu Cục</span>
            </button>
          </div>

          {/* ==================== TAB 1: TRACKING ==================== */}
          {activeTab === "tracking" && (
            <div className="space-y-6">
              <form
                onSubmit={handleTracking}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Nhập mã vận đơn (VD: LGTX-889922)..."
                  className="w-full bg-slate-200 border border-transparent rounded-xl px-4 py-3 text-sm text-blue-800 font-semibold focus:outline-none focus:border-blue-500 font-mono transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang tìm...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" /> Tra cứu
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {trackingResult && (
                <div className="mt-6 text-left bg-blue-200/90 p-4 sm:p-6 rounded-2xl border border-slate-100 space-y-6 animate-in fade-in duration-300">
                  {/* Top Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-900 bg-blue-100/80 border border-blue-500/20 px-3 py-1 rounded-full font-mono">
                          {trackingResult.order.tracking_code}
                        </span>
                        {/* Trạng thái hiện tại của đơn hàng */}
                        {trackingResult.order.status &&
                          (() => {
                            const statusInfo = STATUS_MAP[
                              trackingResult.order.status
                            ] || {
                              label: trackingResult.order.status,
                              badgeBg: "bg-white text-blue-900",
                            };
                            return (
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusInfo.badgeBg}`}
                              >
                                {statusInfo.label}
                              </span>
                            );
                          })()}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-blue-800 mt-2">
                        {trackingResult.order.package_name || "Bưu kiện"} (
                        {trackingResult.order.weight_kg} kg)
                      </h3>
                    </div>

                    <div className="sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      <span className="text-xs text-slate-500 block">
                        Tuyến chuyển phát
                      </span>
                      <span className="text-sm font-semibold text-blue-900">
                        {trackingResult.order.sender_province} →{" "}
                        {trackingResult.order.receiver_province}
                      </span>
                    </div>
                  </div>

                  {/* Cột Timeline được tối ưu trực quan */}
                  {trackingResult.timeline &&
                  trackingResult.timeline.length > 0 ? (
                    <div className="space-y-4 pt-1">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />{" "}
                        Nhật ký hành trình
                      </h4>

                      <div className="relative pl-6 space-y-6 border-l-2 border-blue-800/80 ml-2">
                        {[...trackingResult.timeline]
                          .reverse()
                          .map((item, idx) => {
                            const rawStatus = item.status || item.title || "";
                            const statusMeta = STATUS_MAP[rawStatus];
                            const isLatest = idx === 0;

                            const StatusIcon = statusMeta?.icon || CheckCircle2;

                            return (
                              <div
                                key={item.id || idx}
                                className="relative group"
                              >
                                <div
                                  className={`absolute -left-8.5 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                    isLatest
                                      ? "bg-white text-blue-400 ring-4"
                                      : "bg-blue-600 text-white ring-4 animate-pulse"
                                  }`}
                                >
                                  <StatusIcon className="w-3 h-3" />
                                </div>

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-mono text-slate-400 font-semibold">
                                      {formatDate(item.created_at || item.time)}
                                    </span>
                                    {item.location && (
                                      <span className="text-[11px] bg-slate-200 text-blue-800 font-medium px-2 py-0.5 rounded-md">
                                        {item.location}
                                      </span>
                                    )}
                                  </div>

                                  {/* Nhãn trạng thái hiển thị rõ ràng */}
                                  <p
                                    className={`text-sm font-semibold mt-1 ${isLatest ? "text-slate-900/20" : "text-blue-900"}`}
                                  >
                                    {statusMeta ? statusMeta.label : rawStatus}
                                  </p>

                                  {item.description && (
                                    <p className="text-xs text-slate-900 mt-1 bg-slate-200/50 p-2 rounded-lg">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Chưa có nhật ký hành trình cho vận đơn này.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 2: CƯỚC PHÍ ==================== */}
          {activeTab === "quote" && (
            <div className="space-y-6">
              <form
                onSubmit={handleCalculateQuote}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div className="space-y-1.5">
                  <label className="text-blue-900 font-semibold text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-900" /> Điểm gửi
                  </label>
                  <input
                    type="text"
                    value={quoteSender}
                    onChange={(e) => setQuoteSender(e.target.value)}
                    className="w-full bg-slate-200 border border-transparent rounded-xl px-3.5 py-2.5 text-sm text-blue-800 focus:outline-none focus:border-blue-500"
                    placeholder="VD: Hồ Chí Minh"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-blue-900 font-semibold text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-900" /> Điểm nhận
                  </label>
                  <input
                    type="text"
                    value={quoteReceiver}
                    onChange={(e) => setQuoteReceiver(e.target.value)}
                    className="w-full bg-slate-200 border border-transparent rounded-xl px-3.5 py-2.5 text-sm text-blue-800 focus:outline-none focus:border-blue-500"
                    placeholder="VD: Hà Nội"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-blue-900 font-semibold text-xs flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-400" /> Trọng
                    lượng (kg)
                  </label>
                  <input
                    type="text"
                    value={quoteWeight}
                    onChange={(e) => setQuoteWeight(e.target.value)}
                    className="w-full bg-slate-200 border border-transparent rounded-xl px-3.5 py-2.5 text-sm text-blue-800 focus:outline-none focus:border-purple-500"
                    placeholder="1.7"
                    required
                  />
                </div>

                <div className="sm:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <Calculator className="w-4 h-4" /> Tính Cước Ước Tính
                  </button>
                </div>
              </form>

              {estimatedFee !== null && (
                <div className="p-5 bg-blue-700/90 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                  <div>
                    <div className="text-md text-white font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900" />{" "}
                      Cước phí dự kiến
                    </div>
                    <div className="text-3xl font-black text-white mt-1">
                      {estimatedFee.toLocaleString("vi-VN")}{" "}
                      <span className="text-xs text-slate-100 font-normal">
                        VNĐ
                      </span>
                    </div>
                  </div>
                  <a
                    href="#cta"
                    className="w-full sm:w-auto px-6 py-3 bg-blue-100 hover:bg-blue-500 hover:text-white text-blue-800 font-semibold text-sm rounded-xl transition text-center flex items-center justify-center gap-2"
                  >
                    Tạo đơn vận chuyển <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: BƯU CỤC ==================== */}
          {activeTab === "hubs" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {["ALL", "Hà Nội", "Hồ Chí Minh", "Đà Nẵng"].map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      selectedCity === city
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 border border-slate-100 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    {city === "ALL" ? "Tất cả bưu cục" : city}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {filteredHubs.map((hub) => (
                  <div
                    key={hub.id}
                    className="p-4 bg-slate-100 border border-slate-200 rounded-2xl space-y-2.5 hover:border-blue-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-blue-800 text-sm">
                        {hub.name}
                      </h4>
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                        {hub.city}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1.5">
                      <p className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>{hub.address}</span>
                      </p>
                      <div className="flex items-center justify-between pt-1 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" />{" "}
                          {hub.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />{" "}
                          {hub.hours}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
