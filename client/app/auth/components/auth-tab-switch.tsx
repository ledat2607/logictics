"use client";

interface AuthTabSwitchProps {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
}

export default function AuthTabSwitch({
  isLogin,
  setIsLogin,
}: AuthTabSwitchProps) {
  return (
    <div className="mt-6 flex rounded-xl bg-gray-100 p-1">
      <button
        type="button"
        onClick={() => setIsLogin(true)}
        className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
          isLogin
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Đăng nhập
      </button>
      <button
        type="button"
        onClick={() => setIsLogin(false)}
        className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
          !isLogin
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Đăng ký
      </button>
    </div>
  );
}
