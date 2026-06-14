import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface StoragePutInput {
  key: string;
  body: Buffer | Uint8Array;
  contentType?: string;
}

/**
 * Storage port. The disk adapter (default) needs no cloud account. An
 * S3-compatible adapter (R2/S3/MinIO) can be dropped in behind the same
 * interface — see `STORAGE_DRIVER` in .env.example.
 */
export interface Storage {
  put(input: StoragePutInput): Promise<{ key: string }>;
  read(key: string): Promise<Buffer>;
  localPath(key: string): string | null;
}

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

  localPath(key: string): string {
    return this.full(key);
  }
}

let instance: Storage | undefined;

export function getStorage(): Storage {
  if (instance) return instance;
  // S3 adapter would be selected here when STORAGE_DRIVER=s3.
  const root = path.join(process.cwd(), '.storage');
  instance = new DiskStorage(root);
  return instance;
}

/** Build a stable storage key for a tender document. */
export function tenderDocKey(workspaceId: string, tenderId: string, fileName: string): string {
  const safe = fileName.replace(/[^\w.\-؀-ۿ]+/g, '_');
  return `workspaces/${workspaceId}/tenders/${tenderId}/${Date.now()}-${safe}`;
}
