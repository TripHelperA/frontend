import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    View,
    useWindowDimensions
} from "react-native";

type Props = {
    images?: (string | number)[];
    brand?: string;
    onPlanTrip?: () => void;
    onSearchTrips?: () => void;
    onSettings?: () => void;
    holdMs?: number;
    fadeMs?: number;
};

const DEFAULT_IMAGES = [
    "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
];

export default function LandingScreen({
    images,
    brand = "Allah",
    onPlanTrip,
    onSearchTrips,
    onSettings,
    holdMs = 10_000,
    fadeMs = 2_000,
}: Props) {
    const slides = useMemo(() => (images?.length ? images : DEFAULT_IMAGES), [images]);
    const [index, setIndex] = useState(0);
    const { height } = useWindowDimensions();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIndex((i) => (i + 1) % slides.length), holdMs);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [index, slides.length, holdMs]);

    useEffect(() => {
        fadeAnim.setValue(0);
    }, [index, fadeAnim]);

    const onImageLoaded = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: fadeMs,
            useNativeDriver: true,
        }).start();
    };

    const jumpTo = (i: number) => {
        if (i === index) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        setIndex(i);
    };

    const currentSource =
        typeof slides[index] === "string"
            ? { uri: slides[index] as string }
            : (slides[index] as number);

    return (
        <SafeAreaView className="flex-1">
            {/* background gradient + blobs */}
            <LinearGradient colors={["#f7f7ff", "#f0f8ff"]} className="absolute inset-0" />
            <View className="pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full bg-indigo-500/10" />
            <View className="pointer-events-none absolute -bottom-14 -left-8 w-80 h-80 rounded-full bg-emerald-500/10" />

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
                <View className="gap-4">
                    {/* HERO CARD */}
                    <View className="w-full rounded-3xl bg-white overflow-hidden shadow-lg">
                        <View
                            className="overflow-hidden rounded-b-[56px]"
                            style={{ height: height * 0.45 }}
                        >
                            <Animated.Image
                                source={currentSource}
                                resizeMode="cover"
                                onLoad={onImageLoaded}
                                style={{ opacity: fadeAnim }}
                                className="absolute inset-0 w-full h-full"
                            />

                            <LinearGradient
                                colors={["rgba(0,0,0,0.28)", "rgba(0,0,0,0.14)", "transparent"]}
                                className="absolute inset-0"
                            />

                            {/* brand pill */}
                            <View className="absolute top-3 left-0 right-0 items-center">
                                <Text className="px-3 py-1 rounded-full bg-white/35 text-white font-extrabold text-2xl tracking-wide drop-shadow">
                                    {brand}
                                </Text>
                            </View>

                            {/* hero text */}
                            <View className="absolute left-5 right-5 bottom-8">
                                <Text className="text-white text-xl font-extrabold tracking-tight drop-shadow">
                                    Your next trip, beautifully planned.
                                </Text>
                                <Text className="text-white/95 text-sm leading-5 drop-shadow">
                                    Empowered by Google and AWS, specialized by you!
                                </Text>
                            </View>

                            {/* dots */}
                            <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
                                {slides.map((_, i) => (
                                    <Pressable
                                        key={i}
                                        onPress={() => jumpTo(i)}
                                        className={`mx-1 h-1.5 w-6 rounded-full ${i === index ? "bg-white/90" : "bg-white/35"
                                            }`}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* buttons */}
                        <View className="px-5 pt-4 pb-3">
                            <View className="flex-row gap-3">
                                <Pressable
                                    onPress={onPlanTrip}
                                    className="flex-1 items-center justify-center rounded-2xl py-2 bg-[#fb7a36] shadow active:opacity-90"
                                >
                                    <Text className="text-white font-bold text-base">Plan a Trip</Text>
                                </Pressable>

                                <Pressable
                                    onPress={onSearchTrips}
                                    className="flex-1 items-center justify-center rounded-2xl py-2 bg-white border border-black/5 shadow active:opacity-90"
                                >
                                    <Text className="text-neutral-900 font-bold text-base">Search Trips</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* FEATURES */}
                    <View className="bg-white rounded-2xl p-4 gap-3 shadow-md">
                        <Text className="text-center text-lg font-extrabold text-neutral-900">
                            Why travelers choose {brand}
                        </Text>
                        <View className="flex-row gap-2.5">
                            <FeatureCard
                                emoji="🎯"
                                title="Tailored plans"
                                desc="We learn your style and suggest routes. Give us your description as a prompt and enjoy your trip."
                                colorFrom="#fef3c7"
                                colorTo="#fde68a"
                            />
                            <FeatureCard
                                emoji="🧭"
                                title="Smart routing"
                                desc="Suggestions are within your usual route so that you are on track. Modify the route and choose the best version that fits you!"
                                colorFrom="#e0f2fe"
                                colorTo="#a5d8ff"
                            />
                            <FeatureCard
                                emoji="🧩"
                                title="All in one place"
                                desc="Find all the pieces that you desire from a travelling app. Take a look at where others are visiting using our forum."
                                colorFrom="#ede9fe"
                                colorTo="#ddd6fe"
                            />
                        </View>
                    </View>

                    {/* THEMES */}
                    <View className="bg-white rounded-2xl p-4 gap-3 shadow-md">
                        <Text className="text-center text-lg font-extrabold text-neutral-900">
                            Integrate the key themes we use to your prompts and enrich your journey!
                        </Text>
                        <View className="flex-row flex-wrap justify-center gap-2.5">
                            {[
                                "Cultural",
                                "Relaxing",
                                "Gastronomic",
                                "Nature",
                                "Modern",
                                "Entertaining",
                                "Romantic",
                                "Adventurous",
                            ].map((t) => (
                                <Pressable
                                    key={t}
                                    className="py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/25 active:opacity-80"
                                >
                                    <Text className="text-gray-800 font-semibold text-sm">{t}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* FOOTER */}
                    <View className="items-center mt-2">
                        <Text className="text-center text-gray-400 text-sm leading-5">
                            Discover and plan your next adventure with us.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* Gradient FeatureCard */
function FeatureCard({
    emoji,
    title,
    desc,
    colorFrom,
    colorTo,
}: {
    emoji: string;
    title: string;
    desc: string;
    colorFrom: string;
    colorTo: string;
}) {
    return (
        <LinearGradient
            colors={[colorFrom, colorTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 rounded-2xl p-3 min-h-[120px]"
        >
            <Text className="text-2xl mb-1">{emoji}</Text>
            <Text className="font-extrabold text-slate-900 text-base">{title}</Text>
            <Text className="text-slate-600 mt-1 text-sm leading-5">{desc}</Text>
        </LinearGradient>
    );
}
