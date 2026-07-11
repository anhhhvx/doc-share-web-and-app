# TÀI LIỆU TỔNG HỢP VÀ CHI TIẾT DỰ ÁN DOCUMENT SHARING PLATFORM
*(Hệ thống chia sẻ tài liệu học tập dành cho sinh viên)*

---

## I. TỔNG QUAN DỰ ÁN

Hệ thống **Document Sharing Platform** là một nền tảng Web & Mobile đồng bộ, được thiết kế để phục vụ nhu cầu lưu trữ, tìm kiếm, đánh giá và chia sẻ tài liệu học tập giữa các sinh viên. 

Dự án được phân tách làm hai phần chính:
1. **Thư mục `doc-share-web`**:
   * Đóng vai trò là **Backend Server** (Express API) kết nối cơ sở dữ liệu MongoDB.
   * Đóng vai trò là **Frontend Web Portal** hiển thị giao diện người dùng và toàn bộ hệ thống quản trị nội dung của Admin thông qua EJS.
2. **Thư mục `doc-share-app`**:
   * Ứng dụng di động dành cho người dùng được xây dựng trên nền tảng React Native / Expo Go, tương tác trực tiếp với Backend Web qua các RESTful API.

---

## II. KIẾN TRÚC VÀ CÔNG NGHỆ SỬ DỤNG

### 1. Kiến trúc hệ thống
Hệ thống hoạt động theo mô hình Client-Server đồng bộ:
* **Cơ sở dữ liệu (Database)**: Sử dụng **MongoDB** (NoSQL) lưu trữ toàn bộ thông tin tài khoản, danh mục, tài liệu, bình luận, ý kiến liên hệ và cấu hình chung.
* **Server-side Rendering (SSR)**: Sử dụng template engine **EJS** kết xuất giao diện trực tiếp từ máy chủ đối với các phiên kết nối Web.
* **REST API**: Cung cấp các đường truyền API định dạng JSON cho ứng dụng di động React Native.
* **Tải lên & Lưu trữ tệp vật lý (File Storage)**: Tệp tải lên được lưu trực tiếp tại thư mục `doc-share-web/uploads/` trên máy chủ và ánh xạ đường dẫn tĩnh thông qua Express.

### 2. Các thư viện và công nghệ cốt lõi
* **Node.js**: Nền tảng thực thi JavaScript phía máy chủ.
* **Express.js**: Web framework quản lý định tuyến (routing), xử lý middleware và phân chia phân quyền.
* **Mongoose**: Thư viện ODM (Object Data Modeling) hỗ trợ định nghĩa Schema và truy vấn MongoDB một cách nhất quán.
* **Bcrypt.js**: Mã hóa một chiều mật khẩu tài khoản người dùng bằng thuật toán băm (salt rounds) để bảo mật.
* **Express-session**: Quản lý phiên đăng nhập (Session-state) của người dùng trên nền tảng Website.
* **CSS Vanilla**: Xây dựng giao diện web tùy biến bằng lưới (CSS Grid) và hộp linh hoạt (Flexbox), kết hợp kính mờ (glassmorphism) sang trọng.

---

## III. CHI TIẾT CƠ SỞ DỮ LIỆU (DATABASE SCHEMAS)

Cơ sở dữ liệu được quản lý tập trung tại `lib/database.js` và chia thành 6 Collections chính trong MongoDB:

### 1. Người dùng (Users Collection - Model `User`)
* `id` (String - UUID): Khóa chính duy nhất đại diện cho tài khoản.
* `fullName` (String): Họ và tên đầy đủ.
* `email` (String): Email liên hệ.
* `phone` (String): Số điện thoại.
* `username` (String): Tên đăng nhập duy nhất.
* `password` (String): Mật khẩu đã băm qua Bcrypt.
* `role` (String): Vai trò tài khoản (`admin` hoặc `user`).
* `createdAt` / `updatedAt` (Date): Thời gian khởi tạo/cập nhật thông tin.

### 2. Danh mục tài liệu (Categories Collection - Model `Category`)
* `id` (String): Khóa duy nhất đại diện cho mã danh mục (ví dụ: `co-so-nganh`).
* `title` (String): Tên hiển thị của danh mục (ví dụ: `Cơ sở và cốt lõi ngành`).
* `subjects` (Array of Strings): Mảng danh sách các môn học trực thuộc danh mục đó.

