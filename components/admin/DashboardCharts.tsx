"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";

// Đăng ký các components cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock data cho biểu đồ
const mockData = {
  videoStats: {
    labels: [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ],
    datasets: [
      {
        label: "Số video đã tải lên",
        data: [65, 78, 90, 85, 95, 110, 125, 130, 120, 140, 150, 160],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        fill: false,
      },
    ],
  },
  detectionStats: {
    labels: ["Bóng đá", "Không phải bóng đá"],
    datasets: [
      {
        data: [75, 25],
        backgroundColor: ["rgb(54, 162, 235)", "rgb(255, 99, 132)"],
      },
    ],
  },
  userActivity: {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [
      {
        label: "Số lượt phân tích video",
        data: [120, 190, 300, 250, 280, 320, 410],
        backgroundColor: "rgba(153, 102, 255, 0.5)",
      },
    ],
  },
};

export default function DashboardCharts() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Thống kê video theo tháng</CardTitle>
        </CardHeader>
        <CardContent>
          <Line
            data={mockData.videoStats}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom" as const,
                },
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ phát hiện bóng đá</CardTitle>
        </CardHeader>
        <CardContent>
          <Pie
            data={mockData.detectionStats}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom" as const,
                },
              },
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hoạt động trong tuần</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar
            data={mockData.userActivity}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom" as const,
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
