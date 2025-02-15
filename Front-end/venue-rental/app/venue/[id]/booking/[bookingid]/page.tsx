"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Venue } from "@/types/venue";
import { apiJson } from "@/hook/api";
import { format, differenceInDays } from "date-fns";
// import { jwtDecode } from "jwt-decode";
// import { JwtPayload } from "jwt-decode";
// import { RootState } from "@/hook/store";
// import { useSelector } from "react-redux";
import { useUserId } from "@/hook/userid";

interface BookingFormData {
  check_in: string;
  check_out: string;
}

// interface CustomJwtPayload extends JwtPayload {
//   user_id: string;
// }

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    check_in: format(new Date(), "yyyy-MM-dd"),
    check_out: format(new Date(), "yyyy-MM-dd"),
  });
  const [errors, setErrors] = useState<{
    check_in?: string;
    check_out?: string;
  }>({});

  const userId = useUserId();

  console.log(userId);

  useEffect(() => {
    const fetchVenueDetail = async () => {
      try {
        const { data } = await apiJson.get(`/venues/${params.id}/`);
        setVenue(data);
      } catch (error) {
        console.error("Error fetching venue:", error);
      }
    };

    if (params.id) {
      fetchVenueDetail();
    }
  }, [params.id]);

  const handleBack = () => {
    router.push(`/nk1/venue/${params.id}`);
  };

  const validateDates = () => {
    const newErrors: { check_in?: string; check_out?: string } = {};
    const check_in_date = new Date(formData.check_in);
    const check_out_date = new Date(formData.check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (check_in_date < today) {
      newErrors.check_in = "Check-in date cannot be in the past.";
    }

    if (check_out_date <= check_in_date) {
      newErrors.check_out = "Check-out date must be after check-in date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Calculate total nights and total price
  const totalNights = useMemo(() => {
    if (!venue) return 0;
    const check_in_date = new Date(formData.check_in);
    const check_out_date = new Date(formData.check_out);
    return differenceInDays(check_out_date, check_in_date);
  }, [formData.check_in, formData.check_out, venue]);

  const totalPrice = useMemo(() => {
    if (!venue) return 0;
    return totalNights * venue.price;
  }, [totalNights, venue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDates()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const bookingData = {
        user: userId,
        venue: params.id,
        check_in: new Date(formData.check_in).toISOString(),
        check_out: new Date(formData.check_out).toISOString(),
        total_price: totalPrice,
        status_booking: 2,
      };

      await apiJson.post("/bookings/", bookingData);

      router.push(`/nk1/venue/booking`);
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Failed to create booking. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!venue) {
    return <div>Venue not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-black">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-2">Book Venue</h1>
          <p className="text-gray-600 mb-6">
            Select your check-in and check-out dates to book this venue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="check_in"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Check-in Date
                </label>
                <input
                  type="date"
                  id="check_in"
                  name="check_in"
                  value={formData.check_in}
                  onChange={handleInputChange}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  disabled={isSubmitting}
                />
                {errors.check_in && (
                  <p className="mt-1 text-sm text-red-600">{errors.check_in}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="check_out"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Check-out Date
                </label>
                <input
                  type="date"
                  id="check_out"
                  name="check_out"
                  value={formData.check_out}
                  onChange={handleInputChange}
                  min={formData.check_in}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  disabled={isSubmitting}
                />
                {errors.check_out && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.check_out}
                  </p>
                )}
              </div>
            </div>

            {venue && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold mb-2">Booking Summary</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Venue: {venue.venue_name}</p>
                  <p>Price per Night: ฿{venue.price}</p>
                  <p>Total Nights: {totalNights}</p>
                  <p className="font-bold text-black">
                    Total Price: ฿{totalPrice}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
