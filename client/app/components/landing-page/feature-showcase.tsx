import { Bot, BarChart3, Globe2, CheckCircle2 } from "lucide-react";

export default function FeatureShowcase() {
  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 relative mx-auto max-w-7xl">
      {/* Tiêu đề chung */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-4xl font-black text-white">
          Công Nghệ AI & Sự Khác Biệt
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
          Xóa bỏ tình trạng giao chậm, mất hàng và thiếu thông tin minh bạch
          trong vận tải truyền thống.
        </p>
      </div>

      {/* Grid 2 Cột linh hoạt */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
        {/* CỘT TRÁI: 3 TÍNH NĂNG AI */}
        <div className="space-y-3 sm:space-y-4 flex flex-col justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-blue-400 flex items-center gap-2">
            🚀 Công Nghệ Vận Hành AI
          </h3>

          <div className="space-y-2.5 sm:space-y-3">
            <div className="p-3.5 sm:p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-start gap-3 sm:gap-4 hover:border-blue-500/40 transition duration-300 backdrop-blur-sm">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base">
                  Định Tuyến AI Real-time
                </h4>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  Tự động phân tích lưu lượng giao thông để tính toán hành trình
                  tối ưu nhất cho tài xế.
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-start gap-3 sm:gap-4 hover:border-indigo-500/40 transition duration-300 backdrop-blur-sm">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base">
                  Minh Bạch Hành Trình
                </h4>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  Mỗi cập nhật trạng thái đều được lưu vết thời gian chính xác
                  trong hệ thống dữ liệu.
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-start gap-3 sm:gap-4 hover:border-purple-500/40 transition duration-300 backdrop-blur-sm">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <Globe2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base">
                  API Chuẩn RESTful
                </h4>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  Dễ dàng tích hợp với bất kỳ hệ thống quản lý bán hàng hoặc
                  website nào qua vài dòng code.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG SO SÁNH */}
        <div className="space-y-3 sm:space-y-4 flex flex-col justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-indigo-400 flex items-center gap-2">
            ⚡ So Sánh Trực Quan
          </h3>

          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 h-full">
            {/* Truyền thống */}
            <div className="p-4 sm:p-5 bg-slate-950/80 border border-red-500/20 rounded-2xl space-y-2.5 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-red-400 mb-2 sm:mb-3 flex items-center gap-1.5">
                  ❌ Truyền Thống
                </h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">•</span> Cập nhật
                    trạng thái thủ công, dễ sai lệch vị trí.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">•</span> Phí ẩn
                    phát sinh không rõ ràng khi lưu kho.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-red-500 font-bold">•</span> Phản hồi
                    khiếu nại chậm trễ (24-48 giờ).
                  </li>
                </ul>
              </div>
            </div>

            {/* Logistix.AI */}
            <div className="p-4 sm:p-5 bg-slate-950/90 border border-blue-500/30 rounded-2xl space-y-2.5 flex flex-col justify-between ring-1 ring-blue-500/20 shadow-xl shadow-blue-500/5">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-blue-400 mb-2 sm:mb-3 flex items-center gap-1.5">
                  ✅ Logistix.AI
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    Theo dõi thời gian thực với mốc lịch sử minh bạch.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    Báo giá cước chính xác tự động trước khi bấm tạo đơn.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    Hệ thống log sự cố thông minh xử lý tức thì.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
