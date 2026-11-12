import { Camera, CheckCircle2, ShieldAlert, Edit3 } from "lucide-react";
import React, { useState, useEffect } from "react";

interface KYCFormProps {
  user: {
    identity_verified?: boolean;
    identity_number?: string;
    identity_front_url?: string;
    identity_back_url?: string;
  };
  onUpdateSuccess?: (updatedData: any) => void;
}

const KYCForm = ({ user, onUpdateSuccess }: KYCFormProps) => {
  const formatIdentity = (num?: string) => {
    if (!num) return "";
    const cleaned = num.replace(/\D/g, "");
    let formatted = "";
    for (let i = 0; i < cleaned.length; i += 3) {
      if (i > 0) formatted += "-";
      formatted += cleaned.slice(i, i + 3);
    }
    return formatted;
  };

  const [identityNumber, setIdentityNumber] = useState(
    formatIdentity(user?.identity_number),
  );

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  const [frontPreview, setFrontPreview] = useState<string | null>(
    user?.identity_front_url || null,
  );
  const [backPreview, setBackPreview] = useState<string | null>(
    user?.identity_back_url || null,
  );

  const [loading, setLoading] = useState(false);

  const isVerified = user?.identity_verified;

  const [isEditing, setIsEditing] = useState(!isVerified);

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "").slice(0, 12);
    let formatted = "";
    for (let i = 0; i < rawValue.length; i += 3) {
      if (i > 0) formatted += "-";
      formatted += rawValue.slice(i, i + 3);
    }
    setIdentityNumber(formatted);
  };

  const handleFrontImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFrontImage(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBackImage(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawIdentityNumber = identityNumber.replace(/-/g, "");

    if (rawIdentityNumber.length < 12) {
      alert("Vui lòng nhập đủ 12 số căn cước!");
      return;
    }

    const formData = new FormData();
    formData.append("identity_number", rawIdentityNumber);
    if (frontImage) formData.append("front_image", frontImage);
    if (backImage) formData.append("back_image", backImage);

    try {
      setLoading(true);
      const token = localStorage.getItem("token"); 

      const res = await fetch("http://localhost:5000/api/user/kyc", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cập nhật KYC thất bại!");

      alert("Cập nhật định danh thành công!");
      setIsEditing(false);
      if (onUpdateSuccess) onUpdateSuccess(data.user);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra khi gửi định danh!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">
            Xác thực định danh pháp lý (KYC)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Yêu cầu bắt buộc đối với chủ hàng để thực hiện đối soát và bảo hiểm
            vận đơn cao cấp.
          </p>
        </div>
        {isVerified && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Cập nhật lại
          </button>
        )}
      </div>

      {/* Banner trạng thái */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
          isVerified
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
            : "bg-amber-50/80 border-amber-200 text-amber-900"
        }`}
      >
        {isVerified ? (
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
        ) : (
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
        )}
        <div>
          <span className="font-bold">
            Trạng thái: {isVerified ? "Đã xác thực" : "Chưa xác thực"}.
          </span>{" "}
          {isVerified
            ? "Tài khoản của cậu đã được định danh thành công và mở khóa toàn bộ hạn mức vận chuyển."
            : "Vui lòng nhập số căn cước và tải lên hình ảnh hợp lệ để mở khóa toàn bộ hạn mức vận chuyển."}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Số CCCD / CMND
          </label>
          <input
            type="text"
            placeholder="038-xxx-xxxx"
            value={identityNumber}
            onChange={handleIdentityChange}
            disabled={!isEditing}
            className={`w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none tracking-wider font-medium ${
              !isEditing ? "bg-slate-100 cursor-not-allowed" : "bg-slate-50/50"
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Mặt trước CCCD */}
          <label
            className={`relative border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center min-h-[140px] ${
              isEditing
                ? "hover:border-blue-500 bg-slate-50/30 cursor-pointer group"
                : "bg-slate-50/50"
            }`}
          >
            {isEditing && (
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleFrontImageChange}
              />
            )}
            {frontPreview ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={frontPreview}
                  alt="Mặt trước CCCD"
                  className="max-h-24 rounded-lg object-cover shadow-sm"
                />
                <span className="text-[10px] font-semibold text-slate-600 mt-1">
                  Mặt trước CCCD
                </span>
                {isEditing && (
                  <span className="absolute bottom-6 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full">
                    Nhấn để đổi ảnh
                  </span>
                )}
              </div>
            ) : (
              <>
                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Mặt trước CCCD
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">
                  Định dạng PNG, JPG
                </span>
              </>
            )}
          </label>

          {/* Mặt sau CCCD */}
          <label
            className={`relative border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center transition-all flex flex-col items-center justify-center min-h-[140px] ${
              isEditing
                ? "hover:border-blue-500 bg-slate-50/30 cursor-pointer group"
                : "bg-slate-50/50"
            }`}
          >
            {isEditing && (
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleBackImageChange}
              />
            )}
            {backPreview ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={backPreview}
                  alt="Mặt sau CCCD"
                  className="max-h-24 rounded-lg object-cover shadow-sm"
                />
                <span className="text-[10px] font-semibold text-slate-600 mt-1">
                  Mặt sau CCCD
                </span>
                {isEditing && (
                  <span className="absolute bottom-6 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full">
                    Nhấn để đổi ảnh
                  </span>
                )}
              </div>
            ) : (
              <>
                <Camera className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <span className="text-[11px] font-semibold text-slate-600 block">
                  Mặt sau CCCD
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 block">
                  Định dạng PNG, JPG
                </span>
              </>
            )}
          </label>
        </div>

        {/* Nút lưu chỉ hiện khi đang ở chế độ chỉnh sửa */}
        {isEditing && (
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi định danh"}
            </button>
            {isVerified && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
              >
                Hủy
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
};

export default KYCForm;
