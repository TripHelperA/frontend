// components/ForumContent.tsx
import { Ionicons } from "@expo/vector-icons";
import { Router, Stack } from "expo-router";
import React, { useMemo } from "react";
import {
    FlatList,
    ImageSourcePropType,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import ForumPostCard from "./ForumPostCard";

type ForumPost = {
    id: string;
    image: ImageSourcePropType;
    title: string;
    description: string;
    rating?: number;
    reviews?: number;
};

type ForumContentProps = {
    router: Router;
};

// Central palette
const palette = {
    bg: "#F8FAFC",
    primary: "#0EA5E9",
    primaryDark: "#0284C7",
    text: "#0F172A",
    textMuted: "#64748B",
    hairline: "rgba(2, 132, 199, 0.12)",
};

// Local images
const image1 = require("../../assets/backgrounds/background1.jpg");
const image2 = require("../../assets/backgrounds/background2.jpg");
const image3 = require("../../assets/backgrounds/background3.jpg");
const image4 = require("../../assets/backgrounds/background4.jpg");

// Sample posts
const forumPosts: ForumPost[] = [
    {
        id: "1",
        image: image1,
        title: "Ankara Kalesi ve Çevresi Rotası",
        description:
            "Ankara'nın kalbinde tarihi bir yürüyüş; müzeler, eski sokaklar ve şehir manzaraları.",
    },
    {
        id: "2",
        image: image2,
        title: "Kapadokya Balon Turu Deneyimi",
        description:
            "Güneş doğarken peri bacaları üzerinde balonlarla benzersiz bir rota.",
    },
    {
        id: "3",
        image: image3,
        title: "Fethiye Ölüdeniz Yamaç Paraşütü",
        description:
            "Mavi-yeşilin buluştuğu Ölüdeniz’de gökyüzü ve denizle buluşan bir deneyim.",
    },
    {
        id: "4",
        image: image4,
        title: "Ege Kıyılarında Gizli Koylar",
        description:
            "Sakin koylar, kısa yürüyüşler ve yüzme molalarıyla dinlendirici rota.",
    },
];

const ForumContent: React.FC<ForumContentProps> = ({ router }) => {
    // ✅ Header buttons
    const headerLeft = useMemo(
        () => (
            <Ionicons
                name="arrow-back"
                size={22}
                color="#FFFFFF"
                onPress={() => router.back()}
                style={{ marginLeft: 12 }}
            />
        ),
        [router]
    );

    const headerRight = useMemo(
        () => (
            <View style={{ flexDirection: "row", marginRight: 8 }}>
                <Ionicons
                    name="search"
                    size={22}
                    color="#FFFFFF"
                    style={{ marginRight: 16 }}
                    onPress={() => {
                        // TODO: search action
                    }}
                />
                <Ionicons
                    name="add"
                    size={22}
                    color="#FFFFFF"
                    onPress={() => {
                        // TODO: add new post
                    }}
                />
            </View>
        ),
        []
    );

    // ✅ Centralized press handler for posts
    const handlePostPress = (post: ForumPost) => {
        router.push({
            pathname: "post-detail",
            params: {
                title: post.title,
                description: post.description,
                imageSource:
                    typeof post.image === "number"
                        ? post.image.toString()
                        : (post.image as any)?.uri ?? "",
            },
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: "Rota Forumu",
                    headerTitleAlign: "center",
                    headerStyle: { backgroundColor: palette.primary },
                    headerTintColor: "#FFFFFF",
                    headerTitleStyle: { fontWeight: "700", letterSpacing: 0.3 },
                    headerLeft: () => headerLeft,
                    headerRight: () => headerRight,
                    headerShadowVisible: false,
                }}
            />

            <View style={styles.container}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.eyebrow}>KEŞFET</Text>
                    <Text style={styles.title}>Rota ve Deneyimler</Text>
                    <Text style={styles.subtitle}>
                        İlham verici topluluk rotalarını gözden geçir.
                    </Text>
                </View>

                <FlatList
                    data={forumPosts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ForumPostCard
                            imageSource={item.image}
                            title={item.title}
                            description={item.description}
                            router={router}
                            colors={palette}
                            // ✅ Pass custom press handler
                            onPress={() => handlePostPress(item)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: palette.bg },
    container: { flex: 1 },
    sectionHeader: {
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 8,
    },
    eyebrow: {
        color: palette.primaryDark,
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: palette.text,
        marginTop: 2,
    },
    subtitle: {
        fontSize: 13.5,
        color: palette.textMuted,
        marginTop: 4,
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 24,
    },
});

export default ForumContent;
