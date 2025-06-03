import Pusher from 'pusher';

// Server-side Pusher instance (only create if credentials exist)
let pusherServer: Pusher | null = null;

if (process.env.PUSHER_APP_ID && process.env.PUSHER_SECRET && process.env.NEXT_PUBLIC_PUSHER_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  });
}

export { pusherServer };

// Channel for admin updates
export const ADMIN_UPDATE_CHANNEL = 'admin-updates';

// Event types
export const UPDATE_EVENTS = {
  CONTENT_UPDATE: 'content-update',
} as const;