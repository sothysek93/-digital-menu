import { H3Event } from 'h3';

export class StorageService {
  static async getUploadUrl(event: H3Event, restaurantId: string, fileName: string) {
    const key = `menus/${restaurantId}/${fileName}`;
    // Native R2 doesn't use signed URLs in the same way, we'll use a direct PUT approach or pre-authenticated route
    // For now we'll support direct upload which is simpler for R2 bindings
    return `PUT_DIRECT_TO_API_/${key}`;
  }

  static async uploadDirect(event: H3Event, restaurantId: string, fileName: string, buffer: Buffer) {
    const key = `menus/${restaurantId}/${fileName}`;
    const { BUCKET } = event.context.cloudflare.env;
    
    await BUCKET.put(key, buffer, {
      httpMetadata: {
        contentType: 'image/jpeg', // Or detect from extension
      }
    });

    return key;
  }
}