### 3. Tài liệu (Documents Collection - Model `Document`)
* `id` (String - UUID): Khóa chính duy nhất của tài liệu.
* `title` (String): Tiêu đề tài liệu.
* `subject` (String): Tên môn học áp dụng.
* `categoryId` / `categoryName` (String): Liên kết đến danh mục cha.
* `description` (String): Mô tả ngắn gọn về tài liệu.
* `content` (String): Văn bản tóm tắt hoặc nội dung đầy đủ của tài liệu.
* `sourceType` (String): Định nghĩa loại nguồn tải lên (`file`, `google-drive` hoặc `both` - cả hai).
* `driveLink` (String): Liên kết Google Drive (nếu có).
* `originalFileName` / `storedFileName` (String): Tên tệp tin gốc và tên tệp tin vật lý đã mã hóa UUID trên máy chủ.
* `mimeType` (String): Định dạng tệp tin (`application/pdf`, `docx`, `pptx`).
* `fileSize` (Number): Kích thước tệp tin tính theo byte.
* `uploader` / `uploaderId` (String): Thông tin người đăng tải.
* `viewCount` (Number): Tổng số lượt xem tài liệu.

### 4. Bình luận (Comments Collection - Model `Comment`)
* `id` (String - UUID): Khóa chính duy nhất của bình luận.
* `documentId` / `documentTitle` (String): Định danh và tiêu đề tài liệu được bình luận.
* `userId` (String): Mã người dùng (nếu đã đăng nhập).
* `name` / `email` (String): Tên hiển thị và email người gửi bình luận.
* `content` (String): Nội dung đánh giá.
* `rating` (Number): Điểm đánh giá mức độ hài lòng từ 1 đến 5 sao.

### 5. Ý kiến liên hệ (Contacts Collection - Model `Contact`)
* `id` (String - UUID): Định danh của tin nhắn liên hệ.
* `name` / `email` (String): Thông tin liên lạc của người gửi.
* `message` (String): Nội dung phản hồi.

### 6. Cấu hình trang (Sites Collection - Model `Site`)
* `id` (String): Định danh mặc định (`default`).
* `stats`: Lưu trữ số lượt truy cập chung của toàn hệ thống (`totalViews`).
* `homeContent`: Lưu các chuỗi tiêu đề hero, văn bản mô tả giới thiệu, email/điện thoại liên hệ hiển thị ngoài trang chủ.
* `adPopup`: Lưu trữ trạng thái bật/tắt quảng cáo (`enabled`), nội dung hiển thị trong popup quảng cáo và liên kết của nút kêu gọi hành động (CTA).

---

## IV. CÁC TÍNH NĂNG CHÍNH VÀ CƠ CHẾ HOẠT ĐỘNG

### 1. Đăng ký & Đăng nhập (Authentication)
* **Phía Web**: Lưu trạng thái người dùng bằng `req.session.user` sau khi kiểm tra tên đăng nhập và mật khẩu băm thông qua thư viện `bcrypt`.
* **Phía App**: Thực hiện gửi yêu cầu POST đến `/api/login` hoặc `/api/register` và nhận dữ liệu JSON phản hồi về thông tin tài khoản thành công để lưu trữ cục bộ.

### 2. Tải lên tài liệu đồng thời (Upload Module)
* **Kích thước tăng cường**: Giới hạn kích thước tệp tải lên dưới 100MB để phục vụ cho các tài liệu nặng hoặc tài liệu chứa nhiều slide hình ảnh.
* **Cơ chế Base64**: Phía Client (`public/js/upload.js`) sử dụng FileReader API đọc tệp tin được chọn thành chuỗi Base64 và điền vào thẻ ẩn `<input id="fileData">`. Khi nhấn submit, form sẽ đóng gói chuỗi này kèm thông tin tiêu đề, mô tả và tải lên thông qua giao thức POST HTTP thông thường mà không cần cấu hình đa định dạng truyền thống phức tạp (Multipart/form-data).
* **Upload đồng thời**: Cho phép người dùng chọn upload tệp vật lý trực tiếp, hoặc chèn link Google Drive, hoặc đăng tải **đồng thời cả hai**. Hệ thống sẽ kiểm tra và chỉ báo lỗi khi cả tệp và link đều để trống. Nếu đăng cả hai, document detail sẽ hiển thị song song hai nút tải tệp và mở liên kết.

### 3. Bộ lọc và tìm kiếm linh hoạt (Search & Filtering)
* Trên trang danh sách tài liệu (`/documents` hoặc API `/api/documents`), hệ thống tiến hành kiểm tra lọc thông tin theo danh mục được chỉ định và tìm kiếm từ khóa không dấu/có dấu trong toàn bộ tiêu đề, mô tả, nội dung và môn học.

### 4. Popup quảng cáo thông minh (Smart Promotional Popup)
* Khi người dùng truy cập trang chủ lần đầu, một bộ đếm ngược 1 phút (60000ms) sẽ được khởi động thông qua `public/js/ad-popup.js`.
* Sau 1 phút, popup quảng cáo thiết lập trong Admin sẽ trượt lên mượt mà.
* Khi người dùng nhấn nút đóng (x), hệ thống sẽ lưu một Cookie tên `docshare_promo_closed` có hiệu lực trong vòng 365 ngày (1 năm). Khi có cookie này trên máy khách, popup quảng cáo sẽ hoàn toàn bị ẩn đi trong các lần truy cập tiếp theo.

