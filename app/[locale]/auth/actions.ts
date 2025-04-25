"use server";

import { API_URL } from "@/lib/utils"; // Giả sử API_URL được export từ đây
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

// --- Helper Functions --- //

// Hàm set cookie
async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set("auth_token", accessToken, {
    httpOnly: true,
    secure: secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// Hàm xóa cookie
async function deleteAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("refresh_token");
}

// --- Types --- //

interface ActionResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
}

// --- Server Actions --- //

export async function loginAction(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  // Lấy locale từ form data hoặc mặc định là 'en'
  const locale = formData.get("locale")?.toString() || "en";

  // Lấy các hàm dịch từ next-intl
  const t = await getTranslations({ locale, namespace: "auth" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  // Tạo schema Zod động với các thông báo lỗi được dịch
  const loginSchema = z.object({
    username: z.string().min(1, t("usernameRequired")),
    password: z.string().min(1, t("passwordRequired")),
  });

  // Xác thực dữ liệu
  const validatedFields = loginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: commonT("error"),
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, password } = validatedFields.data;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || t("invalidCredentials"));
    }

    const { accessToken, refreshToken } = data.data;
    await setAuthCookies(accessToken, refreshToken);

    // Revalidate và redirect
    revalidatePath("/", "layout");
    redirect(`/${locale}/dashboard`);
  } catch (error) {
    console.error("[LOGIN_ACTION_ERROR]", error);
    await deleteAuthCookies();
    return {
      success: false,
      message: error instanceof Error ? error.message : t("loginError"),
    };
  }
}

export async function registerAction(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  // Lấy locale từ form data hoặc mặc định là 'en'
  const locale = formData.get("locale")?.toString() || "en";

  // Lấy các hàm dịch từ next-intl
  const t = await getTranslations({ locale, namespace: "auth" });
  const commonT = await getTranslations({ locale, namespace: "common" });

  // Tạo schema Zod động với các thông báo lỗi được dịch
  const registerSchema = z.object({
    username: z.string().min(3, t("usernameTooShort")),
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(6, t("passwordTooShort")),
    name: z.string().min(1, t("nameRequired")),
  });

  // Xác thực dữ liệu
  const validatedFields = registerSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: commonT("error"),
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, email, password, name } = validatedFields.data;

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, name }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || t("registerFailed"));
    }

    const { accessToken, refreshToken } = data.data;
    await setAuthCookies(accessToken, refreshToken);

    // Revalidate và redirect
    revalidatePath("/", "layout");
    redirect(`/${locale}/dashboard`);
  } catch (error) {
    console.error("[REGISTER_ACTION_ERROR]", error);
    await deleteAuthCookies();
    return {
      success: false,
      message: error instanceof Error ? error.message : t("registerError"),
    };
  }
}

export async function logoutAction(locale: string = "en") {
  // Xóa cookie
  await deleteAuthCookies();
  revalidatePath("/", "layout");
  redirect(`/${locale}/auth/login`);
}
