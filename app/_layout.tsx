import { Amplify } from "aws-amplify";
import { Stack } from "expo-router";
import "react-native-get-random-values";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import amplifyOutputs from "../amplify_outputs.json";
import "../global.css";

Amplify.configure(amplifyOutputs);

export default function RootLayout() {
    return (
        <GluestackUIProvider>
            <Stack initialRouteName="login" screenOptions={{ headerShown: false }} />
        </GluestackUIProvider>
    )


}