### 5. Cơ chế đếm số lượt xem (View Counting Mechanism)
Hệ thống quản lý và cập nhật lượt tương tác thông qua cơ chế đếm tự động lưu vào cơ sở dữ liệu MongoDB:
* **Tổng lượt xem Website (Site Views)**:
  * Được vận hành bởi Express Middleware `trackSiteView` trong `app.js` gắn kèm các route truy cập GET chính (Trang chủ, Liên hệ, Xem tài liệu, Admin,...).
  * Mỗi khi người dùng tải trang, Middleware này gọi hàm `incrementSiteViews()` để cập nhật trường `totalViews` trong Collection `Site` của MongoDB bằng toán tử `$inc` của Mongoose.
* **Lượt xem từng Tài liệu (Document Views)**:
  * Khi người dùng truy cập trang chi tiết tài liệu trên Web (`GET /documents/:id`) hoặc thông qua ứng dụng di động (`GET /api/documents/:id`), máy chủ sẽ gọi hàm `incrementDocumentView(id)`.
  * Hàm này tăng giá trị thuộc tính `viewCount` trong bản ghi tài liệu tương ứng thuộc Collection `Document` thêm 1 đơn vị.
  * **Lưu ý**: Lượt xem không tăng khi Admin truy cập xem chi tiết tài liệu trong trang quản trị quản lý (`/admin/documents/:id`) nhằm giữ độ chính xác tối đa cho số liệu tương tác thực tế của người dùng.

---

## V. CÁC TRANG QUẢN TRỊ ADMIN (RESTURED TABLES & FILTERS)

Toàn bộ giao diện quản trị của Admin tại `/admin` đã được tối ưu hóa sang định dạng **Bảng dữ liệu (Table Layout)** thống nhất, tích hợp **Thanh tìm kiếm và bộ lọc nhanh** cùng nút **Quay lại trang quản trị**.

### 1. Trang Dashboard tổng quan (`/admin`)
* Hiển thị 4 thẻ thống kê trực quan lấy dữ liệu từ MongoDB: *Tổng lượt xem website, Tổng số tài liệu, Tổng số bình luận, Tổng số ý kiến liên hệ*.
* Chứa các phím điều hướng nhanh đến 5 phân hệ quản lý trực thuộc.
* Liệt kê danh sách các tài liệu mới cập nhật gần nhất.

### 2. Quản lý tài khoản (`/admin/users`)
* **Bảng dữ liệu**: Hiển thị danh sách tài khoản theo hàng. Các ô dữ liệu như Họ tên, Email, Sđt, Tên đăng nhập và Vai trò được đặt trong thẻ `<input>` hoặc `<select>` trực tiếp trên bảng. Admin có thể sửa thông tin tại chỗ và nhấn nút **Lưu** để gửi yêu cầu cập nhật, hoặc bấm **Xóa** (không cho phép xóa tài khoản đang đăng nhập).
* **Tìm kiếm & Lọc**: Bổ sung bộ lọc ở trên cùng để tìm theo từ khóa (tên, email, username, sđt) và lọc nhanh theo phân loại vai trò (Tất cả / User / Admin).
* **Quay lại**: Có nút `Quay lại trang quản trị` ở đầu trang.

### 3. Quản lý tài liệu (`/admin/documents`)
* **Bảng dữ liệu**: Bảng hiển thị thông tin cơ bản tinh gọn bao gồm: *Tên tài liệu, Môn học, Nhóm/Danh mục, Người đăng, Lượt xem, Ngày đăng*.
* **Tìm kiếm & Lọc**: Bộ lọc ở trên cùng hỗ trợ tìm kiếm tài liệu theo từ khóa và lọc phân loại theo danh mục môn học.
* **Xem chi tiết & Điều hướng**: Dưới cột thao tác có nút **Xem chi tiết** liên kết sang trang `/admin/documents/:id`.
* **Trang chi tiết tài liệu (`/admin/documents/:id`) [NEW]**: Hiển thị toàn bộ trường thông tin đầy đủ, đặc biệt là khung soạn thảo nội dung văn bản (`content` dạng textarea lớn). Tại đây, Admin có thể sửa đổi nội dung text của tài liệu rồi bấm **Lưu cập nhật** hoặc bấm **Xóa tài liệu** (có xác nhận xác minh).

### 4. Quản lý bình luận (`/admin/comments`)
* **Bảng dữ liệu**: Danh sách bình luận được hiển thị dạng bảng gồm: *Người gửi, Email, Tài liệu được bình luận, Đánh giá (Số sao hiển thị kèm biểu tượng ★), Nội dung bình luận, Ngày gửi* và nút *Xóa*.
* **Tìm kiếm & Lọc**: Bộ lọc trên cùng hỗ trợ tìm kiếm từ khóa bình luận/người gửi và lọc theo số sao đánh giá (từ 1 đến 5 sao).
* **Quay lại**: Có nút quay lại Dashboard.

