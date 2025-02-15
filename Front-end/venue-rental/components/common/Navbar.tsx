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

  if (pathname === "/nk1/login" || pathname === "/nk1/signup") {
    return <div className="hidden" />;
  }

  const navItems = accessToken
    ? [
        { label: "Venue Rental", href: "/nk1" },
        {
          label: "Management",
          href: "#",
          dropdown: [
            { label: "Book Venue", href: "/nk1/venue/booking" },
            { label: "Manage & Add Venue", href: "/nk1/venue/manage" },
          ],
        },
      ]
    : [{ label: "Venue Rental", href: "/nk1" }];

  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
  };

  // const handleLogin = () => {
  //   router.push("/nk1/login");
  // };

  return (
    <nav className="w-full bg-[#335473] border-b border-gray-200 shadow-[rgba(0,0,0,0.2)_0px_4px_4px_0px] ">
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <Link href="/nk1" className="text-xl font-semibold">
            <img src="/nk1/logo/logo.png" alt="EVENT Logo" />
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
                      pathname === item.href ||
                      item.dropdown.some((subItem) =>
                        pathname.startsWith(subItem.href)
                      )
                        ? "text-[#C9D9EB] font-bold" // Active
                        : "text-[#7397BB] font-bold" // Default
                    } hover:text-[#C9D9EB] delay-75 duration-200`}
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
                      ? "text-[#C9D9EB] font-bold" // Active
                      : "text-[#7397BB] font-bold" // Default
                  } hover:text-[#C9D9EB] delay-75 duration-200`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center space-x-2">
          {/* <button className="p-1 text-gray-600 hover:text-gray-900">
            <img src="/logo/help_icon.png" alt="" />
          </button>

          <button className="p-1 text-gray-600 hover:text-gray-900 relative">
            <img src="/logo/bell_icon.png" alt="" />
          </button> */}

          <div
            className={`flex items-center pr-2 font-bold ${
              username ? "block" : "hidden"
            }`}
          >
            <div className="text-sm">
              <span className="text-[#C9D9EB]">{username}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {accessToken ? (
              <Logout />
            ) : (
              <Link
                className="bg-[#7397BB] text-white px-4 py-2 rounded-md hover:bg-[#C9D9EB]"
                href="/nk1/login"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
