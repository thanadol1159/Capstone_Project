"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useFetchVenues from "@/hook/Venue";
import VenueCard from "@/components/ui/Venuecards";
import { apiJson } from "@/hook/api";
import { useUserId } from "@/hook/userid";
import { motion, AnimatePresence } from "framer-motion";
import { Frown } from "lucide-react";
import gsap from "gsap";

const FavoritesPage = () => {
  const router = useRouter();
  const userId = useUserId();
  const { venues } = useFetchVenues();
  const categories = ["All", "Meeting", "Studio", "Party"];
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
    const matchesSearch = venue.venue_name.toLowerCase().includes(searchQuery);
    return isFavorite && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#335473] mb-4">
        Favorite Venues
      </h1>

      {/* Category Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">Category</h2>
        <div className="flex items-center gap-4 justify-between">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-12 py-1 rounded-lg ${
                  category === selectedCategory
                    ? "bg-[#335473] text-white font-bold"
                    : "bg-[#BCCFE1] text-[#7397BB] font-bold"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 rounded-full border text-black"
            />
          </div>
        </div>
      </div>

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
            Showing {filteredVenues.length} venues
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
              Pls Add Your Favourtie Veneus First!
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
