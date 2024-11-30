"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import Logout from "@/components/auth/LogOut";
import { usePathname, useRouter } from "next/navigation";

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { accessToken, username } = useSelector(
    (state: RootState) => state.auth
  );

  const [dropdownVisible, setDropdownVisible] = useState(false);

  if (pathname === "/login") {
    return <div className="hidden" />;
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Venue Rental", href: "/venue-rental" },
    {
      label: "Management",
      href: "#",
      dropdown: [
        { label: "Book Venue", href: "/venue/booking" },
        { label: "Manage & Add Venue", href: "/venue/manage" },
      ],
    },
  ];

  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
  };

  const handleLogin = () => {
    router.push("/login");
  };

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
            {navItems.map((item) =>
              item.dropdown ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                >
                  {/* Parent*/}
                  <Link
                    href={item.href}
                    className={`${
                      pathname.startsWith(item.href)
                        ? "text-[#74512D] font-bold" // Active
                        : "text-[#D6C0B3] font-bold" // Default
                    } hover:text-[#74512D] delay-75 duration-200`}
                  >
                    {item.label}
                  </Link>

                  {/* Dropdown Menu */}
                  {dropdownVisible && (
                    <div
                      className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg border rounded-md"
                      onMouseLeave={handleMouseLeave}
                    >
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? "text-[#74512D] font-bold" // Active
                      : "text-[#D6C0B3] font-bold" // Default
                  } hover:text-[#74512D] delay-75 duration-200`}
                >
                  {item.label}
                </Link>
              )
            )}
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

          <div
            className={`flex items-center space-x-2 font-bold ${
              username ? "block" : "hidden"
            }`}
          >
            <div className="text-sm">
              <span className="text-gray-700">{username}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {accessToken ? (
              <Logout />
            ) : (
              <button
                className="bg-[#74512D] text-white px-4 py-2 rounded-md hover:bg-[#492b26]"
                onClick={handleLogin}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
