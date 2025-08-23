import { Image } from "react-native";

const NUMBER_OF_BACKGROUNDS = 6;

const backgrounds: Record<number, any> = {
    1: require("../assets/backgrounds/background1.jpg"),
    2: require("../assets/backgrounds/background2.jpg"),
    3: require("../assets/backgrounds/background3.jpg"),
    4: require("../assets/backgrounds/background4.jpg"),
    5: require("../assets/backgrounds/background5.jpg"),
    6: require("../assets/backgrounds/background6.jpg"),
};


function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function LoginBackgroundImage() {
    const randomIndex = getRandomInt(1, NUMBER_OF_BACKGROUNDS);
    return (
        <Image
            source={backgrounds[randomIndex]}
            className="h-full w-full absolute"
        />
    );
}

