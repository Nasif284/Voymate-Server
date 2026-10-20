import { VerifyRazorpayBookingRequestDTO } from '../../../dtos/community/booking/request/verify-razorpay-booking.dto';
import { BookingResponseDTO } from '../../../dtos/community/booking/response/booking-response.dto';

export interface IVerifyRazorpayBookingUseCase {
  execute(dto: VerifyRazorpayBookingRequestDTO): Promise<BookingResponseDTO>;
}
