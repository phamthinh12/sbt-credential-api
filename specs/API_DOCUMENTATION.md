# SBT Credential API - Specification

## URLs

- **Local:** `http://localhost:3000`
- **Deploy:** `https://sbt-credential-api.onrender.com`

---

## Authentication

> **Lưu ý:** Thay `<BASE_URL>` bằng URL tương ứng:
> - Local: `http://localhost:3000`
> - Deploy: `https://sbt-credential-api.onrender.com`

Tất cả các API (trừ API public) cần gửi JWT token trong header:

```
Authorization: Bearer <access_token>
```

---

## 1. AUTH (3 APIs)

### #1 - POST /auth/login
- **Ai gọi:** Super Admin
- **Mô tả:** Super Admin đăng nhập bằng username và password
- **Headers:** Không cần auth
- **Request Body:**
```json
{ "username": "admin", "password": "admin123" }
```
- **Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "...",
    "username": "admin",
    "role": "super_admin",
    "schoolId": null
  }
}
```
- **Example:**
```bash
curl -X POST https://sbt-credential-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

### #2 - POST /auth/login/wallet
- **Ai gọi:** Student hoặc School (sau khi đã được duyệt)
- **Mô tả:** Đăng nhập bằng wallet address (MetaMask)
- **Headers:** Không cần auth
- **Request Body:**
```json
{ "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1" }
```
- **Response (Student):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "student-001",
    "name": "Nguyễn Văn A",
    "role": "student",
    "schoolId": "school-001"
  }
}
```
- **Response (School):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "school-001",
    "name": "Đại học Bách Khoa",
    "role": "school_admin",
    "schoolId": "school-001"
  }
}
```

---

### #3 - GET /auth/wallet/:address
- **Ai gọi:** Frontend (khi user click "Kết nối MetaMask")
- **Mô tả:** Kiểm tra xem địa chỉ ví đã đăng ký chưa
- **Headers:** Không cần auth
- **Path Parameters:** `address` - địa chỉ wallet
- **Response (đã đăng ký là Student):**
```json
{ "exists": true, "role": "student", "studentId": "001", "name": "Nguyễn Văn A" }
```
- **Response (đã đăng ký là School):**
```json
{ "exists": true, "role": "school", "schoolId": "001", "name": "Đại học Bách Khoa" }
```
- **Response (chưa đăng ký):**
```json
{ "exists": false, "message": "Wallet chưa đăng ký" }
```

---

## 2. REGISTRATION REQUESTS (6 APIs)

