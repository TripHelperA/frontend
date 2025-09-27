// app/onboarding/WelcomeSlider.tsx
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";

const backgroundImage = require("../../assets/backgrounds/background4.jpg");

const SLIDES = [
    {
        key: "slide-1",
        title: "Traveling made easy!",
        subtitle: "Experience the world's best adventures with us.",
        hasInput: false,
    },
    {
        key: "slide-2",
        title: "Stay in the loop",
        subtitle: "Drop your email and we’ll send trip ideas.",
        hasInput: true,
        inputPlaceholder: "Your email",
        keyboardType: "email-address" as const,
    },
    {
        key: "slide-3",
        title: "Where are you from?",
        subtitle: "Tell us your home city to personalize suggestions.",
        hasInput: true,
        inputPlaceholder: "Home city",
        keyboardType: "default" as const,
    },
];

export default function WelcomeSlider() {
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [email, setEmail] = useState("");
    const [homeCity, setHomeCity] = useState("");

    const screenWidth = Dimensions.get("window").width;

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        setActiveIndex(Math.round(x / screenWidth));
    };

    const goTo = (index: number) => {
        scrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
        setActiveIndex(index);
    };

    const onNext = () => {
        if (activeIndex < SLIDES.length - 1) {
            goTo(activeIndex + 1);
        }
    };

    const onSkip = () => {
        goTo(SLIDES.length - 1);
    };

    const onGetStarted = () => {
        // Save email/homeCity if needed
        router.push("/login/Login");
    };

    return (
        <View className="flex-1">
            {/* ONE fixed background */}
            <Image source={backgroundImage} className="h-full w-full absolute" />

            {/* Gradient fixed at bottom */}
            <LinearGradient
                colors={["transparent", "rgba(3,105,161,0.85)"]}
                style={{ width: wp(100), height: hp(62) }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="absolute bottom-0"
            />

            {/* Horizontal pager */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                bounces={false}
            >
                {SLIDES.map((slide, i) => (
                    <View
                        key={slide.key}
                        style={{ width: screenWidth }}
                        className="flex-1 justify-end"
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                            className="px-5 pb-10"
                        >
                            <View className="space-y-3 mb-5">
                                <Text
                                    className="text-white font-bold"
                                    style={{ fontSize: wp(10), lineHeight: wp(11.5) }}
                                >
                                    {slide.title}
                                </Text>
                                <Text
                                    className="text-white font-medium"
                                    style={{ fontSize: wp(4.3), lineHeight: wp(5.8) }}
                                >
                                    {slide.subtitle}
                                </Text>
                            </View>

                            {/* Inputs only on slide 2 & 3 */}
                            {slide.hasInput && (
                                <View className="bg-white/95 rounded-2xl px-4 py-3 mb-4">
                                    <TextInput
                                        className="text-base text-neutral-900"
                                        placeholder={slide.inputPlaceholder}
                                        placeholderTextColor="#888"
                                        keyboardType={slide.keyboardType}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={i === 1 ? email : homeCity}
                                        onChangeText={i === 1 ? setEmail : setHomeCity}
                                    />
                                </View>
                            )}

                            {/* Dots + Controls */}
                            <View className="flex-row items-center justify-between mt-2">
                                <View className="flex-row items-center">
                                    {SLIDES.map((_, idx) => (
                                        <View
                                            key={idx}
                                            className={`h-2 rounded-full mr-2 ${activeIndex === idx ? "bg-white" : "bg-white/50"
                                                }`}
                                            style={{ width: activeIndex === idx ? 22 : 8 }}
                                        />
                                    ))}
                                </View>

                                {activeIndex < SLIDES.length - 1 ? (
                                    <TouchableOpacity
                                        onPress={onNext}
                                        className="bg-orange-500 rounded-full px-5 py-2"
                                    >
                                        <Text className="text-white font-bold" style={{ fontSize: wp(4.2) }}>
                                            Next
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        onPress={onGetStarted}
                                        className="bg-orange-500 rounded-full px-5 py-2"
                                    >
                                        <Text className="text-white font-bold" style={{ fontSize: wp(4.2) }}>
                                            Get started
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {activeIndex < SLIDES.length - 1 && (
                                <TouchableOpacity onPress={onSkip} className="mt-4 self-center">
                                    <Text className="text-white/90" style={{ fontSize: wp(3.8) }}>
                                        Skip
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </KeyboardAvoidingView>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
