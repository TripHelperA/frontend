import Card from "@/components/tabs/Card";
import DangerButtonRow from "@/components/tabs/DangerButtonRow";
import Header from "@/components/tabs/Header";
import Feather from "@expo/vector-icons/Feather";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
// If you already have your own Header, you can replace the inline header below with it.

type Option = {
    countryCode: string; // ISO 3166-1 alpha-2 (us, gb, tr, fr...)
    label: string;       // Shown to user
    value: string;       // Stored value (en-US, tr-TR, ...)
};

const OPTIONS: Option[] = [
    { countryCode: "us", label: "English", value: "en-US" },
    { countryCode: "tr", label: "Türkçe", value: "tr-TR" },
];

export default function SelectLanguage() {
    // Optional: accept an initial selection via route params
    const params = useLocalSearchParams<{ selected?: string }>();
    const [selected, setSelected] = useState<string>(params.selected ?? "en-US");
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return OPTIONS;
        return OPTIONS.filter(o => o.label.toLowerCase().includes(q));
    }, [query]);

    const ChangeLanguage = (val: string) => {
        // TODO: change language in backend.
        router.back();
    };

    const renderItem = ({ item }: { item: Option }) => {
        const isSelected = item.value === selected;
        const flagUrl = `https://flagcdn.com/w40/${item.countryCode.toLowerCase()}.png`;

        return (
            <TouchableOpacity
                onPress={() => setSelected(item.value)}
                className="flex-row items-center bg-white px-4 py-3 border-b border-neutral-200"
            >
                <Image source={{ uri: flagUrl }} className="rounded-sm mr-3" resizeMode="cover"
                    style={{
                        height: hp("3.2%"),
                        width: wp("8.5%"),
                    }} />
                <Text className="flex-1 text-base text-black" style={{ fontSize: wp("4.5%") }}>{item.label}</Text>

                <View className="items-center justify-center" style={{ width: wp("10%"), height: hp("4%") }}>
                    {isSelected ? (
                        <Feather name="check-circle"
                            size={hp("3%")}
                            color="#2563eb" />
                    ) : (
                        <View className="rounded-full border border-neutral-300" style={{
                            height: hp("2.5%"),
                            width: hp("2.5%"),
                        }} />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <Header title="Select Language" onPressLeft={() => { router.replace("/tabs/Settings") }} />

            <View className="px-4 pt-3 pb-2">

                <View className="mt-3 flex-row items-center rounded-xl bg-white px-3 py-2 shadow-sm">
                    <Feather name="search" size={hp("3%")} color="#6b7280" />
                    <TextInput
                        className="ml-2 flex-1 text-lg text-neutral-900" style={{
                            fontSize: wp("4%"),
                        }}
                        placeholder="Search"
                        value={query}
                        onChangeText={setQuery}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery("")} className="ml-2 rounded-full bg-neutral-200 p-1">
                            <Feather name="x" size={hp("3%")} color="#404040" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.value}
                renderItem={renderItem}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ backgroundColor: "white" }}
            />

            <View className="py-3">
                <Card>
                    <DangerButtonRow label="Change Language" onPress={() => { ChangeLanguage }} />
                </Card>
            </View>
        </SafeAreaView>
    );
}
