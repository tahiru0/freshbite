# 📚 API Documentation - FreshBite

Tài liệu API đầy đủ cho ứng dụng Food Delivery với Next.js 14.

## 🌐 Base URL
```
Development: http://localhost:3000
Production: https://your-domain.com
```

## 🔐 Authentication

Tất cả API endpoints yêu cầu authentication (trừ public endpoints) sử dụng JWT token:

```http
Authorization: Bearer <your_jwt_token>
```

### Error Responses
```json
{
  "error": "Token không hợp lệ",
  "status": 401
}
```

---

## 🔑 Auth Endpoints

### POST /api/auth/register
Đăng ký tài khoản mới

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0987654321",
  "address": "123 Đường ABC, TP.HCM"
}
```

**Response (201):**
```json
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "clxxxxx",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0987654321",
    "address": "123 Đường ABC, TP.HCM",
    "role": "CUSTOMER"
  }
}
```

**Errors:**
- `400`: Email đã được sử dụng
- `500`: Lỗi server

---

### POST /api/auth/login
Đăng nhập hệ thống

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxxxx",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0987654321",
    "address": "123 Đường ABC, TP.HCM",
    "role": "CUSTOMER"
  }
}
```

**Errors:**
- `401`: Email hoặc mật khẩu không đúng
- `500`: Lỗi server

---

## 📦 Category Endpoints

### GET /api/categories
Lấy danh sách danh mục sản phẩm

**Query Parameters:**
- `includeInactive` (boolean): Bao gồm danh mục không hoạt động (Admin only)

**Response (200):**
```json
{
  "categories": [
    {
      "id": "clxxxxx",
      "name": "Cơm",
      "description": "Các món cơm đậm đà hương vị",
      "image": "https://res.cloudinary.com/.../com.jpg",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "_count": {
        "products": 15
      }
    }
  ]
}
```

---

