import { injectable } from 'tsyringe';
import Twilio from 'twilio';

import { config } from '../../config/env.config';
import { ISmsService } from '../../application/interfaces/services/sms-service.service.interface';

@injectable()
export class TwilioSmsService implements ISmsService {
  private readonly client: Twilio.Twilio;

  constructor() {
    this.client = Twilio(config.twilio.accountSid, config.twilio.authToken);
  }

  async sendOtp(phone: string, otp: string): Promise<void> {
    await this.client.messages.create({
      body: `Your Voymate verification code is ${otp}. It expires in 5 minutes.`,
      from: config.twilio.phoneNumber,
      to: phone,
    });
  }
}
