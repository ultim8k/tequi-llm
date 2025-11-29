import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SimpleScrollView({ children, scrollRef }: { children: React.ReactNode, scrollRef: React.RefObject<Animated.ScrollView> }) {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    gap: 16,
  },
});
