# 🏋️ Gym Management System - Business Process Analysis

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT"/>
  <img src="https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=mui&logoColor=white" alt="MUI"/>
</p>

> 🎯 **Business Analysis & System Design Project** - Đồ án phân tích thiết kế hệ thống quản lý phòng gym, áp dụng các nguyên lý: RBAC, workflow automation, data integration.

---

## 📋 Mục lục

- [🎯 Tổng quan hệ thống](#-tổng-quan-hệ-thống)
- [🏗️ Kiến trúc hệ thống](#️-kiến-trúc-hệ-thống)
- [📊 Database Schema & ERD](#-database-schema--erd)
- [🔐 Phân quyền người dùng (RBAC)](#-phân-quyền-người-dùng-rbac)
- [🚀 Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [🧪 Tài khoản test](#-tài-khoản-test)
- [📡 API Documentation](#-api-documentation)
- [💼 Business Process Analysis](#-business-process-analysis)
- [🛠️ Công nghệ sử dụng](#️-công-nghệ-sử-dụng)

---

## 🎯 Tổng quan hệ thống

**Gym Management System** là một hệ thống quản lý phòng gym/fitness center với đầy đủ các module nghiệp vụ:

| Module | Chức năng chính | Business Value |
|--------|----------------|--------------|
| 👥 **User Management** | Quản lý tài khoản Admin, Lễ tân, HLV, Khách hàng | RBAC - Role Based Access Control |
| 🏃 **Customer Management** | Thông tin khách hàng, gói tập, ngày hết hạn | CRM cơ bản |
| 💪 **Trainer Management** | Hồ sơ HLV, chuyên môn, lịch làm việc | Resource Planning |
| 📅 **Service Registration** | Đăng ký dịch vụ, phân công HLV, lịch tập | Booking & Scheduling |
| 🏋️ **Equipment Management** | Quản lý thiết bị, trạng thái, vị trí | Asset Management |
| 🔧 **Maintenance** | Lịch bảo trì, lịch sử sửa chữa | Preventive Maintenance |
| 📊 **Reports** | Báo cáo doanh thu, tình trạng thiết bị | BI Dashboard |
| 📰 **News** | Quản lý tin tức, thông báo | Content Management |

---

## 🏗️ Kiến trúc hệ thống

### 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     🎨 Frontend (React.js)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │  Admin UI   │ │Receptionist │ │    Customer Portal  │  │
│  │  (Manager)  │ │   (Lễ tân)  │ │                     │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │   Trainer   │ │  Customer   │                           │
│  │   Portal    │ │   Portal    │                           │
│  └─────────────┘ └─────────────┘                           │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────▼────────────────────────────────────┐
│                  🔧 Backend (Node.js/Express)                 │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Routes     │ │Controllers  │ │   Middlewares       │   │
│  │  (API Layer) │ │(Business)   │ │ (Auth/Validation)   │   │
│  └──────────────┘ └─────────────┘ └─────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────────┐
│              🗄️ Database (MongoDB)                           │
│         gym-management (Database)                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  users   │ │customers │ │ trainers │ │services  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │equipment │ │maintenanc│ │ workSched│ │   news   │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema & ERD

### 🗂️ Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (Base Entity)                          │
├─────────────────────────────────────────────────────────────────────┤
│ _id (PK)      │ username   │ password    │ email       │ fullName    │
│ phoneNumber   │ role (FK)  │ active      │ profileImage│ timestamps  │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
┌───────────────┐   ┌───────────────┐
│   TRAINER     │   │   CUSTOMER    │
├───────────────┤   ├───────────────┤
│ _id (PK)      │   │ _id (PK)      │
│ user (FK)     │   │ user (FK)     │
│ specializations│  │ membershipType│
│ experience    │   │ startDate     │
│ certifications│   │ endDate       │
│ availability  │   │ assignedTrainer│
│ customers[]   │◄──┤   (FK)        │
│ rating        │   │ healthInfo    │
└───────┬───────┘   │ goals[]       │
        │           └───────┬───────┘
        │                   │
        │         ┌─────────┴──────────┐
        │         │                    │
        │         ▼                    ▼
        │  ┌───────────────┐   ┌───────────────┐
        │  │WORK_SCHEDULE  │   │SERVICE_REGISTR│
        │  ├───────────────┤   ├───────────────┤
        │  │ _id (PK)      │   │ _id (PK)      │
        └──┤ trainer (FK)   │◄──┤ workSchedule  │
           │ dayOfWeek     │   │ customer (FK) │
           │ startTime     │   │ trainer (FK)  │
           │ endTime       │   │ service (FK) │
           │ isAvailable   │   │ status        │
           └───────────────┘   │ totalPrice   │
                               └───────────────┘
                                        │
                                        │
                                        ▼
                              ┌───────────────┐
                              │    SERVICE    │
                              ├───────────────┤
                              │ _id (PK)      │
                              │ name          │
                              │ description   │
                              │ price         │
                              │ duration      │
                              │ category      │
                              │ isActive      │
                              └───────────────┘

┌───────────────┐   ┌───────────────┐
│  EQUIPMENT    │   │  MAINTENANCE  │
├───────────────┤   ├───────────────┤
│ _id (PK)      │   │ _id (PK)      │
│ name          │   │ equipment (FK) │
│ type          │   │ type          │
│ serialNumber  │   │ scheduledDate │
│ status        │   │ completedDate │
│ purchaseDate  │   │ status        │
│ warrantyEnd   │   │ cost          │
│ cost          │   │ description   │
│ location      │   │ parts[]       │
│ lastMaintDate │──►│               │
│ nextMaintDate │   │               │
└───────────────┘   └───────────────┘

┌───────────────┐   ┌───────────────┐
│     NEWS      │   │   FEEDBACK    │
├───────────────┤   ├───────────────┤
│ _id (PK)      │   │ _id (PK)      │
│ title         │   │ customer (FK) │
│ content       │   │ content       │
│ author (FK)   │   │ rating        │
│ category      │   │ isRead        │
│ featured      │   │ timestamps    │
│ viewCount     │   │               │
└───────────────┘   └───────────────┘
```

### 🔗 Relationships

| Entity 1 | Relationship | Entity 2 | Description |
|----------|-------------|----------|-------------|
| **User** | 1:1 | **Trainer** | Mỗi HLV là một User với role='trainer' |
| **User** | 1:1 | **Customer** | Mỗi khách hàng là một User với role='customer' |
| **Trainer** | 1:N | **Customer** | Một HLV có thể phụ trách nhiều khách hàng |
| **Trainer** | 1:N | **WorkSchedule** | Một HLV có nhiều khung giờ làm việc |
| **Customer** | 1:N | **ServiceRegistration** | Một khách hàng đăng ký nhiều dịch vụ |
| **Service** | 1:N | **ServiceRegistration** | Một dịch vụ được đăng ký bởi nhiều người |
| **Equipment** | 1:N | **Maintenance** | Một thiết bị có nhiều lịch bảo trì |
| **User** | 1:N | **News** | Một user viết nhiều tin tức |
| **Customer** | 1:N | **Feedback** | Một khách hàng gửi nhiều feedback |

---

## � Use Cases & Functional Requirements

### 🎯 12 Chức năng chính của hệ thống

| STT | Chức năng | Mô tả | Actor |
|-----|-----------|-------|-------|
| 1 | **Đăng ký tài khoản** | Quản lý, nhân viên lễ tân được cấp tài khoản cho khách hàng, huấn luyện viên | Admin, Receptionist |
| 2 | **Đăng nhập** | Người dùng đăng nhập vào hệ thống theo các vai trò: KH, HLV, Lễ tân, Admin | All |
| 3 | **Đăng ký dịch vụ** | Cho phép khách hàng lựa chọn HLV, lịch tập phù hợp. Hệ thống hỗ trợ tìm kiếm, lọc HLV theo chuyên môn, kinh nghiệm | Customer |
| 4 | **Đánh giá và phản hồi** | Khách hàng đánh giá dịch vụ, phản hồi chất lượng tập luyện | Customer |
| 5 | **Quản lý dịch vụ cá nhân** | Cho phép HLV quản lý lịch làm việc, gói tập mình cung cấp, khách hàng đang theo học | Trainer |
| 6 | **Quản lý khách hàng** | Bao gồm thêm, sửa, xóa, xem thông tin khách hàng, gia hạn gói tập, danh sách dịch vụ từng KH | Admin, Receptionist |
| 7 | **Quản lý dịch vụ khách hàng** | Các công việc liên quan đến quản lý dịch vụ của khách hàng đang mua như: gia hạn, ngày đăng ký, lịch tập của HLV | Admin, Receptionist |
| 8 | **Quản lý huấn luyện viên** | Bao gồm thêm, sửa, xóa thông tin HLV, xem thông tin về ca làm việc của HLV, các dịch vụ của HLV đang đảm nhận | Admin, Receptionist |
| 9 | **Quản lý nhân viên** | Bao gồm các công việc thêm, sửa, xóa thông tin, bộ phận/chức vụ của nhân viên đang làm việc tại phòng | Admin |
| 10 | **Quản lý cơ sở vật chất** | Cập nhật, theo dõi tình trạng thiết bị. Cho phép lên lịch bảo trì định kỳ | Admin, Receptionist |
| 11 | **Xem báo cáo thống kê** | Quản trị viên có thể xem báo cáo doanh thu, thống kê KH theo gói tập, lịch tập, KH hết hạn | Admin |
| 12 | **Quản lý đăng tin** | Quản trị viên và lễ tân đăng tin tức, khuyến mãi để thông báo đến KH và HLV | Admin, Receptionist |

---

## � Phân quyền người dùng (RBAC)

### 👑 Role-Based Access Control

| Chức năng | 👨‍💼 Admin (Manager) | 👩‍💼 Receptionist (Lễ tân) | 💪 Trainer (HLV) | 🧑 Customer (KH) |
|-----------|:---------------------:|:--------------------------:|:----------------:|:----------------:|
| **Dashboard** | ✅ Full Access | ✅ View Only | ✅ Personal | ✅ Personal |
| **User Management** | ✅ CRUD All | ✅ Create Customer/Trainer | ❌ | ❌ |
| **Customer Management** | ✅ CRUD | ✅ CRUD | ✅ View Assigned | ❌ View Self |
| **Trainer Management** | ✅ CRUD | ✅ View | ✅ View/Edit Self | ✅ View |
| **Service Management** | ✅ CRUD | ✅ View | ✅ View | ✅ View |
| **Service Registration** | ✅ CRUD All | ✅ Create/Edit | ✅ Approve/Reject | ✅ Create Self |
| **Equipment** | ✅ CRUD | ✅ View | ❌ | ❌ |
| **Maintenance** | ✅ CRUD | ✅ View | ❌ | ❌ |
| **Work Schedule** | ✅ CRUD | ✅ View/Edit | ✅ View Self | ✅ View |
| **Reports** | ✅ Full Reports | ✅ Basic Reports | ❌ | ❌ |
| **News** | ✅ CRUD | ✅ View | ✅ View | ✅ View |
| **Feedback** | ✅ CRUD | ✅ View/Response | ✅ View | ✅ Create Self |

### 🔑 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Login    │────►│   Backend   │────►│   Verify    │
│  Credentials│     │   /login    │     │  Password   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                         ┌──────────────────────┘
                         │
                         ▼
               ┌─────────────────┐
               │  Generate JWT   │
               │  (24h expiry)   │
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │  Return Token   │
               │  + User Info    │
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │  Store Token    │
               │  localStorage   │
               └─────────────────┘
```

---

## 🚀 Hướng dẫn cài đặt

### 📋 Yêu cầu hệ thống

| Component | Version | Description |
|-----------|---------|-------------|
| Node.js | ≥ 14.x | JavaScript Runtime |
| MongoDB | ≥ 4.x | NoSQL Database |
| npm/yarn | Latest | Package Manager |

### 🛠️ Bước 1: Clone & Cài đặt Backend

```bash
# Clone repository
git clone [repository-url]
cd Family-Gym-Management-System-main/backend

# Cài đặt dependencies
npm install

# Cấu hình môi trường
cp .env.example .env

# Edit .env file:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/gym-management
# JWT_SECRET=your_secure_jwt_secret
```

### 🛠️ Bước 2: Cài đặt MongoDB

#### Option A: Local MongoDB
```bash
# Windows - MongoDB as Service
net start MongoDB

# Hoặc chạy trực tiếp
mongod --dbpath D:\MongoDB\data --port 27017
```

#### Option B: MongoDB Atlas (Cloud)
```bash
# Cập nhật .env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gym-management
```

### 🛠️ Bước 3: Seed Database

```bash
# Tạo tài khoản test
node seed-users.js

# Hoặc tạo admin mặc định
node create-admin.js
```

### 🛠️ Bước 4: Khởi động Backend

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server chạy tại: `http://localhost:5000`

### 🛠️ Bước 5: Cài đặt Frontend

```bash
cd ../frontend

# Cài đặt dependencies
npm install

# Khởi động React app
npm start
```

Frontend chạy tại: `http://localhost:3000`

---

## 🧪 Tài khoản test

### 🔑 Test Accounts (Mật khẩu: `111222`)

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| 👨‍💼 **Admin** | `Manager` | `111222` | Full system access |
| 👩‍💼 **Receptionist** | `letan1` | `111222` | Customer & Service management |
| 💪 **Trainer** | `vanbhlv` | `111222` | Schedule & Customer view |
| 🧑 **Customer** | `nguyenvana` | `111222` | Personal dashboard only |

### 🧰 Test Scripts

```bash
# Kiểm tra đăng nhập tất cả tài khoản
cd backend/tests
./check-all.bat

# Hoặc chạy Node.js test
node test-login-all.js
```

---

## 📡 API Documentation

### 🔐 Authentication API

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/login` | Đăng nhập | ❌ |
| `POST` | `/api/auth/register` | Đăng ký user | ✅ Admin/Receptionist |
| `GET` | `/api/auth/me` | Lấy thông tin user hiện tại | ✅ |

### 👥 User API

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `GET` | `/api/users` | Lấy danh sách users | Admin |
| `GET` | `/api/users/:id` | Chi tiết user | Admin/Self |
| `PUT` | `/api/users/:id` | Cập nhật user | Admin/Self |
| `DELETE` | `/api/users/:id` | Xóa user | Admin |

### 🏋️ Service API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/services` | Lấy danh sách dịch vụ |
| `POST` | `/api/services` | Tạo dịch vụ mới |
| `PUT` | `/api/services/:id` | Cập nhật dịch vụ |
| `DELETE` | `/api/services/:id` | Xóa dịch vụ |

### 📅 Service Registration API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/service-registrations` | Lấy danh sách đăng ký |
| `POST` | `/api/service-registrations` | Đăng ký dịch vụ mới |
| `PUT` | `/api/service-registrations/:id/approve` | Phê duyệt đăng ký |
| `PUT` | `/api/service-registrations/:id/reject` | Từ chối đăng ký |

### 🏋️ Equipment API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/equipment` | Lấy danh sách thiết bị |
| `POST` | `/api/equipment` | Thêm thiết bị mới |
| `PUT` | `/api/equipment/:id` | Cập nhật thiết bị |
| `GET` | `/api/equipment/:id/maintenance` | Lịch bảo trì |

---

## 💼 Business Process Analysis

### 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS PROCESS FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Customer]                                                     │
│      │                                                         │
│      ▼                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │  Đăng ký tập    │───►│ Chọn dịch vụ    │───►│ Thanh toán  │  │
│  │  (Receptionist) │    │ (Service Reg)   │    │             │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│           │                                              │      │
│           ▼                                              ▼      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │ Phân công HLV  │◄───│  Lịch tập        │◄───│ Xác nhận    │  │
│  │ (Trainer)      │    │  (WorkSchedule)  │    │             │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│           │                                              │      │
│           ▼                                              ▼      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │ Theo dõi tiến  │───►│  Hoàn thành     │───►│ Đánh giá    │  │
│  │ độ tập luyện   │    │  (Completed)     │    │ (Feedback)  │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                          EQUIPMENT LIFECYCLE                    │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│  │  Mua     │──►│ Sử dụng  │──►│Bảo trì   │──►│Thanh lý  │   │
│  │  mới     │   │          │   │định kỳ   │   │          │   │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   │
│       │                              ▲              │          │
│       └──────────────────────────────┘              │          │
│         (Cập nhật trạng thái sau mỗi bảo trì)       │          │
│                                                     │          │
└─────────────────────────────────────────────────────────────────┘

### 📊 Activity Diagrams (BPMN)

#### 📝 Quy trình Đăng ký Dịch vụ (Slide 15)

```
[Start] → Khách hàng chọn dịch vụ → Tìm/lọc HLV
   → Chọn HLV và ca tập → Thanh toán
   → Hệ thống xác nhận → [End]
```

#### 🔧 Quy trình Quản lý Thiết bị (Slide 19)

```
[Start] → Quản trị viên chọn thiết bị
   → Cập nhật info hoặc lên lịch bảo trì
   → Cần bảo trì? 
      ├─ Yes → Nhập thông tin bảo trì
      └─ No  → Cập nhật trạng thái
   → Hệ thống lưu thông tin → [End]
```

### 🔄 Sequence Diagrams

**Luồng tương tác Đăng ký Dịch vụ:**

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Khách   │    │  Giao    │    │  Hệ      │    │  Database │
│  hàng    │    │  diện    │    │  thống   │    │           │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │──1. Chọn─────►│               │               │
     │   dịch vụ     │               │               │
     │               │──2. Yêu cầu──►│               │
     │               │   tìm HLV     │               │
     │               │               │──3. Truy vấn──►│
     │               │               │   HLV         │
     │               │               │◄──4. Trả──────│
     │               │               │   kết quả     │
     │◄──5. Hiển─────│◄──6. Trả───────│               │
     │   thị danh    │   kết quả     │               │
     │   sách HLV    │               │               │
└────┴─────┘    └────┴─────┘    └────┴─────┘    └────┴─────┘
```

### 📈 Chỉ số Kinh doanh Quan trọng

| Chỉ số | Cách tính | API Endpoint |
|--------|-----------|--------------|
| **Khách hàng đang hoạt động** | Đếm khách có membership còn hạn | `/api/reports/customers/active` |
| **Doanh thu tháng** | Tổng tiền từ đăng ký đã hoàn thành | `/api/reports/revenue/monthly` |
| **Tỷ lệ sử dụng thiết bị** | Số thiết bị đang dùng / Tổng số | `/api/reports/equipment/status` |
| **Khối lượng công việc HLV** | Trung bình số buổi/HLV | `/api/reports/trainers/workload` |
| **Tỷ lệ giữ chân khách** | (Mới - Rời đi) / Tổng * 100 | `/api/reports/customers/retention` |

### 🔄 Tự động hóa Hệ thống

Hệ thống tự động chạy các tác vụ theo lịch:

| Tần suất | Tác vụ | Chức năng |
|----------|--------|-----------|
| ⏰ **Hàng ngày** | Kiểm tra membership hết hạn | Tự động vô hiệu hóa tài khoản quá hạn |
| 📧 **Hàng tuần** | Gửi email nhắc nhở | Thông báo khách hàng sắp hết hạn gói tập |
| 🔧 **Hàng tháng** | Lập lịch bảo trì | Tạo reminder bảo trì định kỳ thiết bị |

---

## 🛠️ Công nghệ sử dụng

### 🏢 Backend Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | ≥ 14.x |
| **Express.js** | Web Framework | ^4.x |
| **MongoDB** | Database | ≥ 4.x |
| **Mongoose** | ODM (Object Document Mapper) | ^6.x |
| **JWT** | Authentication | ^9.x |
| **Bcryptjs** | Password Hashing | ^2.x |
| **Multer** | File Upload | ^1.x |
| **Express-Validator** | Input Validation | ^6.x |
| **CORS** | Cross-Origin Resource Sharing | ^2.x |

### 🎨 Frontend Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React.js** | UI Library | ^18.x |
| **Material-UI (MUI)** | Component Library | ^5.x |
| **React Router DOM** | Routing | ^6.x |
| **Axios** | HTTP Client | ^1.x |
| **Context API** | State Management | Native |
| **Date-fns** | Date Manipulation | ^2.x |
| **Recharts** | Charts & Graphs | ^2.x |
| **Formik** | Form Management | ^2.x |
| **Yup** | Form Validation | ^0.x |

---

### 🚀 Deployment

#### Docker (Optional)
```dockerfile
# Dockerfile.backend
FROM node:14-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

#### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection | `mongodb://localhost:27017/gym-management` |
| `JWT_SECRET` | JWT signing key | `your-secret-key-here` |
| `NODE_ENV` | Environment mode | `development` / `production` |

---

<p align="center">
  <b>🌟 Built with passion for Business Analysis & System Design 🌟</b><br>
  <i>Phù hợp cho vị trí: Business Analyst | System Analyst | ERP Implementation Analyst</i>
</p>

<p align="center">
  <a href="#-gym-management-system---business-process-analysis">⬆️ Back to Top</a>
</p>
