"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import FilterBar from "./FilterBar";
import VideoList from "./VideoList";

export type VideoFilter = {
  search: string;
  status: string;
  result: string;
  dateRange: string;
};

export default function VideoManagement() {
  const [filter, setFilter] = useState<VideoFilter>({
    search: "",
    status: "all",
    result: "all",
    dateRange: "all",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FilterBar />
        <VideoList />
      </CardContent>
    </Card>
  );
}
