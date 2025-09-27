// app/onboarding/PickInterests.tsx
import Header from "@/components/tabs/Header";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

type Interest = { id: string; label: string; emoji: string };

const ALL_INTERESTS: Interest[] = [
    { id: "beach", label: "Beach", emoji: "🏖️" },
    { id: "mountains", label: "Mountains", emoji: "⛰️" },
    { id: "city_trips", label: "City Trips", emoji: "🏙️" },
    { id: "road_trips", label: "Road Trips", emoji: "🚗" },
    { id: "camping", label: "Camping", emoji: "🏕️" },
    { id: "hiking", label: "Hiking", emoji: "🥾" },
    { id: "cruises", label: "Cruises", emoji: "🛳️" },
    { id: "cultural", label: "Cultural Tours", emoji: "🏛️" },
    { id: "safari", label: "Safari", emoji: "🦁" },
    { id: "skiing", label: "Skiing", emoji: "🎿" },
    { id: "islands", label: "Island Hopping", emoji: "🏝️" },
    { id: "food", label: "Food Trips", emoji: "🍜" },
    { id: "adventure", label: "Adventure", emoji: "🪂" },
    { id: "wellness", label: "Wellness Retreats", emoji: "🧘" },
    { id: "festivals", label: "Festivals", emoji: "🎉" },
    { id: "wildlife", label: "Wildlife", emoji: "🐘" },
];


const MIN_REQUIRED = 3;

export default function PickInterests() {
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const toggle = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const canContinue = selected.size >= MIN_REQUIRED;
    const remaining = useMemo(() => Math.max(0, MIN_REQUIRED - selected.size), [selected.size]);

    const onContinue = () => {
        const chosen = ALL_INTERESTS.filter(i => selected.has(i.id));
        // TODO: persist to backend / AsyncStorage if needed
        console.log("Selected interests:", chosen);
        router.push("/login/Login"); // or next onboarding step
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <View className="flex-1 pl-3 pr-3 ">
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="pt-3 pb-3 rounded-full">
                        <Header title="Pick Your Interests" />
                    </View>

                    <Text className="pt-5  text-black font-semibold text-xl">
                        Select at least {MIN_REQUIRED} topics you're interested in
                    </Text>

                    {/* Chips */}
                    <View className="mt-4 flex-row flex-wrap">
                        {ALL_INTERESTS.map((item) => {
                            const isSelected = selected.has(item.id);
                            return (
                                <Pressable
                                    key={item.id}
                                    onPress={() => toggle(item.id)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isSelected }}
                                    className={[
                                        "mr-2 mb-2 rounded-full px-4 py-2 border",
                                        isSelected ? "bg-red-600 border-red-600" : "bg-white border-neutral-300",
                                    ].join(" ")}
                                >
                                    <Text
                                        className={[
                                            "text-lg",
                                            isSelected ? "text-white font-bold" : "text-neutral-800",
                                        ].join(" ")}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Helper line */}
                    <View className="mt-2">
                        {!canContinue ? (
                            <Text className="text-red-600 font-bold text-xl">
                                {remaining} more to go…
                            </Text>
                        ) : (
                            <Text className="text-green-700 text-xl font-bold">Great! You can continue.</Text>
                        )}
                    </View>
                </ScrollView>

                {/* Sticky footer button */}
                <View className="absolute left-0 right-0 bottom-0 p-4 bg-neutral-50 border-t border-neutral-200">
                    <Pressable
                        disabled={!canContinue}
                        onPress={onContinue}
                        className={[
                            "rounded-xl py-3 items-center",
                            canContinue ? "bg-red-600" : "bg-red-600/50",
                        ].join(" ")}
                    >
                        <Text className="text-white text-lg font-semibold">Continue</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