### 5. Quản lý ý kiến liên hệ (`/admin/contacts`)
* **Bảng dữ liệu**: Hiển thị dạng bảng gồm: *Người gửi, Email, Nội dung tin nhắn liên hệ, Ngày gửi* và nút *Xóa*.
* **Tìm kiếm**: Thanh tìm kiếm phía trên hỗ trợ lọc danh sách theo tên người gửi, email hoặc nội dung tin nhắn.
* **Quay lại**: Có nút quay lại Dashboard.

### 6. Cập nhật nội dung trang chủ (`/admin/content`)
* Cho phép Admin cập nhật văn bản giới thiệu, thông tin liên lạc hiển thị ở trang chủ/chân trang và cấu hình bật/tắt quảng cáo cũng như thay đổi thông tin popup quảng cáo tại chỗ.
* Tích hợp nút quay lại Dashboard ở đầu trang.

---

## VI. CẤU TRÚC THƯ MỤC CHI TIẾT CỦA PHÂN HỆ WEB (`doc-share-web`)

```text
doc-share-web/
├── app.js                   # Tệp tin khởi chạy ứng dụng chính, quản trị middleware, API và định tuyến
├── package.json             # Quản lý các thư viện phụ thuộc (dependencies, scripts)
├── lib/
│   ├── mongodb.js           # Quản lý kết nối MongoDB sử dụng Mongoose
│   └── database.js          # Định nghĩa cấu trúc Schema và toàn bộ hàm truy vấn dữ liệu MongoDB
├── public/                  # Chứa tài nguyên tĩnh tải xuống trình duyệt
│   ├── css/
│   │   ├── style.css        # Biến màu, kiểu chữ và bố cục chung toàn hệ thống
│   │   ├── footer.css       # Kiểu dáng chân trang
│   │   └── admin-users.css  # Định dạng bảng biểu thống nhất, nút bấm cho các trang admin
│   └── js/
│       ├── navbar.js        # Lập trình sự kiện trượt sidebar, đóng mở popup tìm kiếm & tài khoản
│       ├── ad-popup.js      # Hẹn giờ popup quảng cáo sau 1 phút và ghi cookie 1 năm
│       └── upload.js        # Đồng bộ danh mục-môn học, đọc file thành Base64 và xóa file trước submit
├── uploads/                 # Thư mục lưu trữ vật lý các tệp tài liệu PDF, DOCX, PPTX tải lên
└── views/                   # Chứa các giao diện hiển thị dạng EJS Template
    ├── home.ejs             # Giao diện Trang chủ
    ├── contact.ejs          # Giao diện trang Liên hệ
    ├── documents.ejs        # Giao diện danh sách tài liệu chia sẻ
    ├── document-detail.ejs  # Giao diện chi tiết tài liệu và gửi bình luận
    ├── upload.ejs           # Giao diện người dùng đăng tài liệu mới
    ├── login.ejs            # Giao diện đăng nhập tài khoản
    ├── register.ejs         # Giao diện đăng ký tài khoản mới
    ├── not-found.ejs        # Giao diện xử lý lỗi 404 / 500
    ├── admin-dashboard.ejs  # Giao diện Dashboard admin tổng quan
    ├── admin-content.ejs    # Giao diện admin cấu hình nội dung trang
    ├── admin-users.ejs      # Giao diện admin quản lý tài khoản người dùng
    ├── admin-documents.ejs  # Giao diện admin quản lý danh sách tài liệu
    ├── admin-document-detail.ejs # Giao diện admin xem chi tiết, sửa nội dung hoặc xóa tài liệu
    ├── admin-comments.ejs   # Giao diện admin quản lý bình luận đánh giá
    ├── admin-contacts.ejs   # Giao diện admin quản lý ý kiến đóng góp liên hệ
    └── partials/            # Các thành phần tái sử dụng ở nhiều giao diện
        ├── navbar.ejs       # Thanh điều hướng đầu trang và sidebar
        └── footer.ejs       # Chân trang hiển thị thông tin chung
```

---

## VIII. CẤU TRÚC VÀ CHỨC NĂNG PHÂN HỆ MOBILE APP (`doc-share-app`)

Phân hệ ứng dụng di động được xây dựng bằng công nghệ **React Native / Expo** nhằm mang lại trải nghiệm tiện lợi và mượt mà cho sinh viên sử dụng điện thoại thông minh.

