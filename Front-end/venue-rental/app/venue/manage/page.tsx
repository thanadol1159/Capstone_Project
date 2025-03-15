"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { apiJson } from "@/hook/api";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import { useRouter } from "next/navigation";
import { Venue } from "@/types/venue";
import { Plus, ArrowRight } from "lucide-react";

interface SlidingStates {
  [key: number]: boolean;
}

const AddVenuePage = () => {
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const router = useRouter();
  const [isCheckboxMode, setIsCheckboxMode] = useState(false);
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isButtonMode, setIsButtonMode] = useState(false);
  const [ownerNames, setOwnerNames] = useState<{ [key: number]: string }>({});
  const [selectedVenues, setSelectedVenues] = useState<number[]>([]);
  const [slidingButtonStates, setSlidingButtonStates] = useState<SlidingStates>(
    {}
  );
  const [slidingCheckboxStates, setSlidingCheckboxStates] =
    useState<SlidingStates>({});

  useEffect(() => {
    const fetchVenues = async () => {
      if (!accessToken) {
        router.push("/nk1/login");
        return;
      }

      try {
        const response = await apiJson.get("/venues/my_venues/");
        if (response.data.length === 0) {
          setVenues([]);
        } else {
          setVenues(response.data);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
        setVenues([]);
      }
    };

    fetchVenues();
  }, []);

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

  // Delete single venue
  const handleDelete = async (venueId: number) => {
    const isConfirmed = window.confirm("จะลบจริงหรอมันหายน้า");

    if (!isConfirmed) {
      return;
    }

    try {
      await apiJson.delete(`/venues/${venueId}/`);
      // Refresh venues after deletion
      const response = await apiJson.get("/venues/my_venues/");
      setVenues(response.data);
    } catch (error) {
      console.error("Error deleting venue:", error);
    }
  };

  // Delete multiple venues
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

      await Promise.all(deletePromises);

      // Refresh venues after deletion
      const response = await apiJson.get("/venues/my_venues/");
      setVenues(response.data);

      // Reset selection
      setSelectedVenues([]);
      setIsCheckAll(false);
      alert("สถานที่ที่เลือกทั้งหมดถูกลบเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error deleting venues:", error);
      alert("เกิดข้อผิดพลาดในการลบสถานที่");
    }
  };

  // Fetch owner names
  useEffect(() => {
    const fetchOwnerNames = async () => {
      if (venues) {
        const ownerNamePromises = venues.map(async (venue) => {
          try {
            const response = await apiJson.get(`/users/${venue.venue_owner}/`);
            return {
              venueId: venue.id,
              ownerName: response.data.username,
            };
          } catch (error) {
            console.error(`Error fetching owner for venue ${venue.id}:`, error);
            return {
              venueId: venue.id,
              ownerName: "Unknown",
            };
          }
        });

        const ownerNameResults = await Promise.all(ownerNamePromises);

        const ownerNameMap = ownerNameResults.reduce((acc: any, result) => {
          acc[result.venueId] = result.ownerName;
          return acc;
        }, {});

        setOwnerNames(ownerNameMap);
      }
    };

    fetchOwnerNames();
  }, [venues]);

  // Rest of the component remains the same...
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
        <p className="text-xl font-semibold text-[#3F6B96]">
          Manage & Add Venue
        </p>
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
            <button onClick={handleDeleteSelected}>ลบที่เลือกทั้งหมด</button>
          </div>
        </div>
      </div>

      {/* Add Venue Card */}
      <Link href="/nk1/venue/manage/add" className="text-xl font-semibold">
        <div className="bg-[#7397BB] hover:bg-[#E6F3FF] transition-colors cursor-pointer rounded-lg text-white hover:text-black">
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <Plus size={100} strokeWidth={3} />
            <span>เพิ่มสถานที่ของคุณ</span>
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

      <Link
        href="/nk1/venue/approvement"
        className="flex p-5 justify-between items-center bg-[#E6F3FF] hover:bg-[#7397BB] border border-[#7297BB] rounded-lg text-xl font-semibold"
      >
        <div className="flex-s">
          <p className="text-[#335473]">Venue Approvement</p>
        </div>
        <div className="flex items-center space-x-2">
          <ArrowRight color="#335473" size={40} />
        </div>
      </Link>

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
            className={`relative flex-grow bg-[#E6F3FF] p-6 rounded-lg border overflow-hidden transition-transform duration-300 ${
              slidingCheckboxStates[venue.id]
                ? "translate-x-10"
                : "translate-x-0"
            }`}
          >
            <div className="flex justify-between">
              <p className="font-bold text-black mb-2">{venue.venue_name}</p>
              <button onClick={Buttonmode} className="text-[#3F6B96] underline">
                Edit
              </button>
            </div>
            <div className="flex gap-4 items-start">
              {/* Venue Image */}
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <img
                  src={
                    venue.venue_images && venue.venue_images.length > 0
                      ? venue.venue_images[0].image_url // ใช้ image_url จาก API
                      : "/placeholder-image.jpg" // ภาพ placeholder หากไม่มีภาพ
                  }
                  alt={venue.venue_name || "Venue Image"} // ใช้ venue.name หรือข้อความ fallback
                  className="object-cover w-full h-full rounded-lg border-4 border-[#3F6B96]"
                />
              </div>

              {/* Venue Info */}
              <div className="space-y-2 text-sm text-gray-600 my-auto">
                {/* <p>
                  <span className="font-medium">Owner Name:</span> TEST
                </p> */}
                <p>
                  <span className="font-medium">Owner Name:</span>{" "}
                  {ownerNames[venue.id] || "Loading..."}
                </p>
                <p>รายละเอียด: {venue.additional_information}</p>
                <p>ประเภทกิจกรรม: {venue.category_event}</p>
                <div className="flex gap-1">
                  <p>Status:</p>
                  {venue.status === 3 ? (
                    <p className="text-green-600 font-semibold">Approved</p>
                  ) : venue.status === 2 ? (
                    <p className="text-yellow-500 font-semibold">Pending</p>
                  ) : venue.status === 1 ? (
                    <p className="text-red-600 font-semibold">Rejected</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Edit and Delete Buttons */}
            <Link
              href={`/nk1/venue/${venue.id}/edit`}
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
                href={`/nk1/venue/${venue.id}/edit`}
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
