"use client";

import { useState } from "react";
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
import { motion } from "framer-motion";

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
}

export function DetectionResults({
  detections,
  videoId,
}: DetectionResultsProps) {
  const t = useTranslations();
  const [selectedTab, setSelectedTab] = useState("summary");
  const [selectedObjectType, setSelectedObjectType] = useState<string | null>(
    null
  );

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("videoDetails.detectionResults")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">
              {t("videoDetails.summary")}
            </TabsTrigger>
            <TabsTrigger value="timeline">
              {t("videoDetails.timeline")}
            </TabsTrigger>
            <TabsTrigger value="data">{t("videoDetails.data")}</TabsTrigger>
          </TabsList>

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

                return (
                  <motion.div
                    key={detection.id}
                    className="absolute top-2 w-2 h-16 rounded-full bg-primary/80 hover:bg-primary cursor-pointer"
                    style={{ left: `calc(${position}% - 4px)` }}
                    whileHover={{ scale: 1.5 }}
                    title={`${detection.objectType} - ${detection.timestamp}`}
                  />
                );
              })}
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