### 1. Cấu trúc thư mục chi tiết
```text
doc-share-app/
├── App.js                   # Tệp cấu hình gốc, quản lý Navigation chính và khôi phục phiên đăng nhập
├── app.json                 # Tệp cấu hình dự án Expo (tên ứng dụng, biểu tượng, splash screen)
├── package.json             # Danh sách thư viện React Native và Expo SDK sử dụng
├── config.js                # Lưu địa chỉ IP của server backend để kết nối API
├── components/
│   └── FadeInView.js        # Thành phần hiệu ứng hoạt họa mờ hiện mượt mà cho các màn hình
├── services/
│   └── api.js               # Chứa các cuộc gọi fetch HTTP gửi đến Backend Web Server
└── screens/
    ├── MainScreen.js        # Màn hình chính chứa thanh tìm kiếm, bộ lọc danh mục và danh sách tài liệu
    ├── DetailScreen.js      # Màn hình chi tiết tài liệu, xem toàn văn (khi đăng nhập) và gửi bình luận
    ├── LoginScreen.js       # Màn hình đăng ký và đăng nhập tài khoản thành viên
    └── ContactScreen.js     # Màn hình liên hệ và gửi góp ý lên máy chủ
```

### 2. Mô tả chi tiết chức năng các tệp mã nguồn
* **`App.js`**:
  * Đóng vai trò là cổng khởi chạy chính của ứng dụng.
  * Quản lý trạng thái phiên đăng nhập toàn cục (`userSession`). Khi ứng dụng khởi động, hàm `useEffect` sử dụng `AsyncStorage.getItem('user_session')` để khôi phục phiên hoạt động gần nhất của người dùng.
  * Cấu hình **Navigation** lồng ghép (Nested Navigation):
    * **Tab Navigator** ở dưới đáy màn hình gồm 3 Tab: *Tài liệu (`Documents`)*, *Liên hệ (`Contact`)*, *Tài khoản (`Account`)*.
    * **Stack Navigator** được lồng bên trong Tab *Tài liệu* để hỗ trợ chuyển đổi từ danh sách tài liệu chính sang màn hình chi tiết một cách mượt mà và lưu lại nút quay lại (Back).
* **`config.js`**:
  * Khai báo hằng số `API_BASE_URL` chứa địa chỉ IP và cổng của Backend Server. Đây là thông số quan trọng cần thay đổi tương thích với IP mạng nội bộ của bạn khi chạy trên thiết bị thật.
* **`services/api.js`**:
  * Đóng gói toàn bộ các API tương tác với Backend.
  * Định nghĩa hàm `fetchWithTimeout` hỗ trợ hủy kết nối sau 5 giây (`AbortController`) nếu mạng chập chờn, giúp tránh hiện tượng ứng dụng bị đóng băng vô thời hạn khi mất kết nối.
  * Cung cấp các hàm xuất khẩu (export): `fetchCategories`, `fetchDocuments`, `fetchDocumentById`, `addComment`, `login`, `register`, `submitContact` và `fetchSiteData`.
* **`components/FadeInView.js`**:
  * Sử dụng thư viện `Animated` tích hợp sẵn trong React Native để biến đổi độ mờ đục (`opacity` từ 0 tăng dần lên 1) của các phần tử con trong vòng 600ms.
  * Tối ưu hóa chuyển động bằng thuộc tính `useNativeDriver: true` giúp đẩy các phép tính toán hoạt họa xuống hệ thống Native Runtime chạy độc lập với luồng JavaScript chính.
* **`screens/MainScreen.js`**:
  * Hiển thị thanh tìm kiếm hỗ trợ nhập từ khóa và lướt ngang chọn danh mục môn học (`ScrollView` nằm ngang).
  * Danh sách tài liệu được tối ưu tải phân trang và hiệu suất bằng `FlatList`, tích hợp kéo để làm mới (`onRefresh` / `refreshing`) giúp đồng bộ dữ liệu tức thì khi có tài liệu mới tải lên từ Website.
* **`screens/DetailScreen.js`**:
  * Đọc mã `id` được truyền qua tham số điều hướng (`route.params`).
  * Thực hiện kiểm tra quyền truy cập: Nếu người dùng chưa đăng nhập, giao diện chỉ hiển thị phần giới thiệu tóm tắt và mô tả. Nếu đã đăng nhập thành công, giao diện sẽ mở khóa toàn văn nội dung tài liệu (`content`) kèm theo nút tải file vật lý hoặc mở link Google Drive.
  * Phía cuối màn hình hiển thị danh sách các đánh giá của các sinh viên khác và form cho phép gửi nhận xét mới kèm số sao lựa chọn từ 1 đến 5.
* **`screens/LoginScreen.js`**:
  * Cung cấp giao diện chuyển đổi linh hoạt giữa hai chế độ: *Đăng nhập* và *Đăng ký*.
  * Thực hiện các thao tác xác thực đầu vào (mật khẩu tối thiểu 6 ký tự, kiểm tra trùng khớp lại mật khẩu).
  * Khi đăng nhập thành công, thông tin người dùng được tuần tự hóa và lưu trữ bền vững vào bộ nhớ điện thoại (`AsyncStorage.setItem`).
