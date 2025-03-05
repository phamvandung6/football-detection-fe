"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

interface Detection {
  id: string;
  objectType: string;
  confidence: number;
  timestamp: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  frameNumber: number;
}

interface DetectionResultsProps {
  detections: Detection[];
  videoId: string;
  videoUrl: string;
}

export function DetectionResults({
  detections,
  videoId,
  videoUrl,
}: DetectionResultsProps) {
  const t = useTranslations();
  const [selectedTab, setSelectedTab] = useState("visualization");
  const [selectedObjectType, setSelectedObjectType] = useState<string | null>(
    null
  );
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [activeDetections, setActiveDetections] = useState<Detection[]>([]);
  const playerRef = useRef<ReactPlayer>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Calculate summary statistics
  const objectTypes = [...new Set(detections.map((d) => d.objectType))];
  const objectCounts = objectTypes.map((type) => ({
    type,
    count: detections.filter((d) => d.objectType === type).length,
  }));

  // Sort by count (descending)
  objectCounts.sort((a, b) => b.count - a.count);

  // Filter detections by selected object type
  const filteredDetections = selectedObjectType
    ? detections.filter((d) => d.objectType === selectedObjectType)
    : detections;

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-500";
    if (confidence >= 0.7) return "text-yellow-500";
    return "text-red-500";
  };

  // Format time to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle player progress
  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    setCurrentTime(state.playedSeconds);

    // Find detections that are active at the current time
    const currentTimeMs = state.playedSeconds * 1000;
    const timeWindow = 500; // 500ms window to show detections

    const active = detections.filter((detection) => {
      const detectionTime = new Date(detection.timestamp).getTime();
      const videoStartTime = new Date(detections[0].timestamp).getTime();
      const relativeDetectionTime = detectionTime - videoStartTime;

      return Math.abs(relativeDetectionTime - currentTimeMs) < timeWindow;
    });

    setActiveDetections(active);
  };

  // Jump to specific detection
  const jumpToDetection = (detection: Detection) => {
    if (!playerRef.current || detections.length === 0) return;

    const detectionTime = new Date(detection.timestamp).getTime();
    const videoStartTime = new Date(detections[0].timestamp).getTime();
    const relativeTime = (detectionTime - videoStartTime) / 1000;

    playerRef.current.seekTo(relativeTime, "seconds");
    setPlaying(true);
  };

  // Skip forward/backward
  const skip = (amount: number) => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + amount));
    playerRef.current.seekTo(newTime, "seconds");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("videoDetails.detectionResults")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visualization">
              {t("videoDetails.visualization")}
            </TabsTrigger>
            <TabsTrigger value="summary">
              {t("videoDetails.summary")}
            </TabsTrigger>
            <TabsTrigger value="timeline">
              {t("videoDetails.timeline")}
            </TabsTrigger>
            <TabsTrigger value="data">{t("videoDetails.data")}</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-2/3">
                <div className="relative" ref={videoContainerRef}>
                  <ReactPlayer
                    ref={playerRef}
                    url={videoUrl}
                    width="100%"
                    height="auto"
                    playing={playing}
                    volume={volume}
                    onProgress={handleProgress}
                    onDuration={setDuration}
                    progressInterval={100}
                    className="rounded-lg overflow-hidden"
                  />

                  {/* Bounding boxes overlay */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {activeDetections.map((detection) => {
                      const { x, y, width, height } = detection.boundingBox;
                      const color =
                        detection.objectType === "person"
                          ? "blue"
                          : detection.objectType === "ball"
                          ? "red"
                          : detection.objectType === "goal"
                          ? "green"
                          : "yellow";

                      return (
                        <div
                          key={detection.id}
                          className="absolute border-2 flex items-end justify-start"
                          style={{
                            left: `${x * 100}%`,
                            top: `${y * 100}%`,
                            width: `${width * 100}%`,
                            height: `${height * 100}%`,
                            borderColor: color,
                          }}
                        >
                          <div
                            className={`text-xs px-1 py-0.5 bg-${color}-500 text-white rounded-sm`}
                          >
                            {detection.objectType} (
                            {(detection.confidence * 100).toFixed(0)}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Player controls */}
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => skip(-5)}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPlaying(!playing)}
                    >
                      {playing ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => skip(5)}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 mx-2">
                      <Slider
                        value={[currentTime]}
                        max={duration}
                        step={0.1}
                        onValueChange={(value) => {
                          if (playerRef.current) {
                            playerRef.current.seekTo(value[0], "seconds");
                          }
                        }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/3">
                <div className="border rounded-lg p-4 h-full">
                  <h3 className="text-lg font-medium mb-4">
                    {t("videoDetails.activeDetections")}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {objectCounts.map(({ type, count }) => (
                        <Badge
                          key={type}
                          variant={
                            selectedObjectType === type ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedObjectType(
                              selectedObjectType === type ? null : type
                            )
                          }
                        >
                          {type} ({count})
                        </Badge>
                      ))}
                    </div>

                    {activeDetections.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {activeDetections.map((detection) => (
                          <div
                            key={detection.id}
                            className="border rounded p-2 cursor-pointer hover:bg-muted"
                            onClick={() => jumpToDetection(detection)}
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {detection.objectType}
                              </span>
                              <span
                                className={getConfidenceColor(
                                  detection.confidence
                                )}
                              >
                                {(detection.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Frame: {detection.frameNumber} | Time:{" "}
                              {new Date(
                                detection.timestamp
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        {t("videoDetails.noActiveDetections")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {t("videoDetails.objectTypes")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {objectCounts.map(({ type, count }) => (
                    <Badge
                      key={type}
                      variant={
                        selectedObjectType === type ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedObjectType(
                          selectedObjectType === type ? null : type
                        )
                      }
                    >
                      {type} ({count})
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">
                  {t("videoDetails.statistics")}
                </h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("videoDetails.totalDetections")}:
                    </span>
                    <span className="font-medium">{detections.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("videoDetails.uniqueObjectTypes")}:
                    </span>
                    <span className="font-medium">{objectTypes.length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("videoDetails.avgConfidence")}:
                    </span>
                    <span className="font-medium">
                      {(
                        detections.reduce((sum, d) => sum + d.confidence, 0) /
                        detections.length
                      ).toFixed(2)}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">
                {t("videoDetails.topDetections")}
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("videoDetails.objectType")}</TableHead>
                      <TableHead className="text-right">
                        {t("videoDetails.count")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("videoDetails.percentage")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {objectCounts.slice(0, 5).map(({ type, count }) => (
                      <TableRow key={type}>
                        <TableCell className="font-medium">{type}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                        <TableCell className="text-right">
                          {((count / detections.length) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {selectedObjectType
                  ? `${t("videoDetails.timelineFor")} ${selectedObjectType}`
                  : t("videoDetails.detectionTimeline")}
              </h3>
              {selectedObjectType && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedObjectType(null)}
                >
                  {t("videoDetails.clearFilter")}
                </Button>
              )}
            </div>

            <div className="relative h-20 border rounded-md p-2">
              {filteredDetections.map((detection) => {
                // Calculate position based on timestamp
                const timestamp = new Date(detection.timestamp).getTime();
                const minTime = new Date(detections[0].timestamp).getTime();
                const maxTime = new Date(
                  detections[detections.length - 1].timestamp
                ).getTime();
                const position =
                  ((timestamp - minTime) / (maxTime - minTime)) * 100;

                // Determine color based on object type
                const getColor = (type: string) => {
                  switch (type.toLowerCase()) {
                    case "person":
                      return "bg-blue-500";
                    case "ball":
                      return "bg-red-500";
                    case "goal":
                      return "bg-green-500";
                    default:
                      return "bg-yellow-500";
                  }
                };

                return (
                  <motion.div
                    key={detection.id}
                    className={`absolute top-2 w-2 h-16 rounded-full ${getColor(
                      detection.objectType
                    )} hover:opacity-100 cursor-pointer opacity-80`}
                    style={{ left: `calc(${position}% - 4px)` }}
                    whileHover={{ scale: 1.5 }}
                    title={`${detection.objectType} - ${new Date(
                      detection.timestamp
                    ).toLocaleTimeString()}`}
                    onClick={() => jumpToDetection(detection)}
                  />
                );
              })}

              {/* Current time indicator */}
              {duration > 0 && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-primary z-10"
                  style={{
                    left: `${(currentTime / duration) * 100}%`,
                    display: selectedTab === "timeline" ? "block" : "none",
                  }}
                />
              )}
            </div>

            <div className="text-xs text-muted-foreground flex justify-between">
              <span>
                {detections.length > 0
                  ? new Date(detections[0].timestamp).toLocaleTimeString()
                  : "00:00:00"}
              </span>
              <span>
                {detections.length > 0
                  ? new Date(
                      detections[detections.length - 1].timestamp
                    ).toLocaleTimeString()
                  : "00:00:00"}
              </span>
            </div>
          </TabsContent>

          <TabsContent value="data">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {selectedObjectType
                  ? `${t("videoDetails.dataFor")} ${selectedObjectType}`
                  : t("videoDetails.detectionData")}
              </h3>
              {selectedObjectType && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedObjectType(null)}
                >
                  {t("videoDetails.clearFilter")}
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("videoDetails.objectType")}</TableHead>
                    <TableHead>{t("videoDetails.timestamp")}</TableHead>
                    <TableHead>{t("videoDetails.confidence")}</TableHead>
                    <TableHead>{t("videoDetails.frame")}</TableHead>
                    <TableHead>{t("videoDetails.position")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDetections.slice(0, 100).map((detection) => (
                    <TableRow key={detection.id}>
                      <TableCell>{detection.objectType}</TableCell>
                      <TableCell>
                        {new Date(detection.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell
                        className={getConfidenceColor(detection.confidence)}
                      >
                        {(detection.confidence * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>{detection.frameNumber}</TableCell>
                      <TableCell>
                        <span className="text-xs">
                          x: {detection.boundingBox.x.toFixed(2)}, y:{" "}
                          {detection.boundingBox.y.toFixed(2)}, w:{" "}
                          {detection.boundingBox.width.toFixed(2)}, h:{" "}
                          {detection.boundingBox.height.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => jumpToDetection(detection)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          {t("videoDetails.jumpTo")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredDetections.length > 100 && (
                <div className="text-center text-sm text-muted-foreground mt-4">
                  {t("videoDetails.showingFirst", { count: 100 })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
