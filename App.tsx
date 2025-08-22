import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "./global.css";

export default function App() {
    return (
        <>
            <Slot />
            <StatusBar style="auto" />
        </>
    );
}
