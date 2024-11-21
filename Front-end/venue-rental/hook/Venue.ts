"use client";
import { Venue } from "@/types/venue";
import { useState, useEffect } from "react";
import api from "@/hook/api";

const useFetchVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await api.get("http://localhost:8000/venues/");
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
