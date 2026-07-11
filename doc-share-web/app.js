/*
 Tệp tin khởi chạy ứng dụng Express (Backend).
 Cấu hình: Express App, Middlewares, Session, Cổng kết nối,
 Tải lên tệp tin và toàn bộ các Router giao diện (Web Views) & API (cho Mobile App).
 */

const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const { connectMongoDB } = require('./lib/mongodb');

// Import các chức năng quản trị và thao tác cơ sở dữ liệu
const {
    filePaths,
    ensureSeedData,
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
} = require('./lib/database');

const app = express();
const PORT = 3000;

// Các định dạng tệp tin cho phép tải trực tiếp lên máy chủ
const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx'];

// Giới hạn dung lượng file tải lên tối đa là 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Cấu hình EJS làm template engine để kết xuất (render) giao diện web
app.set('view engine', 'ejs');

// Cấu hình body-parser nhận dữ liệu từ form và JSON (nâng giới hạn lên 150mb để xử lý tệp base64 dung lượng lớn)
app.use(express.urlencoded({ extended: true, limit: '150mb' }));
app.use(express.json({ limit: '150mb' }));

// Cấu hình thư mục chứa tài nguyên tĩnh (css, js, ảnh) và thư mục lưu file tải lên
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cấu hình quản lý phiên đăng nhập người dùng (Session)
app.use(session({
    secret: 'doc-share-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Middleware toàn cục nạp thông tin người dùng đăng nhập, danh mục và cấu hình trang vào res.locals
app.use(async (req, res, next) => {
    try {
        res.locals.user = req.session.user || null;
        res.locals.categories = await getCategories();
        res.locals.siteData = await getSiteData();
        next();
    } catch (error) {
        next(error);
    }
});

// Hàm loại bỏ khoảng trắng thừa ở hai đầu chuỗi
function normalizeText(value) {
    return (value || '').trim();
}

// Hàm chuẩn hóa giá trị boolean từ form gửi lên
function normalizeBoolean(value) {
    return value === 'true' || value === 'on' || value === true;
}

// Middleware kiểm tra quyền đăng nhập thành viên (bảo vệ các route riêng tư)
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// Middleware kiểm tra quyền quản trị viên (Admin)
function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }
    next();
}

// Hàm lấy đuôi mở rộng của tệp tin để kiểm tra hợp lệ
function getExtension(fileName) {
    return fileName.split('.').pop().toLowerCase();
}

// Kiểm tra liên kết gửi lên có đúng định dạng Google Drive hay Google Docs hay không
function isGoogleDriveLink(value) {
    return /^https:\/\/(drive|docs)\.google\.com\/.+/i.test(value);
}

// Middleware ghi nhận lượt truy cập chung của trang web mỗi lần người dùng tải trang
async function trackSiteView(req, res, next) {
    try {
        await incrementSiteViews();
        next();
    } catch (error) {
        next(error);
    }
}

// Tính điểm sao trung bình của tài liệu từ danh sách bình luận
function averageRating(comments) {
    if (comments.length === 0) {
        return 0;
    }
    const total = comments.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return total / comments.length;
}

/**
 * =========================================================================
 * ROUTER CHO GIAO DIỆN NGƯỜI DÙNG TRÊN WEBSITE (WEB VIEWS)
 * =========================================================================
 */

// Trang chủ website (Hiển thị giới thiệu, danh mục, tài liệu mới nhất và popup quảng cáo)
app.get('/', trackSiteView, async (req, res, next) => {
    try {
        const categories = await getCategories();
        const documentItems = (await getDocuments()).slice(0, 6);
        const homeContent = res.locals.siteData.homeContent;
        const adPopup = res.locals.siteData.adPopup;

        res.render('home', {
            categories,
            documentItems,
            homeContent,
            adPopup,
            contactSuccess: req.query.contactSuccess || null,
            contactError: null
        });
    } catch (error) {
        next(error);
    }
});

// Trang hiển thị thông tin Liên hệ
app.get('/contact', trackSiteView, async (req, res, next) => {
    try {
        res.render('contact', {
            homeContent: res.locals.siteData.homeContent,
            contactSuccess: req.query.contactSuccess || null,
            contactError: null
        });
    } catch (error) {
        next(error);
    }
});

// Xử lý gửi ý kiến liên hệ từ form chân trang hoặc trang liên hệ
app.post('/contact', async (req, res, next) => {
    try {
        const name = normalizeText(req.body.name);
        const email = normalizeText(req.body.email);
        const message = normalizeText(req.body.message);

        if (!name || !email || !message) {
            return res.status(400).render('contact', {
                homeContent: res.locals.siteData.homeContent,
                contactSuccess: null,
                contactError: 'Vui lòng nhập đầy đủ họ tên, email và nội dung liên hệ.'
            });
        }

        await createContact({ name, email, message });
        res.redirect('/contact?contactSuccess=' + encodeURIComponent('Đã gửi ý kiến liên hệ thành công.'));
    } catch (error) {
        next(error);
    }
});

// Trang danh sách tài liệu chia sẻ (hỗ trợ tìm kiếm từ khóa và lọc danh mục)
app.get('/documents', trackSiteView, async (req, res, next) => {
    try {
        const keyword = normalizeText(req.query.q).toLowerCase();
        const categoryId = normalizeText(req.query.category);
        const categories = await getCategories();
        const documentItems = await getDocuments();

        const filteredDocuments = documentItems.filter((item) => {
            const matchCategory = !categoryId || item.categoryId === categoryId;
            const searchable = [
                item.title,
                item.subject,
                item.description,
                item.content
            ].join(' ').toLowerCase();
            const matchKeyword = !keyword || searchable.includes(keyword);

            return matchCategory && matchKeyword;
        });

        res.render('documents', {
            categories,
            documentItems: filteredDocuments,
            filters: {
                q: req.query.q || '',
                category: categoryId
            }
        });
    } catch (error) {
        next(error);
    }
});

// Trang chi tiết tài liệu học tập
app.get('/documents/:id', trackSiteView, async (req, res, next) => {
    try {
        await incrementDocumentView(req.params.id); // Tăng lượt xem
        const documentItem = await getDocumentById(req.params.id);

        if (!documentItem) {
            return res.status(404).render('not-found', {
                message: 'Không tìm thấy tài liệu bạn yêu cầu.'
            });
        }

        const comments = await getCommentsByDocumentId(req.params.id);

        res.render('document-detail', {
            documentItem,
            comments,
            ratingAverage: averageRating(comments),
            ratingCount: comments.length,
            commentError: null,
            commentForm: {},
            // Yêu cầu đăng nhập mới được xem toàn văn nội dung và tải file
            canAccessFullContent: Boolean(req.session.user)
        });
    } catch (error) {
        next(error);
    }
});

// Gửi bình luận và đánh giá số sao của tài liệu
app.post('/documents/:id/comments', async (req, res, next) => {
    try {
        const documentItem = await getDocumentById(req.params.id);

        if (!documentItem) {
            return res.status(404).render('not-found', {
                message: 'Không tìm thấy tài liệu để bình luận.'
            });
        }

        const currentUser = req.session.user ? await getUserById(req.session.user.id) : null;
        const name = currentUser ? currentUser.fullName : normalizeText(req.body.name);
        const email = currentUser ? currentUser.email : normalizeText(req.body.email);
        const content = normalizeText(req.body.content);
        const rating = Number(req.body.rating);

        if (!name || !email || !content || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            const comments = await getCommentsByDocumentId(req.params.id);

            return res.status(400).render('document-detail', {
                documentItem,
                comments,
                ratingAverage: averageRating(comments),
                ratingCount: comments.length,
                commentError: 'Vui lòng nhập đầy đủ tên, email, nội dung và điểm đánh giá từ 1 đến 5.',
                commentForm: req.body,
                canAccessFullContent: Boolean(req.session.user)
            });
        }

        await createComment({
            documentId: documentItem.id,
            documentTitle: documentItem.title,
            userId: currentUser ? currentUser.id : '',
            name,
            email,
            content,
            rating
        });

        res.redirect(`/documents/${documentItem.id}#comments`);
    } catch (error) {
        next(error);
    }
});

// Trang upload đăng tải tài liệu của người dùng
app.get('/upload', requireAuth, trackSiteView, async (req, res) => {
    res.render('upload', {
        error: null,
        success: req.query.success || null,
        formData: {}
    });
});

// Xử lý gửi Form tải tài liệu lên (Hỗ trợ upload đồng thời cả tệp và link Drive)
app.post('/upload', requireAuth, async (req, res, next) => {
    try {
        const title = normalizeText(req.body.title);
        const subject = normalizeText(req.body.subject);
        const categoryId = normalizeText(req.body.categoryId);
        const description = normalizeText(req.body.description);
        const content = normalizeText(req.body.content);
        const driveLink = normalizeText(req.body.driveLink);
        const fileName = normalizeText(req.body.fileName);
        const mimeType = normalizeText(req.body.mimeType);
        const fileData = req.body.fileData || '';

        const hasFile = fileName && fileData;
        const hasLink = driveLink;

        // Phân loại nguồn tải lên
        let sourceType = 'file';
        if (hasFile && hasLink) {
            sourceType = 'both';
        } else if (hasLink) {
            sourceType = 'google-drive';
        } else {
            sourceType = 'file';
        }

        // Báo lỗi nếu cả file và link đều trống
        if (!title || !subject || !categoryId || !description || !content || (!hasFile && !hasLink)) {
            return res.status(400).render('upload', {
                error: 'Vui lòng nhập đầy đủ thông tin và chọn tệp hoặc nhập link Google Drive.',
                success: null,
                formData: req.body
            });
        }

        // Kiểm tra tính hợp lệ của link Drive
        if (hasLink && !isGoogleDriveLink(driveLink)) {
            return res.status(400).render('upload', {
                error: 'Link Google Drive không hợp lệ.',
                success: null,
                formData: req.body
            });
        }

        let buffer = null;
        let storedFileName = '';
        let fileSize = 0;

        // Nếu tải lên file vật lý, tiến hành giải mã chuỗi Base64 và lưu trữ
        if (hasFile) {
            const extension = getExtension(fileName);

            if (!ALLOWED_EXTENSIONS.includes(extension)) {
                return res.status(400).render('upload', {
                    error: 'Chỉ hỗ trợ tệp PDF, DOCX hoặc PPTX.',
                    success: null,
                    formData: req.body
                });
            }

            buffer = Buffer.from(fileData, 'base64');

            if (buffer.length > MAX_FILE_SIZE) {
                return res.status(400).render('upload', {
                    error: 'Kích thước tệp vượt quá 100MB.',
                    success: null,
                    formData: req.body
                });
            }

            storedFileName = `${randomUUID()}.${extension}`;
            fileSize = buffer.length;
        }

        const category = res.locals.categories.find((item) => item.id === categoryId);

        if (!category) {
            return res.status(400).render('upload', {
                error: 'Danh mục không hợp lệ.',
                success: null,
                formData: req.body
            });
        }

        await createDocument({
            title,
            subject,
            categoryId,
            categoryName: category.title,
            description,
            content,
            sourceType,
            driveLink: hasLink ? driveLink : '',
            originalFileName: hasFile ? fileName : '',
            storedFileName: hasFile ? storedFileName : '',
            mimeType: hasFile ? mimeType : '',
            fileBuffer: buffer,
            fileSize,
            uploader: req.session.user.username,
            uploaderId: req.session.user.id
        });

        res.redirect('/upload?success=' + encodeURIComponent('Tải tài liệu lên thành công.'));
    } catch (error) {
        next(error);
    }
});

// Tải tài liệu xuống (Nếu có file vật lý thì download, nếu chỉ có link Drive thì chuyển hướng)
app.get('/download/:id', async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const documentItem = await getDocumentById(req.params.id);

        if (!documentItem) {
            return res.status(404).render('not-found', {
                message: 'Tài liệu không tồn tại để tải xuống.'
            });
        }

        if (documentItem.storedFileName) {
            const filePath = path.join(__dirname, 'uploads', documentItem.storedFileName);
            return res.download(filePath, documentItem.originalFileName);
        }

        if (documentItem.driveLink) {
            return res.redirect(documentItem.driveLink);
        }

        return res.status(400).render('not-found', {
            message: 'Tài liệu mẫu này chưa có tệp hoặc link để tải xuống.'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * =========================================================================
 * ROUTER CHO TRANG QUẢN TRỊ ADMIN (ADMIN VIEW CHANNELS)
 * =========================================================================
 */

// Trang tổng quan quản trị (Dashboard chính hiển thị thống kê tổng hợp và danh sách tài liệu mới)
app.get('/admin', requireAdmin, trackSiteView, async (req, res, next) => {
    try {
        const siteData = await getSiteData();
        const documentItems = await getDocuments();
        const comments = await getComments();
        const contacts = await getContacts();

        res.render('admin-dashboard', {
            siteData,
            documentItems,
            comments,
            contacts,
            dataFilePaths: filePaths
        });
    } catch (error) {
        next(error);
    }
});

// Trang cấu hình cập nhật nội dung văn bản trang chủ & popup quảng cáo
app.get('/admin/content', requireAdmin, trackSiteView, async (req, res, next) => {
    try {
        res.render('admin-content', {
            siteData: await getSiteData(),
            success: req.query.success || null
        });
    } catch (error) {
        next(error);
    }
});

// Xử lý lưu cấu hình cập nhật nội dung website
app.post('/admin/content', requireAdmin, async (req, res, next) => {
    try {
        await updateSiteData({
            homeContent: {
                heroTitle: normalizeText(req.body.heroTitle),
                heroText: normalizeText(req.body.heroText),
                aboutTitle: normalizeText(req.body.aboutTitle),
                aboutText: normalizeText(req.body.aboutText),
                contactTitle: normalizeText(req.body.contactTitle),
                contactText: normalizeText(req.body.contactText),
                contactEmail: normalizeText(req.body.contactEmail),
                contactPhone: normalizeText(req.body.contactPhone),
                contactAddress: normalizeText(req.body.contactAddress)
            },
            adPopup: {
                enabled: normalizeBoolean(req.body.adEnabled),
                title: normalizeText(req.body.adTitle),
                message: normalizeText(req.body.adMessage),
                buttonText: normalizeText(req.body.adButtonText),
                buttonLink: normalizeText(req.body.adButtonLink)
            }
        });

        res.redirect('/admin/content?success=' + encodeURIComponent('Cập nhật nội dung thành công.'));
    } catch (error) {
        next(error);
    }
});

// Trang danh sách quản lý tài liệu (Dạng bảng kèm chức năng tìm kiếm & lọc theo danh mục)
app.get('/admin/documents', requireAdmin, trackSiteView, async (req, res, next) => {
    try {
        const q = normalizeText(req.query.q).toLowerCase();
        const categoryId = normalizeText(req.query.category);
        
        let documentItems = await getDocuments();
        
        if (q) {
            documentItems = documentItems.filter(item => 
                item.title.toLowerCase().includes(q) ||
                item.subject.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.content.toLowerCase().includes(q) ||
                item.uploader.toLowerCase().includes(q)
            );
        }
        
        if (categoryId) {
            documentItems = documentItems.filter(item => item.categoryId === categoryId);
        }

        res.render('admin-documents', {
            documentItems,
            success: req.query.success || null,
            filters: { q, category: categoryId }
        });
    } catch (error) {
        next(error);
    }
});

// Trang chi tiết tài liệu học tập dành cho admin (Cho phép trực tiếp sửa đổi text hoặc xóa tài liệu)
app.get('/admin/documents/:id', requireAdmin, trackSiteView, async (req, res, next) => {
    try {
        const documentItem = await getDocumentById(req.params.id);
        
        if (!documentItem) {
            return res.status(404).render('not-found', {
                message: 'Không tìm thấy tài liệu bạn yêu cầu.'
            });
        }
        
        res.render('admin-document-detail', {
            documentItem,
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        next(error);
    }
});

// Xử lý cập nhật thông tin tài liệu từ trang chi tiết quản trị
app.post('/admin/documents/:id/update', requireAdmin, async (req, res, next) => {
    try {
        const updated = await updateDocument(req.params.id, {
            title: normalizeText(req.body.title),
            subject: normalizeText(req.body.subject),
            description: normalizeText(req.body.description),
            content: normalizeText(req.body.content),
            categoryId: normalizeText(req.body.categoryId)
        });

        if (!updated) {
            return res.status(404).render('not-found', {
                message: 'Không tìm thấy tài liệu để cập nhật.'
            });
        }

        res.redirect('/admin/documents?success=' + encodeURIComponent('Đã cập nhật tài liệu.'));
    } catch (error) {
        next(error);
    }
});

// Xử lý xóa bỏ tài liệu khỏi hệ thống
app.post('/admin/documents/:id/delete', requireAdmin, async (req, res, next) => {
    try {
        const deleted = await deleteDocument(req.params.id);

        if (!deleted) {
            return res.status(404).render('not-found', {
                message: 'Không tìm thấy tài liệu để xóa.'
            });
        }

        res.redirect('/admin/documents?success=' + encodeURIComponent('Đã xóa tài liệu.'));
    } catch (error) {
        next(error);
    }
});

// Trang danh sách quản lý bình luận (Dạng bảng kèm bộ lọc tìm kiếm & lọc sao đánh giá)
app.get('/admin/comments', requireAdmin, trackSiteView, async (req, res, next) => {
    try {
        const q = normalizeText(req.query.q).toLowerCase();
        const rating = normalizeText(req.query.rating);
        
        let comments = await getComments();
        
        if (q) {
            comments = comments.filter(c => 
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.content.toLowerCase().includes(q) ||
                c.documentTitle.toLowerCase().includes(q)
            );
        }
        
        if (rating) {
            comments = comments.filter(c => String(c.rating) === rating);
        }

        res.render('admin-comments', {
            comments,
            success: req.query.success || null,
            filters: { q, rating }
        });
    } catch (error) {
        next(error);
    }
});

// Xử lý xóa bình luận của người dùng
app.post('/admin/comments/:id/delete', requireAdmin, async (req, res, next) => {
    try {
        await deleteComment(req.params.id);
        res.redirect('/admin/comments?success=' + encodeURIComponent('Đã xóa bình luận.'));
    } catch (error) {
        next(error);
    }
});

// Trang danh sách quản lý tài khoản người dùng (Hỗ trợ lọc tìm kiếm từ khóa & bộ lọc phân vai trò)
app.get('/admin/users', requireAdmin, trackSiteView, async (req, res, next) => {
    try {
        const q = normalizeText(req.query.q).toLowerCase();
        const role = normalizeText(req.query.role);
        
        let users = await getUsers();
        
        if (q) {
            users = users.filter(u => 
                u.fullName.toLowerCase().includes(q) ||
                (u.email && u.email.toLowerCase().includes(q)) ||
                (u.phone && u.phone.toLowerCase().includes(q)) ||
                u.username.toLowerCase().includes(q)
            );
        }
        
        if (role) {
            users = users.filter(u => u.role === role);
        }

        res.render('admin-users', {
            users,
            success: req.query.success || null,
            error: null,
            formData: {},
            filters: { q, role }
        });
    } catch (error) {
        next(error);
    }
});

// Xử lý tạo mới tài khoản thành viên từ phía trang quản trị Admin
app.post('/admin/users/create', requireAdmin, async (req, res, next) => {
    try {
        const fullName = normalizeText(req.body.fullName);
        const email = normalizeText(req.body.email);
        const phone = normalizeText(req.body.phone);
        const username = normalizeText(req.body.username);
        const password = req.body.password || '';
        const role = normalizeText(req.body.role) || 'user';

        if (!fullName || !email || !username || password.length < 6) {
            return res.status(400).render('admin-users', {
                users: await getUsers(),
                success: null,
                error: 'Vui lòng nhập đủ họ tên, email, username và mật khẩu tối thiểu 6 ký tự.',
                formData: req.body,
                filters: { q: '', role: '' }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser({
            fullName,
            email,
            phone,
            username,
            password: hashedPassword,
            role
        });

        res.redirect('/admin/users?success=' + encodeURIComponent('Đã tạo tài khoản.'));
    } catch (error) {
        next(error);
    }
});

// Xử lý cập nhật thông tin tài khoản người dùng trực tiếp trên hàng của bảng
app.post('/admin/users/:id/update', requireAdmin, async (req, res, next) => {
    try {
        await updateUser(req.params.id, {
            fullName: normalizeText(req.body.fullName),
            email: normalizeText(req.body.email),
            phone: normalizeText(req.body.phone),
            username: normalizeText(req.body.username),
            role: normalizeText(req.body.role)
        });

        res.redirect('/admin/users?success=' + encodeURIComponent('Đã cập nhật tài khoản.'));
    } catch (error) {
        next(error);
    }
});

// Xử lý xóa tài khoản thành viên
app.post('/admin/users/:id/delete', requireAdmin, async (req, res, next) => {
    try {
        // Chặn admin tự thực hiện xóa tài khoản chính mình đang đăng nhập
        if (req.params.id === req.session.user.id) {
            return res.status(400).render('admin-users', {
                users: await getUsers(),
                success: null,
                error: 'Không thể xóa chính tài khoản admin đang đăng nhập.',
                formData: {},
                filters: { q: '', role: '' }
            });
        }

        await deleteUser(req.params.id);
        res.redirect('/admin/users?success=' + encodeURIComponent('Đã xóa tài khoản.'));
    } catch (error) {
        next(error);
    }
});

// Trang hiển thị danh sách ý kiến/liên hệ đóng góp ý kiến phản hồi (Dạng bảng kèm bộ lọc tìm kiếm)
app.get('/admin/contacts', requireAdmin, trackSiteView, async (req, res, next) => {
    try {
        const q = normalizeText(req.query.q).toLowerCase();
        
        let contacts = await getContacts();
        
        if (q) {
            contacts = contacts.filter(c => 
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.message.toLowerCase().includes(q)
            );
        }

        res.render('admin-contacts', {
            contacts,
            success: req.query.success || null,
            filters: { q }
        });
    } catch (error) {
        next(error);
    }
});

// Xử lý xóa phản hồi từ trang quản trị
app.post('/admin/contacts/:id/delete', requireAdmin, async (req, res, next) => {
    try {
        await deleteContact(req.params.id);
        res.redirect('/admin/contacts?success=' + encodeURIComponent('Đã xóa ý kiến liên hệ.'));
    } catch (error) {
        next(error);
    }
});

// Trang đăng nhập của website
app.get('/login', trackSiteView, (req, res) => {
    res.render('login', {
        error: null,
        success: req.query.success || null
    });
});

// Xử lý xác thực đăng nhập người dùng (Web Session)
app.post('/login', async (req, res, next) => {
    try {
        const username = normalizeText(req.body.username);
        const password = req.body.password || '';
        const users = await getUsers();
        const user = users.find((item) => item.username === username);

        if (!user) {
            return res.status(400).render('login', {
                error: 'Sai tên đăng nhập hoặc mật khẩu.',
                success: null
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).render('login', {
                error: 'Sai tên đăng nhập hoặc mật khẩu.',
                success: null
            });
        }

        // Lưu thông tin người dùng vào session
        req.session.user = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            role: user.role
        };

        // Chuyển hướng sang trang quản trị nếu là Admin, hoặc về Trang chủ nếu là User thường
        res.redirect(user.role === 'admin' ? '/admin' : '/');
    } catch (error) {
        next(error);
    }
});

// Trang đăng ký tài khoản thành viên
app.get('/register', trackSiteView, (req, res) => {
    res.render('register', {
        error: null,
        formData: {}
    });
});

// Xử lý đăng ký tài khoản người dùng mới
app.post('/register', async (req, res, next) => {
    try {
        const fullName = normalizeText(req.body.fullName);
        const email = normalizeText(req.body.email);
        const phone = normalizeText(req.body.phone);
        const username = normalizeText(req.body.username);
        const password = req.body.password || '';
        const confirmPassword = req.body.confirmPassword || '';

        if (!fullName || !email || !username || !password || !confirmPassword) {
            return res.status(400).render('register', {
                error: 'Vui lòng nhập đầy đủ thông tin đăng ký.',
                formData: req.body
            });
        }

        if (password.length < 6) {
            return res.status(400).render('register', {
                error: 'Mật khẩu phải có ít nhất 6 ký tự.',
                formData: req.body
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).render('register', {
                error: 'Mật khẩu xác nhận không khớp.',
                formData: req.body
            });
        }

        const users = await getUsers();
        const existingUser = users.find((item) => item.username === username);

        if (existingUser) {
            return res.status(400).render('register', {
                error: 'Tên đăng nhập đã tồn tại.',
                formData: req.body
            });
        }

        const existingEmail = users.find((item) => item.email && item.email.toLowerCase() === email.toLowerCase());

        if (existingEmail) {
            return res.status(400).render('register', {
                error: 'Email này đã được đăng ký sử dụng.',
                formData: req.body
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser({
            fullName,
            email,
            phone,
            username,
            password: hashedPassword,
            role: 'user'
        });

        res.redirect('/login?success=' + encodeURIComponent('Đăng ký tài khoản thành công! Vui lòng đăng nhập.'));
    } catch (error) {
        next(error);
    }
});

// Route đăng xuất tài khoản (Xóa session và đưa về trang chủ)
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

//---------------Mobile--------------------
// CÁC REST API ENDPOINTS PHỤC VỤ DÀNH CHO MOBILE APP (JSON INTERFACES)

// Lấy danh sách toàn bộ danh mục tài liệu phục vụ Mobile App
app.get('/api/categories', async (req, res, next) => {
    try {
        const categories = await getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy danh sách tài liệu phục vụ Mobile App (Hỗ trợ tìm kiếm từ khóa và lọc danh mục)
app.get('/api/documents', async (req, res, next) => {
    try {
        const keyword = normalizeText(req.query.q).toLowerCase();
        const categoryId = normalizeText(req.query.category);
        const documentItems = await getDocuments();

        const filteredDocuments = documentItems.filter((item) => {
            const matchCategory = !categoryId || item.categoryId === categoryId;
            const searchable = [
                item.title,
                item.subject,
                item.description,
                item.content
            ].join(' ').toLowerCase();
            const matchKeyword = !keyword || searchable.includes(keyword);

            return matchCategory && matchKeyword;
        });

        res.json(filteredDocuments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy thông tin tài liệu & danh sách bình luận theo ID cho Mobile App
app.get('/api/documents/:id', async (req, res, next) => {
    try {
        await incrementDocumentView(req.params.id);
        const documentItem = await getDocumentById(req.params.id);
        if (!documentItem) {
            return res.status(404).json({ error: 'Không tìm thấy tài liệu.' });
        }
        const comments = await getCommentsByDocumentId(req.params.id);
        res.json({ document: documentItem, comments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gửi bình luận tài liệu mới từ Mobile App
app.post('/api/documents/:id/comments', async (req, res, next) => {
    try {
        const documentItem = await getDocumentById(req.params.id);
        if (!documentItem) {
            return res.status(404).json({ error: 'Không tìm thấy tài liệu.' });
        }

        const name = normalizeText(req.body.name);
        const email = normalizeText(req.body.email);
        const content = normalizeText(req.body.content);
        const rating = Number(req.body.rating);
        const userId = normalizeText(req.body.userId);

        if (!name || !email || !content || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin bình luận và chọn điểm đánh giá.' });
        }

        const comment = await createComment({
            documentId: documentItem.id,
            documentTitle: documentItem.title,
            userId: userId || '',
            name,
            email,
            content,
            rating
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Đăng nhập tài khoản từ Mobile App (Xác thực và trả về JSON thông tin user)
app.post('/api/login', async (req, res, next) => {
    try {
        const username = normalizeText(req.body.username);
        const password = req.body.password || '';
        const users = await getUsers();
        const user = users.find((item) => item.username === username);

        if (!user) {
            return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ error: 'Sai tên đăng nhập hoặc mật khẩu.' });
        }

        res.json({
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Đăng ký tài khoản mới từ Mobile App
app.post('/api/register', async (req, res, next) => {
    try {
        const fullName = normalizeText(req.body.fullName);
        const email = normalizeText(req.body.email);
        const phone = normalizeText(req.body.phone);
        const username = normalizeText(req.body.username);
        const password = req.body.password || '';

        if (!fullName || !email || !username || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ các trường thông tin bắt buộc.' });
        }

        const users = await getUsers();
        const userExists = users.some(u => u.username === username);
        if (userExists) {
            return res.status(400).json({ error: 'Tên đăng nhập này đã được sử dụng.' });
        }

        const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
            return res.status(400).json({ error: 'Email này đã được đăng ký sử dụng.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser({
            fullName,
            email,
            phone,
            username,
            password: hashedPassword,
            role: 'user'
        });

        res.status(201).json({ success: true, user: { id: newUser.id, username: newUser.username } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gửi ý kiến phản hồi/liên hệ từ Mobile App
app.post('/api/contact', async (req, res, next) => {
    try {
        const name = normalizeText(req.body.name);
        const email = normalizeText(req.body.email);
        const message = normalizeText(req.body.message);

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Vui lòng nhập đầy đủ họ tên, email và nội dung liên hệ.' });
        }

        const contact = await createContact({ name, email, message });
        res.status(201).json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy toàn bộ thông tin nội dung chung & popup của site phục vụ Mobile App
app.get('/api/site-data', async (req, res, next) => {
    try {
        const siteData = await getSiteData();
        res.json(siteData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//ERROR HANDLER & START SERVER

// Middleware toàn cục xử lý lỗi 500
app.use(async (error, req, res, next) => {
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    let categories = res.locals.categories;
    let siteData = res.locals.siteData;

    // Load lại dữ liệu dự phòng từ DB nếu middleware trước bị lỗi nửa chừng
    if (!categories || !siteData) {
        try {
            categories = categories || await getCategories();
            siteData = siteData || await getSiteData();
        } catch (dbError) {
            console.error('Lỗi khi tải dữ liệu trong Error Handler:', dbError.message);
            categories = categories || [];
            siteData = siteData || { homeContent: { aboutTitle: '', aboutText: '' } };
        }
    }

    res.status(500).render('not-found', {
        message: 'Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.',
        user: req.session ? req.session.user : null,
        categories: categories,
        siteData: siteData
    });
});

// Hàm khởi chạy hệ thống: Kết nối cơ sở dữ liệu MongoDB, nạp seed data mẫu và lắng nghe cổng 3000.
async function startServer() {
    try {
        await connectMongoDB();
        await ensureSeedData(); // Nạp dữ liệu mẫu ban đầu nếu bộ sưu tập trống

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Cannot start server:', error.message);
        process.exit(1);
    }
}

startServer();
