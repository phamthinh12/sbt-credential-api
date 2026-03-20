# Test Plan - SBT Credential API

## 1. Overview

### API Summary

| STT | API | Method | Auth | Description |
|-----|-----|--------|------|-------------|
| 1 | /auth/login | POST | - | Super Admin login |
| 2 | /auth/login/wallet | POST | - | School/Student wallet login |
| 3 | /auth/wallet/:address | GET | - | Check wallet exists |
| 4 | /schools | GET | - | List all schools |
| 5 | /schools/:id | GET | - | Get school details |
| 6 | /students | GET | Admin/School | List students |
| 7 | /students | POST | School | Create student |
| 8 | /students/:id | GET | - | Get student details |
| 9 | /students/:id | PUT | School | Update student |
| 10 | /students/:id | DELETE | School | Delete student |
| 11 | /credentials | GET | Admin/School | List credentials |
| 12 | /credentials | POST | School | Create credential |
| 13 | /credentials/:id | GET | - | Get credential details |
| 14 | /credentials/verify/:code | GET | - | Verify credential (public) |
| 15 | /credentials/:id/revoke | PATCH | School | Revoke credential |
| 16 | /credentials/student/:id | GET | - | Get student credentials |
| 17 | /credentials/school/:id | GET | - | Get school credentials |
| 18 | /registration-requests | POST | - | Create registration |
| 19 | /registration-requests | GET | Admin/School | List registrations |
| 20 | /registration-requests/:id | GET | - | Get registration details |
| 21 | /registration-requests/:id/approve | PATCH | Admin/School | Approve registration |
| 22 | /registration-requests/:id/reject | PATCH | Admin/School | Reject registration |

---

## 2. Test Credentials

| User | Username | Password/Wallet | Role |
|------|----------|----------------|------|
| Super Admin | admin | admin123 | super_admin |
| School | - | 0xA30EEbA7AD3712fDf080b0C2aadB5906B05347E7 | school_admin |
| Student | - | 0xcd3B766CCDd6AE721141F452C550Ca635964ce71 | student |

---

## 3. AUTH APIs

### 3.1 POST /auth/login - Super Admin Login

**Purpose:** Super Admin login with username/password

**Request:**
```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Expected Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "4eadd837-7013-49ba-9e18-0bcd3e7704fa",
    "username": "admin",
    "role": "super_admin"
  }
}
```

**Test Steps:**
1. Send POST request with valid credentials
2. Verify response contains access_token
3. Verify token can be used for authenticated requests

---

### 3.2 POST /auth/login/wallet - Wallet Login

**Purpose:** School or Student login with MetaMask wallet

**Request:**
```
POST /auth/login/wallet
Content-Type: application/json

{
  "walletAddress": "0xA30EEbA7AD3712fDf080b0C2aadB5906B05347E7"
}
```

**Expected Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "91632af4-b54a-465b-968c-61d4b98bb583",
    "role": "school_admin",
    "walletAddress": "0xA30EEbA7AD3712fDf080b0C2aadB5906B05347E7"
  }
}
```

**Test Steps:**
1. Send POST request with registered wallet address
2. Verify response contains access_token
3. Verify role matches (school_admin/student)

---

### 3.3 GET /auth/wallet/:address - Check Wallet

**Purpose:** Check if wallet address is registered in system

**Request:**
```
GET /auth/wallet/0xA30EEbA7AD3712fDf080b0C2aadB5906B05347E7
```

**Expected Response (200):**
```json
{
  "exists": true,
  "role": "school",
  "schoolId": "91632af4-b54a-465b-968c-61d4b98bb583",
  "name": "Đại học Bách Khoa"
}
```

---

## 4. SCHOOL APIs

### 4.1 GET /schools - List All Schools

**Purpose:** Get list of all schools

**Request:**
```
GET /schools
```

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "91632af4-b54a-465b-968c-61d4b98bb583",
      "name": "Đại học Bách Khoa",
      "walletAddress": "0xA30EEbA7AD3712fDf080b0C2aadB5906B05347E7",
      "isActive": true,
      "students": [...],
      "credentials": [...],
      "users": [...]
    }
  ]
}
```

---

### 4.2 GET /schools/:id - Get School Details

**Purpose:** Get detailed information of a school

**Request:**
```
GET /schools/91632af4-b54a-465b-968c-61d4b98bb583
```

**Expected Response (200):**
```json
{
  "id": "91632af4-b54a-465b-968c-61d4b98bb583",
  "name": "Đại học Bách Khoa",
  "walletAddress": "0xA30EEbA7AD3712fDf080b0C2aadB5906B05347E7",
  "isActive": true,
  "students": [...],
  "credentials": [...],
  "users": [...]
}
```

