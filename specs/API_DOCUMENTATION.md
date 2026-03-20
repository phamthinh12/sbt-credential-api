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

## 1. AUTH (2 APIs)

### #1 - POST /auth/login - Login Super Admin
- **URL:** `{{baseUrl}}/auth/login`
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
    "role": "super_admin"
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

### #2 - POST /auth/login/wallet - Login with Wallet
- **URL:** `{{baseUrl}}/auth/login/wallet`
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
    "schoolId": "school-001",
    "walletAddress": "0x..."
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
    "schoolId": "school-001",
    "walletAddress": "0x..."
  }
}
```
- **Response (chưa đăng ký):**
```json
{ "statusCode": 401, "message": "Wallet chưa được đăng ký trong hệ thống" }
```

---

## 2. REGISTRATION REQUESTS (5 APIs)

### #3 - POST /registration-requests - Create Registration Request
- **URL:** `{{baseUrl}}/registration-requests`
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
{
  "data": {
    "id": "req-001",
    "walletAddress": "0x...",
    "type": "student",
    "status": "pending"
  },
  "message": "Yêu cầu đăng ký đã được gửi. Vui lòng chờ duyệt."
}
```
- **Lưu ý:** Chỉ lưu vào bảng registration_requests, CHƯA vào students/schools

---

### #4 - GET /registration-requests - Get Registration Requests
- **URL:** `{{baseUrl}}/registration-requests`
- **Ai gọi:** Super Admin hoặc School Admin
- **Mô tả:** Xem danh sách yêu cầu đăng ký
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:** 
  - `type=school` - Super Admin xem yêu cầu đăng ký trường
  - `type=student` - School Admin xem yêu cầu đăng ký sinh viên (của trường mình)
  - `schoolId` (optional - Super Admin lọc theo trường)
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

### #5 - GET /registration-requests/:id - Get Request by ID
- **URL:** `{{baseUrl}}/registration-requests/:id`
- **Ai gọi:** Super Admin / School Admin
- **Mô tả:** Xem chi tiết một yêu cầu đăng ký
- **Headers:** Không cần auth (public endpoint)
- **Path Parameters:** `id` - ID của yêu cầu
- **Response:**
```json
{
  "data": {
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
}
```

---

### #6 - PATCH /registration-requests/:id/approve - Approve Registration Request
- **URL:** `{{baseUrl}}/registration-requests/:id/approve`
- **Ai gọi:** School (duyệt student) hoặc Super Admin (duyệt school)
- **Mô tả:** Duyệt yêu cầu đăng ký
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của yêu cầu
- **Logic:**
  1. Nếu type=student → School duyệt → Tạo Student record
  2. Nếu type=school → Super Admin duyệt → Tạo School record
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

### #7 - PATCH /registration-requests/:id/reject - Reject Registration Request
- **URL:** `{{baseUrl}}/registration-requests/:id/reject`
- **Ai gọi:** School (từ chối student) hoặc Super Admin (từ chối school)
- **Mô tả:** Từ chối yêu cầu đăng ký
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của yêu cầu
- **Logic:** Update status = "rejected"
- **Response:**
```json
{
  "success": true,
  "message": "Đã từ chối yêu cầu"
}
```

---

## 3. SCHOOLS (2 APIs)

### #8 - GET /schools - Get All Schools
- **URL:** `{{baseUrl}}/schools`
- **Ai gọi:** Tất cả (để Student chọn trường khi đăng ký)
- **Mô tả:** Lấy danh sách tất cả trường
- **Headers:** Không cần auth
- **Response:**
```json
{
  "data": [
    { "id": "school-001", "name": "Đại học Bách Khoa", "walletAddress": "0x...", "isActive": true }
  ]
}
```
- **Example:**
```bash
curl https://sbt-credential-api.onrender.com/schools
```

---

### #9 - GET /schools/:id - Get School by ID
- **URL:** `{{baseUrl}}/schools/:id`
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
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 4. STUDENTS (4 APIs)

### #10 - GET /students - Get All Students
- **URL:** `{{baseUrl}}/students`
- **Ai gọi:** School Admin
- **Mô tả:** Lấy danh sách sinh viên của trường mình
- **Headers:** `Authorization: Bearer <token>` (School Admin)
- **Query Parameters:** 
  - `schoolId` (optional - Super Admin lọc theo trường)
