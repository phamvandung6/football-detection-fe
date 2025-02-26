import React from "react";

interface VideoProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function VideoProgressBar({
  currentTime,
  duration,
  onSeek,
}: VideoProgressBarProps) {
  // Format time (seconds to MM:SS)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 text-white text-xs">
      <span>{formatTime(currentTime)}</span>
      <input
        type="range"
        min="0"
        max={duration || 100}
        value={currentTime}
        onChange={onSeek}
        className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
      />
      <span>{formatTime(duration)}</span>
    </div>
  );
}
