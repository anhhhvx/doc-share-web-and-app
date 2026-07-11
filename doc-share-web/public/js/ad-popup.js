// Quản lý popup quảng cáo trên trang chủ

const promoPopup = document.getElementById('promoPopup');
const closePromoPopup = document.getElementById('closePromoPopup');

const POPUP_COOKIE_NAME = 'docshare_promo_closed';
const POPUP_DELAY_MS = 60 * 1000;

// Cookie tồn tại trong 5 phút để phục vụ kiểm thử
// Trong thực tế, có thể đặt thời gian tồn tại lâu hơn, ví dụ 1 ngày (24 * 60 * 60 giây)
const COOKIE_MAX_AGE_SECONDS = 5 * 60;

// Lấy giá trị cookie theo tên
function getCookie(name) {
    const cookiePrefix = `${name}=`;
    const targetCookie = document.cookie
        .split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith(cookiePrefix));
    if (!targetCookie) {
        return '';
    }
    return decodeURIComponent(targetCookie.slice(cookiePrefix.length));
}

// Lưu cookie với thời gian tồn tại tính bằng giây
function setCookie(name, value, maxAgeSeconds) {
    document.cookie =
        `${name}=${encodeURIComponent(value)}; ` +
        `max-age=${maxAgeSeconds}; ` +
        'path=/; SameSite=Lax';
}

// Hiển thị popup quảng cáo
function showPromoPopup() {
    promoPopup.classList.add('active');
    promoPopup.setAttribute('aria-hidden', 'false');
}

// Ẩn popup và lưu cookie sau khi người dùng nhấn đóng
function hidePromoPopup() {
    promoPopup.classList.remove('active');
    promoPopup.setAttribute('aria-hidden', 'true');

    setCookie(POPUP_COOKIE_NAME,'1',COOKIE_MAX_AGE_SECONDS);
}

// Chỉ đặt bộ đếm khi trang có popup và cookie chưa tồn tại
if (promoPopup && !getCookie(POPUP_COOKIE_NAME)) {
    window.setTimeout(() => {
        // Kiểm tra lại cookie để tránh hiện popup nếu đã đóng ở tab khác
        if (!getCookie(POPUP_COOKIE_NAME)) {
            showPromoPopup();
        }
    }, POPUP_DELAY_MS);
}

// Gắn sự kiện đóng popup
if (promoPopup && closePromoPopup) {
    closePromoPopup.addEventListener('click', hidePromoPopup);
}

// Lệnh xóa cookie để test 
// F12
// document.cookie = 'docshare_promo_closed=; max-age=0; path=/';
// Reload trang để test lại popup
