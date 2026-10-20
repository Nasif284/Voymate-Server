export interface VerifyRazorpayBookingRequestDTO {
  tripId: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  emergencyPhone?: string;
  note?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
