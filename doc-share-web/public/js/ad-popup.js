/**
 * Quản lý hoạt động hiển thị Popup Quảng cáo (Ad Promotion Popup).
 * Popup này hiển thị sau 1 phút nếu người dùng chưa tắt nó lần nào (kiểm tra qua Cookie).
 */
const promoPopup = document.getElementById('promoPopup');
const closePromoPopup = document.getElementById('closePromoPopup');
const popupCookieName = 'docshare_promo_closed';

/**
 * Hàm lấy giá trị của Cookie theo tên.
 */
function getCookie(name) {
    const cookies = document.cookie.split(';').map((item) => item.trim());
    const target = cookies.find((item) => item.startsWith(`${name}=`));
    return target ? decodeURIComponent(target.split('=').slice(1).join('=')) : '';
}

/**
 * Hàm lưu giá trị Cookie kèm thời gian hết hạn (tính theo ngày).
 */
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

// Nếu có thẻ popup trên giao diện và cookie chưa được thiết lập (chưa từng click tắt)
if (promoPopup && !getCookie(popupCookieName)) {
    // Kích hoạt hiển thị popup sau đúng 60000ms (1 phút)
    window.setTimeout(() => {
        promoPopup.classList.add('active');
        promoPopup.setAttribute('aria-hidden', 'false');
    }, 60000);
}

// Thiết lập sự kiện click cho nút đóng popup (biểu tượng dấu x)
if (promoPopup && closePromoPopup) {
    closePromoPopup.addEventListener('click', () => {
        promoPopup.classList.remove('active');
        promoPopup.setAttribute('aria-hidden', 'true');
        // Ghi nhận cookie trong vòng 365 ngày để không hiển thị lại popup nữa
        setCookie(popupCookieName, '1', 365);
    });
}
