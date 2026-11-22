"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { decryptData, encryptData, useAuth } from "./user-auth";
import { toast } from "sonner";

export interface AddressItem {
  id: string;
  user_id?: string;
  contact_name: string;
  contact_phone: string;
  street_address: string;
  ward?: string | null;
  district: string;
  province: string;
  country_code?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  is_default: boolean;
  created_at?: string;
}

export interface AddressPayload {
  contact_name: string;
  contact_phone: string;
  street_address: string;
  ward?: string | null;
  district: string;
  province: string;
  country_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function useAddress() {
  const { refreshAccessToken, logoutSession } = useAuth();

  const [addresses, setAddresses] = useState<AddressItem[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getDecryptedToken = useCallback(() => {
    if (typeof window !== "undefined") {
      const encryptedToken = localStorage.getItem("token");
      return encryptedToken ? decryptData(encryptedToken) : "";
    }
  }, []);

  const requestWithAuth = useCallback(
    async (endpoint: string, init: RequestInit = {}) => {
      const doFetch = async (accessToken: string) => {
        return fetch(`${API_BASE_URL}${endpoint}`, {
          ...init,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(init.headers || {}),
          },
        });
      };

      let token = getDecryptedToken();
      let response = await doFetch(token);

      if (response.status === 401) {
        let newToken: string | null = null;

        if (typeof refreshAccessToken === "function") {
          newToken = await refreshAccessToken();
        }

        if (!newToken) {
          const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            newToken = refreshData?.accessToken || refreshData?.token || null;
          }
        }

        if (!newToken) {
          logoutSession?.();
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
          );
        }

        const encryptedNewToken = encryptData(newToken);
        if (encryptedNewToken && typeof window !== "undefined") {
          localStorage.setItem("token", encryptedNewToken);
        }

        response = await doFetch(newToken);
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || "Thao tác sổ địa chỉ thất bại!",
        );
      }

      return data;
    },
    [getDecryptedToken, logoutSession, refreshAccessToken],
  );

  const fetchAddresses = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError(null);

        let data;
        try {
          data = await requestWithAuth("/api/addresses/all-addresses", {
            method: "GET",
          });
        } catch (err: any) {
          if (err?.message?.includes("404")) {
            data = await requestWithAuth("/api/addresses", {
              method: "GET",
            });
          } else {
            throw err;
          }
        }

        const list: AddressItem[] = data?.addresses || data?.data || [];
        setAddresses(list);
        return list;
      } catch (err: any) {
        const msg = err?.message || "Không thể tải danh sách địa chỉ!";
        setError(msg);
        if (!silent) toast.error(msg);
        return [];
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [requestWithAuth],
  );
  const createAddress = useCallback(
    async (payload: AddressPayload) => {
      try {
        setSubmitting(true);
        setError(null);

        const data = await requestWithAuth("/api/addresses/add-new-address", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        toast.success(data?.message || "Thêm địa chỉ mới thành công!");
        await fetchAddresses(true);
        return data?.address || null;
      } catch (err: any) {
        const msg = err?.message || "Không thể thêm địa chỉ mới!";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchAddresses, requestWithAuth],
  );

  // Cập nhật địa chỉ theo UUID
  const updateAddress = useCallback(
    async (id: string, payload: Partial<AddressPayload>) => {
      try {
        setSubmitting(true);
        setError(null);

        const data = await requestWithAuth(`/api/addresses/update-address/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        toast.success(data?.message || "Cập nhật địa chỉ thành công!");
        await fetchAddresses(true);
        return data?.address || null;
      } catch (err: any) {
        const msg = err?.message || "Không thể cập nhật địa chỉ!";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchAddresses, requestWithAuth],
  );

  // Đặt địa chỉ mặc định
  const setDefaultAddress = useCallback(
    async (id: string) => {
      try {
        setSubmitting(true);
        setError(null);

        const data = await requestWithAuth(`/api/addresses/${id}/default-address`, {
          method: "PATCH",
        });

        toast.success(data?.message || "Đã đặt làm địa chỉ mặc định!");
        await fetchAddresses(true);
        return true;
      } catch (err: any) {
        const msg = err?.message || "Không thể đặt địa chỉ mặc định!";
        setError(msg);
        toast.error(msg);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchAddresses, requestWithAuth],
  );

  // Xóa địa chỉ theo UUID
  const deleteAddress = useCallback(
    async (id: string) => {
      try {
        setSubmitting(true);
        setError(null);

        const data = await requestWithAuth(`/api/addresses/delete-address/${id}`, {
          method: "DELETE",
        });

        toast.success(data?.message || "Đã xóa địa chỉ!");
        await fetchAddresses(true);
        return true;
      } catch (err: any) {
        const msg = err?.message || "Không thể xóa địa chỉ!";
        setError(msg);
        toast.error(msg);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchAddresses, requestWithAuth],
  );

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const defaultAddress = useMemo(
    () => addresses.find((item) => item.is_default) || addresses[0] || null,
    [addresses],
  );

  return {
    addresses,
    defaultAddress,
    loading,
    submitting,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
  };
}
