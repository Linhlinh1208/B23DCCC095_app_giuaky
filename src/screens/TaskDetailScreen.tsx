import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { RouteProp, NavigationProp, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../commons/theme';
import { Task, RootStackParamList } from '../commons/types';
import { isTaskOverdue, getDueDateStatusText } from '../utils/dateHelper';
import { getStoredTasks, setStoredTasks } from '../services/storageService';

interface TaskDetailScreenProps {
  navigation: NavigationProp<RootStackParamList, 'TaskDetail'>;
  route: RouteProp<RootStackParamList, 'TaskDetail'>;
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);

  const fetchTask = async () => {
    const tasks = await getStoredTasks();
    const item = tasks.find((t) => t.id === taskId);
    if (item) setTask(item);
  };

  useFocusEffect(
    useCallback(() => {
      fetchTask();
    }, [taskId])
  );

  const toggleDoneStatus = async () => {
    if (!task) return;
    const tasks = await getStoredTasks();
    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, done: !t.done } : t
    );
    await setStoredTasks(updated);
    setTask({ ...task, done: !task.done });
  };

  if (!task) {
    return (
      <View style={styles.centerContainer}>
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const isOverdue = isTaskOverdue(task);
  const remainingText = getDueDateStatusText(task.dueDate);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{task.title}</Text>
          {isOverdue && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>Quá hạn</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Trạng thái:</Text>
          <Text
            style={[
              styles.value,
              { color: task.done ? COLORS.success : COLORS.textSecondary },
            ]}
          >
            {task.done ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Danh mục:</Text>
          <Text style={styles.value}>{task.category}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Mức ưu tiên:</Text>
          <Text style={[styles.value, { fontWeight: '700' }]}>{task.priority}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Hạn hoàn thành:</Text>
          <Text style={styles.value}>{task.dueDate}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Thời hạn:</Text>
          <Text
            style={[
              styles.value,
              isOverdue && { color: COLORS.error, fontWeight: '700' },
            ]}
          >
            {remainingText}
          </Text>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.label}>Ghi chú:</Text>
          <Text style={styles.noteContent}>
            {task.note ? task.note : 'Không có ghi chú.'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            task.done ? styles.btnUndone : styles.btnDone,
            pressed && styles.pressed,
          ]}
          onPress={toggleDoneStatus}
        >
          <Ionicons
            name={task.done ? 'close-circle-outline' : 'checkmark-circle-outline'}
            size={20}
            color="#FFFFFF"
            style={styles.btnIcon}
          />
          <Text style={styles.btnText}>
            {task.done ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.btnEdit,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('TaskForm', { taskId: task.id })}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.primary} style={styles.btnIcon} />
          <Text style={styles.btnEditText}>Sửa công việc</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  overdueBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  overdueText: {
    color: '#FFF',
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  noteBox: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  noteContent: {
    marginTop: 4,
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIcon: {
    marginRight: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  btnDone: {
    backgroundColor: COLORS.success,
  },
  btnUndone: {
    backgroundColor: COLORS.textSecondary,
  },
  btnEdit: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  btnText: {
    color: '#FFF',
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  btnEditText: {
    color: COLORS.primary,
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});

export default TaskDetailScreen;