import { UserProps } from '../../../../domain/entities/user/user.entity';

export type UserListItem = Omit<UserProps, 'accountStatusCode'> & {
  accountStatusCode: string;
};

export interface GetAllUserResponseDTO {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
