export interface VenueCardProps {
  id: number;
  venue_type: string | null;
  venue_name: string;
  image: string;
  location: string | null;
  category: string | null;
  price: number;
  area_size: number | null;
  capacity: number | null;
  number_of_rooms: number | null;
  parking_space: number;
  outdoor_spaces: string | null;
  additional_information: string;
  venue_certification: string;
  personal_identification: string;
  type_of_venue: string | null
  onDetailClick?: (id: number) => void;
}

export interface Venue {
  id: number;
  venue_type: string | null;
  venue_name: string;
  image: string;
  location: string | null;
  category: string | null;
  price: number;
  area_size: number | null;
  capacity: number | null;
  number_of_rooms: number | null;
  parking_space: number;
  outdoor_spaces: string | null;
  additional_information: string;
  venue_certification: string;
  personal_identification: string;
  type_of_venue: string | null;
}

