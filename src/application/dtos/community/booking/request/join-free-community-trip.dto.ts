export interface JoinFreeCommunityTripRequestDTO {
  tripId: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  emergencyPhone?: string;
  note?: string;
}
