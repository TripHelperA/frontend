import { ExpoRoot } from "expo-router";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';

export default function App() {
    const ctx = require.context("./app");
    return <ExpoRoot context={ctx} />;
}