---

## 5. STUDENT APIs

### 5.1 GET /students - List Students

**Purpose:** Get list of students (Admin: all, School: own school)

**Request:**
```
GET /students
Authorization: Bearer <token>
```

**Query Parameters:**
- schoolId (optional): Filter by school

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "9d3b0a40-f248-4c46-8eea-e6d5e91381dc",
      "schoolId": "91632af4-b54a-465b-968c-61d4b98bb583",
      "name": "Nguyễn Văn A",
      "email": "a.nguyenvan@example.com",
      "walletAddress": "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
      "studentCode": "SV001",
      "status": "active",
      "school": {...}
    }
  ]
}
```

---

### 5.2 POST /students - Create Student

**Purpose:** Create a new student (School Admin only)

**Request:**
```
POST /students
Authorization: Bearer <school_token>
Content-Type: application/json

{
  "name": "Nguyễn Văn Mới",
  "email": "moi@student.edu",
  "studentCode": "SV999",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678"
}
```

**Expected Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "name": "Nguyễn Văn Mới",
    "email": "moi@student.edu",
    "studentCode": "SV999",
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "status": "active"
  }
}
```

**Test Steps:**
1. Login as School Admin
2. Send POST request with student data
3. Verify student is created with correct schoolId
4. Verify status is "active"

---

### 5.3 GET /students/:id - Get Student Details

**Purpose:** Get detailed information of a student

**Request:**
```
GET /students/:id
```

**Expected Response (200):**
```json
{
  "data": {
    "id": "9d3b0a40-f248-4c46-8eea-e6d5e91381dc",
    "name": "Nguyễn Văn A",
    "email": "a.nguyenvan@example.com",
    "studentCode": "SV001",
    "status": "active",
    "school": {...},
    "credentials": [...]
  }
}
```

---

### 5.4 PUT /students/:id - Update Student

**Purpose:** Update student information

**Request:**
```
PUT /students/:id
Authorization: Bearer <school_token>
Content-Type: application/json

{
  "name": "Nguyễn Văn Đã Sửa",
  "status": "inactive"
}
```

**Expected Response (200):**
```json
{
  "data": {
    "id": "...",
    "name": "Nguyễn Văn Đã Sửa",
    "status": "inactive"
  }
}
```

---

### 5.5 DELETE /students/:id - Delete Student

**Purpose:** Delete a student

**Request:**
```
DELETE /students/:id
Authorization: Bearer <school_token>
```

**Expected Response (200):**
```json
{
  "message": "Xóa sinh viên thành công"
}
```

---

## 6. CREDENTIAL APIs

### 6.1 GET /credentials - List Credentials

**Purpose:** Get list of credentials (Admin: all, School: own school)

**Request:**
```
GET /credentials
Authorization: Bearer <token>
```

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "5c8095b8-bf45-4861-adfc-0c506d09d475",
      "studentId": "9d3b0a40-f248-4c46-8eea-e6d5e91381dc",
      "schoolId": "91632af4-b54a-465b-968c-61d4b98bb583",
      "name": "Cử nhân Công nghệ Thông tin",
      "status": "confirmed",
      "verifyCode": "CRED-1773988014350-WYEFOK",
      "txHash": "0x9085c1e31645b0f125f7bd199aa438b434ff43c03aab9b1b0fece054a379b8b3",
      "tokenId": "3",
      "student": {...},
      "school": {...}
    }
  ]
}
```

---

### 6.2 POST /credentials - Create Credential

**Purpose:** Create a new credential (immutable after creation)

**Request:**
```
POST /credentials
Authorization: Bearer <school_token>
Content-Type: multipart/form-data

