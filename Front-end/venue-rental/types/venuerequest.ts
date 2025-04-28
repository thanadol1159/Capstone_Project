export interface VenueRequest {
  id: number;
  venue_name: string;
  venueRequest_images: { id: number; image: string }[];
  image: string;
  location: string;
  venueRequest_category: {
    id: number;
    category_event: string;
    venue_request: number;
  }[];
  price: number;
  number_of_rooms: number;
  additional_information: string;
  venue_owner: number;
  status: number;
  venue: number;
  personal_identification: string;
  venue_certification: string;
}
