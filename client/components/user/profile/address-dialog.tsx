"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Phone,
  User,
  X,
  Loader2,
  Search,
  Copy,
  Check,
  Building2,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAddress, AddressItem, AddressPayload } from "@/hooks/address";

interface AddressFormState {
  contact_name: string;
  contact_phone: string;
  street_address: string;
  ward: string;
  district: string;
  province: string;
  latitude: string;
  longitude: string;
  is_default: boolean;
}

const EMPTY_FORM: AddressFormState = {
  contact_name: "",
  contact_phone: "",
  street_address: "",
  ward: "",
  district: "",
  province: "",
  latitude: "",
  longitude: "",
  is_default: false,
};

export function AddressBookSection() {
  const {
    addresses,
    loading,
    submitting,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
  } = useAddress();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "default">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(
    null,
  );
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
  const [showCoords, setShowCoords] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Confirm delete modal riêng thay cho window.confirm
  const [confirmDeleteItem, setConfirmDeleteItem] =
    useState<AddressItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAdminArea = (
    item: Pick<AddressItem, "ward" | "district" | "province">,
  ) => [item.ward, item.district, item.province].filter(Boolean).join(", ");

  const formatFullAddress = (
    item: Pick<
      AddressItem,
      "street_address" | "ward" | "district" | "province"
    >,
  ) =>
    [item.street_address, item.ward, item.district, item.province]
      .filter(Boolean)
      .join(", ");

  const filteredAddresses = useMemo(() => {
    return addresses.filter((item) => {
      if (filterMode === "default" && !item.is_default) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const haystack = [
        item.contact_name,
        item.contact_phone,
        item.street_address,
        item.ward,
        item.district,
        item.province,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [addresses, filterMode, searchQuery]);

  const openCreateModal = () => {
    setEditingAddress(null);
    setForm({
      ...EMPTY_FORM,
      is_default: addresses.length === 0,
    });
    setShowCoords(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AddressItem) => {
    setEditingAddress(item);
    const hasCoords = Boolean(item.latitude || item.longitude);
    setForm({
      contact_name: item.contact_name || "",
      contact_phone: item.contact_phone || "",
      street_address: item.street_address || "",
      ward: item.ward || "",
      district: item.district || "",
      province: item.province || "",
      latitude: item.latitude != null ? String(item.latitude) : "",
      longitude: item.longitude != null ? String(item.longitude) : "",
      is_default: Boolean(item.is_default),
    });
    setShowCoords(hasCoords);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setEditingAddress(null);
    setFormError(null);
  };

  const handleCopyAddress = async (item: AddressItem) => {
    const text = `${item.contact_name} - ${item.contact_phone} | ${formatFullAddress(item)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      toast.success("Đã sao chép thông tin địa chỉ!");
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      toast.error("Không thể sao chép địa chỉ!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !form.contact_name.trim() ||
      !form.contact_phone.trim() ||
      !form.street_address.trim() ||
      !form.district.trim() ||
      !form.province.trim()
    ) {
      setFormError(
        "Vui lòng điền đầy đủ Tên liên hệ, Số điện thoại, Địa chỉ chi tiết, Quận/Huyện và Tỉnh/Thành!",
      );
      return;
    }

    const lat = form.latitude.trim() ? Number(form.latitude.trim()) : null;
    const lng = form.longitude.trim() ? Number(form.longitude.trim()) : null;
    if (
      (lat !== null && Number.isNaN(lat)) ||
      (lng !== null && Number.isNaN(lng))
    ) {
      setFormError("Tọa độ vĩ độ / kinh độ phải là số hợp lệ!");
      return;
    }

    const payload: AddressPayload = {
      contact_name: form.contact_name.trim(),
      contact_phone: form.contact_phone.trim(),
      street_address: form.street_address.trim(),
      ward: form.ward.trim() || null,
      district: form.district.trim(),
      province: form.province.trim(),
      latitude: lat,
      longitude: lng,
      is_default: form.is_default,
    };

    if (editingAddress) {
      const updated = await updateAddress(editingAddress.id, payload);
      if (updated) closeModal();
    } else {
      const created = await createAddress(payload);
      if (created) closeModal();
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteItem) return;
    setDeletingId(confirmDeleteItem.id);
    try {
      const ok = await deleteAddress(confirmDeleteItem.id);
      if (ok) setConfirmDeleteItem(null);
    } finally {
      setDeletingId(null);
    }
  };

  const previewAddress = formatFullAddress({
    street_address: form.street_address.trim(),
    ward: form.ward.trim(),
    district: form.district.trim(),
    province: form.province.trim(),
  });

  return (
    <div className="rounded-3xl bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_10px_35px_-10px_rgba(15,23,42,0.08)] border border-slate-200/80">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Sổ địa chỉ giao / nhận hàng
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {addresses.length} địa điểm
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Quản lý kho bãi, điểm lấy hàng và địa chỉ nhận hàng cố định của
              doanh nghiệp.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm địa chỉ mới
        </button>
      </div>

      {/* Toolbar: Search & Quick Filter */}
      {addresses.length > 0 && (
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên kho, số điện thoại, đường, quận/huyện..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-8 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="inline-flex rounded-xl bg-slate-100/90 p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                filterMode === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tất cả ({addresses.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("default")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                filterMode === "default"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Mặc định
            </button>
          </div>
        </div>
      )}

      {/* Address Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map((skeleton) => (
              <div
                key={skeleton}
                className="h-44 rounded-2xl border border-slate-200/80 bg-slate-50/80 animate-pulse p-5"
              />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-b from-slate-50/80 to-white py-14 px-6 text-center">
            <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Chưa có địa chỉ nào được lưu
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Lưu sẵn địa chỉ kho hàng hoặc điểm giao nhận thường xuyên để tự
              động điền khi tạo vận đơn.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm địa chỉ đầu tiên
            </button>
          </div>
        ) : filteredAddresses.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              Không tìm thấy địa chỉ phù hợp với từ khóa "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterMode("all");
              }}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAddresses.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`relative rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
                    item.is_default
                      ? "border-blue-400/70 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 shadow-sm shadow-blue-900/5"
                      : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5"
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                            item.is_default
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.contact_name?.charAt(0)?.toUpperCase() || "Đ"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {item.contact_name}
                          </p>
                          <p className="text-xs font-medium text-slate-500 inline-flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {item.contact_phone}
                          </p>
                        </div>
                      </div>

                      {item.is_default ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-600/10 border border-blue-600/20 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          Mặc định
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => setDefaultAddress(item.id)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer disabled:opacity-50"
                        >
                          <Star className="w-3 h-3" />
                          Đặt mặc định
                        </button>
                      )}
                    </div>

                    {/* Address Body */}
                    <div className="mt-4 rounded-xl bg-slate-50/80 border border-slate-100 p-3.5">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div className="text-sm leading-relaxed">
                          <p className="font-semibold text-slate-800">
                            {item.street_address}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatAdminArea(item)}
                          </p>
                          {(item.latitude || item.longitude) && (
                            <p className="text-[11px] font-mono text-slate-400 mt-1 inline-flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {item.latitude}, {item.longitude}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Sao chép
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer disabled:opacity-50"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Chỉnh sửa
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setConfirmDeleteItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Portal Modal Thêm / Sửa (phủ toàn màn hình chuẩn xác) */}
      {mounted &&
        isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {editingAddress
                        ? "Cập nhật địa chỉ"
                        : "Thêm địa chỉ giao / nhận mới"}
                    </h3>
                    <p className="text-xs text-slate-300">
                      Thông tin dùng để điều phối lấy hàng và giao nhận vận đơn
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                    {formError}
                  </div>
                )}

                {/* Section 1: Thông tin liên hệ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tên người liên hệ / Tên kho{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={form.contact_name}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            contact_name: e.target.value,
                          }))
                        }
                        placeholder="VD: Kho Tổng Tân Bình"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Số điện thoại liên hệ{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={form.contact_phone}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            contact_phone: e.target.value,
                          }))
                        }
                        placeholder="VD: 0901234567"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Khu vực hành chính */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tỉnh / Thành phố <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.province}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          province: e.target.value,
                        }))
                      }
                      placeholder="TP. Hồ Chí Minh"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Quận / Huyện <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          district: e.target.value,
                        }))
                      }
                      placeholder="Quận Tân Bình"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phường / Xã
                    </label>
                    <input
                      type="text"
                      value={form.ward}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, ward: e.target.value }))
                      }
                      placeholder="Phường 12"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Section 3: Đường / Số nhà */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.street_address}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        street_address: e.target.value,
                      }))
                    }
                    placeholder="VD: Số 45 Trường Chinh, Cổng số 2"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:outline-none transition"
                  />
                </div>

                {/* Live Address Preview */}
                {previewAddress && (
                  <div className="rounded-xl bg-blue-50/60 border border-blue-100 px-3.5 py-2.5 text-xs text-slate-600 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-700">
                        Hiển thị trên vận đơn:{" "}
                      </span>
                      <span>{previewAddress}</span>
                    </div>
                  </div>
                )}

                {/* Optional GPS Coordinates */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCoords((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {showCoords
                      ? "Ẩn tọa độ GPS"
                      : "+ Thêm tọa độ GPS (tùy chọn cho điều phối xe)"}
                  </button>

                  {showCoords && (
                    <div className="mt-2.5 grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={form.latitude}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            latitude: e.target.value,
                          }))
                        }
                        placeholder="Vĩ độ (VD: 10.776889)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={form.longitude}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            longitude: e.target.value,
                          }))
                        }
                        placeholder="Kinh độ (VD: 106.700806)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Default Switch */}
                <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 cursor-pointer select-none">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Đặt làm địa chỉ mặc định
                    </p>
                    <p className="text-xs text-slate-500">
                      Tự động chọn địa chỉ này khi tạo đơn vận chuyển mới
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        is_default: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingAddress ? "Lưu thay đổi" : "Lưu địa chỉ"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Portal Modal Xác nhận xóa */}
      {mounted &&
        confirmDeleteItem &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Xóa địa chỉ khỏi sổ?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hành động này không thể hoàn tác
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-sm">
                <p className="font-semibold text-slate-900">
                  {confirmDeleteItem.contact_name} •{" "}
                  {confirmDeleteItem.contact_phone}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {formatFullAddress(confirmDeleteItem)}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={Boolean(deletingId)}
                  onClick={() => setConfirmDeleteItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Giữ lại
                </button>
                <button
                  type="button"
                  disabled={Boolean(deletingId)}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
                >
                  {deletingId && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
