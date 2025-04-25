"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import DashboardCharts from "./DashboardCharts";
import VideoManagement from "./VideoManagement";

// Mock data và columns cho bảng users
const mockUsers = [
  {
    id: 1,
    email: "user1@example.com",
    name: "Nguyễn Văn A",
    role: "User",
    status: "Active",
  },
  {
    id: 2,
    email: "user2@example.com",
    name: "Trần Thị B",
    role: "Admin",
    status: "Active",
  },
  {
    id: 3,
    email: "user3@example.com",
    name: "Lê Văn C",
    role: "User",
    status: "Inactive",
  },
];

// Mock data cho bảng videos
const mockVideos = [
  {
    id: 1,
    title: "Trận đấu 1",
    uploader: "user1@example.com",
    status: "Processed",
    result: "Football",
  },
  {
    id: 2,
    title: "Video 2",
    uploader: "user2@example.com",
    status: "Processing",
    result: "Pending",
  },
  {
    id: 3,
    title: "Highlight",
    uploader: "user3@example.com",
    status: "Failed",
    result: "Error",
  },
];

// Định nghĩa cột cho bảng users
const userColumns: ColumnDef<any>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "name",
    header: "Tên",
  },
  {
    accessorKey: "role",
    header: "Vai trò",
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" className="h-8 w-8 p-0">
        •••
      </Button>
    ),
  },
];

// Định nghĩa cột cho bảng videos
const videoColumns: ColumnDef<any>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tiêu đề <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "uploader",
    header: "Người tải lên",
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
  },
  {
    accessorKey: "result",
    header: "Kết quả",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" className="h-8 w-8 p-0">
        •••
      </Button>
    ),
  },
];

export default function AdminTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
        <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
        <TabsTrigger value="videos">Quản lý video</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {/* Thống kê tổng quan */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng số video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +20.1% so với tháng trước
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Người dùng hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">
                +12.5% so với tháng trước
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tỷ lệ phát hiện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">75.2%</div>
              <p className="text-xs text-muted-foreground">
                +5.2% so với tháng trước
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Thời gian xử lý TB
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4s</div>
              <p className="text-xs text-muted-foreground">
                -0.3s so với tháng trước
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Biểu đồ thống kê */}
        <DashboardCharts />
      </TabsContent>

      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>Quản lý người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={userColumns} data={mockUsers} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="videos">
        <VideoManagement />
      </TabsContent>
    </Tabs>
  );
}
