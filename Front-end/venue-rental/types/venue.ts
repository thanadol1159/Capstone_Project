export interface VenueCardProps {
    id: number;
    name: string;
    location: string;
    image: string;
    tags: string[];
    onDetailClick?: (id: number) => void;
  }
  
  export interface Venue {
    id: number;
    name: string;
    location: string;
    image: string;
    tags: string[];
  }