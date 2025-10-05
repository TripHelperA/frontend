import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CustomCalloutProps {
    id: string;
    title?: string;
    description?: string;
}

const CustomCallout: React.FC<CustomCalloutProps> = ({ id, title, description }) => {
    return (
        <View style={styles.calloutContainer}>
            <Text style={styles.calloutId}>{id}</Text>
            {title && <Text style={styles.calloutTitle}>{title}</Text>}
            {description && <Text style={styles.calloutDescription}>{description}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    calloutContainer: {
        width: 150,
        padding: 10,
        backgroundColor: "white",
        borderRadius: 10,
    },
    calloutId: { fontSize: 14 },
    calloutTitle: { fontWeight: "bold", fontSize: 16 },
    calloutDescription: { fontSize: 14 },
});

export default CustomCallout;