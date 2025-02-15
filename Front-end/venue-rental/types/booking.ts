export interface Booking {
  id: number;
  user: number;
  venue: number;
  check_in: string;
  check_out: string;
  total_price: number | null;
  status_booking: number;
}
