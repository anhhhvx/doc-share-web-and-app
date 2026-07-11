import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    StatusBar,
    Platform,
    Text,
    View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import MainScreen from './screens/MainScreen';
import DetailScreen from './screens/DetailScreen';
import LoginScreen from './screens/LoginScreen';
import ContactScreen from './screens/ContactScreen';

// Khởi tạo các Navigator theo chuẩn lý thuyết (Slide 182 & 201)
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 1. Định nghĩa Stack Navigator dành riêng cho luồng Tài liệu (Main -> Detail) (Slide 208)
function DocumentStack({ userSession }) {
    return (
        <Stack.Navigator
            initialRouteName="DocList"
            screenOptions={{
                headerShown: false // Ẩn header mặc định để dùng header tự chế đẹp hơn
            }}
        >
            <Stack.Screen name="DocList" component={MainScreen} />
            <Stack.Screen name="DocDetail">
                {props => <DetailScreen {...props} userSession={userSession} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}

export default function App() {
    // Session state toàn cục
    const [userSession, setUserSession] = useState(null);

    // 2. Khôi phục phiên đăng nhập từ AsyncStorage khi khởi động (Slide 228-230)
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const sessionData = await AsyncStorage.getItem('user_session');
                if (sessionData) {
                    // Chuyển chuỗi JSON đọc được thành object (Slide 230)
                    setUserSession(JSON.parse(sessionData));
                }
            } catch (err) {
                console.error('Lỗi khôi phục phiên đăng nhập:', err.message);
            }
        };
        restoreSession();
    }, []);

    const handleLoginSuccess = (userData) => {
        setUserSession(userData);
    };

    const handleLogout = () => {
        setUserSession(null);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#fffcf9" />

            {/* Bao bọc toàn bộ ứng dụng di động trong NavigationContainer (Slide 180) */}
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        tabBarIcon: ({ focused }) => {
                            let icon = '';
                            if (route.name === 'Documents') {
                                icon = '📚';
                            } else if (route.name === 'Contact') {
                                icon = '📞';
                            } else if (route.name === 'Account') {
                                icon = '👤';
                            }
                            return (
                                <Text style={[
                                    styles.tabIcon,
                                    { opacity: focused ? 1 : 0.4 }
                                ]}>
                                    {icon}
                                </Text>
                            );
                        },
                        tabBarActiveTintColor: '#ff6e6c',
                        tabBarInactiveTintColor: '#67568c',
                        tabBarLabelStyle: styles.tabLabel,
                        tabBarStyle: styles.tabBar
                    })}
                >
                    {/* Tab 1: Tài liệu (chứa lồng ghép Stack Navigator) */}
                    <Tab.Screen
                        name="Documents"
                        options={{ title: 'Tài liệu' }}
                    >
                        {props => <DocumentStack {...props} userSession={userSession} />}
                    </Tab.Screen>

                    {/* Tab 2: Liên hệ */}
                    <Tab.Screen
                        name="Contact"
                        options={{ title: 'Liên hệ' }}
                    >
                        {props => <ContactScreen {...props} userSession={userSession} />}
                    </Tab.Screen>

                    {/* Tab 3: Đăng nhập / Tài khoản */}
                    <Tab.Screen
                        name="Account"
                        options={{ title: userSession ? 'Tài khoản' : 'Đăng nhập' }}
                    >
                        {props => (
                            <LoginScreen
                                {...props}
                                userSession={userSession}
                                onLoginSuccess={handleLoginSuccess}
                                onLogout={handleLogout}
                            />
                        )}
                    </Tab.Screen>
                </Tab.Navigator>
            </NavigationContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fffcf9',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    tabBar: {
        height: 64,
        borderTopWidth: 2,
        borderColor: '#e4d9f7',
        backgroundColor: '#ffffff',
        paddingBottom: Platform.OS === 'ios' ? 8 : 10,
        paddingTop: 8,
    },
    tabIcon: {
        fontSize: 20,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 2,
    }
});
