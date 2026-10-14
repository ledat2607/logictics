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


export const parseAddressComponents = (addressStr: string) => {
  if (!addressStr) return { province: "", district: "" };
  const parts = addressStr.split(",").map((p) => p.trim());
  
  // Tỉnh/Thành phố thường nằm ở cuối chuỗi địa chỉ (ví dụ: "Việt Nam" hoặc "Hồ Chí Minh")
  let province = parts.length > 0 ? parts[parts.length - 1] : "";
  if (province.toLowerCase() === "việt nam" || province.toLowerCase() === "vietnam") {
    province = parts.length > 1 ? parts[parts.length - 2] : province;
  }
  
  // Quận/Huyện thường nằm kề trước Tỉnh/Thành phố
  const district = parts.length > 2 ? parts[parts.length - 3] : (parts.length > 1 ? parts[0] : "");

  return { province, district };
};