- file: [PDF file]
- studentId: <STUDENT_ID>
- name: Cử nhân Công nghệ Thông tin
- description: Hoàn thành chương trình đào tạo
- classification: Giỏi
- major: Công nghệ phần mềm
- issuerName: Đại học Bách Khoa
```

**Expected Response (201):**
```json
{
  "id": "uuid",
  "studentId": "...",
  "name": "Cử nhân Công nghệ Thông tin",
  "status": "pending",
  "verifyCode": "CRED-xxx-XXXXXX",
  "fileHash": "sha256...",
  "ipfsHash": "Qm...",
  "createdAt": "2026-03-20T..."
}
```

**Auto-Processing:**
1. Status changes from "pending" → "issued" (during minting)
2. Status changes from "issued" → "confirmed" (after blockchain confirmation)
3. txHash and tokenId are added

**Test Steps:**
1. Login as School Admin
2. Send POST request with PDF file and credential data
3. Verify credential is created with status "pending"
4. Wait 5-10 seconds for blockchain processing
5. Verify status becomes "confirmed"
6. Verify txHash and tokenId are present

---

### 6.3 GET /credentials/:id - Get Credential Details

**Purpose:** Get detailed information of a credential

**Request:**
```
GET /credentials/:id
```

**Expected Response (200):**
```json
{
  "id": "5c8095b8-bf45-4861-adfc-0c506d09d475",
  "name": "Cử nhân Công nghệ Thông tin",
  "description": "Hoàn thành chương trình đào tạo",
  "classification": "Giỏi",
  "major": "Công nghệ phần mềm",
  "status": "confirmed",
  "verifyCode": "CRED-1773988014350-WYEFOK",
  "txHash": "0x9085c1e31645b0f125f7bd199aa438b434ff43c03aab9b1b0fece054a379b8b3",
  "tokenId": "3",
  "student": {...},
  "school": {...}
}
```

---

### 6.4 GET /credentials/verify/:code - Verify Credential (PUBLIC)

**Purpose:** Public verification of credential by verifyCode

**Request:**
```
GET /credentials/verify/CRED-1773988014350-WYEFOK
```

**Expected Response (200):**
```json
{
  "id": "5c8095b8-bf45-4861-adfc-0c506d09d475",
  "name": "Cử nhân Công nghệ Thông tin",
  "description": "Hoàn thành chương trình đào tạo",
  "fileHash": "e28e07ea985ebe1fa7031368799c9c135782c49162528e073921f0437038c403",
  "status": "confirmed",
  "verifyCode": "CRED-1773988014350-WYEFOK",
  "txHash": "0x9085c1e31645b0f125f7bd199aa438b434ff43c03aab9b1b0fece054a379b8b3",
  "tokenId": "3",
  "classification": "Giỏi",
  "major": "Công nghệ phần mềm",
  "issuerName": "Đại học Bách Khoa",
  "issuedAt": "2026-03-20T06:27:04.087Z",
  "student": {
    "name": "Nguyễn Văn A",
    "email": "a.nguyenvan@example.com",
    "studentCode": "SV001"
  },
  "school": {
    "name": "Đại học Bách Khoa",
    "walletAddress": "0xA30EEbA7AD3712fDf080b0C2aadB5906B05347E7"
  }
}
```

**Test Steps:**
1. Send GET request with verifyCode
2. Verify all credential information is returned
3. Verify student and school information is included

---

### 6.5 PATCH /credentials/:id/revoke - Revoke Credential

**Purpose:** Revoke a credential (cannot be undone)

**Request:**
```
PATCH /credentials/:id/revoke
Authorization: Bearer <school_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Đã thu hồi văn bằng",
  "status": "revoked"
}
```

**Test Steps:**
1. Login as School Admin (owner of credential)
2. Send PATCH request to revoke
3. Verify status changes to "revoked"
4. Verify credential cannot be restored

---

### 6.6 GET /credentials/student/:studentId - Get Student Credentials

**Purpose:** Get all credentials of a specific student

**Request:**
```
GET /credentials/student/:studentId
```

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "...",
      "name": "Cử nhân Công nghệ Thông tin",
      "status": "confirmed",
      ...
    }
  ]
}
```

---

### 6.7 GET /credentials/school/:schoolId - Get School Credentials

**Purpose:** Get all credentials of a specific school

**Request:**
```
GET /credentials/school/:schoolId
Authorization: Bearer <school_token>
```

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "...",
      "name": "Cử nhân Công nghệ Thông tin",
      "status": "confirmed",
      ...
    }
  ]
}
```

---

## 7. REGISTRATION REQUEST APIs

### 7.1 POST /registration-requests - Create Registration Request

**Purpose:** Register a new School or Student

**School Registration Request:**
```
POST /registration-requests
Content-Type: application/json

{
  "walletAddress": "0x1111222233334444555566667777888899990000",
  "type": "school",
  "name": "Admin Name",
  "email": "admin@dhmoi.edu.vn",
  "schoolName": "Đại học Mới"
}
```

**Expected Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "walletAddress": "0x1111222233334444555566667777888899990000",
    "type": "school",
    "status": "pending",
    "name": "Admin Name",
    "email": "admin@dhmoi.edu.vn",
    "schoolName": "Đại học Mới",
    "schoolId": null,
    "school": null
  },
  "message": "Yêu cầu đăng ký đã được gửi. Vui lòng chờ duyệt."
}
```

**Student Registration Request:**
```
POST /registration-requests
Content-Type: application/json

{
  "walletAddress": "0x1111222233334444555566667777888899990001",
  "type": "student",
  "name": "Student Name",
  "email": "student@dhmoi.edu.vn",
  "schoolId": "<SCHOOL_ID>",
  "studentCode": "SV123"
}
```