- **Response:**
```json
{
  "data": [
    {
      "id": "student-001",
      "schoolId": "school-001",
      "name": "Nguyễn Văn A",
      "email": "a@email.com",
      "walletAddress": "0x111...",
      "studentCode": "SV001",
      "status": "active"
    }
  ]
}
```

---

### #11 - GET /students/:id - Get Student by ID
- **URL:** `{{baseUrl}}/students/:id`
- **Ai gọi:** School Admin / Super Admin
- **Mô tả:** Xem chi tiết một sinh viên
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của sinh viên
- **Response:**
```json
{
  "data": {
    "id": "student-001",
    "schoolId": "school-001",
    "name": "Nguyễn Văn A",
    "email": "a@email.com",
    "walletAddress": "0x111...",
    "studentCode": "SV001",
    "status": "active"
  }
}
```

---

### #12 - PUT /students/:id - Update Student
- **URL:** `{{baseUrl}}/students/:id`
- **Ai gọi:** School Admin
- **Mô tả:** Cập nhật thông tin sinh viên
- **Headers:** `Authorization: Bearer <token>` (School Admin)
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

### #13 - DELETE /students/:id - Delete Student
- **URL:** `{{baseUrl}}/students/:id`
- **Ai gọi:** Super Admin only
- **Mô tả:** Xóa sinh viên (CASCADE xóa credentials)
- **Headers:** `Authorization: Bearer <token>` (Super Admin)
- **Path Parameters:** `id` - ID của sinh viên
- **Response:**
```json
{ "message": "Xóa sinh viên thành công" }
```
- **Lưu ý:** Khi xóa student, tất cả credentials của student cũng bị xóa (ON DELETE CASCADE)

---

## 5. CREDENTIALS (8 APIs)

### #14 - GET /credentials - Get All Credentials
- **URL:** `{{baseUrl}}/credentials`
- **Ai gọi:** School Admin / Super Admin
- **Mô tả:** Lấy danh sách văn bằng
- **Headers:** `Authorization: Bearer <token>`
- **Logic:** 
  - School Admin chỉ thấy credentials của trường mình
  - Super Admin thấy tất cả
  - Kiểm tra expiryDate, auto-update status = 'expired' nếu hết hạn
- **Response:**
```json
{
  "data": [
    {
      "id": "cred-001",
      "studentId": "student-001",
      "schoolId": "school-001",
      "name": "Cử nhân Công nghệ Thông tin",
      "description": "Test diploma",
      "fileHash": "abc123...",
      "ipfsHash": "Qm...",
      "status": "confirmed",
      "txHash": "0x...",
      "tokenId": "1",
      "verifyCode": "CRED-20240115-ABC123",
      "classification": "Giỏi",
      "major": "Công nghệ phần mềm",
      "issuerName": "Đại học Bách Khoa",
      "issuedAt": "2024-01-15"
    }
  ]
}
```

---

### #15 - POST /credentials - Issue Credential
- **URL:** `{{baseUrl}}/credentials`
- **Ai gọi:** School Admin
- **Mô tả:** Tạo văn bằng mới cho sinh viên (upload file PDF)
- **Headers:** `Authorization: Bearer <token>` + `Content-Type: multipart/form-data`
- **Request Body (multipart/form-data):**
  - `file`: File PDF văn bằng (binary)
  - `studentId`: ID của sinh viên
  - `name`: Tên văn bằng
  - `description`: Mô tả (optional)
  - `classification`: Xếp loại (required)
  - `major`: Chuyên ngành (required)
  - `issuerName`: Tên đơn vị cấp (required)
  - `expiryDate`: Ngày hết hạn YYYY-MM-DD (optional)
- **Response:**
```json
{
  "id": "cred-001",
  "studentId": "student-001",
  "name": "Cử nhân Công nghệ Thông tin",
  "status": "pending",
  "verifyCode": "CRED-20240301-ABC123",
  "fileHash": "abc123...",
  "ipfsHash": "Qm...",
  "createdAt": "2024-03-01"
}
```
- **Lưu ý:** 
  - File được upload lên IPFS (nếu configured)
  - Hash SHA256 của file được tính toán
  - Credential được mint lên blockchain (async)

