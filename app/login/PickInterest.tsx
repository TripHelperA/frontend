import Header from "@/components/tabs/Header";
import { fetchUserAttributes, updateUserAttributes } from "aws-amplify/auth";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";

const attributes = [
    "algo_romantic",
    "algo_adventurous",
    "algo_relaxation",
    "algo_cultural",
    "algo_gastronomic",
    "algo_nature",
    "algo_entertaining",
    "algo_modern",
];

type Interest = { id: string; label: string; emoji: string, attribute: string };

const ALL_INTERESTS: Interest[] = [
    { id: "beach", label: "Beach", emoji: "🏖️", attribute: attributes[0] },
    { id: "mountains", label: "Mountains", emoji: "⛰️", attribute: attributes[1] },
    { id: "city_trips", label: "City Trips", emoji: "🏙️", attribute: attributes[2] },
    { id: "road_trips", label: "Road Trips", emoji: "🚗", attribute: attributes[3] },
    { id: "camping", label: "Camping", emoji: "🏕️", attribute: attributes[4] },
    { id: "hiking", label: "Hiking", emoji: "🥾", attribute: attributes[5] },
    { id: "cruises", label: "Cruises", emoji: "🛳️", attribute: attributes[6] },
    { id: "cultural", label: "Cultural Tours", emoji: "🏛️", attribute: attributes[7] },
    { id: "safari", label: "Safari", emoji: "🦁", attribute: attributes[0] },
    { id: "skiing", label: "Skiing", emoji: "🎿", attribute: attributes[1] },
    { id: "islands", label: "Island Hopping", emoji: "🏝️", attribute: attributes[2] },
    { id: "food", label: "Food Trips", emoji: "🍜", attribute: attributes[3] },
    { id: "adventure", label: "Adventure", emoji: "🪂", attribute: attributes[4] },
    { id: "wellness", label: "Wellness Retreats", emoji: "🧘", attribute: attributes[5] },
    { id: "festivals", label: "Festivals", emoji: "🎉", attribute: attributes[6] },
    { id: "wildlife", label: "Wildlife", emoji: "🐘", attribute: attributes[7] },
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
    const clamp = (n: number, min = 1, max = 10) => Math.max(min, Math.min(max, n));

    const onContinue = async () => {
        // count how many times each attribute should be incremented
        const incBy: Record<string, number> = {};
        ALL_INTERESTS.forEach(i => {
            if (selected.has(i.id)) {
                incBy[i.attribute] = (incBy[i.attribute] ?? 0) + 1;
            }
        });

        if (Object.keys(incBy).length === 0) {
            // nothing selected; optionally return early
            return;
        }

        // fetch current user attributes
        const current = await fetchUserAttributes();

        // build update payload with clamped values (min=1, max=10)
        const updates: Record<string, string> = {};
        for (const [attr, add] of Object.entries(incBy)) {
            const key = `custom:${attr}`;

            // If the attribute is missing, treat baseline as 1 (your min), then add.
            // If you prefer "missing means 0", change baseline to 0.
            const baseline = current[key] !== undefined ? parseInt(current[key]!, 10) : 1;

            const nextVal = clamp(baseline + add, 1, 10);
            updates[key] = String(nextVal);
        }

        await updateUserAttributes({ userAttributes: updates });
        router.replace("/tabs/Home");
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
                                        {item.emoji} {item.label}
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
