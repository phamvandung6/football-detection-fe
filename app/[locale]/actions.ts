"use server";

import { getServerApi } from "@/lib/api/serverApi";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema cho form upload
const uploadFormSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "File is required")
    .refine((file) => file.type.startsWith("video/"), "File must be a video")
    .refine(
      (file) => file.size <= 100 * 1024 * 1024,
      "File size exceeds 100MB"
    ),
});

interface UploadActionResult {
  success: boolean;
  message: string;
  errors?: { file?: string[] };
  videoId?: string;
}

/**
 * Server Action để xử lý upload video
 * Sử dụng Server API để gửi file lên backend
 */
export async function uploadVideoAction(
  prevState: UploadActionResult | undefined,
  formData: FormData
): Promise<UploadActionResult> {
  // Lấy file từ FormData
  const file = formData.get("file");

  // Validate file bằng Zod
  const validatedFields = uploadFormSchema.safeParse({ file });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid file data.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const uploadData = new FormData();
    uploadData.append("file", validatedFields.data.file);

    // Lấy Server API client - tự động xử lý token
    const serverApi = await getServerApi();

    // Gọi API upload video
    const result = await serverApi.post("/videos/upload", uploadData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Revalidate path để cập nhật UI
    revalidatePath("/[locale]/dashboard", "page");
    revalidatePath("/[locale]/videos", "page");

    // Trả về kết quả thành công
    return {
      success: true,
      message: result.message || "File uploaded successfully",
      videoId: result.id || result.videoId,
    };
  } catch (error) {
    console.error("[Upload Action] Error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred during upload.",
    };
  }
}