---

### #16 - GET /credentials/student/:studentId - Get Credentials by Student
- **URL:** `{{baseUrl}}/credentials/student/:studentId`
- **Ai gọi:** Student (chỉ xem văn bằng của mình)
- **Mô tả:** Lấy danh sách văn bằng của một sinh viên
- **Headers:** `Authorization: Bearer <token>` (Student)
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

### #17 - GET /credentials/school/:schoolId - Get Credentials by School
- **URL:** `{{baseUrl}}/credentials/school/:schoolId`
- **Ai gọi:** School Admin
- **Mô tả:** Lấy danh sách văn bằng của một trường
- **Headers:** `Authorization: Bearer <token>` (School Admin)
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

### #18 - GET /credentials/:id - Get Credential by ID
- **URL:** `{{baseUrl}}/credentials/:id`
- **Ai gọi:** Ai cũng được
- **Mô tả:** Xem chi tiết một văn bằng
- **Headers:** Không cần auth
- **Path Parameters:** `id` - ID của văn bằng
- **Response:**
```json
{
  "id": "cred-001",
  "studentId": "student-001",
  "schoolId": "school-001",
  "name": "Cử nhân Công nghệ Thông tin",
  "description": "Hoàn thành chương trình đào tạo",
  "fileHash": "abc123...",
  "status": "confirmed",
  "verifyCode": "CRED-20240115-ABC123",
  "txHash": "0x...",
  "tokenId": "1",
  "classification": "Giỏi",
  "major": "Công nghệ phần mềm",
  "issuerName": "Đại học Bách Khoa",
  "issuedAt": "2024-01-15",
  "student": { "name": "Nguyễn Văn A", "email": "a@email.com", "studentCode": "SV001" },
  "school": { "name": "Đại học Bách Khoa" }
}
```

---

### #19 - GET /credentials/verify/:code - Verify by Code (Public)
- **URL:** `{{baseUrl}}/credentials/verify/:code`
- **Ai gọi:** Tất cả (Public)
- **Mô tả:** Verify văn bằng công khai bằng mã code
- **Headers:** Không cần auth
- **Path Parameters:** `code` - Mã verify (ví dụ: CRED-20240115-ABC123)
- **Logic:**
  1. Tìm credential theo verifyCode
  2. Kiểm tra expiryDate → auto-update status = 'expired' nếu hết hạn
  3. Trả về thông tin + fileHash để verify PDF
- **Response:**
```json
{
  "id": "cred-001",
  "name": "Cử nhân Công nghệ Thông tin",
  "description": "...",
  "fileHash": "abc123...",
  "status": "confirmed",
  "verifyCode": "CRED-20240115-ABC123",
  "txHash": "0x...",
  "tokenId": "1",
  "classification": "Giỏi",
  "major": "Công nghệ phần mềm",
  "issuerName": "Đại học Bách Khoa",
  "issuedAt": "2024-01-15",
  "expiryDate": "2027-01-15",
  "student": { "name": "Nguyễn Văn A", "studentCode": "SV001" },
  "school": { "name": "Đại học Bách Khoa" }
}
```
- **Example:**
```bash
curl https://sbt-credential-api.onrender.com/credentials/verify/CRED-20240115-ABC123
```

---

### #20 - POST /credentials/verify-file - Verify File Integrity
- **URL:** `{{baseUrl}}/credentials/verify-file`
- **Ai gọi:** Ai cũng được
- **Mô tả:** Verify tính toàn vẹn của file PDF văn bằng
- **Headers:** `Content-Type: multipart/form-data`
- **Request Body (multipart/form-data):**
  - `verifyCode`: Mã verify của văn bằng
  - `file`: File PDF để verify (binary)
- **Response:**
```json
{
  "isValid": true,
  "message": "Văn bằng hợp lệ",
  "metadata": {
    "studentName": "Nguyễn Văn A",
    "credentialName": "Cử nhân Công nghệ Thông tin",
    "issuedAt": "2024-01-15"
  }
}
```

---

