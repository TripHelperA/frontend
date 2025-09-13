import { Amplify } from "aws-amplify";
import { Stack } from "expo-router";
import "react-native-get-random-values";

import amplifyOutputs from "../amplify_outputs.json";
import "../global.css";

Amplify.configure(amplifyOutputs);

export default function RootLayout() {
    return <Stack initialRouteName="login" screenOptions={{ headerShown: false }} />;
}
