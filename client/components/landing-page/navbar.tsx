"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Menu,
  X,
  PhoneCall,
  Sparkles,
  Search,
  Calculator,
  ShieldCheck,
  Zap,
  User,
  LogOut,
  LayoutDashboard,
  LucideLogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import CreateOrderModal from "../user/order/create-order-modal";
import Link from "next/link";
import { useAuth } from "@/hooks/user-auth";
import { AvatarDropdown } from "./avatar-menu";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const { user, isAuthenticated, logoutSession, loading } = useAuth();

  const navItems = [
    { id: "hero", label: "Trang chủ", icon: Package },
    { id: "widget", label: "Tra cứu & Cước", icon: Search },
    { id: "why-us", label: "Vì sao chọn", icon: ShieldCheck },
    { id: "metrics", label: "Hiệu năng", icon: Calculator },
    { id: "features", label: "Tính năng", icon: Zap },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -40% 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-200/90 backdrop-blur-xl border-b border-slate-100/80 shadow-xl shadow-gray-50/90 rounded-b-2xl"
            : "bg-slate-200/60 backdrop-blur-sm py-3"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
          <a
            href="#hero"
            onClick={(e) => scrollToSection(e, "hero")}
            className="flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <div className="p-1.5 sm:p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-base sm:text-lg font-black tracking-tight text-blue-900 whitespace-nowrap">
              LOGISTICS<span className="text-blue-500">.EXPRESS</span>
            </span>
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-300/80 border border-transparent p-1.5 rounded-full backdrop-blur-xl">
            {navItems.map((item) => {
              const active = activeSection === item.id;
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "text-white bg-blue-600 shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-blue-500/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white cursor-pointer font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tạo đơn</span>
            </Button>
            {isAuthenticated && user ? (
              <AvatarDropdown user={user} logout={logoutSession} />
            ) : (
              <Link
                href="/auth"
                className="flex items-center justify-center w-full gap-1.5 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-5 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const active = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => scrollToSection(e, item.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {active && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </a>
                );
              })}
            </div>

            <div className="h-px bg-slate-100 my-2" />

            <div className="space-y-3 pt-1">
              <Button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tạo đơn hàng mới</span>
              </Button>

              {isAuthenticated && user ? (
                <div className="pt-2">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* 💡 Chèn trực tiếp Component AvatarDropdown của cậu */}
                      <AvatarDropdown user={user} logout={logoutSession} />

                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs font-bold text-slate-800">
                          {user.full_name}
                        </span>
                        <span className="truncate text-[11px] font-medium text-slate-400">
                          Chạm vào avatar để mở menu
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-blue-600 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Đăng nhập hệ thống</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      <CreateOrderModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
