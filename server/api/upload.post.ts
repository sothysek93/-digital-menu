import { StorageService } from '../services/storage.service';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fileName, restaurantId } = body;
  
  if (!fileName || !restaurantId) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Missing fileName or restaurantId in body' 
    });
  }
  
  const uploadUrl = await StorageService.getUploadUrl(event, restaurantId, fileName);
  return { 
    uploadUrl,
    key: `menus/${restaurantId}/${fileName}`
  };
});
