"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import Logout from "@/components/auth/LogOut";
import { usePathname } from "next/navigation";
import { Bell, Menu, EllipsisVertical, ChevronDown } from "lucide-react";
import { apiJson } from "@/hook/api";
import { useUserId } from "@/hook/userid";
import { Notification } from "@/types/Notifications";
import ExportCSVButton from "../ui/CsvButton";
import DropdownWithGsap from "../ui/DropdownGsap";

const Navigation = () => {
  const pathname = usePathname();
  const userId = useUserId();
  const { accessToken, username } = useSelector(
    (state: RootState) => state.auth
  );

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let lastNotificationCount = 0;

    const fetchNotifications = async () => {
      try {
        const response = await apiJson.get("/notifications/");
        const userNotifications = response.data.filter(
          (notification: Notification) => notification.user === userId
        );

        if (userNotifications.length !== lastNotificationCount) {
          setNotifications(userNotifications);
          lastNotificationCount = userNotifications.length;
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (accessToken && userId) {
      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 30000);
      return () => clearInterval(intervalId);
    }
  }, [accessToken, userId]);

  const handleNotificationClick = async (notificationId: number) => {
    try {
      await apiJson.patch(`/notifications/${notificationId}/`, {
        isRead: true,
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const deleteReadNotifications = async () => {
    try {
      await apiJson.delete("/notifications/delete-read/", { data: { userId } });
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (error) {
      console.error("Failed to delete read notifications:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (pathname === "/nk1/login" || pathname === "/nk1/signup") return null;

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
        { label: "Favourite", href: "/nk1/favourite" },
      ]
    : [{ label: "Venue Rental", href: "/nk1" }];

  return (
    <nav className="w-full bg-[#335473] shadow-md z-20">
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left Side: Logo + NavItems + Hamburger in same group */}
        <div className="flex items-center space-x-10">
          <Link href="/nk1">
            <img src="/nk1/logo/reallogo.png" alt="EVENT Logo" className="h-12 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.label} className="relative group">
                  <button
                    className={`flex items-center gap-1 font-semibold transition-colors group-hover:text-white ${
                      item.dropdown.some((sub) => pathname.startsWith(sub.href))
                        ? "text-white"
                        : "text-blue-200"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      size={16}
                      className="transition-transform duration-300 group-hover:rotate-180"
                    />
                  </button>
                  <DropdownWithGsap menuItems={item.dropdown} />
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-semibold transition-colors ${
                    pathname === item.href
                      ? "text-white"
                      : "text-blue-200 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Right Side: Buttons */}
        <div className="hidden md:flex items-center space-x-6">
          <ExportCSVButton />

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-[#2e4e6c] rounded-full transition"
            >
              <Bell
                size={22}
                className={unreadCount > 0 ? "text-red-500" : "text-blue-100"}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-40 overflow-hidden">
                <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">Notifications</h3>
                  <button
                    onClick={deleteReadNotifications}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Clear Read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id)}
                        className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 ${
                          n.isRead ? "bg-gray-100" : "bg-white font-semibold"
                        }`}
                      >
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(n.create_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {username && (
            <span className="text-sm text-white font-semibold pr-2">
              {username}
            </span>
          )}

          <div>
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

        {/* Hamburger (Mobile Only) */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <EllipsisVertical />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pb-4">
          <div className="space-y-2">
            {navItems.map((item) =>
              item.dropdown ? (
                <div key={item.label}>
                  <span className="block text-white font-semibold mb-1">
                    {item.label}
                  </span>
                  <div className="pl-4 space-y-1">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block text-blue-200 hover:text-white text-sm"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-blue-200 hover:text-white font-semibold"
                >
                  {item.label}
                </Link>
              )
            )}

            <div className="mt-4 flex-col space-y-2 hidden md:block">
              <ExportCSVButton />
              {accessToken ? (
                <Logout />
              ) : (
                <Link href="/nk1/login" className="text-white">
                  Login
                </Link>
              )}
            </div>

            <div className="mt-4 flex flex-col items-center space-y-2">
              <ExportCSVButton />
              <Link href="/nk1/login" className="text-white">
                Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
