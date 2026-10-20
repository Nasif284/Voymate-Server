import { CreateRazorpayOrderRequestDTO } from '../../../dtos/community/booking/request/create-razorpay-order.dto';
import { RazorpayOrderResult } from '../../services/razorpay.service.interface';

export interface ICreateRazorpayBookingOrderUseCase {
  execute(dto: CreateRazorpayOrderRequestDTO): Promise<RazorpayOrderResult>;
}
