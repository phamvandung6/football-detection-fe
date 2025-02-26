"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema cho form upload
const uploadFormSchema = z.object({
  file: z.instanceof(File).optional(),
});

type UploadFormData = z.infer<typeof uploadFormSchema>;

/**
 * Server Action để xử lý upload video
 */
export async function uploadVideo(formData: FormData) {
  try {
    // Lấy file từ FormData
    const file = formData.get("file") as File | null;

    // Validate dữ liệu
    const validatedFields = uploadFormSchema.safeParse({
      file,
    });

    // Nếu validation thất bại, trả về lỗi
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Invalid form data",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Nếu không có file, trả về lỗi
    if (!file || file.size === 0) {
      return {
        success: false,
        message: "No file selected",
      };
    }

    // Kiểm tra loại file
    if (!file.type.startsWith("video/")) {
      return {
        success: false,
        message: "File must be a video",
      };
    }

    // Kiểm tra kích thước file (giới hạn 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return {
        success: false,
        message: "File size exceeds 100MB limit",
      };
    }

    // TODO: Xử lý upload file lên server
    // Đây là nơi bạn sẽ thêm logic để lưu file vào storage
    console.log("Processing file:", file.name, file.size, file.type);

    // Giả lập xử lý upload (trong thực tế, bạn sẽ upload file lên server)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Revalidate path để cập nhật UI
    revalidatePath("/[locale]/dashboard");

    // Trả về kết quả thành công
    return {
      success: true,
      message: "File uploaded successfully",
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      message: "An error occurred while uploading the file",
    };
  }
}
