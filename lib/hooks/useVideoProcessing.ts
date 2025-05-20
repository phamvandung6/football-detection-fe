import { VideoStatus } from '@/types/video';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Interface cho thông tin video đang xử lý
export interface ProcessingVideoInfo {
  videoId: string;
  status: VideoStatus;
  progress: number;
  message?: string;
  title?: string;
  updatedAt: number; // timestamp
  // Thêm flag để đánh dấu video đã hoàn thành và không cần polling nữa
  completedAt?: number;
}

// Interface chính cho store
interface VideoProcessingState {
  // Danh sách video đang xử lý theo dạng Record với key là videoId
  videos: Record<string, ProcessingVideoInfo>;
  
  // Hàm thêm video mới vào danh sách theo dõi
  addVideo: (videoId: string, title?: string) => void;
  
  // Hàm cập nhật trạng thái của một video
  updateVideoStatus: (videoId: string, data: Partial<Omit<ProcessingVideoInfo, 'videoId' | 'updatedAt'>>) => void;
  
  // Hàm đánh dấu video đã hoàn thành
  markVideoAsCompleted: (videoId: string) => void;
  
  // Hàm xóa video khỏi danh sách theo dõi
  removeVideo: (videoId: string) => void;
  
  // Hàm lấy thông tin trạng thái một video cụ thể
  getVideoStatus: (videoId: string) => ProcessingVideoInfo | undefined;
  
  // Hàm lấy danh sách các video đang xử lý
  getProcessingVideos: () => ProcessingVideoInfo[];
  
  // Hàm lấy danh sách các video đã hoàn thành
  getCompletedVideos: () => ProcessingVideoInfo[];
}

// Log với timestamp để dễ debug
const log = (message: string, ...data: any[]) => {
  console.log(`[VideoProcessing ${new Date().toISOString()}]`, message, ...data);
};

// Tạo store sử dụng Zustand với middleware persist để lưu vào localStorage
export const useVideoProcessingStore = create<VideoProcessingState>()(
  persist(
    (set, get) => ({
      videos: {},
      
      addVideo: (videoId, title = '') => {
        log(`Adding video to processing store: ${videoId} - ${title}`);
        
        set((state) => ({
          videos: {
            ...state.videos,
            [videoId]: {
              videoId,
              status: 'PENDING',
              progress: 0,
              message: 'Đang chuẩn bị xử lý video',
              title,
              updatedAt: Date.now()
            }
          }
        }));
        
        // Tự động bắt đầu polling cho video này
        startPollingForVideo(videoId);
      },
      
      updateVideoStatus: (videoId, data) => {
        const currentVideo = get().videos[videoId];
        if (!currentVideo) return;
        
        log(`Updating video status: ${videoId}`, data);
        
        // Kiểm tra nếu video đang được cập nhật thành trạng thái COMPLETED
        const isCompletingVideo = data.status === 'COMPLETED' && currentVideo.status !== 'COMPLETED';
        
        set((state) => {
          const updatedVideo = {
            ...currentVideo,
            ...data,
            updatedAt: Date.now(),
            // Nếu đang chuyển sang trạng thái COMPLETED, lưu thời gian hoàn thành
            ...(isCompletingVideo ? { completedAt: Date.now() } : {})
          };
          
          return {
            videos: {
              ...state.videos,
              [videoId]: updatedVideo
            }
          };
        });
        
        // Nếu video vừa hoàn thành, gọi thêm hàm markVideoAsCompleted để xử lý đặc biệt
        if (isCompletingVideo) {
          log(`Video ${videoId} marked as COMPLETED - stopping polling but keeping in store`);
          stopPollingForVideo(videoId);
        }
      },
      
      markVideoAsCompleted: (videoId) => {
        const currentVideo = get().videos[videoId];
        if (!currentVideo) return;
        
        log(`Explicitly marking video as completed: ${videoId}`);
        
        set((state) => ({
          videos: {
            ...state.videos,
            [videoId]: {
              ...currentVideo,
              status: 'COMPLETED',
              progress: 100,
              completedAt: Date.now(),
              updatedAt: Date.now(),
              message: 'Xử lý video đã hoàn tất'
            }
          }
        }));
        
        // Dừng polling nhưng không xóa video khỏi store
        stopPollingForVideo(videoId);
      },
      
      removeVideo: (videoId) => {
        log(`Removing video from store: ${videoId}`);
        
        set((state) => {
          const newVideos = { ...state.videos };
          delete newVideos[videoId];
          return { videos: newVideos };
        });
        
        // Dừng polling khi xóa video
        stopPollingForVideo(videoId);
      },
      
      getVideoStatus: (videoId) => {
        return get().videos[videoId];
      },
      
      getProcessingVideos: () => {
        const allVideos = Object.values(get().videos);
        return allVideos.filter(
          (video) => video.status === 'PROCESSING' || video.status === 'PENDING'
        ).sort((a, b) => b.updatedAt - a.updatedAt);
      },
      
      getCompletedVideos: () => {
        const allVideos = Object.values(get().videos);
        return allVideos.filter(
          (video) => video.status === 'COMPLETED'
        ).sort((a, b) => (b.completedAt || b.updatedAt) - (a.completedAt || a.updatedAt));
      }
    }),
    {
      name: 'video-processing-store',
      partialize: (state) => ({ videos: state.videos }),
    }
  )
);

// Quản lý các polling interval
const pollingIntervals: Record<string, NodeJS.Timeout> = {};

