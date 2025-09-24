# FreshBite 🍽️
demo: https://freshbite-eta.vercel.app/
Ứng dụng giao đồ ăn hiện đại được xây dựng với Next.js 14, TypeScript, Prisma và PostgreSQL.

## 🚀 Bắt đầu nhanh

### 1. Clone repository

```bash
git clone <repository-url>
cd freshbite
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Database

#### Tạo file `.env.local`

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/freshbite"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

JWT_SECRET="your-jwt-secret-key-here-should-be-long-and-random"
```

#### Setup PostgreSQL

**Option 1: Local PostgreSQL**
```bash
# Windows (với PostgreSQL đã cài)
createdb freshbite
```

**Option 2: Docker**
```bash
docker run --name postgres-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=freshbite -p 5432:5432 -d postgres:15
```

**Option 3: Vercel Postgres (Production)**
```bash
# Tạo database trên Vercel Dashboard
# Copy connection string vào DATABASE_URL
```

### 4. Migrate Database

```bash
# Tạo và chạy migrations
npx prisma migrate dev --name init

# Hoặc chỉ push schema (development)
npx prisma db push
```

### 5. Seed dữ liệu mẫu

```bash
npm run db:seed
```

### 6. Chạy ứng dụng

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📦 Deploy

### Vercel (Khuyến nghị)

1. **Push code lên GitHub**

2. **Import project vào Vercel**
   - Truy cập [vercel.com](https://vercel.com)
   - Import GitHub repository

3. **Cấu hình Environment Variables**
   ```
   DATABASE_URL=your-postgres-connection-string
   NEXTAUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

4. **Deploy**
   ```bash
   # Auto deploy khi push to main branch
   git push origin main
   ```

### Netlify

```bash
# Build command
npm run build

# Output directory
.next
```

### Railway

```bash
# Cài Railway CLI
npm install -g @railway/cli

# Login và deploy
railway login
railway init
railway up
```

## 🗄️ Database Schema

### Các bảng chính:
- **User**: Người dùng và admin
- **Category**: Danh mục sản phẩm
- **Product**: Sản phẩm thực phẩm
- **Order**: Đơn hàng
- **OrderItem**: Chi tiết đơn hàng
- **Combo**: Combo sản phẩm
- **Review**: Đánh giá sản phẩm

### Lệnh Prisma hữu ích:

```bash
# Xem database
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Format schema
npx prisma format
```

## 🔧 Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint

# Database seed
npm run seed
```

## 📱 Tính năng

- ✅ Hệ thống đặt hàng thực phẩm
- ✅ Quản lý giỏ hàng
- ✅ Xác thực người dùng (NextAuth.js)
- ✅ Admin panel
- ✅ Upload hình ảnh (Cloudinary)
- ✅ Responsive design
- ✅ Banner slider với Swiper
- ✅ Tìm kiếm sản phẩm

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js
- **UI**: Radix UI + Tailwind CSS
- **Deployment**: Vercel

## 📝 API Endpoints

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/[id]` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (Admin)

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục (Admin)

### Orders
- `GET /api/orders` - Lấy đơn hàng của user
- `POST /api/orders` - Tạo đơn hàng mới

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License.
