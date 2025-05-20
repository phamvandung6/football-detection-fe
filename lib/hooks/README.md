# Hệ thống quản lý trạng thái xử lý video

Hệ thống này quản lý và theo dõi trạng thái xử lý video trong ứng dụng Football Video Detector. Sử dụng Zustand làm thư viện quản lý trạng thái tập trung.

## Kiến trúc tổng quan

```
┌─────────────────────┐     ┌─────────────────────┐
│ VideoUploadForm     │     │ VideoDetailsCard    │
│ - Upload video      │     │ - Hiển thị chi tiết │
│ - Cập nhật trạng    │     │   video và trạng    │
│   thái ban đầu      │     │   thái xử lý        │
└─────────┬───────────┘     └────────┬────────────┘
          │                          │
          │                          │
          ▼                          ▼
┌─────────────────────────────────────────────────┐
│ useVideoProcessingStore (Zustand Store)         │
│ - Lưu trữ trạng thái của tất cả video đang xử lý│
│ - Tự động polling API trạng thái                │
│ - Cung cấp actions: add, update, remove video   │
│ - Có cơ chế persistence lưu vào localStorage    │
└─────────────────────────┬───────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────┐
│ useVideoProcessing (Custom Hook)                │
│ - Interface dễ sử dụng cho components           │
│ - Tự động theo dõi video cụ thể hoặc tất cả     │
└─────────────────────────────────────────────────┘
          ▲                          ▲
          │                          │
          │                          │
┌─────────┴───────────┐     ┌────────┴────────────┐
│ ProcessingNotifs    │     │ VideoList           │
│ - Hiển thị thông báo│     │ - Hiển thị danh sách│
│   popup cho video   │     │   video với trạng   │
│   đang xử lý        │     │   thái hiện tại     │
└─────────────────────┘     └─────────────────────┘
```

## Thành phần chính

### useVideoProcessingStore

Store Zustand trung tâm quản lý trạng thái xử lý của tất cả video. Lưu trữ các thông tin:

- `videos`: Record chứa thông tin về tất cả video đang được theo dõi
- Các actions: `addVideo`, `updateVideoStatus`, `removeVideo`
- Các selectors: `getVideoStatus`, `getProcessingVideos`

Store tự động thực hiện polling API để cập nhật trạng thái của video đang xử lý.

### useVideoProcessing

Custom hook giúp components dễ dàng tương tác với store:

1. Với tham số `videoId`: Trả về thông tin chi tiết của video cụ thể
2. Không có tham số: Trả về danh sách tất cả video đang xử lý

## Luồng dữ liệu

1. Khi người dùng tải lên video mới, `VideoUploadForm` gọi `addVideo(videoId, title)`
2. Store tự động bắt đầu polling API trạng thái xử lý
3. `VideoDetailsCard` và các components khác sử dụng hook `useVideoProcessing` để hiển thị trạng thái
4. Khi video hoàn thành xử lý, store tự động dừng polling và cập nhật trạng thái
5. Các components phản ứng với thay đổi trạng thái (hiển thị tiến trình, nút tải xuống, v.v.)

## Cơ chế polling tự làm sạch

- Mỗi video có một polling interval riêng
- Khi video hoàn thành hoặc bị lỗi, polling sẽ tự động dừng sau 10 giây
- Khi component unmount, tất cả các polling intervals được dọn dẹp
- Các video đã hoàn thành được tự động xóa khỏi store sau 5 giây

## Sử dụng trong components

```tsx
// Theo dõi một video cụ thể
const { status, progress, isProcessing } = useVideoProcessing(videoId);

// Lấy tất cả video đang xử lý
const { processingVideos } = useVideoProcessing();
```
