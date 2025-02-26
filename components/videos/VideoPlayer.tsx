"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { VideoLoadingIndicator } from "./VideoLoadingIndicator";
import { VideoProgressBar } from "./VideoProgressBar";
import { VideoPlayerControls } from "./VideoPlayerControls";

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  title: string;
}

export function VideoPlayer({ videoUrl, poster, title }: VideoPlayerProps) {
  const t = useTranslations();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);
    };

    const handleVolumeChange = () => {
      setVolume(videoElement.volume);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
    videoElement.addEventListener("volumechange", handleVolumeChange);
    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.removeEventListener("volumechange", handleVolumeChange);
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Play/pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Seek to position
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setVolume(videoRef.current.muted ? 0 : videoRef.current.volume);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      <VideoLoadingIndicator isLoading={isLoading} />

      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        className="w-full aspect-video object-contain"
        onClick={togglePlay}
        title={title}
        playsInline
      />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex flex-col gap-2">
          <VideoProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />

          <VideoPlayerControls
            isPlaying={isPlaying}
            volume={volume}
            isFullscreen={isFullscreen}
            onPlayPause={togglePlay}
            onMute={toggleMute}
            onVolumeChange={handleVolumeChange}
            onFullscreen={toggleFullscreen}
          />
        </div>
      </div>
    </div>
  );
}
