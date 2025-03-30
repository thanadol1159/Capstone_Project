"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import Logout from "@/components/auth/LogOut";
import { usePathname, useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { apiJson } from "@/hook/api";
import { useUserId } from "@/hook/userid";
import { Notification } from "@/types/Notifications";
import ExportCSVButton from "../ui/CsvButton";

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const userId = useUserId();
  const { accessToken, username } = useSelector(
    (state: RootState) => state.auth
  );

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

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
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const deleteReadNotifications = async () => {
    try {
      await apiJson.delete("/notifications/delete-read/", {
        data: { userId },
      });

      setNotifications(
        notifications.filter((notification) => !notification.isRead)
      );
    } catch (error) {
      console.error("Failed to delete read notifications:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (pathname === "/nk1/login" || pathname === "/nk1/signup") {
    return null;
  }

  // if (pathname === "/login" || pathname === "/signup" ) {
  //   return null;
  // }

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
        {
          label: "Favourite",
          href: "/nk1/favourite",
        },
      ]
    : [{ label: "Venue Rental", href: "/nk1" }];

  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
  };

  return (
    <nav className="w-full bg-[#335473] border-b border-gray-200 shadow-[rgba(0,0,0,0.2)_0px_4px_4px_0px] z-20">
      <div className="px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/nk1" className="text-xl font-semibold">
            <img src="/logo/logo2.png" alt="EVENT Logo" />
          </Link>

          <div className="flex items-center space-x-6">
            {navItems.map((item) =>
              item.dropdown ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                >
                  <Link
                    href={item.href}
                    className={`${
                      pathname === item.href ||
                      item.dropdown.some((subItem) =>
                        pathname.startsWith(subItem.href)
                      )
                        ? "text-[#C9D9EB] font-bold"
                        : "text-[#7397BB] font-bold"
                    } hover:text-[#C9D9EB] delay-75 duration-200`}
                  >
                    {item.label}
                  </Link>

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
                      ? "text-[#C9D9EB] font-bold"
                      : "text-[#7397BB] font-bold"
                  } hover:text-[#C9D9EB] delay-75 duration-200`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>

        <div>
          <ExportCSVButton />
        </div>

        {/* Right side items notifications */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-[#7397BB] transition-colors relative"
            >
              <Bell
                size={24}
                className={unreadCount > 0 ? "text-red-500" : "text-[#C9D9EB]"}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border overflow-hidden z-10">
                <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">Notifications</h3>
                  <button
                    onClick={deleteReadNotifications}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    Clear Read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                          notification.isRead
                            ? "bg-[#f2f6fc]"
                            : "bg-white font-bold "
                        }`}
                      >
                        <p className="text-sm text-gray-800">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(
                            notification.create_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
