# HƯỚNG DẪN KIẾN TRÚC KẾT NỐI DATABASE & API (SUPABASE + VERCEL EDGE + INDEXEDDB)
> **Tài liệu phân tích và hướng dẫn tái sử dụng cho các dự án Web tĩnh / SPA (Vite, Next.js, HTML/JS thuần)**

---

## 1. TỔNG QUAN KIẾN TRÚC (ARCHITECTURE OVERVIEW)

Dự án này sử dụng mô hình kiến trúc lai hiện đại (**Hybrid Architecture**) kết hợp giữa:
- **Client SPA** (Vite + Vanilla JS)
- **BaaS (Backend-as-a-Service)**: Supabase (PostgreSQL, PostgREST API, Supabase Storage, RPC Functions)
- **BFF / Edge Cache Layer**: Vercel Serverless Functions (`/api/*`)
- **Client Cache**: IndexedDB (Stale-While-Revalidate) + RAM Cache

### Sơ đồ luồng dữ liệu (Data Flow)

```text
[Khách truy cập (Visitor)]
        │
        ├── 1. Kiểm tra RAM Cache / IndexedDB ─────────────► [Render tức thì (0ms)]
        │
        └── 2. Gọi API Route (/api/gallery-data)
                    │
                    ├── Có Vercel Edge Cache? ─────────────► [Trả về từ CDN (<50ms)]
                    │
                    └── Hết hạn Cache (Stale) ────────────► [Supabase REST API]
                                                                    │
                                                            (Lưu lại DB Version
                                                             vào IndexedDB)

[Quản trị viên (Admin)]
        │
        ├── Xác thực mật khẩu (SHA-256 Hash tại Client)
        ├── Resize & Tối ưu ảnh qua HTML5 Canvas ──────────► [Supabase Storage Bucket]
        └── Ghi dữ liệu trực tiếp qua Supabase RPC ────────► [Postgres Function: admin_write]
                                                                    │
                                                            (Tự động cập nhật
                                                             gallery_version)
```

### Điểm mạnh vượt trội của mô hình này:
1. **Tiết kiệm chi phí & Egress Quota**: Thay vì mỗi lượt khách ghé thăm đều truy vấn trực tiếp Supabase làm cạn kiệt giới hạn băng thông miễn phí, Vercel Edge CDN cache dữ liệu trong 5-10 phút.
2. **Tốc độ hiển thị 0 giây (Instant Render)**: Khách quay lại web sẽ thấy dữ liệu ngay từ IndexedDB mà không cần chờ loading spinner.
3. **Bảo mật không cần Backend phức tạp**: Sử dụng Postgres RPC function để xác thực mật khẩu thay vì dựng server Express/Node riêng biệt.
4. **Tối ưu dung lượng hình ảnh**: Canvas tự động nén và resize ảnh trước khi upload binary blob lên Supabase Storage, có fallback base64 nếu bucket gặp sự cố.

---

## 2. THIẾT KẾ DATABASE TRÊN SUPABASE (SQL SCHEMA)

Mô hình này dùng bảng **Key-Value Store** linh hoạt, phù hợp cho website cá nhân, portfolio, landing page mà không cần tạo hàng chục bảng riêng lẻ.

### 2.1. Tạo bảng `admin_settings`

Vào **Supabase Dashboard** -> **SQL Editor**, chạy đoạn script sau:

```sql
-- 1. Tạo bảng lưu trữ Key-Value
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bật Row Level Security (RLS)
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 3. Tạo chính sách cho phép mọi người ĐỌC dữ liệu (Public Read)
CREATE POLICY "Cho phep doc cong khai" 
ON public.admin_settings 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 4. KHÔNG cấp quyền INSERT/UPDATE/DELETE trực tiếp cho anon.
-- Mọi thao tác ghi PHẢI thông qua RPC Function để kiểm tra mật khẩu.
```

### 2.2. Tạo bảng băm mật khẩu Admin & RPC Function `admin_write`

