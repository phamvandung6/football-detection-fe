"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  expiresAt?: string;
  onRefreshStream?: () => Promise<void>;
  isLoadingStream?: boolean;
}

export function VideoPlayer({ 
  videoUrl, 
  thumbnailUrl, 
  title = "Video",
  expiresAt,
  onRefreshStream,
  isLoadingStream
}: VideoPlayerProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<ReactPlayer>(null);

  // Kiểm tra và làm mới URL nếu hết hạn
  useEffect(() => {
    if (!expiresAt) return;
    
    const checkExpiry = () => {
      const expiryTime = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      
      // Nếu còn ít hơn 5 phút tới hạn, thông báo cho user
      if (expiryTime - now < 5 * 60 * 1000) {
        setError(t("videoPlayer.urlExpiring"));
      }
      
      // Nếu đã hết hạn, thông báo lỗi
      if (expiryTime <= now) {
        setError(t("videoPlayer.urlExpired"));
      }
    };
    
    checkExpiry();
    const intervalId = setInterval(checkExpiry, 60000); // Kiểm tra mỗi phút
    
    return () => clearInterval(intervalId);
  }, [expiresAt, t]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-black w-full aspect-video">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 text-white p-4 text-center">
          <p className="mb-2">{error}</p>
          {onRefreshStream && !isLoadingStream && (
            <button 
              className="px-4 py-1 bg-primary text-primary-foreground rounded-md text-sm mb-2"
              onClick={async () => {
                setError(null);
                await onRefreshStream();
              }}
            >
              {t("videoPlayer.refreshStream")}
            </button>
          )}
          <button 
            className="px-4 py-1 bg-gray-500 text-white rounded-md text-sm"
            onClick={() => window.location.reload()}
          >
            {t("common.refreshPage")}
          </button>
        </div>
      )}

      {/* Video Player */}
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        volume={volume}
        muted={volume === 0}
        controls={true}
        light={thumbnailUrl}
        pip={true}
        stopOnUnmount={true}
        playsinline={true}
        config={{
          file: {
            attributes: {
              controlsList: "nodownload",
              disablePictureInPicture: false,
              title: title,
            },
            forceVideo: true,
          },
        }}
        onReady={() => setIsLoading(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onProgress={(state) => setPlayed(state.played)}
        onDuration={(duration) => setDuration(duration)}
        onVolumeChange={(volume) => setVolume(volume)}
        onError={(err) => {
          console.error("Video player error:", err);
          setError(t("videoPlayer.playbackError"));
        }}
        progressInterval={500}
        className="react-player"
      />
    </div>
  );
}
