export interface CreateOrderParams {
  amount: number; // in INR rupees
  currency?: string;
  receipt: string;
}

export interface RazorpayOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export interface VerifySignatureParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface IRazorpayPaymentService {
  createOrder(params: CreateOrderParams): Promise<RazorpayOrderResult>;
  verifySignature(params: VerifySignatureParams): boolean;
}
