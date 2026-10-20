export interface BookingResponseDTO {
  id: string;
  bookingCode: string;
  tripId: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  emergencyPhone: string | null;
  note: string | null;
  amount: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  bookedAt: Date;
}