### #4 - POST /registration-requests
- **Ai gọi:** Student hoặc School khi đăng ký lần đầu
- **Mô tả:** Tạo yêu cầu đăng ký mới
- **Headers:** Không cần auth
- **Request Body (Student đăng ký):**
```json
{
  "walletAddress": "0x1111111111111111111111111111111111111111",
  "type": "student",
  "name": "Nguyễn Văn A",
  "email": "a@email.com",
  "studentCode": "SV001",
  "schoolId": "school-001"
}
```
- **Request Body (School đăng ký):**
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1",
  "type": "school",
  "name": "Đại học Bách Khoa",
  "email": "admin@bachkhoa.edu.vn",
  "schoolName": "Đại học Bách Khoa"
}
```
- **Response:**
```json
{ "id": "req-001", "status": "pending", "message": "Yêu cầu đã được gửi. Vui lòng chờ duyệt." }
```
- **Lưu ý:** Chỉ lưu vào bảng registration_requests, CHƯA vào students/schools

---

### #5 - GET /registration-requests?type=school
- **Ai gọi:** Super Admin
- **Mô tả:** Xem danh sách yêu cầu đăng ký School đang chờ duyệt
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** `type=school` (bắt buộc)
- **Response:**
```json
{
  "data": [
    {
      "id": "req-001",
      "type": "school",
      "name": "Đại học Bách Khoa",
      "email": "admin@bachkhoa.edu.vn",
      "walletAddress": "0x742d...",
      "schoolName": "Đại học Bách Khoa",
      "status": "pending",
      "createdAt": "2024-03-01T10:00:00Z"
    }
  ]
}
```

---

### #6 - GET /registration-requests?type=student
- **Ai gọi:** School
- **Mô tả:** Xem danh sách yêu cầu đăng ký Student của trường mình đang chờ duyệt
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** 
  - `type=student` (bắt buộc)
  - `schoolId` (optional - để lọc theo trường)
- **Response:**
```json
{
  "data": [
    {
      "id": "req-002",
      "type": "student",
      "name": "Nguyễn Văn A",
      "email": "a@email.com",
      "walletAddress": "0x111...",
      "studentCode": "SV001",
      "schoolId": "school-001",
      "status": "pending",
      "createdAt": "2024-03-02T10:00:00Z"
    }
  ]
}
```

---

### #7 - GET /registration-requests/:id
- **Ai gọi:** Super Admin / School Admin
- **Mô tả:** Xem chi tiết một yêu cầu đăng ký
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của yêu cầu
- **Response:**
```json
{
  "id": "req-001",
  "type": "school",
  "name": "Đại học Bách Khoa",
  "email": "admin@bachkhoa.edu.vn",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1",
  "schoolName": "Đại học Bách Khoa",
  "status": "pending",
  "createdAt": "2024-03-01T10:00:00Z",
  "updatedAt": "2024-03-01T10:00:00Z"
}
```

---

### #8 - PATCH /registration-requests/:id/approve
- **Ai gọi:** School hoặc Super Admin
- **Mô tả:** Duyệt yêu cầu đăng ký
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của yêu cầu
- **Logic:**
  1. Nếu type=student → School duyệt → Tạo Student record + Lưu walletAddress
  2. Nếu type=school → Super Admin duyệt → Tạo School record + Lưu walletAddress
  3. Update request status = "approved"
  4. Update approvedAt = now
- **Response (duyệt Student):**
```json
{
  "success": true,
  "message": "Đã duyệt yêu cầu",
  "student": {
    "id": "student-001",
    "name": "Nguyễn Văn A",
    "email": "a@email.com",
    "walletAddress": "0x111...",
    "studentCode": "SV001",
    "status": "active"
  }
}
```
- **Response (duyệt School):**
```json
{
  "success": true,
  "message": "Đã duyệt yêu cầu",
  "school": {
    "id": "school-001",
    "name": "Đại học Bách Khoa",
    "walletAddress": "0x742d...",
    "isActive": true
  }
}
```

---

### #9 - PATCH /registration-requests/:id/reject
- **Ai gọi:** School hoặc Super Admin
- **Mô tả:** Từ chối yêu cầu đăng ký
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của yêu cầu
- **Logic:** Update status = "rejected"
- **Response:**
```json
{ "success": true, "message": "Đã từ chối yêu cầu" }
```

---

## 3. STUDENTS (5 APIs)

### #10 - GET /students
- **Ai gọi:** School / Super Admin
- **Mô tả:** Lấy danh sách sinh viên của trường mình (lọc theo schoolId)
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** 
  - `schoolId` (optional - Super Admin lọc theo trường)
- **Response:**
```json
{
  "data": [
    { "id": "student-001", "name": "Nguyễn Văn A", "email": "a@email.com", "studentCode": "SV001", "status": "active", "schoolId": "school-001" }
  ]
}
```

---

### #11 - GET /students/:id
- **Ai gọi:** School / Super Admin
- **Mô tả:** Xem chi tiết một sinh viên
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của sinh viên
- **Response:**
```json
{
  "data": {
    "id": "student-001",
    "name": "Nguyễn Văn A",
    "email": "a@email.com",
    "walletAddress": "0x111...",
    "studentCode": "SV001",
    "status": "active",
    "schoolId": "school-001"
  }
}
```

---

### #12 - POST /students
- **Ai gọi:** School / Super Admin
- **Mô tả:** Tạo sinh viên mới trực tiếp (không qua đăng ký)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "a@email.com",
  "studentCode": "SV001",
  "walletAddress": "0x1111111111111111111111111111111111111111"
}
```
- **Response:**
```json
{
  "data": {
    "id": "student-001",
    "name": "Nguyễn Văn A",
    "email": "a@email.com",
    "studentCode": "SV001",
    "status": "active",
    "schoolId": "school-001"
  }
}
```

---

### #13 - PUT /students/:id
- **Ai gọi:** School / Super Admin
- **Mô tả:** Cập nhật thông tin sinh viên
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của sinh viên
- **Request Body:**
```json
{ "name": "Nguyễn Văn A", "status": "active" }
```
- **Response:**
```json
{
  "data": {
    "id": "student-001",
    "name": "Nguyễn Văn A",
    "email": "a@email.com",
    "studentCode": "SV001",
    "status": "active"
  }
}
```

---

