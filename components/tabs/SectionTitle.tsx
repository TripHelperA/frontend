import { Text } from "react-native";

export default function SectionTitle({
    children,
    className,
}: { children: React.ReactNode; className?: string }) {
    return (
        <Text className={`mx-3 text-l font-medium uppercase tracking-wide text-neutral-400 ${className ?? ""}`}>
            {children}
        </Text>
    );
}
