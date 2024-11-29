"use client";
import { Venue } from "@/types/venue";
import { useState, useEffect } from "react";
import { apiJson } from "@/hook/api";

const useFetchVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await apiJson.get("/venues/");
        setVenues(response.data);
      } catch (err) {
        console.error("Error fetching venues:", err);
      }
    };

    fetchVenues();
  }, []);

  return { venues };
};

export default useFetchVenues;