```sql
-- 1. Tạo bảng lưu trữ mã băm SHA-256 của mật khẩu quản trị
CREATE TABLE IF NOT EXISTS public.admin_auth (
    id INT PRIMARY KEY DEFAULT 1,
    password_hash TEXT NOT NULL
);

-- 2. Thêm mật khẩu mặc định (ví dụ SHA-256 của 'admin123')
-- Bạn có thể tạo hash tại https://emn178.github.io/online-tools/sha256.html
INSERT INTO public.admin_auth (id, password_hash)
VALUES (1, '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9')
ON CONFLICT (id) DO NOTHING;

-- 3. Tạo RPC Function admin_write để ghi dữ liệu có bảo vệ mật khẩu
CREATE OR REPLACE FUNCTION public.admin_write(
    pw_hash TEXT,
    setting_key TEXT,
    setting_value TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Chạy với quyền admin của database
AS $$
DECLARE
    valid_hash TEXT;
BEGIN
    -- Lấy mã băm chuẩn trong database
    SELECT password_hash INTO valid_hash FROM public.admin_auth WHERE id = 1;

    -- Kiểm tra hash
    IF pw_hash IS NULL OR pw_hash != valid_hash THEN
        RAISE EXCEPTION 'Mật khẩu quản trị không chính xác!';
    END IF;

    -- Thực hiện Upsert (Insert hoặc Update nếu đã tồn tại key)
    INSERT INTO public.admin_settings (key, value, updated_at)
    VALUES (setting_key, setting_value, now())
    ON CONFLICT (key) 
    DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = now();

    RETURN jsonb_build_object('success', true, 'key', setting_key);
END;
$$;
```

### 2.3. Tạo Storage Bucket cho hình ảnh

1. Vào mục **Storage** trên Supabase Dashboard -> **New Bucket**.
2. Đặt tên Bucket là: `gallery` (hoặc tên tuỳ thích).
3. Bật tùy chọn: **Public Bucket** (để ảnh có thể xem công khai qua link CDN).
4. Thiết lập RLS cho Storage Bucket:

```sql
-- Cho phép mọi người xem ảnh công khai
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
TO anon 
USING (bucket_id = 'gallery');

-- Cho phép upload ảnh vào bucket gallery
CREATE POLICY "Allow Upload" 
ON storage.objects FOR INSERT 
TO anon 
WITH CHECK (bucket_id = 'gallery');

-- Cho phép cập nhật/ghi đè ảnh
CREATE POLICY "Allow Update" 
ON storage.objects FOR UPDATE 
TO anon 
USING (bucket_id = 'gallery');

-- Cho phép xóa ảnh
CREATE POLICY "Allow Delete" 
ON storage.objects FOR DELETE 
TO anon 
USING (bucket_id = 'gallery');
```

---

## 3. CẤU HÌNH BIẾN MÔI TRƯỜNG (`.env`)

Tạo file `.env` ở thư mục gốc của dự án:

```env
# URL dự án Supabase (Settings -> API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Anon Public Key (Settings -> API -> Project API keys -> anon public)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Lưu ý khi deploy lên Vercel:**  
> Thêm cả 2 biến môi trường trên vào **Vercel Dashboard -> Settings -> Environment Variables**.  
> Cả client Vite (`import.meta.env.VITE_*`) và Vercel Serverless (`process.env.VITE_*`) đều đọc chung được 2 biến này.

---

## 4. MODULE KẾT NỐI SUPABASE CLIENT (`src/supabase.js`)

Cài đặt thư viện client:
```bash
npm install @supabase/supabase-js
```

Tạo file `src/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Thiếu cấu hình URL hoặc Anon Key trong file .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 5. TẦNG VERCEL SERVERLESS & EDGE CACHE (`/api/*`)

Đây là "bí quyết" giúp website chịu tải hàng vạn truy cập mà không tốn chi phí Supabase và đạt điểm SEO/Performance tuyệt đối.

### 5.1. File cấu hình `vercel.json` (ở thư mục gốc)

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### 5.2. Endpoint tải cài đặt hệ thống (`api/admin-settings.js`)

Tạo file `api/admin-settings.js`:

```javascript
export default async function handler(req, res) {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Missing Supabase configuration' });
  }

  try {
    // Truy vấn trực tiếp PostgREST API của Supabase
    // Lọc các key cần thiết bằng cú pháp query của PostgREST
    const dataRes = await fetch(
      `${SUPABASE_URL}/rest/v1/admin_settings?select=key,value&or=(key.eq.cms_status,key.like.img_*,key.like.pos_*)`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );
    const data = await dataRes.json();

    // Cache 5 phút trên Vercel Edge CDN, cho phép dùng cache cũ tối đa 10 phút khi đang revalidate
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Admin settings fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin settings' });
  }
}
```

### 5.3. Endpoint tải dữ liệu kèm Versioning (`api/gallery-data.js`)

Tạo file `api/gallery-data.js`:

