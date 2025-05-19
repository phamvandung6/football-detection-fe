"use client";

import { VideoProcessingStatus, getVideoProcessingStatus } from "@/lib/api/videoService";
import { Video } from "@/types/video";
import { useCallback, useEffect, useRef, useState } from "react";

const PROCESSING_VIDEOS_SESSION_KEY = "processing_video_ids_manager";
const POLLING_INTERVAL = 5000; // 5 giây
const MAX_FAILURE_COUNT = 3; // Số lần thất bại liên tiếp trước khi ngừng theo dõi video

interface ProcessingManagerState {
  [videoId: string]: VideoProcessingStatus;
}

// Helper để quản lý sessionStorage
const getTrackedIdsFromSession = (): string[] => {
  try {
    const stored = sessionStorage.getItem(PROCESSING_VIDEOS_SESSION_KEY);
    // console.log("[VideoManager] IDs from session:", stored ? JSON.parse(stored) : []);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("[VideoManager] Failed to parse tracked video IDs from session storage", e);
    return [];
  }
};

const saveTrackedIdsToSession = (ids: string[]) => {
  try {
    // console.log("[VideoManager] Saving IDs to session:", ids);
    sessionStorage.setItem(PROCESSING_VIDEOS_SESSION_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error("[VideoManager] Failed to save tracked video IDs to session storage", e);
  }
};

export function useVideoProcessingManager() {
  const [processingStatuses, setProcessingStatuses] = useState<ProcessingManagerState>({});
  const [trackedVideoIds, setTrackedVideoIds] = useState<string[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const failureCountsRef = useRef<{ [videoId: string]: number }>({});

  useEffect(() => {
    console.log("[VideoManager] Hook initialized. Restoring tracked IDs from session.");
    setTrackedVideoIds(getTrackedIdsFromSession());
  }, []);

  useEffect(() => {
    // console.log("[VideoManager] trackedVideoIds state changed to:", trackedVideoIds);
    saveTrackedIdsToSession(trackedVideoIds);
  }, [trackedVideoIds]);

  const removeVideoFromTracking = useCallback((videoId: string, reason: string) => {
    console.log(`[VideoManager] Removing video ${videoId} from tracking. Reason: ${reason}`);
    setTrackedVideoIds((prevIds) => prevIds.filter((id) => id !== videoId));
    setProcessingStatuses((prevStatuses) => {
      const newStatuses = { ...prevStatuses };
      delete newStatuses[videoId];
      return newStatuses;
    });
    delete failureCountsRef.current[videoId];
  }, []);
  
  const fetchAndUpdateStatus = useCallback(async (videoId: string) => {
    // console.log(`[VideoManager] Polling: Attempting to fetch status for video ${videoId}...`);
    try {
      const newStatusObject = await getVideoProcessingStatus(videoId);
      console.log(`[VideoManager] Polling: Received status object for ${videoId} from getVideoProcessingStatus:`, newStatusObject);
      
      if (newStatusObject && newStatusObject.videoId && newStatusObject.status) {
        setProcessingStatuses((prev) => {
          // console.log(`[VideoManager] Polling: Updating processingStatuses state for ${videoId} with:`, newStatusObject);
          return { ...prev, [videoId]: newStatusObject };
        });
        failureCountsRef.current[videoId] = 0; 

        if (newStatusObject.status === "READY" || newStatusObject.status === "FAILED") {
          // console.log(`[VideoManager] Polling: Video ${videoId} is ${newStatusObject.status}. Scheduling removal from active tracking.`);
          setTimeout(() => {
             setProcessingStatuses(prev => {
                // Chỉ xóa nếu trạng thái không bị ghi đè bởi một update mới hơn trong lúc chờ timeout
                if (prev[videoId]?.updatedAt === newStatusObject.updatedAt || !prev[videoId]?.updatedAt) {
                    removeVideoFromTracking(videoId, `Polling complete - status ${newStatusObject.status}`);
                }
                return prev;
            });
          }, POLLING_INTERVAL * 1.5); // Giữ lại trong 1.5 chu kỳ polling để UI kịp cập nhật
        }
      } else {
        failureCountsRef.current[videoId] = (failureCountsRef.current[videoId] || 0) + 1;
        console.warn(`[VideoManager] Polling: getVideoProcessingStatus returned null or invalid object for ${videoId}. Failure count: ${failureCountsRef.current[videoId]}`);
      }
    } catch (error) {
      failureCountsRef.current[videoId] = (failureCountsRef.current[videoId] || 0) + 1;
      console.error(`[VideoManager] Polling: Exception during getVideoProcessingStatus for ${videoId}:`, error, `Failure count: ${failureCountsRef.current[videoId]}`);
    }

    if (failureCountsRef.current[videoId] >= MAX_FAILURE_COUNT) {
      removeVideoFromTracking(videoId, `Max failure count (${MAX_FAILURE_COUNT}) reached.`);
    }
  }, [removeVideoFromTracking]);

  useEffect(() => {
    const runPollingCycle = async () => {
      if (trackedVideoIds.length === 0) {
        if (pollingIntervalRef.current) {
          // console.log("[VideoManager] Lifecycle: No videos to poll. Clearing interval.");
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }
      // console.log("[VideoManager] Lifecycle: Starting polling cycle for videos:", trackedVideoIds);
      await Promise.all(trackedVideoIds.map(id => fetchAndUpdateStatus(id)));
    };

    if (trackedVideoIds.length > 0) {
        if (!pollingIntervalRef.current) {
            // console.log("[VideoManager] Lifecycle: trackedVideoIds present. Initiating polling interval.");
            runPollingCycle(); // Chạy ngay lần đầu
            pollingIntervalRef.current = setInterval(runPollingCycle, POLLING_INTERVAL);
        }
    } else {
        if (pollingIntervalRef.current) {
            // console.log("[VideoManager] Lifecycle: No trackedVideoIds. Clearing polling interval.");
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        // console.log("[VideoManager] Lifecycle: Cleaning up polling interval on unmount/re-render.");
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [trackedVideoIds, fetchAndUpdateStatus]);

  const addTrackedVideo = useCallback((videoId: string) => {
    if (!videoId) {
        console.warn("[VideoManager] addTrackedVideo called with null/empty videoId.");
        return;
    }
    // console.log(`[VideoManager] Action: addTrackedVideo called for ${videoId}.`);
    setTrackedVideoIds((prevIds) => {
      if (!prevIds.includes(videoId)) {
        // console.log(`[VideoManager] Action: Adding ${videoId} to trackedVideoIds state.`);
        return [...prevIds, videoId];
      }
      // console.log(`[VideoManager] Action: ${videoId} already in trackedVideoIds state.`);
      return prevIds;
    });
    // console.log(`[VideoManager] Action: Immediately fetching initial status for ${videoId} after adding to tracking.`);
    fetchAndUpdateStatus(videoId); // Lấy trạng thái ban đầu ngay lập tức
  }, [fetchAndUpdateStatus]);

  const getCombinedVideoData = useCallback((video: Video): {
    displayStatus: Video["status"];
    progress: number | undefined;
    message: string | undefined;
    isProcessing: boolean;
  } => {
    const processingData = processingStatuses[video.id];
    if (processingData) {
      return {
        displayStatus: processingData.status,
        progress: processingData.progress,
        message: processingData.message,
        isProcessing: processingData.status === "PROCESSING" || processingData.status === "PENDING",
      };
    }
    return {
      displayStatus: video.status, 
      progress: undefined,
      message: undefined,
      isProcessing: video.status === "PROCESSING" || video.status === "PENDING",
    };
  }, [processingStatuses]);

  return {
    processingStatuses,
    addTrackedVideo,
    getCombinedVideoData,
    trackedVideoIdsCount: trackedVideoIds.length, 
  };
} 