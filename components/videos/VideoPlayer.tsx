"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import ReactPlayer from "react-player";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  title: string;
}

export function VideoPlayer({ videoUrl, poster, title }: VideoPlayerProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);

  // Format time in seconds to MM:SS format
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");

    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <div className="relative rounded-lg overflow-hidden bg-black w-full aspect-video">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        light={poster}
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
          },
        }}
        onReady={() => setIsLoading(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onProgress={(state) => setPlayed(state.played)}
        onDuration={(duration) => setDuration(duration)}
        onVolumeChange={(volume) => setVolume(volume)}
        progressInterval={500}
        className="react-player"
      />
    </div>
  );
}
