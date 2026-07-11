/**
 * Module quản lý kết nối, định nghĩa Schema và thao tác dữ liệu MongoDB thông qua thư viện Mongoose.
 * Chứa cấu trúc dữ liệu của các thực thể: Người dùng, Danh mục, Tài liệu, Bình luận, Ý kiến liên hệ và Cấu hình trang.
 */

const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

// Thư mục lưu trữ tệp vật lý khi tải tài liệu lên server
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Định nghĩa nguồn dữ liệu để hiển thị trên Dashboard quản trị
const filePaths = {
    database: 'MongoDB',
    users: 'MongoDB users collection',
    categories: 'MongoDB categories collection',
    documents: 'MongoDB documents collection',
    comments: 'MongoDB comments collection',
    contacts: 'MongoDB contacts collection',
    site: 'MongoDB site collection'
};

// Dữ liệu danh mục và môn học mặc định phục vụ quá trình seed dữ liệu
const categorySeeds = [
    {
        id: 'ly-luan-chinh-tri',
        title: 'Lý luận chính trị',
        subjects: ['Tư tưởng Hồ Chí Minh', 'Chủ nghĩa xã hội khoa học', 'Triết học Mác - Lênin']
    },
    {
        id: 'tieng-anh',
        title: 'Tiếng Anh',
        subjects: ['TOEIC', 'IELTS', 'Tiếng Anh 1']
    },
    {
        id: 'co-so-nganh',
        title: 'Cơ sở và cốt lõi ngành',
        subjects: ['Lập trình Web', 'OOP', 'Cơ sở dữ liệu']
    },
    {
        id: 'kien-thuc-bo-tro',
        title: 'Kiến thức bổ trợ',
        subjects: ['UI/UX', 'Git/GitHub']
    },
    {
        id: 'module',
        title: 'Module',
        subjects: ['AI', 'Multimedia']
    },
    {
        id: 'toan-khoa-hoc',
        title: 'Toán và Khoa học cơ bản',
        subjects: ['Giải tích', 'Xác suất thống kê']
    }
];

// Cấu hình nội dung giao diện trang chủ và popup mặc định của website
const defaultSiteData = {
    id: 'default',
    stats: {
        totalViews: 0
    },
    homeContent: {
        heroTitle: 'Website chia sẻ tài liệu cho sinh viên',
        heroText: 'Quản lý tài khoản, phân loại tài liệu theo danh mục, xem nội dung tóm tắt và tải lên các tệp học tập PDF, DOCX, PPTX hoặc link Google Drive.',
        aboutTitle: 'Giới thiệu về website',
        aboutText: 'Đây là không gian chia sẻ tài liệu học tập cho sinh viên với mục tiêu giúp việc tìm kiếm, lưu trữ và đóng góp tài liệu trở nên thuận tiện hơn.',
        contactTitle: 'Thông tin liên hệ',
        contactText: 'Nếu bạn cần hỗ trợ hoặc muốn đóng góp thêm nội dung cho kho tài liệu, hãy để lại thông tin bên cạnh để nhóm quản trị phản hồi.',
        contactEmail: 'docs-share@gmail.com',
        contactPhone: '0123 456 789',
        contactAddress: 'Số 1 Đại Cồ Việt, phường Bạch Mai, Hà Nội'
    },
    adPopup: {
        enabled: true,
        title: 'Ưu đãi tài liệu premium',
        message: 'Nhận ngay bộ mẫu slide và đề cương ôn tập mới nhất dành cho sinh viên ngành CNTT.',
        buttonText: 'Xem ngay',
        buttonLink: '/documents'
    }
};

// Cấu hình Schema chung của Mongoose để tự động ánh xạ virtuals `id` thay thế cho `_id` mặc định khi chuyển sang JSON
const baseSchemaOptions = {
    id: false,
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform(document, returnedObject) {
            delete returnedObject._id;
            return returnedObject;
        }
    }
};

/**
 * 1. USER SCHEMA (Cấu trúc thông tin Tài khoản người dùng)
 */
const userSchema = new mongoose.Schema({
    id: { type: String, default: randomUUID, unique: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, baseSchemaOptions);

/**
 * 2. CATEGORY SCHEMA (Cấu trúc thông tin Danh mục và danh sách môn học trực thuộc)
 */
const categorySchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subjects: { type: [String], default: [] }
}, baseSchemaOptions);

/**
 * 3. DOCUMENT SCHEMA (Cấu trúc dữ liệu Tài liệu tải lên hệ thống)
 */