### #21 - PATCH /credentials/:id/revoke - Revoke Credential
- **URL:** `{{baseUrl}}/credentials/:id/revoke`
- **Ai gọi:** School Admin (trường đã cấp văn bằng đó)
- **Mô tả:** Thu hồi văn bằng (đổi status = 'revoked')
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:** `id` - ID của văn bằng
- **Logic:**
  1. Kiểm tra credential thuộc school đang login
  2. Update status = 'revoked'
  3. Update updatedAt = now
- **Response:**
```json
{ "success": true, "message": "Đã thu hồi văn bằng", "status": "revoked", "updatedAt": "2024-03-01T00:00:00Z" }
```
- **Lưu ý:** Sau khi revoke KHÔNG thể khôi phục

---

## Tổng hợp API Endpoints

| # | Method | Endpoint | Auth | Ai gọi | Mô tả |
|---|--------|----------|------|---------|-------|
| 1 | POST | /auth/login | - | Super Admin | Login username/password |
| 2 | POST | /auth/login/wallet | - | Student/School | Login MetaMask |
| 3 | POST | /registration-requests | - | Public | Tạo yêu cầu đăng ký |
| 4 | GET | /registration-requests | Bearer | Super Admin, School Admin | Xem danh sách requests |
| 5 | GET | /registration-requests/:id | - | Public | Xem chi tiết request |
| 6 | PATCH | /registration-requests/:id/approve | Bearer | Super Admin, School Admin | Duyệt request |
| 7 | PATCH | /registration-requests/:id/reject | Bearer | Super Admin, School Admin | Từ chối request |
| 8 | GET | /schools | - | Public | Danh sách trường |
| 9 | GET | /schools/:id | - | Public | Chi tiết trường |
| 10 | GET | /students | Bearer | School Admin | Danh sách sinh viên |
| 11 | GET | /students/:id | Bearer | School Admin | Chi tiết sinh viên |
| 12 | PUT | /students/:id | Bearer | School Admin | Cập nhật sinh viên |
| 13 | DELETE | /students/:id | Bearer | Super Admin | Xóa sinh viên (CASCADE) |
| 14 | GET | /credentials | Bearer | School Admin, Super Admin | Danh sách văn bằng |
| 15 | POST | /credentials | Bearer | School Admin | Tạo văn bằng (upload PDF) |
| 16 | GET | /credentials/student/:id | Bearer | Student | Văn bằng của sinh viên |
| 17 | GET | /credentials/school/:id | Bearer | School Admin | Văn bằng của trường |
| 18 | GET | /credentials/:id | - | Public | Chi tiết văn bằng |
| 19 | GET | /credentials/verify/:code | - | Public | Verify bằng mã code |
| 20 | POST | /credentials/verify-file | - | Public | Verify file PDF |
| 21 | PATCH | /credentials/:id/revoke | Bearer | School Admin | Thu hồi văn bằng |

---

## User Roles

| Role | Mô tả | Quyền |
|------|--------|-------|
| `super_admin` | Quản trị viên cao cấp | Toàn quyền |
| `school_admin` | Quản trị trường | Quản lý students, credentials của trường |
| `student` | Sinh viên | Xem văn bằng của mình |

---

## Credential Status

| Status | Mô tả |
|--------|--------|
| `pending` | Đang chờ mint blockchain |
| `issued` | Đã mint lên blockchain |
| `confirmed` | Đã xác nhận |
| `revoked` | Đã bị thu hồi |
| `expired` | Đã hết hạn |

---

## Mã lỗi thường gặp

| Code | Ý nghĩa |
|------|---------|
| 401 | Unauthorized - Thiếu hoặc token không hợp lệ |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Không tìm thấy tài nguyên |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 500 | Internal Server Error - Lỗi server |

---

## Test Credentials

| User | Username | Password/Wallet | Role |
|------|----------|----------------|------|
| Super Admin | admin | admin123 | super_admin |
| School | - | 0xA30EEbA7AD3712fDf080b0C2aadB5906B05347E7 | school_admin |
| Student | - | 0xcd3B766CCDd6AE721141F452C550Ca635964ce71 | student |

---

## Blockchain

- **Network:** Polygon Amoy Testnet
- **Contract:** Deployed at `0xd060f3350489649ED736795f5493Ee733803ea33`
- **Token Standard:** SBT (Soulbound Token / ERC721 non-transferable)
