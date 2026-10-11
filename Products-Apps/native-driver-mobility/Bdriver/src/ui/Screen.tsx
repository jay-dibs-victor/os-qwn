import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
}>;

export function Screen({ children, style, noPadding }: Props) {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, noPadding ? styles.noPadding : null, style]}
    >
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 20,
  },
  noPadding: {
    padding: 0,
  },
  content: {
    flex: 1,
  },
});
