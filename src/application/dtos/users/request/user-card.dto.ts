export interface GetUsersForCardRequestDTO {
  userId: string;
  page: number;
  limit: number;
  includeAll?: boolean;
}
