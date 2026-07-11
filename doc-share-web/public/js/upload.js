/**
 * Quản lý hoạt động Đăng tài liệu phía client.
 * Bao gồm:
 * 1. Đọc tệp tin thành chuỗi Base64 để gửi qua JSON/POST.
 * 2. Hiển thị phần xem trước tệp đã chọn và nút Xóa tệp.
 * 3. Tự động đồng bộ hóa Môn học theo Danh mục đã chọn.
 * 4. Kiểm tra kích thước tệp (giới hạn 100MB) và bắt lỗi nếu cả tệp và link đều trống.
 */

const uploadForm = document.getElementById('uploadForm');
const documentFileInput = document.getElementById('documentFile');
const driveLinkInput = document.getElementById('driveLink');
const fileNameInput = document.getElementById('fileName');
const mimeTypeInput = document.getElementById('mimeType');
const fileDataInput = document.getElementById('fileData');

const filePreviewContainer = document.getElementById('filePreviewContainer');
const fileInfoText = document.getElementById('fileInfoText');
const clearFileBtn = document.getElementById('clearFileBtn');

/**
 * Định dạng kích thước byte sang định dạng thân thiện với người dùng (KB, MB).
 */
function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Cập nhật phần xem trước thông tin tệp tin đã chọn lên giao diện.
 * Hiển thị khối chứa nút Xóa tệp khi tệp tin tồn tại.
 */
function updateFilePreview() {
    if (!documentFileInput || !filePreviewContainer || !fileInfoText) return;
    const file = documentFileInput.files[0];
    if (file) {
        fileInfoText.textContent = `Đã chọn: ${file.name} (${formatBytes(file.size)})`;
        filePreviewContainer.style.display = 'flex';
    } else {
        filePreviewContainer.style.display = 'none';
        fileInfoText.textContent = '';
    }
}

if (uploadForm && documentFileInput) {
    // Sự kiện khi người dùng chọn tệp tin mới
    documentFileInput.addEventListener('change', () => {
        // Reset các giá trị dữ liệu cũ để chuẩn bị đọc file mới khi submit
        fileDataInput.value = '';
        fileNameInput.value = '';
        mimeTypeInput.value = '';
        updateFilePreview();
    });

    // Sự kiện khi người dùng bấm nút "Xóa tệp"
    if (clearFileBtn) {
        clearFileBtn.addEventListener('click', () => {
            documentFileInput.value = ''; // Reset input file
            fileDataInput.value = '';     // Reset dữ liệu mã hóa base64
            fileNameInput.value = '';     // Reset tên tệp
            mimeTypeInput.value = '';     // Reset định dạng tệp
            updateFilePreview();          // Cập nhật giao diện ẩn preview đi
        });
    }

    updateFilePreview();

    // Sự kiện khi người dùng nhấn submit Form đăng tài liệu
    uploadForm.addEventListener('submit', async (event) => {
        const file = documentFileInput.files[0];
        const driveLink = (driveLinkInput.value || '').trim();

        // 1. Kiểm tra: Chỉ báo lỗi khi cả tệp tin và link Google Drive đều bị để trống
        if (!file && !driveLink) {
            event.preventDefault();
            alert('Vui lòng chọn tệp tài liệu hoặc nhập link Google Drive.');
            return;
        }

        // 2. Nếu có chọn tệp tin, kiểm tra tính hợp lệ và tiến hành chuyển đổi sang Base64
        if (file) {
            // Chặn tệp tin vượt quá 100MB
            if (file.size > 100 * 1024 * 1024) {
                event.preventDefault();
                alert('Tệp vượt quá 100MB.');
                return;
            }

            // Nếu dữ liệu file chưa được chuyển thành base64 (chạy lần đầu)
            if (!fileDataInput.value) {
                event.preventDefault(); // Chặn việc submit tạm thời để đọc file
                const base64 = await readFileAsBase64(file);
                fileNameInput.value = file.name;
                mimeTypeInput.value = file.type;
                fileDataInput.value = base64; // Gán vào thẻ input hidden để submit lên backend
                uploadForm.requestSubmit();   // Gọi lại lệnh submit chính thức
            }
        } else {
            // Nếu không có tệp, đảm bảo làm sạch thông tin tệp trước khi gửi chỉ có link
            fileDataInput.value = '';
            fileNameInput.value = '';
            mimeTypeInput.value = '';
        }
    });
}

/**
 * Đọc tệp tin dạng Blob/File thành chuỗi Base64 sử dụng FileReader API.
 */
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result || '';
            resolve(String(result).split(',').pop()); // Lấy chuỗi base64 bỏ phần header data:...base64,
        };

        reader.onerror = reject;
        reader.readAsDataURL(file); // Bắt đầu đọc file dưới dạng Data URL
    });
}

// Xử lý logic chọn Danh mục và hiển thị danh sách Môn học tương ứng
const categorySelect = document.getElementById('categorySelect');
const subjectSelect = document.getElementById('subjectSelect');

/**
 * Hàm cập nhật danh sách môn học trong thẻ select dựa trên Danh mục đã chọn.
 */
function updateSubjectOptions() {
    if (!categorySelect || !subjectSelect) {
        return;
    }

    const categoryId = categorySelect.value;

    // Tìm kiếm thông tin danh mục tương ứng từ biến categoryData định nghĩa trên view
    const selectedCategory = window.categoryData.find(
        category => category.id === categoryId
    );

    const previousSubject =
        subjectSelect.dataset.selectedSubject || subjectSelect.value;

    subjectSelect.innerHTML = ''; // Xóa sạch các option môn học cũ

    // Nếu chưa chọn danh mục
    if (!selectedCategory) {
        subjectSelect.disabled = true;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Hãy chọn danh mục';

        subjectSelect.appendChild(defaultOption);
        return;
    }

    // Nếu đã chọn danh mục hợp lệ, bật select môn học
    subjectSelect.disabled = false;

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Chọn môn học / đầu mục';

    subjectSelect.appendChild(placeholderOption);

    // Duyệt qua danh sách môn học của danh mục và tạo thẻ <option> tương ứng
    selectedCategory.subjects.forEach(subject => {
        const option = document.createElement('option');

        option.value = subject;
        option.textContent = subject;

        // Giữ lại môn học đã chọn nếu có (phục vụ khi hiển thị lại form nếu lỗi)
        if (subject === previousSubject) {
            option.selected = true;
        }

        subjectSelect.appendChild(option);
    });

    subjectSelect.dataset.selectedSubject = '';
}

// Lắng nghe sự kiện thay đổi Danh mục để cập nhật lại danh sách Môn học
if (categorySelect && subjectSelect) {
    categorySelect.addEventListener('change', () => {
        subjectSelect.dataset.selectedSubject = '';
        updateSubjectOptions();
    });

    // Khởi tạo chạy lần đầu để render môn học nếu form đã có sẵn dữ liệu danh mục được chọn
    updateSubjectOptions();
}