"use server";

import { uploadVideoFile } from '@/lib/api/videoService';
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema cho form upload
const uploadFormSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size > 0, 'File is required')
    .refine((file) => file.type.startsWith('video/'), 'File must be a video')
    .refine((file) => file.size <= 100 * 1024 * 1024, 'File size exceeds 100MB'),
});

interface UploadActionResult {
  success: boolean;
  message: string;
  errors?: { file?: string[] };
  videoId?: string;
}

/**
 * Server Action để xử lý upload video
 * Nó gọi hàm uploadVideoFile từ service API
 */
export async function uploadVideoAction(
  prevState: UploadActionResult | undefined,
  formData: FormData
): Promise<UploadActionResult> {
  // Lấy file từ FormData
  const file = formData.get('file');

  // Validate file bằng Zod
  const validatedFields = uploadFormSchema.safeParse({ file });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid file data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // TODO: Xác thực - Lấy token từ cookie nếu API upload yêu cầu.
    // Ví dụ:
    // const token = cookies().get('auth_token')?.value;
    // if (!token) { throw new Error('Unauthorized'); } 
    // => Sau đó truyền token vào uploadVideoFile(uploadData, token);

    const uploadData = new FormData();
    uploadData.append('file', validatedFields.data.file);
    
    // Gọi hàm upload từ service (chưa truyền token)
    const result = await uploadVideoFile(uploadData);

    if (!result.success) {
      throw new Error(result.message);
    }

    // Revalidate path để cập nhật UI (ví dụ: trang dashboard hoặc video list)
    revalidatePath("/[locale]/dashboard", 'page'); 
    revalidatePath("/[locale]/videos", 'page');

    // Trả về kết quả thành công
    return {
      success: true,
      message: result.message || "File uploaded successfully",
      videoId: result.videoId,
    };
  } catch (error) {
    console.error("Error in uploadVideoAction:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred during upload.",
    };
  }
}
