import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../commons/theme';
import { Task, Priority } from '../commons/types';
import { isTaskOverdue } from '../utils/dateHelper';

interface TaskCardProps {
  task: Task;
  onToggleDone: () => void;
  onPress: () => void;
  onLongPress: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleDone, onPress, onLongPress }) => {
  const overdue = isTaskOverdue(task);

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'Cao':
        return COLORS.priorityHigh;
      case 'Trung bình':
        return COLORS.priorityMedium;
      case 'Thấp':
      default:
        return COLORS.priorityLow;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        task.done && styles.cardDone,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Checkbox tự vẽ bằng Pressable, dùng icon check */}
      <Pressable
        onPress={onToggleDone}
        hitSlop={10}
        style={[styles.checkbox, task.done && styles.checkboxDone]}
      >
        {task.done && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[styles.title, task.done && styles.titleDone]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{task.category}</Text>
          </View>

          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.dueDateText}>{task.dueDate}</Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(task.priority) },
            ]}
          >
            <Text style={styles.priorityText}>{task.priority}</Text>
          </View>

          {overdue && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>Quá hạn</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardDone: {
    opacity: 0.6,
    backgroundColor: '#F1F5F9',
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: COLORS.categoryTag,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: SIZES.xs,
    color: COLORS.categoryText,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: SIZES.xs,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  overdueBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overdueText: {
    fontSize: SIZES.xs,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default TaskCard;