### #14 - DELETE /students/:id
- **Ai gọi:** Super Admin only
- **Mô tả:** Xóa sinh viên
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của sinh viên
- **Response:**
```json
{ "message": "Xóa sinh viên thành công" }
```

---

## 4. SCHOOLS (2 APIs)

### #15 - GET /schools
- **Ai gọi:** Tất cả (để Student chọn trường khi đăng ký)
- **Mô tả:** Lấy danh sách tất cả trường
- **Headers:** Không cần auth
- **Response:**
```json
{
  "data": [
    { "id": "school-001", "name": "Đại học Bách Khoa", "isActive": true }
  ]
}
```
- **Example:**
```bash
curl https://sbt-credential-api.onrender.com/schools
```

---

### #16 - GET /schools/:id
- **Ai gọi:** Ai cũng được
- **Mô tả:** Xem chi tiết một trường
- **Headers:** Không cần auth
- **Path Parameters:** `id` - ID của trường
- **Response:**
```json
{
  "data": {
    "id": "school-001",
    "name": "Đại học Bách Khoa",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0Eb1",
    "isActive": true
  }
}
```

---

## 5. CREDENTIALS (8 APIs)

### #17 - GET /credentials
- **Ai gọi:** School / Super Admin
- **Mô tả:** Lấy danh sách văn bằng
- **Headers:** `Authorization: Bearer <token>`
- **Logic:** Kiểm tra expiryDate, auto-update status = 'expired' nếu hết hạn
- **Response:**
```json
{
  "data": [
    {
      "id": "cred-001",
      "studentId": "student-001",
      "name": "Cử nhân Công nghệ Thông tin",
      "status": "confirmed",
      "verifyCode": "CRED-20240115-ABC123",
      "issuedAt": "2024-01-15"
    }
  ]
}
```

---

