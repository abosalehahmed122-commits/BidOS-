import { promises as fs } from 'node:fs';
import path from 'node:path';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface StoragePutInput {
  key: string;
  body: Buffer | Uint8Array;
  contentType?: string;
}

export interface PresignGetOptions {
  expiresIn?: number; // seconds (default 300)
  downloadName?: string;
}

/**
 * Storage port. Files are PRIVATE. The disk adapter (default, local dev) streams
 * through the app; the S3/R2 adapter keeps a private bucket and hands out
 * short-lived presigned URLs — no object is ever publicly readable.
 */
export interface Storage {
  put(input: StoragePutInput): Promise<{ key: string }>;
  read(key: string): Promise<Buffer>;
  /** Short-lived URL to download a private object (null = adapter has no presign; stream instead). */
  presignGet(key: string, opts?: PresignGetOptions): Promise<string | null>;
  /** Short-lived URL to upload directly from the browser (null = not supported). */
  presignPut(key: string, contentType: string, expiresIn?: number): Promise<string | null>;
}

// ----------------------------------------------------------------- Disk ------
class DiskStorage implements Storage {
  constructor(private readonly root: string) {}

  private full(key: string): string {
    return path.join(this.root, key);
  }

  async put({ key, body }: StoragePutInput): Promise<{ key: string }> {
    const file = this.full(key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body);
    return { key };
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.full(key));
  }

  // No signing on disk — the download route streams bytes instead.
  async presignGet(): Promise<null> {
    return null;
  }
  async presignPut(): Promise<null> {
    return null;
  }
}

// ------------------------------------------------------------- S3 / R2 -------
class S3Storage implements Storage {
  private readonly client: S3Client;

  constructor(
    private readonly bucket: string,
    endpoint: string,
    region: string,
    accessKeyId: string,
    secretAccessKey: string,
  ) {
    this.client = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true, // R2/MinIO friendly
    });
  }

  async put({ key, body, contentType }: StoragePutInput): Promise<{ key: string }> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: Buffer.isBuffer(body) ? body : Buffer.from(body),
        ContentType: contentType,
      }),
    );
    return { key };
  }

  async read(key: string): Promise<Buffer> {
    const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    const bytes = await res.Body!.transformToByteArray();
    return Buffer.from(bytes);
  }

  async presignGet(key: string, opts?: PresignGetOptions): Promise<string> {
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: opts?.downloadName
        ? `attachment; filename="${encodeURIComponent(opts.downloadName)}"`
        : undefined,
    });
    return getSignedUrl(this.client, cmd, { expiresIn: opts?.expiresIn ?? 300 });
  }

  async presignPut(key: string, contentType: string, expiresIn = 300): Promise<string> {
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    return getSignedUrl(this.client, cmd, { expiresIn });
  }
}

let instance: Storage | undefined;

export function getStorage(): Storage {
  if (instance) return instance;

  if (process.env.STORAGE_DRIVER === 's3') {
    const { S3_BUCKET, S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
    if (!S3_BUCKET || !S3_ENDPOINT || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
      throw new Error('STORAGE_DRIVER=s3 يتطلب S3_BUCKET و S3_ENDPOINT و مفاتيح الوصول.');
    }
    instance = new S3Storage(
      S3_BUCKET,
      S3_ENDPOINT,
      S3_REGION || 'auto',
      S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY,
    );
  } else {
    instance = new DiskStorage(path.join(process.cwd(), '.storage'));
  }
  return instance;
}

/** Build a stable storage key for a tender document. */
export function tenderDocKey(workspaceId: string, tenderId: string, fileName: string): string {
  const safe = fileName.replace(/[^\w.\-؀-ۿ]+/g, '_');
  return `workspaces/${workspaceId}/tenders/${tenderId}/${Date.now()}-${safe}`;
}
