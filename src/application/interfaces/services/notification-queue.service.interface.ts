export interface EnqueuePushJobDTO {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
}

export interface INotificationQueueService {
  enqueuePush(job: EnqueuePushJobDTO): Promise<void>;
}
