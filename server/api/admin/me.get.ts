export default defineEventHandler((event) => {
  // The server/middleware/auth.ts already verified the token 
  // and attached the user to event.context.user
  if (!event.context.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  return event.context.user;
});
