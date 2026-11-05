import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import { s3Client } from '../../config/s3.config';
import { config } from '../../config/env.config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from '../../application/interfaces/services/storage.service.interface';

export class StorageService implements IStorageService {
  async upload(file: Buffer, key: string, mimeType: string): Promise<string> {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.s3.bucketName,
        Key: key,
        Body: file,
        ContentType: mimeType,
      }),
    );
    return key;
  }
  async getSignedUrl(key: string): Promise<string> {
    if (!key) return '';
    if (key.startsWith('http://') || key.startsWith('https://')) {
      return key;
    }
    const command = new GetObjectCommand({
      Bucket: config.s3.bucketName,
      Key: key,
    });

    return getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
  }
  async delete(key: string): Promise<void> {
    if (!key || key.startsWith('http://') || key.startsWith('https://')) {
      return;
    }
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: config.s3.bucketName,
        Key: key,
      }),
    );
  }
  async download(storageKey: string): Promise<Buffer> {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: config.s3.bucketName,
        Key: storageKey,
      }),
    );
    return Buffer.from(await response.Body!.transformToByteArray());
  }
  async getUploadSignedUrl(key: string, mimeType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: config.s3.bucketName,
      Key: key,
      ContentType: mimeType,
    });

    return getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });
  }
}
