"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import useFetchVenues from "@/hook/Venue";
import { Venue } from "@/types/venue";
// import axios from "axios";
import { apiJson } from "@/hook/api";

interface SlidingStates {
  [key: number]: boolean;
}

const AddVenuePage = () => {
  const { venues } = useFetchVenues();
  const [isCheckboxMode, setIsCheckboxMode] = useState(false);
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isButtonMode, setIsButtonMode] = useState(false);
  const [selectedVenues, setSelectedVenues] = useState<number[]>([]);
  const [slidingButtonStates, setSlidingButtonStates] = useState<SlidingStates>(
    {}
  );
  const [slidingCheckboxStates, setSlidingCheckboxStates] =
    useState<SlidingStates>({});

  useEffect(() => {
    if (venues) {
      const newButtonStates: SlidingStates = {};
      const newCheckboxStates: SlidingStates = {};
      venues.forEach((venue) => {
        newButtonStates[venue.id] = isButtonMode;
        newCheckboxStates[venue.id] = isCheckboxMode;
      });
      setSlidingButtonStates(newButtonStates);
      setSlidingCheckboxStates(newCheckboxStates);
    }
  }, [isCheckboxMode, isButtonMode, venues]);

  const handleDelete = async (venueId: number) => {
    const isConfirmed = window.confirm("จะลบจริงหรอมันหายน้า");

    if (!isConfirmed) {
      return;
    }

    try {
      await apiJson.delete(`/venues/${venueId}/`);
      // window.location.reload();
    } catch (error) {
      console.error("Error deleting venue:", error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedVenues.length === 0) {
      alert("กรุณาเลือกสถานที่ที่ต้องการลบ");
      return;
    }

    const isConfirmed = window.confirm(
      "คุณแน่ใจหรือไม่ว่าต้องการลบสถานที่ที่เลือกทั้งหมด?"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const deletePromises = selectedVenues.map((venueId) =>
        apiJson.delete(`/venues/${venueId}/`)
      );

      const responses = await Promise.all(deletePromises);

      const failedDeletes = responses.filter(
        (response) => response.status !== 200
      );

      alert("สถานที่ที่เลือกทั้งหมดถูกลบเรียบร้อยแล้ว");

      // Reload the page or update the venue state
      window.location.reload();
    } catch (error) {
      console.error("Error deleting venues:", error);
      alert("เกิดข้อผิดพลาดในการลบสถานที่");
    }
  };

  const Buttonmode = () => {
    setIsButtonMode(!isButtonMode);
    if (isCheckboxMode === true) {
      setIsCheckboxMode(!isCheckboxMode);
    }
  };

  const Checkboxmode = () => {
    setIsCheckboxMode(!isCheckboxMode);
    if (isButtonMode === true) {
      setIsButtonMode(!isButtonMode);
    }
  };

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    if (!isCheckAll) {
      const allVenueIds = venues?.map((venue) => venue.id) || [];
      setSelectedVenues(allVenueIds);
    } else {
      setSelectedVenues([]);
    }
  };

  const handleSingleVenueSelect = (venueId: number) => {
    setSelectedVenues((prev) =>
      prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId]
    );
  };

  return (
    <div className="container mx-auto p-14 space-y-6">
      <div className="flex w-full justify-between my-2">
        <p className="text-xl font-semibold text-black">Manage & Add Venue</p>
        <button
          onClick={Checkboxmode}
          className={`text-xl font-semibold transition-colors ${
            isCheckboxMode ? "text-red-500 hidden" : "text-black"
          }`}
        >
          แก้ไขทั้งหมด
        </button>
        <div
          className={`flex text-black gap-2 ${
            isCheckboxMode ? "block" : "hidden"
          } `}
        >
          <div
            className={`flex text-black gap-2 ${
              isCheckboxMode ? "block" : "hidden"
            }`}
          >
            <button onClick={() => setIsCheckboxMode(false)}>ยกเลิก</button>
            <button onClick={handleDeleteSelected}>ลบทั้งหมด</button>
          </div>
        </div>
      </div>

      {/* Add Venue Card */}
      <Link href="/venue/manage/add" className="text-xl font-semibold">
        <div className="bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer rounded-lg">
          <div className="flex flex-col items-center justify-center py-12">
            <span className="text-gray-600">เพิ่มสถานที่ของคุณ</span>
          </div>
        </div>
      </Link>

      {isCheckboxMode && (
        <div className="flex gap-5 font-bold">
          <input
            type="checkbox"
            checked={isCheckAll}
            onChange={handleSelectAll}
            className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded"
          />
          <p className="text-black text-lg underline">เลือกทั้งหมด</p>
        </div>
      )}

      {/* Existing Venue Cards */}
      {venues?.map((venue: Venue) => (
        <div
          key={venue.id}
          className="relative flex items-center space-x-4 transition-all duration-300"
        >
          {/* Checkbox */}
          {isCheckboxMode && (
            <div
              className={`transition-transform duration-300 ${
                slidingCheckboxStates[venue.id]
                  ? "translate-x-0"
                  : "-translate-x-10 opacity-0"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedVenues.includes(venue.id)}
                onChange={() => handleSingleVenueSelect(venue.id)}
                className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded"
              />
            </div>
          )}

          {/* Sliding Venue Card */}
          <div
            className={`relative flex-grow bg-gray-100 p-6 rounded-lg border overflow-hidden transition-transform duration-300 ${
              slidingCheckboxStates[venue.id]
                ? "translate-x-10"
                : "translate-x-0"
            }`}
          >
            <div className="flex justify-between">
              <p className="font-bold text-black mb-2">{venue.venue_name}</p>
              <button onClick={Buttonmode} className="text-[#B67373] underline">
                Edit
              </button>
            </div>
            <div className="flex gap-4 items-start">
              {/* Venue Image */}
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <img
                  src={venue.image}
                  alt={venue.venue_name}
                  className="object-cover w-full h-full rounded-lg border-4 border-[#B67373]"
                />
              </div>

              {/* Venue Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Owner Name:</span> TEST
                </p>
                <p>รายละเอียด: {venue.additional_information}</p>
                <p>เฟอร์นิเจอร์: TEST</p>
                <p>ประเภทกิจกรรม: {venue.category}</p>
              </div>
            </div>

            {/* Edit and Delete Buttons */}
            <Link
              href={`/venue/${venue.id}/edit`}
              className={`absolute right-0 top-0 h-full w-20 bg-[#666666] text-white flex items-center justify-center transition-transform duration-300 ease-in-out rounded-lg ${
                slidingCheckboxStates[venue.id]
                  ? "translate-x-0"
                  : "translate-x-full"
              }`}
            >
              Edit
            </Link>

            <div
              className={`absolute right-0 top-0 h-full flex items-center justify-center transition-transform duration-300 ease-in-out rounded-lg ${
                slidingButtonStates[venue.id]
                  ? "translate-x-0"
                  : "translate-x-full"
              }`}
            >
              <button
                onClick={Buttonmode}
                className={`text-[#B67373] underline px-6 top-5 absolute left-[-100px]  ${
                  isButtonMode ? "block" : "hidden"
                }`}
              >
                สำเร็จ
              </button>
              <Link
                href={`/venue/${venue.id}/edit`}
                className={`h-full w-20 bg-[#666666] text-white flex items-center justify-center rounded-l-lg`}
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(venue.id)}
                className="h-full w-20 bg-[#E03030] text-white flex items-center justify-center rounded-r-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddVenuePage;
