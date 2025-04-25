import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  // Trỏ đến tệp cấu hình i18n mới
  './i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Thêm các cấu hình Next.js khác của bạn ở đây nếu có
};

// Export cấu hình đã được bọc bởi plugin next-intl
export default withNextIntl(nextConfig); 