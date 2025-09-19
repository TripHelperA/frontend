import { View } from "react-native";

export default function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <View className={`rounded-xl shadow-sm elevation-2 overflow-hidden ${className ?? ""}`}>
            {children}
        </View>
    );
}
