"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { apiJson } from "@/hook/api";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";
import { useRouter } from "next/navigation";
import { Venue } from "@/types/venue";
import { Plus, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

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
  const venueRefs = useRef<(HTMLDivElement | null)[]>([]); // For GSAP

  useEffect(() => {
    const fetchVenues = async () => {
      if (!accessToken) {
        router.push("/nk1/login");
        return;
      }
      try {
        const response = await apiJson.get("/venues/my_venues/");
        setVenues(response.data.length === 0 ? [] : response.data);
      } catch (error) {
        console.error("Error fetching venues:", error);
        setVenues([]);
      }
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    if (venues) {
      const buttonStates: SlidingStates = {};
      const checkboxStates: SlidingStates = {};
      venues.forEach((venue) => {
        buttonStates[venue.id] = isButtonMode;
        checkboxStates[venue.id] = isCheckboxMode;
      });
      setSlidingButtonStates(buttonStates);
      setSlidingCheckboxStates(checkboxStates);
    }
  }, [isButtonMode, isCheckboxMode, venues]);

  const handleDelete = async (venueId: number) => {
    const confirmed = window.confirm("จะลบจริงหรอมันหายน้า");
    if (!confirmed) return;

    try {
      await apiJson.delete(`/venues/${venueId}/`);
      const response = await apiJson.get("/venues/my_venues/");
      setVenues(response.data);
      toast.success("Delete successful", {
        id: "delete-successes",
      });
    } catch (error) {
      console.error("Error deleting venue:", error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedVenues.length === 0) {
      toast.error("please select venues to delete", { id: "no-selection" });

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete all of venue?"
    );
    if (!confirmed) return;

    try {
      await Promise.all(
        selectedVenues.map((id) => apiJson.delete(`/venues/${id}/`))
      );
      const response = await apiJson.get("/venues/my_venues/");
      setVenues(response.data);
      setSelectedVenues([]);
      setIsCheckAll(false);
      toast.success("Delete successful", {
        id: "delete-success",
      });
    } catch (error) {
      console.error("Error deleting venues:", error);
      toast.error("เกิดข้อผิดพลาดในการลบสถานที่", { id: "delete-error" });
    }
  };

  useEffect(() => {
    const fetchOwnerNames = async () => {
      if (venues) {
        const results = await Promise.all(
          venues.map(async (venue) => {
            try {
              const res = await apiJson.get(`/users/${venue.venue_owner}/`);
              return { venueId: venue.id, ownerName: res.data.username };
            } catch {
              return { venueId: venue.id, ownerName: "Unknown" };
            }
          })
        );
        const ownerMap = results.reduce((acc: any, curr) => {
          acc[curr.venueId] = curr.ownerName;
          return acc;
        }, {});
        setOwnerNames(ownerMap);
      }
    };
    fetchOwnerNames();
  }, [venues]);

  const toggleButtonMode = () => {
    setIsButtonMode(!isButtonMode);
    if (isCheckboxMode) setIsCheckboxMode(false);
  };

  const toggleCheckboxMode = () => {
    setIsCheckboxMode(!isCheckboxMode);
    if (isButtonMode) setIsButtonMode(false);
  };

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setSelectedVenues(isCheckAll ? [] : venues?.map((v) => v.id) || []);
  };

  const handleSingleVenueSelect = (venueId: number) => {
    setSelectedVenues((prev) =>
      prev.includes(venueId)
        ? prev.filter((id) => id !== venueId)
        : [...prev, venueId]
    );
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#3F6B96]">
          Manage & Add Venue
        </h1>
        <button
          onClick={toggleCheckboxMode}
          className="px-4 py-2 rounded-lg font-semibold bg-gray-100 hover:bg-gray-200 transition text-black"
        >
          {isCheckboxMode ? "Cancel" : "Edit All"}
        </button>
      </div>

      {isCheckboxMode && (
        <div className="flex items-center gap-3 pb-2">
          <input
            type="checkbox"
            checked={isCheckAll}
            onChange={handleSelectAll}
            className="h-5 w-5 text-blue-600 rounded border-gray-300"
          />
          <p className="text-lg text-gray-600 font-bold">Check All</p>
          <button
            onClick={handleDeleteSelected}
            className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Delete all selected
          </button>
        </div>
      )}

      <Link href="/nk1/venue/manage/add">
        <div className="flex items-center justify-center bg-[#7397BB] hover:bg-[#E6F3FF] text-white hover:text-black transition rounded-xl p-12 cursor-pointer">
          <Plus size={80} />
          <span className="ml-4 text-2xl font-semibold">
            Add your Venue Places
          </span>
        </div>
      </Link>

      <Link
        href="/nk1/venue/approvement"
        className="flex justify-between items-center p-6 rounded-xl bg-[#E6F3FF] hover:bg-[#7397BB] border border-[#7297BB] transition"
      >
        <p className="text-xl text-[#335473] font-semibold">
          Venue Approvement
        </p>
        <ArrowRight size={36} color="#335473" />
      </Link>

      {/* Venue Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {venues?.map((venue, index) => (
          <div
            key={venue.id}
            className="relative bg-[#E6F3FF] border rounded-xl p-6 flex flex-col gap-4 transition"
          >
            {isCheckboxMode && (
              <input
                type="checkbox"
                checked={selectedVenues.includes(venue.id)}
                onChange={() => handleSingleVenueSelect(venue.id)}
                className="absolute top-4 left-4 h-5 w-5 text-blue-600 rounded"
              />
            )}

            <div className="flex items-start gap-6">
              <div className="w-32 h-32 overflow-hidden rounded-lg border-4 border-[#3F6B96]">
                <img
                  src={
                    venue.venue_images?.[0]?.image || "/placeholder-image.jpg"
                  }
                  alt={venue.venue_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <h2 className="font-bold text-black text-lg">
                  {venue.venue_name}
                </h2>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-black">Owner:</span>{" "}
                  {ownerNames[venue.id] || "Loading..."}
                </p>
                <p className="text-sm text-gray-600 text-ellipsis">
                  <span className="text-black font-semibold">Detail:</span>{" "}
                  {venue.additional_information}
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-black font-semibold">Status:</span>
                  {venue.status === 3 ? (
                    <span className="text-green-600 font-semibold">
                      Approved
                    </span>
                  ) : venue.status === 2 ? (
                    <span className="text-yellow-500 font-semibold">
                      Pending
                    </span>
                  ) : (
                    <span className="text-red-500 font-semibold">Rejected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <Link
                href={`/nk1/venue/${venue.id}/edit`}
                className="px-4 py-2 bg-[#3F6B96] hover:bg-[#335473] text-white rounded-lg text-sm transition"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(venue.id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddVenuePage;
