import gsap from "gsap";
import { useRef } from "react";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const DropdownWithGsap = ({
  menuItems,
}: {
  menuItems: { label: string; href: string }[];
}) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="absolute hidden group-hover:block w-52 bg-white border rounded-md shadow-lg z-30"
    >
      {menuItems.map((sub) => (
        <Link
          key={sub.href}
          href={sub.href}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          {sub.label}
        </Link>
      ))}
    </div>
  );
};

export default DropdownWithGsap;
