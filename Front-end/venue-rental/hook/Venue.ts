"use client";
import { Venue } from "@/types/venue";
import { useState, useEffect } from "react";
import axios from "axios";


const useFetchVenues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get("http://localhost:8000/venues/");
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
