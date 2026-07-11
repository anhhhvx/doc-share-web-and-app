import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchDocuments, fetchCategories } from '../services/api';
import FadeInView from '../components/FadeInView';

export default function MainScreen({ navigation }) {
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    // Reload documents whenever category changes or when screen comes into focus (Slide 194)
    useFocusEffect(
        useCallback(() => {
            loadDocuments();
        }, [selectedCategory])
    );

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            console.error('Lỗi tải danh mục:', err.message);
        }
    };

    const loadDocuments = async (q = searchQuery) => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchDocuments(q, selectedCategory);
            setDocuments(data);
        } catch (err) {
            setError('Không thể kết nối với server. Vui lòng kiểm tra IP cấu hình.');
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = () => {
        loadDocuments(searchQuery);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadDocuments(searchQuery);
    };

    const renderDocItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            // Điều hướng sang màn hình chi tiết kèm theo tham số id (Slide 186)
            onPress={() => navigation.navigate('DocDetail', { id: item.id })}
        >
            <View style={styles.tagContainer}>
                <Text style={styles.tagText}>{item.categoryName}</Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.cardSubject}>{item.subject}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            
            <View style={styles.cardFooter}>
                <Text style={styles.cardUploader}>Bởi: {item.uploader}</Text>
                <Text style={styles.cardViews}>👁 {item.viewCount || 0} lượt xem</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <FadeInView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.eyebrow}>Nền tảng học tập</Text>
                <Text style={styles.headerTitle}>Tài liệu Skibidi</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchSection}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm tài liệu..."
                    placeholderTextColor="#67568c"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Tìm</Text>
                </TouchableOpacity>
            </View>

            {/* Categories scroll horizontally */}
            <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    <TouchableOpacity
                        style={[
                            styles.categoryBadge,
                            selectedCategory === '' && styles.categoryBadgeActive
                        ]}
                        onPress={() => setSelectedCategory('')}
                    >
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === '' && styles.categoryTextActive
                        ]}>Tất cả</Text>
                    </TouchableOpacity>

                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryBadge,
                                selectedCategory === cat.id && styles.categoryBadgeActive
                            ]}
                            onPress={() => setSelectedCategory(cat.id)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat.id && styles.categoryTextActive
                            ]}>{cat.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Error Message */}
            {error ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => loadDocuments()}>
                        <Text style={styles.retryText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* Document list */}
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff6e6c" />
                    <Text style={styles.loadingText}>Đang tải tài liệu học tập...</Text>
                </View>
            ) : (
                <FlatList
                    data={documents}
                    keyExtractor={(item) => item.id}
                    renderItem={renderDocItem}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        !loading && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyEmoji}>📂</Text>
                                <Text style={styles.emptyText}>Chưa có tài liệu nào tương ứng</Text>
                            </View>
                        )
                    }
                />
            )}
        </FadeInView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffcf9',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
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
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginVertical: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        borderWidth: 2,
        borderColor: '#e4d9f7',
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 15,
        backgroundColor: '#ffffff',
        color: '#1f1235',
    },
    searchButton: {
        backgroundColor: '#ff6e6c',
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        height: 50,
    },
    searchButtonText: {
        color: '#1f1235',
        fontWeight: 'bold',
        fontSize: 15,
    },
    categoryContainer: {
        marginBottom: 16,
    },
    categoryScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryBadge: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        backgroundColor: '#ffffff',
    },
    categoryBadgeActive: {
        backgroundColor: '#ff6e6c',
        borderColor: '#ff6e6c',
    },
    categoryText: {
        color: '#67568c',
        fontWeight: 'bold',
        fontSize: 14,
    },
    categoryTextActive: {
        color: '#1f1235',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 50,
    },
    loadingText: {
        marginTop: 12,
        color: '#67568c',
        fontSize: 15,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e4d9f7',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#1f1235',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    tagContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff4ee',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        marginBottom: 10,
    },
    tagText: {
        color: '#1f1235',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#1f1235',
        lineHeight: 22,
    },
    cardSubject: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ff6e6c',
        marginTop: 4,
        marginBottom: 8,
    },
    cardDesc: {
        fontSize: 14,
        color: '#67568c',
        lineHeight: 18,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: '#f1e9ff',
    },
    cardUploader: {
        fontSize: 13,
        color: '#67568c',
    },
    cardViews: {
        fontSize: 13,
        color: '#67568c',
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 15,
        color: '#67568c',
        fontWeight: '500',
    },
    errorBox: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#ffeaea',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#ffc5c5',
        alignItems: 'center',
    },
    errorText: {
        color: '#a22b2b',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    retryBtn: {
        backgroundColor: '#a22b2b',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
    },
    retryText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 13,
    }
});
