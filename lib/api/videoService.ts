import { API_URL, STATIC_URL } from "@/lib/utils";

// Định nghĩa kiểu dữ liệu cho Video
export interface VideoMetadata {
  fps: number;
  width: number;
  height: number;
  duration: string;
  frame_count: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  original_filename: string;
  stored_filename: string;
  processed_filename: string | null;
  file_size: number;
  duration: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  task_id: string;
  video_metadata: VideoMetadata | null;
  created_at: string;
  updated_at: string;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  user_id: string;
  original_video_url: string;
  processed_video_url: string | null;
}

export interface VideoStreamUrls {
  original_url: string;
  processed_url: string | null;
  status: string;
  dimensions: {
    width: number;
    height: number;
  };
  duration: string;
  fps: number;
}

// Định nghĩa kiểu dữ liệu cho Detection
export interface Detection {
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

// Hàm lấy danh sách video
export async function getVideos(token: string): Promise<Video[]> {
  const response = await fetch(`${API_URL}/videos/?skip=0&limit=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch videos");
  }

  const videos = await response.json();

  // Chuyển đổi URL tương đối thành URL tuyệt đối
  return videos.map((video: Video) => {
    if (
      video.original_video_url &&
      !video.original_video_url.startsWith("http")
    ) {
      video.original_video_url = `${STATIC_URL}${video.original_video_url}`;
    }

    if (
      video.processed_video_url &&
      !video.processed_video_url.startsWith("http")
    ) {
      video.processed_video_url = `${STATIC_URL}${video.processed_video_url}`;
    }

    return video;
  });
}

// Hàm lấy chi tiết video
export async function getVideoById(id: string, token: string): Promise<Video> {
  const response = await fetch(`${API_URL}/videos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch video");
  }

  const video = await response.json();

  // Chuyển đổi URL tương đối thành URL tuyệt đối
  if (
    video.original_video_url &&
    !video.original_video_url.startsWith("http")
  ) {
    video.original_video_url = `${STATIC_URL}${video.original_video_url}`;
  }

  if (
    video.processed_video_url &&
    !video.processed_video_url.startsWith("http")
  ) {
    video.processed_video_url = `${STATIC_URL}${video.processed_video_url}`;
  }

  return video;
}

// Hàm lấy URL stream video
export async function getVideoStreamUrls(
  id: string,
  token: string
): Promise<VideoStreamUrls> {
  const response = await fetch(`${API_URL}/videos/${id}/stream_urls`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch video stream URLs");
  }

  const data = await response.json();

  // Chuyển đổi URL tương đối thành URL tuyệt đối
  if (data.original_url && !data.original_url.startsWith("http")) {
    data.original_url = `${STATIC_URL}${data.original_url}`;
  }

  if (data.processed_url && !data.processed_url.startsWith("http")) {
    data.processed_url = `${STATIC_URL}${data.processed_url}`;
  }

  return data;
}

// Hàm lấy kết quả phát hiện đối tượng trong video
export async function getVideoDetections(
  id: string,
  token: string
): Promise<Detection[]> {
  // TODO: Khi backend có sẵn endpoint /videos/{id}/detections, hãy bỏ comment đoạn code bên dưới
  /*
  const response = await fetch(`${API_URL}/videos/${id}/detections`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch video detections");
  }

  const data = await response.json();

  // Kiểm tra xem data có phải là mảng không
  if (!Array.isArray(data)) {
    console.error("API did not return an array for detections:", data);
    return []; // Trả về mảng rỗng nếu không có dữ liệu hoặc dữ liệu không phải mảng
  }

  // Chuyển đổi dữ liệu từ API sang định dạng Detection
  return data.map((item: any) => ({
    id: item.id || `detection-${Math.random().toString(36).substr(2, 9)}`,
    objectType: item.object_type || item.objectType || "unknown",
    confidence: item.confidence || 0,
    timestamp: item.timestamp || new Date().toISOString(),
    boundingBox: {
      x: item.bounding_box?.x || item.boundingBox?.x || 0,
      y: item.bounding_box?.y || item.boundingBox?.y || 0,
      width: item.bounding_box?.width || item.boundingBox?.width || 0,
      height: item.bounding_box?.height || item.boundingBox?.height || 0,
    },
    frameNumber: item.frame_number || item.frameNumber || 0,
  }));
  */

  // Tạm thời trả về mảng rỗng vì backend chưa có endpoint /videos/{id}/detections
  console.log(
    `[INFO] getVideoDetections called for video ${id}, but endpoint not implemented yet`
  );
  return [];
}

// Hàm tải lên video
export async function uploadVideo(
  formData: FormData,
  token: string,
  onProgress?: (progress: number) => void
): Promise<Video> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_URL}/videos/`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        resolve(response);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };

    xhr.send(formData);
  });
}

// Hàm xóa video
export async function deleteVideo(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/videos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete video");
  }
}

// Hàm tạo URL tải xuống video
export function getVideoDownloadUrl(
  id: string,
  processed: boolean = false,
  directStatic: boolean = false
): string {
  if (directStatic) {
    // Nếu cần truy cập trực tiếp đến file static
    const path = processed
      ? `/static/processed/${id}`
      : `/static/original/${id}`;
    return `${STATIC_URL}${path}`;
  }

  // Sử dụng API endpoint để tải xuống
  return `${API_URL}/videos/${id}/download?processed=${processed}`;
}
