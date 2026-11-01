# kratos-ui

Giao diện self-service của Ory Kratos, dựng bằng Next.js và lớp Metronic.

Trình duyệt POST form thẳng tới `KRATOS_BROWSER_URL`. Process này chỉ đọc flow và chuyển tiếp cookie.

Sao chép `.env.example` thành `.env`. Bắt buộc: `KRATOS_PUBLIC_URL`, `CSRF_COOKIE_NAME`, `CSRF_COOKIE_SECRET`. Các biến còn lại nằm trong file mẫu.

```shell
npm run dev
npm run build
npm start
```