* **`screens/ContactScreen.js`**:
  * Gọi API `fetchSiteData` để tải các thông tin địa chỉ, email và hotline do admin thay đổi linh hoạt trên web hiển thị lên màn hình.
  * Tích hợp biểu mẫu cho phép sinh viên trực tiếp nhập họ tên, email đóng góp ý kiến phản hồi về backend.

### 3. Cơ chế Khôi phục phiên đăng nhập (Persistent Login Session Recovery)
Do ứng dụng di động không tự động duy trì Cookie/Session như trình duyệt web, hệ thống sử dụng quy trình khôi phục phiên bằng bộ nhớ đệm:
* **Khởi tạo và Khôi phục phiên (`App.js`)**:
  * Khai báo State phiên đăng nhập toàn cục `const [userSession, setUserSession] = useState(null)`.
  * Hàm `useEffect` bất đồng bộ sẽ tự động chạy khi App vừa khởi động, gọi `AsyncStorage.getItem('user_session')` để khôi phục dữ liệu đã lưu ở lần truy cập trước. Nếu có, dữ liệu JSON sẽ được phân tích thành Object và đưa vào State của ứng dụng thông qua `setUserSession(parsedData)`.
### 3. Cơ chế Khôi phục phiên đăng nhập (Persistent Login Session Recovery)
Do ứng dụng di động không tự động duy trì Cookie/Session như trình duyệt web, hệ thống sử dụng quy trình khôi phục phiên bằng bộ nhớ đệm:
* **Khởi tạo và Khôi phục phiên (`App.js`)**:
  * Khai báo State phiên đăng nhập toàn cục `const [userSession, setUserSession] = useState(null)`.
  * Hàm `useEffect` bất đồng bộ sẽ tự động chạy khi App vừa khởi động, gọi `AsyncStorage.getItem('user_session')` để khôi phục dữ liệu đã lưu ở lần truy cập trước. Nếu có, dữ liệu JSON sẽ được phân tích thành Object và đưa vào State của ứng dụng thông qua `setUserSession(parsedData)`.
* **Lưu phiên khi Đăng nhập (`screens/LoginScreen.js`)**:
  * Khi người dùng đăng nhập thành công qua API `/api/login`, hàm `handleLogin` sẽ thực hiện lưu trữ thông tin User vào bộ nhớ điện thoại: `AsyncStorage.setItem('user_session', JSON.stringify(user))` và cập nhật lên State toàn cục.
* **Xóa phiên khi Đăng xuất (`screens/LoginScreen.js`)**:
  * Khi người dùng nhấn nút đăng xuất, hàm `handleLogout` sẽ thực hiện xóa bỏ thông tin tài khoản: `AsyncStorage.removeItem('user_session')` và đưa State về trạng thái `null`.
* **Phạm vi áp dụng**:
  * State `userSession` được truyền xuống các Navigator con qua `props` để thay đổi tên Tab hiển thị ở dưới đáy màn hình ("Tài khoản" hoặc "Đăng nhập"), tự động điền thông tin Họ tên/Email khi gửi bình luận hay liên hệ, và mở khóa hiển thị toàn văn tài liệu kèm nút tải xuống/mở Drive.

---

## IX. SƠ ĐỒ CẤU TRÚC PHẦN TỬ (DOM & COMPONENT TREES)

Dưới đây là cây phân rã cấu trúc phần tử giao diện của cả Website (HTML DOM Tree) và Mobile App (React Native Component Tree):

