import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import "../styles/VideoPlayer.css";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  videoId: string;
}

export function VideoPlayer() {
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    videoId: "dQw4w9WgXcQ", // Default video (Rick Roll)
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [videoInput, setVideoInput] = useState("");

  // Load YouTube API
  useEffect(() => {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // Set up the callback before loading script
    window.onYouTubeIframeAPIReady = initializePlayer;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  const initializePlayer = () => {
    if (!iframeRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(iframeRef.current, {
      height: "500",
      width: "100%",
      videoId: "dQw4w9WgXcQ",
      playerVars: {
        autoplay: 0,
        controls: 0,
        modestbranding: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: (event: any) => {
          console.error("YouTube player error:", event.data);
        },
      },
    });
  };

  const onPlayerReady = () => {
    setIsInitialized(true);
  };

  const onPlayerStateChange = (event: any) => {
    const { PLAYING, PAUSED } = window.YT.PlayerState;
    const isPlaying = event.data === PLAYING;

    if (event.data === PLAYING || event.data === PAUSED) {
      // Only broadcast if not syncing to avoid loops
      if (!isSyncing) {
        socket.emit("video-state-change", {
          isPlaying,
          currentTime: playerRef.current.getCurrentTime(),
        });
      }
    }
  };

  // Listen for video state changes from other users
  useEffect(() => {
    socket.on("video-state-change", (data) => {
      if (!playerRef.current) return;

      setIsSyncing(true);

      // Apply state changes
      if (data.isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }

      // Sync time if difference is significant (more than 1 second)
      const currentTime = playerRef.current.getCurrentTime();
      if (Math.abs(currentTime - data.currentTime) > 1) {
        playerRef.current.seekTo(data.currentTime);
      }

      setTimeout(() => setIsSyncing(false), 500);
    });

    socket.on("video-seek", (data) => {
      if (!playerRef.current) return;
      setIsSyncing(true);
      playerRef.current.seekTo(data.currentTime);
      setTimeout(() => setIsSyncing(false), 500);
    });

    socket.on("video-load", (data) => {
      if (!playerRef.current) return;
      playerRef.current.loadVideoById(data.videoId);
      setPlayerState((prev) => ({ ...prev, videoId: data.videoId }));
    });

    return () => {
      socket.off("video-state-change");
      socket.off("video-seek");
      socket.off("video-load");
    };
  }, []);

  // Update player state periodically
  useEffect(() => {
    if (!isInitialized || !playerRef.current) return;

    const interval = setInterval(() => {
      setPlayerState((prev) => ({
        ...prev,
        currentTime: playerRef.current.getCurrentTime(),
        duration: playerRef.current.getDuration(),
        isPlaying: playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [isInitialized]);

  const handlePlay = () => {
    if (!playerRef.current) return;
    playerRef.current.playVideo();
    socket.emit("video-state-change", {
      isPlaying: true,
      currentTime: playerRef.current.getCurrentTime(),
    });
  };

  const handlePause = () => {
    if (!playerRef.current) return;
    playerRef.current.pauseVideo();
    socket.emit("video-state-change", {
      isPlaying: false,
      currentTime: playerRef.current.getCurrentTime(),
    });
  };

  const handleSkip = (seconds: number) => {
    if (!playerRef.current) return;
    const newTime = playerRef.current.getCurrentTime() + seconds;
    playerRef.current.seekTo(Math.max(0, newTime));
    socket.emit("video-seek", { currentTime: Math.max(0, newTime) });
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current) return;
    const newTime = parseFloat(e.target.value);
    playerRef.current.seekTo(newTime);
    socket.emit("video-seek", { currentTime: newTime });
  };

  const handleLoadVideo = () => {
    if (!videoInput || !playerRef.current) return;

    // Extract video ID from URL or use as direct ID
    let videoId = videoInput;
    if (videoInput.includes("youtube.com") || videoInput.includes("youtu.be")) {
      const match = videoInput.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      videoId = match ? match[1] : videoInput;
    }

    playerRef.current.loadVideoById(videoId);
    setPlayerState((prev) => ({ ...prev, videoId, currentTime: 0 }));
    socket.emit("video-load", { videoId });
    setVideoInput("");
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <h1>watchparty</h1>
      <div>
        <div ref={iframeRef} style={{ width: "100%", height: "400px" }} />
      </div>
      <div style={{ margin: "16px 0" }}>
        <button onClick={() => handleSkip(-10)}>-10s</button>
        <button onClick={playerState.isPlaying ? handlePause : handlePlay}>
          {playerState.isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={() => handleSkip(10)}>+10s</button>
      </div>
      <div style={{ margin: "8px 0" }}>
        <input
          type="range"
          min={0}
          max={Number.isFinite(playerState.duration) ? playerState.duration : 0}
          value={Number.isFinite(playerState.currentTime) ? playerState.currentTime : 0}
          onChange={handleProgressChange}
          style={{ width: "100%" }}
        />
        <span>
          {formatTime(Number.isFinite(playerState.currentTime) ? playerState.currentTime : 0)} / {formatTime(Number.isFinite(playerState.duration) ? playerState.duration : 0)}
        </span>
      </div>
      <div style={{ margin: "8px 0" }}>
        <input
          type="text"
          placeholder="YouTube URL or ID"
          value={videoInput}
          onChange={(e) => setVideoInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleLoadVideo()}
        />
        <button onClick={handleLoadVideo}>Load Video</button>
      </div>
    </div>
  );
}
