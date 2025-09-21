import Feather from "@expo/vector-icons/Feather";
import { Text, TouchableOpacity, View } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

type Props = {
    title: string;
    onPressLeft?: () => void;
    onPressRight?: () => void;
    LeftIcon?: keyof typeof Feather.glyphMap;
    RightIcon?: keyof typeof Feather.glyphMap;
    className?: string;
};

export default function Header({
    title,
    onPressLeft,
    onPressRight,
    LeftIcon = "arrow-left",
    RightIcon = "more-vertical",
    className,
}: Props) {
    return (
        <View className={`w-full flex-row items-center justify-between px-4 ${className ?? ""}`}>
            {/* Left button (only shows if onPressLeft is provided) */}
            {onPressLeft ? (
                <TouchableOpacity onPress={onPressLeft} className="p-2">
                    <Feather name={LeftIcon} size={24} color="#0a0a0a" />
                </TouchableOpacity>
            ) : (
                <View style={{ width: wp("5%") }} /> // keeps title centered
            )}

            <Text numberOfLines={1} className="flex-1 text-center text-2xl font-semibold text-neutral-900">
                {title}
            </Text>

            {/* Right button (only shows if onPressRight is provided) */}
            {onPressRight ? (
                <TouchableOpacity onPress={onPressRight} className="p-2">
                    <Feather name={RightIcon} size={24} color="#0a0a0a" />
                </TouchableOpacity>
            ) : (
                <View style={{ width: wp("5%") }} /> // keeps title centered
            )}
        </View>
    );
}
