# Video Watchparty - Setup Guide

## Project Overview

This is a real-time video watchparty application where two or more users can watch YouTube videos together with perfectly synchronized playback. When one user plays, pauses, or seeks in the video, all other connected users see the same action instantly.

## Architecture

### Frontend (`/client/src/components/VideoPlayer.tsx`)
- **YouTube IFrame API Integration**: Uses official YouTube IFrame API for robust video control
- **Custom Controls**: Play, pause, skip forward/backward 10 seconds, and manual seeking
- **Socket.io Synchronization**: Real-time communication with other connected users
- **Anti-Loop Protection**: `isSyncing` state prevents infinite feedback loops
- **Video Loading**: Support for YouTube URLs and direct video IDs

### Backend (`/server/server.ts`)
- **Express Server**: HTTP server for serving the application
- **Socket.io Server**: Handles real-time communication between clients
- **Broadcast Events**: Uses `socket.broadcast` to sync all connected clients
- **Event Handlers**:
  - `video-state-change`: Play/pause commands
  - `video-seek`: Seeking in the video
  - `video-load`: Loading a new video

### Socket Events

**Client to Server:**
```typescript
socket.emit("video-state-change", { isPlaying: boolean, currentTime: number })
socket.emit("video-seek", { currentTime: number })
socket.emit("video-load", { videoId: string })
```

**Server to Clients (via broadcast):**
```typescript
socket.broadcast.emit("video-state-change", data)
socket.broadcast.emit("video-seek", data)
socket.broadcast.emit("video-load", data)
```

## How to Use

### Starting the Application

1. **Install Dependencies**
   ```bash
   # In client directory
   cd client
   pnpm install

   # In server directory
   cd ../server
   pnpm install
   ```

2. **Start the Server**
   ```bash
   cd server
   pnpm start
   ```
   The server runs on `http://localhost:3000`

3. **Start the Client**
   ```bash
   cd client
   pnpm run dev
   ```
   The client runs on `http://localhost:5173`

4. **Open in Multiple Browsers/Tabs**
   - Open `http://localhost:5173` in two different browser windows or tabs
   - Both windows will connect to the same Socket.io server

### Using the Video Player

**Load a Video:**
- Enter a YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Or use just the video ID: `dQw4w9WgXcQ`
- Click "Load Video" or press Enter

**Playback Controls:**
- **▶ Play / ⏸ Pause**: Toggle video playback
- **⏪ -10s**: Skip backward 10 seconds
- **+10s ⏩**: Skip forward 10 seconds
- **Progress Bar**: Click or drag to seek to any position

## Key Features

✅ **Real-time Synchronization**: Instant sync between all connected users
✅ **Anti-Loop Protection**: Prevents feedback loops with `isSyncing` state
✅ **Time Tolerance**: Only syncs if time difference > 1 second (prevents jitter)
✅ **Responsive Design**: Works on desktop, tablet, and mobile
✅ **Multiple Users**: Supports 2+ users connected simultaneously
✅ **Status Indicators**: Shows connection status and sync status

## Technical Details

### Synchronization Logic

1. **When a user plays/pauses:**
   - The local player immediately changes state
   - A `video-state-change` event is emitted to the server
   - Server broadcasts to all other connected clients
   - Other clients receive and apply the state change

2. **When a user seeks:**
   - Seek happens locally
   - `video-seek` event is sent to server
   - Server broadcasts to others
   - Other clients seek to the same position

3. **Anti-Loop Protection:**
   - When receiving an event from another user, `isSyncing` is set to true
   - During sync, local player state changes don't emit new events
   - After 500ms, `isSyncing` is set to false
   - This prevents the same event from bouncing back and forth

### Time Sync Tolerance

The system only syncs if the time difference is > 1 second. This prevents:
- Constant micro-adjustments from jitter
- Network latency from causing jerky playback
- Minor playback speed differences between clients

## Troubleshooting

**Videos won't load:**
- Make sure the YouTube video ID is correct
- Check that YouTube's IFrame API is accessible
- Verify no browser extensions are blocking YouTube

**Sync isn't working:**
- Check browser console for errors
- Verify both clients are connected to the same server
- Try refreshing both browser windows

**Port already in use:**
- Change port in server: `server.listen(3001, ...)`
- Update client URL in `client/src/socket.ts`

## Customization Ideas

- Add chat functionality
- Display connected user count
- Add playlist support
- Show which user initiated each action
- Add video quality selector
- Implement guest/room codes
- Add playback speed controls
