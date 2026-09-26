import { inject, injectable } from 'tsyringe';
import { config } from '../../../config/env.config';
import { TOKENS } from '../../../infrastructure/di/tokens';
import { ITripGroupRepository } from '../../interfaces/repositories/trip-group.repository';
import { IEmailService } from '../../interfaces/services/email.service.interface';
import { ISendInvite } from '../../interfaces/use-cases/trip/send-invite.interface';

@injectable()
export class SendInvite implements ISendInvite {
  constructor(
    @inject(TOKENS.ITripGroupRepository)
    private readonly _tripGroupRepository: ITripGroupRepository,
    @inject(TOKENS.IEmailService)
    private readonly _emailService: IEmailService,
  ) {}

  async execute(dto: {
    groupId: string;
    email: string;
    invitedBy: string;
  }): Promise<void> {
    const invite = await this._tripGroupRepository.getGroupWithTrip(
      dto.groupId,
    );
    const frontendUrl =
      config.frontend_url?.replace(/\/$/, '') ?? 'http://localhost:3000';
    const inviteLink = `${frontendUrl}/trips/groups/join/${invite.inviteCode}`;

    await this._emailService.sendEmail({
      to: dto.email,
      subject: `Join ${invite.groupName} on Travel Buddy`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #181d1a;">
          <h2>You're invited to a Travel Buddy group</h2>
          <p>You have been invited to join <strong>${invite.groupName}</strong>.</p>
          <p>Destination: ${invite.destination}</p>
          <p>
            <a href="${inviteLink}" style="display:inline-block;background:#0f6e56;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700;">
              Join group
            </a>
          </p>
          <p>If the button does not work, open this link:</p>
          <p><a href="${inviteLink}">${inviteLink}</a></p>
        </div>
      `,
    });
    await this._tripGroupRepository.createGroupInvite({
      groupId: dto.groupId,
      invitedBy: dto.invitedBy,
      invitedUserEmail: dto.email,
    });
  }
}