// Theo dõi số lần thử lại cho mỗi video
const pollingRetries: Record<string, number> = {};
const MAX_RETRIES = 3; // Số lần thử lại tối đa khi gặp lỗi
const POLLING_INTERVAL = 3000; // 3 giây
const RETRY_INTERVAL = 5000; // 5 giây

async function fetchVideoStatus(videoId: string): Promise<any> {
  try {
    log(`Fetching status for video: ${videoId}`);
    const response = await fetch(`/api/proxy/videos/${videoId}/processing-status`, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    log(`Received status for video ${videoId}:`, data);
    
    return data;
  } catch (error) {
    log(`Error fetching status for video ${videoId}:`, error);
    throw error;
  }
}

function startPollingForVideo(videoId: string) {
  // Dừng polling cũ nếu có
  stopPollingForVideo(videoId);
  pollingRetries[videoId] = 0;
  
  log(`Starting polling for video: ${videoId}`);
  
  // Ngay lập tức thực hiện một lần polling đầu tiên
  pollVideoStatus(videoId);
}

async function pollVideoStatus(videoId: string) {
  const store = useVideoProcessingStore.getState();
  const videoInfo = store.videos[videoId];
  
  // Chỉ tiếp tục polling nếu video đang trong trạng thái xử lý
  if (!videoInfo || (videoInfo.status !== 'PROCESSING' && videoInfo.status !== 'PENDING')) {
    log(`Stopping polling for video ${videoId} - no longer processing`);
    stopPollingForVideo(videoId);
    return;
  }
  
  try {
    const data = await fetchVideoStatus(videoId);
    
    if (data && data.data) {
      const statusData = data.data;
      
      // Log khi có thay đổi trạng thái
      if (videoInfo.status !== statusData.status || videoInfo.progress !== statusData.progress) {
        log(`Status updated for video ${videoId}: ${statusData.status}, progress: ${statusData.progress}%`);
      }
      
      store.updateVideoStatus(videoId, {
        status: statusData.status,
        progress: statusData.progress,
        message: statusData.message
      });
      
      // Dừng polling ngay lập tức nếu video đã hoàn thành hoặc bị lỗi
      if (statusData.status === 'COMPLETED' || statusData.status === 'ERROR') {
        log(`Video ${videoId} finished processing with status: ${statusData.status}`);
        
        if (statusData.status === 'COMPLETED') {
          log(`Video ${videoId} is now COMPLETED. Will keep in store with updated status.`);
          // Đánh dấu video đã hoàn thành và dừng polling
          store.markVideoAsCompleted(videoId);
        } else {
          // Nếu là lỗi, cũng dừng polling
          stopPollingForVideo(videoId);
        }
      } else {
        // Reset số lần thử lại vì đã thành công
        pollingRetries[videoId] = 0;
        
        // Đặt lịch cho lần polling tiếp theo
        pollingIntervals[videoId] = setTimeout(() => {
          pollVideoStatus(videoId);
        }, POLLING_INTERVAL);
      }
    } else {
      log(`Invalid response data for video ${videoId}:`, data);
      scheduleRetry(videoId);
    }
  } catch (error) {
    log(`Error during polling for video ${videoId}:`, error);
    scheduleRetry(videoId);
  }
}

function scheduleRetry(videoId: string) {
  const retries = (pollingRetries[videoId] || 0) + 1;
  pollingRetries[videoId] = retries;
  
  if (retries <= MAX_RETRIES) {
    log(`Scheduling retry ${retries}/${MAX_RETRIES} for video ${videoId}`);
    pollingIntervals[videoId] = setTimeout(() => {
      pollVideoStatus(videoId);
    }, RETRY_INTERVAL);
  } else {
    log(`Max retries reached for video ${videoId}, giving up`);
    // Có thể cân nhắc đánh dấu video là ERROR nếu quá nhiều lần thử lại thất bại
  }
}

function stopPollingForVideo(videoId: string) {
  if (pollingIntervals[videoId]) {
    log(`Stopping polling for video ${videoId}`);
    clearTimeout(pollingIntervals[videoId]);
    delete pollingIntervals[videoId];
  }
}

// Hook custom kết hợp để thuận tiện sử dụng trong component
export function useVideoProcessing(videoId?: string) {
  const store = useVideoProcessingStore();
  
  // Nếu có videoId, trả về thông tin cụ thể của video đó
  if (videoId) {
    const videoStatus = store.getVideoStatus(videoId);
    return {
      status: videoStatus?.status,
      progress: videoStatus?.progress || 0,
      message: videoStatus?.message,
      isProcessing: videoStatus && (videoStatus.status === 'PROCESSING' || videoStatus.status === 'PENDING'),
      isCompleted: videoStatus?.status === 'COMPLETED',
      addVideo: store.addVideo,
      removeVideo: store.removeVideo,
      // Wrap markVideoAsCompleted để không cần tham số
      markVideoAsCompleted: () => store.markVideoAsCompleted(videoId)
    };
  }
  
  // Nếu không có videoId, trả về tất cả video đang xử lý
  return {
    processingVideos: store.getProcessingVideos(),
    completedVideos: store.getCompletedVideos(),
    addVideo: store.addVideo,
    removeVideo: store.removeVideo,
    updateVideoStatus: store.updateVideoStatus,
    getVideoStatus: store.getVideoStatus,
    markVideoAsCompleted: store.markVideoAsCompleted
  };
} 