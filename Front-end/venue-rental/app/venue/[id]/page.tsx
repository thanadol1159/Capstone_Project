// app/venue-rental/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { VenueCardProps } from "@/types/venue";

export default function VenuePage() {
  const params = useParams();
  const [venue, setVenue] = useState<VenueCardProps | null>(null);

  useEffect(() => {
    const fetchVenueDetail = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/venues/${params.id}`
        );
        const data = await response.json();
        setVenue(data);
      } catch (error) {
        console.error("Error fetching venue:", error);
      }
    };

    if (params.id) {
      fetchVenueDetail();
    }
  }, [params.id]);

  if (!venue) {
    return <div>Venue not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 text-black">
      {/* Venue Title */}
      <h1 className="text-2xl font-semibold text-center">
        {venue.venue_name}
      </h1>


      <div className="relative w-full aspect-[16/10]">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Main Image */}
          <div className="relative w-[80%] aspect-[16/10]">
            <img
              src={venue.image}
              alt={venue.venue_name}
              className="rounded-lg object-cover w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Venue Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold">Venue Name: </span>
          <span>{venue.venue_name}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-semibold">Price: </span>
          <span>{venue.price}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-semibold">Capacity: </span>
          <span>
            {venue.capacity} people
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-semibold">Parking Space: </span>
          <span>{venue.parking_space} spots</span>
        </div>

        {venue.additional_information && (
          <div className="flex flex-col gap-2">
            <span className="font-semibold">Additional Information: </span>
            <p className="text-gray-600">{venue.additional_information}</p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <span className="font-semibold">Type: </span>
          <span>{venue.venue_type}</span>
        </div>

      </div>
    </div>
  );
}
