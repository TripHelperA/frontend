import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    LayoutAnimation,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type TripInputPanelProps = {
    initialTripDetails: { from: string; to: string };
    onSearch: (data: { from: string; to: string; stops: string }) => void;
    onAiSearch: (query: string) => void;
};

const TripInputPanel: React.FC<TripInputPanelProps> = ({
    initialTripDetails,
    onSearch,
    onAiSearch,
}) => {
    // All state, including collapse and view state, is  managed here
    const [fromLocation, setFromLocation] = useState({
        description: initialTripDetails.from,
    });
    const [toLocation, setToLocation] = useState({
        description: initialTripDetails.to,
    });
    const [stopCount, setStopCount] = useState("1");
    const [aiSearchQuery, setAiSearchQuery] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeView, setActiveView] = useState<"planner" | "ai">("planner");

    const handleSwapLocations = () => {
        const temp = fromLocation;
        setFromLocation(toLocation);
        setToLocation(temp);
    };

    const toggleCollapse = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsCollapsed(!isCollapsed);
    };

    const isPlannerFormValid =
        fromLocation?.description?.trim() !== "" &&
        toLocation?.description?.trim() !== "" &&
        stopCount.trim() !== "";
    const isAiFormValid = aiSearchQuery.trim() !== "";

    const isButtonDisabled =
        activeView === "planner" ? !isPlannerFormValid : !isAiFormValid;
    const buttonText =
        activeView === "planner" ? "Search Journeys" : "Get AI Suggestion";

    const buttonAction = () => {
        if (activeView === "planner") {
            onSearch({
                from: fromLocation.description,
                to: toLocation.description,
                stops: stopCount,
            });
        } else {
            onAiSearch(aiSearchQuery);
        }
    };

    const buttonColor = activeView === "planner" ? "#DC2626" : "#2563EB";
    const buttonDisabledColor = activeView === "planner" ? "#F87171" : "#93C5FD";

    const PlannerView = (
        <View>
            <View style={styles.locationRow}>
                <View style={{ flex: 1 }}>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Starting point"
                            placeholderTextColor="#9CA3AF"
                            value={fromLocation.description}
                            onChangeText={(text) => setFromLocation({ description: text })}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleSwapLocations}
                    style={styles.swapButton}
                >
                    <Ionicons name="swap-horizontal" size={24} color="#2563EB" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Destination"
                            placeholderTextColor="#9CA3AF"
                            value={toLocation.description}
                            onChangeText={(text) => setToLocation({ description: text })}
                        />
                    </View>
                </View>
            </View>
            <View style={[styles.inputContainer, { marginTop: 16 }]}>
                <Text style={styles.label}>Stop Count</Text>
                <TextInput
                    style={styles.input}
                    value={stopCount}
                    onChangeText={setStopCount}
                    keyboardType="numeric"
                    placeholder="0"
                />
            </View>
        </View>
    );

    const AiView = (
        <View>
            <TextInput
                style={styles.textArea}
                multiline
                placeholder="e.g., 'A scenic route from Taksim to Sultanahmet...'"
                placeholderTextColor="#9CA3AF"
                value={aiSearchQuery}
                onChangeText={setAiSearchQuery}
            />
        </View>
    );

    return (
        <View style={styles.panel}>
            <View style={styles.header}>
                {isCollapsed ? (
                    <>
                        <Text style={styles.headerTitle}>TRIP PLANNER</Text>
                        <View style={styles.collapsedRouteTextContainer}>
                            <Text style={styles.routeText} numberOfLines={1}>
                                {fromLocation.description}
                            </Text>
                            <Text style={styles.arrowText}> → </Text>
                            <Text style={styles.routeText} numberOfLines={1}>
                                {toLocation.description}
                            </Text>
                        </View>
                    </>
                ) : (
                    <>
                        {activeView === "ai" ? (
                            <TouchableOpacity
                                onPress={() => setActiveView("planner")}
                                style={styles.navButton}
                            >
                                <Ionicons name="chevron-back" size={24} color="#4B5563" />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.navButton} />
                        )}
                        <Text style={styles.headerTitle}>
                            {activeView === "planner" ? "Trip Planner" : "AI Search"}
                        </Text>
                        {activeView === "planner" ? (
                            <TouchableOpacity
                                onPress={() => setActiveView("ai")}
                                style={styles.navButton}
                            >
                                <Ionicons name="chevron-forward" size={24} color="#4B5563" />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.navButton} />
                        )}
                    </>
                )}
            </View>

            {!isCollapsed && (
                <View style={styles.collapsibleContent}>
                    <View style={{ minHeight: 180 }}>
                        {activeView === "planner" ? PlannerView : AiView}
                    </View>
                    <TouchableOpacity
                        onPress={buttonAction}
                        disabled={isButtonDisabled}
                        style={[
                            styles.actionButton,
                            {
                                backgroundColor: isButtonDisabled
                                    ? buttonDisabledColor
                                    : buttonColor,
                            },
                        ]}
                    >
                        <Text style={styles.actionButtonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.collapseToggleContainer}>
                <TouchableOpacity
                    onPress={toggleCollapse}
                    style={styles.collapseButton}
                >
                    <Ionicons
                        name={isCollapsed ? "chevron-down" : "chevron-up"}
                        size={24}
                        color="#9CA3AF"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    panel: {
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
    navButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    collapsibleContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        overflow: "hidden",
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
    },
    swapButton: { padding: 8 },
    inputContainer: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        padding: 12,
    },
    label: { fontSize: 12, color: "#6B7280" },
    input: {
        fontSize: 16,
        fontWeight: "500",
        color: "#111827",
        paddingVertical: 4,
    },
    textArea: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        padding: 12,
        height: 150,
        textAlignVertical: "top",
        fontSize: 16,
        marginTop: 16,
    },
    textInputContainer: { height: "auto" },
    textInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: "500",
        color: "#111827",
        height: 48,
    },
    actionButton: {
        paddingVertical: 14,
        marginTop: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    actionButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
    collapseToggleContainer: {
        alignItems: "center",
        backgroundColor: "white",
        paddingTop: 4,
        paddingBottom: 8,
    },
    collapseButton: { padding: 4 },
    collapsedRouteTextContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginLeft: 16,
    },
    routeText: { fontWeight: "600", color: "#374151", flexShrink: 1 },
    arrowText: { color: "#9CA3AF", marginHorizontal: 4 },
});

export default TripInputPanel;