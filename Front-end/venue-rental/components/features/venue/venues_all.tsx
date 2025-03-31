"use client";
import { useState, useEffect } from "react";
import useFetchVenues from "@/hook/Venue";
import VenueCard from "@/components/ui/Venuecards";
import { apiJson, apiML } from "@/hook/api";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUserId } from "@/hook/userid";
import axios from "axios";

export default function VenueRental() {
  const router = useRouter();
  const { venues } = useFetchVenues();
  const userId = useUserId();
  const categories = ["All", "Meeting", "Studio", "Party"," Wedding", "Event"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [recommendedVenues, setRecommendedVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setFileUrl(null);

    try {
      const response = await axios.get(
        "http://localhost:8080/export-venues/"
      );
      if (response.data.file_url) {
        setFileUrl(`http://localhost:8080${response.data.file_url}`);
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setLoading(false);
    }
  };

  const filters = {
    minAreaSize: "",
    maxAreaSize: "",
    minCapacity: "",
    maxCapacity: "",
    minPrice: "",
    maxPrice: "",
    minRooms: "",
    maxRooms: "",
    minOutdoorSpaces: "",
    maxOutdoorSpaces: "",
    minParkingSpace: "",
    maxParkingSpace: "",
  };
  const [filterState, setFilters] = useState(filters);

  const interests = [
    "Sports",
    "Arts & Culture",
    "Technology & Innovation",
    "Food & Lifestyle",
  ];

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkUserDetails = async () => {
      try {
        const response = await apiJson.get(`/user-details/`);

        // Find the user detail where user matches userId
        const userDetail = response.data.find(
          (detail: any) => detail.user === userId
        );

        if (userDetail && !userDetail.interested_check) {
          setShowInterestModal(true);
        }
      } catch (error) {
        console.error("Error checking user details:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserDetails();
  }, [userId]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const submitInterests = async () => {
    if (!userId || selectedInterests.length === 0) return;

    try {
      const getResponse = await apiJson.get(`/user-details/`);
      const userDetail = getResponse.data.find(
        (detail: any) => detail.user === userId
      );

      if (!userDetail) {
        console.error("User detail not found");
        return;
      }

      const response = await apiJson.put(`/user-details/${userDetail.id}/`, {
        ...userDetail,
        interested: selectedInterests,
        interested_check: true,
      });
      
      if (response.data) {
        setShowInterestModal(false);
      }
    } catch (error) {
      console.error("Error submitting interests:", error);
    }
    handleExport();
  };

  useEffect(() => {
    const fetchRecommendedVenues = async () => {
      console.log(userId);
      try {
        if (!userId) return;
        const response = await apiML.get(`/ml-predict/?user_id=${userId}`);
        setRecommendedVenues(response.data);
      } catch (error) {
        console.error("Error fetching recommended venues:", error);
      }
    };

    fetchRecommendedVenues();
  }, []);

  const handleDetailClick = (id: string) => {
    router.push(`/nk1/venue/${id}`);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
  };

  const filteredVenues = venues.filter((venue: any) => {
    const matchesCategory =
      selectedCategory === "All" || venue.category_event === selectedCategory;
    // const matchesSearch = venue.venue_name.toLowerCase().includes(searchQuery);
    const matchesStatus = venue.status === 3;

    const matchesAreaSize =
      (!filters.minAreaSize || venue.area_size >= filters.minAreaSize) &&
      (!filters.maxAreaSize || venue.area_size <= filters.maxAreaSize);
    const matchesCapacity =
      (!filters.minCapacity || venue.capacity >= filters.minCapacity) &&
      (!filters.maxCapacity || venue.capacity <= filters.maxCapacity);
    const matchesPrice =
      (!filters.minPrice || venue.price >= filters.minPrice) &&
      (!filters.maxPrice || venue.price <= filters.maxPrice);
    const matchesRooms =
      (!filters.minRooms || venue.number_of_rooms >= filters.minRooms) &&
      (!filters.maxRooms || venue.number_of_rooms <= filters.maxRooms);
    const matchesOutdoorSpaces =
      (!filters.minOutdoorSpaces ||
        venue.outdoor_spaces >= filters.minOutdoorSpaces) &&
      (!filters.maxOutdoorSpaces ||
        venue.outdoor_spaces <= filters.maxOutdoorSpaces);
    const matchesParkingSpace =
      (!filters.minParkingSpace ||
        venue.parking_space >= filters.minParkingSpace) &&
      (!filters.maxParkingSpace ||
        venue.parking_space <= filters.maxParkingSpace);

    return (
      matchesCategory &&
      // matchesSearch &&
      matchesStatus &&
      matchesAreaSize &&
      matchesCapacity &&
      matchesPrice &&
      matchesRooms &&
      matchesOutdoorSpaces &&
      matchesParkingSpace
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Radix UI Interest Selection Modal */}
      <Dialog.Root open={showInterestModal} onOpenChange={setShowInterestModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black p-6 rounded-lg w-full max-w-md">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Select Your Interests
            </Dialog.Title>
            <Dialog.Description className="mb-4">
              Please select at least one interest to help us personalize your
              experience.
            </Dialog.Description>

            {interests.map((interest) => (
        <label
          key={interest}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <input
            type="radio"
            name="interest"
            checked={selectedInterests.includes(interest)}
            onChange={() => handleInterestToggle(interest)}
            className="h-5 w-5 text-[#335473] rounded"
          />
          <span>{interest}</span>
        </label>
      ))}

            <div className="flex justify-end gap-2">
              {/* <Dialog.Close asChild>
                <button className="px-4 py-2 bg-gray-300 rounded">Skip</button>
              </Dialog.Close> */}
              <button
                onClick={submitInterests}
                className="px-4 py-2 bg-[#335473] text-white rounded"
                disabled={selectedInterests.length === 0}
              >
                Submit
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Category Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">Category</h2>
        <div className="flex items-center gap-4 justify-between">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-8 py-1 rounded-lg ${
                  category === selectedCategory
                    ? "bg-[#335473] text-white font-semibold"
                    : "bg-[#BCCFE1] text-[#7397BB] font-semibold"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 rounded-full border text-black"
            />
            <button
              onClick={handleFilterClick}
              className="justify-center items-center my-auto ml-2"
            >
              <Filter size={35} className="fill-[#335473]" />
            </button>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10 text-black">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Advanced Filters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Area Size</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minAreaSize"
                    placeholder="Min"
                    value={filters.minAreaSize}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    name="maxAreaSize"
                    placeholder="Max"
                    value={filters.maxAreaSize}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium">Capacity</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minCapacity"
                    placeholder="Min"
                    value={filters.minCapacity}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    name="maxCapacity"
                    placeholder="Max"
                    value={filters.maxCapacity}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium">Price</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>

              {/* Number of Rooms */}
              <div>
                <label className="block text-sm font-medium">Rooms</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minRooms"
                    placeholder="Min"
                    value={filters.minRooms}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    name="maxRooms"
                    placeholder="Max"
                    value={filters.maxRooms}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>

              {/* Outdoor Spaces */}
              <div>
                <label className="block text-sm font-medium">
                  Outdoor Spaces
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minOutdoorSpaces"
                    placeholder="Min"
                    value={filters.minOutdoorSpaces}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    name="maxOutdoorSpaces"
                    placeholder="Max"
                    value={filters.maxOutdoorSpaces}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>

              {/* Parking Space */}
              <div>
                <label className="block text-sm font-medium">
                  Parking Space
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minParkingSpace"
                    placeholder="Min"
                    value={filters.minParkingSpace}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                  <input
                    type="number"
                    name="maxParkingSpace"
                    placeholder="Max"
                    value={filters.maxParkingSpace}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-[#335473] text-white rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {recommendedVenues.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedVenues.map((venue: any) => (
              <VenueCard
                key={venue.id}
                {...venue}
                onDetailClick={handleDetailClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Venue Cards */}
      <h2 className="text-xl font-semibold mb-4 text-black">
        All Venues
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue: any) => (
            <VenueCard
              key={venue.id}
              {...venue}
              id={venue.id}
              onDetailClick={handleDetailClick}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-black text-[20px]">
            No venues found.
          </p>
        )}
      </div>
    </div>
  );
}