### 1. Cấu trúc DOM Tree phía Website (Web Portal)
Toàn bộ các trang Web đều tuân theo mô hình layout chuẩn:
```text
html
├── head (Thẻ tiêu đề, liên kết stylesheets: style.css, admin-users.css)
└── body
    ├── include('./partials/navbar') (Thanh điều hướng chung)
    │   ├── nav.navbar-container
    │   │   ├── Logo & Tên website
    │   │   ├── Menu điều hướng chính (Trang chủ, Tài liệu, Đăng tài liệu, Liên hệ)
    │   │   ├── Nút tìm kiếm nhanh (#searchBtn) -> Popup tìm kiếm (#searchPopup -> #searchInput)
    │   │   ├── Dropdown thông tin tài khoản (#userBtn) -> Popup menu (#userPopup -> Đăng xuất/Admin)
    │   │   └── Nút Hamburger Menu (#menuBtn) -> Mở Sidebar trên mobile
    │   ├── div.sidebar (Menu trượt bên trái trên thiết bị di động)
    │   └── div.sidebar-overlay (Nền mờ để bấm đóng Sidebar)
    │
    ├── main.container (Khu vực chứa nội dung động chính của từng trang)
    │   │
    │   ├── [Trang chủ - home.ejs]
    │   │   ├── section.page-hero (Khung giới thiệu lớn)
    │   │   ├── section.categories-grid (Danh sách các danh mục môn học dưới dạng card)
    │   │   ├── section.latest-documents (Hiển thị 6 tài liệu học tập mới đăng tải nhất)
    │   │   └── div#promoPopup (Popup quảng cáo thông minh hiển thị sau 1 phút truy cập)
    │   │
    │   ├── [Tài liệu - documents.ejs]
    │   │   ├── form.filter-form (Bộ lọc tìm kiếm từ khóa và lọc danh mục môn học)
    │   │   └── section.document-grid (Danh sách thẻ hiển thị các tài liệu sau khi lọc)
    │   │
    │   ├── [Chi tiết tài liệu - document-detail.ejs]
    │   │   ├── section.detail-header (Tiêu đề, người đăng, mô tả tóm tắt)
    │   │   ├── div.content-container (Toàn văn nội dung tài liệu - Ẩn đối với khách và Hiển thị đối với member)
    │   │   ├── div.action-buttons (Nút Tải file tài liệu xuống và nút Mở Link Google Drive)
    │   │   ├── section.comments-list (Danh sách ý kiến nhận xét và điểm sao của sinh viên)
    │   │   └── form.comment-form (Khung gửi bình luận và chấm điểm đánh giá từ 1 đến 5 sao)
    │   │
    │   ├── [Đăng tải - upload.ejs]
    │   │   └── form#uploadForm (Form nhập tiêu đề, danh mục, tệp tài liệu và link Google Drive kèm các ô input ẩn)
    │   │
    │   ├── [Giao diện Admin Dashboard - admin-dashboard.ejs]
    │   │   ├── section.admin-stats (4 thẻ thống kê số liệu: Views, Tài liệu, Bình luận, Liên hệ)
    │   │   ├── section.admin-links (Các phím điều hướng nhanh tới 5 khu vực quản lý)
    │   │   └── section.admin-panel (Bảng thống kê các tài liệu gần nhất)
    │   │
    │   └── [Các trang bảng Admin - admin-users, admin-documents, admin-comments, admin-contacts]
    │       ├── div (Nút quay trở lại trang quản trị)
    │       ├── form.filter-form (Tìm kiếm từ khóa và lọc các trường dữ liệu tương ứng)
    │       └── section.admin-users-section (Bao bọc bảng dữ liệu chính)
    │           └── div.admin-table-wrapper
    │               └── table.admin-users-table
    │                   ├── thead (Dòng tiêu đề các cột dữ liệu)
    │                   └── tbody
    │                       └── tr (Các hàng dữ liệu động chứa input chỉnh sửa tại chỗ hoặc nút bấm xóa)
    │
    └── include('./partials/footer') (Chân trang chứa thông tin liên hệ tĩnh)
```

### 2. Cấu trúc Component Tree phía Mobile App (React Native)
Giao diện ứng dụng di động được cấu thành từ các Component Native lồng ghép:
```text
SafeAreaView (Root Container bảo vệ vùng hiển thị an toàn trên tai thỏ/cằm máy)
├── StatusBar (Thanh trạng thái pin, sóng điện thoại)
└── NavigationContainer (Bộ bao bọc quản lý điều hướng chính)
    └── Tab.Navigator (Thanh điều hướng 3 tab dưới đáy màn hình)
        │
        ├── [Tab 1: Documents - lồng Stack.Navigator]
        │   └── Stack.Navigator
        │       ├── [Màn hình DocList - MainScreen.js]
        │       │   └── FadeInView (Hiệu ứng mờ hiện mượt mà khi đổi trang)
        │       │       ├── View.header (Tiêu đề "Tài liệu Skibidi")
        │       │       ├── View.searchSection (Ô nhập TextInput & nút Tìm kiếm TouchableOpacity)
        │       │       ├── View.categoryContainer -> ScrollView (Thanh lướt ngang chọn danh mục badge)
        │       │       ├── FlatList (Hiển thị danh sách tài liệu dưới dạng cuộn dọc hiệu năng cao)
        │       │       │   └── renderItem -> TouchableOpacity.card (Các thẻ tài liệu dẫn sang trang chi tiết)
        │       │       └── ActivityIndicator (Vòng quay loading khi tải dữ liệu)
        │       │
        │       └── [Màn hình DocDetail - DetailScreen.js]
        │           └── FadeInView
        │               └── ScrollView (Toàn bộ trang chi tiết hỗ trợ cuộn dọc)
        │                   ├── View.info (Tiêu đề, mô tả, uploader)
        │                   ├── View.content (Văn bản tóm tắt hoặc toàn văn nội dung)
        │                   ├── View.actions (Nút bấm xem file/mở link Google Drive)
        │                   ├── View.comments (Vòng lặp hiển thị danh sách nhận xét và số sao của sinh viên)
        │                   └── View.commentForm (Form TextInput tên, email, nhận xét & nút gửi đánh giá)
        │
        ├── [Tab 2: Contact - ContactScreen.js]
        │   └── FadeInView
        │       └── ScrollView
        │           ├── View.infoCard (Hiển thị thông tin email, điện thoại, địa chỉ kết nối từ API)
        │           └── View.contactForm (Form đóng góp phản hồi ý kiến cho backend)
        │
        └── [Tab 3: Account / Login - LoginScreen.js]
            └── FadeInView
                ├── [Nếu chưa đăng nhập - Giao diện Đăng nhập / Đăng ký]
                │   └── ScrollView
                │       ├── TextInput (Nhập thông tin username, mật khẩu, xác nhận đăng ký)
                │       ├── TouchableOpacity (Nút bấm xác nhận gửi đăng nhập/đăng ký)
                │       └── TouchableOpacity (Nút chuyển đổi linh hoạt qua lại giữa 2 chế độ login/signup)
                │
                └── [Nếu đã đăng nhập - Giao diện Thông tin tài khoản cá nhân]
                    └── View.profileContainer
                        ├── Hiển thị Họ tên, Email, Username, Vai trò quyền hạn
                        └── TouchableOpacity (Nút đăng xuất loại bỏ AsyncStorage)
```

