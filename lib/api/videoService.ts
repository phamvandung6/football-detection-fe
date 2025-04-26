import { API_URL } from "@/lib/utils";
import { Video } from "@/types/video"; // Import type Video từ types/
import axios from "axios"; // Hoặc fetch

// Định nghĩa kiểu dữ liệu cho API response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Định nghĩa kiểu dữ liệu phân trang
interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Giữ lại các interface để tránh lỗi
export interface VideoMetadata {
  fps: number;
  width: number;
  height: number;
  duration: string;
  frame_count: number;
}

// Interface cho URL streaming
export interface VideoStreamUrls {
  original_url: string;
  processed_url: string | null;
  status: string;
  dimensions: {
    width: number;
    height: number;
  };
}

// Interface cho đối tượng phát hiện
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

// Lấy token từ đâu? Cần cơ chế lấy token an toàn khi gọi từ server/client
// Tạm thời bỏ qua việc truyền token trong ví dụ này, giả sử API xử lý session
// HOẶC: các hook/action sẽ tự lấy token (ví dụ từ session API)

/**
 * Fetch danh sách videos
 */
export const getVideos = async (token: string): Promise<Video[]> => {
  try {
    const response = await axios.get<{ data: Video[] }>(`${API_URL}/videos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data || []; // Giả sử API trả về trong { data: [...] }
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw new Error("Failed to fetch videos");
  }
};

/**
 * Fetch chi tiết video bằng ID
 */
export const getVideoById = async (
  id: string,
  token: string
): Promise<Video | null> => {
  try {
    const response = await axios.get<{ data: Video }>(
      `${API_URL}/videos/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data || null;
  } catch (error) {
    console.error(`Error fetching video ${id}:`, error);
    // Trả về null nếu không tìm thấy hoặc lỗi
    return null;
  }
};

/**
 * Upload video mới (chỉ gửi file, xử lý metadata/status ở backend)
 * Hàm này có thể được gọi bởi Server Action
 */
export const uploadVideoFile = async (
  formData: FormData,
  token: string,
  onUploadProgress?: (progress: number) => void // Callback tiến trình cho client
): Promise<{ success: boolean; message: string; videoId?: string }> => {
  // Trả về videoId nếu backend tạo ngay
  try {
    const response = await axios.post<{
      success: boolean;
      message: string;
      data?: { id: string };
    }>(
      `${API_URL}/videos/upload`, // Endpoint backend để upload
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        },
      }
    );
    return {
      success: response.data.success,
      message: response.data.message,
      videoId: response.data.data?.id,
    };
  } catch (error) {
    console.error("Error uploading video:", error);
    const message =
      error instanceof axios.AxiosError
        ? error.response?.data?.message || error.message
        : "Failed to upload video";
    throw new Error(message);
  }
};

/**
 * Xóa video bằng ID
 */
export const deleteVideo = async (id: string, token: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/videos/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(`Error deleting video ${id}:`, error);
    throw new Error("Failed to delete video");
  }
};

// Hàm lấy URL streaming video
export async function getVideoStreamUrls(
  id: string,
  token: string
): Promise<VideoStreamUrls> {
  // Thực tế API mới có 2 endpoint riêng cho original và processed
  // Tạm thời sẽ gọi cả 2 và kết hợp kết quả
  const originalUrlResponse = await fetch(
    `${API_URL}/videos/${id}/presigned-url?expirationInMinutes=15`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!originalUrlResponse.ok) {
    throw new Error("Không thể lấy URL stream video gốc");
  }

  const originalData: ApiResponse<string> = await originalUrlResponse.json();

  let processedUrl = null;
  let processedSuccess = false;

  try {
    const processedUrlResponse = await fetch(
      `${API_URL}/videos/${id}/processed-url?expirationInMinutes=15`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (processedUrlResponse.ok) {
      const processedData: ApiResponse<string> =
        await processedUrlResponse.json();
      if (processedData.success) {
        processedUrl = processedData.data;
        processedSuccess = true;
      }
    }
  } catch (error) {
    console.error("Error fetching processed URL:", error);
    // Không throw lỗi vì original URL đã lấy được
  }

  // Lấy thông tin video để biết status
  const videoResponse = await fetch(`${API_URL}/videos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!videoResponse.ok) {
    throw new Error("Không thể lấy thông tin video");
  }

  const videoData: ApiResponse<Video> = await videoResponse.json();

  // Tạo đối tượng VideoStreamUrls từ dữ liệu
  return {
    original_url: originalData.data,
    processed_url: processedUrl,
    status: videoData.data.status,
    dimensions: {
      width: 1280, // Giá trị mặc định vì API không cung cấp
      height: 720, // Giá trị mặc định vì API không cung cấp
    },
  };
}

// Hàm lấy kết quả phát hiện đối tượng - hiện tại API không có endpoint này
export async function getVideoDetections(
  id: string,
  token: string
): Promise<Detection[]> {
  // Trả về mảng rỗng vì API chưa cung cấp
  console.log(
    `getVideoDetections called for video ${id}, but endpoint not implemented yet`
  );
  return [];
}

// Hàm tạo URL tải xuống video - API không cung cấp endpoint này trực tiếp
// Nhưng chúng ta có thể sử dụng presigned-url
export async function getVideoDownloadUrl(
  id: string,
  token: string,
  processed: boolean = false
): Promise<string> {
  // Gọi đến API để lấy presigned URL
  const endpoint = processed ? "processed-url" : "presigned-url";
  const response = await fetch(
    `${API_URL}/videos/${id}/${endpoint}?expirationInMinutes=15`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Không thể lấy URL tải xuống cho video ${id}`);
  }

  const data: ApiResponse<string> = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Không thể lấy URL tải xuống");
  }

  return data.data;
}
