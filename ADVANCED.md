# Advanced Configuration & Troubleshooting

## Environment Setup

### Using Environment Variables

Create `.env.local` in the client directory:

```bash
VITE_SERVER_URL=http://localhost:3000
```

Then update `client/src/socket.ts`:

```typescript
const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
export const socket = io(serverUrl);
```

## Development Tips

### Debug Mode

Add console logging to track events. In `VideoPlayer.tsx`:

```typescript
const handlePlay = () => {
  console.log("Play action triggered");
  if (!playerRef.current) return;
  playerRef.current.playVideo();
  socket.emit("video-state-change", {
    isPlaying: true,
    currentTime: playerRef.current.getCurrentTime(),
  });
};
```

### Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Filter for "socket.io"
4. You'll see all real-time events being transmitted

### Server Logging

Monitor server events in terminal:

```
Server running on port 3000
User connected: abc123def456
Video state change: { isPlaying: true, currentTime: 45.2 }
Video seek: { currentTime: 120.5 }
User disconnected: abc123def456
```

## Common Issues & Solutions

### Issue: "socket.io-client not found"

**Solution:** Ensure dependencies are installed in client:

```bash
cd client
pnpm install
pnpm install socket.io-client
```

### Issue: Videos load but don't sync

**Cause:** Usually a socket connection issue

**Debug:**
1. Check browser console for errors
2. Verify server is running: `curl http://localhost:3000`
3. In DevTools, check if socket events are being sent/received
4. Look for CORS errors

**Solution:**

```typescript
// Add to socket.ts for debugging
socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("disconnect", () => console.log("Disconnected"));
socket.on("connect_error", (error) => console.error("Connection error:", error));
```

### Issue: Choppy or delayed sync

**Cause:** Network latency or sync happening too frequently

**Solution:** The code already has built-in improvements:
- 1-second tolerance before syncing time
- 500ms debounce on isSyncing
- Skip small time differences

### Issue: YouTube API not loading

**Cause:** YouTube script blocked or network issue

**Debug:**
1. Check browser console for script errors
2. Verify YouTube isn't blocked in your region
3. Check if extensions are blocking external scripts

**Solution:**
```typescript
// In VideoPlayer.tsx, verify API loaded
useEffect(() => {
  console.log("YouTube API:", window.YT);
  if (window.YT && window.YT.Player) {
    console.log("✓ YouTube API ready");
  }
}, []);
```

## Performance Optimization

### Reduce Update Frequency

In `VideoPlayer.tsx`, the interval is set to 100ms:

```typescript
const interval = setInterval(() => {
  // Update happens every 100ms
}, 100);
```

Change to 250ms for lower network usage:

```typescript
const interval = setInterval(() => {
  // Update happens every 250ms
}, 250);
```

### Larger Time Sync Tolerance

Increase from 1 second to 2 seconds:

```typescript
if (Math.abs(currentTime - data.currentTime) > 2) {
  playerRef.current.seekTo(data.currentTime);
}
```

## Production Deployment

### Building for Production

**Client:**
```bash
cd client
pnpm run build
# Creates dist/ folder for deployment
```

**Server:**
No build needed, TypeScript runs via `tsx`

### Deployment Options

#### Option 1: Heroku
```bash
heroku create your-watchparty-app
git push heroku main
```

#### Option 2: Vercel + Railway
- Deploy client to Vercel
- Deploy server to Railway
- Update `VITE_SERVER_URL` to Railway URL

#### Option 3: Self-hosted
```bash
# On your server
git clone your-repo
cd vid-watchparty/server
pnpm install
pnpm start &
```

### Environment Variables for Production

Server `.env`:
```
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com
```

Client `.env.production`:
```
VITE_SERVER_URL=https://your-server.com
```

## Advanced Features

### Adding Room/Session Support

Modify server to support rooms:

```typescript
socket.on("join-room", (roomId) => {
  socket.join(roomId);
  console.log(`User joined room: ${roomId}`);
});

socket.on("video-state-change", (data) => {
  socket.broadcast.to(socket.handshake.headers.roomid || "default").emit("video-state-change", data);
});
```

### Adding User Presence

Track who's connected:

```typescript
let connectedUsers = new Map();

io.on("connection", (socket) => {
  socket.on("user-info", (info) => {
    connectedUsers.set(socket.id, info);
    io.emit("users-updated", Array.from(connectedUsers.values()));
  });

  socket.on("disconnect", () => {
    connectedUsers.delete(socket.id);
    io.emit("users-updated", Array.from(connectedUsers.values()));
  });
});
```

### Adding Chat

```typescript
// Server
socket.on("chat-message", (message) => {
  socket.broadcast.emit("chat-message", {
    userId: socket.id,
    message,
    timestamp: new Date(),
  });
});

// Client
socket.on("chat-message", (data) => {
  console.log(`${data.userId}: ${data.message}`);
});
```

## Security Considerations

### CORS Protection
Already configured in server, verify:
```typescript
cors: {
  origin: "http://localhost:5173",  // Change for production
  methods: ["GET", "POST"],
  credentials: true
}
```

### Input Validation
Add video ID validation:

```typescript
const validateVideoId = (id: string) => {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
};
```

### Rate Limiting
Consider adding rate limiting for production:
```bash
pnpm add express-rate-limit
```

## Monitoring & Logging

### Server Logging

Install and use `morgan`:

```bash
pnpm add morgan
```

```typescript
import morgan from "morgan";
app.use(morgan("combined"));
```

### Client Error Tracking

Use services like Sentry for production:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({ dsn: "your-sentry-dsn" });
```

## Performance Metrics

Monitor these metrics:
- Socket latency (round trip time)
- Video sync accuracy (time difference)
- Number of active connections
- Memory usage
- CPU usage