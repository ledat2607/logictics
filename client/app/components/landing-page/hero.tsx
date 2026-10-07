import { ArrowRight, ShieldCheck, Zap, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 relative mx-auto max-w-7xl">
      {" "}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full my-auto">
        {/* Cột trái: Văn bản & CTA */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            <span>Nền Tảng Logistics Thông Minh Thế Hệ Mới</span>
          </div>

          {/* Tiêu đề chính */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight">
            Tối Ưu Vận Chuyển <br className="hidden sm:inline" />
            Bằng{" "}
            <span className="bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Trí Tuệ Nhân Tạo
            </span>
          </h1>

          {/* Mô tả */}
          <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Hệ thống quản lý vận tải AI hỗ trợ lập kế hoạch định tuyến thông
            minh, tối ưu cước phí và theo dõi hành trình theo thời gian thực với
            độ chính xác cao.
          </p>

          {/* Nút hành động */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
            <a
              href="#widget"
              className="w-full sm:w-auto px-7 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
            >
              Trải Nghiệm Ngay <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#why-us"
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white font-bold rounded-2xl transition-all text-sm sm:text-base text-center"
            >
              Tìm Hiểu Thêm
            </a>
          </div>

          {/* Cam kết nhỏ */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Khóa dữ liệu
              minh bạch
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400" /> Báo giá tức thì trong 3s
            </span>
          </div>
        </div>

        {/* Cột phải: Card đồ họa minh họa */}
        <div className="lg:col-span-5 relative w-full max-w-md lg:max-w-none mx-auto">
          <div className="relative p-6 sm:p-8 bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                LIVE LOGS
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/50 flex items-center justify-between">
                <span className="text-slate-400">Định tuyến lộ trình:</span>
                <span className="text-emerald-400 font-bold">Tối ưu 28%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/50 flex items-center justify-between">
                <span className="text-slate-400">Thời gian dự kiến:</span>
                <span className="text-blue-400 font-bold">45 Phút (-15m)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/50 flex items-center justify-between">
                <span className="text-slate-400">Trạng thái AI:</span>
                <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />{" "}
                  Hoạt động
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
