export interface VenueRequest {
  id: number;
  venue_name: string;
  venueRequest_images: { id: number; image: string }[];
  image: string;
  location: string;
  category_event: string;
  price: number;
  number_of_rooms: number;
  additional_information: string;
  venue_owner: number;
  status: number;
  venue: number;
  personal_identification: string;
  venue_certification: string;
}
