"use client";
import React from "react";
import Link from "next/link";
import Logout from "@/components/auth/LogOut";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Venue Rental", href: "/venue-rental" },
    { label: "Management", href: "/venue/manage" },
  ];

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-[rgba(0,0,0,0.2)_0px_4px_4px_0px]">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-semibold">
            <img src="/logo/logo.png" alt="EVENT Logo" />
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  ${
                    pathname === item.href
                      ? "text-[#74512D] font-bold" // Active
                      : "text-[#D6C0B3] font-bold" // Default
                  } 
                  hover:text-[#74512D] delay-75 duration-200
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-600 hover:text-gray-900">
            <img src="/logo/help_icon.png" alt="" />
          </button>

          <button className="p-1 text-gray-600 hover:text-gray-900 relative">
            <img src="/logo/bell_icon.png" alt="" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <span className="text-gray-700">Username</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Logout />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
