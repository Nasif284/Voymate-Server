export class CommunityTripBooking {
  constructor(
    public readonly id: string,
    public bookingCode: string,
    public tripId: string,
    public userId: string,
    public contactName: string,
    public contactPhone: string,
    public emergencyPhone: string | null,
    public note: string | null,
    public amount: number,
    public currency: string,
    public razorpayOrderId: string | null,
    public razorpayPaymentId: string | null,
    public bookedAt: Date,
    public createdAt: Date,
  ) {}

  isPaid(): boolean {
    return this.amount > 0 && Boolean(this.razorpayPaymentId);
  }
}
