import { Text } from "react-native";

export default function FooterText({ children, className }: { children: React.ReactNode; className?: string }) {
    return <Text className={`mt-6 text-center text-s font-medium text-neutral-400 ${className ?? ""}`}>{children}</Text>;
}
