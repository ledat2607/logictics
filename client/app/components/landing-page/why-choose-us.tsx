import { Cpu, ShieldCheck, RefreshCw, BarChart2 } from "lucide-react";

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: Cpu,
      title: "Trí Tuệ Nhân Tạo AI",
      desc: "Tự động phân tích và tối ưu hóa tuyến đường vận chuyển ngắn nhất, tránh ùn tắc.",
    },
    {
      icon: ShieldCheck,
      title: "Minh Bạch Tuyệt Đối",
      desc: "Mọi trạng thái đơn hàng được lưu vết và bảo mật nghiêm ngặt trên hệ thống.",
    },
    {
      icon: RefreshCw,
      title: "Đồng Bộ Real-Time",
      desc: "Cập nhật vị trí và mốc thời gian giao hàng tức thì cho cả chủ hàng và tài xế.",
    },
    {
      icon: BarChart2,
      title: "Báo Cáo Chuyên Sâu",
      desc: "Phân tích chi tiết hiệu suất vận tải và chi phí hàng tháng bằng bảng biểu thông minh.",
    },
  ];

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6 relative mx-auto max-w-7xl">
      {" "}
      <div className="my-auto space-y-8 sm:space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Vì Sao Chọn LOGISTIX.AI?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Giải pháp chuyển đổi số toàn diện cho chuỗi cung ứng hiện đại.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl sm:rounded-3xl bg-slate-900/30 border border-slate-800/60 backdrop-blur-sm space-y-4 hover:border-blue-500/40 transition duration-300 flex flex-col justify-between"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
