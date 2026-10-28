import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../commons/theme';

interface ProgressBarProps {
  total: number;
  completed: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ total, completed }) => {
  const percent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tiến độ công việc</Text>
        <Text style={styles.countText}>
          Đã hoàn thành {completed}/{total} công việc
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${percent}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  countText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  track: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
});

export default ProgressBar;