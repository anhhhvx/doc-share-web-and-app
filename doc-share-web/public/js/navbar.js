/**
 * Lắng nghe sự kiện DOMContentLoaded để đảm bảo giao diện HTML đã load xong.
 * Lập trình điều khiển menu sidebar, các dropdown danh mục, ô tìm kiếm popup và thông tin tài khoản.
 */
document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.getElementById("menuBtn");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");

    if (!menuBtn || !sidebar || !overlay) return;

    // Khi click vào nút Hamburger Menu, mở thanh Sidebar bên trái và lớp phủ nền mờ
    menuBtn.onclick = () => {
        sidebar.classList.add("active");
        overlay.classList.add("active");
    }

    // Hàm thực hiện ẩn thanh Sidebar và lớp phủ mờ
    function closeSidebar() {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    }

    // Click vào lớp phủ nền mờ để đóng Sidebar
    overlay.onclick = closeSidebar;

    // Nhấn phím Escape (ESC) để đóng Sidebar nhanh
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeSidebar();
        }
    });

    // Quản lý đóng/mở (toggle) các danh mục môn học con trong thanh Sidebar
    const dropdownBtns = document.querySelectorAll(".dropdown-btn");
    dropdownBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const submenu = btn.nextElementSibling;
            submenu.classList.toggle("active");
        });
    });
});

// Điều khiển popup tìm kiếm trên thanh Navbar
const searchBtn = document.getElementById("searchBtn");
const searchPopup = document.getElementById("searchPopup");
const searchInput = document.getElementById("searchInput");

if (searchBtn && searchPopup) {
    // Click vào biểu tượng kính lúp để hiển thị/ẩn thanh tìm kiếm nhanh
    searchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        searchPopup.classList.toggle("active");
        if (searchPopup.classList.contains("active")) {
            searchInput.focus(); // Tự động trỏ con nháy vào input tìm kiếm
        }
    });

    // Click ra ngoài thanh tìm kiếm để ẩn popup đi
    document.addEventListener("click", (e) => {
        if (
            !searchPopup.contains(e.target) &&
            e.target !== searchBtn
        ) {
            searchPopup.classList.remove("active");
        }
    });

    // Nhấn ESC để ẩn popup tìm kiếm
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            searchPopup.classList.remove("active");
        }
    });
}

// Điều khiển popup tài khoản cá nhân (Dropdown menu của người dùng)
const userBtn = document.getElementById("userBtn");
const userPopup = document.getElementById("userPopup");

if (userBtn && userPopup) {
    // Click vào tên người dùng để hiển thị/ẩn menu tài khoản (Trang quản trị / Đăng xuất)
    userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userPopup.classList.toggle("active");
    });

    // Click ra ngoài vùng menu tài khoản để tự động ẩn menu đi
    document.addEventListener("click", (e) => {
        if (
            !userPopup.contains(e.target) &&
            e.target !== userBtn
        ) {
            userPopup.classList.remove("active");
        }
    });

    // Nhấn ESC để đóng menu tài khoản nhanh
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            userPopup.classList.remove("active");
        }
    });
}
