import { StorageService } from '../services/storage.service';

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Missing file data' });
  }

  const fileNode = formData.find(p => p.name === 'file');
  const restaurantIdNode = formData.find(p => p.name === 'restaurantId');

  if (!fileNode || !restaurantIdNode) {
    throw createError({ statusCode: 400, statusMessage: 'File asset or Restaurant ID missing' });
  }

  const restaurantId = restaurantIdNode.data.toString();
  const fileName = fileNode.filename || 'upload.jpg';

  // Upload to R2 via native binding
  const key = await StorageService.uploadDirect(
    event, 
    restaurantId, 
    fileName, 
    fileNode.data
  );

  return { 
    key, 
    url: `https://menus.tipsha.com/${key}` 
  };
});