```javascript
export default async function handler(req, res) {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Missing Supabase configuration' });
  }

  try {
    // 1. Lấy version hiện tại của dữ liệu
    const versionRes = await fetch(
      `${SUPABASE_URL}/rest/v1/admin_settings?select=value&key=eq.gallery_version`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );
    const versionArr = await versionRes.json();
    const version = versionArr?.[0]?.value || '0';

    // 2. Lấy toàn bộ dữ liệu cần thiết chỉ trong 1 request
    const keys = [
      'gallery_images_normal',
      'gallery_images_chibi'
    ].join(',');

    const dataRes = await fetch(
      `${SUPABASE_URL}/rest/v1/admin_settings?select=key,value&or=(key.in.(${keys}),key.like.img_*,key.like.pos_*)`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      }
    );
    const data = await dataRes.json();

    // Cache trên Edge CDN 5 phút
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ version, data });
  } catch (error) {
    console.error('Gallery data fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch gallery data' });
  }
}
```

---

## 6. CLIENT CRAWLER & CƠ CHẾ STALE-WHILE-REVALIDATE (INDEXEDDB)

Cách thức triển khai tại tầng Client (`src/pages/gallery.js` hoặc bất kỳ module nào cần render dữ liệu):

### 6.1. IndexedDB Wrapper nhẹ không cần thư viện ngoài

```javascript
const IDB_NAME = 'MyCustomAppDB';
const IDB_VERSION = 1;
const STORE_NAME = 'app_cache';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGet(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (e) { return null; }
}

export async function idbSet(key, val) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(val, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {}
}
```

### 6.2. Luồng nạp dữ liệu thông minh (Fetch Payload + Fallback)

```javascript
import { supabase } from '../supabase.js';

// Hàm lấy dữ liệu (Ưu tiên gọi API Proxy trên Production, trực tiếp Supabase trên Dev)
async function fetchPayload() {
  if (import.meta.env.PROD) {
    const res = await fetch('/api/gallery-data');
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json(); // { version, data }
  }

  // Chế độ Local Dev: Gọi trực tiếp Supabase song song
  const [vRes, dRes] = await Promise.all([
    supabase.from('admin_settings').select('value').eq('key', 'gallery_version').maybeSingle(),
    supabase.from('admin_settings').select('key, value')
  ]);

  if (dRes.error) throw dRes.error;
  return { version: vRes.data?.value || '0', data: dRes.data };
}

// Hàm khởi động: Chiến lược Stale-While-Revalidate
export async function loadDataWithCache(renderCallback) {
  try {
    // Bước 1: Đọc ngay từ IndexedDB (0ms)
    const cachedData = await idbGet('gallery_data');

    if (cachedData) {
      // Có cache -> Hiển thị ngay cho người dùng
      renderCallback(cachedData);

      // Bước 2: Chạy ngầm so sánh phiên bản
      (async () => {
        try {
          const result = await fetchPayload();
          const localVersion = await idbGet('gallery_version');

          // Nếu dữ liệu trên server đã có bản mới (admin vừa cập nhật)
          if (result.version !== localVersion) {
            await idbSet('gallery_data', result.data);
            await idbSet('gallery_version', result.version);
            // Có thể render lại nếu muốn cập nhật ngay
            renderCallback(result.data);
          }
        } catch (err) {
          console.warn('[Cache] Background revalidation failed:', err);
        }
      })();
      return;
    }

    // Bước 3: Lần đầu truy cập (chưa có cache) -> Bắt buộc fetch
    const result = await fetchPayload();
    if (result.data) {
      await idbSet('gallery_data', result.data);
      await idbSet('gallery_version', result.version);
      renderCallback(result.data);
    }
  } catch (e) {
    console.error('Lỗi tải dữ liệu:', e);
  }
}
```

---

## 7. QUẢN TRỊ VIÊN: GHI DỮ LIỆU & TẢI ẢNH LÊN SUPABASE STORAGE

### 7.1. Đọc & Ghi dữ liệu bảo mật bằng RPC (`src/admin.js`)

```javascript
import { supabase } from './supabase.js';

let adminPasswordHash = null; // Lưu tạm trong RAM khi đăng nhập thành công

// Hàm hash SHA-256 trên trình duyệt
export async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 1. Đọc dữ liệu (Đọc từ RAM hoặc Supabase)
export async function dbRead(key) {
  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  return data?.value || null;
}

// 2. Ghi dữ liệu bảo mật thông qua RPC admin_write
export async function dbWrite(key, value) {
  const { data, error } = await supabase.rpc('admin_write', {
    pw_hash: adminPasswordHash,
    setting_key: key,
    setting_value: value
  });

  if (error) {
    console.error('[dbWrite] Lỗi lưu dữ liệu:', error);
    throw error;
  }

  // Tự động cập nhật version để client khách truy cập biết có dữ liệu mới
  supabase.rpc('admin_write', {
    pw_hash: adminPasswordHash,
    setting_key: 'gallery_version',
    setting_value: Date.now().toString()
  }).then(() => { /* cập nhật ngầm */ });

  return data;
}
```