---

### 7.2 GET /registration-requests - List Registration Requests

**Purpose:** Get list of registration requests

**Request:**
```
# Super Admin: View all school registrations
GET /registration-requests?type=school
Authorization: Bearer <admin_token>

# School Admin: View student registrations for their school
GET /registration-requests?type=student
Authorization: Bearer <school_token>
```

**Expected Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "walletAddress": "0x111...",
      "type": "school",
      "status": "pending",
      "schoolName": "Đại học Mới",
      "schoolId": null,
      "school": null
    }
  ]
}
```

---

### 7.3 GET /registration-requests/:id - Get Registration Details

**Purpose:** Get detailed information of a registration request

**Request:**
```
GET /registration-requests/:id
```

**Expected Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "walletAddress": "0x111...",
    "type": "school",
    "status": "pending",
    "schoolName": "Đại học Mới",
    "schoolId": null
  }
}
```

---

### 7.4 PATCH /registration-requests/:id/approve - Approve Registration

**Purpose:** Approve a registration request

**Approve School (Super Admin only):**
```
PATCH /registration-requests/:id/approve
Authorization: Bearer <admin_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Đã duyệt yêu cầu",
  "school": {
    "id": "uuid",
    "name": "Đại học Mới",
    "walletAddress": "0x111..."
  },
  "data": {
    "id": "...",
    "status": "approved",
    "schoolId": "uuid"
  }
}
```

**Approve Student (School Admin only):**
```
PATCH /registration-requests/:id/approve
Authorization: Bearer <school_token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Đã duyệt yêu cầu",
  "student": {
    "id": "uuid",
    "name": "Student Name"
  },
  "data": {
    "id": "...",
    "status": "approved"
  }
}
```

---

### 7.5 PATCH /registration-requests/:id/reject - Reject Registration

**Purpose:** Reject a registration request

**Request:**
```
PATCH /registration-requests/:id/reject
Authorization: Bearer <token>
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Đã từ chối yêu cầu",
  "data": {
    "id": "...",
    "status": "rejected"
  }
}
```

---

## 8. Test Scenarios

### 8.1 Full School Registration Flow
1. School creates registration request (POST /registration-requests)
2. Super Admin views pending requests (GET /registration-requests?type=school)
3. Super Admin approves request (PATCH /registration-requests/:id/approve)
4. School can now login with wallet (POST /auth/login/wallet)

### 8.2 Full Student Registration Flow
1. School Admin creates student registration request (POST /registration-requests)
2. School Admin approves request (PATCH /registration-requests/:id/approve)
3. Student can now login with wallet (POST /auth/login/wallet)

### 8.3 Full Credential Issuance Flow
1. School Admin creates student (POST /students)
2. School Admin creates credential (POST /credentials with PDF)
3. System auto-mints token on blockchain
4. Status changes: pending → issued → confirmed
5. Anyone can verify credential (GET /credentials/verify/:code)

### 8.4 Credential Revocation Flow
1. School Admin revokes credential (PATCH /credentials/:id/revoke)
2. Status changes to "revoked"
3. Credential cannot be restored

---

## 9. Notes

### 9.1 Authentication
- All authenticated endpoints require `Authorization: Bearer <token>` header
- Tokens are valid for 7 days
- Super Admin: Can manage all schools and students
- School Admin: Can only manage their own school's students and credentials

### 9.2 Vietnamese Characters
- Ensure UTF-8 encoding for Vietnamese text
- All names, descriptions should display correctly

### 9.3 File Upload
- POST /credentials requires PDF file upload
- Maximum file size depends on server configuration
- File is hashed and uploaded to IPFS

### 9.4 Blockchain Processing
- After creating credential, wait 5-10 seconds
- Status will automatically change to "confirmed"
- txHash and tokenId will be populated

### 9.5 Status Values

**Credential Status:**
- pending: Waiting to be minted
- issued: Currently being minted
- confirmed: Successfully minted on blockchain
- revoked: Revoked by school
- expired: Past expiry date

**Student Status:**
- active: Active student
- inactive: Inactive student
- graduated: Graduated student

**Registration Status:**
- pending: Waiting for approval
- approved: Approved
- rejected: Rejected

---

## 10. Test Report Template

| Test ID | API | Method | Test Description | Expected | Actual | Status | Notes |
|---------|-----|--------|------------------|----------|--------|--------|-------|
| TC-001 | /auth/login | POST | Valid login | 200 + token | | | |
| TC-002 | /auth/login | POST | Invalid password | 401 | | | |
| TC-003 | /credentials | POST | Create credential | 201 + pending | | | |
| ... | | | | | | | |

**Status:** PASS / FAIL / BLOCKED / SKIPPED
