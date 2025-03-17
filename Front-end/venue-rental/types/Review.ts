export interface Review {
  id: number;
  user: number;
  venue: number;
  booking: number;
  reviewDetail: string;
  point: number;
  createAt: string;
  clean: number;
  service: number;
  value_for_money: number;
  matches_expectations: number;
  facilities: number;
  environment: number;
  location: number;
  review_images: string[]; 
}
