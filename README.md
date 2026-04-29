# 🎬 Video Watchparty

Watch YouTube videos together in real-time! Perfectly synchronized playback across multiple users with custom video controls.

## ✨ Features

- 🎥 **YouTube Integration**: Direct YouTube video playback with IFrame API
- ⚡ **Real-time Sync**: Instant synchronization via Socket.io
- 🎮 **Custom Controls**: Play, pause, skip, and seek controls
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 👥 **Multiple Users**: Support for 2+ users watching together
- 🔄 **Anti-Loop Protection**: Smart sync to prevent feedback loops

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- pnpm (or npm)

### Installation

```bash
# Run the setup script
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
# Install server dependencies
cd server
pnpm install

# Install client dependencies
cd client
pnpm install
cd ..
```

### Running the Application

**Terminal 1 - Start the Server:**
```bash
cd server
pnpm start
```
The server will start on `http://localhost:3000`

**Terminal 2 - Start the Client:**
```bash
cd client
pnpm run dev
```
The client will start on `http://localhost:5173`

### Using the Watchparty

1. Open `http://localhost:5173` in two different browser windows or tabs
2. Enter a YouTube video ID or URL in the video loader
3. Click "Load Video"
4. Start watching! Actions from one user sync instantly to the other

## 📖 How It Works

### Frontend Architecture
- **React + Vite**: Fast development and build
- **YouTube IFrame API**: Robust video control
- **Socket.io Client**: Real-time communication
- **Custom CSS**: Beautiful, responsive UI

### Backend Architecture
- **Express Server**: HTTP server
- **Socket.io**: Real-time event broadcasting
- **CORS Enabled**: Cross-origin support

### Synchronization Flow

```
User A Action (Play/Pause/Seek)
    ↓
Local Player Update
    ↓
Emit Socket Event
    ↓
Server Receives & Broadcasts
    ↓
User B Receives Event
    ↓
User B Player Updates
```

## 🎮 Controls

| Control | Action |
|---------|--------|
| ▶ Play / ⏸ Pause | Toggle playback |
| ⏪ -10s | Skip backward 10 seconds |
| +10s ⏩ | Skip forward 10 seconds |
| Progress Bar | Seek to any position |

## 📝 Loading Videos

You can load videos in multiple ways:

- **YouTube URL**: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- **Short URL**: `https://youtu.be/dQw4w9WgXcQ`
- **Video ID**: `dQw4w9WgXcQ`

## 🔧 Configuration

### Server Configuration
Edit `server/server.ts`:
- Change port: `server.listen(3001, ...)`
- Update CORS origin if hosting elsewhere

### Client Configuration
Edit `client/src/socket.ts`:
- Change server URL: `io("http://your-server:3000")`

## 📂 Project Structure

```
vid-watchparty/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── VideoPlayer.tsx   # Main player component
│   │   ├── styles/
│   │   │   └── VideoPlayer.css   # Player styling
│   │   ├── App.tsx
│   │   └── socket.ts
│   └── package.json
├── server/                    # Express backend
│   ├── server.ts
│   └── package.json
└── README.md
```

## 🐛 Troubleshooting

**Videos won't load:**
- Verify YouTube video ID is correct
- Check browser console for errors
- Ensure no extensions are blocking YouTube

**Sync not working:**
- Check both clients connected to same server
- Look for errors in browser console and server logs
- Try refreshing both windows

**Port already in use:**
- Find process: `lsof -i :3000`
- Kill process: `kill -9 <PID>`
- Or change port in server and client config

## 🚀 Future Enhancements

- [ ] User authentication & rooms
- [ ] Chat functionality
- [ ] Playlist support
- [ ] Playback speed control
- [ ] Video quality selector
- [ ] User presence indicators
- [ ] Pause with reason notification
- [ ] Mobile app version

## 📄 License

MIT