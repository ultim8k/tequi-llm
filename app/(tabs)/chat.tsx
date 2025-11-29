import { Cactus } from "@/components/cactus-chat";
import { StyleSheet, View } from "react-native";

export default function ChatScreen() {
    return (
        <View style={styles.container}>
            <Cactus />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});