"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/hooks/user-auth";
import {
  LayoutDashboard,
  LucideLogOut,
  PersonStanding,
  Settings,
} from "lucide-react";

interface AvatarDropdownProps {
  user: User;
  logout: () => void;
}

export function AvatarDropdown({ user, logout }: AvatarDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src={user.avatar} alt="shadcn" />
              <AvatarFallback>{user.full_name.slice(0, 1)}</AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent className="w-64 rounded-2xl p-2 shadow-xl border border-slate-100 bg-white/95 backdrop-blur-md">
        {/* 🌟 1. THÔNG TIN NGƯỜI DÙNG (USER HEADER) 🌟 */}
        <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl mb-1 border border-slate-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20 text-sm">
            {user?.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate text-xs font-bold text-slate-800">
              {user?.full_name || "Người dùng"}
            </span>
            <span className="truncate text-[11px] text-slate-400">
              {user?.email || user?.phone || "chua_cap_nhat"}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

        {/* 🌟 2. DANH SÁCH MENU TÍNH NĂNG 🌟 */}
        <DropdownMenuGroup className="space-y-0.5">
          {/* Trang cá nhân */}
          <DropdownMenuItem className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 cursor-pointer transition-colors">
            <span className="flex items-center gap-2.5">
              <PersonStanding className="size-4 text-blue-600" />
              Trang cá nhân
            </span>
          </DropdownMenuItem>

          {(user?.role === "ADMIN" || user?.role === "DRIVER") && (
            <DropdownMenuItem className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 cursor-pointer transition-colors">
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className="size-4 text-emerald-600" />
                Trang quản lý
              </span>
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200">
                {user?.role}
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100/80 cursor-pointer transition-colors">
            <span className="flex items-center gap-2.5">
              <Settings className="size-4 text-amber-500" />
              Cài đặt tài khoản
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={logout}
            className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-600"
          >
            <span className="flex items-center gap-2.5">
              <LucideLogOut className="size-4" />
              Đăng xuất
            </span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
