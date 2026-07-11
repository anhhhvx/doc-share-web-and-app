/**
 * Module kết nối cơ sở dữ liệu MongoDB bằng thư viện Mongoose.
 */
const mongoose = require('mongoose');

// Địa chỉ kết nối mặc định của MongoDB dưới máy cục bộ (localhost)
const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/doc-share-web';

/**
 * Hàm thực hiện kết nối cơ sở dữ liệu MongoDB.
 * Lấy địa chỉ kết nối từ biến môi trường MONGODB_URI nếu có, ngược lại dùng địa chỉ mặc định.
 */
async function connectMongoDB() {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

    // Lắng nghe sự kiện kết nối thành công để in thông báo
    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected');
    });

    // Lắng nghe sự kiện lỗi kết nối để ghi nhận nhật ký lỗi
    mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error.message);
    });

    // Thực hiện lệnh kết nối phi đồng bộ
    await mongoose.connect(mongoUri);
}

module.exports = {
    connectMongoDB
};