const documentSchema = new mongoose.Schema({
    id: { type: String, default: randomUUID, unique: true, index: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    categoryId: { type: String, required: true },
    categoryName: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    // sourceType lưu loại nguồn: file vật lý, google-drive hoặc cả hai (both)
    sourceType: { type: String, enum: ['file', 'google-drive', 'both'], default: 'file' },
    driveLink: { type: String, default: '' },
    originalFileName: { type: String, default: '' },
    storedFileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    uploader: { type: String, required: true },
    uploaderId: { type: String, default: '' },
    viewCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, baseSchemaOptions);

/**
 * 4. COMMENT SCHEMA (Cấu trúc bình luận & đánh giá tài liệu)
 */
const commentSchema = new mongoose.Schema({
    id: { type: String, default: randomUUID, unique: true, index: true },
    documentId: { type: String, required: true, index: true },
    documentTitle: { type: String, required: true },
    userId: { type: String, default: '' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true }, // Điểm đánh giá từ 1 đến 5 sao
    createdAt: { type: Date, default: Date.now }
}, baseSchemaOptions);

/**
 * 5. CONTACT SCHEMA (Cấu trúc thông tin phản hồi/liên hệ từ người dùng)
 */
const contactSchema = new mongoose.Schema({
    id: { type: String, default: randomUUID, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, baseSchemaOptions);

/**
 * 6. SITE SCHEMA (Lưu thống kê và cấu hình nội dung hiển thị website)
 */
const siteSchema = new mongoose.Schema({
    id: { type: String, default: 'default', unique: true, index: true },
    stats: {
        totalViews: { type: Number, default: 0 }
    },
    homeContent: {
        heroTitle: String,
        heroText: String,
        aboutTitle: String,
        aboutText: String,
        contactTitle: String,
        contactText: String,
        contactEmail: String,
        contactPhone: String,
        contactAddress: String
    },
    adPopup: {
        enabled: Boolean,
        title: String,
        message: String,
        buttonText: String,
        buttonLink: String
    }
}, baseSchemaOptions);

// Khởi tạo các Model từ các Schema trên (tránh khởi tạo lại nếu Model đã tồn tại)
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
const Site = mongoose.models.Site || mongoose.model('Site', siteSchema);

/**
 * Hàm hỗ trợ tạo thư mục phi đồng bộ nếu thư mục lưu trữ chưa tồn tại.
 */
async function ensureDirectory(directoryPath) {
    await fs.mkdir(directoryPath, { recursive: true });
}

/**
 * Chuyển tài liệu Mongoose thành đối tượng JSON thuần.
 */
function plain(document) {
    return document ? document.toJSON() : null;
}

/**
 * Sắp xếp các danh sách theo thứ tự thời gian mới nhất lên đầu.
 */
function byNewest(left, right) {
    return new Date(right.createdAt) - new Date(left.createdAt);
}

/**
 * Seed dữ liệu tài khoản quản trị viên và người dùng mẫu ban đầu.
 */
async function seedUsers() {
    if (await User.exists({})) {
        return;
    }

    const adminPassword = await bcrypt.hash('123456', 10);
    const userPassword = await bcrypt.hash('123456', 10);

    await User.create([
        {
            fullName: 'Quản trị viên',
            email: 'admin@example.com',
            username: 'admin',
            password: adminPassword,
            role: 'admin'
        },
        {
            fullName: 'Người dùng mẫu',
            email: 'user@example.com',
            username: 'user',
            password: userPassword,
            role: 'user'
        }
    ]);
}

/**
 * Seed dữ liệu danh mục môn học mặc định ban đầu.
 */
async function seedCategories() {
    if (await Category.exists({})) {
        return;
    }

    await Category.create(categorySeeds);
}

/**
 * Seed dữ liệu tài liệu học tập mẫu ban đầu.
 */
async function seedDocuments() {
    if (await Document.exists({})) {
        return;
    }

    const categories = await getCategories();

    await Document.create([
        {
            title: 'Tổng hợp đề cương Lập trình Web',
            subject: 'Lập trình Web',
            categoryId: 'co-so-nganh',
            categoryName: categories.find((item) => item.id === 'co-so-nganh').title,
            description: 'Bộ đề cương ngắn gọn cho phần HTML, CSS, JavaScript và Express.',
            content: 'Tài liệu tóm tắt kiến thức nền tảng để ôn thi cuối kỳ môn Lập trình Web.',
            originalFileName: 'de-cuong-lap-trinh-web.pdf',
            mimeType: 'application/pdf',
            uploader: 'admin'
        },
        {
            title: 'Slide nhập môn UI/UX',
            subject: 'UI/UX',
            categoryId: 'kien-thuc-bo-tro',
            categoryName: categories.find((item) => item.id === 'kien-thuc-bo-tro').title,
            description: 'Slide giới thiệu hành trình thiết kế trải nghiệm người dùng.',
            content: 'Gồm các khái niệm wireframe, prototype, heuristic và kiểm thử khả dụng.',
            originalFileName: 'slide-ui-ux.pptx',
            mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            uploader: 'admin'
        }
    ]);
}

/**
 * Seed cấu hình thông tin trang chủ mặc định ban đầu.
 */
async function seedSite() {
    const siteData = await Site.findOne({ id: 'default' });

    if (!siteData) {
        await Site.create(defaultSiteData);
        return;
    }

    await Site.updateOne({ id: 'default' }, {
        $set: {
            stats: {
                ...defaultSiteData.stats,
                ...(siteData.stats ? siteData.stats.toJSON() : {})
            },
            homeContent: {
                ...defaultSiteData.homeContent,
                ...(siteData.homeContent ? siteData.homeContent.toJSON() : {})
            },
            adPopup: {
                ...defaultSiteData.adPopup,
                ...(siteData.adPopup ? siteData.adPopup.toJSON() : {})
            }
        }
    });
}

/**
 * Hàm khởi tạo và nạp toàn bộ cơ sở dữ liệu mẫu ban đầu (khi chạy ứng dụng lần đầu).
 */
async function ensureSeedData() {
    await ensureDirectory(uploadsDir);
    await seedUsers();
    await seedCategories();
    await seedDocuments();
    await seedSite();
}

/**
 * Lấy danh sách toàn bộ tài khoản người dùng, sắp xếp mới nhất lên đầu.
 */
async function getUsers() {
    return (await User.find({}).sort({ createdAt: -1 })).map(plain);
}

/**
 * Lấy thông tin tài khoản người dùng theo mã ID.
 */
async function getUserById(id) {
    return plain(await User.findOne({ id }));
}

/**
 * Lấy danh sách toàn bộ danh mục tài liệu, sắp xếp theo thứ tự bảng chữ cái tiêu đề.
 */
async function getCategories() {
    return (await Category.find({}).sort({ title: 1 })).map(plain);
}

/**
 * Lấy danh sách toàn bộ tài liệu học tập, sắp xếp theo thời gian đăng mới nhất.
 */
async function getDocuments() {
    return (await Document.find({}).sort({ createdAt: -1 })).map(plain);
}

/**
 * Lấy thông tin chi tiết một tài liệu theo mã ID.
 */
async function getDocumentById(id) {
    return plain(await Document.findOne({ id }));
}

/**
 * Thêm tài khoản người dùng mới.
 */
async function createUser(user) {
    return plain(await User.create(user));
}

/**
 * Cập nhật thông tin tài khoản người dùng.
 */
async function updateUser(id, payload) {
    const nextPayload = {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        username: payload.username,
        role: payload.role,
        updatedAt: new Date()
    };

    return plain(await User.findOneAndUpdate({ id }, nextPayload, { returnDocument: 'after' }));
}

/**
 * Xóa tài khoản người dùng theo mã ID.
 */
async function deleteUser(id) {
    const deleted = await User.findOneAndDelete({ id });
    return Boolean(deleted);
}

/**
 * Thêm tài liệu mới vào cơ sở dữ liệu.
 * Nếu tài liệu tải lên kèm tệp tin vật lý (fileBuffer), ghi file vật lý vào thư mục uploads/.
 */
async function createDocument(document) {
    if (document.fileBuffer) {
        const filePath = path.join(uploadsDir, document.storedFileName);
        await fs.writeFile(filePath, document.fileBuffer);
    }

    return plain(await Document.create({
        title: document.title,
        subject: document.subject,
        categoryId: document.categoryId,
        categoryName: document.categoryName,
        description: document.description,
        content: document.content,
        sourceType: document.sourceType,
        driveLink: document.driveLink,
        originalFileName: document.originalFileName,
        storedFileName: document.storedFileName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        uploader: document.uploader,
        uploaderId: document.uploaderId
    }));
}

/**
 * Cập nhật thông tin chi tiết của tài liệu.
 */
async function updateDocument(id, payload) {
    const categories = await getCategories();
    const document = await getDocumentById(id);

    if (!document) {
        return null;
    }

    const nextCategory = categories.find((item) => item.id === payload.categoryId) || null;

    return plain(await Document.findOneAndUpdate({ id }, {
        title: payload.title,
        subject: payload.subject,
        description: payload.description,
        content: payload.content,
        categoryId: payload.categoryId,
        categoryName: nextCategory ? nextCategory.title : document.categoryName,
        driveLink: payload.driveLink || document.driveLink || '',
        updatedAt: new Date()
    }, { returnDocument: 'after' }));
}

/**
 * Tăng lượt xem của tài liệu lên 1 đơn vị.
 */
async function incrementDocumentView(id) {
    return plain(await Document.findOneAndUpdate({ id }, {
        $inc: { viewCount: 1 }
    }, { returnDocument: 'after' }));
}

/**
 * Xóa tài liệu khỏi hệ thống.
 * Đồng thời xóa file vật lý tương ứng trong thư mục uploads/ (nếu có) và tất cả bình luận liên quan.
 */
async function deleteDocument(id) {
    const document = await Document.findOneAndDelete({ id });

    if (!document) {
        return false;
    }

    if (document.storedFileName) {
        const targetPath = path.join(uploadsDir, document.storedFileName);

        try {
            await fs.unlink(targetPath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    await Comment.deleteMany({ documentId: id });
    return true;
}

/**
 * Lấy danh sách toàn bộ bình luận của website.
 */
async function getComments() {
    return (await Comment.find({}).sort({ createdAt: -1 })).map(plain);
}

/**
 * Lấy danh sách tất cả bình luận trực thuộc một Tài liệu cụ thể.
 */
async function getCommentsByDocumentId(documentId) {
    return (await Comment.find({ documentId }).sort({ createdAt: -1 })).map(plain);
}

/**
 * Tạo một bình luận mới cho tài liệu.
 */
async function createComment(comment) {
    return plain(await Comment.create(comment));
}

/**
 * Xóa bình luận theo mã ID.
 */
async function deleteComment(id) {
    const deleted = await Comment.findOneAndDelete({ id });
    return Boolean(deleted);
}

/**
 * Lấy toàn bộ danh sách ý kiến/liên hệ đóng góp ý kiến phản hồi của người dùng.
 */
async function getContacts() {
    return (await Contact.find({}).sort({ createdAt: -1 })).map(plain);
}

/**
 * Tạo bản ghi phản hồi/liên hệ đóng góp ý kiến phản hồi mới.
 */
async function createContact(contact) {
    return plain(await Contact.create(contact));
}

/**
 * Xóa bản ghi liên hệ.
 */
async function deleteContact(id) {
    const deleted = await Contact.findOneAndDelete({ id });
    return Boolean(deleted);
}

/**
 * Lấy cấu hình thông tin hiển thị website chung.
 */
async function getSiteData() {
    const siteData = plain(await Site.findOne({ id: 'default' }));
    return {
        ...defaultSiteData,
        ...(siteData || {}),
        stats: {
            ...defaultSiteData.stats,
            ...((siteData && siteData.stats) || {})
        },
        homeContent: {
            ...defaultSiteData.homeContent,
            ...((siteData && siteData.homeContent) || {})
        },
        adPopup: {
            ...defaultSiteData.adPopup,
            ...((siteData && siteData.adPopup) || {})
        }
    };
}

/**
 * Cập nhật cấu hình thông tin chung và cấu hình popup quảng cáo.
 */
async function updateSiteData(payload) {
    const current = await getSiteData();
    const nextSiteData = {
        ...current,
        ...payload,
        id: 'default',
        homeContent: {
            ...current.homeContent,
            ...(payload.homeContent || {})
        },
        adPopup: {
            ...current.adPopup,
            ...(payload.adPopup || {})
        },
        stats: {
            ...current.stats,
            ...(payload.stats || {})
        }
    };

    await Site.updateOne({ id: 'default' }, { $set: nextSiteData }, { upsert: true });
    return nextSiteData;
}

/**
 * Tăng lượt truy cập chung của trang web (Site Views Count) lên 1 đơn vị.
 */
async function incrementSiteViews() {
    const siteData = await Site.findOneAndUpdate({ id: 'default' }, {
        $inc: { 'stats.totalViews': 1 }
    }, { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true });

    return siteData.stats.totalViews;
}

module.exports = {
    ensureSeedData,
    filePaths,
    getCategories,
    getComments,
    getCommentsByDocumentId,
    getContacts,
    getDocumentById,
    getDocuments,
    getSiteData,
    getUserById,
    getUsers,
    createComment,
    createContact,
    createDocument,
    createUser,
    deleteComment,
    deleteContact,
    deleteDocument,
    deleteUser,
    incrementDocumentView,
    incrementSiteViews,
    updateDocument,
    updateSiteData,
    updateUser
};
