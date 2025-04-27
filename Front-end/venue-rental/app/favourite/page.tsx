"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useFetchVenues from "@/hook/Venue";
import VenueCard from "@/components/ui/Venuecards";
import { apiJson } from "@/hook/api";
import { useUserId } from "@/hook/userid";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Frown, X } from "lucide-react";
import gsap from "gsap";

const FavoritesPage = () => {
  const router = useRouter();
  const userId = useUserId();
  const { venues } = useFetchVenues();
  const categories = ["All", "meeting", "wedding", "party", "staycation"];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteVenueIds, setFavoriteVenueIds] = useState<string[]>([]);
  const venueRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      try {
        const response = await apiJson.get("/favorites/");
        const favoriteIds = response.data
          .filter((fav: any) => fav.user === userId)
          .map((fav: any) => fav.venue);
        setFavoriteVenueIds(favoriteIds);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, [userId]);

  const handleDetailClick = (id: string) => {
    router.push(`/nk1/venue/${id}`);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // const removeFavoriteVenue = (venueId: string) => {
  //   setTimeout(() => {
  //     setFavoriteVenueIds((prevIds) => prevIds.filter((id) => id !== venueId));
  //   }, 500);
  // };

  const removeFavoriteVenue = (venueId: string) => {
    const element = venueRefs.current[venueId];

    if (element) {
      gsap.to(element, {
        opacity: 0,
        y: 100,
        scale: 0.8,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          setFavoriteVenueIds((prevIds) =>
            prevIds.filter((id) => id !== venueId)
          );
        },
      });
    } else {
      setFavoriteVenueIds((prevIds) => prevIds.filter((id) => id !== venueId));
    }
  };

  const filteredVenues = venues.filter((venue: any) => {
    const isFavorite = favoriteVenueIds.includes(venue.id);
    const matchesCategory =
      selectedCategory === "All" ||
      venue.venue_category[0].category_event === selectedCategory.toLowerCase();
    const matchesSearch = venue.venue_name.toLowerCase().includes(searchQuery);
    const matchesStatus = venue.status === 3;

    return isFavorite && matchesCategory && matchesSearch && matchesStatus;
  });

  const applyFilters = () => {
    setIsFilterOpen(false);
  };

  const handleFilterClick = () => {
    setIsFilterOpen(!isFilterOpen);
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

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const resetFilters = () => {
    setFilters(filters);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#335473] mb-4">
        Favourite Venues
      </h1>

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
                              filterState[names[0] as keyof typeof filterState]
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
                              filterState[names[1] as keyof typeof filterState]
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
                  className="sm:px-6 sm:py-2 px-2 py-2 text-[#335473] font-medium rounded-lg border border-[#335473] hover:bg-[#335473]/10 transition"
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
              <div
                key={venue.id}
                ref={(el) => {
                  venueRefs.current[venue.id] = el;
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <VenueCard
                    {...venue}
                    onDetailClick={handleDetailClick}
                    onRemoveFavorite={() => removeFavoriteVenue(venue.id)}
                  />
                </motion.div>
              </div>
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
              Please Add Your Favourtie Veneus First!
            </p>
          </motion.div>
        )}
      </motion.section>

      {/* Venue Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue: any) => (
            <VenueCard
              key={venue.id}
              {...venue}
              onDetailClick={handleDetailClick}
              onRemoveFavorite={() => removeFavoriteVenue(venue.id)}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-black text-[20px]">
            No favorite venues found.
          </p>
        )}
      </div> */}
    </div>
  );
};

export default FavoritesPage;
