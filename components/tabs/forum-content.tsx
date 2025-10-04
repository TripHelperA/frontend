// components/ForumContent.tsx
import { Ionicons } from '@expo/vector-icons';
import { Router, Stack } from 'expo-router';
import React from 'react';
import { FlatList, ImageSourcePropType, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ForumPostCard from './ForumPostCard';

type ForumPost = {
    id: string;
    image: ImageSourcePropType;
    title: string;
    description: string;
    rating: number;
    reviews: number;
};

type ForumContentProps = {
    router: Router;
};

// Sample posts
const forumPosts: ForumPost[] = [
    {
        id: '1',
        image: require('../assets/logo.png'),
        title: 'Ankara Kalesi ve Çevresi Rotası',
        description:
            "Ankara'nın kalbinde tarihi bir yolculuk. Eski Ankara sokakları, müzeler ve muhteşem manzaralar...",
        rating: 4,
        reviews: 32,
    },
    {
        id: '2',
        image: require('../assets/logo.png'),
        title: 'Kapadokya Balon Turu Deneyimi',
        description:
            'Peri bacaları üzerinde unutulmaz bir balon turu deneyimi ve çevredeki gezilecek yerler rehberi.',
        rating: 5,
        reviews: 58,
    },
    {
        id: '3',
        image: require('../assets/logo.png'),
        title: 'Fethiye Ölüdeniz Yamaç Paraşütü',
        description:
            "Mavi ve yeşilin buluştuğu Ölüdeniz'de adrenalin dolu bir yamaç paraşütü macerası.",
        rating: 4,
        reviews: 41,
    },
    {
        id: '4',
        image: require('../assets/logo.png'),
        title: 'Ege Kıyılarında Gizli Koylar Keşfi',
        description:
            "Ege'nin saklı kalmış koylarında sakin ve huzurlu bir tekne turu rotası ve yüzme molaları.",
        rating: 3,
        reviews: 25,
    },
];

const ForumContent: React.FC<ForumContentProps> = ({ router }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Rota Forumu',
                    headerTitleAlign: 'center',
                    headerLeft: () => (
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color="black"
                            // FIX: call router.back() directly
                            onPress={() => router.back()}
                            style={{ marginLeft: 16 }}
                        />
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', marginRight: 16 }}>
                            <Ionicons
                                name="search"
                                size={24}
                                color="black"
                                style={{ marginRight: 16 }}
                                onPress={() => {
                                    /* TODO: search action */
                                }}
                            />
                            <Ionicons
                                name="ellipsis-vertical"
                                size={24}
                                color="black"
                                onPress={() => {
                                    /* TODO: more options */
                                }}
                            />
                        </View>
                    ),
                    headerShadowVisible: false,
                }}
            />

            <View style={styles.container}>
                <Text style={styles.sectionTitle}>ROTA VE DENEYİMLER</Text>
                <FlatList
                    data={forumPosts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ForumPostCard
                            imageSource={item.image}
                            title={item.title}
                            description={item.description}
                            rating={item.rating}
                            reviews={item.reviews}
                            router={router}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    container: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#888',
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 5,
    },
    listContent: {
        paddingBottom: 10,
    },
});

export default ForumContent;
