// export interface VenueCardProps {
//   id: number;
//   venue_type: string;
//   venue_name: string;
//   image: string;
//   location: string | null;
//   category: string | null;
//   price: number;
//   area_size: number | null;
//   capacity: number;
//   number_of_rooms: number | null;
//   parking_space: number;
//   outdoor_spaces: string | null;
//   additional_information: string;
//   venue_certification: string;
//   personal_identification: string;
//   onDetailClick?: (id: number) => void;
// }

export interface Venue {
  id: number;
  venue_type: number;
  venue_name: string;
  venue_images: { id: number; image: string }[];
  latitude: number;
  location: string | null;
  longitude: number;
  venue_category: string[];
  price: number;
  area_size: number | null;
  capacity: number;
  number_of_rooms: number | null;
  parking_space: number;
  outdoor_spaces: string | null;
  additional_information: string;
  venue_certification: string;
  personal_identification: string;
  venue_owner: number;
  status: number;
  onDetailClick?: (id: number) => void;
}