---

## X. HƯỚNG DẪN KHỞI CHẠY VÀ VẬN HÀNH DỰ ÁN

### 1. Chuẩn bị môi trường chung
* Đảm bảo máy tính đã cài đặt **Node.js** (Phiên bản v16 trở lên) và **MongoDB Community Server** đang chạy tại địa chỉ cục bộ `mongodb://127.0.0.1:27017/`.

### 2. Khởi chạy Backend Web Server
1. Mở terminal tại thư mục `doc-share-web` và cài đặt dependencies:
   ```bash
   npm install
   ```
2. Chạy lệnh để khởi động máy chủ:
   ```bash
   node app.js
   ```
3. Truy cập vào trang chủ Web: `http://localhost:3000`
4. Truy cập vào bảng điều khiển Admin: `http://localhost:3000/admin` (Đăng nhập tài khoản seed mặc định: **admin** / mật khẩu: **123456**).

### 3. Khởi chạy Ứng dụng di động (Mobile App)
1. **Thiết lập mạng và Tường lửa (Bắt buộc để kết nối thành công)**:
   * **Khuyến khích**: Nên sử dụng mạng Wi-Fi phát ra từ điện thoại (**Mobile Hotspot**) để kết nối giữa điện thoại và máy tính được mượt mà nhất, tránh các vấn đề chặn kết nối chéo của các cục Wi-Fi chung.
   * Đảm bảo cả máy tính và điện thoại kết nối **chung một mạng Wi-Fi** (Tắt 3G/4G trên điện thoại nếu bắt Wi-Fi ngoài và tắt VPN trên điện thoại).
   * Khuyến khích chuyển trạng thái mạng Wi-Fi trên máy tính Windows sang **Private Network**.
   * Nếu điện thoại bị chặn kết nối (báo lỗi Timeout, màn hình xoay trắng liên tục), hãy mở **PowerShell (Run as administrator)** trên máy tính và chạy lệnh sau để mở khóa tường lửa cho cổng 3000:
     ```powershell
     New-NetFirewallRule -DisplayName "Allow Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
     ```
2. **Xác định địa chỉ IPv4 cục bộ** của máy tính (Dùng lệnh `ipconfig` trên Windows). Hãy kiểm tra xem địa chỉ IP Wi-Fi của máy tính có bắt đầu bằng đầu số **`10.`** hay không (đặc trưng khi kết nối với Hotspot điện thoại, ví dụ: `10.231.114.78`).
3. **Cập nhật địa chỉ IP vào ứng dụng**: Mở tệp `doc-share-app/config.js` và cập nhật địa chỉ IP tương ứng:
   ```javascript
   export const API_BASE_URL = 'http://10.231.114.78:3000';
   ```
4. **Khởi chạy ứng dụng**:
   * Mở terminal tại thư mục `doc-share-app` và cài đặt thư viện:
     ```bash
     npm install
     ```
   * Khởi động môi trường Expo bằng lệnh:
     ```bash
     npx expo start
     ```
5. **Trải nghiệm trên thiết bị**:
   * **Điện thoại thật**: Tải ứng dụng **Expo Go** trên App Store (iOS) hoặc Google Play (Android). Quét mã QR hiển thị ở terminal để tải ứng dụng trực tiếp lên điện thoại.
   * **Máy ảo**: Nhấn phím `a` trên terminal để khởi chạy máy ảo Android, hoặc phím `i` để chạy giả lập iOS Simulator (trên macOS).
