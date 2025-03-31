"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useFetchVenues from "@/hook/Venue";
import VenueCard from "@/components/ui/Venuecards";
import { apiJson } from "@/hook/api";
import { useUserId } from "@/hook/userid";

const FavoritesPage = () => {
  const router = useRouter();
  const userId = useUserId();
  const { venues } = useFetchVenues();
  const categories = ["All", "Meeting", "Studio", "Party"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteVenueIds, setFavoriteVenueIds] = useState<string[]>([]);

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

  const removeFavoriteVenue = (venueId: string) => {
    setTimeout(() => {
      setFavoriteVenueIds((prevIds) => prevIds.filter((id) => id !== venueId));
    }, 500);
  };

  const filteredVenues = venues.filter((venue: any) => {
    const isFavorite = favoriteVenueIds.includes(venue.id);
    // const matchesCategory =
    //   selectedCategory === "All" || venue.category_event === selectedCategory;
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

      {/* Venue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </div>
    </div>
  );
};

export default FavoritesPage;
