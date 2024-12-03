"use client";
import React from "react";
import Link from "next/link"; // Import the Link component
import { usePathname } from "next/navigation";

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  if (pathname === "/" || "/login" || pathname.match(/([0-9])/g)) {
    return null;
  }

  const sideItems = [
    {
      label: "Book Venue",
      href: "/venue/book",
      imgurl: "/logo/Booking_icon.png",
    },
    {
      label: "Manage Venue",
      href: "#",
      imgurl: "/logo/Manage_icon.png",
    },
    {
      label: "Rental Request",
      href: "/rental-request",
      imgurl: "/logo/RentalReq_icon.png",
    },
    { label: "(FOR ADMIN)", href: "/tttt", imgurl: "/logo/Approve_icon.png" },
  ];

  return (
    <div className="w-20 h-screen bg-gray-300 flex flex-col items-center pt-5">
      {sideItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <div
            className={`
            p-2 mb-5 text-center text-sm text-black cursor-pointer flex flex-col items-center 
            ${pathname === item.href ? "bg-gray-400" : ""}  
            hover:bg-gray-400 delay-[50ms] duration-300
          `}
          >
            <img src={item.imgurl} alt={item.label} className="w-6 h-6 mb-1" />
            {item.label}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
