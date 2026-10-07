import { ArrowRight, Truck } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="w-full py-16 sm:pt-24 px-4 sm:px-6 relative mx-auto max-w-7xl">
      <div />
      {/* Cụm CTA Khối chính */}
      <div className="my-auto w-full bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center text-white space-y-6 shadow-2xl shadow-blue-600/20">
        <h2 className="text-2xl sm:text-4xl font-black leading-tight">
          Sẵn Sàng Bứt Phá Vận Hành Logistics?
        </h2>
        <p className="text-blue-100 max-w-xl mx-auto text-xs sm:text-base leading-relaxed">
          Đăng ký trải nghiệm ngay hôm nay để nhận ưu đãi giảm 20% cước vận
          chuyển cho 50 đơn hàng đầu tiên.
        </p>
        <div className="pt-2">
          <a
            href="#widget"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-blue-600 font-bold rounded-xl sm:rounded-2xl shadow-lg hover:bg-slate-100 transition-all text-xs sm:text-base w-full sm:w-auto"
          >
            Tạo Tài Khoản Dùng Thử <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
      {/* Footer Chân Trang */}
      <footer className="border-t border-slate-800/40 pt-6 text-slate-500 text-xs w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-slate-300 text-sm">
              LOGISTIX.AI System
            </span>
          </div>
          <p>
            © 2026 LOGISTIX. All rights reserved. Nền tảng Logistics tự động
            hóa.
          </p>
        </div>
      </footer>
    </section>
  );
}
