import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export default function FadeInView({ duration = 600, style, children }) {
    // Khai báo giá trị Animated.Value(0) trong useRef để giữ nguyên qua các lần render (Slide 140)
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Thiết lập cấu hình chuyển động mờ hiện (Slide 140-141)
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true // Tối ưu hiệu năng bằng cách đẩy tính toán hoạt họa xuống native runtime
        }).start();
    }, [fadeAnim, duration]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: fadeAnim // Gắn giá trị opacity tương ứng với chuyển động
                }
            ]}
        >
            {children}
        </Animated.View>
    );
}
