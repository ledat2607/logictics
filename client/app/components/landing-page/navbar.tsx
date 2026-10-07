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
} from "lucide-react";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 py-2.5 shadow-xl"
          : "bg-slate-950/60 backdrop-blur-sm py-3"
      }`}
    >
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2">
        {/* Logo rút gọn linh hoạt trên mobile */}
        <a
          href="#hero"
          onClick={(e) => scrollToSection(e, "hero")}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <div className="p-1.5 sm:p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight text-white whitespace-nowrap">
            LOGISTICS<span className="text-blue-500">.EXPRESS</span>
          </span>
        </a>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800/80 p-1.5 rounded-full backdrop-blur-xl">
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
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
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
          <a
            href="#widget"
            onClick={(e) => scrollToSection(e, "widget")}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tạo đơn</span>
          </a>
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
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-2xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          {navItems.map((item) => {
            const active = activeSection === item.id;
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`flex items-center justify-between p-3 rounded-xl text-sm font-bold transition ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {active && <span className="w-2 h-2 rounded-full bg-white" />}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
