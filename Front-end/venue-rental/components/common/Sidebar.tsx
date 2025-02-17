"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import Cookies from "js-cookie";
import {
  Calendar,
  House,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = Cookies.get("role");
    setUserRole(role || null);
  }, []);

  if (!accessToken) return null;

  const sideItems = [
    {
      label: "Rental Request",
      href: "/nk1/user/approvevenue",
      icon: <Calendar className="w-6 h-6 mb-1 text-[#6B86A0]" />,
    },
    {
      label: "Venue Approval",
      href: "/nk1/venue/approvement",
      icon: <House className="w-6 h-6 mb-1 text-[#6B86A0]" />,
    },
    {
      label: "Admin Approval",
      href: "/nk1/admins/approvevenue",
      icon: <ShieldCheck className="w-6 h-6 mb-1 text-[#6B86A0]" />,
      show: userRole === "Admin",
    },
  ];

  if (pathname === "/nk1/login" || pathname === "/nk1/signup") {
    return null;
  }

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-[#EAF2FF] flex flex-col items-center pt-5 shadow-md transition-all duration-300 z-10 ${
        isExpanded ? "w-[85px]" : "w-[50px]"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="p-2 mb-4 text-[#6B86A0] hover:bg-[#D1E3FF] rounded-lg transition-all duration-300"
      >
        {isExpanded ? (
          <ChevronLeft className="w-6 h-6" />
        ) : (
          <ChevronRight className="w-6 h-6" />
        )}
      </button>

      <div className="flex-1 overflow-y-auto w-full">
        {sideItems.map((item) => {
          if (item.show === false) return null;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  p-3 mb-4 text-center text-xs text-[#6B86A0] cursor-pointer flex flex-col items-center
                  ${pathname === item.href ? "bg-[#D1E3FF] rounded-lg" : ""}
                  hover:bg-[#D1E3FF] transition-all duration-300 w-full
                `}
              >
                {item.icon}
                {isExpanded && <span className="mt-1">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
