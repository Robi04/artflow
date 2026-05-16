import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'submissions';

@Injectable()
export class SupabaseService implements OnModuleInit {
  readonly client: SupabaseClient;

  constructor(config: ConfigService) {
    this.client = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async onModuleInit() {
    const { data: buckets } = await this.client.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET);
    if (!exists) {
      await this.client.storage.createBucket(BUCKET, { public: true });
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(path, file.buffer, { contentType: file.mimetype });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = this.client.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
}
