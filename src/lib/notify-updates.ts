import { pusherServer, ADMIN_UPDATE_CHANNEL, UPDATE_EVENTS } from './pusher';

export async function notifyContentUpdate(contentType: string, details?: Record<string, unknown>) {
  // Skip if Pusher is not configured
  if (!pusherServer) {
    console.log('Pusher not configured. Skipping real-time notification.');
    return;
  }

  try {
    await pusherServer.trigger(
      ADMIN_UPDATE_CHANNEL,
      UPDATE_EVENTS.CONTENT_UPDATE,
      {
        contentType,
        details,
        message: `Content has been updated: ${contentType}`,
        timestamp: new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Failed to send Pusher notification:', error);
  }
}