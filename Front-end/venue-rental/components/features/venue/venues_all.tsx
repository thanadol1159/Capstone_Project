"use client";
import { useState, useEffect } from "react";
import useFetchVenues from "@/hook/Venue";
import VenueCard from "@/components/ui/Venuecards";
import Toppage from "@/components/ui/Toppage";
import { apiJson, apiML } from "@/hook/api";
import { useRouter } from "next/navigation";
import { Filter, X, Frown } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useUserId } from "@/hook/userid";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/hook/store";

export default function VenueRental() {
  const router = useRouter();
  const { venues } = useFetchVenues();
  const userId = useUserId();
  const categories = ["All", "party", "wedding", "film", "staycation"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [recommendedVenues, setRecommendedVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const handleExport = async () => {
    setLoading(true);
    setFileUrl(null);

    try {
      const response = await axios.get(
        "https://capstone24.sit.kmutt.ac.th/nk1/export-venues/"
      );
      if (response.data.file_url) {
        setFileUrl(
          `https://capstone24.sit.kmutt.ac.th/nk1/export-venues/${response.data.file_url}`
        );
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
        const filteredVenues = response.data.filter(
          (venue: { status: string }) => venue.status === "approved"
        );
        setRecommendedVenues(filteredVenues);
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
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters(filters);
  };

  const filteredVenues = venues.filter((venue: any) => {
    const matchesCategory =
      selectedCategory === "All" ||
      venue.venue_category[0].category_event === selectedCategory.toLowerCase();
    const matchesSearch = venue.venue_name.toLowerCase().includes(searchQuery);
    const matchesStatus = venue.status === 3;

    const matchesAreaSize =
      (!filterState.minAreaSize ||
        venue.area_size >= filterState.minAreaSize) &&
      (!filterState.maxAreaSize || venue.area_size <= filterState.maxAreaSize);
    const matchesCapacity =
      (!filterState.minCapacity || venue.capacity >= filterState.minCapacity) &&
      (!filterState.maxCapacity || venue.capacity <= filterState.maxCapacity);
    const matchesPrice =
      (!filterState.minPrice || venue.price >= filterState.minPrice) &&
      (!filterState.maxPrice || venue.price <= filterState.maxPrice);
    const matchesRooms =
      (!filterState.minRooms ||
        venue.number_of_rooms >= filterState.minRooms) &&
      (!filterState.maxRooms || venue.number_of_rooms <= filterState.maxRooms);
    const matchesOutdoorSpaces =
      (!filterState.minOutdoorSpaces ||
        venue.outdoor_spaces >= filterState.minOutdoorSpaces) &&
      (!filterState.maxOutdoorSpaces ||
        venue.outdoor_spaces <= filterState.maxOutdoorSpaces);
    const matchesParkingSpace =
      (!filterState.minParkingSpace ||
        venue.parking_space >= filterState.minParkingSpace) &&
      (!filterState.maxParkingSpace ||
        venue.parking_space <= filterState.maxParkingSpace);

    return (
      matchesCategory &&
      matchesSearch &&
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
    <div className="flex flex-col">
      <div className="max-w-7xl pt-6 md:ml-14">
        {/* Radix UI Interest Selection Modal */}
        <Dialog.Root
          open={showInterestModal}
          onOpenChange={(open) => {
            if (!accessToken) {
              setShowInterestModal(!!accessToken && open);
            }
          }}
          // onOpenChange={setShowInterestModal}
        >
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-[9999]" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black p-6 rounded-lg w-full max-w-md z-[9999]">
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

        {/* {Top section} */}

        <div className="relative mb-4">
          {/* Mobile version */}
          <div className="md:hidden h-[100px]  flex flex-col justify-center items-center text-center p-4">
            <div className="bg-[#335473]  p-4 rounded-lg">
              <h1 className="text-2xl font-bold text-white mb-3">
                Book Venues Easily
              </h1>
              <p className="text-sm text-white max-w-md">
                Find perfect venues for your events
              </p>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block h-[400px]">
            <div className="absolute inset-0 bg-[#335473] rounded-lg  flex flex-col justify-center items-center text-center p-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Book and Rent Event Venues Effortlessly
              </h1>
              <p className="text-md md:text-lg text-white max-w-2xl">
                Seamlessly connect with venue owners and bring your events to
                life with ease.
              </p>
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-[#335473]">Category</h2>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`px-6 py-2 rounded-full transition duration-300 ${
                    category === selectedCategory
                      ? "bg-[#335473] text-white shadow"
                      : "bg-[#E1ECF4] text-[#335473] hover:bg-[#cddff1]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="flex flex-1 max-w-md items-center gap-2">
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 rounded-full border border-[#ccc] text-black focus:ring-2 focus:ring-[#335473] transition"
              />
              <button
                onClick={handleFilterClick}
                className="p-2 rounded-full hover:bg-[#335473]/10 transition"
              >
                <Filter size={28} className="text-[#335473]" />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 text-black"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white p-6 rounded-xl w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#335473]">
                    Filter Venues
                  </h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      label: "Area Size (sqm)",
                      names: ["minAreaSize", "maxAreaSize"],
                      unit: "sqm",
                    },
                    {
                      label: "Capacity",
                      names: ["minCapacity", "maxCapacity"],
                      unit: "people",
                    },
                    {
                      label: "Price (THB)",
                      names: ["minPrice", "maxPrice"],
                      unit: "THB",
                    },
                    {
                      label: "Number of Rooms",
                      names: ["minRooms", "maxRooms"],
                      unit: "",
                    },
                    {
                      label: "Outdoor Spaces",
                      names: ["minOutdoorSpaces", "maxOutdoorSpaces"],
                      unit: "",
                    },
                    {
                      label: "Parking Spaces",
                      names: ["minParkingSpace", "maxParkingSpace"],
                      unit: "",
                    },
                  ].map(({ label, names, unit }) => (
                    <div key={label} className="space-y-2">
                      <label className="block font-medium text-[#335473]">
                        {label}
                      </label>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-500 mb-1">
                            Min
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name={names[0]}
                              placeholder="Any"
                              value={
                                filterState[
                                  names[0] as keyof typeof filterState
                                ]
                              }
                              onChange={handleFilterChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#335473] transition pr-10 "
                            />
                            {unit && (
                              <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
                                {unit}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm text-gray-500 mb-1">
                            Max
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name={names[1]}
                              placeholder="Any"
                              value={
                                filterState[
                                  names[1] as keyof typeof filterState
                                ]
                              }
                              onChange={handleFilterChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#335473] transition pr-10"
                            />
                            {unit && (
                              <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
                                {unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={resetFilters}
                    className=" sm:px-6 sm:py-2 px-2 py-2 text-[#335473] font-medium rounded-lg border border-[#335473] hover:bg-[#335473]/10 transition"
                  >
                    Reset All
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="sm:px-6 sm:py-2 px-2 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={applyFilters}
                      className="sm:px-6 sm:py-2 px-2 py-2 bg-[#335473] text-white font-medium rounded-lg hover:bg-[#27415f] transition"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {recommendedVenues.length > 0 && (
          <div className="mb-12 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-[#335473]">
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedVenues.map((venue: any) => (
                <VenueCard
                  key={venue.id}
                  {...venue}
                  imagerec={venue.venue_images}
                  categories={venue.categories[0]}
                  onDetailClick={handleDetailClick}
                />
              ))}
            </div>
          </div>
        )}

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#335473]">
              Available Venues
            </h2>
            <div className="text-sm text-gray-500">
              {filteredVenues.length === 0
                ? "No venue available"
                : `Showing ${filteredVenues.length} ${
                    filteredVenues.length === 1 ? "venue" : "venues"
                  }`}
            </div>
          </div>

          {filteredVenues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVenues.map((venue: any) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <VenueCard
                    {...venue}
                    id={venue.id}
                    onDetailClick={handleDetailClick}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <Frown size={48} color="black" />
              <h3 className="text-lg font-medium text-[#335473] mb-2">
                No venues found
              </h3>
              <p className="text-gray-500 max-w-md">
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-sm text-[#335473] font-medium rounded-lg border border-[#335473] hover:bg-[#335473]/10 transition"
              >
                Reset Filters
              </button>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
