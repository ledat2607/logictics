import { useCallback, useEffect, useState } from "react";
import { decryptData, encryptData } from "./user-auth";

export interface Order {
  id: string;
  tracking_code: string;
  customer_id: string;
  assigned_driver_id: string | null;
  current_warehouse_id: string | null;

  // Thông tin người gửi
  sender_name: string;
  sender_phone: string;
  sender_address_full: string;
  sender_province: string;
  sender_district: string;

  // Thông tin người nhận
  receiver_name: string;
  receiver_phone: string;
  receiver_address_full: string;
  receiver_province: string;
  receiver_district: string;

  // Thông tin hàng hóa & kích thước
  package_name: string;
  chargeable_weight_kg: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  weight_kg: string;

  // Tài chính & Thanh toán
  shipping_fee: string;
  cod_amount: string;
  insurance_fee: string | null;
  total_amount: string;
  payer: "sender" | "receiver" | string;
  payment_status: "unpaid" | "paid" | string;

  // Trạng thái đơn hàng & metadata
  status: "created" | "shipping" | "completed" | "cancelled" | string;
  note: string | null;
  metadata: Record<string, any> | null;

  // Thời gian
  created_at: string;
  updated_at: string;
}

export const useOrder = (initialPage = 1, initialLimit = 10) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: initialLimit,
    totalOrders: 0,
    totalPages: 1,
  });

  const fetchOrders = useCallback(
    async (currentPage = page, currentLimit = limit) => {
      const BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const getDecryptedToken = () => {
        const encryptedToken = localStorage.getItem("token");
        return encryptedToken ? decryptData(encryptedToken) : "";
      };

      const requestOrders = async (accessToken: string) => {
        return fetch(
          `${BASE_URL}/api/orders/all-orders?page=${currentPage}&limit=${currentLimit}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
      };

      try {
        setLoading(true);
        setError(null);

        let token = getDecryptedToken();
        if (!token) {
          throw new Error(
            "Không tìm thấy token xác thực. Vui lòng đăng nhập lại!",
          );
        }

        let response = await requestOrders(token);

        // Nếu Access Token hết hạn (401) -> gọi /api/auth/refresh để xin token mới và gọi lại 1 lần
        if (response.status === 401) {
          const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const refreshData = await refreshRes.json();
          const newToken = refreshData?.accessToken || refreshData?.token;

          if (!refreshRes.ok || !newToken) {
            throw new Error(
              refreshData?.error ||
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
            );
          }

          const encryptedNewToken = encryptData(newToken);
          if (encryptedNewToken) {
            localStorage.setItem("token", encryptedNewToken);
          }

          // Gọi lại API lấy danh sách đơn hàng với token mới
          response = await requestOrders(newToken);
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Không thể lấy danh sách đơn hàng!");
        }

        setOrders(data.orders || []);
        setPagination(data.pagination || {});
      } catch (err: any) {
        console.error("❌ Lỗi khi tải danh sách đơn hàng:", err);
        setError(err?.message || "Đã xảy ra lỗi khi tải danh sách đơn hàng!");
      } finally {
        setLoading(false);
      }
    },
    [page, limit],
  );
  useEffect(() => {
    fetchOrders(page, limit);
  }, [page, limit, fetchOrders]);

  // Các hàm hỗ trợ chuyển trang
  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  return {
    orders,
    loading,
    error,
    pagination,
    page,
    setPage: changePage,
    setLimit,
    refetch: fetchOrders,
  };
};
