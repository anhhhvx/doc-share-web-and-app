# Document Sharing Platform

## 1. Main Features

### Website
- User registration, login, logout, and role-based access for Admin and User.
- Document listing, search, category filtering, detail pages, upload, download, and Google Drive links.
- Public comments and 1–5 star ratings.
- Contact form and promotional popup controlled by cookies.
- Admin dashboard for website statistics (views), content, documents, comments, users, and contact messages.
- Responsive interface for desktop, tablet, and mobile devices.

### Mobile App
- React Native application built with Expo.
- Connects to the website through REST APIs.
- Main document screen, login/register screen, document detail screen, comment/rating form, and contact screen.
- Local login-session storage with AsyncStorage.

## 2. Completion Status

The main website and mobile requirements are completed and connected to MongoDB. Authentication, document display, comments, ratings, contact forms, administration, responsive layouts, and mobile API communication are operational. Final testing is still required for different devices, network environments, and edge cases.

## 3. Team Responsibilities

Dưới đây là chi tiết phân công công việc của hai thành viên trong từng tác vụ và mức độ hoàn thành dự án:

### 3.1. Bảng Phân Chia Công Việc (Website & Mobile App)

| Hạng mục / Yêu cầu | Phân công công việc & Chi tiết thực hiện | Mức độ hoàn thiện |
| :--- | :--- | :---: |
| **A. WEBSITE (WEB BACKEND & VIEWS)** | | |
| 1. Lưu trữ dữ liệu bằng database | **Vũ Xuân Anh**: Thiết lập database MongoDB local, kết nối thông qua Mongoose với 6 schemas chi tiết (User, Category, Document, Comment, Contact, Site). **Nguyễn Diệu My**: Chuẩn bị Sample Data | **100%** |
| 2. Đăng nhập, đăng xuất (username/password, phân quyền admin/user) | **Vũ Xuân Anh**: Xây dựng logic session-based auth, mã hóa bcrypt, viết API và phân quyền Admin/User. **Nguyễn Diệu My**: Thiết kế giao diện form Đăng nhập/Đăng ký, định dạng CSS, kết nối Javascript client-side và kiểm thử chức năng | **100%** |
| 3. Trang hiển thị nội dung theo mã (chi tiết tài liệu) | **Vũ Xuân Anh**: Xử lý route, truy vấn dữ liệu tài liệu từ MongoDB, render view chi tiết tài liệu học tập. **Nguyễn Diệu My**: Thiết kế layout giao diện, định dạng CSS cho trang chi tiết, kiểm thử hiển thị tài liệu | **100%** |
| + Form bình luận và đánh giá | **Vũ Xuân Anh**: Xây dựng API và router lưu trữ bình luận, số sao đánh giá vào collection Mongoose. **Nguyễn Diệu My**: Thiết kế form bình luận trực quan, xử lý sự kiện click chọn sao bằng JS, định dạng CSS và kiểm thử tính năng | **100%** |
| + Hiển thị bình luận công khai | **Vũ Xuân Anh**: Viết API kết xuất danh sách bình luận đã duyệt từ MongoDB. **Nguyễn Diệu My**: Thiết kế khu vực hiển thị bình luận công khai dưới tài liệu, định dạng CSS và test hiển thị | **100%** |
| 4. Popup quảng cáo tự động sau 1 phút | **Vũ Xuân Anh**: Viết logic Javascript client-side tự động hiển thị popup sau 60 giây ở trang chủ. **Nguyễn Diệu My**: Thiết kế giao diện hộp thoại popup, viết CSS định dạng và căn giữa màn hình, kiểm thử chức năng popup | **100%** |
| + Đóng popup không hiện lại (dùng cookie) | **Vũ Xuân Anh**: Thiết lập ghi nhận cookie lưu trạng thái đóng popup để ngăn hiển thị lại trong phiên làm việc. **Nguyễn Diệu My**: Thực hiện kiểm thử tính năng đóng popup trên nhiều trình duyệt, xóa cookie test lại | **100%** |
| 5. Trang giới thiệu và thông tin liên hệ | **Vũ Xuân Anh**: Xử lý backend lấy dữ liệu giới thiệu và thông tin liên hệ từ database MongoDB. **Nguyễn Diệu My**: Thiết kế giao diện trang, định dạng CSS, kiểm thử hiển thị thông tin giới thiệu | **100%** |
| + Form gửi ý kiến liên hệ | **Vũ Xuân Anh**: Xây dựng API và Schema liên hệ, tiếp nhận và lưu thông tin từ khách truy cập vào collection `contacts`. **Nguyễn Diệu My**: Thiết kế form liên hệ, viết CSS và Javascript kiểm tra biểu mẫu trước khi gửi, kiểm thử chức năng gửi liên hệ | **100%** |
| 6. Trang quản trị (Admin Dashboard) | **Vũ Xuân Anh**: Phát triển hệ thống route bảo mật cho Admin, viết API truy vấn quản lý dữ liệu người dùng, tài liệu, liên hệ. **Nguyễn Diệu My**: Thiết kế bố cục trang quản trị, định dạng CSS và kiểm thử phân quyền truy cập trang quản lý | **100%** |
| + Hiển thị số lượng view toàn bộ Website | **Vũ Xuân Anh**: Viết middleware theo dõi lượt truy cập, cập nhật và tính tổng lượt xem toàn trang web lưu trong DB. **Nguyễn Diệu My**: Thiết kế widget hiển thị số liệu thống kê lượt xem trên Dashboard, định dạng CSS và test độ khớp dữ liệu | **100%** |
| + Cập nhật thông tin các trang nội dung | **Vũ Xuân Anh**: Xây dựng các router và controller tiếp nhận dữ liệu cập nhật thông tin giới thiệu/popup từ Admin. **Nguyễn Diệu My**: Thiết kế biểu mẫu cập nhật dữ liệu trên Dashboard, định dạng CSS và kiểm thử lưu thay đổi thành công | **100%** |
| + Hiển thị danh sách, xóa bình luận | **Vũ Xuân Anh**: Viết các API lấy danh sách bình luận toàn hệ thống và thực hiện xóa bản ghi bình luận theo ID. **Nguyễn Diệu My**: Thiết kế bảng hiển thị danh sách bình luận trên Dashboard, viết JS gọi API xóa và làm mới giao diện, kiểm thử tính năng | **100%** |
| 7. Giao diện responsive (break 800px, 1200px) | **Nguyễn Diệu My**: Thiết lập chi tiết media queries, tinh chỉnh CSS trên di động/tablet, kiểm thử độ tương thích giao diện. **Vũ Xuân Anh**: Xây dựng khung CSS Grid/Flexbox và các breakpoint cơ bản | **100%** |
| 8. Thiết kế và trình bày giao diện (Web UI) | **Nguyễn Diệu My**: Phối màu, lựa chọn font chữ, viết và định dạng CSS toàn diện cho trang chủ, chi tiết, admin để đạt giao diện đẹp mắt. **Vũ Xuân Anh**: Thiết lập khung cấu trúc layout HTML thô và các thành phần chính | **100%** |
| 9. Tổ chức project (Web) | **Vũ Xuân Anh**: Thiết lập cấu trúc thư mục MVC chuẩn cho Node/Express, phân tách rõ ràng controllers, models, routes. **Nguyễn Diệu My**: Sắp xếp tài nguyên public (images, css, js), định dạng code và kiểm thử cấu trúc tổng thể | **100%** |
| 10. Không lạm dụng thư viện ngoài | **Cả hai**: Sử dụng HTML, CSS và JavaScript thuần trong dự án Website để tối ưu hiệu năng và kiểm soát mã nguồn tốt nhất | **Đạt** |
| **B. MOBILE APP (REACT NATIVE & EXPO)** | | |
| 1. Giao tiếp với website bằng API | **Vũ Xuân Anh**: Thiết lập CORS, cấu hình IP mạng LAN/Hotspot để thiết bị di động truy cập được API server, gỡ lỗi kết nối. **Nguyễn Diệu My**: Viết dịch vụ gọi API trong `services/api.js` để tích hợp gọi các REST API từ App di động | **100%** |
| 2. Màn hình chính (App) | **Vũ Xuân Anh**: Xử lý logic gọi API lấy danh sách tài liệu, tích hợp chức năng tìm kiếm và bộ lọc danh mục phía App. **Nguyễn Diệu My**: Thiết kế layout giao diện, định dạng phong cách CSS, viết component danh sách tài liệu và kiểm thử | **100%** |
| 3. Màn hình đăng nhập (App) | **Vũ Xuân Anh**: Phát triển chức năng đăng nhập, đăng ký phía App, quản thái và lưu phiên làm việc bền vững qua AsyncStorage. **Nguyễn Diệu My**: Thiết kế giao diện form nhập liệu, viết CSS định dạng và thực hiện kiểm thử khớp với giao diện | **100%** |
| 4. Màn hình hiển thị nội dung (App) | **Vũ Xuân Anh**: Xây dựng logic phân quyền xem tài liệu, chặn đọc tài liệu nếu chưa đăng nhập và tích hợp API lấy chi tiết tài liệu. **Nguyễn Diệu My**: Thiết kế màn hình hiển thị nội dung, định dạng CSS và kiểm thử chức năng xem tài liệu trên thiết bị | **100%** |
| + Bình luận và đánh giá nội dung | **Vũ Xuân Anh**: Tích hợp gọi API gửi bình luận và số sao đánh giá lên MongoDB từ App di động. **Nguyễn Diệu My**: Thiết kế form đánh giá sao trực quan và khu vực hiển thị bình luận trên App, định dạng CSS và kiểm thử | **100%** |
| 5. Màn hình ý kiến và liên hệ (App) | **Vũ Xuân Anh**: Phát triển API client gửi phản hồi, ý kiến khách hàng từ App di động lên cơ sở dữ liệu MongoDB. **Nguyễn Diệu My**: Thiết kế giao diện màn hình liên hệ và biểu mẫu đóng góp ý kiến, định dạng CSS và kiểm thử | **100%** |
| 6. Thiết kế và trình bày giao diện (App UI) | **Nguyễn Diệu My**: Thiết lập phong cách giao diện Clean UI đồng bộ với Web, phối màu, lựa chọn font chữ và định dạng CSS cho App. **Vũ Xuân Anh**: Tinh chỉnh giao diện di động tối giản, ẩn các icon dư thừa và căn chỉnh khoảng cách, chiều cao Bottom Tab Bar | **100%** |
| 7. Tổ chức project (App) | **Nguyễn Diệu My**: Tổ chức phân chia dự án khoa học thành các thư mục `screens/`, `components/`, `services/` để dễ bảo trì. **Vũ Xuân Anh**: Thiết lập môi trường dự án, cấu hình tệp tin gitignore và các biến môi trường cấu hình kết nối | **100%** |
| 8. Không lạm dụng thư viện ngoài | **Cả hai**: Sử dụng tối đa các thành phần Core Components của React Native, không lạm dụng thư viện UI bên ngoài | **Đạt** |

