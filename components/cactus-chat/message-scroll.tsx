import { ScrollView, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        minHeight: 500
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 10,
        minHeight: 200
    }
});

export const MessageScroll = ({ children }: { children: React.ReactNode }) => {
    return <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {children}
    </ScrollView>;
};

