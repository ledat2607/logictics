import React, { useState, useEffect } from "react";
import {
  Package,
  MapPin,
  Search,
  RefreshCw,
  Clock,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Order, useOrder } from "@/hooks/use-order";

const OrderUserManager = () => {
  const { orders, loading, error, pagination, page, setPage, refetch } =
    useOrder(1, 10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (orders && orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [orders, selectedOrder]);

  // Lọc đơn hàng theo mã vận đơn hoặc tên hàng hóa
  const filteredOrders = orders.filter(
    (order: Order) =>
      order.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.package_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Hàm hiển thị Badge trạng thái chuyên nghiệp
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "created":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
            Mới tạo
          </span>
        );
      case "shipping":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
            Đang giao
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Hoàn thành
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
      {/* Header section với tiêu đề và nút làm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Quản lý vận đơn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi chi tiết trạng thái và lịch sử các đơn hàng của bạn.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-all border border-slate-200 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Làm mới dữ liệu
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Danh sách đơn (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Ô tìm kiếm nhanh */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã vận đơn, hàng hóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400">
                Đang tải danh sách đơn hàng...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-xs text-red-500">
                {error}
              </div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order: Order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedOrder?.id === order.id
                      ? "border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-600 font-mono">
                      {order.tracking_code}
                    </span>
                    {renderStatusBadge(order.status)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-medium">
                        {order.package_name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {Number(order.cod_amount || 0).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                Không tìm thấy đơn hàng phù hợp
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Chi tiết đơn hàng được chọn (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between">
          {selectedOrder ? (
            <div className="space-y-5">
              {/* Header chi tiết */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Mã vận đơn
                  </span>
                  <h3 className="text-sm font-extrabold text-blue-600 font-mono mt-0.5">
                    {selectedOrder.tracking_code}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tổng tiền thu hộ (COD)
                  </span>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">
                    {Number(selectedOrder.cod_amount || 0).toLocaleString(
                      "vi-VN",
                    )}{" "}
                    đ
                  </p>
                </div>
              </div>

              {/* Lộ trình Gửi - Nhận */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span>Người gửi</span>
                  </div>
                  <p className="font-semibold text-slate-800 pt-1">
                    {selectedOrder.sender_name}
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {selectedOrder.sender_phone}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">
                    {selectedOrder.sender_address_full}
                  </p>
                </div>

                <div className="space-y-1 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-4">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                    <span>Người nhận</span>
                  </div>
                  <p className="font-semibold text-slate-800 pt-1">
                    {selectedOrder.receiver_name}
                  </p>
                  <p className="text-slate-500 font-mono text-[11px]">
                    {selectedOrder.receiver_phone}
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">
                    {selectedOrder.receiver_address_full}
                  </p>
                </div>
              </div>

              {/* Thông số kiện hàng & Cước phí */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/60 space-y-3 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Thông tin hàng hóa & Cước phí
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">
                      Loại hàng
                    </span>
                    <strong className="text-slate-700 font-medium truncate block">
                      {selectedOrder.package_name}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">
                      Trọng lượng
                    </span>
                    <strong className="text-slate-700 font-medium block">
                      {selectedOrder.weight_kg} kg
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">
                      Phí vận chuyển
                    </span>
                    <strong className="text-slate-700 font-medium block">
                      {Number(selectedOrder.shipping_fee || 0).toLocaleString(
                        "vi-VN",
                      )}{" "}
                      đ
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">
                      Thanh toán cước
                    </span>
                    <strong className="text-slate-700 font-medium uppercase block">
                      {selectedOrder.payer}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 text-slate-400 text-xs">
              <Package className="w-10 h-10 mb-2 opacity-40" />
              Vui lòng chọn một đơn hàng ở danh sách bên trái để xem chi tiết
            </div>
          )}

          {/* Thanh phân trang nhỏ gọn bên dưới */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200/60 text-xs">
              <span className="text-slate-500 font-medium">
                Trang{" "}
                <strong className="text-slate-800">
                  {pagination.currentPage}
                </strong>{" "}
                / {pagination.totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  Trước
                </button>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-all"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderUserManager;
