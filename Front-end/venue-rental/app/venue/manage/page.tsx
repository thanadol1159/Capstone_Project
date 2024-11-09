"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const AddVenuePage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold text-black">Manage & Add Venue</h1>

      {/* Add Venue Card */}
      <Link href="/venue/manage/add" className="text-xl font-semibold">
        <div className="bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer rounded-lg">
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-gray-600">เพิ่มสถานที่ของคุณ</span>
          </div>
        </div>
      </Link>

      {/* Existing Venue Card */}
      <div className="p-6 bg-gray-100 rounded-lg">
        <div className="flex justify-between">
          <p className="font-bold text-black mb-2">บ้านร่ำรวย</p>
          {/* Detail Button */}
          <button className="text-[#B67373] underline">Detail</button>
        </div>
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            {/* Venue Image */}
            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
              <Image
                src="/mockve.png"
                alt="บ้านร่าเริง"
                fill
                className="object-cover  rounded-lg border-4 border-[#B67373]"
              />
            </div>

            {/* Venue Details */}
            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Owner Name:</span> Manee
                </p>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  รายละเอียด: บ้าน 2 ชั้น มี 4 ห้องนอน 2 ห้องน้ำ ประตูน้ำ
                  ตั้งไม้เยอะ
                </p>
                <p>เฟอร์นิเจอร์: โต๊ะทีวี 27 นิ้ว, พัดลม, เตาปิ้งบาบีคิว</p>
                <p>ประเภทกิจกรรม: งานเลี้ยง, งานแต่ง, งานมั่ว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVenuePage;
