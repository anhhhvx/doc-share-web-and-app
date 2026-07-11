import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register } from '../services/api';
import FadeInView from '../components/FadeInView';

export default function LoginScreen({ navigation, userSession, onLoginSuccess, onLogout }) {
    // Chế độ: Đăng nhập vs Đăng ký
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    // Form Đăng nhập
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Form Đăng ký
    const [regFullName, setRegFullName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Xử lý Đăng nhập
    const handleLogin = async () => {
        setError('');
        setSuccessMessage('');
        if (!username.trim() || !password.trim()) {
            setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
            return;
        }

        setLoading(true);
        try {
            const data = await login(username.trim(), password);
            const user = data.user;

            // Lưu phiên đăng nhập bền vững vào AsyncStorage dưới dạng chuỗi JSON (Slide 230)
            await AsyncStorage.setItem('user_session', JSON.stringify(user));

            onLoginSuccess(user);
            
            // Chuyển sang Tab Tài liệu sau khi đăng nhập thành công (Slide 183)
            if (navigation) {
                navigation.navigate('Documents');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý Đăng ký
    const handleRegister = async () => {
        setError('');
        setSuccessMessage('');
        if (!regFullName.trim() || !regEmail.trim() || !regUsername.trim() || !regPassword.trim()) {
            setError('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
            return;
        }

        setLoading(true);
        try {
            await register(
                regFullName.trim(),
                regEmail.trim(),
                regPhone.trim(),
                regUsername.trim(),
                regPassword
            );

            setSuccessMessage('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
            
            // Đăng ký xong chuyển về màn hình đăng nhập và điền sẵn username
            setUsername(regUsername);
            setIsRegisterMode(false);

            // Reset form đăng ký
            setRegFullName('');
            setRegEmail('');
            setRegPhone('');
            setRegUsername('');
            setRegPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý Đăng xuất
    const handleLogout = async () => {
        try {
            // Xóa phiên đăng nhập khỏi AsyncStorage (Slide 235)
            await AsyncStorage.removeItem('user_session');
            onLogout();
            setUsername('');
            setPassword('');
        } catch (err) {
            console.error('Lỗi khi đăng xuất:', err.message);
        }
    };

    // Màn hình trang cá nhân khi đã đăng nhập
    if (userSession) {
        return (
            <FadeInView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>Tài khoản</Text>
                    <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {userSession.fullName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.profileName}>{userSession.fullName}</Text>
                    <Text style={styles.profileRole}>Vai trò: {userSession.role.toUpperCase()}</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tên đăng nhập: </Text>
                        <Text style={styles.infoValue}>{userSession.username}</Text>
                    </View>
                    {userSession.email ? (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email: </Text>
                            <Text style={styles.infoValue}>{userSession.email}</Text>
                        </View>
                    ) : null}

                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
                    </TouchableOpacity>
                </View>
            </FadeInView>
        );
    }

    // Giao diện Đăng nhập / Đăng ký
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <FadeInView>
                <View style={styles.header}>
                    <Text style={styles.eyebrow}>{isRegisterMode ? 'Tạo tài khoản' : 'Đăng nhập'}</Text>
                    <Text style={styles.headerTitle}>
                        {isRegisterMode ? 'Đăng ký thành viên' : 'Chào mừng trở lại'}
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {successMessage ? (
                        <View style={styles.successBox}>
                            <Text style={styles.successText}>{successMessage}</Text>
                        </View>
                    ) : null}

                    {isRegisterMode ? (
                        /* ================= FORM ĐĂNG KÝ ================= */
                        <View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Họ và tên *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập họ và tên..."
                                    placeholderTextColor="#67568c"
                                    value={regFullName}
                                    onChangeText={setRegFullName}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập email..."
                                    placeholderTextColor="#67568c"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={regEmail}
                                    onChangeText={setRegEmail}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Số điện thoại</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập số điện thoại (tùy chọn)..."
                                    placeholderTextColor="#67568c"
                                    keyboardType="phone-pad"
                                    value={regPhone}
                                    onChangeText={setRegPhone}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tên đăng nhập *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên đăng nhập..."
                                    placeholderTextColor="#67568c"
                                    autoCapitalize="none"
                                    value={regUsername}
                                    onChangeText={setRegUsername}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mật khẩu *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mật khẩu..."
                                    placeholderTextColor="#67568c"
                                    secureTextEntry
                                    value={regPassword}
                                    onChangeText={setRegPassword}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleRegister}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#1f1235" />
                                ) : (
                                    <Text style={styles.buttonText}>Đăng ký ngay</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.switchMode}
                                onPress={() => {
                                    setIsRegisterMode(false);
                                    setError('');
                                }}
                            >
                                <Text style={styles.switchModeText}>
                                    Đã có tài khoản? <Text style={styles.boldText}>Đăng nhập</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* ================= FORM ĐĂNG NHẬP ================= */
                        <View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tên đăng nhập</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên đăng nhập..."
                                    placeholderTextColor="#67568c"
                                    autoCapitalize="none"
                                    value={username}
                                    onChangeText={setUsername}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Mật khẩu</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mật khẩu..."
                                    placeholderTextColor="#67568c"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#1f1235" />
                                ) : (
                                    <Text style={styles.buttonText}>Đăng nhập</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.switchMode}
                                onPress={() => {
                                    setIsRegisterMode(true);
                                    setError('');
                                }}
                            >
                                <Text style={styles.switchModeText}>
                                    Chưa có tài khoản? <Text style={styles.boldText}>Đăng ký ngay</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
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
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
        marginTop: 10,
        paddingHorizontal: 20,
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
    formContainer: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#1f1235',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
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
    button: {
        backgroundColor: '#ff6e6c',
        height: 50,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: '#1f1235',
        fontWeight: 'bold',
        fontSize: 16,
    },
    switchMode: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchModeText: {
        fontSize: 14,
        color: '#67568c',
    },
    boldText: {
        fontWeight: 'bold',
        color: '#ff6e6c',
    },
    errorBox: {
        backgroundColor: '#ffeaea',
        borderWidth: 1,
        borderColor: '#ffc5c5',
        borderRadius: 12,
        padding: 14,
        marginBottom: 18,
    },
    errorText: {
        color: '#a22b2b',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    successBox: {
        backgroundColor: '#e5fff1',
        borderWidth: 1,
        borderColor: '#a3f2c3',
        borderRadius: 12,
        padding: 14,
        marginBottom: 18,
    },
    successText: {
        color: '#0f7a42',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    profileCard: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginHorizontal: 20,
        shadowColor: '#1f1235',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff4ee',
        borderWidth: 2,
        borderColor: '#ff6e6c',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ff6e6c',
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f1235',
        marginBottom: 4,
    },
    profileRole: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ff6e6c',
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#f1e9ff',
    },
    infoLabel: {
        flex: 1,
        fontSize: 14,
        color: '#67568c',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#1f1235',
        fontWeight: 'bold',
    },
    logoutBtn: {
        marginTop: 32,
        width: '100%',
        height: 50,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#cf2e2e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutBtnText: {
        color: '#cf2e2e',
        fontWeight: 'bold',
        fontSize: 15,
    }
});
