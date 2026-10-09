"use client";

import {
  PackageCheck,
  TrendingUp,
  Clock,
  ShieldCheck,
  Globe2,
  Users,
  Award,
  Zap,
  ArrowUpRight,
} from "lucide-react";

export default function Metrics() {
  // Dữ liệu chỉ số Logistics mở rộng
  const primaryStats = [
    {
      id: 1,
      label: "Đơn hàng đã xử lý",
      value: "1.25M+",
      subValue: "+12.5% so với tháng trước",
      trend: "up",
      icon: PackageCheck,
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-400",
      badgeBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      id: 2,
      label: "Tỷ lệ giao đúng giờ (SLA)",
      value: "99.4%",
      subValue: "Đạt chuẩn cam kết 24/7",
      progress: 99.4,
      icon: Clock,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
      badgeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      id: 3,
      label: "Độ an toàn hàng hóa",
      value: "99.98%",
      subValue: "Tỷ lệ sự cố < 0.02%",
      progress: 99.98,
      icon: ShieldCheck,
      color: "from-indigo-500 to-purple-500",
      textColor: "text-indigo-400",
      badgeBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      id: 4,
      label: "Mạng lưới bưu cục",
      value: "350+",
      subValue: "Phủ sóng 63/63 tỉnh thành",
      icon: Globe2,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-400",
      badgeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
  ];

  const secondaryStats = [
    {
      icon: Users,
      value: "50,000+",
      label: "Khách hàng Doanh nghiệp & Shop",
    },
    {
      icon: Zap,
      value: "1.5h",
      label: "Thời gian lấy hàng trung bình",
    },
    {
      icon: Award,
      value: "TOP 3",
      label: "Đơn vị vận chuyển uy tín 2026",
    },
    {
      icon: TrendingUp,
      value: "24/7",
      label: "Hệ thống AI giám sát tự động",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 relative mx-auto max-w-7xl">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-6xl mx-auto space-y-10 relative">
        {/* Header Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-900 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> Hiệu Năng Vận Hành
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-blue-900 tracking-tight">
            Con Số Nói Lên Chất Lượng Dịch Vụ
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Hệ thống hạ tầng logistics thông minh được tối ưu hóa bằng AI, đảm
            bảo minh bạch và chính xác trong từng đơn hàng.
          </p>
        </div>

        {/* Grid 1: 4 Khối Chỉ Số Chính với Visual Card Nâng Cấp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryStats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-slate-100/80 border border-transparent hover:border-blue-900/80 p-5 rounded-2xl shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Top: Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2.5 rounded-xl bg-slate-100 border border-blue-800 ${item.textColor}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {item.trend && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${item.badgeBg}`}
                      >
                        <ArrowUpRight className="w-3 h-3" /> +12.5%
                      </span>
                    )}
                  </div>

                  {/* Card Body: Label & Main Value */}
                  <span className="text-xs font-medium text-blue-800 uppercase tracking-wider block">
                    {item.label}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-blue-500 mt-1 tracking-tight">
                    {item.value}
                  </div>
                </div>

                {/* Card Bottom: Progress Bar hoặc SubText */}
                <div className="mt-4 pt-3 border-t border-blue-800/60">
                  {item.progress ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-blue-400">{item.subValue}</span>
                        <span className={`font-bold text-blue-400 ${item.textColor}`}>
                          {item.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-400 h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full bg-linear-to-r ${item.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-blue-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      {item.subValue}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid 2: Thanh Chỉ Số Phụ (Mini Banner Dashboard) */}
        <div className="bg-slate-100/40 border border-blue-800/60 rounded-2xl p-4 sm:p-6 backdrop-blur-md">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-blue-800/80">
            {secondaryStats.map((sec, idx) => {
              const SecIcon = sec.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3.5 ${
                    idx !== 0 ? "pt-3 sm:pt-0 sm:pl-4" : ""
                  }`}
                >
                  <div className="p-2.5 rounded-lg bg-blue-500/80 border border-blue-100/20 text-slate-100 shrink-0">
                    <SecIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-extrabold text-blue-800">
                      {sec.value}
                    </div>
                    <div className="text-xs text-slate-400 font-medium line-clamp-1">
                      {sec.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