### #18 - POST /credentials
- **Ai gọi:** School / Super Admin
- **Mô tả:** TẠO văn bằng mới (immutable - không sửa được sau khi tạo)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "studentId": "student-001",
  "name": "Cử nhân Công nghệ Thông tin",
  "description": "Hoàn thành chương trình đào tạo",
  "classification": "Giỏi",
  "major": "Công nghệ phần mềm",
  "issuerName": "Đại học Bách Khoa",
  "fileHash": "a1b2c3d4e5f678901234567890abcdef1234567890abcdef12345678",
  "expiryDate": "2027-01-15"
}
```
- **Response:**
```json
{
  "id": "cred-001",
  "studentId": "student-001",
  "name": "Cử nhân Công nghệ Thông tin",
  "status": "pending",
  "verifyCode": "CRED-20240301-ABC123",
  "createdAt": "2024-03-01"
}
```

---

### #19 - GET /credentials/:id
- **Ai gọi:** Ai cũng được
- **Mô tả:** Xem chi tiết một văn bằng
- **Headers:** Không cần auth
- **Path Parameters:** `id` - ID của văn bằng
- **Response:**
```json
{
  "id": "cred-001",
  "studentId": "student-001",
  "name": "Cử nhân Công nghệ Thông tin",
  "description": "Hoàn thành chương trình đào tạo",
  "status": "confirmed",
  "verifyCode": "CRED-20240115-ABC123",
  "student": { "name": "Nguyễn Văn A", "email": "a@email.com" },
  "classification": "Giỏi",
  "major": "Công nghệ phần mềm",
  "issuerName": "Đại học Bách Khoa"
}
```

---

### #20 - GET /credentials/verify/:code
- **Ai gọi:** Tất cả (Public)
- **Mô tả:** Verify văn bằng công khai bằng mã code
- **Headers:** Không cần auth
- **Path Parameters:** `code` - Mã verify (ví dụ: CRED-20240115-ABC123)
- **Logic:**
  1. Tìm credential theo verifyCode
  2. Kiểm tra expiryDate → auto-update status = 'expired' nếu hết hạn
  3. Trả về thông tin + fileHash để frontend verify PDF
- **Response:**
```json
{
  "id": "cred-001",
  "name": "Cử nhân Công nghệ Thông tin",
  "description": "...",
  "fileHash": "a1b2c3d4e5f678901234567890abcdef1234567890abcdef12345678",
  "status": "confirmed",
  "verifyCode": "CRED-20240115-ABC123",
  "student": { "name": "Nguyễn Văn A", "email": "...", "studentCode": "SV001" },
  "classification": "Giỏi",
  "major": "Công nghệ phần mềm",
  "issuerName": "Đại học Bách Khoa",
  "issuedAt": "2024-01-15",
  "expiryDate": "2027-01-15"
}
```

- **Example:**
```bash
curl https://sbt-credential-api.onrender.com/credentials/verify/CRED-20240115-ABC123
```

---

### #21 - PATCH /credentials/:id/revoke
- **Ai gọi:** School (trường đã cấp văn bằng đó)
- **Mô tả:** THU HỒI văn bằng (đổi status = 'revoked')
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của văn bằng
- **Logic:**
  1. Kiểm tra credential thuộc school đang login
  2. Update status = 'revoked'
  3. Update updatedAt = now
- **Response:**
```json
{ "success": true, "message": "Đã thu hồi văn bằng", "status": "revoked" }
```
- **Lưu ý:** Sau khi revoke KHÔNG thể khôi phục

---

### #22 - PATCH /credentials/:id/confirm
- **Ai gọi:** School / Super Admin
- **Mô tả:** Xác nhận văn bằng (chuyển từ issued → confirmed)
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của văn bằng
- **Request Body:**
```json
{ "txHash": "0xabc123...", "tokenId": "1" }
```
- **Response:**
```json
{ "success": true, "message": "Đã xác nhận văn bằng", "status": "confirmed" }
```

---

### #23 - GET /credentials/student/:studentId
- **Ai gọi:** School (xem sinh viên của trường mình)
- **Mô tả:** Lấy danh sách văn bằng của một sinh viên
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `studentId` - ID của sinh viên
- **Response:**
```json
[
  {
    "id": "cred-001",
    "studentId": "student-001",
    "name": "Cử nhân Công nghệ Thông tin",
    "status": "confirmed",
    "verifyCode": "CRED-20240115-ABC123"
  }
]
```

---

### #24 - GET /credentials/school/:schoolId
- **Ai gọi:** School / Super Admin
- **Mô tả:** Lấy danh sách văn bằng của một trường
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `schoolId` - ID của trường
- **Response:**
```json
{
  "data": [
    {
      "id": "cred-001",
      "studentId": "student-001",
      "name": "Cử nhân Công nghệ Thông tin",
      "status": "confirmed",
      "verifyCode": "CRED-20240115-ABC123"
    }
  ]
}
```

---

## Tổng hợp API Endpoints

| # | Method | Endpoint | Headers | Body | Query |
|---|--------|----------|---------|------|-------|
| 1 | POST | /auth/login | - | username, password | - |
| 2 | POST | /auth/login/wallet | - | walletAddress | - |
| 3 | GET | /auth/wallet/:address | - | - | - |
| 4 | POST | /registration-requests | - | walletAddress, type, name, email... | - |
| 5 | GET | /registration-requests | Bearer | - | type=school |
| 6 | GET | /registration-requests | Bearer | - | type=student, schoolId? |
| 7 | GET | /registration-requests/:id | Bearer | - | - |
| 8 | PATCH | /registration-requests/:id/approve | Bearer | - | - |
| 9 | PATCH | /registration-requests/:id/reject | Bearer | - | - |
| 10 | GET | /students | Bearer | - | schoolId? |
| 11 | GET | /students/:id | Bearer | - | - |
| 12 | POST | /students | Bearer | name, email, studentCode... | - |
| 13 | PUT | /students/:id | Bearer | name, status... | - |
| 14 | DELETE | /students/:id | Bearer | - | - |
| 15 | GET | /schools | - | - | - |
| 16 | GET | /schools/:id | - | - | - |
| 17 | GET | /credentials | Bearer | - | - |
| 18 | POST | /credentials | Bearer | studentId, name, fileHash... | - |
| 19 | GET | /credentials/:id | - | - | - |
| 20 | GET | /credentials/verify/:code | - | - | - |
| 21 | PATCH | /credentials/:id/revoke | Bearer | - | - |
| 22 | PATCH | /credentials/:id/confirm | Bearer | txHash?, tokenId? | - |
| 23 | GET | /credentials/student/:studentId | Bearer | - | - |
| 24 | GET | /credentials/school/:schoolId | Bearer | - | - |

---

## Mã lỗi thường gặp

| Code | Ý nghĩa |
|------|---------|
| 401 | Unauthorized - Thiếu hoặc token không hợp lệ |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy tài nguyên |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 500 | Internal Server Error - Lỗi server |
