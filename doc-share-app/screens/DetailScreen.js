import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { fetchDocumentById, addComment } from '../services/api';
import FadeInView from '../components/FadeInView';

export default function DetailScreen({ route, navigation, userSession }) {
    // Đọc tham số id truyền sang từ màn hình danh sách (Slide 186)
    const { id } = route.params;

    const [docData, setDocData] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Comment form states
    const [name, setName] = useState(userSession ? userSession.fullName : '');
    const [email, setEmail] = useState(userSession ? userSession.email : '');
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        loadDetail();
    }, [id]);

    useEffect(() => {
        if (userSession) {
            setName(userSession.fullName);
            setEmail(userSession.email);
        }
    }, [userSession]);

    const loadDetail = async () => {
        setLoading(true);
        setError('');
        try {
            // Tải chi tiết tài liệu và tăng lượt xem trực tiếp qua API
            const data = await fetchDocumentById(id);
            setDocData(data.document);
            setComments(data.comments || []);
        } catch (err) {
            setError('Lỗi tải chi tiết tài liệu học tập.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        setSubmitError('');
        setSubmitSuccess(false);

        if (!userSession && (!name.trim() || !email.trim())) {
            setSubmitError('Vui lòng nhập đầy đủ tên và email.');
            return;
        }

        if (!content.trim()) {
            setSubmitError('Vui lòng nhập nội dung bình luận.');
            return;
        }

        setSubmitLoading(true);
        try {
            const newComment = await addComment(
                id,
                name.trim(),
                email.trim(),
                content.trim(),
                rating,
                userSession ? userSession.id : ''
            );

            // Append new comment and refresh list
            setComments([newComment, ...comments]);
            setContent('');
            setSubmitSuccess(true);
            
            // Clean success message after 3 seconds
            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#ff6e6c" />
                <Text style={styles.loadingText}>Đang tải tài liệu...</Text>
            </View>
        );
    }

    if (error || !docData) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error || 'Không tìm thấy tài liệu.'}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Quay lại danh sách</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const ratingAverage = comments.length
        ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
        : '0.0';

    return (
        <FadeInView style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Quay về bằng bộ nhớ lịch sử Back (Slide 184) */}
                <TouchableOpacity style={styles.inlineBack} onPress={() => navigation.goBack()}>
                    <Text style={styles.inlineBackText}>← Quay lại danh sách</Text>
                </TouchableOpacity>

                {/* Document Header */}
                <View style={styles.docHeader}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{docData.categoryName}</Text>
                    </View>
                    <Text style={styles.docTitle}>{docData.title}</Text>
                    <Text style={styles.docSubject}>{docData.subject}</Text>

                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>{docData.uploader}</Text>
                        <Text style={styles.metaText}>👁 {docData.viewCount || 0} lượt xem</Text>
                        <Text style={styles.metaText}>{new Date(docData.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </View>
                </View>

                {/* Document Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mô tả tóm tắt</Text>
                    <Text style={styles.descriptionText}>{docData.description}</Text>
                </View>

                {/* Document Content (Auth Gated) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nội dung tài liệu</Text>
                    {userSession ? (
                        <View style={styles.contentBox}>
                            <Text style={styles.contentText}>{docData.content}</Text>
                        </View>
                    ) : (
                        <View style={styles.lockedBox}>
                            <Text style={styles.lockedEmoji}>🔒</Text>
                            <Text style={styles.lockedText}>
                                Bạn chỉ xem được tóm tắt. Vui lòng đăng nhập để xem đầy đủ tài liệu và tải xuống.
                            </Text>
                            <TouchableOpacity
                                style={styles.loginBtn}
                                onPress={() => navigation.navigate('Account')}
                            >
                                <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Comments and Ratings Header */}
                <View style={styles.section}>
                    <View style={styles.ratingOverview}>
                        <View>
                            <Text style={styles.sectionTitle}>Đánh giá & Bình luận</Text>
                            <Text style={styles.commentCount}>({comments.length} ý kiến phản hồi)</Text>
                        </View>
                        {comments.length > 0 && (
                            <View style={styles.averageBox}>
                                <Text style={styles.averageNumber}>{ratingAverage}</Text>
                                <Text style={styles.averageStar}>★</Text>
                            </View>
                        )}
                    </View>

                    {/* Form to submit review */}
                    <View style={styles.reviewForm}>
                        <Text style={styles.formTitle}>Viết đánh giá của bạn</Text>
                        
                        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
                        {submitSuccess ? <Text style={styles.submitSuccess}>Gửi bình luận thành công!</Text> : null}

                        {/* Guest input fields */}
                        {!userSession && (
                            <View style={styles.formRow}>
                                <TextInput
                                    style={[styles.input, styles.halfInput]}
                                    placeholder="Họ tên"
                                    placeholderTextColor="#67568c"
                                    value={name}
                                    onChangeText={setName}
                                />
                                <TextInput
                                    style={[styles.input, styles.halfInput]}
                                    placeholder="Email"
                                    placeholderTextColor="#67568c"
                                    value={email}
                                    keyboardType="email-address"
                                    onChangeText={setEmail}
                                />
                            </View>
                        )}

                        {userSession && (
                            <Text style={styles.commentAs}>
                                Bình luận với tư cách: <Text style={styles.boldText}>{userSession.fullName}</Text>
                            </Text>
                        )}

                        {/* Star selector */}
                        <View style={styles.starSelectorContainer}>
                            <Text style={styles.starLabel}>Điểm đánh giá: </Text>
                            <View style={styles.starRow}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                        <Text style={[
                                            styles.starIcon,
                                            star <= rating ? styles.starIconActive : styles.starIconInactive
                                        ]}>
                                            ★
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Comment text */}
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Nội dung ý kiến của bạn về tài liệu..."
                            placeholderTextColor="#67568c"
                            multiline
                            numberOfLines={4}
                            value={content}
                            onChangeText={setContent}
                        />

                        <TouchableOpacity
                            style={styles.submitBtn}
                            onPress={handleAddComment}
                            disabled={submitLoading}
                        >
                            {submitLoading ? (
                                <ActivityIndicator size="small" color="#1f1235" />
                            ) : (
                                <Text style={styles.submitBtnText}>Gửi phản hồi</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Comment list */}
                    <View style={styles.commentList}>
                        {comments.map((comment) => (
                            <View key={comment.id} style={styles.commentCard}>
                                <View style={styles.commentHeader}>
                                    <View>
                                        <Text style={styles.commentName}>{comment.name}</Text>
                                        <Text style={styles.commentDate}>
                                            {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </View>
                                    <View style={styles.commentStars}>
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Text
                                                key={i}
                                                style={[
                                                    styles.starTiny,
                                                    i < comment.rating ? styles.starTinyActive : styles.starTinyInactive
                                                ]}
                                            >
                                                ★
                                            </Text>
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.commentContent}>{comment.content}</Text>
                            </View>
                        ))}

                        {comments.length === 0 && (
                            <Text style={styles.noComments}>Chưa có bình luận nào cho tài liệu này.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </FadeInView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffcf9',
    },
    scrollContent: {
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fffcf9',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        color: '#67568c',
        fontSize: 15,
    },
    errorText: {
        color: '#a22b2b',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#ff6e6c',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#1f1235',
        fontWeight: 'bold',
    },
    inlineBack: {
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    inlineBackText: {
        color: '#67568c',
        fontWeight: 'bold',
        fontSize: 14,
    },
    docHeader: {
        marginBottom: 24,
    },
    tag: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff4ee',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 99,
        marginBottom: 12,
    },
    tagText: {
        color: '#1f1235',
        fontSize: 12,
        fontWeight: 'bold',
    },
    docTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f1235',
        lineHeight: 30,
        marginBottom: 6,
    },
    docSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ff6e6c',
        marginBottom: 14,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e4d9f7',
    },
    metaText: {
        fontSize: 13,
        color: '#67568c',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f1235',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        color: '#67568c',
        lineHeight: 22,
    },
    contentBox: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        borderRadius: 20,
        padding: 20,
    },
    contentText: {
        fontSize: 15,
        color: '#1f1235',
        lineHeight: 24,
    },
    lockedBox: {
        backgroundColor: '#fff4ee',
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockedEmoji: {
        fontSize: 36,
        marginBottom: 8,
    },
    lockedText: {
        fontSize: 14,
        color: '#1f1235',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 16,
    },
    loginBtn: {
        backgroundColor: '#ff6e6c',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    loginBtnText: {
        color: '#1f1235',
        fontWeight: 'bold',
        fontSize: 14,
    },
    ratingOverview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    commentCount: {
        fontSize: 13,
        color: '#67568c',
        marginTop: -8,
    },
    averageBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff4ee',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#ff6e6c',
    },
    averageNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f1235',
        marginRight: 4,
    },
    averageStar: {
        fontSize: 18,
        color: '#ff6e6c',
    },
    reviewForm: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f1235',
        marginBottom: 16,
    },
    formRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    input: {
        height: 48,
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 14,
        color: '#1f1235',
        backgroundColor: '#fffcf9',
    },
    halfInput: {
        flex: 1,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingVertical: 12,
        marginBottom: 16,
    },
    starSelectorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    starLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f1235',
    },
    starRow: {
        flexDirection: 'row',
        gap: 4,
    },
    starIcon: {
        fontSize: 28,
    },
    starIconActive: {
        color: '#ff6e6c',
    },
    starIconInactive: {
        color: '#e4d9f7',
    },
    commentAs: {
        fontSize: 14,
        color: '#67568c',
        marginBottom: 12,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#1f1235',
    },
    submitBtn: {
        backgroundColor: '#ff6e6c',
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtnText: {
        color: '#1f1235',
        fontWeight: 'bold',
        fontSize: 15,
    },
    submitError: {
        color: '#a22b2b',
        fontWeight: 'bold',
        fontSize: 13,
        marginBottom: 12,
        textAlign: 'center',
    },
    submitSuccess: {
        color: '#0f7a42',
        fontWeight: 'bold',
        fontSize: 13,
        marginBottom: 12,
        textAlign: 'center',
    },
    commentList: {
        gap: 14,
    },
    commentCard: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e4d9f7',
        borderRadius: 16,
        padding: 16,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    commentName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1f1235',
    },
    commentDate: {
        fontSize: 12,
        color: '#67568c',
        marginTop: 2,
    },
    commentStars: {
        flexDirection: 'row',
    },
    starTiny: {
        fontSize: 14,
    },
    starTinyActive: {
        color: '#ff6e6c',
    },
    starTinyInactive: {
        color: '#e4d9f7',
    },
    commentContent: {
        fontSize: 14,
        color: '#67568c',
        lineHeight: 18,
    },
    noComments: {
        textAlign: 'center',
        color: '#67568c',
        fontSize: 14,
        fontStyle: 'italic',
        paddingVertical: 20,
    }
});
