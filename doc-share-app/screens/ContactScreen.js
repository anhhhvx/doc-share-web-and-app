import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { fetchSiteData, submitContact } from '../services/api';
import FadeInView from '../components/FadeInView';

export default function ContactScreen({ userSession }) {
    const [siteData, setSiteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Contact Form States
    const [name, setName] = useState(userSession ? userSession.fullName : '');
    const [email, setEmail] = useState(userSession ? userSession.email : '');
    const [message, setMessage] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        loadSiteData();
    }, []);

    useEffect(() => {
        if (userSession) {
            setName(userSession.fullName);
            setEmail(userSession.email);
        }
    }, [userSession]);

    const loadSiteData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchSiteData();
            setSiteData(data);
        } catch (err) {
            setError('Lỗi tải thông tin giới thiệu và liên hệ.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitContact = async () => {
        setSubmitError('');
        setSubmitSuccess(false);

        if (!name.trim() || !email.trim() || !message.trim()) {
            setSubmitError('Vui lòng điền đầy đủ thông tin biểu mẫu.');
            return;
        }

        setSubmitLoading(true);
        try {
            await submitContact(name.trim(), email.trim(), message.trim());
            setMessage('');
            setSubmitSuccess(true);
            
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
                <Text style={styles.loadingText}>Đang tải trang giới thiệu...</Text>
            </View>
        );
    }

    const homeContent = siteData?.homeContent || {
        aboutTitle: 'Giới thiệu về website',
        aboutText: 'Website chia sẻ tài liệu học tập dành cho sinh viên.',
        contactTitle: 'Thông tin liên hệ',
        contactText: 'Liên hệ với chúng tôi nếu bạn cần hỗ trợ.',
        contactEmail: 'docs-share@example.com',
        contactPhone: '0123 456 789',
        contactAddress: 'Số 1 Đại Cồ Việt, phường Bạch Mai, Hà Nội'
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <FadeInView>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>Liên hệ</Text>
                    <Text style={styles.headerTitle}>Giới thiệu & Hỗ trợ</Text>
                </View>

                {/* Info Panel (About) */}
                <View style={styles.panel}>
                    <Text style={styles.panelEyebrow}>Giới thiệu</Text>
                    <Text style={styles.panelTitle}>{homeContent.aboutTitle}</Text>
                    <Text style={styles.panelText}>{homeContent.aboutText}</Text>
                </View>

                {/* Contact Panel */}
                <View style={styles.panel}>
                    <Text style={styles.panelEyebrow}>Liên hệ</Text>
                    <Text style={styles.panelTitle}>{homeContent.contactTitle}</Text>
                    <Text style={styles.panelText}>{homeContent.contactText}</Text>

                    <View style={styles.contactList}>
                        <Text style={styles.contactItem}> Email: <Text style={styles.bold}>{homeContent.contactEmail}</Text></Text>
                        <Text style={styles.contactItem}> Điện thoại: <Text style={styles.bold}>{homeContent.contactPhone}</Text></Text>
                        <Text style={styles.contactItem}> Địa chỉ: <Text style={styles.bold}>{homeContent.contactAddress}</Text></Text>
                    </View>
                </View>

                {/* Opinion Form */}
                <View style={styles.formPanel}>
                    <Text style={styles.formTitle}>Gửi ý kiến phản hồi</Text>
                    
                    {submitError ? <Text style={styles.errorMsg}>{submitError}</Text> : null}
                    {submitSuccess ? <Text style={styles.successMsg}>Đã gửi ý kiến liên hệ thành công!</Text> : null}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Họ và tên</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập họ và tên..."
                            placeholderTextColor="#67568c"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập email..."
                            placeholderTextColor="#67568c"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ý kiến đóng góp</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Nhập nội dung tin nhắn hoặc góp ý của bạn..."
                            placeholderTextColor="#67568c"
                            multiline
                            numberOfLines={5}
                            value={message}
                            onChangeText={setMessage}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmitContact}
                        disabled={submitLoading}
                    >
                        {submitLoading ? (
                            <ActivityIndicator size="small" color="#1f1235" />
                        ) : (
                            <Text style={styles.buttonText}>Gửi ý kiến</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </FadeInView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffcf9',
    },
    scrollContent: {
        padding: 20,
        gap: 20,
        paddingBottom: 40,
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
    header: {
        marginTop: 10,
        marginBottom: 20,
    },
    eyebrow: {
        color: '#ff6e6c',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f1235',
    },
    panel: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#1f1235',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    panelEyebrow: {
        color: '#ff6e6c',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    panelTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f1235',
        marginBottom: 12,
    },
    panelText: {
        fontSize: 14,
        color: '#67568c',
        lineHeight: 20,
    },
    contactList: {
        marginTop: 16,
        gap: 8,
    },
    contactItem: {
        fontSize: 14,
        color: '#1f1235',
    },
    bold: {
        fontWeight: 'bold',
    },
    formPanel: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#1f1235',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f1235',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1f1235',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#1f1235',
        backgroundColor: '#fffcf9',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        paddingVertical: 12,
    },
    button: {
        backgroundColor: '#ff6e6c',
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#1f1235',
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorMsg: {
        color: '#a22b2b',
        fontWeight: 'bold',
        fontSize: 13,
        marginBottom: 16,
        textAlign: 'center',
    },
    successMsg: {
        color: '#0f7a42',
        fontWeight: 'bold',
        fontSize: 13,
        marginBottom: 16,
        textAlign: 'center',
    }
});
