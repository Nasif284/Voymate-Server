export interface TripBookingAttendeeResponseDTO {
  id: string;
  bookingCode: string;
  contactName: string;
  contactPhone: string;
  emergencyPhone: string | null;
  note: string | null;
  amount: number;
  currency: string;
  bookedAt: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    phone: string | null;
  };
}