### POST /api/categories
Tạo danh mục mới *(Admin only)*

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "Tên danh mục",
  "description": "Mô tả danh mục",
  "image": "https://cloudinary-url.com/image.jpg"
}
```

**Response (201):**
```json
{
  "message": "Tạo danh mục thành công",
  "category": {
    "id": "clxxxxx",
    "name": "Tên danh mục",
    "description": "Mô tả danh mục",
    "image": "https://cloudinary-url.com/image.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/categories/[id]
Lấy chi tiết danh mục và sản phẩm

**Response (200):**
```json
{
  "category": {
    "id": "clxxxxx",
    "name": "Cơm",
    "description": "Các món cơm đậm đà hương vị",
    "image": "https://res.cloudinary.com/.../com.jpg",
    "isActive": true,
    "products": [
      {
        "id": "clyyyyy",
        "name": "Cơm gà xối mỡ",
        "description": "Cơm gà thơm ngon với nước mắm đậm đà",
        "price": 45000,
        "images": [
          {
            "url": "https://res.cloudinary.com/.../image1.jpg",
            "alt": "Cơm gà xối mỡ",
            "order": 0
          }
        ],
        "averageRating": 4.5,
        "totalReviews": 12
      }
    ]
  }
}
```

---

### PUT /api/categories/[id]
Cập nhật danh mục *(Admin only)*

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "Tên mới",
  "description": "Mô tả mới",
  "image": "https://new-image-url.com/image.jpg",
  "isActive": true
}
```

---

### DELETE /api/categories/[id]
Xóa danh mục *(Admin only)*

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "message": "Xóa danh mục thành công"
}
```

**Errors:**
- `400`: Không thể xóa danh mục đã có sản phẩm

---

## 🍽️ Product Endpoints

### GET /api/products
Lấy danh sách sản phẩm (có phân trang)

**Query Parameters:**
- `categoryId` (string): Lọc theo danh mục
- `search` (string): Tìm kiếm theo tên/mô tả
- `page` (number): Trang (default: 1)
- `limit` (number): Số lượng/trang (default: 10)
- `includeInactive` (boolean): Bao gồm sản phẩm không hoạt động (Admin only)

**Response (200):**
```json
{
  "products": [
    {
      "id": "clxxxxx",
      "name": "Cơm gà xối mỡ",
      "description": "Cơm gà thơm ngon với nước mắm đậm đà",
      "price": 45000,
      "isActive": true,
      "category": {
        "id": "clyyyy",
        "name": "Cơm"
      },
      "images": [
        {
          "id": "clzzzzz",
          "url": "https://res.cloudinary.com/.../image1.jpg",
          "publicId": "food-delivery/product_123",
          "alt": "Cơm gà xối mỡ",
          "order": 0
        }
      ],
      "reviews": [
        {
          "id": "claaaa",
          "rating": 5,
          "comment": "Rất ngon!",
          "user": {
            "id": "clbbbb",
            "name": "Khách hàng A",
            "avatar": "https://avatar-url.com"
          },
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ],
      "averageRating": 4.5,
      "totalReviews": 12,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### POST /api/products
Tạo sản phẩm mới *(Admin only)*

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "Cơm gà xối mỡ",
  "description": "Cơm gà thơm ngon với nước mắm đậm đà",
  "price": 45000,
  "categoryId": "clxxxxx",
  "images": [
    {
      "url": "https://res.cloudinary.com/.../image1.jpg",
      "publicId": "food-delivery/product_123",
      "alt": "Cơm gà xối mỡ"
    },
    {
      "url": "https://res.cloudinary.com/.../image2.jpg", 
      "publicId": "food-delivery/product_124",
      "alt": "Cơm gà góc khác"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Tạo sản phẩm thành công",
  "product": {
    "id": "clxxxxx",
    "name": "Cơm gà xối mỡ",
    "description": "Cơm gà thơm ngon với nước mắm đậm đà",
    "price": 45000,
    "isActive": true,
    "categoryId": "clyyyyy",
    "category": {
      "id": "clyyyyy",
      "name": "Cơm"
    },
    "images": [
      {
        "id": "clzzzzz",
        "url": "https://res.cloudinary.com/.../image1.jpg",
        "publicId": "food-delivery/product_123",
        "alt": "Cơm gà xối mỡ",
        "order": 0
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/products/[id]
Lấy chi tiết sản phẩm

**Response (200):**
```json
{
  "product": {
    "id": "clxxxxx",
    "name": "Cơm gà xối mỡ",
    "description": "Cơm gà thơm ngon với nước mắm đậm đà",
    "price": 45000,
    "isActive": true,
    "category": {
      "id": "clyyyyy",
      "name": "Cơm",
      "description": "Các món cơm đậm đà hương vị"
    },
    "images": [
      {
        "id": "clzzzzz",
        "url": "https://res.cloudinary.com/.../image1.jpg",
        "publicId": "food-delivery/product_123",
        "alt": "Cơm gà xối mỡ",
        "order": 0
      }
    ],
    "reviews": [
      {
        "id": "claaaa",
        "rating": 5,
        "comment": "Rất ngon, sẽ order lại!",
        "user": {
          "id": "clbbbb",
          "name": "Nguyễn Văn A",
          "avatar": "https://avatar-url.com"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "averageRating": 4.5,
    "totalReviews": 12,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### PUT /api/products/[id]
Cập nhật sản phẩm *(Admin only)*

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "Cơm gà xối mỡ (cập nhật)",
  "description": "Mô tả mới",
  "price": 50000,
  "categoryId": "clxxxxx",
  "isActive": true,
  "images": [
    {
      "url": "https://new-image-url.com/image.jpg",
      "publicId": "food-delivery/new_image",
      "alt": "Ảnh mới"
    }
  ],
  "imagesToDelete": ["food-delivery/old_image_id"]
}
```

---

### DELETE /api/products/[id]
Xóa sản phẩm *(Admin only)*

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):**
```json
{
  "message": "Xóa sản phẩm thành công"
}
```

**Errors:**
- `400`: Không thể xóa sản phẩm đã có trong đơn hàng

---

## 🛒 Cart Endpoints

### GET /api/cart
Lấy giỏ hàng của user

**Headers:** `Authorization: Bearer <user_token>`

**Response (200):**
```json
{
  "items": [
    {
      "id": "clxxxxx",
      "quantity": 2,
      "product": {
        "id": "clyyyyy",
        "name": "Cơm gà xối mỡ",
        "price": 45000,
        "images": [
          {
            "url": "https://res.cloudinary.com/.../image.jpg",
            "alt": "Cơm gà xối mỡ"
          }
        ],
        "category": {
          "name": "Cơm"
        }
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 90000,
  "itemCount": 2
}
```

---

### POST /api/cart
Thêm sản phẩm vào giỏ hàng

**Headers:** `Authorization: Bearer <user_token>`

**Request Body:**
```json
{
  "productId": "clxxxxx",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "message": "Thêm vào giỏ hàng thành công",
  "cartItem": {
    "id": "clzzzzz",
    "quantity": 2,
    "productId": "clxxxxx",
    "userId": "clyyyyy"
  }
}
```

---

### PUT /api/cart/[id]
Cập nhật số lượng sản phẩm trong giỏ

**Headers:** `Authorization: Bearer <user_token>`

**Request Body:**
```json
{
  "quantity": 3
}
```

---

### DELETE /api/cart/[id]
Xóa sản phẩm khỏi giỏ hàng

**Headers:** `Authorization: Bearer <user_token>`

**Response (200):**
```json
{
  "message": "Xóa khỏi giỏ hàng thành công"
}
```

---

### DELETE /api/cart
Xóa toàn bộ giỏ hàng

**Headers:** `Authorization: Bearer <user_token>`

**Response (200):**
```json
{
  "message": "Xóa toàn bộ giỏ hàng thành công"
}
```

---

## 📋 Order Endpoints

### GET /api/orders
Lấy danh sách đơn hàng

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Trang (default: 1)
- `limit` (number): Số lượng/trang (default: 10)
- `status` (string): Lọc theo trạng thái

**User Response (200):**
```json
{
  "orders": [
    {
      "id": "clxxxxx",
      "orderNumber": "ORD-1704067200000",
      "status": "DELIVERED",
      "total": 135000,
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0987654321",
      "customerAddress": "123 Đường ABC, TP.HCM",
      "notes": "Giao nhanh giúp em",
      "orderItems": [
        {
          "id": "clyyyyy",
          "quantity": 2,
          "price": 45000,
          "product": {
            "id": "clzzzzz",
            "name": "Cơm gà xối mỡ",
            "images": [
              {
                "url": "https://res.cloudinary.com/.../image.jpg"
              }
            ]
          }
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### POST /api/orders
Tạo đơn hàng mới (từ giỏ hàng)

**Headers:** `Authorization: Bearer <user_token>`

**Request Body:**
```json
{
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0987654321",
  "customerAddress": "123 Đường ABC, TP.HCM",
  "notes": "Giao nhanh giúp em"
}
```

**Response (201):**
```json
{
  "message": "Tạo đơn hàng thành công",
  "order": {
    "id": "clxxxxx",
    "orderNumber": "ORD-1704067200000",
    "status": "PENDING",
    "total": 135000,
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0987654321",
    "customerAddress": "123 Đường ABC, TP.HCM",
    "notes": "Giao nhanh giúp em",
    "orderItems": [
      {
        "quantity": 2,
        "price": 45000,
        "product": {
          "name": "Cơm gà xối mỡ"
        }
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Errors:**
- `400`: Giỏ hàng trống

---

### GET /api/orders/[id]
Lấy chi tiết đơn hàng

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "order": {
    "id": "clxxxxx",
    "orderNumber": "ORD-1704067200000",
    "status": "PREPARING",
    "total": 135000,
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0987654321",
    "customerAddress": "123 Đường ABC, TP.HCM",
    "notes": "Giao nhanh giúp em",
    "user": {
      "id": "clyyyyy",
      "name": "Nguyễn Văn A",
      "email": "user@example.com"
    },
    "orderItems": [
      {
        "id": "clzzzzz",
        "quantity": 2,
        "price": 45000,
        "product": {
          "id": "claaaaa",
          "name": "Cơm gà xối mỡ",
          "description": "Cơm gà thơm ngon...",
          "images": [
            {
              "url": "https://res.cloudinary.com/.../image.jpg",
              "alt": "Cơm gà xối mỡ"
            }
          ]
        }
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T01:00:00Z"
  }
}
```

---

### PUT /api/orders/[id]
Cập nhật trạng thái đơn hàng *(Admin only)*

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Valid Status Values:**
- `PENDING` → `CONFIRMED` hoặc `CANCELLED`
- `CONFIRMED` → `PREPARING` hoặc `CANCELLED`
- `PREPARING` → `READY` hoặc `CANCELLED`
- `READY` → `DELIVERED`
- `DELIVERED` (final state)
- `CANCELLED` (final state)

---

### DELETE /api/orders/[id]
Hủy đơn hàng (chỉ khi status = PENDING)

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Hủy đơn hàng thành công"
}
```

---

## ⭐ Review Endpoints

### GET /api/reviews
Lấy reviews cho sản phẩm

**Query Parameters:**
- `productId` (required): ID sản phẩm
- `page` (number): Trang (default: 1)
- `limit` (number): Số lượng/trang (default: 10)

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "clxxxxx",
      "rating": 5,
      "comment": "Món ăn rất ngon, phục vụ tốt!",
      "user": {
        "id": "clyyyyy",
        "name": "Nguyễn Văn A",
        "avatar": "https://avatar-url.com"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 12,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

---

### POST /api/reviews
Tạo review sản phẩm

**Headers:** `Authorization: Bearer <user_token>`

**Request Body:**
```json
{
  "productId": "clxxxxx",
  "rating": 5,
  "comment": "Món ăn rất ngon, sẽ order lại!"
}
```

**Response (201):**
```json
{
  "message": "Đánh giá thành công",
  "review": {
    "id": "clyyyyy",
    "rating": 5,
    "comment": "Món ăn rất ngon, sẽ order lại!",
    "user": {
      "id": "clzzzzz",
      "name": "Nguyễn Văn A",
      "avatar": "https://avatar-url.com"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Requirements:**
- User phải đã mua sản phẩm (có order với status DELIVERED)
- 1 user chỉ có thể review 1 sản phẩm 1 lần

**Errors:**
- `403`: Bạn cần mua sản phẩm trước khi đánh giá
- `400`: Bạn đã đánh giá sản phẩm này rồi

---

### PUT /api/reviews/[id]
Cập nhật review

**Headers:** `Authorization: Bearer <user_token>`

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Cập nhật đánh giá"
}
```

---

### DELETE /api/reviews/[id]
Xóa review

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Xóa đánh giá thành công"
}
```

**Permissions:**
- User: Chỉ xóa review của mình
- Admin: Xóa bất kỳ review nào

---

## ☁️ Upload Endpoints

### POST /api/upload
Upload ảnh lên Cloudinary *(Admin only)*

**Headers:** 
- `Authorization: Bearer <admin_token>`
- `Content-Type: multipart/form-data`

**Request Body (FormData):**
```
files: File[] (multiple files)
folder: string (optional, default: "food-delivery")
```

**Response (200):**
```json
{
  "message": "Upload ảnh thành công",
  "images": [
    {
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v1704067200/food-delivery/product_123.jpg",
      "publicId": "food-delivery/product_123", 
      "width": 800,
      "height": 600
    },
    {
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v1704067201/food-delivery/product_124.jpg",
      "publicId": "food-delivery/product_124",
      "width": 1024,
      "height": 768
    }
  ]
}
```

**JavaScript Example:**
```javascript
const uploadImages = async (files) => {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  formData.append('folder', 'products')
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  return await response.json()
}
```

---

## 🛠️ Admin Endpoints

### GET /api/admin/dashboard
Lấy thống kê dashboard *(Admin only)*

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `period` (string): 7d, 30d, 90d, 1y (default: 30d)

**Response (200):**
```json
{
  "summary": {
    "totalRevenue": 15750000,
    "totalOrders": 156,
    "totalProducts": 45,
    "totalCustomers": 89,
    "pendingOrders": 12
  },
  "revenueChart": [
    {
      "date": "2024-01-01",
      "revenue": 450000,
      "orders": 15
    }
  ],
  "topProducts": [
    {
      "productId": "clxxxxx",
      "totalSold": 45,
      "revenue": 2025000,
      "product": {
        "name": "Cơm gà xối mỡ",
        "price": 45000,
        "category": {
          "name": "Cơm"
        }
      }
    }
  ],
  "orderStatusDistribution": [
    {
      "status": "PENDING",
      "count": 12
    },
    {
      "status": "CONFIRMED", 
      "count": 8
    }
  ]
}
```

---

### GET /api/admin/users
Lấy danh sách người dùng *(Admin only)*

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `search` (string): Tìm kiếm theo tên/email/phone
- `role` (string): Lọc theo role (ADMIN, CUSTOMER)
- `page` (number): Trang (default: 1)
- `limit` (number): Số lượng/trang (default: 10)

**Response (200):**
```json
{
  "users": [
    {
      "id": "clxxxxx",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0987654321",
      "address": "123 Đường ABC, TP.HCM",
      "role": "CUSTOMER",
      "createdAt": "2024-01-01T00:00:00Z",
      "_count": {
        "orders": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 89,
    "totalPages": 9
  }
}
```

---

## 📊 Response Status Codes

| Status | Meaning | Usage |
|--------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## 🔄 Order Status Flow

```
PENDING → CONFIRMED → PREPARING → READY → DELIVERED
   ↓         ↓           ↓
CANCELLED  CANCELLED  CANCELLED
```

**Status Descriptions:**
- `PENDING`: Đơn hàng mới tạo, chờ xác nhận
- `CONFIRMED`: Đã xác nhận, chuẩn bị làm món
- `PREPARING`: Đang chế biến món ăn
- `READY`: Món ăn đã sẵn sàng, chờ giao
- `DELIVERED`: Đã giao thành công
- `CANCELLED`: Đã hủy đơn hàng

---

## 💡 Best Practices

### Authentication
```javascript
// Lưu token vào localStorage
localStorage.setItem('token', response.token)

// Gửi kèm mọi request
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}
```

### Error Handling
```javascript
const handleApiError = (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    throw new Error(response.error || 'API Error')
  }
  return response.json()
}
```

### Pagination
```javascript
const fetchProducts = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/products?page=${page}&limit=${limit}`)
  const data = await response.json()
  
  return {
    products: data.products,
    hasMore: page < data.pagination.totalPages
  }
}
```

---

**🎯 Happy Coding! Chúc bạn phát triển frontend thành công!**
