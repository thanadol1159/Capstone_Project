"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Logout from "@/components/auth/LogOut";
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
  Menu,
  User,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [isExpanded, setIsExpanded] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const role = Cookies.get("role");
    setUserRole(role || null);
  }, []);

  if (!accessToken) return null;

  if (pathname === "/nk1/login" || pathname === "/nk1/signup") return null;

  const toggleSidebar = () => setIsExpanded(!isExpanded);
  const toggleMobileSidebar = () => setShowMobileSidebar(!showMobileSidebar);

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

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden fixed left-2 z-50 top-18">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 bg-[#EAF2FF] text-[#6B86A0] rounded-full shadow"
        >
          <User className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-[#EAF2FF] shadow-md transition-all duration-300 z-50
    ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"}
    w-full md:w-[85px] md:top-16 md:h-[calc(100vh-64px)] md:translate-x-0
    flex flex-col items-center pt-2`}
      >
        {/* Sidebar Toggle Button */}
        {/* <button
          onClick={toggleSidebar}
          className="p-2 mb-4 text-[#6B86A0] hover:bg-[#D1E3FF] rounded-lg transition-all duration-300 hidden md:block"
        ></button> */}

        {/* Close button on Mobile */}
        <div className="md:hidden w-full px-2 pb-2">
          <button
            onClick={toggleMobileSidebar}
            className="w-full py-2 text-sm text-center bg-[#D1E3FF] rounded-lg text-[#6B86A0]"
          >
            Close
          </button>
        </div>

        {/* Sidebar items */}
        <div className="flex-1 overflow-y-auto w-full">
          {sideItems.map((item) => {
            if (item.show === false) return null;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMobileSidebar(false)}
              >
                <div
                  className={`p-3 mb-4 text-center text-xs text-[#6B86A0] cursor-pointer flex flex-col items-center
                    ${pathname === item.href ? "bg-[#D1E3FF] rounded-lg" : ""}
                    hover:bg-[#D1E3FF] transition-all duration-300 w-full`}
                >
                  {item.icon}
                  {isExpanded && <span className="mt-1">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Login / Logout Button */}
        <div className="mb-4 md:hidden">
          {accessToken ? (
            <Logout />
          ) : (
            <Link
              href="/nk1/login"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
