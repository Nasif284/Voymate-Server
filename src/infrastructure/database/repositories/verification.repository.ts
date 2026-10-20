import { inject, injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import {
  Prisma,
  VerificationStatus,
  VerificationDocumentType,
  VerificationDocumentSide,
  VerificationActivityType,
} from '@prisma/client';
import {
  IVerificationRepository,
  UpdateVerificationAfterOcrRepositoryDTO,
  UpdateVerificationReviewRepositoryDTO,
} from '../../../application/interfaces/repositories/verificatiom.repository';
import { TOKENS } from '../../di/tokens';
import { PrismaClient } from '@prisma/client/extension';
import { SubmitVerificationRepositoryDTO } from '../../../application/dtos/profile/request/doc-verification.dto';
import { Verification } from '../../../application/dtos/profile/response/doc-verification.dto';
import { GetDocVerificationResponseDTO } from '../../../application/dtos/profile/response/get-doc-verification.dto';
import { GetVerificationQueueRequestDTO } from '../../../application/dtos/verifications/request/get-verification-queue.dto';
import { VerificationQueueItemDTO } from '../../../application/dtos/verifications/response/get-verification-queue.dto';
import {
  VerificationDetailsRepositoryResponse,
  VerificationProcessingProjection,
} from '../../../application/dtos/verifications/response/get-verification-details.dto';

@injectable()
export class VerificationRepository
  extends BaseRepository<
    Verification,
    Prisma.VerificationCreateArgs,
    Prisma.VerificationUpdateInput
  >
  implements IVerificationRepository
{
  constructor(@inject(TOKENS.PrismaClient) prisma: PrismaClient) {
    super(prisma, prisma.checklist);
  }
  async submitVerification(
    data: SubmitVerificationRepositoryDTO,
  ): Promise<Verification> {
    const documentType =
      data.documentTypeCode.toUpperCase() as VerificationDocumentType;

    const verification = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.verification.findFirst({
        where: {
          userId: data.userId,
        },
      });

      if (!existing) {
        const verification = await tx.verification.create({
          data: {
            userId: data.userId,
            documentType,
            status: VerificationStatus.PROCESSING,
          },
        });

        await tx.verificationDocument.createMany({
          data: data.documents.map((document) => ({
            verificationId: verification.id,
            side: document.sideCode.toUpperCase() as VerificationDocumentSide,
            storageKey: document.storageKey,
            mimeType: document.mimeType,
            fileSize: document.fileSize,
          })),
        });

        await tx.verificationActivity.create({
          data: {
            verificationId: verification.id,
            action: VerificationActivityType.SUBMITTED,
          },
        });

        return verification;
      }

      await tx.verificationExtractedData.deleteMany({
        where: {
          verificationId: existing.id,
        },
      });

      await tx.verificationDocument.deleteMany({
        where: {
          verificationId: existing.id,
        },
      });

      const verification = await tx.verification.update({
        where: {
          id: existing.id,
        },
        data: {
          documentType,
          status: VerificationStatus.PROCESSING,
          assignedReviewerId: null,
          reviewStartedAt: null,
          reviewedAt: null,
          reviewNotes: null,
          rejectionReason: null,
          resubmissionReason: null,
          overallRiskScore: null,
          ocrConfidence: null,
        },
      });

      await tx.verificationDocument.createMany({
        data: data.documents.map((document) => ({
          verificationId: verification.id,
          side: document.sideCode.toUpperCase() as VerificationDocumentSide,
          storageKey: document.storageKey,
          mimeType: document.mimeType,
          fileSize: document.fileSize,
        })),
      });

      await tx.verificationActivity.create({
        data: {
          verificationId: verification.id,
          action: VerificationActivityType.SUBMITTED,
        },
      });

      return verification;
    });

    return {
      id: verification.id,
      assignedReviewerId: verification.assignedReviewerId!,
      documentTypeCode: verification.documentType,
      statusCode: verification.status,
      userId: verification.userId,
    };
  }

  async getMyVerification(
    userId: string,
  ): Promise<GetDocVerificationResponseDTO | null> {
    const record = await this.prisma.verification.findFirst({
      where: {
        userId,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      status: {
        code: record.status,
        name: record.status,
      },
      documentType: {
        code: record.documentType,
        name: record.documentType,
      },
      submittedAt: record.submittedAt,
      reviewedAt: record.reviewedAt,
      rejectionReason: record.rejectionReason,
      resubmissionReason: record.resubmissionReason,
    };
  }

  async getVerificationQueue(dto: GetVerificationQueueRequestDTO): Promise<{
    items: VerificationQueueItemDTO[];
    total: number;
  }> {
    const where: Prisma.VerificationWhereInput = {
      ...(dto.tab && {
        status: dto.tab.toUpperCase() as VerificationStatus,
      }),
    };

    if (dto.search) {
      where.user = {
        OR: [
          {
            fullName: {
              contains: dto.search,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: dto.search,
              mode: 'insensitive',
            },
          },
        ],
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.verification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
      }),

      this.prisma.verification.count({
        where,
      }),
    ]);

    return {
      items: items.map((verification) => ({
        verificationId: verification.id,

        user: {
          id: verification.user.id,
          fullName: verification.user.fullName,
          email: verification.user.email,
          profilePicture: verification.user.avatarUrl,
        },

        documentType: {
          code: verification.documentType,
          name: verification.documentType,
        },

        status: {
          code: verification.status,
          name: verification.status,
        },

        submittedAt: verification.submittedAt,
        assignedReviewer: verification.reviewer
          ? {
              id: verification.reviewer.id,
              fullName: verification.reviewer.fullName,
            }
          : null,
      })),
      total,
    };
  }

  async getVerificationDetails(
    verificationId: string,
  ): Promise<VerificationDetailsRepositoryResponse | null> {
    const verification = await this.prisma.verification.findUnique({
      where: {
        id: verificationId,
      },
      select: {
        id: true,
        submittedAt: true,
        reviewStartedAt: true,
        reviewedAt: true,
        reviewNotes: true,
        rejectionReason: true,
        resubmissionReason: true,
        overallRiskScore: true,
        ocrConfidence: true,
        status: true,
        documentType: true,
        reviewer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            isIdVerified: true,
            country: {
              select: {
                name: true,
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
            storageKey: true,
            mimeType: true,
            width: true,
            height: true,
            side: true,
          },
        },
        extractedData: {
          select: {
            fullName: true,
            documentNumber: true,
            nationality: true,
            gender: true,
            dateOfBirth: true,
            expiryDate: true,
            issuingCountry: true,
            analysisSummary: true,
          },
        },
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            createdAt: true,
            action: true,
            admin: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!verification) {
      return null;
    }

    return {
      id: verification.id,
      submittedAt: verification.submittedAt,
      reviewStartedAt: verification.reviewStartedAt,
      reviewedAt: verification.reviewedAt,
      reviewNotes: verification.reviewNotes,
      rejectionReason: verification.rejectionReason,
      resubmissionReason: verification.resubmissionReason,
      overallRiskScore: verification.overallRiskScore?.toNumber() ?? null,
      ocrConfidence: verification.ocrConfidence?.toNumber() ?? null,
      status: {
        code: verification.status,
        name: verification.status,
      },
      documentType: {
        code: verification.documentType,
        name: verification.documentType,
      },
      reviewer: verification.reviewer,
      user: verification.user,
      documents: verification.documents.map((doc) => ({
        id: doc.id,
        storageKey: doc.storageKey,
        mimeType: doc.mimeType,
        width: doc.width,
        height: doc.height,
        side: {
          code: doc.side,
        },
      })),
      extractedData: verification.extractedData,
      activities: verification.activities.map((act) => ({
        id: act.id,
        createdAt: act.createdAt,
        action: {
          code: act.action,
          name: act.action,
        },
        admin: act.admin,
      })),
    };
  }

  async getVerificationForProcessing(
    verificationId: string,
  ): Promise<VerificationProcessingProjection | null> {
    const result = await this.prisma.verification.findUnique({
      where: {
        id: verificationId,
      },
      select: {
        id: true,
        status: true,
        documentType: true,
        documents: {
          select: {
            id: true,
            side: true,
            storageKey: true,
            mimeType: true,
          },
        },
      },
    });

    if (!result) return null;

    return {
      id: result.id,
      statusCode: result.status,
      documentTypeCode: result.documentType,
      documents: result.documents.map((d) => ({
        id: d.id,
        sideCode: d.side,
        storageKey: d.storageKey,
        mimeType: d.mimeType,
      })),
    };
  }

  async updateVerificationAfterOcr(
    verificationId: string,
    data: UpdateVerificationAfterOcrRepositoryDTO,
  ): Promise<void> {
    console.log('Repo:', data.extraction.fields.dateOfBirth);
    const extractedData = {
      fullName: data.extraction.fields.fullName.value,
      documentNumber: data.extraction.fields.documentNumber.value,
      nationality: data.extraction.fields.nationality.value,
      gender: data.extraction.fields.gender.value,

      dateOfBirth: data.extraction.fields.dateOfBirth.value
        ? new Date(data.extraction.fields.dateOfBirth.value)
        : null,

      expiryDate: data.extraction.fields.expiryDate.value
        ? new Date(data.extraction.fields.expiryDate.value)
        : null,

      issuingCountry: data.extraction.fields.issuingCountry.value,
      issuingAuthority: data.extraction.fields.issuingAuthority.value,
      documentVersion: data.extraction.fields.documentVersion.value,
      analysisSummary: data.analysis.analysisSummary,
    };
    await this.prisma.$transaction(async (tx) => {
      await tx.verificationExtractedData.upsert({
        where: {
          verificationId,
        },

        create: {
          verificationId,
          ...extractedData,
        },

        update: extractedData,
      });

      await tx.verification.update({
        where: {
          id: verificationId,
        },

        data: {
          status: VerificationStatus.UNDER_REVIEW,
          ocrConfidence: data.extraction.confidence,
          overallRiskScore: data.analysis.overallRiskScore,
        },
      });
      await tx.verificationActivity.create({
        data: {
          verificationId,
          action: VerificationActivityType.OCR_COMPLETED,
        },
      });
    });
  }

  async updateVerificationReview(
    verificationId: string,
    dto: UpdateVerificationReviewRepositoryDTO,
  ): Promise<void> {
    const verification = await this.prisma.verification.findFirst({
      where: {
        id: verificationId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!verification) {
      throw new Error('Verification not found');
    }

    if (verification.status !== VerificationStatus.UNDER_REVIEW) {
      throw new Error('Only verifications under review can be approved.');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.verification.update({
        where: {
          id: verificationId,
        },

        data: {
          status: dto.statusCode.toUpperCase() as VerificationStatus,
          assignedReviewerId: dto.reviewerId,
          reviewedAt: dto.reviewedAt,
          rejectionReason: dto.rejectionReason,
          resubmissionReason: dto.resubmissionReason,
        },
      });

      await tx.verificationActivity.create({
        data: {
          verificationId,
          action: dto.activityCode.toUpperCase() as VerificationActivityType,
          performedByAdminId: dto.reviewerId,
        },
      });
    });
  }

  async getVerificationDocuments(
    userId: string,
  ): Promise<{ side: string; storageKey: string }[] | null> {
    const verification = await this.prisma.verification.findFirst({
      where: {
        userId,
      },
      select: {
        id: true,
        status: true,
        documents: {
          select: {
            storageKey: true,
            side: true,
          },
        },
      },
    });
    if (!verification) {
      return null;
    }
    return verification.documents.map((d) => ({
      side: d.side,
      storageKey: d.storageKey,
    }));
  }
}
