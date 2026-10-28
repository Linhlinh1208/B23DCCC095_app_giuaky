import React, { ReactNode } from 'react';
import { StyleSheet, SafeAreaView, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../commons/theme';

interface SafeScreenLayoutProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const SafeScreenLayout: React.FC<SafeScreenLayoutProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default SafeScreenLayout;