---

### 3.2. Các Phần Việc Bổ Sung Ngoài Yêu Cầu (Giá trị cộng thêm của Nhóm)

Để nâng cao trải nghiệm ứng dụng và tối ưu hóa quy trình kiểm thử, nhóm đã chủ động phát triển thêm các phần việc sau:

1. **Hệ thống nạp dữ liệu mẫu tự động (Auto Seed Data):**
   * *Thực hiện:* **Vũ Xuân Anh** và **Nguyễn Diệu My**
   * *Mô tả:* **Vũ Xuân Anh** thiết lập logic kết nối DB, kiểm tra và nạp dữ liệu mẫu tự động khi khởi động server; **Nguyễn Diệu My** chuẩn bị mẫu dữ liệu JSON chuẩn hóa và kiểm thử tính năng.
2. **Công cụ kết xuất cơ sở dữ liệu (`export-data.js`):**
   * *Thực hiện:* **Vũ Xuân Anh** và **Nguyễn Diệu My**
   * *Mô tả:* **Vũ Xuân Anh** viết script Node.js kết nối MongoDB và xuất tự động ra tệp JSON; **Nguyễn Diệu My** thiết lập thư mục đích `sample-data/` và kiểm thử tệp tin đầu ra.
3. **Hoàn thiện báo cáo và tài liệu dự án:**
   * *Thực hiện:* **Nguyễn Diệu My** và **Vũ Xuân Anh**
   * *Mô tả:* **Nguyễn Diệu My** chủ trì soạn thảo báo cáo tổng kết, viết chi tiết đặc tả trong `README.md`; **Vũ Xuân Anh** hỗ trợ cung cấp thông tin kỹ thuật, sơ đồ hệ thống.
