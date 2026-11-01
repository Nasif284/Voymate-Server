import { GetAllUsersRequestDTO } from '../../dtos/user-management/request/get-users.dto';

import { User } from '../../../domain/entities/user/user.entity';
import { ChangeUserStatusRequestDTO } from '../../dtos/user-management/request/change-status.dto';
import { OnboardingSourceRequestDTO } from '../../dtos/onbaording/request/source.dto';
import {
  RelationshipInfo,
  UserCardDetailsResponseDTO,
} from '../../dtos/users/response/user-card.dto';
import { NearbyUsersResponseDTO } from '../../dtos/users/response/nearby-users.dto';
import { GetUserProfileResponseDTO } from '../../dtos/users/response/user-profile.dto';
import { SendConnectionRequestDTO } from '../../dtos/connections/requests/send-connection-request.dto';
import { GetIncomingRequestsResponseDTO } from '../../dtos/connections/response/get-requests.dto';
import { GetConnectionsResponseDTO } from '../../dtos/connections/response/get-connections.dto';
import { UpdateSettingsRequestDTO } from '../../dtos/profile/request/settings-update.dto';
import { GetSettingsResponseDTO } from '../../dtos/profile/response/get-settings.dto';
import { GetAllRequestsResponseDTO } from '../../dtos/connections/response/get-all-requests.dto';
import { GetSentRequestsResponseDTO } from '../../dtos/connections/response/get-sent-requests.dto';

export interface CreateUserData {
  fullName: string;
  email: string;
  passwordHash?: string;
  isEmailVerified?: boolean;
}

export interface UpdateLocationData {
  userId: string;
  latitude: number;
  longitude: number;
  city: string;
  countryCode: string;
}

export interface IUserRepository {
  findUserById(id: string, include?: object): Promise<User | null>;
  findByEmail(email: string, include?: object): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  updateEmailVerified(email: string): Promise<void>;
  updatePassword(id: string, password: string): Promise<void>;
  getAllUsers(payload: GetAllUsersRequestDTO): Promise<{
    users: User[];
    count: number;
  }>;
  changeUserStatus(payload: ChangeUserStatusRequestDTO): Promise<void>;
  addUserOnboardingSource(payload: OnboardingSourceRequestDTO): Promise<void>;
  updateUser(userId: string, payload: object): Promise<void>;
  createSkills(userId: string, skills: string[]): Promise<void>;
  createLanguages(userId: string, languages: string[]): Promise<void>;
  createTravelInterests(userId: string, interests: string[]): Promise<void>;
  deleteSkills(userId: string): Promise<void>;
  deleteInterests(userId: string): Promise<void>;
  deleteLanguages(userId: string): Promise<void>;
  updateOnboarding(userId: string, payload: object): Promise<void>;
  updateUserLocation(payload: UpdateLocationData): Promise<void>;
  getUserLocation(userId: string): Promise<{ lat: number; lang: number }>;
  getUsersForCard(
    currentUserId: string,
    params: { page: number; limit: number; includeAll?: boolean },
  ): Promise<UserCardDetailsResponseDTO>;
  getNearbyUsers(
    userId: string,
    page: number,
    limit: number,
    radiusKm?: number,
  ): Promise<NearbyUsersResponseDTO>;
  getUserWithDetails(userId: string): Promise<GetUserProfileResponseDTO>;
  sendConnectionRequest(payload: SendConnectionRequestDTO): Promise<void>;
  getIncomingConnectionRequests(
    userId: string,
  ): Promise<GetIncomingRequestsResponseDTO>;
  updateRequestStatus(payload: {
    requestId: string;
    status: string;
  }): Promise<void>;
  getUserConnections(userId: string): Promise<GetConnectionsResponseDTO>;
  deactivateConnection(connectionId: string): Promise<void>;
  getSentRequests(userId: string): Promise<GetSentRequestsResponseDTO>;
  getSettings(userId: string): Promise<GetSettingsResponseDTO>;
  updateSettings(
    userId: string,
    payload: UpdateSettingsRequestDTO,
  ): Promise<void>;
  getUserRequests(userId: string): Promise<GetAllRequestsResponseDTO>;
  findUserByPhone(
    phone: string,
  ): Promise<{ id: string; isPhoneVerified: boolean } | null>;
  verifyPhone(userId: string, phone: string): Promise<void>;
  getRelationshipsForUsers(
    currentUserId: string,
    targetUserIds: string[],
  ): Promise<Record<string, RelationshipInfo>>;
}
