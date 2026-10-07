// Hàm ánh dịch mã trạng thái Database sang Tiếng Việt
export const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: "Khởi tạo nháp",
    created: "Đã tạo đơn - Chờ lấy",
    picking_up: "Đang đi lấy hàng",
    picked_up: "Đã lấy hàng / Đã nhập kho",
    in_transit: "Đang luân chuyển",
    delivered: "Giao hàng thành công",
    failed_delivery: "Giao hàng thất bại",
    cancelled: "Đã hủy đơn",
    returned: "Đã hoàn trả hàng",
  };

  return statusMap[status.toLowerCase()] || status;
};