4. **Cải tiến giao diện di động tối giản (Tối ưu hóa UI/UX di động):**
   * *Thực hiện:* **Vũ Xuân Anh** và **Nguyễn Diệu My**
   * *Mô tả:* **Vũ Xuân Anh** thực hiện chỉnh sửa ẩn icon, căn giữa nhãn và điều chỉnh tab bar; **Nguyễn Diệu My** kiểm thử giao diện di động trên Android/iOS đảm bảo khớp thiết kế.
5. **Xử lý Timeout và hướng dẫn cấu hình mạng trong mạng LAN/Hotspot:**
   * *Thực hiện:* **Cả nhóm (Vũ Xuân Anh, Nguyễn Diệu My)**
   * *Mô tả:* **Vũ Xuân Anh** tích hợp xử lý Timeout API trên App; **Nguyễn Diệu My** viết tài liệu hướng dẫn cấu hình tường lửa Windows và hotspot, kiểm thử kết nối.
## 4. Installation and Usage

### Requirements

- [Git](https://git-scm.com/install/) for cloning the repository.
- [Node.js](https://nodejs.org/en/download) for running the website and mobile project. npm is included with Node.js.
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) for the database.
- Expo Go or an Android/iOS emulator (ver 54)

### Clone Repository

```bash
git clone https://github.com/anhhhvx/doc-share-web-and-app.git
cd doc-share-web-and-app
```

### Sample Data (optional)

Prepared MongoDB data and sample uploaded files are available in the [`sample-data`](sample-data/) folder.

See the [sample data instructions](sample-data/README.md) for database restoration and usage. Restoring the sample database is optional because the project automatically initializes the basic data when it runs for the first time.

### Run the Website

```bash
cd doc-share-web
npm install
node app.js
```

Open:

```text
http://localhost:3000
```

Default administrator account:

```text
Username: admin
Password: 123456
```

### Run the Mobile App

The computer and phone must use the same network.

1. Update `doc-share-app/config.js` with the computer's local IPv4 address (use ipconfig to get the ipv4 - for example 172.20.10.3):

```js
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000';
```

2. Start the app:

```bash
cd doc-share-app
npm install
npx expo start
```

If the app cannot connect to the server, try switching the Windows network profile between Private and Public.

3. Open the app with Expo Go or an emulator through the QR code. 

### Note

The application was tested using Expo Go on both Android and iOS:
- Android: The laptop was connected to the phone's Personal Hotspot, and the Windows network profile was set to Private.
- iOS: We suscessfully tested with both Personal Hotspot and Normal Wifi, but the Windows network profile on the laptop need to be set to Public.
