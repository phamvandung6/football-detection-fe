# Hướng dẫn sử dụng hệ thống theo dõi trạng thái xử lý video

Tài liệu này hướng dẫn cách sử dụng hệ thống theo dõi và hiển thị trạng thái xử lý video trong ứng dụng.

## Giới thiệu

Ứng dụng sử dụng Zustand làm thư viện quản lý state để theo dõi trạng thái xử lý video. Hệ thống bao gồm:

- Store trung tâm: `useVideoProcessingStore`
- Custom hook tiện dụng: `useVideoProcessing`
- Cơ chế polling tự động và tự dọn dẹp
- Persistence lưu vào localStorage để giữ trạng thái giữa các lần refresh

## Các trạng thái xử lý video (VideoStatus)

- `PENDING`: Video đang chờ được xử lý
- `PROCESSING`: Video đang trong quá trình xử lý
- `COMPLETED`: Video đã xử lý hoàn tất
- `ERROR`: Quá trình xử lý gặp lỗi

## Sử dụng trong các component

### VideoUploadForm

Khi người dùng tải lên video mới, cần thêm video vào danh sách theo dõi:

```tsx
// Import hook
import { useVideoProcessing } from "@/lib/hooks/useVideoProcessing";

export function VideoUploadForm() {
  // Lấy hàm addVideo từ hook
  const { addVideo } = useVideoProcessing();

  // Trong hàm xử lý upload thành công
  const handleUploadSuccess = (data) => {
    if (data && data.videoId) {
      // Thêm video vào store để bắt đầu theo dõi
      addVideo(data.videoId, title);
    }
  };
}
```

### VideoDetailsCard

Hiển thị thông tin chi tiết video và trạng thái xử lý hiện tại:

```tsx
// Import hook
import { useVideoProcessing } from "@/lib/hooks/useVideoProcessing";

export function VideoDetailsCard({ video }) {
  // Theo dõi trạng thái xử lý của video cụ thể
  const {
    status, // Trạng thái hiện tại (PENDING, PROCESSING, COMPLETED, ERROR)
    progress, // Phần trăm hoàn thành (0-100)
    isProcessing, // Boolean - video đang trong quá trình xử lý không
    message, // Thông báo từ server về quá trình xử lý
  } = useVideoProcessing(video.id);

  // Tự động thêm video vào store nếu cần
  useEffect(() => {
    if (
      video?.id &&
      (video.status === "PROCESSING" || video.status === "PENDING") &&
      !isProcessing
    ) {
      addVideo(video.id, video.title);
    }
  }, [video]);

  // Sử dụng trạng thái để hiển thị UI
  return (
    <div>
      {isProcessing && <Progress value={progress} />}
      {status === "COMPLETED" && <DownloadButton />}
    </div>
  );
}
```

### VideoList

Hiển thị danh sách video với trạng thái cập nhật:

```tsx
export function VideoList() {
  // Lấy danh sách videos và getVideoStatus
  const { processingVideos, getVideoStatus } = useVideoProcessing();

  // Chuyển đổi thành map để tìm kiếm nhanh
  const processingVideoMap = processingVideos.reduce((acc, video) => {
    acc[video.videoId] = video;
    return acc;
  }, {});

  return (
    <div>
      {videos.map((video) => {
        // Lấy thông tin xử lý nếu có
        const processingData = processingVideoMap[video.id];

        return (
          <VideoCard
            key={video.id}
            video={video}
            processingStatus={processingData?.status || video.status}
            processingProgress={processingData?.progress || 0}
          />
        );
      })}
    </div>
  );
}
```

### ProcessingNotifications

Hiển thị popup thông báo tình trạng xử lý:

```tsx
export function ProcessingNotifications() {
  // Lấy danh sách các video đang xử lý
  const { processingVideos, removeVideo } = useVideoProcessing();

  // Hiển thị indicator cho mỗi video
  return (
    <div>
      {processingVideos.map((video) => (
        <ProcessingIndicator
          key={video.videoId}
          video={video}
          onDismiss={() => removeVideo(video.videoId)}
        />
      ))}
    </div>
  );
}
```

## Một số lưu ý quan trọng

1. **Polling tự động**: Hook sẽ tự động bắt đầu polling khi `addVideo` được gọi

2. **Tự dọn dẹp**:

   - Polling tự động dừng sau khi trạng thái chuyển sang COMPLETED hoặc ERROR
   - Video được tự động xóa khỏi store sau khi hoàn thành xử lý

3. **Persistence**:

   - Trạng thái được lưu vào localStorage
   - Khi refresh trang, trạng thái sẽ được khôi phục
   - Polling sẽ tiếp tục cho các video đang xử lý

4. **Thêm video mới vào store**: Gọi `addVideo(videoId, title)` sau khi upload thành công

5. **Các trường thông tin video**:
   - `videoId`: ID của video
   - `status`: Trạng thái xử lý
   - `progress`: Phần trăm hoàn thành
   - `message`: Thông báo từ server
   - `updatedAt`: Thời gian cập nhật gần nhất