### 7.2. Xử lý ảnh: Resize qua Canvas & Upload Binary Blob

> **Ưu điểm lớn:** Giảm dung lượng ảnh chụp 10MB - 15MB xuống còn ~200KB - 500KB trước khi gửi lên mạng, tăng tốc tải trang 100 lần.

```javascript
export async function processAndUploadImage(file, fileName) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (ev) => {
      const img = new Image();

      img.onload = () => {
        // Tạo Canvas để nén & resize kích thước tối đa 1200px
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        let w = img.width, h = img.height;
        if (w > maxW) {
          h = (maxW / w) * h;
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        // Chuyển canvas sang Binary Blob (nhẹ hơn chuỗi Base64 33%)
        canvas.toBlob(async (blob) => {
          if (!blob) return reject(new Error('Canvas export blob thất bại'));

          // 1. Upload lên Supabase Storage
          const { data, error } = await supabase.storage
            .from('gallery')
            .upload(fileName, blob, {
              upsert: true,
              contentType: file.type || 'image/jpeg'
            });

          if (error) {
            console.error('[Upload] Lỗi Storage:', error);
            // Fallback: Nếu bucket chưa được tạo hoặc lỗi quyền RLS,
            // tự động fallback sang chuỗi Base64 để website không bị gián đoạn
            console.warn('[Upload] Kích hoạt chế độ dự phòng Base64');
            resolve(canvas.toDataURL('image/jpeg', 0.7));
            return;
          }

          // 2. Lấy link CDN công khai (Public URL)
          const { data: publicData } = supabase.storage
            .from('gallery')
            .getPublicUrl(fileName);

          resolve(publicData.publicUrl);
        }, 'image/jpeg', 0.8); // Chất lượng 80%
      };

      img.onerror = () => reject(new Error('Không thể tải file ảnh'));
      img.src = ev.target.result;
    };

    reader.onerror = () => reject(new Error('FileReader thất bại'));
    reader.readAsDataURL(file);
  });
}
```

---

## 8. CHECKLIST 7 BƯỚC MANG SANG DỰ ÁN MỚI

Khi bạn bắt đầu một dự án mới tương tự, hãy làm theo các bước chuẩn hoá này:

| Bước | Hành động | Chi tiết |
| :--- | :--- | :--- |
| **B1** | **Tạo dự án Supabase** | Lấy `Project URL` và `anon key` tại phần Settings -> API. |
| **B2** | **Chạy SQL Schema** | Sao chép toàn bộ mã SQL ở **Mục 2** (tạo bảng `admin_settings`, bảng `admin_auth`, function `admin_write`, bucket `gallery`). |
| **B3** | **Cài đặt Dependency** | Chạy `npm install @supabase/supabase-js`. |
| **B4** | **Tạo file `.env`** | Điền `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`. |
| **B5** | **Tạo module Supabase** | Tạo file `src/supabase.js` như **Mục 4**. |
| **B6** | **Tạo API Caching** | Tạo `vercel.json` và thư mục `api/` chứa các endpoint như **Mục 5**. |
| **B7** | **Tích hợp Cache Client** | Áp dụng logic IndexedDB và `loadDataWithCache` ở **Mục 6** vào trang hiển thị của bạn. |

---

## 9. CÁC LỖI THƯỜNG GẶP & CÁCH KHẮC PHỤC (TROUBLESHOOTING)

1. **Lỗi RLS khi gọi `dbWrite`:**
   - *Hiện tượng:* `new row violates row-level security policy for table "admin_settings"`.
   - *Nguyên nhân:* Gọi `supabase.from('admin_settings').insert()` thay vì gọi RPC `supabase.rpc('admin_write')`.
   - *Khắc phục:* Luôn dùng hàm RPC đã định nghĩa để vượt qua RLS bằng quyền `SECURITY DEFINER`.

2. **Lỗi 403 Forbidden khi Upload ảnh vào Storage:**
   - *Hiện tượng:* `statusCode: 403, error: Unauthorized`.
   - *Khắc phục:* Kiểm tra lại Bucket Policies trong Supabase Storage. Đảm bảo đã gán policy cho role `anon` được `INSERT` và `UPDATE`.

3. **API Vercel trả về 500 trên Production:**
   - *Hiện tượng:* `Missing Supabase configuration`.
   - *Khắc phục:* Vào Settings của Project trên Vercel, kiểm tra xem đã thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` vào mục Environment Variables chưa (nhớ bấm Redeploy sau khi thêm).
